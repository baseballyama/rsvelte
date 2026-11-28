;
import A from './A.svelte';;

;

function $$render() {
  
	
	let /** @typedef {{ depth?: number, other: any }} $$ComponentProps *//** @type {$$ComponentProps} */ { depth = 0, other } = $props();
	let current = $state(A);

;

  async () => {
    {
      __rsvelte_component(current)(__rsvelte_internals(), {
        "label": "x",
        depth,
      });
    }
    {
      __rsvelte_component(other ?? A)(__rsvelte_internals(), {
        children: __rsvelte_children,
      });
      depth;
    }
    if (depth < 3) {
      {
        __rsvelte_component(__rsvelte_any_component)(__rsvelte_internals(), {
          "depth": depth + 1,
        });
      }
    }
  };
  return (/** @type {typeof __rsvelte_export_component<$$ComponentProps, {}, "">} */ (__rsvelte_export_component))();
}
export const SvelteComponent__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof SvelteComponent__SvelteComponent_>} SvelteComponent__SvelteComponent_ */
export default SvelteComponent__SvelteComponent_;
