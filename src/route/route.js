const express = require('express')
const router = express.Router()
const bookController = require("../controller/bookController")  
const userController = require("../controller/userController")
const reviewController=require('../controller/reviewController')
const middleware = require("../middleware/mid1")

//User Api's
router.post("/register", userController.createUser)//create user
router.post("/login", userController.loginUser)//login user

//Book Api's
router.post("/books",middleware.authentication,middleware.authorization1, bookController.createBooks)//create book
router.get("/books",middleware.authentication, bookController.getAllBooks)//get book
router.get("/books/:bookId",middleware.authentication, bookController.getAllBooksById)//get book by Id
router.put("/books/:bookId",middleware.authentication,middleware.authorization2, bookController.updateBookDataById)// update book by id
router.delete("/books/:bookId",middleware.authentication,middleware.authorization2, bookController.deleteBookBYId)//deleted book by Id

//Review Api's
router.post("/books/:bookId/review", reviewController.createReview) //create review
router.put('/books/:bookId/review/:reviewId', reviewController.updateReview) //update review
router.delete('/books/:bookId/review/:reviewId', reviewController.deleteReview)//delete review


module.exports = router  
