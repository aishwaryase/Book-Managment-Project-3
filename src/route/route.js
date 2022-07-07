const express = require('express')
const router = express.Router()
const bookController = require("../controller/bookController")  
const userController = require("../controller/userController")
const reviewController=require('../controller/reviewController')
const middleware = require("../middleware/mid1")

router.post("/register", userController.createUser)

router.post("/login", userController.loginUser)

router.post("/books",middleware.authentication,middleware.authorization1, bookController.createBooks)

router.get("/books", bookController.getAllBooks)

router.get("/books/:bookId", bookController.getAllBooksById)

router.delete("/books/:bookId", bookController.deleteBookBYId)

router.put("/books/:bookId",middleware.authentication,middleware.authorization2, bookController.updateBookDataById)

router.post("/books/:bookId/review", reviewController.createReview)

router.put('/books/:bookId/review/:reviewId', reviewController.updateReview)

router.delete('/books/:bookId/review/:reviewId', reviewController.deleteReview)


module.exports = router  
