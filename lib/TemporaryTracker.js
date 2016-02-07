var Async=require("async");
var fs=require("fs-extra");
var i18n=require("i18n");
var ono=require("ono");
var os=require("os");

var LOG=require("./Logger");

var temporaryFiles={};

exports.track=function(temporaryFile){
  LOG.trace("TemporaryTracker.track");
  var type=(typeof temporaryFile);
  if(type!=="string"){
    LOG.error(i18n.__("Can not track '%s'. Path should be a string. It is '%s' instead.",temporaryFile,type));
    return;
  }
  temporaryFiles[temporaryFile]=true;
};

var TEMP_DIR=fs.realpathSync(os.tmpdir());
var cleanupTask=function(temporaryFile){
  return function(callback){
    Async.waterfall([
      function(callback){
        fs.realpath(temporaryFile,callback);
      },
      function(resolvedPath,callback){
        Async.waterfall([
          function(callback){
            fs.stat(resolvedPath,callback);
          },
          function(stats,callback){
            if(!stats.isFile()){
              return callback(ono(i18n.__("Path is not a file.")));
            }
            callback();
          }
        ],function(err){
          if(err){
            return callback(err);
          }
          if(resolvedPath.indexOf(TEMP_DIR)===0){
            //file is indeed in the temporary directory
            LOG.debug("Deleting %s",resolvedPath);
            return fs.unlink(resolvedPath,callback);
          }
          //TODO prompt?
          callback(ono(i18n.__("File is not in the temporary directory.",temporaryFile)));
        });
      }
    ],function(err){
      if(err){
        LOG.warn(i18n.__("Temporary file '%s' hasn't been deleted. Reason: %s",temporaryFile,String(err)));
      }
      callback();
    });
  };
};

exports.cleanup=function(callback){
  LOG.trace("TemporaryTracker.cleanup");
  var tasks=[];
  for(temporaryFile in temporaryFiles){
    if(!temporaryFiles.hasOwnProperty(temporaryFile)){
      continue;
    }
    tasks.push(cleanupTask(temporaryFile));
  }
  if(tasks.length>0){
    LOG.info(i18n.__("Deleting temporary files ..."));
  }
  Async.parallel(tasks,callback);
};
