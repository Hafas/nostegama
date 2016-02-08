# Nostegma

## What is Nostegma?

Nostegma is a __No__n-__Ste__am __G__ame __Ma__nager<!--__--> - managing your Non-Steam Games using the command-line interface. It's purpose and goal is to add shortcuts of your Non-Steam Games into your Steam's library; and that without to dictate to you how to organize your games.

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
}
```

For more flexibility check the Profile-Chapter below.

### Start Nostegma

Start Nostegma by entering `npm start`

## Configuration

TODO

### General

TODO

### Profile

TODO

### CLI

TODO

## Plugins

TODO

### ConsoleGridPlugin

TODO

### DolphinPlugin

TODO
### LocalGridPlugin

TODO

## Plans for 0.1.0

* Simple game profile
* Referencing profiles
* I18N
* Complete this README

## Plans for 1.0.0

* GUI
