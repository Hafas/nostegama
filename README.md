# Nostegma

## What is Nostegma?

Nostegma is a <b>No</b>n-<b>Ste</b>am <b>G</b>ame <b>Ma</b>nager managing your Non-Steam Games using the command-line interface. It's purpose and goal is to add shortcuts of your Non-Steam Games into your [Steam](http://store.steampowered.com/)'s library; and that without to dictate to you how to organize your games.

## Installation

There is currently no easy way to install Nostegma.

### Windows

* Download and install the latest Version of [NodeJS](https://nodejs.org/).
* Download and unzip the current [source code](https://github.com/Hafas/nostegma/archive/v0.0.9.zip) of Nostegma
* Open the [PowerShell](https://en.wikipedia.org/wiki/Windows_PowerShell) (recommended) or [Command Prompt](https://en.wikipedia.org/wiki/Cmd.exe) and navigate to the directory where you unzipped Nostegma. A file named `package.json` should be in it.
* Enter `npm install`

### Linux & OSX

This application hasn't been tested on Linux or OSX yet, but the code is mostly platform independent. The installation should work analogously.

## Getting started

### Create a profile

The first (and as of now only) profile-type for Nostegma is an [emulator profile](#emulator-profile). Profiles are defined in the `profile.json` file and must be formed in [JSON](http://www.json.org/) (comments allowed). A minimal emulator profile might look like that:

```js
//minimal emulator example
{
  //Name of the Profile
  "Dolphin": {
    //The executable of the emulator
    "exe": "D:\\Software\\Dolphin\\Dolphin.exe",
    //Where the ROMs are
    "dir": "D:\\Games\\Wii",
    //The command for the emulator ($e) to open the ROM-File ($f)
    "command": "$e --batch --exec=$f"
  }
  //add more profiles here
  /*
  ,
  "2nd Profile": {
    "exe": "...",
    "dir": "...",
    "command": "..."
  }
  */
}
```
This profile tells Nostegma to create for each file it finds in the directory `dir` a shortcut in Steam to the executable `exe` with the arguments provided in `command`.

For more options and flexibility check the [Profile](#profile) and  the [Plugins](#plugins) chapters below.

### Start Nostegma

Start Nostegma by entering `npm start` into the command line.

## Profile

### Emulator profile

An emulator profile has the following options:

* `exe`:  *mandatory* The path to the executable of the emulator. Can be relative to the profile file.
* ROMs by glob
  * `glob`  *mandatory* A [glob](https://www.npmjs.com/package/glob) pattern (e.g. ` "D:\\Games\\Wii\\**\\*.@(iso|wbfs)"`)
* ROMs by dir (will be ignored when `glob` is set)
  * `dir`:  *mandatory* The directory where the ROMs can be found
  * `recursive`:  *optional*  If Nostegma should search for ROMs recursively. Default `false`.
  * `extensions`: *optional*  An array of extensions Nostegma should consider when searching for ROMs (e.g. `["iso","wbfs"]`)
* `ignore`: *optional*  A glob pattern or an array of glob pattern to use to ignore ROMs
* `tags`: *optional*  An array of tags Nostegma should add to each game (e.g. `["Wii"]`)
* `plugins`:  *optional* An array of [plugins](#plugins) to use while processing ROMs.
* `extra`:  *optional* Extra properties to apply to a specific ROM. Plugins won't be able to alter these properties.
  * `appname`:  The name of the ROM that should be displayed on Steam
  * `exe`:  The command to use to run this ROM
  * `StartDir`: The working directory of the `exe`
  * `icon`: Path to a file that should serve as an icon for this ROM
  * `tags`: An array of tags to add to this ROM
  * `grid`: Path to a file that should serve as a grid image for this ROM
* Additional options for [plugins](#plugins)

Example:
```js
{
  "Dolphin": {
    "exe": "D:\\Software\\Dolphin\\Dolphin.exe",
    "glob": "D:\\Games\\Wii\\**\\*.@(iso|wbfs)",
    "tags": ["Wii"],
    "plugins": ["DolphinPlugin","LocalGridPlugin","ConsoleGridPlugin"],
    "extra": {
      "RMCP01.wbfs": {
        "appname": "Mario Kart Wii",
        "tags": ["Mario","Racing","favorite"]
      }
    },
    //used by LocalGridPlugin
    "gridDir": "D:\\Games\\Wii\\Meta\\Grids",
    //used by DefaultPlugin
    "defaultGrid": "D:\\Games\\Wii\\Meta\\Grids\\default.png",
    //used by DolphinPlugin
    "dolphin": {
      "useGenresAsTag": true,
      "useInputMethodAsTag": true
    }
  }
}
```

## Plugins

A plugin's job is to complete a Non-Steam Game's properties, that weren't provided by the user in `extra`. If a plugin is not able or not designed to provide a specific property, the next plugin in line will try its luck. If everything fails the [`DefaultPlugin`](#defaultplugin) will use default values to fill in the necessary blanks.

Example:
```js
  //[...]
  "plugins": ["DolphinPlugin","LocalGridPlugin","ConsoleGridPlugin"],
  //[...]
```
First the [`DolphinPlugin`](#dolphinplugin) will be used to fill in the properties `appname`, `exe` and `tags`, then the [`LocalGridPlugin`](#localgridplugin) will try to find a `grid` for the game. If no fitting grid image is found, the [`ConsoleGridPlugin`](#consolegridplugin) will browse [consolegrid.com](consolegrid.com). The [`ConsoleGridPlugin`](#consolegridplugin) will eventually use the `appname` property gathered by the [`DolphinPlugin`](#dolphinplugin) as one of the search candidates, so the plugin order is important!

Still no grid image found? The [`DefaultPlugin`](#defaultplugin) will then use the `defaultGrid` if provided.

If you want to use a plugin only partially, you can define which properties each plugin should try to fetch:

```js
  //[...]
  "plugins": [
    {
      "name": "DolphinPlugin",
      "appname": true,
      "exe": true
    },
    "LocalGridPlugin",
    "ConsoleGridPlugin"
  ],
  //[...]
```

Now the [`DolphinPlugin`](#dolphinplugin) won't add any tags to games. Everything else behaves as before.

### DefaultPlugin

This plugin will always be executed last, and doesn't need to be explicitly listed in the `plugins` property.

Profile properties this plugin uses:
* `command`:  *optional*  Default `"$e $f"`. `$e` will be replaced with the profile's executable's path (in double quotation marks) and `$f` with the ROM's path (also in double quotation marks).
* `defaultGrid`:  *optional*

Non-Steam Game properties this plugin uses: *none*

Non-Steam Game properties this plugin delivers:
* `appname`:  Returns the game's file name
* `exe`:  Uses the profile property `command` to build this property
* `StartDir`: Returns the directory of the profile's executable
* `grid`: Uses the profile property `defaultGrid` and returns it

### ConsoleGridPlugin

This plugin browses [consolegrid.com](consolegrid.com) for a suitable grid image.

Profile properties this plugin uses: *none*

Non-Steam Game properties this plugin uses:
* `appname`:  *optional*

Non-Steam Game properties this plugin delivers:
* `grid`: Uses the Non-Steam Game's `appname` and/or the file's name to download a grid image and return its path

### DolphinPlugin

This plugin will use the [Dolphin Wiki](https://wiki.dolphin-emu.org) to gather information.

Profile properties this plugin uses:
* `dolphin` *optional*
  * `useDeveloperAsTag`: *optional*  Default `false`. Whether or not to add the game's developer to the tags
  * `usePublisherAsTag`: *optional*  Default `false`. Whether or not to add the game's publisher to the tags
  * `useSeriesAsTag`: *optional*  Default `false`. Whether or not to add the game's series to the tags
  * `useGenresAsTag`: *optional*  Default `false`. Whether or not to add the game's genres to the tags
  * `useModesAsTag`:  *optional*  Default `false`. Whether or not to add the game's modes to the tags
  * `useInputMethodsAsTag`:  *optional*  Default `false`. Whether or not to add the game's input methods to the tags

Non-Steam Game properties this plugin uses: *none*

Non-Steam Game properties this plugin delivers:
* `appname`:  Uses the title of the game's Wiki page
* `exe`:  Uses [`DefaultPlugin`](#defaultplugin)'s implementation to build this property with `command="$e --batch --exec=$f"`
* `tags`: Uses the info box of the game's Wiki page and the options of profile property `dolphin`

### LocalGridPlugin

This plugin will browse the local storage for a suitable grid image.

Profile properties this plugin uses:
* `gridDir`:  *mandatory* Path to a directory where the plugin should browse for grid images

Non-Steam Game properties this plugin uses: *none*

Non-Steam Game properties this plugin delivers:
* `grid`: Returns the path of the grid image. The image's name needs to be the same as the name of the file and its extension has to be either `jpeg`, `jpg`, `png` or `tiff`.

## Configuration

The `config.json` file and the command line interface are offering you options to configure Nostegma. The `config.json` file will override the default options. Options passed to the command line interface will override both the default options and the options provided by the `config.json` file.

To use the command line options use this syntax:

`npm start -- <option>[=value] [...]`

### Userdata

`config.json`:
```json
"steam": {
  "userdataDir": null
}
```
cli:

`--userdata-dir=<path>`

The userdata directory is where Steam stores information of local users. If set to `null` Nostegma will try to figure out its location by itself, which is usually `C:\Program Files (x86)\Steam\userdata` on Windows, `~/.local/share/Steam/userdata` on Linux and `~/Library/Application Support/Steam/userdata` on OSX. If Nostegma is unable to find the userdata directory you should manually set this value.

### Backup
`config.json`:
```json
"backup": {
  "shortcuts": true,
  "grids": true,
  "dir": null
},
```
cli:

`--no-backup` to not back up

`--backup-dir=<path>`

Nostegma will usually backup the `shortcuts.vdf` file which stores the current shortcuts to the Non-Steam Games and the `grid` directory into the operating system's temporary directory (`<tmp>/nostegma/backups`)

### Logs
For logging there is one additional file `log4js.js` you might want to look into, if you want to customize the output. Check log4js' [Wiki](https://github.com/nomiddlename/log4js-node/wiki) for more information.

`config.json`:
```json
"log": {
  "appenders": ["console","nostegma"],
  "dir": null
}
```
cli:

`--log-dir`

Nostegma will usually output informations and errors both into the console and into the operating system's temporary director (`<tmp>/nostegma/logs`).

### Other

`-i <file>` `--input=<file>` to use an other profile file instead of the default `profile.json` file

`-o` `--overwrite` Nostegma usually complements its own shortcuts to the existing ones. This option will discard all existing shortcuts.

`-h` `--help` lists all cli options

## Plans for 0.1.0

* Is-Steam-running-detection
* Tests
* Simple game profile
* Referencing profiles
* german L10N

## Plans for 1.0.0

* GUI
* More plugins
