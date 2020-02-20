"use strict";
import * as mongoose from "mongoose";
import { Levels } from "types/level";
const Schema = mongoose.Schema;

const BoardSchema = new Schema({
    level : String,
    mines : {},
    openedSet : [],
    adjacenct_list : [],
    gameId : String
 });

export {
    BoardSchema
}