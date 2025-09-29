---
title: Function props
---

When `"function"` is specified as the type, attribute values on the web component will be converted into function references when passed into the underlying React component. The string value of the attribute must be a valid reference to a function on `window` (or on `global`).

> Note: If you want to avoid global functions, instead of passing an attribute you can pass an `events` object in options, and listen on events using `addEventListener` on the custom element. See below.

```jsx
function ThemeSelect({ handleClick }) {
  return (
    <div>
      <button onClick={() => handleClick("V")}>V</button>
      <button onClick={() => handleClick("Johnny")}>Johnny</button>
      <button onClick={() => handleClick("Jane")}>Jane</button>
    </div>
  )
}

const WebThemeSelect = reactToWebComponent(ThemeSelect, {
  props: {
    handleClick: "function",
  },
})

customElements.define("theme-select", WebThemeSelect)

window.globalFn = function (selected) {
  // "this" is the instance of the WebComponent / HTMLElement
  const thisIsEl = this === document.querySelector("theme-select")
  console.log(thisIsEl, selected)
}

document.body.innerHTML =
  "<theme-select handle-click='globalFn'></theme-select>"

setTimeout(
  () => document.querySelector("theme-select button:last-child").click(),
  0,
)
// ^ calls globalFn, logs: true, "Jane"
```
