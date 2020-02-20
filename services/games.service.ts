"use strict";
import { Service } from "moleculer";
import {Errors} from 'moleculer';
import * as util from 'util';
const {MoleculerClientError} = Errors;
import { Levels } from "../types/level";


class GamesService extends Service {
	constructor(broker){
		super(broker);
		this.parseServiceSchema({
            name: "games",
            metadata: { service: "games" , collection : "games"},
            mixins : [],
            dependencies : [],
            actions: {
                newGame : {
                    cache : false,
                    params : {},
                    handler : this.newGame
                },
                continueGame : {
                    cache : false,
                    params : {},
                    handler : this.continueGame
                }
            },
            methods: {
                _initializeGame : this._initializeGame
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
    async newGame(ctx){
        const method = "newGame";
        try{
            const difficulty = ctx && ctx.params && ctx.params.difficulty || Levels.EASY;
            const gameId = "NEWRANDOM";
            const newGame = await this._initializeGame({difficulty,gameId});
            return {
                gameId,
                status : "STARTED"
            };
        } catch(err){
            this.logger.error(err);
            // Alert via slack
            throw new MoleculerClientError(`Request failed with err ${util.inspect(err)}`,500)
        }
    }

    async continueGame(ctx){
        const method = "continueGame";
        try{

            const gameId = ctx && ctx.params && ctx.params.gameId || "";
            const location = ctx && ctx.params && ctx.params.location || "";

            const board = ctx.call("boards.getBoard",{gameId});
            console.log(board);
            // Check location is a mine
            if(!board && board.mines && board.mines[location]){
                // Not a mine update board with the location as open
                board.open.push(location);
                console.log(board)
                const updated = await ctx.call("boards.updateBoard",{gameId,board});
                return {
                    gameId,
                    status: "GAME_CONTINUE",
                    open : board.open,
                    closed : [{ position : "", count : 1}]
                };
            } else {
                return {
                    gameId,
                    status: "GAME_OVER",
                    open : board.open,
                    mines : board.mines
                };
            }
            
            
        } catch(err){
            this.logger.error(err);
            // Alert via slack
            throw new MoleculerClientError(`Request failed with err ${util.inspect(err)}`,500)
        }
    }

    // ************************* PRIVATE METHODS **********************************

    async _initializeGame({difficulty,gameId}) {
        try{
            const newBoard = await this.broker.call("boards.newBoard",{difficulty,gameId});
            return newBoard;
        } catch(err){

        }
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

export = GamesService;
