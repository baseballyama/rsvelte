;
import Chart from './Chart.svelte';;

;

function $$render() {
  
	

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
  return (/** @type {typeof __rsvelte_export_isomorphic<{ [x: string]: never }, { [evt: string]: CustomEvent<any> }, {}, string>} */ (__rsvelte_export_isomorphic))()({});
}
export const SvgAOutsideElements__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof SvgAOutsideElements__SvelteComponent_>} SvgAOutsideElements__SvelteComponent_ */
export default SvgAOutsideElements__SvelteComponent_;
