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

/* GET home page. */
//-----Login Page-----
router.get('/', function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser')
  if(loginUser){
    res.redirect('./dashboard')
  }
  else{
    res.render('index', { title: 'Password Management System',msg:"" });
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
    res.render('index', { title: 'Password Management System',msg:"Invalid Username and Password" });
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
      res.render('signup', { title: 'Password Management System',msg:'' });
    }
});
router.post('/signup', checkUsername,checkEmail,function(req, res, next) {  //note:- we are using these middlewere here so that our error will not be printed in console and server will not be stopped it will be displayed in form
  var username = req.body.uname //importing userDetails from html form
  var email = req.body.email
  var password = req.body.password 
  var confpassword= req.body.confpassword

  if(password != confpassword){
    res.render('signup', { title: 'Password Management System',msg:"Password not matched"});
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
    res.render('signup', { title: 'Password Management System',msg:"User Registered Successfully"});
  }) //now last step, saving it 
}
});

//-----Password Page----
router.get('/passwordCategory', checkLoginUser,function(req, res, next) {  //checkLoginUser is the middleware to check if user is signed in or not by comparing it with localstorage temp data -----------//
  var loginUser = localStorage.getItem('loginUser') //fetching the name of the user from localstorage that we made in login route
  getPassCat.find({username:loginUser},function(err,data){
  // getPassCat.exec(function(err,data){
    if(err) throw err
    res.render('password_category', { title: 'Password Management System',loginUser :loginUser ,records:data});//this will store name of user in loginUser and loginUser will be displayed at further pages
  })
});

router.get('/passwordCategory/delete/:id', checkLoginUser,function(req, res, next) {  //checkLoginUser is the middleware to check if user is signed in or not by comparing it with localstorage temp data -----------//
  var loginUser = localStorage.getItem('loginUser') //fetching the name of the user from localstorage that we made in login route
  var passcat_id=req.params.id 
  var passdelete = passCatModel.findByIdAndDelete(passcat_id)
  passdelete.exec(function(err){
    if(err) throw err
    res.redirect('/passwordCategory')
  })
});

router.get('/passwordCategory/edit/:id', checkLoginUser,function(req, res, next) {  //checkLoginUser is the middleware to check if user is signed in or not by comparing it with localstorage temp data -----------//
  var loginUser = localStorage.getItem('loginUser') //fetching the name of the user from localstorage that we made in login route
  var passcat_id=req.params.id 
  var getpassCategory = passCatModel.findById(passcat_id)
  getpassCategory.exec(function(err,data){
    if(err) throw err
    res.render('edit_pass_category', { title: 'Password Management System',loginUser :loginUser,errors:'',success:'' ,records:data,id:passcat_id});//
  })
});

router.post('/passwordCategory/edit/', checkLoginUser,function(req, res, next) {  //checkLoginUser is the middleware to check if user is signed in or not by comparing it with localstorage temp data -----------//
  var loginUser = localStorage.getItem('loginUser') //fetching the name of the user from localstorage that we made in login route
  var passcat_id=req.body.id 
  var passwordCategory = req.body.passwordCategory
  var update_passCat = passCatModel.findByIdAndUpdate(passcat_id,{password_category:passwordCategory})
  update_passCat.exec(function(err,doc){
    if(err) throw err
    res.redirect('/passwordCategory')
  })
});

//-----Add New Category----
router.get('/add-new-category', checkLoginUser,function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser')
    res.render('addNewCategory', { title: 'Password Management System',loginUser :loginUser,errors:'',success:'' });
});

router.post('/add-new-category', checkLoginUser,[check('passwordCategory','Enter Password Category Name').isLength({ min: 1 })],function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser')
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    res.render('addNewCategory', { title: 'Password Management System',loginUser :loginUser,errors:errors.mapped() ,success:''});
  }
  else{
    var passCatName = req.body.passwordCategory
    var passcatDetails = new passCatModel({
      password_category:passCatName,
      username:loginUser
    })
    passcatDetails.save(function(err,doc){
      if(err)throw err
      res.render('addNewCategory', { title: 'Password Management System',loginUser :loginUser,errors:'',success:'Password Category Inserted Successfully' });
    })
  }
});

//-----Add New Password----
router.post('/add-new-password', checkLoginUser,function(req, res, next) {
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
      getPassCat.exec(function(err,data){
        if(err) throw err
      res.render('addNewPassword', { title: 'Password Management System' ,loginUser :loginUser,records:data,success:"Password Details Inserted Successfully"});
    })
  })
});

router.get('/add-new-password', checkLoginUser,function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser')
  getPassCat.exec(function(err,data){
    if(err) throw err
    res.render('addNewPassword', { title: 'Password Management System' ,loginUser :loginUser,records:data,success:''});
  })
});

//-----View All Password----
router.get('/view-all-password', checkLoginUser,function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser')
  getAllPass.find({username:loginUser},function(err,data){
  // getAllPass.exec(function(err,data){
  if(err) throw err
  res.render('viewAllPassword', { title: 'Password Management System' ,loginUser :loginUser,records:data});
  })
});
router.get('/password-detail', checkLoginUser,function(req, res, next) {
  res.redirect('/dashboard')
});
router.get('/password-detail/edit/:id', checkLoginUser,function(req, res, next) {
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
router.post('/password-detail/edit/:id', checkLoginUser,function(req, res, next) {
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

router.get('/password-detail/delete/:id', checkLoginUser,function(req, res, next) {  //checkLoginUser is the middleware to check if user is signed in or not by comparing it with localstorage temp data -----------//
  var loginUser = localStorage.getItem('loginUser') //fetching the name of the user from localstorage that we made in login route
  var id =req.params.id
  var passdelete = passModel.findByIdAndDelete(id)
  passdelete.exec(function(err){
    if(err) throw err
    res.redirect('/view-all-password/')
  })
});
//-----Dashboard Page----
router.get('/dashboard', checkLoginUser,function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser')
  res.render('dashboard', { title: 'Password Management System',loginUser :loginUser,msg:''});
});

//-----Logout----
router.get('/logout', function(req, res, next) {
  localStorage.removeItem('userToken')
  localStorage.removeItem('loginUser')
  res.redirect('/')
});
module.exports = router;
