var Async=require("async");
var cheerio=require("cheerio");
var i18n=require("i18n");
var ono=require("ono");
var path=require("path");
var request=require("request");

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

  this.searchInput=path.parse(params.file).name;
  this.bodies={};
}

GameTDBPlugin.prototype=Object.create(AbstractPlugin.prototype);
GameTDBPlugin.prototype.constructor=GameTDBPlugin;

var TIME_BETWEEN_REQUESTS=1000;
var GAMETDB_URL="http://www.gametdb.com/";
var okToRequest=true;
var requestsInProgress={};

var getBody=function(searchInput,callback){
  var self=this;
  Async.whilst(function(){
    return requestsInProgress[searchInput];
  },function(callback){
    //wait until same request is done
    setTimeout(callback,10);
  },function(){
    if(self.bodies[searchInput]){
      return callback(null,self.bodies[searchInput]);
    }else if(self.bodies[searchInput]===null){
      return callback(i18n.__("No page on GameTDB found for %s",searchInput));
    }
    Async.whilst(function(){
      return !okToRequest;
    },function(callback){
      //wait some time till previous request is done, to prevent DDOSing
      setTimeout(callback,10);
    },function(){
      LOG.debug("GameTDBPlugin.search",GAMETDB_URL+self.platform+"/"+encodeURIComponent(searchInput));
      okToRequest=false;
      requestsInProgress[searchInput]=true;
      request(GAMETDB_URL+self.platform+"/"+encodeURIComponent(searchInput),function(err,response,body){
        setTimeout(function(){
          okToRequest=true;
        },TIME_BETWEEN_REQUESTS);
        if(!err){
          if(response.statusCode===404){
            err=i18n.__("No page on GameTDB found for %s",searchInput);
            self.bodies[searchInput]=null;
          }else{
            self.bodies[searchInput]=cheerio.load(body);
          }
        }
        requestsInProgress[searchInput]=false;
        callback(err,self.bodies[searchInput]);
      });
    });
  });
};

GameTDBPlugin.prototype.getAppname=function(params,callback){
  LOG.trace("GameTDBPlugin.getAppname");
  var self=this;
  Async.waterfall([
    function(callback){
      getBody.call(self,self.searchInput,callback);
    },
    function($,callback){
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
    }
  ],callback);
};

module.exports=GameTDBPlugin;
