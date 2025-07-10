import {Pipeline } from "../model/pipeline.model.js";
import {Stage} from "../model/stage.model.js";
import * as ERROR from "../common/error_message.js";
import { sendSuccess } from "../utils/responseHandler.js";
   
const createPipeline = async (userId) => {
  try {
    const pipeline = new Pipeline({
      stages:[],
      createdBy: userId
    });
    await pipeline.save();
   await onbordingStages(userId, pipeline._id);
    return pipeline
  } catch (err) {
    next(err);
  }
};
 

const onbordingStages=async(userId,pipelineId)=>{
  try{
    const defaultStages = ["Stage 1", "Stage 2", "Stage 3", "Stage 4"];
    const stageIDs=[]

    for(let i=0;i<defaultStages.length;i++){
        const stage=await Stage.create({
          name:defaultStages[i],
          order:i+1,
          createdBy:userId,
          isDeleted:false,
          deals:[]
        })
        stageIDs.push(stage._id);
    }
    await Pipeline.findByIdAndUpdate(pipelineId,{ $set:{stages:stageIDs}},
      {new:true}
    )
  }catch(err){
    console.error("Error creating onboarding stages:", err);
    throw new Error(ERROR.STAGE_CREATION_FAILED);
  }
}



const getAllPipelines = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    console.log("User ID ", userId);

    const pipeline = await Pipeline.findOne({ createdBy: userId });

    let userStages = await Stage.find({ createdBy: userId, isDeleted: false })
      .populate({
        path: "deals",
        match: { createdBy: userId }
      })
      .sort({ order: 1 });
    const cleanStages = userStages.map(stage => ({
      _id: stage._id,
      name: stage.name,
      order: stage.order,
      createdBy: stage.createdBy,
      deals: stage.deals.map(deal => ({
        _id: deal._id,
        title: deal.title,
        description: deal.description,
        value: deal.value,
        code_currency: deal.code_currency,
        stageId: deal.stageId,
        createdBy: deal.createdBy
      }))
    }));
    if (cleanStages.length === 0) {
      console.log("No custom stages found, returning default stages");

      const defaultStages = await Stage.find({ createdBy: null, isDeleted: false })
        .populate({
          path: "deals",
          match: { createdBy: userId }
        })
        .sort({ order: 1 });
        const cleanDefaultStages = defaultStages.map(stage => ({
        _id: stage._id,
        name: stage.name,
        order: stage.order,
        createdBy: stage.createdBy,
        deals: stage.deals.map(deal => ({
          _id: deal._id,
          title: deal.title,
          description: deal.description,
          value: deal.value,
          code_currency: deal.code_currency,
          stageId: deal.stageId,
          createdBy: deal.createdBy
        }))
      }));

      return res.status(200).json({
        status: true,
        status_code: 200,
        message: "Default stages fetched successfully",
        data: {
          pipelineId: pipeline?._id ?? null,
          pipelineName: pipeline?.name ?? "",
          stages: cleanDefaultStages,
        },
      });
    }

    return res.status(200).json({
      status: true,
      message: "Custom stages fetched successfully",
      data: {
        pipelineId: pipeline?._id ?? null,
        pipelineName: pipeline?.name ?? "",
        stages: cleanStages,
      },
    });

  } catch (err) {
    next(err);
  }
};



const getPipelineStagesWithDeals = async (req,res) => {
  try {
    const pipelineData = await Pipeline.findOne({createdBy: req.user.userId})
      .populate({
        path: "stages",
        match: { isDeleted: false },
        populate: {
          path: "deals",
          match: { isDeleted: false },
        },
      });

    if (!pipelineData) {
      return { message: "Pipeline not found" };
    }

    const cleanedStages = pipelineData.stages.map(stage => ({
      _id: stage._id,
      name: stage.name,
      order: stage.order,
      createdBy: stage.createdBy,
      deals: stage.deals.map(deal => ({
        _id: deal._id,
        title: deal.title,
        description: deal.description,
        value: deal.value,
        code_currency: deal.code_currency,
        stageId: deal.stageId,
        createdBy: deal.createdBy
      }))
    }));
   
    
    return res.status(200).json({
      status: true,
      message: "Pipeline stages with deals fetched successfully",
      data:{
        pipelineId: pipelineData._id,
        stages: cleanedStages
      }
    })
  } catch (error) {
    console.error("Error fetching pipeline data:", error);
    throw error;
  }
};




const upsertStageToPipeline = async (req, res, next) => {
  try {
    const pipelineId = req.params.id;
    const { stageId } = req.body;

    if (!pipelineId) throw new Error(ERROR.PIPELINE_ID_REQUIRED);
    if (!stageId) throw new Error(ERROR.STAGE_ID_REQUIRED);

    const pipeline = await Pipeline.findById(pipelineId);
    if (!pipeline) throw new Error(ERROR.PIPELINE_NOT_FOUND);

    let message = "";

    const existingIndex = pipeline.stages.findIndex(
      (stage) => stage.toString() === stageId
    );

    if (existingIndex !== -1) {
      // Already exists → update (or replace)
      pipeline.stages[existingIndex] = stageId;
      message = "Stage updated successfully in pipeline";
    } else {
      // Doesn't exist → add
      pipeline.stages.push(stageId);
      message = "Stage added to pipeline successfully";
    }

    const updatedPipeline = await pipeline.save();

    return sendSuccess(res, message, updatedPipeline);
  } catch (err) {
    next(err);
  }
};

const removeStageFromPipeline = async (req, res, next) => {
  try {
    const pipelineId = req.params.id;
    const { stageId } = req.body;

    if (!pipelineId) throw new Error(ERROR.PIPELINE_ID_REQUIRED);
    if (!stageId) throw new Error(ERROR.STAGE_ID_REQUIRED);

    const pipeline = await Pipeline.findById(pipelineId);
    if (!pipeline) throw new Error(ERROR.PIPELINE_NOT_FOUND);

    const index = pipeline.stages.findIndex(
      (stage) => stage.toString() === stageId
    );

    if (index === -1) {
      throw new Error(ERROR.STAGE_NOT_IN_PIPELINE);
    }

    // Remove stage
    pipeline.stages.splice(index, 1);
    const updatedPipeline = await pipeline.save();

    return sendSuccess(res, "Stage removed from pipeline successfully", updatedPipeline);
  } catch (err) {
    next(err);
  }
};



export {createPipeline,getAllPipelines,upsertStageToPipeline,removeStageFromPipeline,getPipelineStagesWithDeals };
