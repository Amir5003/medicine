import { v2 as cloudinary } from 'cloudinary'
import multer from 'multer'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * Custom multer storage engine for Cloudinary v2.
 * Streams the upload directly to Cloudinary without writing to disk.
 */
function createCloudinaryStorage({ folder, allowedFormats, transformation }) {
  return {
    _handleFile(_req, file, cb) {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          allowed_formats: allowedFormats,
          ...(transformation ? { transformation } : {}),
        },
        (error, result) => {
          if (error) return cb(error)
          cb(null, {
            fieldname: file.fieldname,
            originalname: file.originalname,
            filename: result.public_id,
            path: result.secure_url,
            size: result.bytes,
            mimetype: file.mimetype,
          })
        }
      )
      file.stream.pipe(uploadStream)
    },
    _removeFile(_req, file, cb) {
      cloudinary.uploader.destroy(file.filename, cb)
    },
  }
}

const medicineStorage = createCloudinaryStorage({
  folder: 'medicore/medicines',
  allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
  transformation: [{ width: 800, height: 800, crop: 'limit' }],
})

const prescriptionStorage = createCloudinaryStorage({
  folder: 'medicore/prescriptions',
  allowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
})

export const uploadMedicineImage = multer({ storage: medicineStorage })
export const uploadPrescription = multer({ storage: prescriptionStorage })

export default cloudinary
