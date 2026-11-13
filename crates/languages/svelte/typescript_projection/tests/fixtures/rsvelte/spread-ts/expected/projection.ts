;

	type __rsvelte_props_type0 = { href?: string; tabindex?: number };
let { href, ...rest }: __rsvelte_props_type0 = $props();
	const wrong = { tabindex: 'first' };

;

async () => {
  {
    svelteHTML.createElement("a", {
      href,
      ...(rest),
    });
  }
  {
    svelteHTML.createElement("a", {
      ...(wrong),
    });
  }
};
const SpreadTs__SvelteComponent_ = __rsvelte_export_component<__rsvelte_props_type0, {}, "">();
type SpreadTs__SvelteComponent_ = ReturnType<typeof SpreadTs__SvelteComponent_>;
export default SpreadTs__SvelteComponent_;
