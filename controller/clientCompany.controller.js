import {ClientCompany} from "../model/clientCompany.model.js"
import * as ERROR from "../common/error_message.js";
import { sendSuccess} from "../utils/responseHandler.js";

import {Organization} from "../model/organization.js"
import {User} from "../model/user.js";

import {Deal} from "../model/deal.model.js"
// Create 

export const createCompany=async(req,res,next)=>{
    try{
        const {
            OrganizationId,companyName,contactNumbers,email,address,dealIds=[]
        }=req.body

        // find Organization
        const org=await Organization.findById(OrganizationId)
        if(!org){
            throw new Error(ERROR.ORGANIZATION_NOT_FOUND)
        }

        // find deal

        const validDeals=await Deal.find({_id:{$in:dealIds}})
        if(validDeals.length!==dealIds.length){
          throw new Error (ERROR.DEAL_NOT_FOUND)   
        }
        const newCompany=await ClientCompany.create({
            OrganizationId,
            companyName,
            contactNumbers,
            email,
            address,
            dealIds
        })
        // console.log(newCompany)
        return sendSuccess(res,"Client Company Create Successfully",newCompany)
    }catch(error){
        console.log("Error in client Company Create",error.message)
        next(error)
    }
}
// Read

export const getCompanies=async(req,res,next)=>{
   try{
    // console.log(req.user)
    const page=parseInt(req.query.page)||1

    const limit=parseInt(req.query.limit)||10

    const skip=(page-1)*limit

    
    const findUser=await User.findById(req.user.userId)
    // console.log(findUser)
    
    const organization=await Organization.find({
        owner:req.user.userId,
        isDeleted:false
    })
    // console.log(organization)
   const orgId=organization.map((i)=>i._id)
//    console.log(orgId)

     const totalCompanies=await ClientCompany.countDocuments({isDeleted:false})

    const totalPages=Math.ceil(totalCompanies/limit)
    
    const companies=await ClientCompany.find({ isDeleted: false ,  OrganizationId: orgId})
    .populate("OrganizationId")
    .populate("dealIds")
    .skip(skip)
    .limit(limit)
    // console.log(companies)
    const hasNextPage=page<totalPages
    const hasPrevPage=page>1
    const nextPage=hasNextPage?page+1:null
    const prevPage=hasNextPage?page-1:null
    
    return sendSuccess(res,"Companies fetch successfully",
        {
            totalCompanies,
            totalPages,
            currentPage:page,
            limit,
            hasNextPage,
            hasPrevPage,
            nextPage,
            prevPage,
            companies
        })
   }catch(error){
    console.log("Error in companies fetching",error.message)
    next(error)
   }
}


export const updateCompany=async(req,res,next)=>{
    try{
        const{id}=req.params
       const updates=req.body
       //Validate OrganizationId
       if(updates.OrganizationId){
        const org=await Organization.findById(updates.OrganizationId)
        if(!org){
            throw new Error(ERROR.ORGANIZATION_NOT_FOUND)
        }
       }
       //Validate DealIds
       if(updates.dealIds && updates.dealIds.length>0
       ){
        const validDeals=await Deal.find({_id:{$in:updates.dealIds}})
        if(validDeals.length!==updates.dealIds.length){
          throw new Error (ERROR.DEAL_NOT_FOUND)   
        }

       }
       // Update only provided fields
       const updatedCompany=await ClientCompany.findByIdAndUpdate(
        id,
        updates,
        {new:true}
       ).populate("OrganizationId").populate("dealIds")

       if(!updatedCompany){
        throw new Error(ERROR.CLIENT_COMPANY_NOT_FOUND)
       }

       return sendSuccess(res,"Client Company Updated Successfully",updatedCompany) 
    }catch(error){
        console.log("Error in Client Company Update",error.message)
        next(error)
    }
}

export const deleteCompany=async(req,res,next)=>{
    try{
        const {id}=req.params
        // console.log(id)
       
        const updated=await ClientCompany.findByIdAndUpdate(
            id,
            {isDeleted:true},
            {new:true}
        )
        // console.log(updated)

        if(!updated){
            throw new Error(ERROR.CLIENT_COMPANY_NOT_FOUND)
        }
        return sendSuccess(res,"Client Company deleted successfully",updated)
    }catch(error){
        console.log("Error in Client Company deleted ",error.message)
        next(error)
    }
}