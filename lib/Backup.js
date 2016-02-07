var Async=require("async");
var fs=require("fs-extra");
var i18n=require("i18n");
var ono=require("ono");
var path=require("path");

var Errors=require("./Errors");
var GlobalConfiguration=require("./GlobalConfiguration");
var LOG=require("./Logger");

var Backup=function(){
  this.backupTime=String(Date.now());
};

Backup.prototype.perform=function(steamUser,callback){
  LOG.trace("Backup.perform");
  if(!GlobalConfiguration.backup){
    LOG.info(i18n.__("Nothing to backup, because backup has been turned off."));
    return callback && callback();
  }
  var steamUserName=steamUser.name || steamUser.id;
  var steamUserID=String(steamUser.id);
  LOG.info(i18n.__("Backing up data for Steam user '%s'",steamUserName));
  var backupDir=path.join(GlobalConfiguration.backupDir,this.backupTime,steamUserID);
  var sourceDir=path.join(GlobalConfiguration.userdataDir,steamUserID);
  Async.series([
    function(callback){
      fs.ensureDir(backupDir,callback);
    },
    function(callback){
      Async.parallel({
        grid: function(callback){
          if(!GlobalConfiguration.backupGrids){
            return callback();
          }
          var source=path.join(sourceDir,"config","grid");
          var destination=path.join(backupDir,"config","grid");
          fs.copy(source,destination,{preserveTimestamps: true},function(err){
            if(err && err.code!=="ENOENT"){
              return callback(ono(err,Errors.backupGridFailed,i18n.__("Failed to backup grid directory for '%s'. Reason: %s",steamUserName,String(err))));
            }
            callback();
          });
        },
        shortcuts: function(callback){
          if(!GlobalConfiguration.backupShortcuts){
            return callback();
          }
          var source=path.join(sourceDir,"config","shortcuts.vdf");
          var destination=path.join(backupDir,"config","shortcuts.vdf");
          fs.copy(source,destination,{preserveTimestamps: true},function(err){
            if(err && err.code!=="ENOENT"){
              return callback(ono(err,Errors.backupShortcutsFailed,i18n.__("Failed to backup shortcuts.vdf for '%s'. Reason: %s",steamUserName,String(err))));
            }
            callback();
          });
        }
      },callback);
    }
  ],function(err){
    if(!err){
      LOG.info(i18n.__("Backup for '%s' was successful. Backup has been stored in %s",steamUserName,backupDir));
    }
    callback && callback(err);
  });
};

module.exports=Backup;
