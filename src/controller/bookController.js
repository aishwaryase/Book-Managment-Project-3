const bookModel = require("../model/bookModel")
const userModel = require("../model/userModel")
const reviewModel = require("../model/reviewModel")
const mongoose = require('mongoose')


// ========================[Validations]==================================
const isValid = function (value) {
    if( typeof value ==='undefined' || value === null ) {
        // console.log("1")
          return false
        }

    if( typeof value == 'string' && value.trim().length == 0 ) {
      // console.log("2")
        return false
    }

    if ( typeof value == 'string' && value.length !== value.trim().length ) {
      console.log("4")
        return false
    }
    if ( typeof value == 'number' ) {
      console.log("5")
        return false
    }
    return true
  }
  const isValidDate = (releasedAt) =>{
    var regEx = /^\d{4}-\d{2}-\d{2}$/;
  return regEx.test(releasedAt)
  }
  

// ========================[CreateBooks]==================================

const createBooks = async function (req, res) {
    try {
        let data = req.body
        
        const { title, excerpt, userId, ISBN, category, subcategory,  releasedAt } = data;

        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, msg: "Body should  be not Empty.. " })
        }
        
        if(!isValid(title)){ 
            return res
               .status(400)
               .send({ status: false, msg: "Plzz Use only Alphabets." });
          }

        if(!isValid(title)){ 
            return res
               .status(400)
               .send({ status: false, msg: "Title field is mandatory" });
          }

        let duplicateTitle = await bookModel.findOne({ title: title });
         if (duplicateTitle) {
            return res.status(400).send({ status: false, msg: "This Title is Already Exist." });
        }

        if(!isValid(excerpt)){ 
            return res
               .status(400)
               .send({ status: false, msg: "Excerpt field is mandatory" });
          }
        if(!isValid(userId)){ 
            return res
               .status(400)
               .send({ status: false, msg: "userId field is mandatory" });
          }
        if(!isValid(ISBN)){ 
            return res
               .status(400)
               .send({ status: false, msg: "ISBN field is mandatory" });
          }
        let duplicateISBN = await bookModel.findOne({ ISBN: ISBN });
          if (duplicateISBN) {
             return res.status(400).send({ status: false, msg: "This ISBN is Already Exist." });
         }

        if(!isValid(category)){ 
            return res
               .status(400)
               .send({ status: false, msg: "category field is mandatory" });
          }
        if(!isValid(subcategory)){ 
            return res
               .status(400)
               .send({ status: false, msg: "subcategory field is mandatory" });
          }
        if(!isValid(releasedAt)){ 
            return res
               .status(400)
               .send({ status: false, msg: "releasedAt field is mandatory" });
          }
        if (!isValidDate(releasedAt)) {
            return res.status(400).send({ status: false, msg: "Date is not valid" })
        }

        let UserId = data.userId
        
        let FindId = await userModel.findById(UserId)

        if (!FindId) return res.status(400).send({ status: false, msg: 'UserId does not exist' })

        let bookCreated = await bookModel.create(data)
        res.status(201).send({ status: true, message: 'Success', data: bookCreated })
    
    }
    catch (err) {
        res.status(500).send({ msg: "Error", error: err.message })
    }
}
module.exports.createBooks = createBooks;
 

// ========================[Get All Books]==================================
  
const getAllBooks = async function (req, res) {
        try {
            let field = req.query;
            const { userId, category, subcategory} = field
            
            if (Object.keys(field).length == 0)
             return res.status(400).send({ status: false, msg: 'Query param should  be not Empty..' })

             if(userId == 0)
            return res.status(400).send({ status: false, msg: 'UserId should  be present..' })

            if(category == 0)
            return res.status(400).send({ status: false, msg: 'category should  be present..' })

            if(subcategory == 0)
            return res.status(400).send({ status: false, msg: 'subcategory should  be present..' })

            let filter = {
                ...field,
                isDeleted: false
            };
            
            const Getbooks = await bookModel.find(filter)
            .select({ title: 1, excerpt: 1, userId: 1, category: 1, reviews:1, releasedAt:1 });

            if (Getbooks.length == 0) 
            return res.status(404).send({ status: false, msg: "No Book is found" });

            Getbooks.sort(function(a, b) {
                const nameA = a.category; 
                const nameB = b.category; 
                if (nameA < nameB) {
                  return -1;
                }
                if (nameA > nameB) {
                  return 1;
                }
                return 0;
              });
              
            res.status(200).send({ status: true, message: 'Books list', data: Getbooks})

        }
         catch (err) {
            res.status(500).send({ status: false, msg: err.message });
        }
    };
    module.exports.getAllBooks = getAllBooks;


