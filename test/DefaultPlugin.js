var Async=require("async");
var assert=require("chai").assert;

var GlobalConfiguration=require("../lib/GlobalConfiguration");

var DefaultPlugin=require("../plugins/DefaultPlugin");

describe("DefaultPlugin",function(){
  var profile={
    "defaultGrid": "C:\\Something\\default.png",
    "command": "$e --something=$f"
  };
  it("fills with default data",function(done){
    var plugin=new DefaultPlugin({profile: profile, file: "C:\\something\\Mario Kart Wii.wbfs", exe: "C:\\Something.exe"});
    Async.series([
      function(callback){
        Async.parallel({
          appname: function(callback){
            plugin.getAppname({},callback);
          },
          exe: function(callback){
            plugin.getExe({},callback);
          },
          StartDir: function(callback){
            plugin.getStartDir({},callback);
          },
          grid: function(callback){
            plugin.getGrid({},callback);
          }
        },function(err,results){
          assert.notOk(err);
          assert.ok(results);
          assert.isString(results.appname);
          assert.equal(results.appname,"Mario Kart Wii");
          assert.isString(results.exe);
          assert.equal(results.exe,'"C:\\Something.exe" --something="C:\\something\\Mario Kart Wii.wbfs"');
          assert.isString(results.StartDir);
          assert.equal(results.StartDir,'"C:\\"');
          assert.isString(results.grid);
          assert.equal(results.grid,"C:\\Something\\default.png");
          callback();
        });
      }
    ],done)
  });

  it("fills with default data 2",function(done){
    var p=JSON.parse(JSON.stringify(profile));
    p.command="$e --fullscreen"
    p.defaultGrid=undefined;
    var plugin=new DefaultPlugin({profile: p, exe: "C:\\Something.exe"});
    Async.series([
      function(callback){
        Async.parallel({
          appname: function(callback){
            plugin.getAppname({},callback);
          },
          exe: function(callback){
            plugin.getExe({},callback);
          },
          StartDir: function(callback){
            plugin.getStartDir({},callback);
          },
          grid: function(callback){
            plugin.getGrid({},callback);
          }
        },function(err,results){
          assert.notOk(err);
          assert.ok(results);
          assert.isString(results.appname);
          assert.equal(results.appname,"Something");
          assert.isString(results.exe);
          assert.equal(results.exe,'"C:\\Something.exe" --fullscreen');
          assert.isString(results.StartDir);
          assert.equal(results.StartDir,'"C:\\"');
          assert.notOk(results.grid);
          callback();
        });
      }
    ],done)
  });
});
