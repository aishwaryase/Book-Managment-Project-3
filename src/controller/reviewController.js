const reviewModel = require("../model/reviewModel");
const bookModel = require("../model/bookModel");
const mongoose = require("mongoose");

function isValidObject(obj) {
  return mongoose.Types.ObjectId.isValid(obj);
}

function isValidBody(reqbody) {
  return Object.keys(reqbody).length> 0;
}

const isValid = function (value) {
  if (typeof value === "undefined" || value === null) {
    return false;
  }
  return true;
};

const isValidType = function (value) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return false;
  }
  return true;
};

const createReview = async (req, res) => {
  try {
    const filteredData = {};
    const book = req.params.bookId;
    if (!isValidObject(book)) {
      res.status(400).send({
        status: false,
        message: "Book Id is not valid",
      });
    }
    const existBook = await bookModel.findOne({ _id: book, isDeleted: false });
    if (!existBook) {
      return res.status(404).send({
        status: false,
        message: "No data found",
      });
    }
    filteredData["bookId"] = existBook._id.toString();
    requestBody = req.body;
    if (!isValidBody(requestBody)) {
      return res.status(400).send({
        status: false,
        message: "required some mandatory data",
      });
    }
    const { reviewedBy, rating, review, isDeleted } = requestBody;

    if (reviewedBy !== undefined) {
      if (!isValidType(reviewedBy)) {
        return res.status(400).send({
          status: false,
          message: "type must be string and required some data inside string",
        });
      }
      filteredData["reviewedBy"] = reviewedBy.trim();
    }

    if (isDeleted !== undefined) {
      if (typeof isDeleted !== "boolean") {
        return res.status(400).send({
          status: false,
          message: "isDeleted type must be boolean",
        });
      }
      filteredData["isDeleted"] = isDeleted;
    }

    if (!isValid(rating) || typeof rating !== "number") {
      return res.status(400).send({
        status: false,
        message: "rating is required and type must be Number",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).send({
        status: false,
        message: "rating should be between 1 to 5",
      });
    }
    filteredData["rating"] = rating;

    if (review !== undefined) {
      if (
        !isValidType(review) ||
        review.trim().length === 0 ||
        review == null
      ) {
        return res.status(400).send({
          status: false,
          message: "type must be string and required some data inside string",
        });
      }
      filteredData["review"] = review.trim();
    }

    filteredData["reviewedAt"] = Date();

    const createdreviews = await reviewModel.create(filteredData);

    if (createdreviews) {
      const updateBookReview = await bookModel.findOneAndUpdate(
        { _id: createdreviews.bookId, isDeleted: false },
        { $inc: { reviews: 1 } },
        { new: true }
      );
      const allRevies = await reviewModel.find({
        bookId: book,
        isDeleted: false,
      }).select({_id:1, bookId:1, reviewedBy:1, reviewedAt:1, rating:1, review:1});
      
      responData = {
        reviews: updateBookReview.reviews,
        reviewsData: allRevies,
      };
      return res.status(200).send({
        status: true,
        message: "Success",
        data: responData,
      });
    }
  } catch (error) {
    res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

const updateReview = async (req, res) => {
  try {
    const filteredData = {};

    const book = req.params.bookId;
    if (!isValidObject(book)) {
      res.status(400).send({
        status: false,
        message: "Book Id is not valid",
      });
    }
    const existBook = await bookModel.findOne({ _id: book, isDeleted: false });
    if (!existBook) {
      return res.status(404).send({
        status: false,
        message: "No data found",
      });
    }

    const paramreview = req.params.reviewId;
    if (!isValidObject(paramreview)) {
      res.status(400).send({
        status: false,
        message: "Book Id is not valid",
      });
    }
    const existReview = await reviewModel.findOne({
      _id: paramreview,
      isDeleted: false,
    });
    if (!existReview) {
      return res.status(404).send({
        status: false,
        message: "No data found",
      });
    }
    requestBody = req.body;
    if (!isValidBody(requestBody)) {
      return res.status(400).send({
        status: false,
        message: "required some mandatory data",
      });
    }

    const { review, rating, reviewedBy } = requestBody;
    // console.log(review.length===0)

    if (reviewedBy !== undefined) {
      if (!isValidType(reviewedBy)) {
        return res.status(400).send({
          status: false,
          message: "type must be string and required some data inside string",
        });
      }
      filteredData["reviewedBy"] = reviewedBy.trim();
    }

    if (rating !== undefined) {
      if (!isValid(rating) || typeof rating !== "number") {
        return res.status(400).send({
          status: false,
          message: "rating is required and type must be Number",
        });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).send({
          status: false,
          message: "rating should be between 1 to 5",
        });
      }
      filteredData["rating"] = rating;
    }

    if (review !== undefined) {
      if (!isValidType(review)) {
        return res.status(400).send({
          status: false,
          message: "type must be string and required some data inside string",
        });
      }

      filteredData["review"] = review.trim();
    }

    const updateReview = await reviewModel.findByIdAndUpdate(
      { _id: paramreview },
      { $set: filteredData },
      { new: true }
    );
    if (updateReview) {
      const existRe = await reviewModel.find({
          bookId: book,
          isDeleted: false,
        }),
        responData = {
          _id: existBook._id,
          title: existBook.title,
          excerpt: existBook.excerpt,
          userId: existBook.userId,
          category: existBook.category,
          subcategory: existBook.subcategory,
          isDeleted: existBook.isDeleted,
          reviews: existBook.reviews,
          releasedAt: existBook.releasedAt,
          createdAt: existBook.createdAt,
          updatedAt: existBook.updatedAt,
          reviewsData: existRe,
        };
      return res.status(200).send({
        status: true,
        message: "Success",
        data: responData,
      });
    }
  } catch (err) {
    res.status(500).send({
      status: false,
      message: err.message,
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const book = req.params.bookId;
    if (!isValidObject(book)) {
      res.status(400).send({
        status: false,
        message: "Book Id is not valid",
      });
    }
    const existBook = await bookModel.findOne({ _id: book, isDeleted: false });
    if (!existBook) {
      return res.status(404).send({
        status: false,
        message: "No data found",
      });
    }

    const paramreview = req.params.reviewId;
    if (!isValidObject(paramreview)) {
      res.status(400).send({
        status: false,
        message: "Book Id is not valid",
      });
    }
    const existReview = await reviewModel.findOne({
      _id: paramreview,
      isDeleted: false,
    });
    if (!existReview) {
      return res.status(404).send({
        status: false,
        message: "No data found",
      });
    }

    const delReview = await reviewModel.findByIdAndUpdate(
      { _id: existReview._id },
      { $set: { isDeleted: false } }
    );
    if (delReview) {
      const updateBookReview = await bookModel.findOneAndUpdate(
        { _id: delReview.bookId, isDeleted: false },
        { $inc: { reviews: -1 } },
        { new: true }
      );
      return res.status(200).send({ data: updateBookReview });
    }
  } catch (err) {
    return res.status(500).send({
      status: false,
      message: err.message,
    });
  }
};

module.exports.createReview = createReview;
module.exports.updateReview = updateReview;
module.exports.deleteReview = deleteReview;
