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
//-----Add New Password----
router.post('/', checkLoginUser,function(req, res, next) {
    var loginUser = localStorage.getItem('loginUser')
    var pass_cat = req.body.pass_cat
    var pass_details = req.body.pass_details
    var project_name = req.body.project_name
    var password_details = new passModel({
      password_category:pass_cat,
      project_name:project_name,
      username:loginUser,
      password_details:pass_details
    })
      password_details.save(function(err,doc){
        // getPassCat.exec(function(err,data){
        getPassCat.find({username:loginUser},function(err,data){
          if(err) throw err
        res.render('addNewPassword', { title: 'Password Management System' ,loginUser :loginUser,records:data,success:"Password Details Inserted Successfully"});
      })
    })
  });
  
  router.get('/', checkLoginUser,function(req, res, next) {
    var loginUser = localStorage.getItem('loginUser')
    getPassCat.find({username:loginUser},function(err,data){
    // getPassCat.exec(function(err,data){
      if(err) throw err
      res.render('addNewPassword', { title: 'Password Management System' ,loginUser :loginUser,records:data,success:''});
    })
  });
module.exports=router