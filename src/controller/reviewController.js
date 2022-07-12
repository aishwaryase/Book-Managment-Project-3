const reviewModel = require("../model/reviewModel");
const bookModel = require("../model/bookModel");
const mongoose = require("mongoose");

//vaidation functions
function isValidObject(obj) {
  return mongoose.Types.ObjectId.isValid(obj);
}

function isValidBody(reqbody) {
  return Object.keys(reqbody).length> 0;
}

const isValid = function (value) {
  if (typeof value === "undefined" || value === null) {
    return false;
  }
  return true;
};

const isValidType = function (value) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return false;
  }
  return true;
};

//create review
const createReview = async function(req, res)  {
  try {
    const filteredData = {};
    const book = req.params.bookId;
    
    if (!isValidObject(book)) {
      return res.status(400).send({status: false,message: "Book Id is not valid"});
    }

    const existBook = await bookModel.findOne({ _id: book, isDeleted: false });
   
    if (!existBook) {
      return res.status(404).send({status: false,message: "No data found"});
    }

    filteredData["bookId"] = existBook._id.toString();
    requestBody = req.body;
    if (!isValidBody(requestBody)) {
      return res.status(400).send({status: false,message: "required some mandatory data"});
    }
    const { reviewedBy, rating, review, isDeleted } = requestBody;

    if (reviewedBy !== undefined) {
      if (!isValidType(reviewedBy)) {
        return res.status(400).send({status: false,message: "type must be string and required some data inside string"});
      }
      if(!/^([a-zA-Z. , ]){1,100}$/.test(reviewedBy)){
        return res.status(400).send({status: false,message: "reviewedBy should be in alphabets"})}

      filteredData["reviewedBy"] = reviewedBy.trim().split(' ').filter(a=>a).join(' ');
    }

    if (isDeleted !== undefined) {
      if (typeof isDeleted !== "boolean") {
        return res.status(400).send({status: false,message: "isDeleted type must be boolean"});
      }
      filteredData["isDeleted"] = isDeleted;
    }

    if (!isValid(rating) || typeof rating !== "number") {
      return res.status(400).send({status: false,message: "rating is required and type must be Number"});
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).send({status: false,message: "rating should be between 1 to 5"});
    }
    filteredData["rating"] = rating;

    if (review !== undefined) {
      if (!isValidType(review) ||review.trim().length === 0) {
        return res.status(400).send({status: false,message: "type must be string and required some data inside string"});}
      filteredData["review"] = review.trim().split(' ').filter(a=>a).join(' ');
    }

    filteredData["reviewedAt"] = new Date().toISOString().slice(0, 10)  //Date();

    const createdreviews = await reviewModel.create(filteredData);
    const findCreRev=await reviewModel.findById(createdreviews._id).select({_id:1, bookId:1, reviewedBy:1, reviewedAt:1, rating:1, review:1})
   
    if (findCreRev) {
      const updateBookReview = await bookModel.findOneAndUpdate(
        { _id: createdreviews.bookId, isDeleted: false },{ $inc: { reviews: 1 } },{ new: true }).lean();
     
      updateBookReview.responData=findCreRev
      
      return res.status(201).send({status: true,message: "Success",data: updateBookReview});
    }
  } catch (error) {
    return res.status(500).send({status: false,message: error.message});
  }
};


//update review
const updateReview = async function(req, res) {
  try {
    const filteredData = {};

    const book = req.params.bookId;
    if (!isValidObject(book)) {
      return res.status(400).send({status: false,message: "Book Id is not valid"});}

    const existBook = await bookModel.findOne({ _id: book, isDeleted: false }).lean();
    if (!existBook) {
      return res.status(404).send({status: false,message: "No data found"});}

    const paramreview = req.params.reviewId;
    if (!isValidObject(paramreview)) {
     return  res.status(400).send({status: false,message: "review Id is not valid"});}

    const existReview = await reviewModel.findOne({_id: paramreview,bookId:existBook._id,isDeleted: false});
   
    if (!existReview) {
    return res.status(404).send({status: false,message: "No data found"});}

    const requestBody = req.body;
    if (!isValidBody(requestBody)) {
    return res.status(400).send({status: false,message: "required some mandatory data"});}

    const { review, rating, reviewedBy } = requestBody;
    
    if (reviewedBy !== undefined) {
      if (!isValidType(reviewedBy)) {
        return res.status(400).send({status: false,message: "type must be string and required some data inside string"});}

      if(!/^([a-zA-Z. , ]){1,100}$/.test(reviewedBy)){
        return res.status(400).send({status: false,message: "reviewedBy should be in alphabets"})}

      filteredData["reviewedBy"] = reviewedBy.trim().split(' ').filter(a=>a).join(' ');
    }

    if (rating !== undefined) {
      if (!isValid(rating) || typeof rating !== "number") {
        return res.status(400).send({status: false,message: "rating is required and type must be Number"});}

      if (rating < 1 || rating > 5) {
      return res.status(400).send({status: false,message: "rating should be between 1 to 5"});}
      
      filteredData["rating"] = rating;
    }

    if (review !== undefined) {
      if (!isValidType(review)) {
      return res.status(400).send({status: false,message: "type must be string and required some data inside string"});}

      filteredData["review"] = review.trim().split(' ').filter(a=>a).join(' ');
    }

    const updateReview = await reviewModel.findByIdAndUpdate({ _id: paramreview },{ $set: filteredData },{ new: true }).select({_id:1, bookId:1, reviewedBy:1, reviewedAt:1, rating:1, review:1});
   
    if (updateReview) {
      existBook.responData=updateReview
       
      return res.status(200).send({status: true,message: "Success",data: existBook});
    }
  } catch (err) {
    return res.status(500).send({status: false,message: err.message});}
};

//delete review
const deleteReview = async function(req, res) {
  try {
    const book = req.params.bookId;
    
    if (!isValidObject(book)) {
    return   res.status(400).send({status: false,message: "Book Id is not valid"});}

    const existBook = await bookModel.findOne({ _id: book, isDeleted: false });
    
    if (!existBook) {
      return res.status(404).send({status: false,message: "No data found"});}

    const paramreview = req.params.reviewId;
    
    if (!isValidObject(paramreview)) {
    return  res.status(400).send({status: false,message: "review Id is not valid"});}

    const existReview = await reviewModel.findOne({_id: paramreview,bookId:existBook._id,isDeleted: false,});
    
    if (!existReview) {
      return res.status(404).send({status: false,message: "No review found"});}

    const delReview = await reviewModel.findByIdAndUpdate({ _id: existReview._id },{ $set: { isDeleted: true } });
    
    if (delReview) {
      const updateBookReview = await bookModel.findOneAndUpdate(
        { _id: delReview.bookId, isDeleted: false },{ $inc: { reviews: -1 } },{ new: true }
      );

      return res.status(200).send({ status: true,message: "successfully deleted",data: updateBookReview });
    }
  } catch (err) {
    return res.status(500).send({status: false,message: err.message});
  }
};

module.exports.createReview = createReview;
module.exports.updateReview = updateReview;
module.exports.deleteReview = deleteReview;