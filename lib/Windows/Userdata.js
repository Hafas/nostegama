var deasync=require("deasync");
var path=require("path");
var Winreg=require("winreg");

var LOG=require("../Logger");

var regKey=new Winreg({
	hive: Winreg.HKCU,
	key: "\\Software\\Valve\\Steam"
});

exports.locate=function(){
	LOG.trace("WindowsUserdata.locate");
	var userdataDir=undefined;
	regKey.values(function(err,items){
		if(err){
			LOG.error("WindowsUserdata.locate",err);
			userdataDir=null;
			return;
		}
		for(var i=0;i<items.length;++i){
			if(items[i].name==="SteamPath"){
				userdataDir=items[i].value || null;
				return;
			}
		}
		userdataDir=null;
	});
	while(userdataDir===undefined){
		deasync.runLoopOnce();
	}
	if(userdataDir){
		userdataDir=path.join(userdataDir,"userdata");
	}
	return userdataDir;
};
