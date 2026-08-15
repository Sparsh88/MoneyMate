import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { Category, getDefaultCategories } from '../models/Category';

export const ADMIN_EMAIL = 'sparshchauhan050@gmail.com';
export const ADMIN_PASS = 'Sp@080806';

export const ensureAdminAccount = async (): Promise<void> => {
  try {
    const cleanEmail = ADMIN_EMAIL.toLowerCase().trim();
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(ADMIN_PASS, salt);

    // 1. Ensure the designated admin exists and has proper credentials/role
    let adminUser = await User.findOne({ email: cleanEmail });

    if (adminUser) {
      adminUser.role = 'admin';
      adminUser.isVerified = true;
      adminUser.status = 'active';
      adminUser.passwordHash = passwordHash;
      await adminUser.save();
      console.log(`[Admin] Admin account (${cleanEmail}) verified and updated.`);
    } else {
      adminUser = await User.create({
        name: 'Sparsh Chauhan',
        email: cleanEmail,
        passwordHash,
        role: 'admin',
        isVerified: true,
        status: 'active',
      });

      // Seed default categories for admin
      const defaultCategories = getDefaultCategories().map((cat) => ({
        ...cat,
        user: adminUser!._id,
      }));
      await Category.insertMany(defaultCategories).catch(() => {});
      console.log(`[Admin] Admin account (${cleanEmail}) created successfully.`);
    }

    // 2. Demote any other accounts that might have been granted admin role
    const demoteResult = await User.updateMany(
      { email: { $ne: cleanEmail }, role: 'admin' },
      { $set: { role: 'user' } }
    );

    if (demoteResult.modifiedCount > 0) {
      console.log(`[Admin] Demoted ${demoteResult.modifiedCount} unauthorized admin accounts to user role.`);
    }
  } catch (error) {
    console.error('[Admin] Error ensuring admin account:', error);
  }
};
