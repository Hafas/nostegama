var os=require("os");
var path=require("path");

var LOG=require("../Logger");

exports.locate=function(){
  LOG.trace("LinuxUserdata.locate");
  var userdataDir=path.join(os.homedir(),".local","share","Steam","userdata");
  LOG.debug("LinuxUserdata.locate",userdataDir);
  return userdataDir;
};
