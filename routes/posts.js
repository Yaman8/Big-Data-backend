
//IORO*PMSmIcoY2R1QVZn
const router=require('express').Router()
const elasticsearch=require('elasticsearch')

const mongoose=require('mongoose')
const mongoosastic=require('mongoosastic')


const PostSchema=new mongoose.Schema({
    postId:{
        type:Number,
        required:true,
        unique: true
    },
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
        es_indexed:true
    },
    date:{
        type:String,
        default:Date.now,
    },
})

PostSchema.plugin(mongoosastic,{
	host:"localhost",
	port:"9200",
	protocol:"https",
	auth: "elastic:IORO*PMSmIcoY2R1QVZn"
})
const Post=mongoose.model("Post",PostSchema,)

Post.createMapping((err, mapping)=>{  
  if(err){
    console.log('error creating mapping (you can safely ignore this)');
    console.log(err);
  }else{
    console.log('mapping created!');
    console.log(mapping);
  }
});

router.post('/',async(req,res)=>{
   const post=new Post({
   	postId:req.body.postId,
    	title:req.body.title,
    	description:req.body.description
   })
     try{
         const savedPost=await post.save()
         res.json(savedPost)
         savedPost.on('es-indexed', (err,res) =>{
         	if(!err){
         		console.log('Indexed')
         	}
         })
     }catch(e){
         res.json({message:e})
     }
})
 router.get('/search/:postId',async (req,res)=>{
//	Post.search({ query: { match: { title: req.body.title } } }, (err, results) => {
//  if (err) {
//    console.log(err);
//  } else {
//    console.log(`Found ${results.hits.total} matching document(s)`);
//    console.log(results.hits.hits);
//  }
//});
	const result = await Post.search( {query_string:{ query:req.params.postId }},(err,results)=>{
	if(err){
		console.log('Error searching',err)
	}
	else{
		res.send(results.hits.hits)	
	}	
})
//     try{
//         const posts=await Post.findOne({postId:req.params.postId})
//         res.json(posts)
//     }catch(e){
//         res.json({message:e})
//     }
 })

 router.get('/',async (req,res)=>{
     try{
         const posts=await Post.find()
         res.json(posts)
     }catch(e){
         res.json({message:e})
     }
 })


// router.patch('/:postId',async(req,res)=>{
//     try{
//         const updatedPost=await Post.updateOne(
//             {postId:req.params.postId},
//             {
//                 $set:{
//                     title:req.body.title,
//                     description:req.body.description,
//                 },
//             }
//         )
//         res.json(updatedPost)
//     }catch(e){
//         res.json({message:e})
//     }
// })

// router.delete('/:postId',async(req,res)=>{
//     try{
//         const removePost=await Post.remove({postId:req.params.postId})
//         res.json(removePost)
//     }catch(e){
//         res.json({message:e})
//     }
// })

module.exports=router
