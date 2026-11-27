;
function $$render() {
  let c = $state('a'); let /** @typedef {{ p: any }} $$ComponentProps *//** @type {$$ComponentProps} */ { p } = $props();
;

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
  return (/** @type {typeof __rsvelte_export_component<$$ComponentProps, {}, "">} */ (__rsvelte_export_component))();
}
export const ScopedCustomElement__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof ScopedCustomElement__SvelteComponent_>} ScopedCustomElement__SvelteComponent_ */
export default ScopedCustomElement__SvelteComponent_;
