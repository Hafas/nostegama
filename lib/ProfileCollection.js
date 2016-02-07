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

var properties=["cwd"];
ProfileCollection.prototype.toJSON=function(){
  var json={};
  for(var i=0;i<properties.length;++i){
    var property=properties[i];
    var value=this[property];
    if(value){
      json[property]=value;
    }
  }
  var profiles=this.profiles;
  for(var profileName in profiles){
    if(!profiles.hasOwnProperty(profileName)){
      continue;
    }
    json["profiles"]=json["profiles"] || {};
    json["profiles"][profileName]=profiles[profileName].toJSON();
  }
  return json;
};

module.exports=ProfileCollection;
