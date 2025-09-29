---
title: Get Started with React to Web Component
---

To get started using React to Web Component, or `r2wc` for short, just remember the four I's.

## 1. Install 
Make sure the r2wc runtime is available in your project, using your favorite package manager.

```bash tab="npm" title="With NPM"
npm install @r2wc/react-to-web-component
```
```bash tab="yarn" title="With Yarn"
yarn add @r2wc/react-to-web-component
```
```bash tab="pnpm" title="With PNPM"
pnpm install @r2wc/react-to-web-component
```
```bash tab="bun"  title="With Bun"
bun install @r2wc/react-to-web-component
```

## 2. Import
Wherever you create a React component that you want to turn into a Web component, import the r2wc runtime.

```ts
import r2wc from "@r2wc/react-to-web-component";
```

## 3. Implement
The r2wc import is a function, which you call on the React component class or function.  (There are options as well, but that's what the rest of the documentation is for).

```tsx
const MyComponent = (props) => {
  return <>{/* ... */}</>
};

const MyWebComponent = r2wc(MyComponent);

```

## 4. Instantiate
Connect the new Web component class to the desired custom tag using the Custom Elements Registry.

```ts
customElements.define("my-component", MyWebComponent);
```

Now any place in your document where you have a `<my-component>` tag will use your React component to fill its content, and any new `<my-component>` added later will do the same.