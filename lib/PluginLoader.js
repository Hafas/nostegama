var i18n=require("i18n");

var LOG=require("./Logger");

exports.load=function(pluginNames,params){
	var plugins=[];
	if(Array.isArray(pluginNames)){
		for(var i=0;i<pluginNames.length;++i){
			plugins=plugins.concat(exports.load(pluginNames[i],params));
		}
	}else if((typeof pluginNames)==="string"){
		var pluginName=pluginNames;
		try{
			var Plugin=require("../plugins/"+pluginName);
			plugins.push(new Plugin(params));
		}catch(e){
			LOG.error(i18n.__("Failed to load or intantiate plugin '%s'. Reason: %s",pluginName,String(e)));
		}
	}
	return plugins;
};
