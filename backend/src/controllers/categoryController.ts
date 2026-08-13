import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Category } from '../models/Category';
import { AppError } from '../middleware/error';

export const getCategories = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    // Fetch system defaults (user: null) AND user's custom categories with projection and lean()
    const categories = await Category.find({
      $or: [{ user: null }, { user: userId }],
    })
      .select('name type icon color user')
      .sort({ name: 1 })
      .lean();

    res.setHeader('Cache-Control', 'private, max-age=60, stale-while-revalidate=300');

    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    next(error);
  }
};


export const createCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { name, type, icon, color } = req.body;

    if (!name || !type || !icon || !color) {
      return next(new AppError('Please provide name, type, icon, and color', 400));
    }

    if (type !== 'income' && type !== 'expense') {
      return next(new AppError('Category type must be income or expense', 400));
    }

    // Check if category already exists for this user (or as system default)
    const exists = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      $or: [{ user: null }, { user: userId }],
    });

    if (exists) {
      return next(new AppError('A category with this name already exists', 400));
    }

    const category = await Category.create({
      user: userId,
      name,
      type,
      icon,
      color,
    });

    res.status(201).json({
      success: true,
      category,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return next(new AppError('Category not found', 404));
    }

    if (!category.user) {
      return next(new AppError('Cannot delete system default categories', 400));
    }

    if (category.user.toString() !== userId) {
      return next(new AppError('Not authorized to delete this category', 401));
    }

    await Category.deleteOne({ _id: id });

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
