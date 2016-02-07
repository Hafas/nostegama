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

module.exports=AbstractPlugin;
