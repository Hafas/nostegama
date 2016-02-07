var Async=require("async");
var fs=require("fs-extra");
var i18n=require("i18n");
var ono=require("ono");
var os=require("os");
var path=require("path");

var Builder=require("node-steam-shortcuts").Builder;
var Parser=require("node-steam-shortcuts").Parser;
var ShortcutCollection=require("node-steam-shortcuts").ShortcutCollection;

var Errors=require("./Errors");
var GlobalConfiguration=require("./GlobalConfiguration");

var LOG=require("./Logger");

var osType=os.type();
switch(osType){
	case "Darwin": {
		exports.locate=require("./OSX/Userdata").locate;
		break;
	}
	case "Linux": {
		exports.locate=require("./Linux/Userdata").locate;
		break;
	}
	case "Windows_NT": {
		exports.locate=require("./Windows/Userdata").locate;
		break;
	}
	default: {
		exports.locate=function(){return null;};
	}
}

exports.validate=function(callback){
	LOG.trace("Userdata.validate");
	var userdataDir=GlobalConfiguration.userdataDir;
	fs.stat(userdataDir,function(err,stats){
		if(err){
			if(err.code==="ENOENT"){
				err=ono(Errors.userdataNotFound,i18n.__("Can not locate the userdata directory. Please set the value manually in the config.json or via the command line interface."));
			}else{
				err=ono(err,i18n.__("An unexpected error occured, while locating the userdata directory: %s",String(err)));
			}
			return callback(err);
		}
		if(!stats.isDirectory()){
			err=ono(Errors.userdataNotFound,i18n.__("The userdata directory is supposed to be a directory."));
		}
		callback(err);
	});
};

exports.getSteamUserIDs=function(callback){
	LOG.trace("Userdata.getSteamUserIDs");
	var userdataDir=GlobalConfiguration.userdataDir;
	Async.waterfall([
		function(callback){
			fs.readdir(userdataDir,callback);
		},
		function(files,callback){
			Async.filter(files,function(file,callback){
				fs.stat(path.join(userdataDir,file),function(err,stat){
					if(stat && stat.isDirectory()){
						return callback(true);
					}
					callback(false);
				});
			},function(results){
				var steamIDs=results.filter(function(steamID){
					return parseInt(steamID)===parseFloat(steamID) && !isNaN(+steamID);
				});
				LOG.debug("Userdata.getSteamUserIDs","SteamIDs:",steamIDs);
				callback(null,steamIDs);
			});
		}
	],callback);
};

var PERSONA_NAME_PATTERN=/"PersonaName"\s*"(.+)"/;

exports.getPersonaName=function(steamID,callback){
	LOG.trace("Userdata.getPersonaName");
	var userdataDir=GlobalConfiguration.userdataDir;
	var localConfigFile=path.join(userdataDir,steamID,"config","localconfig.vdf");
	fs.readFile(localConfigFile,"utf-8",function(err,localConfig){
		if(!err){
			var match=localConfig.match(PERSONA_NAME_PATTERN);
			if(match){
				return callback(null,match[1]);
			}
		}
		callback(ono(Errors.personaNameNotFound,i18n.__("Unable to find the persona name with the SteamID '%s'.",steamID)));
	});
};

exports.getSteamUsers=function(callback){
	LOG.trace("Userdata.getSteamUsers");
	Async.waterfall([
		function(callback){
			exports.getSteamUserIDs(callback);
		},
		function(steamIDs,callback){
			var steamUsers=[];
			Async.eachSeries(steamIDs,function(steamID,callback){
				exports.getPersonaName(steamID,function(err,personaName){
					if(err){
						LOG.error(err.toString());
					}
					var steamUser={id: steamID};
					if(personaName){
						steamUser.name=personaName;
					}
					steamUsers.push(steamUser);
					callback();
				});
			},function(err){
				LOG.debug("Userdata.getSteamUsers","SteamUsers",steamUsers);
				callback(err,steamUsers);
			});
		}
	],callback)
};

exports.readShortcuts=function(steamUser,callback){
	LOG.trace("Userdata.readShortcuts");
	var steamUserID=String(steamUser.id);
	var steamUserName=steamUser.name || steamUser.id;
	LOG.info(i18n.__("Reading from shortcuts.vdf of '%s'",steamUserName));
	var shortcutsFile=path.join(GlobalConfiguration.userdataDir,steamUserID,"config","shortcuts.vdf");
	fs.readFile(shortcutsFile,function(err,fileContent){
		if(err){
			if(err.code==="ENOENT"){
				return callback && callback(null,new ShortcutCollection());
			}
			return callback && callback(ono(Errors.readShortcutsFailed,i18n.__("An error occured while reading the shortcuts.vdf file of '%s'. Reason: %s",steamUserName,String(err))));
		}
		try{
			var shortcutCollection=Parser.parse(fileContent);
			callback && callback(null,shortcutCollection);
		}catch(e){
			callback && callback(ono(Errors.parseShortcutsFailed,i18n.__("An error occured while parsing the shortcuts.vdf file of '%s'. Reason: %s",steamUserName,String(err))));
		}
	});
};

exports.writeShortcuts=function(steamUser,shortcutCollection,callback){
	LOG.trace("Userdata.writeShortcuts");
	var steamUserID=String(steamUser.id);
	var steamUserName=steamUser.name || steamUser.id;
	LOG.info(i18n.__("Writing to shortcuts.vdf of '%s'",steamUserName));
	var shortcutsFile=path.join(GlobalConfiguration.userdataDir,steamUserID,"config","shortcuts.vdf");
	var builtShortcuts;
	try{
		builtShortcuts=Builder.build(shortcutCollection);
	}catch(e){
		return callback && callback(ono(Errors.buildShortcutsFailed,i18n.__("An error occured while building the shortcuts.vdf file of '%s'. Reason: %s",steamUserName,String(e))));
	}
	Async.series([
		function(callback){
			fs.writeFile(shortcutsFile,builtShortcuts,function(err){
				if(err){
					return callback(ono(Errors.writeShortcutsFailed,i18n.__("An error occured while writing the shortcuts.vdf file of '%s'. Reason: %s",steamUserName,String(err))));
				}
				callback();
			});
		},
		function(callback){
			var shortcuts=shortcutCollection.shortcuts;
			var gridDir=path.join(GlobalConfiguration.userdataDir,steamUserID,"config","grid");
			try{
				fs.ensureDirSync(gridDir);
			}catch(e){
				LOG.error(i18n.__("An error occured while installing the grid images. Reason: %s",String(e)));
				return callback();
			}
			Async.eachSeries(shortcuts,function(shortcut,callback){
				var grid=shortcut.grid;
				if(!grid){
					return callback();
				}
				fs.copy(grid,path.join(gridDir,shortcut.getAppID()+path.extname(grid)),function(err){
					if(err){
						LOG.error(i18n.__("An error occured while installing a grid image. Reason: %s",String(err)));
					}
					return callback();
				});
			},callback);
		}
	],callback);
};
