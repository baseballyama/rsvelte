;

	let { children, ...rest }: typeof __rsvelte_public_props0 = $props();

;

const __rsvelte_public_props0 = __rsvelte_props({
  children: __rsvelte_untyped_prop(),
}, {}, true);
() => {
  {
    svelteHTML.createElement("div", {
      ...(rest),
    });
  }
  {
    svelteHTML.createElement("section", {
      "id": "main",
      ...(rest),
      "title": "after",
    });
  }
  {
    svelteHTML.createElement("button", {
      ...(rest),
    });
  }
  {
    svelteHTML.createElement("img", {
      ...(rest),
      "alt": "",
    });
  }
};
const Spread__SvelteComponent_ = __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">();
type Spread__SvelteComponent_ = ReturnType<typeof Spread__SvelteComponent_>;
export default Spread__SvelteComponent_;
