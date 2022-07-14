const bookModel = require("../model/bookModel")
const userModel = require("../model/userModel")
const reviewModel = require("../model/reviewModel")
const mongoose = require('mongoose')
// const awsS3 = require("../aws-s3")

// ================================[Create Books ]=======================================

//CreateBooks
const createBooks = async function (req, res) {
  try {
      let data = req.body

      const { title, excerpt, userId, ISBN, category, subcategory,  releasedAt } = data; //destructure

      //check if the body is empty
      if (Object.keys(data).length === 0) {
          return res.status(400).send({ status: false, message: "Body should  be not Empty please enter some data to create book" })
      }

      //check the title is empty
      if(!title ||typeof title !=='string' || title.trim().length==0 )
      {
          return res.status(400).send({ status: false, message: "title is required and is of string type" })
      }
      data.title = title.trim().split(" ").filter(word=>word).join(" ")

      //check the title be unique
      let duplicateTitle = await bookModel.findOne({ title: title });
       if (duplicateTitle) {
          return res.status(400).send({ status: false, message: "This Title is Already Exist" });
      }
     //check the excerpt is empty
      if(!excerpt ||typeof excerpt !=='string' || excerpt.trim().length==0 ){ 
          return res.status(400).send({ status: false, message: "Excerpt field is mandatory" });
        }
        data.excerpt = excerpt.trim().split(" ").filter(word=>word).join(" ")
      //check the userId is empty
      if(!userId ||typeof userId !=='string' || userId.trim().length==0){ 
          return res.status(400).send({ status: false, message: "userId field is mandatory" });
        }
      //check the ISBN is empty
      if(!ISBN ||typeof ISBN !=='string' || ISBN.trim().length==0){ 
          return res.status(400).send({ status: false, message: "ISBN field is mandatory" });
        }
      //check the uniqness of ISBN
      let duplicateISBN = await bookModel.findOne({ ISBN: ISBN });
        if (duplicateISBN) {
           return res.status(400).send({ status: false, message: "This ISBN is Already Exist." });
       }

       //check the ISBN validation
      if(!/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/.test(ISBN)){
      return res.status(400).send({status: false,message: "ISBN is not valid it contains only numeric digits and its length shout be 10 or 13",
        });
      }

      //check the category is empty
      if(!category ||typeof category !=='string' || category.trim().length==0){ 
        return res.status(400).send({ status: false, message: "category field is mandatory" });
        }
        data.category= category.trim().split(" ").filter(word=>word).join(" ")

        //check the subcategory is present
        if (!subcategory) {
          return res.status(400).send({ status: false, message: "subcategory is required" })
        }
    
        //check the subcategory is an array
        if (!Array.isArray(subcategory)) {
          return res.status(400).send({ status: false, message: "Subcategory must be an array of String" })
        }
        if(subcategory.length === 0){
          return res.status(400).send({ status: false, message: "can not be an empty array " })
        }
        let validSubcategory = true;
    
        const checkTypeofSubcategory = subcategory.map(x => {
          if (typeof x != "string" || x.trim().length == 0) {
            validSubcategory = false
          }
        })
        if (validSubcategory == false) {
          return res.status(400).send({ status: false, message: "Subcategory is not valid" })
        }
    
        //check the releasedAt is present
      if(!releasedAt ||typeof releasedAt !=='string' || releasedAt.trim().length==0){ 
          return res.status(400).send({ status: false, message: "releasedAt field is mandatory" });
        }

        //check the format of releasedAt
        if(!/^\d{4}-\d{2}-\d{2}$/.test(releasedAt)){
          return res.status(400).send({ status: false, message: "Date is not valid" })
      }

      let UserId = data.userId

      let FindId = await userModel.findById(UserId)

      if (!FindId) return res.status(400).send({ status: false, message: 'UserId does not exist' })

      
      //create book with data
      const bookCreated = await bookModel.create(data)

      //releasedAt formatting
      // const releasedAt1= new Date(data.releasedAt).toISOString().slice(0,10)

      let obj = {
        _id: bookCreated._id,
        title: bookCreated.title,
        excerpt: bookCreated. excerpt,
        usedId:bookCreated.userId,
        category: bookCreated.category,
        subcategory: bookCreated.subcategory,
        isDeleted: bookCreated.isDeleted,
        reviews: bookCreated.reviews,
        deletedAt: bookCreated.deletedAt,
        releasedAt:releasedAt,
        createdAt:bookCreated.createdAt,
        updatedAt:bookCreated.updatedAt
      }
    
      return res.status(201).send({ status: true, message: 'Successs', data: obj })

  }
  catch (err) {
    return  res.status(500).send({ message: "Error", error: err.message })
  }
}

