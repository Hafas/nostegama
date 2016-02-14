var Async=require("async");
var assert=require("chai").assert;

var GlobalConfiguration=require("../lib/GlobalConfiguration");

var GameTDBPlugin=require("../plugins/GameTDBPlugin");

describe("GameTDBPlugin",function(){
  this.timeout(0);
  var profile={
    "gameTDB": {
      "platform": "Wii",
      "language": "de"
    }
  };
  it("sends a request to gametdb",function(done){
    var plugin=new GameTDBPlugin({profile: profile, file: "RGFP69.wbfs"});
    Async.series([
      function(callback){
        plugin.before(callback);
      },
      function(callback){
        Async.parallel({
          appname: function(callback){
            plugin.getAppname({},callback);
          }
        },function(err,results){
          assert.notOk(err);
          assert.ok(results);
          assert.isString(results.appname);
          assert.equal(results.appname,"Der Pate: Blackhand Edition");
          callback();
        });
      }
    ],done)
  });
});
