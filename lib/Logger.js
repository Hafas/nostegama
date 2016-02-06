var format=require("util").format;
var fs=require("fs-extra");
var i18n=require("i18n");
var json=require("comment-json");
var log4js=require("log4js");
var path=require("path");

var GlobalConfiguration=require("./GlobalConfiguration");

var log4jsJSON={
	"appenders": [{
		"category": "console",
		"type": "console",
		"layout": {
			"type": "pattern",
			"pattern": "%[[%p]%]\t%m"
		}
	}],
	"levels": {
		"console": "INFO"
	}
};

var doLog=null;
try{
	log4jsJSON=fs.readFileSync(path.join(__dirname,"..","log4js.json"));
	log4jsJSON=json.parse(log4jsJSON,null,true);
}catch(e){
	console.error(i18n.__("Failed to load log4js.json. Reason: %s",String(e)));
	doLog=function(level,arguments){
		log4js.getLogger("console")[level](format.apply(format,arguments));
	};
}

if(log4jsJSON && Array.isArray(log4jsJSON.appenders)){
	for(var i=0;i<log4jsJSON.appenders.length;++i){
		var appender=log4jsJSON.appenders[i];
		if((typeof appender.filename)==="string"){
			appender.filename=path.resolve(GlobalConfiguration.logDir,appender.filename);
		}
	}
}

log4js.configure(log4jsJSON);


doLog=doLog || function(level,arguments){
	var formatted=null;
	for(var i=0;i<GlobalConfiguration.logAppenders.length;++i){
		formatted=formatted || format.apply(format,arguments);
		var appender=GlobalConfiguration.logAppenders[i];
		log4js.getLogger(appender)[level](formatted);
	}
}

exports.trace=function(){
  doLog("trace",arguments);
};

exports.debug=function(){
  doLog("debug",arguments);
};

exports.info=function(){
  doLog("info",arguments);
};

exports.warn=function(){
  doLog("warn",arguments);
};

exports.error=function(){
  doLog("error",arguments);
};

exports.fatal=function(){
  doLog("fatal",arguments);
};
