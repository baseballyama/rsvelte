;

	import Chart from './Chart.svelte';

;

async () => {
  {
    svelteHTML.createElement("svg", {});
    const link = () => {
      async () => {
        {
          svelteHTML.createElement("a", {
            "href": "/x",
          });
          {
            svelteHTML.createElement("tspan", {});
          }
        }
      };
      return __rsvelte_snippet_return;
    };
    __rsvelte_ensure_snippet(link());
  }
  {
    __rsvelte_component(Chart)(__rsvelte_internals(), {
      children: __rsvelte_children,
    });
    {
      svelteHTML.createElement("a", {
        "href": "/y",
      });
      {
        svelteHTML.createElement("circle", {
          "r": "1",
        });
      }
    }
    Chart;
  }
  {
    svelteHTML.createElement("a", {
      "href": "/z",
    });
    {
      svelteHTML.createElement("b", {});
    }
  }
};
const SvgAOutsideElements__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof SvgAOutsideElements__SvelteComponent_>} */ (SvgAOutsideElements__SvelteComponent_);
