;

	import C from './C.svelte';
	/** @type {typeof __rsvelte_public_props0} */ let { show = true, w = 1 } = $props();
	let items = $state([1]);

;

const __rsvelte_public_props0 = __rsvelte_props({}, {
  show: true,
  w: 1,
}, false);
async () => {
  {
    __rsvelte_component(C)(__rsvelte_internals(), {
      "--w": `${w}px`,
    });
  }
  if (show) {
    {
      __rsvelte_component(C)(__rsvelte_internals(), {
        "--a": items.length,
      });
    }
  }
  {
    for (let [, item] of __rsvelte_each(items)) {
      {
        __rsvelte_component(C)(__rsvelte_internals(), {
          children: __rsvelte_children,
          "--b": item,
          "c": item,
        });
        (item);
        C;
      }
    }
  }
  {
    svelteHTML.createElement("div", {});
    {
      __rsvelte_component(C)(__rsvelte_internals(), {
        "--x": Math.max(w, 2),
      });
    }
  }
};
const CssPropsStandalone__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof CssPropsStandalone__SvelteComponent_>} */ (CssPropsStandalone__SvelteComponent_);
