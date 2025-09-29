---
title: Complete Example
---
This example shows how the Web component created with React to Web Component, or `r2wc` for short, is created and used in a simple Web page.

`r2wc` works with React components that utilize external libraries like Material-Ui:

```tsx
import { Button } from "@mui/material"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import r2wc from '@r2wc/react-to-web-component'

interface GreetingProps {
  name: string
  description: string
  colorMode?: "light" | "dark" | undefined
  buttonVariant?: "contained" | "text" | "outlined" | undefined
}

export const Greeting = ({
  name,
  description,
  colorMode = "light",
  buttonVariant = "text",
}: GreetingProps) => {
  const themeMode = createTheme({
    palette: {
      mode: colorMode,
    },
  })

  return (
    <ThemeProvider theme={themeMode}>
      <main>
        <h1>Hello, {name}</h1>
        <p>{description}</p>
        <Button variant={buttonVariant}>This is the button</Button>
      </main>
    </ThemeProvider>
  )
}

const WebGreeting = r2wc(Greeting, {
  props: {
    name: "string",
    description: "string",
    colorMode: "string",
    buttonVariant: "string",
  },
})

customElements.define("web-greeting", WebGreeting)
```

```html
<body>
  <h1>Greeting Demo</h1>

  <web-greeting name="Sven" description="How do you do?"></web-greeting>
</body>
```

Using the `WebGreeting` component with a few provided attributes, while also not filling out the `colorMode` or `buttonVariant`, will cause the component to render with [Theme Provider's Light Theme](https://mui.com/material-ui/customization/dark-mode/), and with the text variant for Material UI's [Button Component](https://mui.com/material-ui/react-button/)

If we set those attributes (`colorMode` and `buttonVariant`):

```html
<body>
  <h1>Greeting Demo</h1>

  <web-greeting
    name="Sven"
    description="How do you do?"
    color-mode="dark"
    button-variant="contained"
  >
  </web-greeting>
</body>
```

The Theme Provider will use the Dark Theme instead, and the Button Component wiill use the contained variant.

Thus, using `r2wc` you can interact with React Components using Third Party Libraries with ease.
