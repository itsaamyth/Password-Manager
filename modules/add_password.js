const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/pms',{useNewUrlParser:true,useCreateIndex:true,useUnifiedTopology:true})
var conn=mongoose.Collection
var passScheme= new mongoose.Schema({
    password_category:{
        type:String,
        required:true,
       },
    project_name:{
            type:String,
            required:true,
    },
    username:{
        type:String
      },
    password_details:{
            type:String,
            required:true,
        },
    date:{
        type:Date,
        default:Date.now
    }
})
var passModel = mongoose.model('password_details',passScheme)
module.exports=passModel
