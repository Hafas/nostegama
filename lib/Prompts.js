var i18n=require("i18n");
var prompt=require("prompt");

var LOG=require("./Logger");

exports.chooseSteamUsers=function(steamUsers,callback){
	console.log(i18n.__("Multiple Steam users found. Select which user's library you want to modify (separated by comma) or enter 'A' to apply changes to all users. Press CTRL+C to cancel."));
	console.log("[A]\tALL");
	var validValues=["a","A"];
	for(var i=0;i<steamUsers.length;++i){
		console.log("[%d]\t%s",i,steamUsers[i].name || steamUsers[i].id);
		validValues.push(i);
	}
	var joinedValues=validValues.join("|");
	var regexp=new RegExp("^((?:\\s*(?:"+joinedValues+")\\s*,)*\\s*(?:"+joinedValues+")\\s*)$");
	prompt.start();
	prompt.get({
		properties: {
			index: {
				pattern: regexp,
				type: "string",
				required: true
			}
		}
	},function(err,result){
		if(err){
			return callback(err);
		}
		result=result.index.replace(/\s/g,"").split(",");
		var filteredSteamUsers=[];
		//remember added indexes to avoid duplicates (e.g. when the user inputs "0,1,1,1,0" for whatever reason).
		var filtered={};
		for(var i=0;i<result.length;++i){
			var index=result[i];
			if(index==="a" || index==="A"){
				return callback(null,steamUsers);
			}
			//check if index has already been process. Ignore if this is the case.
			if(filtered[index]===true){
				continue;
			}
			filteredSteamUsers.push(steamUsers[index]);
			//remember this index
			filtered[index]=true;
		}
		callback(null,filteredSteamUsers);
	});
};
