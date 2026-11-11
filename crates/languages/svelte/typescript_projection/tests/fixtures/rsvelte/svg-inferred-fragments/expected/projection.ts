;

	import C from './C.svelte';
const dot = (r): ReturnType<import('svelte').Snippet> => {
  async () => {
    {
      svelteHTML.createElement("circle", {
        r,
      });
    }
  };
  return __rsvelte_snippet_return;
};

	let { show = true, label = 'a' }: typeof __rsvelte_public_props0 = $props();

;

const __rsvelte_public_props0 = __rsvelte_props({}, {
  show: true,
  label: 'a',
}, false);
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
const SvgInferredFragments__SvelteComponent_ = __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">();
type SvgInferredFragments__SvelteComponent_ = ReturnType<typeof SvgInferredFragments__SvelteComponent_>;
export default SvgInferredFragments__SvelteComponent_;
