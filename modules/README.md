Subfolder reserved for modules from other git repositories.

Submodules are maintained and updated if necessary between server and repository at every server restart via `packages/modules/index.js`.

# Add a submodule to this repository
Execute the following command from this repositories root folder to add a submodule:
```sh
git submodule add -f https://github.com/username/repository_name.git modules/repository_name/
```

# Pull modules
(Only one time needed after pulling main repo)
```sh
git submodule update --init --recursive
```

# fetch module updates automatically
(Only one time needed after pulling main repo)
```sh
git config --global submodule.recurse true
```

# `client_packages/modulesIndex.js` is updated by `packages/modules/index.js`

To automatically start all client package modules simply add

```js
require("./modules/modulesIndex.js");
```

to your `client_packages/index.js`. Done!