const getAllBooksById = async function (req, res) {
    try {
        let Books = req.params.bookId;

        if(!mongoose.Types.ObjectId.isValid(Books)){
           return res.status(400).send({status:false, message :"BookId is not valid"})
        }
        
        let result = await bookModel.findOne({ _id: Books, isDeleted:false });
        if(!result){
          return res.status(404).send({status : false, msg : "Book does Not Exist"})
        }
    
        let BookId = result._id.toString();
        
        const allRevies = await reviewModel
        .find({bookId: BookId})
        .select({_id:1, bookId:1, reviewedBy:1, reviewedAt:1, rating:1, review:1})

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
    
        return res.status(200).send({ status: true, Data: responData });
      } catch (err) {
        res.status(500).send({ status: false, msg: err.message });
      }
    }
    module.exports.getAllBooksById = getAllBooksById;


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
                message: "Update request rejected no get from body",
              });
            }
            const{title,excerpt,releasedAt,ISBN}=requestBody
            
            if (title !== undefined) {
              if (!isValidType(title)) {
                return res.status(400).send({
                  status: false,
                  message: "type must be string and required some data inside string",
                });
              }
              const existTitle=await bookModel.findOne({title:title})
              if(existTitle){
                return res.status(400).send({
                  status: false,
                  message: "use different title",
                });
              }
              filteredData["title"] = title.trim();
            }
      
            if (ISBN !== undefined) {
              if (!isValidType(ISBN)) {
                return res.status(400).send({
                  status: false,
                  message: "type must be string and required some data inside string",
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
              if (!isValidType(excerpt)) {
                return res.status(400).send({
                  status: false,
                  message: "type must be string and required some data inside string",
                });
              }
              filteredData["excerpt"] = excerpt.trim();
            }
      
            if (releasedAt !== undefined) {
              if (!isValidType(releasedAt)) {
                return res.status(400).send({
                  status: false,
                  message: "type must be string and required some data inside string",
                });
              }
              // function yearValid(data) {
              //   
              //   return regEx.t
              // }
              var regEx = /^\d{4}-\d{2}-\d{2}$/;
      
              if(!(regEx.test(releasedAt))){
                return res.status(400).send({
                  status: false,
                  message: "Date is not vailid example 'YYYY-MM-DD'",
                });
              }
              filteredData["releasedAt"] = releasedAt.trim();
            }
      
            const updateBook=await bookModel.findByIdAndUpdate({_id:existBook._id},{$set:filteredData},{new:true})
            const allRevies = await reviewModel.find({
              bookId:existBook._id ,
              isDeleted: false,
            });
            const responData = {
              _id: updateBook._id,
              title: updateBook.title,
              excerpt: updateBook.excerpt,
              userId: updateBook.userId,
              category: updateBook.category,
              subcategory: updateBook.subcategory,
              isDeleted: updateBook.isDeleted,
              reviews: updateBook.reviews,
              releasedAt: updateBook.releasedAt,
              createdAt: updateBook.createdAt,
              updatedAt: updateBook.updatedAt,
              reviewsData: allRevies,
            };
            return res.status(200).send({status: true,
              message: 'Success',
              data:{updateBook ,responData}})
      
        }catch(err){
            return res.status(500).send({ status:false, message: err.message })
        }
      }
      module.exports.updateBookDataById=updateBookDataById

    const deleteBookBYId = async function (req, res) {

        try { 
          let bookId = req.params.bookId
          const queryParams = req.query
          const requestBody = req.body
      
          if (isValidRequestBody(queryParams)) {
            return res.status(400).send({ status: false, message: "Data is not required in quary params" })
          }
      
          if (isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Data is not required in request body" })
          }
      
          if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: "Invalid BookId" });
          }
      
          let checkBook = await bookModel.findOne({ _id: bookId, isDeleted: false })
      
          if (!checkBook) {
            return res.status(404).send({ status: false, message: 'book not found or already deleted' })
          }
      
          let updateBook = await bookModel.findOneAndUpdate({ _id: bookId }, { isDeleted: true, deletedAt:new Date() }, { new: true })
      
          res.status(200).send({ status: true, message: 'sucessfully deleted', data: updateBook })
      
        } catch (error) {
          res.status(500).send({ status: false, error: error.message });
        }
      }

      module.exports.deleteBookBYId = deleteBookBYId;
    