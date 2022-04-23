const express = require('express');
const router = express.Router();
const Book = require('../models').Book;

/* Handler function to wrap each route. */
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      // Forward error to the global error handler
      next(error);
    }
  }
}

/* GET home route - redirects to the /books route. */
router.get('/', (req, res) => {
  res.redirect('/books');
});

/* GET /books - shows full list of books */
router.get('/books', asyncHandler(async (req, res) => {
  const books = await Book.findAll();
  res.render('index', { books });
}));

/* GET /books/new - shows the create new book form */
router.get('/books/new', asyncHandler(async (req, res) => {
  res.render('new-book', { book: {} });
}));

/* POST /books/new - posts a new book to the database */
router.post('/books/new', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.create(req.body);
    res.redirect('/books');
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      res.render('new-book', { book, errors: error.errors });
    } else {
      throw error;
    }
  }
}));

/* GET /books/:id - shows book detail form */
router.get('/books/:id', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    res.render('update-book', { book });
  } else {
    res.status(404).render('book-not-found');
  }
}));

/* POST /books/:id - Updates book info in the database */
router.post('/books/:id', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    if (book) {
      await book.update(req.body);
      res.redirect('/books');
    } else {
      res.status(404).render('book-not-found');
    }
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      book.id = req.params.id; // make sure the correct book gets updated
      res.render('update-book', { book, errors: error.errors });
    } else {
      throw error;
    }
  }
}));

/* POST /books/:id/delete - Deletes a book */
router.post('/books/:id/delete', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id); 
  if (book) {
    await book.destroy();
    res.redirect('/books');
  } else {
    res.status(404).render('book-not-found');
  }
}));



module.exports = router;
