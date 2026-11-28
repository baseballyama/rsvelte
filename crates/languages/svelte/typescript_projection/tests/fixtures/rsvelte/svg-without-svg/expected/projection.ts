;
function $$render() {
  
	let /** @typedef {{ x?: number, items?: any[], fill?: string }} $$ComponentProps *//** @type {$$ComponentProps} */ { x = 1, items = [], fill = 'red' } = $props();

;

  async () => {
    {
      svelteHTML.createElement("g", {
        "class": "axis",
        "transform": `translate(${x}, 0)`,
      });
      {
        for (let item of __rsvelte_each(items)) {
          {
            svelteHTML.createElement("line", {
              "x1": item,
              "x2": item,
              "y2": "10",
              "stroke-width": "2",
            });
          }
          {
            svelteHTML.createElement("text", {
              "dominant-baseline": "hanging",
              "textLength": 10,
            });
            item;
          }
        }
      }
      {
        svelteHTML.createElement("linearGradient", {
          "id": "g",
          "gradientUnits": "userSpaceOnUse",
        });
        {
          svelteHTML.createElement("stop", {
            "offset": "0",
            "stop-color": fill,
          });
        }
      }
    }
    {
      svelteHTML.createElement("path", {
        "d": "M0 0",
        fill,
      });
    }
  };
  return (/** @type {typeof __rsvelte_export_component<$$ComponentProps, {}, "">} */ (__rsvelte_export_component))();
}
export const SvgWithoutSvg__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof SvgWithoutSvg__SvelteComponent_>} SvgWithoutSvg__SvelteComponent_ */
export default SvgWithoutSvg__SvelteComponent_;
