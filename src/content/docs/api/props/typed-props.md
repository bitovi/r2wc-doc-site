---
title: Typed Props
---

If `options.props` is an object, the keys are the camelCased React props and the values are any one of the following built in javascript types.
This is the recommended way of passing props to r2wc.

`"string" | "number" | "boolean" | "function" | "method" | "json"`

"json" can be an array or object. The string passed into the attribute must pass `JSON.parse()` requirements.

### "string" | "number" | "boolean" | "json" props

```jsx
function AttrPropTypeCasting(props) {
  console.log(props) // Note
  return <h1>Hello, {props.stringProp}</h1>
}

customElements.define(
  "attr-prop-type-casting",
  reactToWebComponent(AttrPropTypeCasting, {
    props: {
      stringProp: "string",
      numProp: "number",
      floatProp: "number",
      trueProp: "boolean",
      falseProp: "boolean",
      arrayProp: "json",
      objProp: "json",
    },
  }),
)

document.body.innerHTML = `
  <attr-prop-type-casting
    string-prop="iloveyou"
    num-prop="360"
    float-prop="0.5"
    true-prop="true"
    false-prop="false"
    array-prop='[true, 100.25, "👽", { "aliens": "welcome" }]'
    obj-prop='{ "very": "object", "such": "wow!" }'
  ></attr-prop-type-casting>
`

/*
  console.log(props) in the functions produces this:
  {
    stringProp: "iloveyou",
    numProp: 360,
    floatProp: 0.5,
    trueProp: true,
    falseProp: false,
    arrayProp: [true, 100.25, "👽", { aliens: "welcome" }],
    objProp: { very: "object", such: "wow!" },
  }
*/
```

For function and method props, see the next sections.