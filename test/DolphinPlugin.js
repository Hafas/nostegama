var Async=require("async");
var assert=require("chai").assert;

var GlobalConfiguration=require("../lib/GlobalConfiguration");

var DolphinPlugin=require("../plugins/DolphinPlugin");

describe("DolphinPlugin",function(){
  var profile={
    "dolphin": {
      "useGenresAsTag": true,
      "useInputMethodsAsTag": true
    }
  };
  it("sends a request to the dolphin wiki",function(done){
    var plugin=new DolphinPlugin({profile: profile, file: "RMCP01.wbfs", exe: "C:\\Something.exe"});
    Async.series([
      function(callback){
        plugin.before(callback);
      },
      function(callback){
        Async.parallel({
          appname: function(callback){
            plugin.getAppname({},callback);
          },
          exe: function(callback){
            plugin.getExe({},callback);
          },
          tags: function(callback){
            plugin.getTags({},callback);
          }
        },function(err,results){
          assert.notOk(err);
          assert.ok(results);
          assert.isString(results.appname);
          assert.equal(results.appname,"Mario Kart Wii");
          assert.isString(results.exe);
          assert.equal(results.exe,'"C:\\Something.exe" --batch --exec="RMCP01.wbfs"');
          assert.isArray(results.tags);
          assert.include(results.tags,"Racing");
          assert.include(results.tags,"Wii Remote");
          assert.include(results.tags,"Wii Remote + Nunchuk");
          assert.include(results.tags,"Classic Controller");
          assert.include(results.tags,"GameCube Controller");
          callback();
        });
      }
    ],done)
  });
});
