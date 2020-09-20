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
    return  res.render('signup', { title: 'Password Management System',msg:"Email Already Exist !!",success:''}); //this will print error on html page otherthan console
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
    return  res.render('signup', { title: 'Password Management System',msg:"Username Already Exist !!",success:''}); 
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

/* GET home page. */
//-----Login Page-----
router.get('/', function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser')
  if(loginUser){
    res.redirect('./dashboard')
  }
  else{
    res.render('index', { title: 'Password Management System',msg:"" ,success:''});
  }
});
router.post('/', function(req, res, next) {
  var username = req.body.uname //importing username from html form
  var password = req.body.password //importing password from html form
  var checkUser = userModule.findOne({username:username}) //this function will find that username in db 
  checkUser.exec((err,data)=>{
  if (err) throw err
  var getUserID= data._id //this will fetch the id of the user from db
  var getPassword=data.password //and this will store the input password
  if(bcrypt.compareSync(password,getPassword)){ //and this will compare it for further login
    var token = jwt.sign({ userID: getUserID }, 'loginToken'); //this will get store getUserID into userID from the db and create a token for that user named a 'loginToken'
    localStorage.setItem('userToken', token); // and this will store that token temporary in scratch folder named as 'userToken'
    localStorage.setItem('loginUser', username); //and store the username into 'loginuser' and help in displaying the name of the user on further pages
    res.redirect('/dashboard')
    // res.render('index', { title: 'Password Management System',msg:"Logged in Sucessfully" });
  }else{
    res.render('index', { title: 'Password Management System',msg:"Invalid Username and Password" ,success:''});
  }
  })
});

//-----Signup Page-----
router.get('/signup', function(req, res, next) { 
    var loginUser = localStorage.getItem('loginUser')
    if(loginUser){
      res.redirect('./dashboard')
    }
    else{
      res.render('signup', { title: 'Password Management System',msg:'',success:'' });
    }
});
router.post('/signup', checkUsername,checkEmail,function(req, res, next) {  //note:- we are using these middlewere here so that our error will not be printed in console and server will not be stopped it will be displayed in form
  var username = req.body.uname //importing userDetails from html form
  var email = req.body.email
  var password = req.body.password 
  var confpassword= req.body.confpassword

  if(password != confpassword){
    res.render('signup', { title: 'Password Management System',msg:"Password not matched",success:''});
  }
  else{
  password=bcrypt.hashSync(req.body.password,10) //Password Encrypter Activator with Length-10, we are using this so that DB Admin can't see the password
  var userDetails = new userModule({ //exporting it to MongoDB model 
    username:username,
    email:email,
    password:password
  })
  userDetails.save((err,doc)=>{
    if(err)throw err
    res.render('signup', { title: 'Password Management System',success:"User Registered Successfully",msg:''});
  }) //now last step, saving it 
}
});

//-----Logout----
router.get('/logout', function(req, res, next) {
  localStorage.removeItem('userToken')
  localStorage.removeItem('loginUser')
  res.redirect('/')
});
module.exports = router;
