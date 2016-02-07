var Async=require("async");
var cheerio=require("cheerio");
var diacritics=require("diacritics");
var fs=require("fs");
var i18n=require("i18n");
var path=require("path");
var request=require("request");
var tmp=require("tmp");

var LOG=require("../lib/Logger");

var ConsoleGridPlugin=function ConsoleGridPlugin(params){
	LOG.trace("ConsoleGridPlugin");
	params=params || {};
	this.file=params.file;
};

var CONSOLEGRID_URL="http://consolegrid.com"
var SEARCH_URL=CONSOLEGRID_URL+"/games?utf8=✓&q=";

var COMMON_REPLACERS=[
	{"replace": /\(.*?\)/g, "with": ""},
	{"replace": /\bII\b/g, "with": "2"},
	{"replace": /\bIII\b/g, "with": "3"},
	{"replace": /\bIV\b/g, "with": "4"},
	{"replace": /\bV\b/g, "with": "5"},
	{"replace": /\bVI\b/g, "with": "6"},
	{"replace": /\bVII\b/g, "with": "7"},
	{"replace": /\bVIII\b/g, "with": "8"},
	{"replace": /\bIX\b/g, "with": "9"},
	{"replace": /\bX\b/g, "with": "10"},
	{"replace": /\bXI\b/g, "with": "11"},
	{"replace": /\bXII\b/g, "with": "12"},
	{"replace": /\bXIII\b/g, "with": "13"},
	{"replace": /\bXIV\b/g, "with": "14"},
	{"replace": /\bXV\b/g, "with": "15"}
];

//TODO acquire grid via API when user specifies the console in the package.json

ConsoleGridPlugin.prototype.getGrid=function(params,callback){
	var searchInputsToTry=[];
	if(params && params.nonSteamGame && params.nonSteamGame.appname){
		var appname=params.nonSteamGame.appname;
		searchInputsToTry.push(appname);
		var appnameWithoutDiacritics=diacritics.remove(appname);
		if(appname!==appnameWithoutDiacritics){
			searchInputsToTry.push(appnameWithoutDiacritics);
		}
		for(var i=0;i<COMMON_REPLACERS.length;++i){
			var replacer=COMMON_REPLACERS[i];
			var replaced=appnameWithoutDiacritics.replace(replacer.replace,replacer.with);
			if(replaced!==appnameWithoutDiacritics){
				searchInputsToTry.push(replaced);
			}
		}
		var splitAppname=appnameWithoutDiacritics.split(/\s*:\s*/);
		if(splitAppname.length>1){
			searchInputsToTry=searchInputsToTry.concat(splitAppname);
		}
	}
	try{
		var filename=path.parse(this.file).name
		searchInputsToTry.push(filename);
		var filenameWithoutDiacritics=diacritics.remove(filename);
		if(filename!==filenameWithoutDiacritics){
			searchInputsToTry.push(filenameWithoutDiacritics);
		}
	}catch(e){
		LOG.debug("ConsoleGridPlugin.getGrid","Error:",e);
	}

	var gridFilepath=null;
	Async.eachSeries(searchInputsToTry,function(searchInput,callback){
		if(gridFilepath){
			return callback();
		}
		Async.waterfall([
			function(callback){
				var url=SEARCH_URL+encodeURIComponent(searchInput);
				LOG.debug("ConsoleGridPlugin.getGrid","searchUrl",url);
				request(url,callback);
			},
			function(response,body,callback){
				var $=cheerio.load(body);
				var results=$(".game-table.table.table-bordered.table-striped .game-table-name-cell a");
				if(results.length===0){
					LOG.debug(i18n.__("No grid image on Consolgrid found with '%s'",searchInput));
					return callback(null,null,null);
				}
				var href=results[0].attribs.href;
				var url=CONSOLEGRID_URL+href;
				LOG.debug("ConsoleGridPlugin.getGrid","gameUrl",url);
				request(url,callback);
			},
			function(response,body,callback){
				if(!body){
					return callback();
				}
				var $=cheerio.load(body);
				var image=$(".top-picture > img");
				if(image.length===0){
					return callback();
				}
				var source=image[0].attribs.src;
				LOG.debug("ConsoleGridPlugin.getGrid","imageUrl",source);
				//download the image somewhere in the temporary directory.
				Async.waterfall([
					function(callback){
						tmp.tmpName({postfix: path.extname(source)},callback);
					},
					function(tmpFilepath,callback){
						var writeStream=fs.createWriteStream(tmpFilepath);
						var callbackCalled=false;
						writeStream.on("error",function(err){
							if(callbackCalled){
								return;
							}
							callbackCalled=true;
							callback(err);
						}).on("finish",function(){
							if(callbackCalled){
								return;
							}
							callbackCalled=true;
							//callback the path where where the grid image is. Nostegma will see to it, that it goes where it should.
							callback(null,tmpFilepath);
						});
						request(source).pipe(writeStream);
					}
				],callback);
			}
		],function(err,filepath){
			gridFilepath=filepath;
			if(err){
				LOG.error(i18n.__("An error occured while trying to fetch a grid image from Consolegrid. Reason: %s",String(err)))
			}
			callback();
		});
	},function(){
		callback && callback(null,gridFilepath);
	});
};

module.exports=ConsoleGridPlugin;
