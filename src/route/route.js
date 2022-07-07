const express = require('express')
const router = express.Router()  
const userController = require("../controller/userController")
const bookController = require("../controller/bookController")
const mid1 = require("../middleware/mid1")



router.post("/register", userController.createUser)
router.post("/login", userController.loginUser)

router.post("/books", bookController.createBook)
router.put("/books/:bookId",bookController.updateBookDataById)
router.delete("/books/:bookId", bookController.deleteBookBYId)


module.exports = router  