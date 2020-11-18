var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

(async () => {
  const db = require('./models/index');

  try {
    const response = await db.sequelize.authenticate();
    console.log('connection successfully established');
  } catch(err){
    console.log('ERROR in establishing connection');
  } 
  
  await db.sequelize.sync();

})();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// error handler
app.use(function(err, req, res, next) {
  console.log('ERROR HANDLER: ', err.status);
  if (err.status === 404){
    res.render('page-not-found', { title: 'Page Not Found' });
  }else {
    err.status = err.status || 500;
    err.message = err.message || 'There was a server error.';

    console.log('ERROR STATUS: ', err.status);
    console.log('ERROR MSG: ', err.message);

    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};



    // render the error page
    res.status(err.status || 500);
    res.render('error', { title: 'Server Error' });
  }
  
});





module.exports = app;
