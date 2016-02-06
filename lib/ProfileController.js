var Async=require("async");
var fs=require("fs-extra");
var glob=require("glob");
var i18n=require("i18n");
var json=require("comment-json");
var ono=require("ono");
var path=require("path");

var DefaultPlugin=require("./DefaultPlugin");
var Errors=require("./Errors");
var LOG=require("./Logger");
var NonSteamGame=require("./NonSteamGame");
var PluginLoader=require("./PluginLoader");
var ProfileCollection=require("./ProfileCollection");
var ShortcutCollection=require("node-steam-shortcuts").ShortcutCollection;

exports.read=function(profileFile,callback){
	fs.readFile(profileFile,"utf-8",function(err,profileDefinitions){
		if(err){
			return callback(ono(Errors.readProfileFileFailed,i18n.__("Failed to read the profile file '%s'. Reason: %s",profileFile,String(err))));
		}
		try{
			profileDefinitions=json.parse(profileDefinitions,null,true);
		}catch(e){
			return callback(ono(Errors.parseProfileFileFailed,i18n.__("Failed to parse the profile file '%s'. Reason: %s",profileFile,String(e))));
		}
		var cwd=path.dirname(profileFile);
		for(var profileName in profileDefinitions){
			if(!profileDefinitions.hasOwnProperty(profileName)){
				continue;
			}
			var profileDefinition=profileDefinitions[profileName];
			if(profileDefinition && profileDefinition.exe){
				profileDefinition.exe=path.resolve(cwd,profileDefinition.exe);
			}
		}
		var profileCollection=new ProfileCollection({profiles: profileDefinitions, cwd: cwd});
		callback(null,profileCollection);
	});
};

var findNonSteamGameProperty=function(params,callback){
	var file=params.file;
	var getterName=params.getterName;
	var plugin=params.plugin;
	var propertyName=params.propertyName;
	var nonSteamGame=params.nonSteamGame;

	var property=nonSteamGame[propertyName];
	var propertyIsArray=Array.isArray(property);
	if((propertyIsArray && property.length>0) || (!propertyIsArray && property)){
		return callback(null,property);
	}
	if((typeof plugin[getterName])!=="function"){
		LOG.debug(i18n.__("Plugin '%s' hasn't implemented method '%s'",plugin.constructor.name,getterName));
		return callback();
	}
	plugin[getterName]({nonSteamGame: nonSteamGame},function(err,result){
		if(err){
			LOG.error(i18n.__("Plugin '%s' returned an error while attempting to get the %s for '%s': '%s'",plugin.constructor.name,propertyName,file,String(err)));
			return callback();
		}
		callback(null,result);
	});
};

var buildNonSteamGameTask=function(file,profile,cwd){
	return function(callback){
		LOG.info(i18n.__("Processing file '%s' ...",file));
		var profileAsJSON=profile.toJSON();
		var pluginParams={profile: profileAsJSON, file: file, cwd: cwd};
		var plugins=PluginLoader.load(profileAsJSON.plugins,pluginParams);
		plugins.push(new DefaultPlugin(pluginParams));
		var extras=profile.extra;
		var extra={};
		for(var filename in extras){
			if(extras.hasOwnProperty(filename) && file.endsWith(filename)){
				extra=extras[filename];
				break;
			}
		}
		var nonSteamGame=new NonSteamGame(extra);
		Async.eachSeries(plugins,function(plugin,callback){
			var nonSteamGameAsJSON=nonSteamGame.toJSON();
			Async.parallel({
				appname: function(callback){
					findNonSteamGameProperty({
						nonSteamGame: nonSteamGameAsJSON,
						file: file,
						getterName: "getAppname",
						plugin: plugin,
						propertyName: "appname"
					},callback);
				},
				exe: function(callback){
					findNonSteamGameProperty({
						nonSteamGame: nonSteamGameAsJSON,
						file: file,
						getterName: "getExe",
						plugin: plugin,
						propertyName: "exe"
					},callback);
				},
				StartDir: function(callback){
					findNonSteamGameProperty({
						nonSteamGame: nonSteamGameAsJSON,
						file: file,
						getterName: "getStartDir",
						plugin: plugin,
						propertyName: "StartDir"
					},callback);
				},
				icon: function(callback){
					findNonSteamGameProperty({
						nonSteamGame: nonSteamGameAsJSON,
						file: file,
						getterName: "getIcon",
						plugin: plugin,
						propertyName: "icon"
					},callback);
				},
				ShortcutPath: function(callback){
					findNonSteamGameProperty({
						nonSteamGame: nonSteamGameAsJSON,
						file: file,
						getterName: "getShortcutPath",
						plugin: plugin,
						propertyName: "ShortcutPath"
					},callback);
				},
				tags: function(callback){
					findNonSteamGameProperty({
						nonSteamGame: nonSteamGameAsJSON,
						file: file,
						getterName: "getTags",
						plugin: plugin,
						propertyName: "tags"
					},callback);
				},
				grid: function(callback){
					findNonSteamGameProperty({
						nonSteamGame: nonSteamGameAsJSON,
						file: file,
						getterName: "getGrid",
						plugin: plugin,
						propertyName: "grid"
					},callback);
				}
			},function(err,results){
				for(var property in results){
					if(results.hasOwnProperty(property)){
						nonSteamGame[property]=results[property];
					}
				}
				callback();
			});
		},function(err){
			nonSteamGame.addTags(profile.tags);
			LOG.debug("ProfileController.buildNonSteamGameTask",nonSteamGame.toJSON());
			callback(null,nonSteamGame);
		});
	};
};

var gatherNonSteamGamesTask=function(profile,cwd,name){
	return function(callback){
		var pattern=profile.glob;
		if((typeof pattern)==="string"){
			pattern=path.resolve(cwd,pattern);
			glob(pattern,{ignore: profile.ignore},function(err,files){
				if(err){
					LOG.error(i18n.__("An error occured while searching for Non-Steam Games in profile '%s': %s",name,String(err)));
				}
				if(!files){
					return callback(null,[]);
				}
				var tasks=[];
				for(var i=0;i<files.length;++i){
					tasks.push(buildNonSteamGameTask(path.resolve(files[i]),profile,cwd));
				}
				Async.parallel(tasks,function(err,results){
					callback(null,results);
				});
			});
		}else{
			//TODO simple profile
			callback(null,[]);
		}
	};
};

exports.gatherNonSteamGames=function(profileCollection,callback){
	LOG.trace("ProfileController.gatherNonSteamGames");
	var profiles=profileCollection.profiles;
	var tasks=[];
	for(var profileName in profiles){
		if(profiles.hasOwnProperty(profileName)){
			tasks.push(gatherNonSteamGamesTask(profiles[profileName],profiles.cwd,profileName));
		}
	}
	Async.parallel(tasks,function(err,results){
		var shortcutCollection=new ShortcutCollection();
		for(var i=0;i<results.length;++i){
			shortcutCollection.addShortcuts(results[i]);
		}
		callback(null,shortcutCollection);
	});
};