---
title: Programmatic and Delcarative Usage
---
You can use `<web-greeting>` from [the complete example](/get-started/complete-example) programatically, instead of having to define in in static HTML.  This can be useful when integrating with frameworks, or automating a component when no framework is being used.

```js
const webGreeting = document.createElement("web-greeting")
webGreeting.name = "Justin"

document.body.append(webGreeting)

webGreeting.innerHTML //-> "<h1>Hello, Justin</h1>"
```

Or you can use it declaratively:

```js
document.body.innerHTML = "<web-greeting></web-greeting>"

document.body.firstChild.name = "I do declare"

document.body.firstChild.innerHTML //-> "<h1>Hello, I do declare</h1>"
```
