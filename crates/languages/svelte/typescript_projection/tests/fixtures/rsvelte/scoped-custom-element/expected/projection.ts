;
let c = $state('a'); /** @type {typeof __rsvelte_public_props0} */ let { p } = $props();
;

const __rsvelte_public_props0 = __rsvelte_props({
  p: __rsvelte_untyped_prop(),
}, {}, false);
async () => {
  {
    svelteHTML.createElement("my-el", {});
  }
  {
    svelteHTML.createElement("my-el", {
      "id": "x",
    });
  }
  {
    svelteHTML.createElement("my-el", {
      "class": "k",
    });
  }
  {
    svelteHTML.createElement("my-el", {
      "class": c,
    });
  }
  {
    svelteHTML.createElement("my-el", {});
    (c);
  }
  {
    svelteHTML.createElement("my-el", {
      ...(p),
    });
  }
  {
    svelteHTML.createElement("div", {});
    {
      svelteHTML.createElement("my-el", {
        "a": c,
      });
    }
  }
};
const ScopedCustomElement__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof ScopedCustomElement__SvelteComponent_>} */ (ScopedCustomElement__SvelteComponent_);
