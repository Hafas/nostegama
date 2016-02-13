var Async=require("async");
var i18n=require("i18n");
var ono=require("ono");
var path=require("path");

var AbstractPlugin=require("./AbstractPlugin");
var LOG=require("../lib/Logger");

var DEFAULT_LANGUAGE="EN";
function GameTDBPlugin(params){
  LOG.trace("GameTDBPlugin");
  params=params || {};
  var profile=params.profile || {};
  var pluginData=profile.gameTDB || {};
  this.platform=null;
  if((typeof pluginData.platform)==="string"){
    switch(pluginData.platform.toLowerCase()){
      case "wiiu":
      case "wii u":{
        this.platform="WiiU";
        break;
      }
      case "wii":
      case "gc":
      case "gamecube":{
        this.platform="Wii";
        break;
      }
      case "ps3":
      case "ps 3":
      case "playstation3":
      case "playstation 3":{
        this.platform="PS3";
        break;
      }
    }
  }
  this.language=DEFAULT_LANGUAGE;
  if((typeof pluginData.language)==="string"){
    this.language=pluginData.language.toUpperCase();
  }
  this.exe=params.exe;
  this.file=params.file;
}

GameTDBPlugin.prototype=Object.create(AbstractPlugin.prototype);
GameTDBPlugin.prototype.constructor=GameTDBPlugin;

//to prevent DDOSing
var TIME_BETWEEN_REQUESTS=1000;
var GAMETDB_URL="http://www.gametdb.com/";
var okToRequest=true;

GameTDBPlugin.prototype.before=function(callback){
  var searchInput;
  if((typeof this.file)==="string"){
    searchInput=path.parse(this.file).name;
  }else{
    return callback(ono(i18n.__("No file provided.")));
  }
  var self=this;
  Async.whilst(function(){
    return !okToRequest;
  },function(callback){
    setTimeout(callback,10);
  },function(){
    okToRequest=false;
    var searchUrl=GAMETDB_URL+self.platform+"/"+encodeURIComponent(searchInput);
    LOG.debug("GameTDBPlugin.before","searchUrl",searchUrl);
    request(searchUrl,function(err,response,body){
      setTimeout(function(){
        okToRequest=true;
      },TIME_BETWEEN_REQUESTS);
      if(err){
        return callback(err);
      }
      LOG.debug("GameTDBPlugin.before","statusCode",response.statusCode);
      if(response.statusCode===404){
        return callback(ono(i18n.__("No page on GameTDB found for %s",searchInput)));
      }
      self.body=cheerio.load(body);
      callback();
    });
  })
};

GameTDBPlugin.prototype.getAppname=function(params,callback){
  LOG.trace("GameTDBPlugin.getAppname");
  var self=this;
  var $=this.body;
  var appname=null;
  var defaultAppname=null;
  var tableEntries=$("#wikitext table.DQedit td");
  var previousContent;
  tableEntries.each(function(index,element){
    var content=$(this).text().trim();
    if(previousContent==="title ("+self.language+")"){
      appname=content;
      return false;
    }
    if(previousContent==="title ("+DEFAULT_LANGUAGE+")"){
      defaultAppname=content;
    }
    previousContent=content;
  });
  LOG.debug("GameTDBPlugin.getAppname","appname",appname || defaultAppname);
  callback(null,appname || defaultAppname);
};

//optional dependencies
try{
  var cheerio=require("cheerio");
  var request=require("request");
}catch(e){
  LOG.error(e);
}

if(!cheerio || !request){
  GameTDBPlugin.prototype.before=null;
  GameTDBPlugin.prototype.getAppname=null;
}

module.exports=GameTDBPlugin;
