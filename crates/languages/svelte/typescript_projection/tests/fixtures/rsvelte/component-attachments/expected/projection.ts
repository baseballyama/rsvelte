;

	import C from './C.svelte';
	let x = $state(1);
	let { D }: typeof __rsvelte_public_props0 = $props();
	const a = (n) => {};

;

const __rsvelte_public_props0 = __rsvelte_props({
  D: __rsvelte_untyped_prop(),
}, {}, false);
async () => {
  {
    __rsvelte_component(C)(__rsvelte_internals(), {
      [Symbol("@attach")]: a,
    });
  }
  {
    __rsvelte_component(C)(__rsvelte_internals(), {
      "a": 1,
      [Symbol("@attach")]: (n) => console.log(n, x),
      "b": x,
      [Symbol("@attach")]: a,
    });
  }
  {
    __rsvelte_component(D)(__rsvelte_internals(), {
      children: __rsvelte_children,
      [Symbol("@attach")]: a,
    });
  }
  {
    __rsvelte_component(D)(__rsvelte_internals(), {
      [Symbol("@attach")]: a,
    });
  }
  if (x) {
    {
      __rsvelte_component(C)(__rsvelte_internals(), {
        ...({ y: 1 }),
        [Symbol("@attach")]: a,
      });
    }
  }
  {
    svelteHTML.createElement("button", {
      "onclick": () => x++,
    });
  }
  {
    __rsvelte_component(C)(__rsvelte_internals(), {
      [Symbol("@attach")]: x > 1 ? a : null,
      [Symbol("@attach")]: (n) => a(n, x),
    });
  }
};
const ComponentAttachments__SvelteComponent_ = __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">();
type ComponentAttachments__SvelteComponent_ = ReturnType<typeof ComponentAttachments__SvelteComponent_>;
export default ComponentAttachments__SvelteComponent_;
