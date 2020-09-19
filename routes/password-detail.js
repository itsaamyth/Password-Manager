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

router.get('/', checkLoginUser,function(req, res, next) {
    res.redirect('/dashboard')
  });
  
  router.get('/edit/:id', checkLoginUser,function(req, res, next) {
    var loginUser = localStorage.getItem('loginUser')
    var id =req.params.id
    var getPassDetails = passModel.findById({_id:id})
    getPassDetails.exec(function(err,data){
    if(err) throw err
    getPassCat.exec(function(err,data1){
      res.render('edit_password_detail', { title: 'Password Management System' ,loginUser :loginUser,records:data1,record:data,success:''});
    })
    })
  });
  router.post('/edit/:id', checkLoginUser,function(req, res, next) {
    var loginUser = localStorage.getItem('loginUser')
    var id =req.params.id
    var passcat = req.body.pass_cat
    var project_name = req.body.project_name
    var pass_details = req.body.pass_details
    passModel.findByIdAndUpdate(id,{password_category:passcat,project_name:project_name,password_details:pass_details}).exec(function(err){
      if(err)throw err
    var getPassDetails = passModel.findById({_id:id})
    getPassDetails.exec(function(err,data){
    if(err) throw err
    getPassCat.exec(function(err,data1){
      res.render('edit_password_detail', { title: 'Password Management System' ,loginUser :loginUser,records:data1,record:data,success:'Password Updated succesfully'});
    })
    })
    })
  });
  
  router.get('/delete/:id', checkLoginUser,function(req, res, next) {  //checkLoginUser is the middleware to check if user is signed in or not by comparing it with localstorage temp data -----------//
    var loginUser = localStorage.getItem('loginUser') //fetching the name of the user from localstorage that we made in login route
    var id =req.params.id
    var passdelete = passModel.findByIdAndDelete(id)
    passdelete.exec(function(err){
      if(err) throw err
      res.redirect('/view-all-password/')
    })
  });

module.exports = router