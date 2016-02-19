var Async=require("async");
var fs=require("fs");
var path=require("path");
var request=require("request");
var tmp=require("tmp");

var LOG=require("../lib/Logger");
var TemporaryTracker=require("../lib/TemporaryTracker");

/**
 * AbstractPlugin(params)
 * params contains the following properties
 * profile: The whole Profile-Object, that includes the executable, extras, etc.
 * cwd: The directory where the plugin came from
 * file: The file the executable should open. Might not be present in case of a simple profile.
 */
var AbstractPlugin=function(params){
  throw new Error("This prototype is abstract and can't be instantiated!");
};

/**
 * General information, when implementing a method:
 * params: An object that might contains useful information about the game
 *    nonSteamGame: the Non-Steam Game so far, after applying changes from extra and previous plugins
 * callback: Return in its first argument a truthy value if an error occured while trying to acquire a property. The next Plugin will then try to acquire that property.
 *    Return in its second argument the property you acquired. No other Plugin will override that value.
 *    Return in its second argument a falsy value, when you are unable to acquire that property. The next Plugin will then try to acquire that property.
 */

/**
 * before(callback)
 * This function is called before any other plugin-method if implemented.
 * callback: The callback. When returning a truthy value in its first argument (an Error) all other plugin operations will be skipped
 */
AbstractPlugin.prototype.before=null;

/**
 * getAppname(params,callback)
 * callback: The callback. Returns the appname in its 2nd argument.
 */
AbstractPlugin.prototype.getAppname=null;

/**
 * getExe(params,callback)
 * callback: The callback. Returns the command that Steam will run in its 2nd argument.
 */
AbstractPlugin.prototype.getExe=null;

/**
 * getStartDir(params,callback)
 * callback: The callback. Returns the working directory of the executable in its 2nd argument.
 */
AbstractPlugin.prototype.getStartDir=null;

/**
 * getIcon(params,callback)
 * callback: The callback. Returns a path to an icon-file in its 2nd argument.
 */
AbstractPlugin.prototype.getIcon=null;

/**
 * getShortcutPath(params,callback)
 * callback: The callback.
 */
AbstractPlugin.prototype.getShortcutPath=null;

/**
 * getTags(params,callback)
 * callback: The callback. Returns an array of tags in its 2nd argument.
 */
AbstractPlugin.prototype.getTags=null;

/**
 * getGrid(params,callback)
 * callback: The callback. Returns the path to a grid image in its 2nd argument.
 */
AbstractPlugin.prototype.getGrid=null;

AbstractPlugin.prototype.trackTemporary=function(temporaryFile){
  TemporaryTracker.track(temporaryFile);
};

var requestQueues={};
AbstractPlugin.prototype.sendRequest=function(queueName,url,callback){
  if(!requestQueues[queueName]){
    requestQueues[queueName]=Async.queue(function(task,callback){
      request(task,callback);
    });
  }
  requestQueues[queueName].push(url,callback);
};

AbstractPlugin.prototype.downloadFile=function(url,callback){
  var self=this;
  Async.waterfall([
    function(callback){
      tmp.tmpName({postfix: path.extname(url)},callback);
    },
    function(tmpFilepath,callback){
      var writeStream=fs.createWriteStream(tmpFilepath);
      var callbackCalled=false;
      writeStream.on("error",function(err){
        if(callbackCalled){
          return;
        }
        callbackCalled=true;
        callback(err);
      }).on("finish",function(){
        if(callbackCalled){
          return;
        }
        callbackCalled=true;
        //callback the path where where the grid image is. Nostegama will see to it, that it goes where it should.
        callback(null,tmpFilepath);
      }).on("pipe",function(){
        LOG.debug("Piping into %s",tmpFilepath);
        self.trackTemporary(tmpFilepath);
      });
      request(url).pipe(writeStream).on("error",function(err){
        console.error("Ooops:",err);
      });
    }
  ],callback);
};

module.exports=AbstractPlugin;
