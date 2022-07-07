const bookModel = require("../model/bookModel")
const userModel = require("../model/userModel")

// require moment karake and then use
//  releasedAt: { type: moment(new Date()).format("YYYY-MM-DD"), required: true, default: null },

//  if (!moment(releasedAt, "YYYY-MM-DD", true).isValid()) 
//        return res.status(400).send({ 
//          status: false, 
//          message: "Enter a valid date with the format (YYYY-MM-DD).", 
//        });

// releasedAt:moment(releasedAt).toISOString()



// ========================[Validations]==================================
const isValid = function (value) {
    if( typeof value ==='undefined' || value === null ) {
        console.log("1")
          return false
        }

    if( typeof value == 'string' && value.trim().length == 0 ) {
      console.log("2")
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
        if (Object.keys(req.query).length == 0) {
          return res
          .status(400)
          .send({ status: false, msg: "bookId is Mandatory." });
        }
         
        if(!Books)
         return res.status(400).send({status :false , msg : "Enter BookId."})
        // if (!valid.reg(Books)) return res.status(400).send({status: false, msg: "Use Alphabets only."})
    
        
        let result = await bookModel
          .findById({ _id: Books })
          .select({ title: 1, excerpt: 1, userId: 1, category: 1, subcategory: 1, isDeleted: 1, reviews: 1, releasedAt: 1, createdAt:1, updatedAt:1});
        
        if(!result){
          return res.status(404).send({status : false, msg : "Book does Not Exist"})
        }
    
        let BookId = result._id.toString();
        
    
        const allRevies = await reviewModel.find({
            bookId: BookId,
            isDeleted: false,
          });
    
        if(allRevies.length == 0){
          return res.status(404).send({status:false, msg: "No reviews exist."})
        }
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
    
        // let name = result.name;
        // let fullName = result.fullName;
        // let logoLink = result.logoLink;
        
        // let internDetails = {
        //   name: name,
        //   fullName: fullName,
        //   logoLink: logoLink,
        //   interns: interns,
        // };
    
        return res.status(200).send({ status: true, Data: responData });
      } catch (err) {
        res.status(500).send({ status: false, msg: err.message });
      }
    }
    module.exports.getAllBooksById = getAllBooksById;


    // const allRevies = await reviewModel.find({
    //     bookId: book,
    //     isDeleted: false,
    //   });
    //   responData = {
    //     _id: updateBookReview._id,
    //     title: updateBookReview.title,
    //     excerpt: updateBookReview.excerpt,
    //     userId: updateBookReview.userId,
    //     category: updateBookReview.category,
    //     subcategory: updateBookReview.subcategory,
    //     isDeleted: updateBookReview.isDeleted,
    //     reviews: updateBookReview.reviews,
    //     releasedAt: updateBookReview.releasedAt,
    //     createdAt: updateBookReview.createdAt,
    //     updatedAt: updateBookReview.updatedAt,
    //     reviewsData: allRevies,
    //   };
