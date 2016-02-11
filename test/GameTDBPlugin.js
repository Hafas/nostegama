var Async=require("async");
var assert=require("chai").assert;

var GlobalConfiguration=require("../lib/GlobalConfiguration");

var GameTDBPlugin=require("../plugins/GameTDBPlugin");

describe("GameTDBPlugin",function(){
  var profile={
    "gameTDB": {
      "platform": "Wii",
      "language": "de"
    }
  };
  it("send request to gametdb for a game",function(done){
    var plugin=new GameTDBPlugin({profile: profile, file: "RGFP69.wbfs"});
    Async.parallel({
      appname: function(callback){
        plugin.getAppname({},callback)
      }
    },function(err,results){
      assert.notOk(err);
      assert.ok(results);
      assert.ok(results.appname);
      assert.equal(results.appname,"Der Pate: Blackhand Edition");
      done();
    });
  });
});
