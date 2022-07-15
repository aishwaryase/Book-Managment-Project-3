const express = require('express')
const router = express.Router()
const bookController = require("../controller/bookController")  
const userController = require("../controller/userController")
const reviewController=require('../controller/reviewController')
const middleware = require("../middleware/mid1")


//==========================={ User Api's }=========================================//
router.post("/write-file-aws", bookController.awsFileUpload)

//create user
router.post("/register", userController.createUser)

//login user
router.post("/login", userController.loginUser)

//==========================={ Book Api's }==========================================//

//create book
router.post("/books",middleware.authentication,middleware.authorization1, bookController.createBooks)

//get book
router.get("/books",middleware.authentication, bookController.getAllBooks)

//get book by Id
router.get("/books/:bookId",middleware.authentication, bookController.getAllBooksById)

// update book by id
router.put("/books/:bookId",middleware.authentication,middleware.authorization2, bookController.updateBookDataById)

//deleted book by Id
router.delete("/books/:bookId",middleware.authentication,middleware.authorization2, bookController.deleteBookBYId)

//=================================={ Review Api's }=====================================

//create review
router.post("/books/:bookId/review", reviewController.createReview) 

//update review
router.put('/books/:bookId/review/:reviewId', reviewController.updateReview) 

//delete review
router.delete('/books/:bookId/review/:reviewId', reviewController.deleteReview)


module.exports = router  
