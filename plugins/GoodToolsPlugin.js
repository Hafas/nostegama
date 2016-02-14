var path=require("path");

var AbstractPlugin=require("./AbstractPlugin");
var LOG=require("../lib/Logger");

function GoodToolsPlugin(params){
  LOG.trace("GoodToolsPlugin");
  this.file=params.file;
};

GoodToolsPlugin.prototype=Object.create(AbstractPlugin.prototype);
GoodToolsPlugin.prototype.constrcutor=GoodToolsPlugin;

var TAG_PATTERN=/\(.*?\)|\[.*?\]/g
GoodToolsPlugin.prototype.getAppname=function(params,callback){
  var appname=null;
  if((typeof this.file)==="string"){
    var filename=path.parse(this.file).name;
    appname=filename.replace(TAG_PATTERN,"").trim();
  }
  callback(null,appname);
};

module.exports=GoodToolsPlugin;
