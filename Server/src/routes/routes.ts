import {Router} from 'express'
import {uploadPdf,generatePdf} from '../controllers/controller'
import multer from 'multer'
import path from 'path'

const storage = multer.diskStorage({
    destination:function(req,file,cb) {
        cb(null,'uploads')
    },
    filename:function(req,file,cb) {
        cb(null,Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
      const allowedMimeTypes = ['application/pdf'];
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true); 
      }
    }
  });
  

const router: Router = Router()

router.post('/uploadpdf',upload.single('file'),uploadPdf)
router.post('/generatepdf',generatePdf)


export default router