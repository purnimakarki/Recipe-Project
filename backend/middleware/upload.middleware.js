import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up storage configuration for Multer
const storage = multer.diskStorage({
  // Define the destination for uploaded files
  destination: (req, file, cb) => {
    // Ensure this directory exists and is writable
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  // Define the naming convention for uploaded files
  filename: (req, file, cb) => {
    // Use a timestamp to avoid file name collisions and maintain uniqueness
    cb(null, Date.now() + path.extname(file.originalname)); // Append the original file extension
  },
});

// Create a Multer instance with the defined storage configuration
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Optional: limit file size to 5MB
  fileFilter: (req, file, cb) => {
    // Add file type validation (e.g., allow images including WebP)
    const filetypes = /jpeg|jpg|png|gif|webp/; // Include webp
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images are allowed (jpeg, jpg, png, gif, webp)'));
    }
  },
});

export default upload;
