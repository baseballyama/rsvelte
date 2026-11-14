;

	import Option from './Option.svelte';
	let { p, c } = $props();

;

const __rsvelte_public_props0 = __rsvelte_props({
  p: __rsvelte_untyped_prop(),
  c: __rsvelte_untyped_prop(),
}, {}, false);
async () => {
  {
    svelteHTML.createElement("select", {});
    {
      svelteHTML.createElement("svelte:boundary", {});
      {
        svelteHTML.createElement("option", {});
      }
    }
  }
  {
    svelteHTML.createElement("select", {
      ...(p),
      "class": c,
    });
    {
      __rsvelte_component(Option)(__rsvelte_internals(), {});
    }
  }
  {
    svelteHTML.createElement("select", {
      ...(p),
    });
    {
      svelteHTML.createElement("option", {
        "class": c,
        ...(p),
      });
      {
        svelteHTML.createElement("b", {});
        (c);
      }
    }
  }
};
const RichSelect3__SvelteComponent_ = __rsvelte_export_component();
export default RichSelect3__SvelteComponent_;
