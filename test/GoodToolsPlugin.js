var Async=require("async");
var assert=require("chai").assert;

var GlobalConfiguration=require("../lib/GlobalConfiguration");

var GoodToolsPlugin=require("../plugins/GoodToolsPlugin");

describe("GoodToolsPlugin",function(){
  var profile={
    "defaultGrid": "C:\\Something\\default.png",
    "command": "$e --something=$f"
  };
  it("fills with default data",function(done){
    var stringsToTest=["C:\\something\\something\\Game (U) [!].abc","C:\\something (U)\\something\\[pre] good_game.abc"];
    var expected=["Game","good_game"];
    var i=0;
    Async.eachSeries(stringsToTest,function(stringToTest,callback){
      var plugin=new GoodToolsPlugin({profile: profile, file: stringToTest});
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
