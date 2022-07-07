const jwt=require('jsonwebtoken')
const bookModel=require('../model/bookModel')
const userModel=require('../model/userModel')
const mongoose=require('mongoose')
//authentication
const authentication = async function (req,res,next){
    try{
        let token = req.headers["x-api-key"];
        if(!token)token = req.headers["x-Api-key"];

        if(!token) return res.status(400).send({status:false, message:"token must be present in header"});

<<<<<<< HEAD
        try{let decodedToken = jwt.verify(token,"ProjectBookMgmt");
=======
        try{
            let decodedToken = jwt.verify(token,"ProjectBookMgmt");
>>>>>>> 4945727d13bf27c9d9b9a4c2653e22383f33cd9d
        let iat=decodedToken.iat
        let exp=decodedToken.exp
        if(exp<iat){
            return res.status(401).send({status:false, message:"session expired, please Login again"})
        }
<<<<<<< HEAD
        req.decodedToken=decodedToken;}catch(err){
=======
        req.decodedToken=decodedToken;
    }catch(err){
>>>>>>> 4945727d13bf27c9d9b9a4c2653e22383f33cd9d
            return res.status(401).send({status:false,message:"token is invalid"})
        }
        next() 
    }
    catch(err){
        return res.status(500).send({status:false, message:err.message})
    }
}
let authorization1=async function (req,res,next){
    try{
        let userId=req.body.userId
        const decodedToken=req.decodedToken

        if(!userId){
            return res.status(400).send({status:false, message:"userId must present"})
        } 
        else if(mongoose.Types.ObjectId.isValid(userId)==false){
            return res.status(400).send({status:false, message:"userId is invalid"})
        }
        let userById=await userModel.findOne({_id:userId})

        if(!userById){
            return res.status(400).send({status:false, message:"user with this userId not found"})
        }
        else if(decodedToken.userId !=userById._id){
            return res.status(403).send({status:false,message:"you are Unauthorized for this"})
        }
        next();
    }
    catch(err){
        return res.status(500).send({status:false, message:err.message})
    }
}





//authorization
let authorization2=async function (req,res,next){
    try{
        let bookId=req.params.bookId
        const decodedToken=req.decodedToken

        if(!bookId){
            return res.status(400).send({status:false, message:"bookId must present"})
        } 
        else if(mongoose.Types.ObjectId.isValid(bookId)==false){
            return res.status(400).send({status:false, message:"bookId is invalid"})
        }
        let bookById=await bookModel.findOne({_id:bookId,isDeleted:false})

        if(!bookById){
            return res.status(400).send({status:false, message:"book with this bookId not found"})
        }
        else if(decodedToken.userId !=bookById.userId.toString()){
            return res.status(403).send({status:false,message:"you are Unauthorized for this"})
        }
        next();
    }
    catch(err){
        return res.status(500).send({status:false, message:err.message})
    }
}

module.exports.authentication=authentication;
module.exports.authorization1=authorization1;
module.exports.authorization2=authorization2;