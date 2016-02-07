var os=require("os");
var path=require("path");

var LOG=require("../Logger");
exports.locate=function(){
  LOG.trace("OSXUserdata.locate");
  var userdataDir=path.join(os.homedir(),"Library","Application Support","Steam","userdata");
  LOG.debug("OSXUserdata.locate",userdataDir);
  return userdataDir;
};
