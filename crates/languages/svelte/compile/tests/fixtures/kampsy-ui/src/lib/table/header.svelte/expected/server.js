import * as $ from 'svelte/internal/server';

export default function Header($$renderer, $$props) {
	let { children = undefined } = $$props;

	$$renderer.push(`<thead class="border-kui-light-gray-200 dark:border-kui-dark-gray-400 border-b">`);

	if (children) {
		$$renderer.push('<!--[0-->');
		children($$renderer);
		$$renderer.push(`<!---->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></thead>`);
}