import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { UserModel, IUserAddress, UserRole } from '../models/User';
import { generateToken, requireAuth } from '../middleware/auth';
import { isDbConnected } from '../db';

const router = Router();

// In-memory fallback user store when Atlas is not configured yet
export let inMemoryUsers: any[] = [
  {
    id: 'user-admin',
    name: 'Novara Admin',
    email: 'admin@novara.com',
    passwordHash: bcrypt.hashSync('Admin@123', 10),
    role: 'super_admin' as UserRole,
    phone: '+880 1711 000000',
    addresses: [
      {
        id: 'addr-admin',
        name: 'Novara HQ',
        phone: '+880 1711 000000',
        division: 'Dhaka',
        district: 'Dhaka',
        upazila: 'Gulshan',
        street: 'Road 11, Banani',
        landmark: 'Near Kemal Ataturk Ave',
        isDefault: true,
      },
    ],
    isVerified: true,
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: 'user-customer',
    name: 'Sarah Khan',
    email: 'customer@example.com',
    passwordHash: bcrypt.hashSync('Customer@123', 10),
    role: 'customer' as UserRole,
    phone: '+880 1812 345678',
    addresses: [
      {
        id: 'addr-1',
        name: 'Sarah Khan',
        phone: '+880 1812 345678',
        division: 'Dhaka',
        district: 'Dhaka',
        upazila: 'Dhanmondi',
        street: 'House 42, Road 9/A',
        landmark: 'Opposite Dhanmondi Lake',
        isDefault: true,
      },
    ],
    isVerified: true,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'user-guest-sample',
    name: 'Rafiul Islam',
    email: 'rafiul@example.com',
    passwordHash: bcrypt.hashSync('Rafiul@123', 10),
    role: 'customer' as UserRole,
    phone: '+880 1712 998877',
    addresses: [],
    isVerified: true,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, error: 'Name, email, and password are required' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (isDbConnected()) {
      const existing = await UserModel.findOne({ email: normalizedEmail });
      if (existing) {
        res.status(400).json({ success: false, error: 'An account with this email already exists' });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await UserModel.create({
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        phone: phone?.trim(),
        role: role === 'admin' ? 'admin' : 'customer',
        addresses: [],
        isVerified: true,
      });

      const token = generateToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
      });

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          addresses: user.addresses,
        },
      });
      return;
    }

    // In-memory fallback
    const existing = inMemoryUsers.find((u) => u.email === normalizedEmail);
    if (existing) {
      res.status(400).json({ success: false, error: 'An account with this email already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      phone: phone?.trim() || '',
      role: (role === 'admin' ? 'admin' : 'customer') as UserRole,
      addresses: [],
      isVerified: true,
      createdAt: new Date().toISOString(),
    };
    inMemoryUsers.push(newUser);

    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        addresses: newUser.addresses,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Registration failed' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password are required' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (isDbConnected()) {
      const user = await UserModel.findOne({ email: normalizedEmail });
      if (!user) {
        res.status(401).json({ success: false, error: 'Invalid email or password' });
        return;
      }

      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) {
        res.status(401).json({ success: false, error: 'Invalid email or password' });
        return;
      }

      const token = generateToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
      });

      res.json({
        success: true,
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          addresses: user.addresses,
        },
      });
      return;
    }

    // In-memory fallback
    const user = inMemoryUsers.find((u) => u.email === normalizedEmail);
    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid email or password' });
      return;
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      res.status(401).json({ success: false, error: 'Invalid email or password' });
      return;
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        addresses: user.addresses,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Login failed' });
  }
});

// Me
router.get('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    if (isDbConnected()) {
      const user = await UserModel.findById(userId).select('-passwordHash');
      if (!user) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }
      res.json({
        success: true,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          addresses: user.addresses,
        },
      });
      return;
    }

    const user = inMemoryUsers.find((u) => u.id === userId);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        addresses: user.addresses,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Saved address add/update
router.post('/address', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { name, phone, division, district, upazila, street, landmark, isDefault } = req.body;

    if (!name || !phone || !division || !district || !street) {
      res.status(400).json({ success: false, error: 'Recipient name, phone, division, district, and street are required' });
      return;
    }

    const newAddress: IUserAddress = {
      id: `addr-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      division: division.trim(),
      district: district.trim(),
      upazila: (upazila || '').trim(),
      street: street.trim(),
      landmark: landmark?.trim(),
      isDefault: Boolean(isDefault),
    };

    if (isDbConnected()) {
      const user = await UserModel.findById(userId);
      if (!user) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }

      if (newAddress.isDefault) {
        user.addresses.forEach((a: IUserAddress) => (a.isDefault = false));
      }
      user.addresses.push(newAddress);
      await user.save();

      res.status(201).json({ success: true, addresses: user.addresses, address: newAddress });
      return;
    }

    const user = inMemoryUsers.find((u) => u.id === userId);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    if (newAddress.isDefault) {
      user.addresses.forEach((a: any) => (a.isDefault = false));
    }
    user.addresses.push(newAddress);

    res.status(201).json({ success: true, addresses: user.addresses, address: newAddress });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// OAuth status (Honest reporting: never fake OAuth success)
router.get('/oauth-status', (req: Request, res: Response) => {
  const googleConfigured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  const facebookConfigured = Boolean(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET);

  res.json({
    success: true,
    providers: {
      google: {
        available: googleConfigured,
        message: googleConfigured ? 'Ready' : 'GOOGLE_CLIENT_ID not configured in environment',
      },
      facebook: {
        available: facebookConfigured,
        message: facebookConfigured ? 'Ready' : 'FACEBOOK_APP_ID not configured in environment',
      },
    },
  });
});

export default router;
