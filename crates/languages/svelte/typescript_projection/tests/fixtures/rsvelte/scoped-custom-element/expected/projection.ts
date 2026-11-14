;
let c = $state('a'); let { p }: typeof __rsvelte_public_props0 = $props();
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
const ScopedCustomElement__SvelteComponent_ = __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">();
type ScopedCustomElement__SvelteComponent_ = ReturnType<typeof ScopedCustomElement__SvelteComponent_>;
export default ScopedCustomElement__SvelteComponent_;
