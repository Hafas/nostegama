var path=require("path");

var AbstractPlugin=require("./AbstractPlugin");
var LOG=require("../lib/Logger");

var DefaultPlugin=function DefaultPlugin(params){
  LOG.trace("DefaultPlugin");
  params=params || {};
  var profile=params.profile || {};
  this.command=profile.command || "$e $f";
  this.defaultGrid=null;
  var defaultGrid=profile.defaultGrid?String(profile.defaultGrid):null;
  if(defaultGrid){
    this.defaultGrid=path.resolve(params.cwd,defaultGrid);
  }
  this.exe=params.exe;
  this.file=params.file;
};

DefaultPlugin.prototype=Object.create(AbstractPlugin.prototype);
DefaultPlugin.prototype.constructor=DefaultPlugin;

DefaultPlugin.prototype.getAppname=function(params,callback){
  LOG.trace("DefaultPlugin.getAppname");
  file=this.file || this.exe;
  var appname;
  try{
    var extension=path.extname(file);
    appname=path.basename(file,extension);
  }catch(e){
    return callback(e);
  }
  callback(null,appname);
};

DefaultPlugin.prototype.getExe=function(params,callback){
  LOG.trace("DefaultPlugin.getExe");
  var exe=this.exe || undefined;
  file=this.file || undefined;
  var command=this.command;
  try{
    if(exe){
      command=command.replace("$e",'"'+exe+'"');
    }else{
      command=command.replace("$e","");
    }
    if(file){
      command=command.replace("$f",'"'+file+'"');
    }else{
      command=command.replace("$f","");
    }
  }catch(e){
    return callback(e);
  }
  callback(null,command);
};

DefaultPlugin.prototype.getStartDir=function(params,callback){
  LOG.trace("DefaultPlugin.getStartDir");
  var startDir="";
  if(this.exe){
    try{
      startDir='"'+path.dirname(this.exe)+'"';
    }catch(e){
      return callback(e);
    }
  }
  callback(null,startDir);
};

// DefaultPlugin.prototype.getIcon=function(params,callback){
//   LOG.trace("DefaultPlugin.getIcon");
//   callback(null,null);
// };
//
// DefaultPlugin.prototype.getShortcutPath=function(params,callback){
//   LOG.trace("DefaultPlugin.getShortcutPath");
//   callback(null,null);
// };
//
// DefaultPlugin.prototype.getTags=function(params,callback){
//   LOG.trace("DefaultPlugin.getTags");
//   callback(null,null);
// };

DefaultPlugin.prototype.getGrid=function(params,callback){
  LOG.trace("DefaultPlugin.getGrid");
  callback(null,this.defaultGrid);
};

module.exports=DefaultPlugin;
