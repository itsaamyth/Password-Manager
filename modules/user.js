const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/pms',{useNewUrlParser:true,useCreateIndex:true,useUnifiedTopology:true})
// mongoose.connect('mongodb+srv://Amit_Kumar:Amitk6228@cluster0.vuxfq.mongodb.net/pms?retryWrites=true&w=majority',{useNewUrlParser:true,useCreateIndex:true,useUnifiedTopology:true})
var conn=mongoose.Collection
var userScheme= new mongoose.Schema({
    username:{
        type:String,
        required:true,
        index:{
            unique:true,
        }
    },
    email:{
        type:String,
        required:true,
        index:{
            unique:true,
        }
    },
    password:{
        type:String,
        required:true,
    },
    date:{
        type:Date,
        default:Date.now
    }
})
var userModel = mongoose.model('users',userScheme)
module.exports=userModel
