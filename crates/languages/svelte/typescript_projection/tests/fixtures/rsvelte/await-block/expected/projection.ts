;

	let { load, other }: typeof __rsvelte_public_props0 = $props();
	let count = $state(0);

;

const __rsvelte_public_props0 = __rsvelte_props({
  load: __rsvelte_untyped_prop(),
  other: __rsvelte_untyped_prop(),
}, {}, false);
async () => {
  {
    {
      svelteHTML.createElement("p", {});
      (count);
    }
    try {
      const __rsvelte_awaited = await (load(count));
      {
        const value = __rsvelte_awaited;
        {
          svelteHTML.createElement("p", {});
          (value);
        }
      }
    } catch (__rsvelte_error) {
      const error = __rsvelte_untyped_prop();
      {
        svelteHTML.createElement("p", {});
        (error.message);
      }
    }
  }
  {
    const __rsvelte_awaited = await (other);
    {
      const { name, size = 1 } = __rsvelte_awaited;
      {
        svelteHTML.createElement("b", {});
        (name);
        (size);
      }
    }
  }
  {
    try {
      await (other);
    } catch (__rsvelte_error) {
      const e = __rsvelte_untyped_prop();
      {
        svelteHTML.createElement("i", {});
        (e);
      }
    }
  }
  {
    svelteHTML.createElement("div", {});
    {
      {
        svelteHTML.createElement("span", {});
      }
      await (other);
    }
  }
};
const AwaitBlock__SvelteComponent_ = __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">();
type AwaitBlock__SvelteComponent_ = ReturnType<typeof AwaitBlock__SvelteComponent_>;
export default AwaitBlock__SvelteComponent_;
