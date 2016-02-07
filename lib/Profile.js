var path=require("path");

var LOG=require("./Logger");
var NonSteamGame=require("./NonSteamGame");

var hiddenProperties=["_exe","_glob","_dir","_recursive","_extensions","_tags","_gridDir","_plugins","_ignore","_extra"];
var Profile=function(properties){
	LOG.trace("Profile");
	properties=properties || {};

	for(var key in properties){
		this[key]=properties[key];
	}

	for(var i=0;i<hiddenProperties.length;++i){
		Object.defineProperty(this,hiddenProperties[i],{
			enumerable: false,
			writable: true
		});
	}

	Object.defineProperty(this,"exe",{
		enumerable: true,
		get: this.getExe,
		set: this.setExe
	});

	Object.defineProperty(this,"glob",{
		enumerable: true,
		get: this.getGlob,
		set: this.setGlob
	});
	Object.defineProperty(this,"dir",{
		enumerable: true,
		get: this.getDir,
		set: this.setDir
	});

	Object.defineProperty(this,"recursive",{
		enumerable: true,
		get: this.isRecursive,
		set: this.setRecursive
	});
	Object.defineProperty(this,"extensions",{
		enumerable: true,
		get: this.getExtensions,
		set: this.setExtensions
	});
	Object.defineProperty(this,"tags",{
		enumerable: true,
		get: this.getTags,
		set: this.setTags
	});
	Object.defineProperty(this,"gridDir",{
		enumerable: true,
		get: this.getGridDir,
		set: this.setGridDir
	});
	Object.defineProperty(this,"plugins",{
		enumerable: true,
		get: this.getPlugins,
		set: this.setPlugins
	});
	Object.defineProperty(this,"ignore",{
		enumerable: true,
		get: this.getIgnore,
		set: this.setIgnore
	});
	Object.defineProperty(this,"extra",{
		enumerable: true,
		get: this.getExtra,
		set: this.setExtra
	});

	this.exe=properties.exe;
	this.dir=properties.dir;
	this.glob=properties.glob;
	this.recursive=properties.recursive;
	this.extensions=properties.extensions;
	this.tags=properties.tags;
	this.gridDir=properties.gridDir;
	this.plugins=properties.plugins;
	this.ignore=properties.ignore;
	this.extra=properties.extra;
};

Profile.prototype.addExtensions=function(extensions){
	if(!extensions){
		return;
	}
	if(Array.isArray(extensions)){
		for(var i=0;i<extensions.length;++i){
			this.addExtensions(extensions[i]);
		}
	}else{
		var extension=String(extensions);
		this._extensions[extension]=true;
	}
};

Profile.prototype.addTags=function(tags){
	if(!tags){
		return;
	}
	if(Array.isArray(tags)){
		for(var i=0;i<tags.length;++i){
			this.addTags(tags[i]);
		}
	}else{
		var tag=String(tags);
		this._tags[tag]=true;
	}
};

//Getter & Setter

Profile.prototype.getExe=function(){
	return this._exe;
};

Profile.prototype.setExe=function(exe){
	this._exe=exe?String(exe):null;
};

Profile.prototype.getGlob=function(){
	if(this._glob){
		return this._glob;
	}
	if(this._dir){
		var glob=[this._dir];
		if(this._recursive){
			glob.push("**");
		}
		var extensions=this.extensions;
		if(extensions.length===0){
			glob.push("*")
		}else if(extensions.length===1){
			glob.push("*."+extensions[0]);
		}else{
			glob.push("*.@("+extensions.join("|")+")");
		}
		return path.join.apply(path,glob);
	}
	return null;
};

Profile.prototype.setGlob=function(glob){
	this._glob=glob?String(glob):null;
};

Profile.prototype.getDir=function(){
	return this._dir;
};

Profile.prototype.setDir=function(dir){
	this._dir=dir?String(dir):null;
};

Profile.prototype.isRecursive=function(){
	return this._recursive;
};

Profile.prototype.setRecursive=function(recursive){
	this._recursive=!!recursive;
};

Profile.prototype.getExtensions=function(){
	var extensions=[];
	for(var extension in this._extensions){
		if(this._extensions.hasOwnProperty(extension) && this._extensions[extension]){
			extensions.push(extension);
		}
	}
	return extensions;
};

Profile.prototype.setExtensions=function(extensions){
	this._extensions={};
	this.addExtensions(extensions);
};

Profile.prototype.getTags=function(){
	var tags=[];
	for(var tag in this._tags){
		if(this._tags.hasOwnProperty(tag) && this._tags[tag]){
			tags.push(tag);
		}
	}
	return tags;
};

Profile.prototype.setTags=function(tags){
	this._tags={};
	this.addTags(tags);
};

Profile.prototype.getGridDir=function(){
	return this._gridDir;
};

Profile.prototype.setGridDir=function(gridDir){
	this._gridDir=gridDir?String(gridDir):null;
};

Profile.prototype.getPlugins=function(){
	var pluginNames=[];
	for(var i=0;i<this._plugins.length;++i){
		pluginNames.push(this._plugins[i]);
	}
	return pluginNames;
};

var addPlugin=function(pluginName){
	this._plugins.push(String(pluginName));
};

Profile.prototype.setPlugins=function(plugins){
	this._plugins=[];
	if(!plugins){
		return;
	}
	if(Array.isArray(plugins)){
		for(var i=0;i<plugins.length;++i){
			addPlugin.call(this,plugins[i]);
		}
	}else{
		addPlugin.call(this,plugins);
	}
};

Profile.prototype.getIgnore=function(){
	return this._ignore;
};

var addIgnore=function(ignore){
	this._ignore.push(String(ignore));
};

Profile.prototype.setIgnore=function(ignore){
	this._ignore=[];
	if(!ignore){
		return;
	}
	if(Array.isArray(ignore)){
		for(var i=0;i<ignore.length;++i){
			addIgnore.call(this,ignore[i]);
		}
	}else{
		addIgnore.call(this,ignore);
	}
};

Profile.prototype.getExtra=function(){
	var extra={};
	for(var name in this._extra){
		if(this._extra.hasOwnProperty(name)){
			extra[name]=new NonSteamGame(this._extra[name]);
		}
	}
	return extra;
};

Profile.prototype.setExtra=function(extra){
	this._extra={};
	for(var name in extra){
		if(extra.hasOwnProperty(name)){
			this._extra[name]=extra[name];
		}
	}
};

Profile.prototype.toJSON=function(){
	var json={};
	for(var propertyName in this){
		if(!this.hasOwnProperty(propertyName)){
			continue;
		}
		var value=this[propertyName];
		if(value){
			json[propertyName]=JSON.parse(JSON.stringify(value));
		}
	}
	return json;
};

module.exports=Profile;
