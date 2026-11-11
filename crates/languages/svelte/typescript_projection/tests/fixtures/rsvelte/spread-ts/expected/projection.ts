;

	let { href, ...rest }: { href?: string; tabindex?: number } = $props();
	const wrong = { tabindex: 'first' };

;

() => {
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
const SpreadTs__SvelteComponent_ = __rsvelte_export_component<{ href?: string; tabindex?: number }, {}, "">();
type SpreadTs__SvelteComponent_ = ReturnType<typeof SpreadTs__SvelteComponent_>;
export default SpreadTs__SvelteComponent_;
