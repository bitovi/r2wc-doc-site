---
title: API
---
### Call patterns
`reactToWebComponent(ReactComponent, options)` takes the following:

- `ReactComponent` - A React component that you want to
  convert to a Web Component.
- `options` - A set of parameters.

  - `options.shadow` - ("open", "closed", or undefined) Use the specified shadow DOM mode rather than light DOM.
  - `options.events` - Array of camelCasedProps to dispatch as custom events or a Record of event names to their associated [Event constructor options](https://developer.mozilla.org/en-US/docs/Web/API/Event/Event#options).
    - For each event name in `options.events`, an equivalently named one-argument function is passed to the React component. The first argument to the function is packaged into the event as `detail`.
    - When dispatching events from named properties, "on" is stripped from the beginning of the property name if present, and the result is lowercased: a call to the `onMyCustomEvent` handler dispatches an event named "mycustomevent".
  - `options.props` - Array of camelCasedProps to watch as String values, or a Record of prop names to prop types: `{ [camelCasedProps]: "string" | "number" | "boolean" | "function" | "method" | "json" }`

    - When specifying "json" as the type, the string passed into the attribute must pass `JSON.parse()` requirements.  This type allows the passing of plain Objects and Arrays.
    - When specifying "boolean" as the type, the attribute values "true", "1", "yes", "TRUE", and "t" are mapped to `true`. All strings NOT begining with t, T, 1, y, or Y will be `false`.
    - When specifying "function" as the type, the string passed into the attribute must be the name of a function on `window` (or `global`). The `this` context of the function will be the instance of the WebComponent / HTMLElement when called.
    - When specifying "method" as the type, the prop name will be used to find a function property on the component element object or its prototype chain. The `this` context of the function will be the instance of the WebComponent / HTMLElement when called.

### Return value
  A new class inheriting from `HTMLElement` is
  returned from `reactToWebComponent()`. This class is of type `CustomElementConstructor`, and can be directly passed to `customElements.define` as follows:

```js
customElements.define("web-greeting", reactToWebComponent(Greeting))
```

Or the class can be defined and used later:

```js
const WebGreeting = reactToWebComponent(Greeting)

customElements.define("web-greeting", WebGreeting)

var myGreeting = new WebGreeting()
document.body.appendChild(myGreeting)
```

Or the class can be extended:

```js
class WebGreeting extends reactToWebComponent(Greeting) {
  disconnectedCallback() {
    super.disconnectedCallback()
    // special stuff
  }
}
customElements.define("web-greeting", WebGreeting)
```

### Shadow DOM
Components can also be implemented using [shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM) with either `open` or `closed` mode.

```js
const WebGreeting = reactToWebComponent(Greeting, {
  shadow: "open",
})

customElements.define("web-greeting", WebGreeting)

var myGreeting = new WebGreeting()
document.body.appendChild(myGreeting)

var shadowContent = myGreeting.shadowRoot.children[0]
```

### PropTypes
If propTypes are defined on the underlying React component and `options.props` is not passed in the call to `reactToWebComponent()`, dashed-attributes on the webcomponent are converted into the corresponding camelCase React props and the string attribute value is passed in.

```jsx
function Greeting({ camelCaseName }) {
  return <h1>Hello, {camelCaseName}</h1>
}
Greeting.propTypes = {
  camelCaseName: PropTypes.string.isRequired,
}

customElements.define(
  "my-dashed-style-greeting",
  reactToWebComponent(Greeting, {}),
)

document.body.innerHTML =
  '<my-dashed-style-greeting camel-case-name="Christopher"></my-dashed-style-greeting>'

console.log(document.body.firstElementChild.innerHTML) // "<h1>Hello, Christopher</h1>"
```

This is a legacy behavior.  We do not recommend using PropTypes to configure React to Web Component, since PropTypes are usually removed in production, interfering with the prop conversions.

If `options.props` is specified, R2WC will use those props instead of the keys from propTypes. If it's an array, all corresponding kebab-case attr values will be passed as strings to the underlying React component.

```jsx
function Greeting({ camelCaseName }) {
  return <h1>Hello, {camelCaseName}</h1>
}

customElements.define(
  "my-dashed-style-greeting",
  reactToWebComponent(Greeting, {
    props: { camelCaseName: "string" },
  }),
)

document.body.innerHTML =
  '<my-dashed-style-greeting camel-case-name="Jane"></my-dashed-style-greeting>'

console.log(document.body.firstElementChild.innerHTML) // "<h1>Hello, Jane</h1>"
```
