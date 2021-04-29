const router=require('express').Router();
const File=require('app');
router.get('/:id', (req, res)=>{
    const file = await File.findOne({id:req.params.id});
    if(!file){
        return res.render('download', {error: 'LINK EXPIRED'});
    }
    const filePath=`${__dirname}/${file.path}`;
    res.download(filePath);
});
module.exports=router;