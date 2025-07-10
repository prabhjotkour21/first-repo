import { Schema, model } from "mongoose";

const pipelineSchema = new Schema(
  {
    name: {
      type: String,
      default: "Default Pipeline",
    },

    stages: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Stage",
        }
      ],
      default: [],
  },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User", // Who created the pipeline
      required: true,
      // default: null, 
    },
  },
  { timestamps: true }
);

const Pipeline = model("Pipeline", pipelineSchema);
export { Pipeline };
