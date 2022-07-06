const express = require("express");
const bookController = require("../controller/bookController");
const userController = require ("../controller/userController")
const router = express.Router();


//POST API 
router.post("/books",bookController.createBooks);

router.get("/books",bookController.getAllBooks);