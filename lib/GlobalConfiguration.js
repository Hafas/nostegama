var fs=require("fs-extra");
var json=require("comment-json");
var os=require("os");
var path=require("path");
var i18n=require("i18n");
i18n.configure({
	locales: ["en","de"],
	directory: path.join(__dirname,"..","locales")
});

var TMP_SUB_DIR="nostegma";
var CONFIG_PATH=path.join(__dirname,"..","config.json");

var GlobalConfiguration={};

GlobalConfiguration.input=path.join(__dirname,"..","profile.json");
GlobalConfiguration.backupShortcuts=true;
GlobalConfiguration.backupGrids=true;
GlobalConfiguration.backupDir=path.join(os.tmpdir(),TMP_SUB_DIR,"backups");
GlobalConfiguration.logAppenders=["console","nostegma"];
GlobalConfiguration.logDir=path.join(os.tmpdir(),TMP_SUB_DIR,"logs");

//override defaults with config.json-data
var configJSON=null;
try{
	configString=fs.readFileSync(CONFIG_PATH);
	configJSON=json.parse(configString);
}catch(e){
	console.warn(i18n.__("Failed to open config.json. Nostegma will continue to operate with default settings. Reason: %s",String(e)));
	// "Failed to open config.json. Application will continue to operate with default and cli settings."
}
if(configJSON){
	if(configJSON.backup){
		if((typeof configJSON.backup.shortcuts)==="boolean"){
			GlobalConfiguration.backupShortcuts=configJSON.backup.shortcuts;
		}
		if((typeof configJSON.backup.grids)==="boolean"){
			GlobalConfiguration.backupGrids=configJSON.backup.grids;
		}
		if((typeof configJSON.backup.dir)==="string"){
			GlobalConfiguration.backupDir=configJSON.backup.dir;
		}
	}
	if(configJSON.log){
		if((typeof configJSON.log.appenders)==="string"){
			GlobalConfiguration.logAppenders=[configJSON.log.appenders];
		}else if(Array.isArray(configJSON.log.appenders)){
			GlobalConfiguration.logAppenders=configJSON.log.appenders;
		}
		if((typeof configJSON.log.dir)==="string"){
			GlobalConfiguration.logDir=configJSON.log.dir;
		}
	}
}

//override with cli
var cli=require("cli");
var options=cli.parse({
	"userdata-dir": [false,i18n.__("The userdata directory of Steam. This option is only necessary if Nostegma is not able to locate the directory by itself."),"directory",null],
	"input": ["i",i18n.__("The JSON-file Nostegma shall process"),"file",null],
	"no-backup": [false,i18n.__("Turns off all backups"),"false",null],
	"backup-dir": [false,i18n.__("Where to store backups"),"directory",null],
	"log-dir": [false,i18n.__("Where to store log files"),"directory",null]
});

if(options["input"]){
	GlobalConfiguration.input=options["input"];
}
if(options["no-backup"]===false){
	GlobalConfiguration.backupShortcuts=false;
	GlobalConfiguration.backupGrids=false;
}
if(options["backup-dir"]){
	GlobalConfiguration.backupDir=options["backup-dir"];
}
if(options["log-dir"]){
	GlobalConfiguration.logDir=options["log-dir"];
}

fs.ensureDirSync(GlobalConfiguration.backupDir);
fs.ensureDirSync(GlobalConfiguration.logDir);

module.exports=GlobalConfiguration;

GlobalConfiguration.userdataDir=require("./Userdata").locate();
if(configJSON){
	if(configJSON.steam){
		if((typeof configJSON.steam.userdataDir)==="string"){
			GlobalConfiguration.userdataDir=configJSON.steam.userdataDir;
		}
	}
}
if(options["userdata-dir"]){
	GlobalConfiguration.userdataDir=options["userdata-dir"];
}

var LOG=require("./Logger");
LOG.debug(GlobalConfiguration);
