;

	import C from './C.svelte';
	let { color = 'red', Dyn }: typeof __rsvelte_public_props0 = $props();
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
  }
  {
    __rsvelte_component(Dyn)(__rsvelte_internals(), {
      "--y": n,
    });
  }
};
const CssPropsComponent__SvelteComponent_ = __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">();
type CssPropsComponent__SvelteComponent_ = ReturnType<typeof CssPropsComponent__SvelteComponent_>;
export default CssPropsComponent__SvelteComponent_;
