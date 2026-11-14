;

	import C from './C.svelte';
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

	/** @type {typeof __rsvelte_public_props0} */ let { show = true, label = 'a' } = $props();

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
const SvgInferredFragments__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof SvgInferredFragments__SvelteComponent_>} */ (SvgInferredFragments__SvelteComponent_);
