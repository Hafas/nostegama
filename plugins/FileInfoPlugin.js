var AbstractPlugin=require("./AbstractPlugin");
var LOG=require("../lib/Logger");

function FileInfoPlugin(params){
  LOG.trace("FileInfoPlugin");
  params=params || {};
  this.exe=params.exe;
}

FileInfoPlugin.prototype=Object.create(AbstractPlugin.prototype);
FileInfoPlugin.prototype.constrcutor=FileInfoPlugin;

FileInfoPlugin.prototype.getAppname=function(params,callback){
  var GetVersionInfo=edge.func(function(){
    /*
    async (input) => {
      using System.Diagnostics;
      return FileVersionInfo.GetVersionInfo(input.ToString());
    }
    */
  });
  GetVersionInfo(this.exe,function(err,result){
    var appname=null;
    if(result){
      appname=result.ProductName || result.FileDescription || null;
    }
    return callback(err,appname)
  });
};

try{
  var edge=require("edge");
}catch(e){
  LOG.error(e);
}

if(!edge){
  FileInfoPlugin.prototype.getAppname=null;
}

module.exports=FileInfoPlugin;
