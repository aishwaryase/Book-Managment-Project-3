const express = require('express')
const router = express.Router()
const bookController = require("../controller/bookController")  
const userController = require("../controller/userController")


router.post("/books", bookController.createBooks)

router.get("/books", bookController.getAllBooks)

router.get("/books/:bookId", bookController.getAllBooksById)

router.post("/register", userController.createUser)

router.post("/login", userController.loginUser)


module.exports = router  
