const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
const router = require('express').Router()
const app = express();
var fs = require("fs");
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
var path = require('path');  
const PORT = process.env.PORT || 5000;
const mongoURI = 'mongodb+srv://rohini:iamthereonmlab@cluster1.kco5d.mongodb.net/fileshare?retryWrites=true&w=majority';
const conn = mongoose.createConnection(mongoURI, { useNewUrlParser: true,  useUnifiedTopology: true});
let gfs;
conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('file');
});
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'file'
        };        
        resolve(fileInfo);
      });
    });
  }
});
var store = multer.diskStorage({  
  destination:function(req,file,cb){  
       cb(null,'./uploads')  
  },  
  filename(req,file,cb){  
      cb(null,file.originalname)  
  }  
});
var fileSchema =  new mongoose.Schema({path:String})
const upload = multer({ storage:storage });
var fileModel =  mongoose.model('files',fileSchema);
app.get('/', (req, res) => {
  gfs.files.find().toArray((err, files) => {
    if (!files || files.length === 0) {
      res.render('index', { files: false });
    } else {
      files.map(file => {
        if (
          file.contentType === 'image/jpeg' ||
          file.contentType === 'image/png'
        ) {
          file.isImage = true;
        } else {
          file.isImage = false;
        }
      });
      res.render('index', { files: files });
    }
  });
});

app.get('/files', (req, res) => {
  gfs.files.find().toArray((err, files) => {
    if (!files || files.length === 0) {
      return res.status(404).json({
        err: 'No files exist'
      });
    }
    return res.json(files);
  });
});

app.get('/files/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }
    return res.json(file);
  });
});
app.get('/image/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }
    if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({
        err: 'Not an image'
      });
    }
  });
});
app.get('/files/share/:id', (req, res) => {
  try{
      gfs.files.find().toArray((err, files) => {
        if (!files || files.length === 0) {
          res.render('download', { files: false });
        } else {
          res.render('download', { files: files,
                                    id: req.params.id
           });
        }
      });

/*     
    const dfile = gfs.files.findOne({ filename: req.params.filename });
    console.log(req.params.id);
    if(!dfile){
      return res.render('download', {error:'Cant execute anymore'});
    }
    if(dfile){
      return res.render('download', {
        files: files,
        id: req.params.id,
        downloadLink: `http://localhost:5000/share/files/download/${req.params.id}`,
      }); 
    }  */
  }catch(err){
    return res.render('download', {error:'ERROR'});
  }
});
app.delete('/files/:id', (req, res) => {
  gfs.remove({ _id: req.params.id, root: 'uploads' }, (err, gridStore) => {
    if (err) {
      return res.status(404).json({ err: err });
    }
    res.redirect('/');
  });
});
app.get('/files/copy/:id', (req, res) => {
  let a = "http://localhost:5000/share/files/download/${req.params.id}";
  ncp.copy(a, function () {
    console.log('Link Copied');
  })
  return res.redirect('/');
});
app.get('/files/share/download/:id',(req,res)=>{  
  fileModel.find({id:req.params.id},(err,file)=>{  
      if(err){  
          console.log(err)  
      }   
      else{  
         var path= __dirname+'/public/'+files[0].filePath;  
         res.download(path);  
      }  
  })  
});  
const port = 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));