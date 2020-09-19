//-------------Required modules--------------//
var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs') //password Encrypter
var jwt = require('jsonwebtoken')
var userModule = require('../modules/user');
var passCatModel = require('../modules/password_category')
var passModel = require('../modules/add_password')
var getPassCat = passCatModel.find({})
var getAllPass = passModel.find({})
const { response } = require('express');
const { body, validationResult, check } = require('express-validator');
const { count } = require('../modules/user');
if (typeof localStorage === "undefined" || localStorage === null) { //npm- localStorage requirement 
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}
//-------------Required modules--------------//

//---------middleware to check if Email already Exist in DB for Signup -----------//
function checkEmail(req,res,next){ 
  var email = req.body.email
  var checkexistemail =  userModule.findOne({email:email})
  checkexistemail.exec((err,data)=>{
    if(err)throw err 
    if(data){
    return  res.render('signup', { title: 'Password Management System',msg:"Email Already Exist !!"}); //this will print error on html page otherthan console
    }
    next()
  })
}

//---------middleware to check if Username already Exist in DB for Signup-----------//
function checkUsername(req,res,next){ 
  var uname = req.body.uname
  var checkexistuname =  userModule.findOne({username:uname})
  checkexistuname.exec((err,data)=>{
    if(err)throw err
    if(data){
    return  res.render('signup', { title: 'Password Management System',msg:"Username Already Exist !!"}); 
    }
    next()
  })
}

//---------middleware to check if user is signed in or not by comparing it with localstorage temp data -----------//
function checkLoginUser(req,res,next){
  var userToken = localStorage.getItem('userToken') //this will get the userToken from localstorage 
  try{
    var decoded = jwt.verify(userToken,'loginToken') //and verify it with loginToken that we generated in login route 
  }                                                  //and if they match then we can login otherwise not
  catch(err){
    res.redirect('/')
  }
  next()
}

//-----Dashboard Page----
router.get('/', checkLoginUser,function(req, res, next) {
    var loginUser = localStorage.getItem('loginUser')
    res.render('dashboard', { title: 'Password Management System',loginUser :loginUser,msg:''});
  });

module.exports = router;
