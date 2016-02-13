var glob=require("glob");
var i18n=require("i18n");
var ono=require("ono");
var path=require("path");

var AbstractPlugin=require("./AbstractPlugin");
var LOG=require("../lib/Logger");

var LocalGridPlugin=function LocalGridPlugin(params){
  LOG.trace("LocalGridPlugin");
  params=params || {};
  var profile=params.profile || {};
  this.gridDir=null;
  var gridDir=profile.gridDir?String(profile.gridDir):null;
  if(gridDir){
    this.gridDir=path.resolve(params.cwd,gridDir);
  }
  this.file=params.file;
  this.exe=params.exe;
};

LocalGridPlugin.prototype=Object.create(AbstractPlugin.prototype);
LocalGridPlugin.prototype.constructor=LocalGridPlugin;

LocalGridPlugin.prototype.before=function(callback){
  if(!this.gridDir){
    return callback && callback(ono(i18n.__("No default grid directory provided!")));
  }
  callback && callback();
};

LocalGridPlugin.prototype.getGrid=function(params,callback){
  var fileName;
  if((typeof this.file)==="string"){
    fileName=path.parse(this.file).name;
  }else if((typeof this.exe)==="string"){
    fileName=path.parse(this.exe).name;
  }
  if(!fileName){
    return callback();
  }
  var pattern=path.join(this.gridDir,"**",fileName+".@(png|jpg|jpeg|tiff)");
  LOG.debug("LocalGridPlugin.getGrid","pattern",pattern);
  glob(pattern,function(err,files){
    if(err){
      return callback && callback(err);
    }
    var file=null;
    if(files.length>0){
      file=path.resolve(files[0]);
    }
    return callback && callback(null,file);
  });
};

module.exports=LocalGridPlugin;
