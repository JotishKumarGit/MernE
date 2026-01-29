import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Helper: generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },       
    process.env.JWT_SECRET,                 
    { expiresIn: process.env.JWT_EXPIRE }   
  );
};

//  REGISTER
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  let profilePic;

  try {
    // If multer uploaded a file
    if (req.file) {
      profilePic = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    user = await User.create({
      name,email,password,profilePic, // if not provided, schema default will be used
    });

    const token = generateToken(user);

    res
      .status(201)
      .cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .json({
        success: true,
        message: "User registered successfully 🎉",
        user: {id: user._id,name: user.name,email: user.email,role: user.role,profilePic: user.profilePic,},
        token,
      });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//  LOGIN
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    //  Find user and include password
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    //  Match password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    //  Generate JWT
    const token = generateToken(user);

    res.status(200).cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    }).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//  LOGOUT
export const logoutUser = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// 🔹 POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    //  Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found with this email' });

    //  Generate token & save to DB
    const resetToken = user.getResetPasswordToken();
    await user.save(); // save token and expiry to DB

    //  Create reset URL (frontend will use this token)
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

    // For now: just return the token in response (email can be added later)
    res.status(200).json({
      success: true,
      message: 'Reset password token generated',
      resetUrl
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 PUT /api/auth/reset-password/:token
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    //  Hash the token because stored token in DB is hashed
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    //  Find user with that token and not expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() } // token not expired
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Update password
    user.password = password;

    //  Remove reset fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// profile
export const getProfile = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

// update profile
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, email, password } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password;

    if (req.file) {
      user.profilePic = `/uploads/${req.file.filename}`;
    }

    await user.save();

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
      },
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// toggle wishlist
export const toggleWishlist = async (req, res) => {
  try {
    const productId = req.params.productId;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    const productExists = await Product.findById(productId);
    if (!productExists) return res.status(404).json({ message: 'Product not found' });

    const isWishlisted = user.wishlist.includes(productId);

    if (isWishlisted) {
      user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
      await user.save();
      return res.status(200).json({ message: 'Product removed from wishlist' });
    } else {
      user.wishlist.push(productId);
      await user.save();
      return res.status(200).json({ message: 'Product added to wishlist' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get wishlist
export const getMyWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// remove my wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const productId = req.params.productId;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
    await user.save();

    res.status(200).json({ message: 'Removed from wishlist' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
