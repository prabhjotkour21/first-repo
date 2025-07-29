
import { Schema, model } from "mongoose";

const dealSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    value: {
      type: Number,
      required: true,
    },
    // pipeline: {
    //   type: Schema.Types.ObjectId,
    //   ref: "Pipeline", //Reference to which pipeline this deal belongs
    // },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User", // User who created the deal
      required: true,
    },
    code_currency: {
      type: String,
      default: "INR", // e.g., INR, USD, EUR
    },
    stageId: {
      type: Schema.Types.ObjectId,
      ref: "Stage", //  Stage reference for drag-drop & status tracking
      required: true,
    },
    endDate: {
      type: Date, // When this deal is expected to close
      required: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    clientCompanyIds:[
      {
        type:Schema.Types.ObjectId,
        ref:"ClientCompany",
        default: null  // deal can exist without a client
      }
    ],
    status:{
      type:String,
      enum:["win","Loss","InProgress"],
      default:"InProgress"
    },
    riskScore:{

    },
    next_step:{
      
    }
  },
  { timestamps: true }
);

const Deal = model("Deal", dealSchema);

export { Deal };
