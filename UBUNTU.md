# Notes for Ubuntu 20.04 users

Since the version of Node.js installed on Ubuntu 20.04 is `v12.20`, you will need to downgrade [electron-builder](https://github.com/electron-userland/electron-builder) to `v22.10.5`.

## How?

```bash
# Clone this repo.
$ git clone git@github.com:sprout2000/elephicon.git

# And then build this project
$ cd elephicon

$ npm install electron-builder@22.10.5 --save-dev
$ npm run package
```

You will find the AppImage in `release/Elephicon-0.18.x-linux-x64/`.
