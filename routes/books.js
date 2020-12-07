var express = require('express');
var router = express.Router();
const Book = require('../models').Book;
const { Op } = require('sequelize');

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
router.get('/', asyncHandler(async (req, res) => {
    res.redirect('/books');
  }));

// get /books - Shows the full list of books
router.get('/books', asyncHandler(async (req, res) => {
    const books = await Book.findAll();
    res.render('index', {books, title: 'SQL Library Manager'  });
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
    // checking the error is from sequelize
    if(error.name === "SequelizeValidationError") { 
    book = await Book.build(req.body);
    res.render("new-book", { book, errors: error.errors , title: "New Book" })
    } else {
    throw error; 
    }  
}
}));

// get /books/:id - Shows book detail form
router.get('/books/:id', asyncHandler(async (req, res) => {
const book = await Book.findByPk(req.params.id);
if(book) {
    res.render("update-book", { book, title: book.title });  
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
    res.render("update-book", { book, errors: error.errors, title: "Edit Article" })
    } else {
    throw error;
    }
}
}));

// post /books/:id/delete - Deletes a book. Careful, this can’t be undone. It can be helpful to create a new “test” book to test deleting
router.post('/books/:id/delete', asyncHandler(async (req, res) => {
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

//POST /search  - returns search results 
router.post('/search', asyncHandler(async(req, res) => {
const query = req.body.search;

const books1 = await Book.findAll({ where: { title : { [Op.substring]: query } } });
const books2 = await Book.findAll({ where: { author : { [Op.substring]: query } } });
const books3 = await Book.findAll({ where: { genre : { [Op.substring]: query } } });

let books4 = [];
const date = parseInt(query);
if (date){
    books4 = await Book.findAll({ where: { year : { [Op.eq]: parseInt(query) } } });
} 

const results = [...books1, ...books2, ...books3, ...books4];

if (results.length > 0){
    res.render('searchResults', { books : results , title: 'Search Results'});
} else {
    res.render('searchFail');
}

}));


module.exports = router;