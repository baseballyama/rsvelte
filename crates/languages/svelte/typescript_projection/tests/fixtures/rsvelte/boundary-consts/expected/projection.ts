;
import Flaky from './Flaky.svelte';;

;

function $$render() {
  
	
	let test = $state(1);
	let o = $state({ a: 1, b: [2] });

;

  async () => {
    {
      svelteHTML.createElement("button", {
        "onclick": () => test++,
      });
    }
    {
      svelteHTML.createElement("svelte:boundary", {
        failed: () => {
          async () => {
            {
              svelteHTML.createElement("p", {});
              double;
              a;
              c;
            }
          };
          return __rsvelte_snippet_return;
        },
        other: () => {
          async () => {
            {
              svelteHTML.createElement("i", {});
              double;
            }
          };
          return __rsvelte_snippet_return;
        },
      });
      const double = test * 2;
      const { a, b: [c] } = o;
      {
        __rsvelte_component(Flaky)(__rsvelte_internals(), {});
      }
      {
        svelteHTML.createElement("b", {});
        double;
        a;
      }
      __rsvelte_ensure_snippet(other());
    }
    {
      svelteHTML.createElement("svelte:boundary", {});
      const x = test + 1;
      {
        svelteHTML.createElement("p", {});
        x;
      }
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const BoundaryConsts__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof BoundaryConsts__SvelteComponent_>} BoundaryConsts__SvelteComponent_ */
export default BoundaryConsts__SvelteComponent_;
