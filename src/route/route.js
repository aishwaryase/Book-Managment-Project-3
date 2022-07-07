const express = require('express')
const router = express.Router()
const bookController = require("../controller/bookController")  
const userController = require("../controller/userController")
<<<<<<< HEAD
const bookController = require("../controller/bookController")
const mid1 = require("../middleware/mid1")


=======
const reviewController=require('../controller/reviewController')
const middleware = require("../middleware/mid1")
>>>>>>> 4945727d13bf27c9d9b9a4c2653e22383f33cd9d

router.post("/register", userController.createUser)
router.post("/login", userController.loginUser)

<<<<<<< HEAD
router.post("/books", bookController.createBook)
router.put("/books/:bookId",bookController.updateBookDataById)
router.delete("/books/:bookId", bookController.deleteBookBYId)

=======
router.post("/books",middleware.authentication,middleware.authorization1, bookController.createBooks)
>>>>>>> 4945727d13bf27c9d9b9a4c2653e22383f33cd9d

router.get("/books", bookController.getAllBooks)

router.get("/books/:bookId", bookController.getAllBooksById)

router.delete("/books/:bookId", bookController.deleteBookBYId)

router.put("/books/:bookId",middleware.authentication,middleware.authorization2, bookController.updateBookDataById)

router.post("/books/:bookId/review", reviewController.createReview)

router.put('/books/:bookId/review/:reviewId', reviewController.updateReview)

router.delete('/books/:bookId/review/:reviewId', reviewController.deleteReview)


module.exports = router  
