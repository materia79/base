# base resources
For Rage Multiplayer (https://rage.mp)

# clientlogger
Clientside debug utility merging duplicate messages saving nerves.

Usage clientside:
```JS
mp.log("Hello beast!");
```

Output on server console:
```
[WeirdNewbie(0)] Hello beast!
```

## Example for merged duplicate messages:
![alt text](example.png)

Usage clientside:
```JS
let func=() => {
   mp.log("test");
};

mp.events.add("render", func);
setTimeout(() => { mp.events.remove("render", func); }, 10000);
```

Output on server console:
```
[WeirdNewbie(0)] test [ 185 x DUP ]
[WeirdNewbie(0)] test [ 185 x DUP ]
[WeirdNewbie(0)] test [ 185 x DUP ]
[WeirdNewbie(0)] test [ 59 x DUP ]
```
