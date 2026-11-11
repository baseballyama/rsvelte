;

	let { x = 1, items = [], fill = 'red' }: typeof __rsvelte_public_props0 = $props();

;

const __rsvelte_public_props0 = __rsvelte_props({}, {
  x: 1,
  items: __rsvelte_array_prop(),
  fill: 'red',
}, false);
async () => {
  {
    svelteHTML.createElement("g", {
      "class": "axis",
      "transform": `translate(${x}, 0)`,
    });
    {
      for (let [, item] of __rsvelte_each(items)) {
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
          (item);
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
const SvgWithoutSvg__SvelteComponent_ = __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">();
type SvgWithoutSvg__SvelteComponent_ = ReturnType<typeof SvgWithoutSvg__SvelteComponent_>;
export default SvgWithoutSvg__SvelteComponent_;
