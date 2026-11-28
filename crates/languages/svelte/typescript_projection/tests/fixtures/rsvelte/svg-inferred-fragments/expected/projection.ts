;
import C from './C.svelte';;

;

function $$render() {
  
	
  const dot = (r) => {
    async () => {
      {
        svelteHTML.createElement("circle", {
          r,
        });
      }
    };
    return __rsvelte_snippet_return;
  };

	let /** @typedef {{ show?: boolean, label?: string }} $$ComponentProps *//** @type {$$ComponentProps} */ { show = true, label = 'a' } = $props();

;

  async () => {
    {
      __rsvelte_component(C)(__rsvelte_internals(), {
        children: __rsvelte_children,
      });
      {
        svelteHTML.createElement("rect", {
          "width": "1",
          "height": show ? 1 : 2,
        });
      }
      __rsvelte_ensure_snippet(dot(2));
      C;
    }
    {
      svelteHTML.createElement("div", {});
      {
        svelteHTML.createElement("path", {
          "d": "M0 0",
          "viewBox": "0 0 1 1",
          "class": label,
        });
      }
    }
    {
      svelteHTML.createElement("svg", {
        "viewBox": "0 0 1 1",
      });
      {
        svelteHTML.createElement("foo", {});
        if (show) {
          {
            svelteHTML.createElement("circle", {
              "r": "1",
            });
          }
        }
      }
    }
    if (show) {
      {
        svelteHTML.createElement("ellipse", {
          "rx": "1",
        });
      }
    }
  };
  return (/** @type {typeof __rsvelte_export_component<$$ComponentProps, {}, "">} */ (__rsvelte_export_component))();
}
export const SvgInferredFragments__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof SvgInferredFragments__SvelteComponent_>} SvgInferredFragments__SvelteComponent_ */
export default SvgInferredFragments__SvelteComponent_;
