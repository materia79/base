Subfolder reserved for modules from other git repositories.

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
