import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { env } from '../config/env';

export const bootstrapAdmin = async (): Promise<void> => {
  if (env.INITIAL_SETUP_ENABLED !== 'true') {
    return;
  }

  try {
    // Check if ANY admin account already exists
    const adminExists = await User.exists({ role: 'admin' });
    if (adminExists) {
      console.log('🔒 Administrator account already exists. Skipping bootstrap.');
      return;
    }

    const { BOOTSTRAP_ADMIN_NAME, BOOTSTRAP_ADMIN_EMAIL, BOOTSTRAP_ADMIN_PASSWORD } = env;

    if (!BOOTSTRAP_ADMIN_EMAIL || !BOOTSTRAP_ADMIN_PASSWORD) {
      console.warn('⚠️ Admin bootstrap enabled but email/password missing.');
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(BOOTSTRAP_ADMIN_PASSWORD, salt);

    await User.create({
      name: BOOTSTRAP_ADMIN_NAME || 'Lumora Admin',
      email: BOOTSTRAP_ADMIN_EMAIL.toLowerCase(),
      passwordHash,
      role: 'admin',
      status: 'active',
      phone: '+91 99999 88888',
      addresses: [
        {
          name: 'Lumora HQ',
          phone: '+91 99999 88888',
          street: '100 Feet Road, Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560038',
          country: 'India',
          isDefault: true,
        },
      ],
    });

    console.log(`🛡️ Initial Administrator account created successfully for: ${BOOTSTRAP_ADMIN_EMAIL}`);
  } catch (error) {
    console.error('❌ Failed to bootstrap initial admin account:', error);
  }
};
