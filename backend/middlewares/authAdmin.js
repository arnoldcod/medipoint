import jwt from 'jsonwebtoken';

const authAdmin = async (req, res, next) => {
  try {
    const { atoken } = req.headers; // Access the token from headers
    if (!atoken) {
      return res.json({ success: false, message: 'Not Authorized , Login Again' });
    }

    // Verify the token
    const token_decode = jwt.verify(atoken, process.env.JWT_SECRET);
    
    // Check if the email matches the expected value (consider adding a 'role' in your token payload)
    if (token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
      return res.status(403).json({ success: false, message: 'Not Authorized To Login Again' });
    }

    // Proceed to the next middleware if verification is successful
    next();

  } catch (error) {
    console.error('Token verification error:', error); // Log the error for debugging
    res.json({ success: false, message: error.message }); 
  }
};

export default authAdmin;
