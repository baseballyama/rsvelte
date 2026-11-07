import * as $ from 'svelte/internal/server';

export default function Subtitle($$renderer, $$props) {
	let { class: klass = "", children } = $$props;

	if (children) {
		$$renderer.push(`<!--[0--><p aria-labelledby="modal-subtitle"${$.attr_class(`text-md text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mt-6 leading-6 ${$.stringify(klass)}`)}>`);
		children($$renderer);
		$$renderer.push(`<!----></p>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}