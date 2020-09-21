const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/pms',{useNewUrlParser:true,useCreateIndex:true,useUnifiedTopology:true})
// mongoose.connect('mongodb+srv://Amit_Kumar:Amitk6228@cluster0.vuxfq.mongodb.net/pms?retryWrites=true&w=majority',{useNewUrlParser:true,useCreateIndex:true,useUnifiedTopology:true})
var conn=mongoose.Collection
var passcatScheme= new mongoose.Schema({
    password_category:{
        type:String,
        required:true,
        unique:false,
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
