var cheerio=require("cheerio");
var i18n=require("i18n");
var ono=require("ono");
var path=require("path");
var request=require("request");

var AbstractPlugin=require("./AbstractPlugin");
var DefaultPlugin=require("./DefaultPlugin");
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

  this.file=params.file;
  this.exe=profile.exe;
};

DolphinPlugin.prototype=Object.create(AbstractPlugin.prototype);
DolphinPlugin.prototype.constructor=DolphinPlugin;

var WIKI_URL="https://wiki.dolphin-emu.org/index.php?title=";
DolphinPlugin.prototype.before=function(callback){
  var searchInput;
  try{
    searchInput=path.parse(this.file).name;
  }catch(e){
    return callback && callback(e);
  }
  var self=this;
  request(WIKI_URL+encodeURIComponent(searchInput),function(err,response,body){
    if(err){
      return callback && callback(err);
    }
    LOG.debug("DolphinPlugin.before","statusCode",response.statusCode);
    if(response.statusCode===404){
      LOG.error(i18n.__("No page on Dolphin's Wiki found for %s",searchInput));
      //Don't return error or else functions not depending on this wiki (like the exe in this case) won't get executed
      return callback && callback();
    }
    self.wikiBody=cheerio.load(body);
    callback && callback();
  });
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

DolphinPlugin.prototype.getExe=function(params,callback){
  DefaultPlugin.prototype.getExe.call({exe: this.exe, file: this.file, command: "$e --batch --exec=$f"},{},callback);
};

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
};

module.exports=DolphinPlugin;
