var ps=require("current-processes");

var LOG=require("./Logger");

exports.isRunning=function(callback){
  LOG.trace("Steam.isRunning");
  ps.get(function(err,processes){
    if(err){
      return callback(err);
    }
    var isRunning=false;
    for(var i=0;i<processes.length;++i){
      var p=processes[i];
      if((typeof p.name)!=="string"){
        continue;
      }
      if(p.name.toLowerCase().startsWith("steam")){
        isRunning=true;
        break;
      }
    }
    LOG.debug("Steam.isRunning",isRunning);
    callback(null,isRunning);
  });
};
