;
function $$render() {
  
	let w = $state(0);
	let item = $state({ w: 0 });
	let tag = $state("div");
	let h = $state("");

;

  async () => {
    {
      const __rsvelte_element0 = svelteHTML.createElement("svelte:body", {
        "bind:focused": w,
      });
      w = __rsvelte_element0.clientWidth;
      item.w = __rsvelte_element0.offsetHeight;
      w = /** @type {DOMRectReadOnly} */ (null);
      () => {
        // @ts-ignore
        w = __rsvelte_untyped_prop();
      };
      w = __rsvelte_element0;
    }
    {
      const __rsvelte_element0 = svelteHTML.createElement(tag, {
        "bind:focused": w,
      });
      w = __rsvelte_element0.clientWidth;
      () => {
        // @ts-ignore
        w = __rsvelte_untyped_prop();
      };
    }
    {
      svelteHTML.createElement(tag, {
        "contenteditable": "true",
        "bind:innerHTML": h,
      });
      () => {
        // @ts-ignore
        h = __rsvelte_untyped_prop();
      };
    }
    {
      svelteHTML.createElement("p", {});
      w;
      h;
      item.w;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const ElementBindingsOnSpecialHosts__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof ElementBindingsOnSpecialHosts__SvelteComponent_>} ElementBindingsOnSpecialHosts__SvelteComponent_ */
export default ElementBindingsOnSpecialHosts__SvelteComponent_;
