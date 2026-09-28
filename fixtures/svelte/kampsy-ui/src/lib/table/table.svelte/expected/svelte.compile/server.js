import * as $ from 'svelte/internal/server';

export default function Table($$renderer, $$props) {
	let { children = undefined } = $$props;

	$$renderer.push(`<div class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 w-full overflow-auto text-sm"><table class="w-full">`);

	if (children) {
		$$renderer.push('<!--[0-->');
		children($$renderer);
		$$renderer.push(`<!---->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></table></div>`);
}