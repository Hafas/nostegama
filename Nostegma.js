var GlobalConfiguration=require("./lib/GlobalConfiguration");

var Async=require("async");
var i18n=require("i18n");

var Backup=require("./lib/Backup");
var Errors=require("./lib/Errors");
var LOG=require("./lib/Logger");
var ProfileController=require("./lib/ProfileController");
var Prompts=require("./lib/Prompts");
var ShortcutCollection=require("node-steam-shortcuts").ShortcutCollection;
var TemporaryTracker=require("./lib/TemporaryTracker");
var Userdata=require("./lib/Userdata");

Async.series([
  function(callback){
    Userdata.validate(callback);
  },
  function(callback){
    Async.waterfall([
      function(callback){
        Userdata.getSteamUsers(callback);
      },
      function(steamUsers,callback){
        if(steamUsers.length===0){
          return callback(ono(Errors.noSteamIDsFound,i18n.__("No Steam IDs in the userdata directory were found. Make sure that the directory is correct, and that you have logged in to Steam at least once.")));
        }
        if(steamUsers.length===1){
          return callback(null,steamUsers);
        }
        Prompts.chooseSteamUsers(steamUsers,callback);
      },
      function(steamUsers,callback){
        Async.waterfall([
          function(callback){
            ProfileController.read(GlobalConfiguration.input,callback);
          },
          function(profileCollection,callback){
            ProfileController.gatherNonSteamGames(profileCollection,callback);
          }
        ],function(err,shortcutCollection){
          if(err){
            return callback(err);
          }
          var nonSteamGames=shortcutCollection.shortcuts;
          LOG.info(i18n.__("%d Non-Steam Games found.",nonSteamGames.length));
          if(nonSteamGames.length===0){
            LOG.info(i18n.__("Nothing to do."));
            return callback();
          }
          var backup=new Backup();
          Async.eachSeries(steamUsers,function(steamUser,callback){
            Async.series([
              function(callback){
                backup.perform(steamUser,callback);
              },
              function(callback){
                Async.waterfall([
                  function(callback){
                    if(GlobalConfiguration.overwrite){
                      return callback(null, new ShortcutCollection());
                    }
                    Userdata.readShortcuts(steamUser,callback)
                  },
                  function(shortcutCollection,callback){
                    shortcutCollection.addShortcuts(nonSteamGames);
                    Userdata.writeShortcuts(steamUser,shortcutCollection,callback);
                  }
                ],callback);
              }
            ],function(err){
              if(err){
                LOG.error(String(err));
              }
              callback();
            });
          },callback);
        });
      }
    ],callback);
  }
],function(err){
  var exitCode=0;
  if(err){
    LOG.fatal(err.message || err);
    exitCode=1;
  }
  TemporaryTracker.cleanup(function(){
    if(!err){
      LOG.info(i18n.__("All done!"));
    }
    if(exitCode>0){
      process.exit(exitCode);
    }
  });
});