// ================================[Get Books by Filter]=======================================

//Get All Books
const getAllBooks = async function (req, res) {
  try {
    let field = req.query;
    const { userId, category, subcategory } = field //destructure

    //check userId
      
      //check the userId is valid
      if (userId !== undefined) {
        if (userId.length===0){
          return res.status(400).send({ status: false, message: "UserId should  be present" })
          }
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          return res.status(400).send({ status: false, message: "UserId is not valid" })
        }
      }
  
      //check the category value is present
    
    if (category !== undefined) {
      if (category.length===0){
        return res.status(400).send({ status: false, message: "category should  be present" })
        }
    }

      //check the subcategory value is present
   
    if (subcategory !== undefined) {
      if (subcategory.length===0){
        return res.status(400).send({ status: false, message: "subcategory should  be present" })
        }
    }

    let filter = {
      ...field,
      isDeleted: false
    };
   
    // get these field from bookModel book _id, title, excerpt, userId, category, releasedAt, reviews 
    const Getbooks = await bookModel.find(filter)
      .select({ title: 1, excerpt: 1, userId: 1, category: 1, reviews: 1, releasedAt: 1 });

    if (Getbooks.length == 0)
      return res.status(404).send({ status: false, message: "No Book is found" });

      //sort alphabetically
    Getbooks.sort(function (a, b) {
      const nameA = a.title;
      const nameB = b.title;
      if (nameA < nameB) { return -1; }
      if (nameA > nameB) { return 1; }
      return 0;
    });

    return res.status(200).send({ status: true, message: 'Books list', data: Getbooks })

  }
  catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

// ================================[Get Books by Id]=======================================

