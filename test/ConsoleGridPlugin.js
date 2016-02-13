var Async=require("async");
var assert=require("chai").assert;
var fs=require("fs");

var GlobalConfiguration=require("../lib/GlobalConfiguration");

var ConsoleGridPlugin=require("../plugins/ConsoleGridPlugin");

describe("ConsoleGridPlugin",function(){
  this.timeout(0);
  var profile={};
  it("sends a request to consolegrid per appname",function(done){
    var plugin=new ConsoleGridPlugin({profile: profile, file: "RMCP01.wbfs", exe: "C:\\Something.exe"});
    Async.series([
      function(callback){
        Async.parallel({
          grid: function(callback){
            plugin.getGrid({nonSteamGame: {appname: "Mario Kart Wii"}},callback);
          }
        },function(err,results){
          assert.notOk(err);
          assert.ok(results);
          assert.isString(results.grid);
          var stats;
          try{
            stats=fs.statSync(results.grid);
          }catch(e){
            assert.fail(e,null);
          }
          assert.isTrue(stats.isFile());
          callback();
        });
      }
    ],done)
  });

  it("sends a request to consolegrid per file name",function(done){
    var plugin=new ConsoleGridPlugin({profile: profile, file: "Mario Kart Wii.wbfs", exe: "C:\\Something.exe"});
    Async.series([
      function(callback){
        Async.parallel({
          grid: function(callback){
            plugin.getGrid({},callback);
          }
        },function(err,results){
          assert.notOk(err);
          assert.ok(results);
          assert.isString(results.grid);
          var stats;
          try{
            stats=fs.statSync(results.grid);
          }catch(e){
            assert.fail(e,null);
          }
          assert.isTrue(stats.isFile());
          callback();
        });
      }
    ],done)
  });

  it("sends a request to consolegrid per exe name",function(done){
    var plugin=new ConsoleGridPlugin({profile: profile, exe: "C:\\Mario Kart Wii.exe"});
    Async.series([
      function(callback){
        Async.parallel({
          grid: function(callback){
            plugin.getGrid({},callback);
          }
        },function(err,results){
          assert.notOk(err);
          assert.ok(results);
          assert.isString(results.grid);
          var stats;
          try{
            stats=fs.statSync(results.grid);
          }catch(e){
            assert.fail(e,null);
          }
          assert.isTrue(stats.isFile());
          callback();
        });
      }
    ],done)
  });
});
