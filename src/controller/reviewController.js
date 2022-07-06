const reviewModel=require('../model/reviewModel')
const bookModel=require("../model/bookModel")
const mongoose=require('mongoose')

function isValidObject(obj) {
    return mongoose.Types.ObjectId.isValid(obj)
}

function isValidBody(reqbody){
    return Object.keys(reqbody).length>0
}

const isValid=function(value){
    if(typeof value ==='undefined'||value===null){return false}
    return true
}

const isValidType=function(value){
    if(typeof value!=="string"||value.trim().length===0){ return false}
    return true
}



const createReview=async (req,res)=>{
try {
    const filteredData={}
    bookId=req.params.bookId
    if(!isValidObject(blogId)){
        res.status(400).send({
            status: false,
            message: "Book Id is not valid"
          })
    }
    const existBook=await bookModel.findOne({_id:bookId,isDeleted:false})
    if(!existBook){
        return res.status(404).send({
            status: false,
            message: "No data found"
          })
    }
    filteredData['bookId']=existBook._id.toString()
    requestBody=req.body
    if(!isValidBody(requestBody)){
        return res.status(400).send({
            status: false,
            message: "required some mandatory data"
          })
    }
    const{reviewdBy,rating,review,isDeleted}=requestBody

    
    if(reviewdBy){
        if(!isValidType(reviewdBy)){
            return res.status(400).send({
                status: false,
                message: "type must be string and required some data inside string"
              })
        }
        filteredData['reviewdBy']=reviewdBy.trim()  
    }


    if(isDeleted!==undefined||isDeleted!==null){
        if(typeof isDeleted !=='boolean'){
            return res.status(400).send({
                status: false,
                message: "isDeleted type must be string"
              })
        }
        filteredData['isDeleted']=isDeleted
    }

    if(!isValid(rating)||typeof rating !=='number'){
        return res.status(400).send({
            status: false,
            message: "rating is required and type must be Number"
          })
    }

    if(rating<1||rating>5){
        return res.status(400).send({
            status: false,
            message: "rating should be between 1 to 5"
          })
    }
    filteredData['rating']=rating

    if(review){
        if(!isValidType(review)){
            return res.status(400).send({
                status: false,
                message: "type must be string and required some data inside string"
              })
        }
        filteredData['review']=review.trim()  
    }

    filteredData['reviewedAt']=Date()

    const createdreviews=await reviewModel.create(filteredData)

    if(createdreviews){
        const updateBookReview=await bookModel.findOneAndUpdate({_id:createdreviews.bookId},{$inc:{review:1}},{new:true})
        const allRevies=await reviewModel.find({bookId:bookId,isDeleted:false})
        updateBookReview['reviewsData']=allRevies
        return res.status(200).send({
            status: true,
            message: 'Success',
            data:updateBookReview
          })
    }
} catch (error) {
    res.status(500).send({
        status: false,
        message: error.message
      })
}
}
module.exports.createReview=createReview