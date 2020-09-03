Subfolder reserved for modules from other git repositories.
# Add submodule to this repository (base)
```sh
git submodule add https://server.tld/path/<name of repository>.git client_packages/modules/<name of repository>/
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
