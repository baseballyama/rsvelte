;
function $$render() {
  
	let value = $state(1);
	let other = $state('x');

;

  async () => {
    {
      svelteHTML.createElement("div", {
        "contenteditable": "true",
        "bind:innerText": value,
      });
      () => {
        // @ts-ignore
        value = __rsvelte_untyped_prop();
      };
      value;
    }
    {
      svelteHTML.createElement("div", {
        "contenteditable": true,
        "bind:innerHTML": other,
      });
      () => {
        // @ts-ignore
        other = __rsvelte_untyped_prop();
      };
      const raw = () => {
        async () => {
          {
            svelteHTML.createElement("p", {});
            value;
            other;
          }
        };
        return __rsvelte_snippet_return;
      };
      __rsvelte_ensure_snippet(raw());
      {
        svelteHTML.createElement("span", {});
        other;
      }
    }
    {
      svelteHTML.createElement("div", {
        "contenteditable": "plaintext-only",
        "bind:textContent": other,
      });
      () => {
        // @ts-ignore
        other = __rsvelte_untyped_prop();
      };
      other;
    }
    {
      svelteHTML.createElement("p", {});
      value;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const BoundEditableChildren__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof BoundEditableChildren__SvelteComponent_>} BoundEditableChildren__SvelteComponent_ */
export default BoundEditableChildren__SvelteComponent_;
