var path=require("path");
var spawn=require("child_process").spawn;

var AbstractPlugin=require("./AbstractPlugin");
var LOG=require("../lib/Logger");

function MAMEPlugin(params){
  LOG.trace("MAMEPlugin");
  params=params || {};
  var profile=params.profile || {};
  var pluginData=profile.MAME || {};
  this.keepBrackets=!!pluginData.keepBrackets;
  this.exe=pluginData.exe || params.exe;
  this.file=params.file;
};

MAMEPlugin.prototype=Object.create(AbstractPlugin.prototype);
MAMEPlugin.prototype.constructor=MAMEPlugin;

var BRACKET_PATTERN=/\s*\(.*?\)\s*/g
MAMEPlugin.prototype.getAppname=function(params,callback){
  LOG.trace("MAMEPlugin.getAppname");
  if((typeof this.file)!=="string"){
    return callback();
  }
  var self=this;
  var filename=path.parse(this.file).name;
  var mame=spawn(this.exe,["-ll",filename]);
  var out=[];
  var err=[];
  mame.stdout.on("data",function(data){
    LOG.debug("MAMEPlugin.getAppname","stdout.on.data",String(data));
    out.push(data);
  });
  mame.stderr.on("data",function(data){
    LOG.debug("MAMEPlugin.getAppname","stderr.on.data",String(data));
    err.push(data);
  });
  mame.on("close",function(code){
    LOG.debug("MAMEPlugin.getAppname","on.close",code);
    if(code!==0 && err.length>0){
      return callback(err.join());
    }
    var pattern=new RegExp(filename+'\\s*"(.*)"');
    out=out.join("");
    var appname=null;
    var match=pattern.exec(out);
    if(match){
      appname=match[1];
      if(!self.keepBrackets){
        appname=appname.replace(BRACKET_PATTERN,"");
      }
    }
    return callback(null,appname);
  });
};

module.exports=MAMEPlugin;
