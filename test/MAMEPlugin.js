var Async=require("async");
var assert=require("chai").assert;

var GlobalConfiguration=require("../lib/GlobalConfiguration");

var MAMEPlugin=require("../plugins/MAMEPlugin");

describe("MAMEPlugin",function(){
  var exe="D:\\Software\\MAME\\mame64.exe";
  it("determines appname with mame.exe without removing brackets",function(done){
    var profile={
      "exe": exe,
      "MAME": {
        "keepBrackets": true
      }
    };
    var gamesToTest=["avigo.zip","exprraid.zip","island.zip","myststar.zip","quizo.zip","urashima","yorijori"];
    var expected=["TI Avigo 10 PDA","Express Raider (World, Rev 4)","Island (050713 World)","Mystic Star","Quiz Olympic (set 1)","Otogizoushi Urashima Mahjong (Japan)","Yori Jori Kuk Kuk"];
    var i=0;
    Async.eachSeries(gamesToTest,function(gameToTest,callback){
      var plugin=new MAMEPlugin({profile: profile, file: gameToTest, exe: profile.exe});
      Async.parallel({
        appname: function(callback){
          plugin.getAppname({},callback);
        }
      },function(err,results){
        assert.notOk(err);
        assert.ok(results);
        assert.isString(results.appname);
        assert.equal(results.appname,expected[i]);
        ++i;
        callback();
      })
    },done);
  });

  it("determines appname with mame.exe while removing brackets",function(done){
    var profile={
      "exe": exe,
      "MAME": {
        "keepBrackets": false
      }
    };
    var gamesToTest=["avigo.zip","exprraid.zip","island.zip","myststar.zip","quizo.zip","urashima","yorijori"];
    var expected=["TI Avigo 10 PDA","Express Raider","Island","Mystic Star","Quiz Olympic","Otogizoushi Urashima Mahjong","Yori Jori Kuk Kuk"];
    var i=0;
    Async.eachSeries(gamesToTest,function(gameToTest,callback){
      var plugin=new MAMEPlugin({profile: profile, file: gameToTest, exe: profile.exe});
      Async.parallel({
        appname: function(callback){
          plugin.getAppname({},callback);
        }
      },function(err,results){
        assert.notOk(err);
        assert.ok(results);
        assert.isString(results.appname);
        assert.equal(results.appname,expected[i]);
        ++i;
        callback();
      })
    },done);
  });

  it("determines appname with mame.exe when exe is set in pluginData",function(done){
    var profile={
      "exe": "C:\\anything.exe",
      "MAME": {
        "exe": exe,
        "keepBrackets": false
      }
    };
    var gamesToTest=["avigo.zip","exprraid.zip","island.zip","myststar.zip","quizo.zip","urashima","yorijori"];
    var expected=["TI Avigo 10 PDA","Express Raider","Island","Mystic Star","Quiz Olympic","Otogizoushi Urashima Mahjong","Yori Jori Kuk Kuk"];
    var i=0;
    Async.eachSeries(gamesToTest,function(gameToTest,callback){
      var plugin=new MAMEPlugin({profile: profile, file: gameToTest, exe: profile.exe});
      Async.parallel({
        appname: function(callback){
          plugin.getAppname({},callback);
        }
      },function(err,results){
        assert.notOk(err);
        assert.ok(results);
        assert.isString(results.appname);
        assert.equal(results.appname,expected[i]);
        ++i;
        callback();
      })
    },done);
  });
});
