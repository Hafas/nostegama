var i18n=require("i18n");
var ono=require("ono");
var path=require("path");

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
  this.useInputMethodsAsTag=!!pluginData.useInputMethodsAsTag;

  this.file=params.file;
  this.exe=params.exe;
};

DolphinPlugin.prototype=Object.create(AbstractPlugin.prototype);
DolphinPlugin.prototype.constructor=DolphinPlugin;

var QUEUE_NAME="dolphin-wiki";

var WIKI_URL="https://wiki.dolphin-emu.org/index.php?title=";
DolphinPlugin.prototype.before=function(callback){
  var searchInput;
  try{
    searchInput=path.parse(this.file).name;
  }catch(e){
    return callback && callback(e);
  }
  var self=this;
  var searchUrl=WIKI_URL+encodeURIComponent(searchInput);
  LOG.debug("DolphinPlugin.before","searchUrl",searchUrl);
  this.sendRequest(QUEUE_NAME,searchUrl,function(err,response,body){
    if(err){
      return callback && callback(err);
    }
    LOG.debug("DolphinPlugin.before","statusCode",response.statusCode);
    if(response.statusCode===404){
      LOG.error(i18n.__("No page on Dolphin's Wiki found for %s",searchInput));
      self.getAppname=null;
      self.getTags=null;
      //Don't return error or else functions not depending on this wiki (like the exe in this case) won't get executed
      return callback && callback();
    }
    self.wikiBody=cheerio.load(body);
    callback && callback();
  });
};

DolphinPlugin.prototype.getAppname=function(params,callback){
  var $=this.wikiBody;
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
        || (previousContent==="Input methods" && self.useInputMethodsAsTag)){
      tags=tags.concat(content.split(SPLIT_PATTERN));
    }
    previousContent=content;
  });
  if(tags.length===0){
    tags=null;
  }
  return callback && callback(null,tags);
};

//optional dependencies
try{
  var cheerio=require("cheerio");
  var request=require("request");
}catch(e){
  LOG.error(e);
}

if(!cheerio || !request){
  DolphinPlugin.prototype.before=null;
  DolphinPlugin.prototype.getAppname=null;
  DolphinPlugin.prototype.getTags=null;
}

module.exports=DolphinPlugin;
