# hide-my-secrets 

A Visual Studio Code extension to hide secret text in YAML files. The extension is written live on Twitch on [emadashi's channel](https://twitch.tv/emadashi). So make sure you join every Thursday at 20:00 AEST time.

![Hiding Secrets](https://raw.githubusercontent.com/eashi/hide-my-secrets/master/hide-my-secret.gif)


## Acknowledgement

Awesome people in the Twitch channel help without calling for credit, without them this extension wouldn't have been possible. Big thanks to them:

- [@codeandcoffee](https://github.com/tkoster)
- [@jsobell](https://github.com/jsobell)
- [@jothamr](https://www.twitch.tv/jothamr)
- Amal Abeygunawardana
- [@pjimmy](https://twitter.com/pjimmy)
- [@hossambarakat](https://twitter.com/hossambarakat_)
- [@JTango18](https://twitter.com/jtango18)

## Features

Once activated this extension hides secrets in YAML files. The secrets can be identified by configuring the extension and adding keys that are considered secrets e.g. "password", "key", "token"..etc.

## Extension Settings
### Hide
Toggle the extension on and off to hide/unhide the secrets.
``` js
"hide-my-secrets.hide": true,
```
### List of secret keys
Add here all the keys that represent secrets.
``` js
"hide-my-secrets.secretKeys": [
        "password",
        "connectionstring",
        "token"
    ]
```
