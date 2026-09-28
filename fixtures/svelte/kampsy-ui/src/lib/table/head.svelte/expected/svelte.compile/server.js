import * as $ from 'svelte/internal/server';

export default function Head($$renderer, $$props) {
	let { children = undefined } = $$props;

	$$renderer.push(`<th class="h-10 px-2 text-left align-middle text-sm font-medium last:text-right">`);

	if (children) {
		$$renderer.push('<!--[0-->');
		children($$renderer);
		$$renderer.push(`<!---->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></th>`);
}