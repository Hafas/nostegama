var i18n=require("i18n");
var path=require("path");

var AbstractPlugin=require("./AbstractPlugin");
var LOG=require("../lib/Logger");

function WindowsShortcutPlugin(params){
  LOG.trace("WindowsShortcutPlugin");
  params=params || {};
  this.exe=params.exe;
}

WindowsShortcutPlugin.prototype=Object.create(AbstractPlugin.prototype);
WindowsShortcutPlugin.prototype.constructor=WindowsShortcutPlugin;

WindowsShortcutPlugin.prototype.before=function(callback){
  var self=this;
  ws.query(this.exe,function(err,shortcut){
    self.shortcut=shortcut;
    callback(err);
  });
};

var VARIABLE_PATTERN=/%(.*?)%/g;
WindowsShortcutPlugin.prototype.getExe=function(params,callback){
  var exe=null;
  var target=this.shortcut.target.replace(VARIABLE_PATTERN,function(_,variable){
    return process.env[variable];
  });
  var args=this.shortcut.args.replace(VARIABLE_PATTERN,function(_,variable){
    return process.env[variable];
  });
  if(target || args){
    exe=('"'+target+'" '+args).trim();
  }
  callback(null,exe);
};

WindowsShortcutPlugin.prototype.getStartDir=function(params,callback){
  var StartDir=this.shortcut.workingDir;
  callback(null,StartDir)
};

WindowsShortcutPlugin.prototype.getIcon=function(params,callback){
  var icon=this.shortcut.icon.replace(VARIABLE_PATTERN,function(_,variable){
    return process.env[variable];
  });
  var extension=path.extname(icon).toLowerCase();
  if(!(!extension || extension===".exe" || extension===".png" || extension===".tga")){
    //TODO make copy of icon and change extension to .tga
    LOG.warn(i18n.__("The extension of the icon '%s' is not exe/png/tga. Steam only supports these extension for icons.",icon));
  }
  callback(null,icon);
};

try{
  var ws=require("windows-shortcuts");
}catch(e){
  LOG.error(e);
}
if(!ws){
  WindowsShortcutPlugin.prototype.before=null;
  WindowsShortcutPlugin.prototype.getExe=null;
  WindowsShortcutPlugin.prototype.getStartDir=null;
  WindowsShortcutPlugin.prototype.getIcon=null;
}

module.exports=WindowsShortcutPlugin;
