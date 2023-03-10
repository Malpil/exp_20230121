var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// 1. require,rest용
//빵집관련
var bakeryRouter = require('./routes/bakery')
// var usersRouter = require('./routes/bakeryreview');

//vue에서 빌드한 페이지 표시용
var indexRouter = require('./routes/index');

//npm i mongoose --save
var mongoose = require('mongoose');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect("mongodb://pil:789510@127.0.0.1:27017/bread");
mongoose.connection;

// 2. 주소 설정
app.use('/api/bakery', bakeryRouter);
// app.use('/api/bakeryreview', bakeryReviewRouter);

//vue에서 빌드한 페이지 보여주기 용
app.use('/', indexRouter);
// app.use('/users',usersRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
