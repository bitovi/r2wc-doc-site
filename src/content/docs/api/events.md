---
title: Event dispatching
---
As an alternative to using function props, the `events` object insructs r2wc to dispatch a corresponding DOM event that can be listened to on the custom element itself, on ancestor elements using `bubbles`, and outside of any containing shadow DOM using `composed`.

```js
function ThemeSelect({ onSelect }) {
  return (
    <div>
      <button onClick={() => onSelect("V")}>V</button>
      <button onClick={() => onSelect("Johnny")}>Johnny</button>
      <button onClick={() => onSelect("Jane")}>Jane</button>
    </div>
  )
}

const WebThemeSelect = reactToWebComponent(ThemeSelect, {
  events: { onSelect: { bubbles: true } } // dispatches as "select", will bubble to ancestor elements but not escape a shadow DOM
})

customElements.define("theme-select", WebThemeSelect)

document.body.innerHTML = "<theme-select></theme-select>"

setTimeout(() => {
  const element = document.querySelector("theme-select")
  element.addEventListener("select", (event) => {
    // "event.target" is the instance of the WebComponent / HTMLElement
    const thisIsEl = event.target === element
    console.log(thisIsEl, event.detail)
  })
  document.querySelector("theme-select button:last-child").click()
}, 0)
// ^ calls event listener, logs: true, "Jane"
```

> Note: `events` and `props` entries should not be used for the same named property.  During initial setup, the event handler will overwrite the function property handler, and if the attribute changes after construction, the new function property handler will overwrite the event handler.