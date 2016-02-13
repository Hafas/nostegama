var LOG=require("./Logger");
var Profile=require("./Profile");

var hiddenProperties=["_profiles","_cwd"];
var ProfileCollection=function(properties){
  LOG.trace("ProfileCollection");
  properties=properties || {};

  for(var i=0;i<hiddenProperties.length;++i){
    Object.defineProperty(this,hiddenProperties[i],{
      enumerable: false,
      writable: true
    });
  }

  Object.defineProperty(this,"profiles",{
    enumerable: true,
    get: this.getProfiles,
    set: this.setProfiles
  });
  Object.defineProperty(this,"cwd",{
    enumerable: true,
    get: this.getCWD,
    set: this.setCWD
  });

  this.profiles=properties.profiles;
  this.cwd=properties.cwd;
};

ProfileCollection.prototype.getProfiles=function(){
  var profiles={};
  for(var profileName in this._profiles){
    if(this._profiles.hasOwnProperty(profileName)){
      var p=this._profiles[profileName];
      p._cwd=this._cwd;
      profiles[profileName]=new Profile(this._profiles[profileName]);
    }
  }
  return profiles;
};

ProfileCollection.prototype.setProfiles=function(profiles){
  this._profiles={};
  for(var profileName in profiles){
    if(profiles.hasOwnProperty(profileName)){
      this._profiles[profileName]=profiles[profileName];
    }
  }
};

ProfileCollection.prototype.getCWD=function(){
  return this._cwd;
};

ProfileCollection.prototype.setCWD=function(cwd){
  this._cwd=cwd?String(cwd):null;
};

ProfileCollection.prototype.toJSON=function(){
  return JSON.parse(JSON.stringify({
    cwd: this.cwd,
    profiles: this.profiles
  }));
};

module.exports=ProfileCollection;
