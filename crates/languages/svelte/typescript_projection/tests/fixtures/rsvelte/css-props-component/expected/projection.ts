;

	import C from './C.svelte';
	/** @type {typeof __rsvelte_public_props0} */ let { color = 'red', Dyn } = $props();
	let n = $state(1);

;

const __rsvelte_public_props0 = __rsvelte_props({
  Dyn: __rsvelte_untyped_prop(),
}, {
  color: 'red',
}, false);
async () => {
  {
    __rsvelte_component(C)(__rsvelte_internals(), {
      "--color": color,
      "--size": "2px",
      "a": 1,
    });
  }
  {
    svelteHTML.createElement("svg", {});
    {
      __rsvelte_component(C)(__rsvelte_internals(), {
        "--fill": "blue",
        "--w": n,
      });
    }
  }
  {
    __rsvelte_component(Dyn)(__rsvelte_internals(), {
      children: __rsvelte_children,
      "--x": "1",
    });
    {
      svelteHTML.createElement("p", {});
    }
    Dyn;
  }
  {
    __rsvelte_component(Dyn)(__rsvelte_internals(), {
      "--y": n,
    });
  }
};
const CssPropsComponent__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof CssPropsComponent__SvelteComponent_>} */ (CssPropsComponent__SvelteComponent_);
