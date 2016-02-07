var Shortcut=require("node-steam-shortcuts").Shortcut;

var LOG=require("./Logger");

var NonSteamGame=function(properties){
  LOG.trace("NonSteamGame");
  properties=properties || {};
  Shortcut.apply(this,arguments);

  Object.defineProperty(this,"grid",{
    get: this.getGrid,
    set: this.setGrid
  });

  this.grid=properties.grid;
};

NonSteamGame.prototype=Object.create(Shortcut.prototype);
NonSteamGame.prototype.constructor=NonSteamGame;

NonSteamGame.prototype.getGrid=function(){
  return this._grid;
};

NonSteamGame.prototype.setGrid=function(grid){
  this._grid=grid?String(grid):null;
};

NonSteamGame.prototype.toJSON=function(){
  var json=Shortcut.prototype.toJSON.call(this);
  if(this._grid){
    json.grid=this._grid;
  }
  return json;
};

module.exports=NonSteamGame;
