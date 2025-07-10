import {Router} from "express"
const pipelineRouter = Router()

import {createPipeline,getAllPipelines,upsertStageToPipeline,removeStageFromPipeline,getPipelineStagesWithDeals} from "../controller/pipeline.controller.js"

import { tokenVerify} from "../middleware/auth.js"; 




pipelineRouter.post("/create-pipeline",tokenVerify, createPipeline)

pipelineRouter.get("/get-pipeline", tokenVerify, getAllPipelines)

pipelineRouter.patch("/update-stage/:id", tokenVerify, upsertStageToPipeline)

pipelineRouter.patch("/remove-stage/:id", tokenVerify, removeStageFromPipeline)
pipelineRouter.get("/get-pipeline-stages-with-deals", tokenVerify, getPipelineStagesWithDeals)

export {pipelineRouter}