;

	import A from './A.svelte';
	let { depth = 0, other } = $props();
	let current = $state(A);

;

const __rsvelte_public_props0 = __rsvelte_props({
  other: __rsvelte_untyped_prop(),
}, {
  depth: 0,
}, false);
async () => {
  {
    __rsvelte_component(current)(__rsvelte_internals(), {
      "label": "x",
      depth,
    });
  }
  {
    __rsvelte_component(other ?? A)(__rsvelte_internals(), {
      children: __rsvelte_children,
    });
    (depth);
  }
  if (depth < 3) {
    {
      __rsvelte_component(__rsvelte_any_component)(__rsvelte_internals(), {
        "depth": depth + 1,
      });
    }
  }
};
const SvelteComponent__SvelteComponent_ = __rsvelte_export_component();
export default SvelteComponent__SvelteComponent_;
