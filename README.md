# Nostegma

## What is Nostegma?

Nostegma is a <b>No</b>n-<b>Ste</b>am <b>G</b>ame <b>Ma</b>nager managing your Non-Steam Games using the command-line interface. It's purpose and goal is to add shortcuts of your Non-Steam Games into your [Steam](http://store.steampowered.com/)'s library; and that without to dictate to you how to organize your games.

## Installation

There is currently no easy way to install Nostegma.

### Windows

* Download and install the latest Version of [NodeJS](https://nodejs.org/).
* Download and unzip the current [source code](https://github.com/Hafas/nostegma/archive/master.zip) of Nostegma
* Open the [Command Prompt](https://en.wikipedia.org/wiki/Cmd.exe) or [PowerShell](https://en.wikipedia.org/wiki/Windows_PowerShell) and navigate to the directory where you unzipped Nostegma. A file named `package.json` should be in it.
* Enter `npm install`

### Linux & OSX

This application hasn't been tested on Linux or OSX yet, but the code is mostly platform independent. The installation should work analogously.

## Getting started

### Create a profile

The first (and as of now only) profile-type for Nostegma is an emulator profile. Profiles are defined in the `profile.json` file and must be formed in [JSON](http://www.json.org/) (comments allowed). A minimal emulator profile might look like that:

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
This profile tells Nostegma to create for each file it finds in the directory `dir` a Shortcut in Steam to the executable `exe` with the arguments provided in `command`.

For more options and flexibility check the [Profile](#profile) and  the [Plugins](#plugins) chapter below.

### Start Nostegma

Start Nostegma by entering `npm start` into the command line.

## Profile

TODO

## Plugins

TODO

### DefaultPlugin

TODO

### ConsoleGridPlugin

TODO

### DolphinPlugin

TODO

### LocalGridPlugin

TODO

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

The userdata directory is where Steam stores information of local users. If set to `null` Nostegma will try to figure its location by itself, which is usually `C:\Program Files (x86)\Steam\userdata` on Windows, `~/.local/share/Steam/userdata` on Linux and `~/Library/Application Support/Steam/userdata` on OSX. If Nostegma is unable to find the userdata directory you should manually set this value.

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

`-o` `--overwrite` Nostegma usually complements its own to the shortcuts to the existing ones. This option will discard all existing shortcuts.

`-h` `--help` lists all cli options

## Plans for 0.1.0

* Simple game profile
* Referencing profiles
* I18N
* Complete this README

## Plans for 1.0.0

* GUI
* More plugins
