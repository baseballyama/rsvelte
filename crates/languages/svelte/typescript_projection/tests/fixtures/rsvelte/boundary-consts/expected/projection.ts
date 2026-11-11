;

	import Flaky from './Flaky.svelte';
	let test = $state(1);
	let o = $state({ a: 1, b: [2] });

;

async () => {
  {
    svelteHTML.createElement("button", {
      "onclick": () => test++,
    });
  }
  {
    svelteHTML.createElement("svelte:boundary", {
      failed: () => {
        async () => {
          {
            svelteHTML.createElement("p", {});
            (double);
            (a);
            (c);
          }
        };
        return __rsvelte_snippet_return;
      },
      other: () => {
        async () => {
          {
            svelteHTML.createElement("i", {});
            (double);
          }
        };
        return __rsvelte_snippet_return;
      },
    });
    const double = test * 2;
    const { a, b: [c] } = o;
    {
      __rsvelte_component(Flaky)(__rsvelte_internals(), {});
    }
    {
      svelteHTML.createElement("b", {});
      (double);
      (a);
    }
    __rsvelte_ensure_snippet(other());
  }
  {
    svelteHTML.createElement("svelte:boundary", {});
    const x = test + 1;
    {
      svelteHTML.createElement("p", {});
      (x);
    }
  }
};
const BoundaryConsts__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type BoundaryConsts__SvelteComponent_ = ReturnType<typeof BoundaryConsts__SvelteComponent_>;
export default BoundaryConsts__SvelteComponent_;
