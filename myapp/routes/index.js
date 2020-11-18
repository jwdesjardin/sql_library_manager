var express = require('express');
var router = express.Router();
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

//get / - Home route should redirect to the /books route
/* GET home page. */
router.get('/', asyncHandler(async (req, res) => {
  res.redirect('/books');
  // res.render('index', { title: 'Express' });
}));

// get /books - Shows the full list of books
router.get('/books', asyncHandler(async (req, res) => {
  const books = await Book.findAll();
  // res.json(books);
  res.render('index', {books, title: 'SQL Library Manager'});
}));

// get /books/new - Shows the create new book form
router.get('/books/new', asyncHandler(async (req, res) => {
  res.render('new-book', { book: {}, title: "New Book" });
}));

// post /books/new - Posts a new book to the database
router.post('/books/new', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.create(req.body);
    res.redirect("/books/" + book.id);
  } catch (error) {
    if(error.name === "SequelizeValidationError") { // checking the error
      book = await Book.build(req.body);
      res.render("new-book", { book, errors: error.errors , title: "New Book" })
    } else {
      throw error; // error caught in the asyncHandler's catch block
    }  
  }
}));

// get /books/:id - Shows book detail form
router.get('/books/:id', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    res.render("book_detail", { book, title: book.title });  
  } else {
    const error = new Error('Not Found');
    error.status = 404;
    throw error;
  }
}));

// post /books/:id - Updates book info in the database
router.post('/books/:id', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    if(book) {
      await book.update(req.body);
      res.redirect("/books/" + book.id); 
    } else {
      const error = new Error('Not Found');
      error.status = 404;
      throw error;
    }
  } catch (error) {
    if(error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      book.id = req.params.id; // make sure correct book gets updated
      res.render("book_detail", { book, errors: error.errors, title: "Edit Article" })
    } else {
      throw error;
    }
  }
}));

// post /books/:id/delete - Deletes a book. Careful, this can’t be undone. It can be helpful to create a new “test” book to test deleting
router.post('/books/:id/delete', asyncHandler(async (req, res) => {
  // error testing
  // throw new Error('this is a fucking error');
  const book = await Book.findByPk(req.params.id);
  if(book) {
    await book.destroy();
    res.redirect("/books");
  } else {
    const error = new Error('Not Found');
    error.status = 404;
    throw error;
  }
}));


module.exports = router;
