import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import multer from 'multer'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const medicineStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'medicore/medicines',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }],
  },
})

const prescriptionStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'medicore/prescriptions',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
  },
})

export const uploadMedicineImage = multer({ storage: medicineStorage })
export const uploadPrescription = multer({ storage: prescriptionStorage })

export default cloudinary
