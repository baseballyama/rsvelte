import * as $ from 'svelte/internal/server';

export default function Heading_anchor($$renderer, $$props) {
	let { id, children } = $$props;

	if (id) {
		$$renderer.push(`<!--[0--><a class="group no-underline"${$.attr('href', `#${id}`)}><span class="underline-offset-4 group-hover:underline">`);
		children?.($$renderer);
		$$renderer.push(`<!----></span> <span aria-hidden="true" class="ml-2 text-muted-foreground opacity-0 group-hover:opacity-100">#</span></a>`);
	} else {
		$$renderer.push('<!--[-1-->');
		children?.($$renderer);
		$$renderer.push(`<!---->`);
	}

	$$renderer.push(`<!--]-->`);
}