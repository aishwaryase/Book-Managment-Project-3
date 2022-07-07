const express = require('express')
const router = express.Router()
const bookController = require("../controller/bookController")  
const userController = require("../controller/userController")
const reviewController=require('../controller/reviewController')


router.post("/books", bookController.createBooks)

router.get("/books", bookController.getAllBooks)

router.get("/books/:bookId", bookController.getAllBooksById)

router.post("/register", userController.createUser)

router.post("/login", userController.loginUser)

router.post("/books/:bookId/review", reviewController.createReview)

router.put('/books/:bookId/review/:reviewId', reviewController.updateReview)
router.delete('/books/:bookId/review/:reviewId', reviewController.deleteReview)


module.exports = router  
