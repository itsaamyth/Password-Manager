const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/pms',{useNewUrlParser:true,useCreateIndex:true,useUnifiedTopology:true})
var conn=mongoose.Collection
var passcatScheme= new mongoose.Schema({
    password_category:{
        type:String,
        required:true,
        index:{
            unique:true,
        }},
    username:{
      type:String
    },
    date:{
        type:Date,
        default:Date.now
    }
})
var passCatModel = mongoose.model('password_categories',passcatScheme)
module.exports=passCatModel
