---
title: Custom components and events in TypeScript
---
## Purpose

You've found the perfect r2wc component, remotely hosted, to integrate into your application.  Great!  But wait, you're using Typescript and you aren't sure that the types for the custom tags and their properties are going to line up correctly with your usage.  It would be nice to be sure about this, and to avoid @ts-expect-error, wouldn't it?  Here's how to configure Typescript to accept your new types.
## Ingredients

* **A Typescript project** -- the instructions for this recipe should work regardless of runtime (Node/deno/Bun/etc./none) or builder (Webpack/Vite/etc.)
* **A tsconfig that includes the "dom" library**. This may be indirectly included through an es20XX.full or other compendium library.
* **Programmatic interaction with HTML tags**.
  * Typescript doesn't check HTML files or strings of HTML content for the correct DOM type for the tags involved, but if you do a `document.createElement()` or a JSX expression anywhere in your code, this *will* be typechecked for proper HTML tag usage! Yay!

## Process

### 1: Establish a global type for your tag
> **Note:** JSDoc tags for HTML elements are not understood by Typescript.  To add a custom element to TS it's important to define an API interface instead of using `@element` and `@attribute` tags.  It would be nice to have `@element` be converted into the appropriate interface, but it's not likely to ever be on the Typescript roadmap.

To illustrate how this recipe works in practice, we are going to use the NavLinks example.  Ignoring the actual implementation, consider this Web component version of a React component with two string props:

```ts
const WebNavLinks = r2wc(NavLinks, {
  props: {
      routeRoot: "string",
      initialRoute: "string",
  },
});
customElements.define("nav-links", WebNavLinks);
```

We might want to set `routeRoot` or `initialRoute` as element props later.  Remember that props for the underlying component can be set through attributes on the tag or through properties on the DOM element object.  Because of how the Typescript DOM library is implemented, `setAttribute()` can set any string attribute name.  It does not validate that the attribute is an intrinsic attribute on the DOM element.  However, the *properties* of the element object are strictly type-checked.

```ts
const customEl = document.createElement("nav-links");
customEl.setAttribute("route-root", "/");  // this is fine
customEl.routeRoot = "/";                  // this will error
```

To allow the properties of the element object to be read and set, it is sufficient to typecast it when creating or referencing an element.  However, for the most flexibility in type inference (`createElement`, `getElementsByTagName`, and specific cases of `closest`, `querySelector`, and `querySelectorAll` where the selector is only the tag name), add the interface to the tag name map.

```ts
interface WebNavLinks extends HTMLElement {
  routeRoot: string;
  initialRoute: string;
}

declare global {
    interface HTMLElementTagNameMap {
      "nav-links": WebNavLinks;
    }
}
```

### 1a: Add the tag and attribute types to JSX (if needed)
Unlike the DOM interface, JSX validates attribute names against a known list.  So if you are using JSX to create your markup (e.g. with React or Stencil), then a second step is needed.

This process is unfortunately not universal across frameworks and libraries that use JSX.  Below are examples for React and Stencil.  If you need pointers for creating types for a different JSX framework, try asking in [the Discord](https://discord.gg/NBwjRNed)!
#### React

```ts
declare global {
  namespace JSX {
    interface IntrinsicElements {
        // the two template args represent
        // - the attributes type; and
        // - the type pararmeter for the React ref
        // The template parameter in HTMLAttributes is the element type 
        //   to pass to event handlers.
        "nav-links": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
    }
  }
}
```
#### Stencil
Stencil projects generate a type declaration for stencil components, which is helpful to understand how Stencil updates global and local namespaces to support custom elements.  For our NavLinks example, the type of the element itself is added to the global namespace as a type with a constructor form, allowing type-safe `new` to be called.  In addiiion, Stencil's JSX type library needs to be extended to support the specific custom attributes for the `nav-links` tag, as well as the common JSX attributes for HTML tags.

```ts
import { JSXBase } from "@stencil/core/internal";

// define the attributes by kebab-casing the prop names
// the prop values are always strings for custom elements.
//   You can use boolean and number where appropriate, in order to restrict
//   inputs, but don't use object or function!
interface NavLinksAttributes {
  "route-root": string;
  "initial-route": string;
}

// this part is only necessary if creating a typed ref of a NavLinks
//  element elsewhere in code.  For brevity, you can delete this block
//  and type the IntrinsicElements record below as `NavLinksAttrubtes &
//  JSXBase.HTMLAttributes`
declare global {
  interface HTMLNavLinksElement extends NavLinksAttributes {}
  var HTMLNavLinksElement: {
    prototype: HTMLNavLinksElement;
    new (): HTMLNavLinksElement;
  };
  interface HTMLElementTagNameMap {
    'nav-links': HTMLNavLinksElement;
  }
}

declare module "@stencil/core" {
  export namespace JSX {
    interface IntrinsicElements {
      "nav-links": NavLinksAttributes &
        JSXBase.HTMLAttributes<HTMLNavLinksElement>;
    }
  }
}
```

### 2: Add custom events to the DocumentEventMap

Custom events could in theory be generated by code inside your React components, but this is a rare use. More likely they will be created and broadcast through the `events` configuration property.  In either case, a custom event should have its type declared to specify both its CustomEvent heritage and its detail and/or special properties.

In the example below, the `PrefetchRequestEvent` and `RouteRequestEvent` interfaces declare three things:
1. They implement the `CustomEvent` interface.  Generally this means that they are created by the `CustomEvent` constructor.
2. They contain `detail` properties that contain `href` as a string.  `detail` is part of the `CustomEvent` specification, and template parameter for the `CustomEvent` type determines what is in it.
3. They additionally contain an `originalEvent` property not contained within `detail`. This is not standard for the DOM `Event` interface, but common for events that have been generated by other events.  In each case here, the `originalEvent` is the React mouse event that triggered the DOM custom event.

```ts
export interface PrefetchRequestEvent extends CustomEvent<{
    href: string;
}> {
    originalEvent: ReactMouseEvent;
}
export interface RouteRequestEvent extends CustomEvent<{
    href: string;
}> {
    originalEvent: ReactMouseEvent;
}
declare global {
    interface HTMLElementEventMap {
        "prefetchrequest": PrefetchRequestEvent;
        "routerequest": RouteRequestEvent;
    }
}
```

### Verifying the final product
If everything has been implemented correctly, this checklist of usage should all pass:
- Can the custom element be used in JSX without a type error?
- Can the custom element's attributes all be specified without a type error?
- Can the appropriate custom event object be dispatched on its corresponding event without a type error?
- When adding an event listener, does Intellisense provide the correct event type parameter to the callback?

If all of those are working, happy coding!
