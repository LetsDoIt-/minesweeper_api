"use strict";
import { Service } from "moleculer";
import * as config from 'config';
import mongoose  from "mongoose";
import {Errors} from 'moleculer';
import * as util from 'util';
const {MoleculerClientError} = Errors;
import DbService  from "moleculer-db";
import MongooseAdapter from "moleculer-db-adapter-mongoose";
import { Levels } from "../types/level";
import { BoardSchema } from "../models/board.schema";


class BoardsService extends Service {
	constructor(broker){
		super(broker);
		this.parseServiceSchema({
            name: "boards",
            metadata: { service: "boards" , collection : "boards"},
            mixins : [DbService],
            adapter: new MongooseAdapter(config.mongodb.connectionUrl),
            model: mongoose.model("Boards",BoardSchema),
            dependencies : [],
            actions: {
                newBoard : {
                    cache : false,
                    params : {},
                    handler : this.newBoard
                },
                getBoard : {
                    cache : false,
                    params : {},
                    handler : this.getBoard
                },
                updateBoard : {
                    cache : false,
                    params : {},
                    handler : this.updateBoard
                }
            },
            methods: {
                _createBoardInDB : this._createBoardInDB,
                _generateRandomMines : this._generateRandomMines
			},
			events: {},
            created: this._serviceCreated,
            started: this._serviceStarted,
            stopped: this._serviceStopped,
        });
    }
    
    /**
     * 
     * 
     * 
     * 
     * @param {*} ctx
     * @returns
     * @memberof newGame
     */
    async newBoard(ctx){
        const method = "newBoard";
        try{
            const difficulty = ctx && ctx.params && ctx.params.difficulty || Levels.EASY;
            const gameId = ctx && ctx.params && ctx.params.gameId || "";
            console.log(difficulty,gameId)
            const randomMinesLocations = await this._generateRandomMines(difficulty);
            const board  = {
                level : difficulty,
                mines : randomMinesLocations,
                opened : [],
                gameId
            }

            return await this._createBoardInDB(board);
            
        } catch(err){
            this.logger.error(err);
            // Alert via slack
            throw new MoleculerClientError(`Request failed with err ${util.inspect(err)}`,500)
        }
    }

    async getBoard(ctx){
        const method = "getBoard";
        try{
            const gameId = ctx && ctx.params && ctx.params.gameId || "";

            const board =  await this.adapter.find({query : {gameId}});

            return board[0];
        } catch(err){
            this.logger.error(err);
            // Alert via slack
            throw new MoleculerClientError(`Request failed with err ${util.inspect(err)}`,500)
        }
    }


    async updateBoard(ctx){
        const method = "updateBoard";
        try{
            const gameId = ctx && ctx.params && ctx.params.gameid || "";
            const board = ctx && ctx.params && ctx.params.board || "";
            console.log(gameId,board);
            const boardAvailable = await this.adapter.findOne({gameId});
            const updatedBoard = {
                "$set" : board
            };
            return await this.adapter.updateById(boardAvailable._id,updatedBoard);
        } catch(err){
            this.logger.error(err);
            // Alert via slack
            throw new MoleculerClientError(`Request failed with err ${util.inspect(err)}`,500)
        }
    }


    // ************************* PRIVATE METHODS **********************************

    async _createBoardInDB(board){
        console.log("Here");
        return await this.adapter.insert(board);
    }

    async _generateRandomMines(difficulty){
        console.log(difficulty);
        const boardSet = new Set();
        const result = {};
        let mineCount = 0;
        let width = 0;
        let height = 0;

        if(difficulty === Levels.EASY){
            mineCount = 10;
            width = 10;
            height = 10;
        } else if(difficulty === Levels.MEDIUM){
            mineCount = 20;
            width = 20;
            height = 20;
        } else {
            mineCount = 30;
            width = 30;
            height = 30;
        }

        let spots = 0;
        console.log(mineCount);
        while(spots <= mineCount){
            let x = Math.floor((Math.random() * width) + 1);
            let y = Math.floor((Math.random() * height) + 1);
            if(!boardSet.has(`${x}_${y}`)){
                result[`${x}_${y}`] = true;
                spots++;
            }
            boardSet.add(`${x}_${y}`);
        }

        return result;
    }

    async _serviceCreated(){
        this.logger.info('Service created');
    }

    
    async _serviceStarted(){
        this.logger.info('Service started');
    }

    async _serviceStopped(){
        this.logger.info('Service stopped');
    }

};

export = BoardsService;
