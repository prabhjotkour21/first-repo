import {Schema,model} from "mongoose"
const clientCompanySchema=new Schema({
    OrganizationId:{
        type:Schema.Types.ObjectId,
        ref:"Organization",
        required:true
    },
    companyName:{
        type:String,
        required:true
    },
    contactNumbers:[
        {
            name:{type:String,required:true},
            number:{type:String,required:true}
        }
    ],
    email:{
        type:String,
        required:true
    },
    address:{
        type:String
    },
    dealIds:[
        {
            type:Schema.Types.ObjectId,
            ref:"Deal"
        }
    ],
    isDeleted:{
        type:Boolean,
        default:false
    }
},{timestamps:true})

const ClientCompany = model("ClientCompany", clientCompanySchema);

export {ClientCompany}