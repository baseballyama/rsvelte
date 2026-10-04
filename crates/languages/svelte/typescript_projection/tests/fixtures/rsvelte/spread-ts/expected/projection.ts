;

	let { href, ...rest }: { href?: string; tabindex?: number } = $props();
	const wrong = { tabindex: 'first' };

;

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
export default __rsvelte_export_component<{ href?: string; tabindex?: number }, {}, "">();
