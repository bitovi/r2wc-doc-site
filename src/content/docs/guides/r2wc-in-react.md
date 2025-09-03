---
title: Using React to Web Component in React
---
## Purpose

Web components are meant to be for every consuming application, regardless of framework.  React is no exception to this, although if you already have a React component, directly importing it into your project without building a Web component is generally preferred.  If there is a case where a Web component is necessary, this is how to import and use that Web component.

## Ingredients

- A bundled, remotely hosted web component built with r2wc
- A React application, which can be based on Next.js or CRA or no framework at all.
## Process
### 1. Load script bundles at runtime
Depending on your underlying framework, you may have a more convenient way than using async, dynamic import, and Suspense.  The Next.js version below, using next/script, is simpler and more readable than the fallback version, and other frameworks may also have simpler methods not explored here.
#### next/script in Next.js
This example shows a configurable component that simply wraps a `nav-links` Web component element.  Using next/script ensures server isomorphism and prevents Next from complaining that the client is making content that the server isn't.  The `global.customElements && customElements.get("nav-links")` guard ensures that the script isn't loaded via script tags twice. The second time the bundle tried to add `<nav-links>` to the custom element registry, it would generate an error.

Even though the script load is not synchronous, the custom tag will activate as a web component once the script is loaded and registers the component constructor with the custom elements registry.

```jsx
import Script from 'next/script';
export default () => (
  <>
    {
      // Make sure you only load the script once.
      global.customElements && customElements.get("nav-links")
        ? null
        : <Script
          src={`//${process.env.NEXT_PUBLIC_WEB_COMPONENT_CDN}$/nav-links.lite.umd.js`}
          type="module"
        />
    }
    <nav-links />
  </>
}
```
#### Dynamic import
This method should work regardless of framework.  It's a little clunky in its use of a lazy loader component,  but it has the advantage of not having to check the custom elements registry since a module loaded through dynamic `import()` only executes once during a page lifetime.
```jsx
import { lazy, Suspense } from 'react';

const WebComponentLoader = lazy(
  async () => {
    await import("https://path.to/remote/module.es.js");
    return ({ propToPass }) => (
      <remote-module-element prop-to-pass={propToPass} />
    );
  }
);
  
export const WrapperComponent = ({ propToPass }) => {
  return (
    <Suspense fallback="Loading....">
      <WebComponentLoader propToPass={propToPass} />
    </Suspense>
  );
}
```

### 2. Handle JSON and Function props
The special prop types for objects and functions 
#### json
For json types, it should only be necessary to remember two things:
1. `JSON.stringify()` any object you pass through attributes
2. Only pass plain objects without circular references

For the example of a breadcrumbs component, with the tokens object converted to json:
```jsx
const WebBreadcrumbs = r2wc(Breadcrumbs, {
  props: {
    initialRoute: "string",
    tokens: "json"
  },
});
```

The strings need no conversion, but the token map is stringified when being passed
```jsx
  <bread-crumbs initial-route={initialRoute} tokens={JSON.stringify(tokens)} />
```

#### function
The function converter expects to read off of the global object, using the string value passed as the attribute value as the property name.  To avoid collisions, we recommend using an expando for the name of the window property.  Use these steps:
1. Create unique IDs for any function that needs to be passed, using `useId()` alongside some prefix text.
2. Place the function on the window using the constructed property name.
3. Set up an effect callback to delete the functions from the global on teardown.
4. Pass the constructed property name as the function attribute value when rendering the web component.
```jsx
const Component = ({
  routeRoot,
  initialRoute,
  onPrefetchRequest,
  onRouteRequest
}) => {
  const routeRequestId = `onRouteRequest${useId()}`;
  const prefetchRequestId = `onPrefetchRequest${useId()}`;
  
  // this has to be done now instead of in the useEffect, because the only
  //  times the global object will be queried for the function are when the
  //  Web component first renders and when the function attribute value updates
  // You could also use a useState() for the property name and also set the
  //   state value in the effect, but this is simpler.
  global[routeRequestId] = onRouteRequest;
  global[prefetchRequestId] = onPrefetchRequest;
  
  useEffect(() => {
    return () => {
      delete global[routeRequestId];
      delete global[prefetchRequestId];
    }
  }, []);
  
  return (
    <>
        <nav-links
        route-root={routeRoot}
        initial-route={initialRoute}
        on-route-request={routeRequestId}
        on-prefetch-request={prefetchRequestId} 
      />
    </>
  )
};
```

#### method
"method" is the newest converter type and only works with properties of the element, not attributes.  As such it works a little differently than the other prop types and needs an effect to use effectively in React.

```jsx
const Component = ({ initialRoute, routeRoot, onRouteRequest }) => {
  const navLinksRef = useRef(null);

  useEffect(() => {
    if (navLinksRef.current) {
      // No need for an expando.  Because the method converter isn't
      //  tied to a string attribute value, there's no second level
      //  of indirection. just use the named property
      navLinksRef.current.onRouteRequest = onRouteRequest;
    }
  }, [navLinksRef.current]);
  
  return (
    <>
        <nav-links
          ref={navLinksRef}
        route-root={routeRoot}
        initial-route={initialRoute}
      />
    </>
  )
};
```
### 3. Handle events
Automatic event dispatching is a newer way for r2wc-bundled Web components to handle actions in the react realm.  Adding a named event to the `events` property of `options` provides a similarly-named action prop to the underlying React component without having to specify it in attributes.  The action dispatches a custom DOM event (removing the leading "on" from the event action name if it exists).

Let's imagine we've added a "syncrequest" event to the `<nav-links>` custom element, that fires when the links need to sync with the remote server.  By default, custom events like `syncrequest` do not bubble, so we'll put a DOM event listener directly on the component element, and when the event is triggered, it will call the same function from the wrapper React component.

This way, the Web component boundary for actions becomes practically seamless, as the wrapper React component handles actions like any React component would, and the underlying React component in the Web component receives an action function as one would expect when writing React comopnents.

```jsx
const NavLinks = ({ onSyncRequest }) => {
  const ref = useRef(null);
  
  useEffect(() => {
    if(ref.current && onSyncRequest) {
      ref.current.addEventListener("syncrequest", onSyncRequest);
      return () => {
        ref.current.removeEventListener("syncrequest", onSyncRequest);
      }
    }
  }, [ref.current, onSyncRequest]);
  
  return (
    <nav-links ref={ref} />
  );
}
```

### 4.  Make wrapper components
This step is optional but highly recommended.  You might notice that some of the code examples in section 2 look like they could be whole React components in their own right, and that's by design.  Combining the script loading and the prop conversion into a wrapper component yields:
* Isolating the interaction with the web component
* A type checked component with a well defined API
* Replay of DOM events as React action handlers

Combining all of the concepts above, and adding in an event boundary, gives us the complete package.

```jsx
/*
Remotely, the <nav-links /> component has been defined like this:
r2Wc(NavLinks, {
 props: {
   routeRoot: "string",
   tokens: "json",
   onRouteRequest: "function",
   onPrefecthRequest: "method",
 },
 events: {
   
 }
})

*/


import { lazy, Suspense, useEffect, useRef } from 'react';

const NavLinksLoader = lazy(
  async () => {
    await import("https://path.to/remote/nav-links.umd.js");
    return () => (
      <nav-links {...props} />
    );
  }
);

export const NavLinks = ({
  initialRoute,
  tokens,
  onRouteRequest,
  onPrefetchRequest,
}) => {
  const ref = useRef(null);

  return (
    <Suspense fallback="Loading....">
      <NavLinksLoader ref={ref} />
    </Suspense>
  );
}

```