import { ServiceSchema } from "moleculer";
import ApiGateway = require("moleculer-web");

const ApiService: ServiceSchema = {
	name: "api",

	mixins: [ApiGateway],

	settings: {
		port: process.env.PORT || 3000,

		routes: [{
			path: "/api/games",
			whitelist: ["**"],
			use : [

			],
			aliases: {
				"GET " 				:   "games.newGame",
				"POST :gameId"		:	"games.continueGame"
			},
			bodyParsers: {
				json: {
					strict: false
				},
				urlencoded: {
					extended: false
				}
			},
		}],

		assets: {
			folder: "public",
		},
	},
};

export = ApiService;
