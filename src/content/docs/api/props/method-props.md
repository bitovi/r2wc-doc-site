---
title: Method props
---

When `method` is specified as the type, the prop will be bound to a method that can be defined directly on the custom element instance. Unlike `function` props that reference global functions, `method` props allow you to define class methods directly on the web component element, providing better encapsulation and avoiding global namespace pollution.

This is particularly useful when you want to pass functions from parent components or when you need to define behavior specific to each web component instance.

```js
function ClassGreeting({ name, sayHello }) {
  return (
    <div>
      <h1>Hello, {name}</h1>
      <button onClick={sayHello}>Click me</button>
    </div>
  )
}

const WebClassGreeting = reactToWebComponent(ClassGreeting, {
  props: {
    name: "string",
    sayHello: "method",
  },
})

customElements.define("class-greeting", WebClassGreeting)


document.body.innerHTML = '<class-greeting name="Christopher"></class-greeting>'

const element = document.querySelector("class-greeting")

const myMethod = function(this: HTMLElement) {
  const nameElement = this.querySelector("h1") as HTMLElement;
  nameElement.textContent = "Hello, again rerendered";
}

element.sayHello = myMethod.bind(element)

setTimeout(() => {
  document.querySelector("class-greeting button").click()
}, 0)
```