//get all books by Id
const getAllBooksById = async function (req, res) {
  try {
    let Books = req.params.bookId;

    //check bookId is valid
    if (!mongoose.Types.ObjectId.isValid(Books)) {
      return res.status(400).send({ status: false, message: "BookId is not valid" })
    }

    let result = await bookModel.findOne({ _id: Books, isDeleted: false });
    
    if (!result) {
      return res.status(404).send({ status: false, message: "Book does Not Exist" })
    }

    let BookId = result._id.toString();

    const allRevies = await reviewModel.find({ bookId: BookId }).select({ _id: 1, bookId: 1, reviewedBy: 1, reviewedAt: 1, rating: 1, review: 1 })

    responData = {
      _id: result._id,
      title: result.title,
      excerpt: result.excerpt,
      userId: result.userId,
      category: result.category,
      subcategory: result.subcategory,
      isDeleted: result.isDeleted,
      reviews: result.reviews,
      releasedAt: result.releasedAt,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      reviewsData: allRevies,
    };

    return res.status(200).send({ status: true, message: 'Books list', data: responData });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
}

// ================================[Update Books by Id]=======================================
//update book by id

const updateBookDataById=async function (req,res) {
  try{
      const paramsBookId = req.params.bookId;
      const filteredData = {};

      if (!mongoose.Types.ObjectId.isValid(paramsBookId)) {
      res.status(400).send({
          status: false,
          message: "Book Id is not valid",
      });
      }

      const existBook=await bookModel.findOne({_id:paramsBookId,isDeleted:false})
      if(!existBook){
        return res.status(404).send({
          status: false,
          message: "No book found with given Id",
        });
      } 
      const requestBody=req.body

      if(Object.keys(requestBody).length===0){
        return res.status(400).send({
          status: false,
          message: "Update request rejected no data found in body",
        });
      }
      const{title,excerpt,releasedAt,ISBN}=requestBody
      
      if (title !== undefined) {
        if (typeof title!=='string'||title.trim().length===0) {
          return res.status(400).send({
            status: false,
            message: "title type must be string and required some data inside string",
          });
        }
        const existTitle=await bookModel.findOne({title:title})
        if(existTitle){
          return res.status(400).send({
            status: false,
            message: "use different title",
          });
        }
        filteredData["title"] = title.trim().split(' ').filter(a=>a).join(' ');
      }

      if (ISBN !== undefined) {
        if (typeof ISBN!=='string'||ISBN.trim().length===0) {
          return res.status(400).send({
            status: false,
            message: "ISBN type must be string and required some data inside string",
          });
        }
          const regiexISBN=/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/
          if(!regiexISBN.test(ISBN)){
            return res.status(400).send({
              status: false,
              message: "ISBN is not valid its length shout be 10 or 13",
            });
          }

        const existISBN=await bookModel.findOne({ISBN:ISBN})
        if(existISBN){
          return res.status(400).send({
            status: false,
            message: "use different ISBN",
          });
        }
        filteredData["ISBN"] = ISBN.trim();
      }


      if (excerpt !== undefined) {
        if (typeof excerpt!=='string'||excerpt.trim().length===0) {
          return res.status(400).send({
            status: false,
            message: "excerpt type must be string and required some data inside string",
          });
        }
        filteredData["excerpt"] = excerpt.trim().split(' ').filter(a=>a).join(' ');
      }

      if (releasedAt !== undefined) {
        if (typeof releasedAt!=='string'||releasedAt.trim().length===0) {
          return res.status(400).send({
            status: false,
            message: "releasedAt type must be string and required some data inside string",
          });
        }
        
        var regEx = /^\d{4}-\d{2}-\d{2}$/;

        if(!(regEx.test(releasedAt))){
          return res.status(400).send({
            status: false,
            message: "Date is not vailid example 'YYYY-MM-DD'",
          });
        }
        filteredData["releasedAt"] = releasedAt.trim();
      }

      const updateBook=await bookModel.findByIdAndUpdate({_id:existBook._id},{$set:filteredData},{new:true}).lean()
      const allRevies = await reviewModel.find({
        bookId:existBook._id ,
        isDeleted: false,
      });
      updateBook.reviewsData=allRevies
   

      return res.status(200).send({status: true,
        message: 'Success',
        data:updateBook})

  }catch(err){
      return res.status(500).send({ status:false, message: err.message })
  }
}

// ================================[Delete Books by Id]=======================================

//delete book by Id
const deleteBookBYId = async function (req, res) {

  try { 
    let bookId = req.params.bookId

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).send({ status: false, message: "Invalid BookId" });
    }

    let checkBook = await bookModel.findOne({ _id: bookId, isDeleted: false })

    if (!checkBook) {
      return res.status(404).send({ status: false, message: 'book not found or already deleted' })
    }

    let updateBook = await bookModel.findOneAndUpdate({ _id: bookId }, { isDeleted: true, deletedAt:new Date() }, { new: true })

    res.status(200).send({ status: true, message: 'sucessfully deleted' })

  } catch (error) {
    res.status(500).send({ status: false, error: error.message });
  }
}

module.exports.createBooks = createBooks;
module.exports.getAllBooks = getAllBooks;
module.exports.getAllBooksById = getAllBooksById;
module.exports.updateBookDataById=updateBookDataById
module.exports.deleteBookBYId = deleteBookBYId;
