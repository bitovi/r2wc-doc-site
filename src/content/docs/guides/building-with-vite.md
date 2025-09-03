---
title: Building with Vite
---

## Purpose 
Vite is our preferred engine at Bitovi for building script bundles with React to Web Component.  It's proven to be flexible and powerful enough to meet our needs.  Building Web components for publishing takes some amount of scripting of the Vite build engine, which is detailed in this recipe.

## Ingredients
- A React component, unencumbered by Next or deep framework dependencies.
- A module that creates a Web component from your React Component using React to Web Component
- A project repository containing the component and web component, where Vite can be installed.
- `vite` installed into your project's devDependencies.
- `@vitejs/plugin-react` installed into your project's devDependencies.

## Process
### 1. Configure Vite

Use this template to get started building your React component. Save to your project root as `vite-build.mjs`:
```js
import path from "path";
import url from "url";
import { build, defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import typescript from '@rollup/plugin-typescript';  // if you're using typescript, install this too
import { writeFile } from "fs/promises";

const componentName = ""; // fill this in with your Web component file name, minus the extension

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const wCConfig = {
  plugins: [],
  entry: path.resolve(__dirname, `./webcomponents/${componentName}.js`), // adjust path for your project
  name: componentName,
  formats: ["umd"],  // es6 is also an option here but we prefer to just publish UMD files
};

const getConfiguration = ({ plugins, ...library }, mode) => {
  return defineConfig(() => ({
    define: {
      'process.env': { NODE_ENV: "production" }
    },
    plugins: [
      react(),
      typescript(), // if you're using typescript
      ...plugins
    ],
    build: {
      emptyOutDir: false,
      lib: {
        ...library,
        fileName: (format) => `${library.name}.${format}.js`
      },
      "outDir": "./public",
      rollupOptions: {},
    },
  }));
};

const viteBuild = (configFactory) => {
  const config = configFactory();
  return build(config);
};

const buildLibraries = async () => {
  await viteBuild(getConfiguration(wCConfig))
};

buildLibraries();
```

Run this file with `node vite-build.mjs` and your full dependencies bundle will be output to `public/`.  The script bundle can be immediately deployed to the Web and imported into remote projects.

### 2.  Publish multiple Web components.
Let's say we wanted to have this script build multiple Web components.  That's easy to shoehorn in.  Starting at line 10 we'll just make a bunch of configs.

```js
const breadCrumbsWCConfig = {
  plugins: [],
  entry: path.resolve(__dirname, "./webcomponents/bread-crumbs.js"),
  name: "bread-crumbs",
  formats: ["umd"],
};
const navLinksWCConfig = {
  plugins: [],
  entry: path.resolve(__dirname, "./webcomponents/nav-links.js"),
  name: "nav-links",
  formats: ["umd"],
};
const pageContentWCConfig = {
  plugins: [],
  entry: path.resolve(__dirname, "./webcomponents/page-content.js"),
  name: "page-content",
  formats: ["umd"],
};
```

And then in `buildLibraries` we'll just make all the builds at once and wait for them to complete:
```js
const buildLibraries = async () => {
  await Promise.all([
      viteBuild(getConfiguration(breadCrumbsWCConfig, mode)),
      viteBuild(getConfiguration(navLinksWCConfig, mode)),
      viteBuild(getConfiguration(pageContentWCConfig, mode)),
  ]);
};
```

### 3. (optional) Make a lite bundle

All of these components depend on React, so all of these bundles are bundling React and whatever else they depend on.  What if we just combined the shared dependencies into one bundle, thereby saving some download and execution time?

It's reasonable to ask, how do we get references in one bundle to point to exports of another bundle?  It turns out that through rollup, Vite already has a feature for this!

To use it, we'll have to do a bit of extra work.  First, identify all of the dependencies we want to externalize, and make a script that imports them and puts them on the global object.

```js
import React from "react";
import ReactDOM from "react-dom/client";
import ReactJSXRuntime from "react/jsx-runtime";

const rootObj = typeof window !== "undefined" ? window : global

rootObj.React = React;
rootObj.ReactDOM = ReactDOM;
rootObj.ReactJSXRuntime = ReactJSXRuntime;
```

We'll call this `webcomponents/dependencies.js`.  Now with that file created, we can make a build config for it in `vite-build.mjs`.

```js
const dependenciesConfig = {
  plugins: [],
  entry: path.resolve(__dirname, "./webcomponents/dependencies.js"),
  name: "dependencies",
  formats: ["umd"],
};
```

In addition to this, we have to use the `globals` feaature of `rollup` in our Vite config. First let's put the config in a variable.

```js
const liteRollup = {
  external: Object.keys(globals),
  output: {
    globals: {
      "react": "React",
      "react-dom/client": "ReactDOM",
      "react/jsx-runtime": "ReactJSXRuntime"
    }
  },
}
```

Note that each key in `globals` is the name of an import in our dependencies file, and the value for the key is the name we gave it on the global object.

Now in `getConfiguration` we'll change the `build` option to consider a `lite` option using the previously-unused `mode` parameter.

```js
    build: {
      emptyOutDir: false,
      lib: {
        ...library,
        fileName: (format) => `${library.name}.${mode}.${format}.js`
      },
      "outDir": "./public",
      rollupOptions: mode === "lite" ? liteRollup : {},
    },
```

Finally we'll make both the full and lite builds in `buildLibraries`:

```js
const buildLibraries = async () => {
  await Promise.all([].concat(
    ...["lite", "full"].map(mode => [
      viteBuild(getConfiguration(breadCrumbsWCConfig, mode)),
      viteBuild(getConfiguration(navLinksWCConfig, mode)),
      viteBuild(getConfiguration(pageContentWCConfig, mode)),
    ]),
    [viteBuild(getConfiguration(dependenciesConfig, "full"))]
  ));
};
```

After running the build script now, we'll have full and lite versions of our three Web component bundles, as well as a dependencies bundle.  As long as dependencies is loaded first by the consumer, the lite version will work just like the full version!