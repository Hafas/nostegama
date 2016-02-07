var i18n=require("i18n");

var DefaultPlugin=require("./DefaultPlugin");
var LOG=require("./Logger");

var findAndInstantiatePlugin=function(pluginName,params){
	var plugin=null;
	try{
		var Plugin=require("../plugins/"+pluginName);
		plugin=new Plugin(params);
	}catch(e){
		LOG.error(i18n.__("Failed to load or intantiate plugin '%s'. Reason: %s",pluginName,String(e)));
	}
	return plugin;
};

var PLUGIN_OPTIONS={
	appname: true,
	exe: true,
	StartDir: true,
	icon: true,
	ShortcutPath: true,
	tags: true,
	grid: true
};

exports.load=function(pluginNames,params){
	LOG.trace("PluginLoader.load");
	var plugins=[];

	if(Array.isArray(pluginNames)){
		for(var i=0;i<pluginNames.length;++i){
			plugins=plugins.concat(exports.load(pluginNames[i],params));
		}
	}else if((typeof pluginNames)==="string"){
		var pluginName=pluginNames;
		var plugin=findAndInstantiatePlugin(pluginName,params);
		if(plugin){
			plugins.push({plugin: plugin, options: JSON.parse(JSON.stringify(PLUGIN_OPTIONS))});
		}
	}else if(pluginNames){
		var pluginOptions=JSON.parse(JSON.stringify(pluginNames));
		var pluginName=pluginOptions.name;
		delete pluginOptions.name;
		var plugin=findAndInstantiatePlugin(pluginName,params);
		if(plugin){
			plugins.push({plugin: plugin, options: pluginOptions});
		}
	}
	return plugins;
};

exports.getDefault=function(params){
	LOG.trace("PluginLoader.getDefault");
	return {
		plugin: new DefaultPlugin(params),
		options: JSON.parse(JSON.stringify(PLUGIN_OPTIONS))
	};
};
