var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sequelize = require('./models').sequelize;

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
/* app.use('/static', express.static(path.join(__dirname, 'public'))); */
app.use('/static', express.static('public'));

app.use('/', indexRouter);
app.use('/users', usersRouter);


try{
  sequelize.authenticate();
  console.log('Connection to the database successful!');
} catch (error) {
  console.error('Unable to connect to the database ', error);
}


// render the 'page-not-found' template if the route does not exist
app.use(function(req, res, next) {
  const err = new Error();
  err.status = 404;
  err.message = 'Page not found. Looks like that this route does not exist.';
  res.status(404).render('page-not-found', { error: err });
});

// global error handler
app.use(function(err, req, res, next) {
  if (err) {
    console.log('Global error handler called', err);
  }

  if (err.status === 404) {
    res.status(404).render('page-not-found', { error: err });
  } else {
    err.message= err.message || 'Oops!  It looks like something went wrong on the server.';
    err.status = err.status || 500;
    console.log(err.status, err.message);
    res.status(err.status).render('error', { error: err });
  }
});

module.exports = app;
