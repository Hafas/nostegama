var cheerio=require("cheerio");
var deasync=require("deasync");
var i18n=require("i18n");
var path=require("path");
var request=require("request");

var LOG=require("../lib/Logger");

var DolphinPlugin=function DolphinPlugin(params){
	LOG.trace("DolphinPlugin");
	params=params || {};
	var profile=params.profile || {};
	var pluginData=profile.dolphin || {};
	this.useDeveloperAsTag=!!pluginData.useDeveloperAsTag;
	this.usePublisherAsTag=!!pluginData.usePublisherAsTag;
	this.useSeriesAsTag=!!pluginData.useSeriesAsTag;
	this.useGenresAsTag=!!pluginData.useGenresAsTag;
	this.useModesAsTag=!!pluginData.useModesAsTag;
	this.useInputMethodAsTag=!!pluginData.useInputMethodAsTag;

	this.wikiBody=fetchWikiBody.call(this,path.parse(params.file).name);
	//if command isn't explicitly set, set the command. The DefaultPlugin will handle the rest
	if(!profile.command){
		profile.command="$e --batch --exec=$f";
	}
};

var WIKI_URL="https://wiki.dolphin-emu.org/index.php?search=";
var fetchWikiBody=function(searchInput){
	var wikiBody=undefined;
	var error=null;
	var done=false;

	var self=this;

	request(WIKI_URL+encodeURIComponent(searchInput),function(err,response,body){
		if(err){
			error=err;
			done=true;
			return;
		}
		if(response.request.uri.query.indexOf("title=")===0){
			wikiBody=cheerio.load(body);
		}else{
			LOG.debug(i18n.__("No page on Dolphin's Wiki found for %s",searchInput));
		}
		done=true;
	});

	while(!done){
		deasync.runLoopOnce();
	}
	if(error){
		throw error;
	}
	return wikiBody;
};

DolphinPlugin.prototype.getAppname=function(params,callback){
	var $=this.wikiBody;
	if(!$){
		return callback && callback();
	}
	var appname=null;
	var title=$("#firstHeading");
	if(title.length>0){
		appname=title.text();
	}
	return callback && callback(null,appname);
};
// adf
var SPLIT_PATTERN=/\s*,\s*/;
DolphinPlugin.prototype.getTags=function(params,callback){
	var $=this.wikiBody;
	if(!$){
		return callback && callback();
	}
	var self=this;
	var tags=[];
	var infoBoxEntries=$(".infobox.vevent td");
	var previousContent;
	infoBoxEntries.each(function(index,element){
		var content=$(this).text().trim();
		if((previousContent==="Developer(s)" && self.useDeveloperAsTag)
				|| (previousContent==="Publisher(s)" && self.usePublisherAsTag)
				|| (previousContent==="Series" && self.useSeriesAsTag)
				|| (previousContent==="Genre(s)" && self.useGenresAsTag)
				|| (previousContent==="Mode(s)" && self.useModesAsTag)
				|| (previousContent==="Input methods" && self.useInputMethodAsTag)){
			tags=tags.concat(content.split(SPLIT_PATTERN));
		}
		previousContent=content;
	});
	if(tags.length===0){
		tags=null;
	}
	return callback && callback(null,tags);
}

module.exports=DolphinPlugin;
