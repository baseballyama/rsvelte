import * as $ from 'svelte/internal/server';

export default function SectionWrapper($$renderer, $$props) {
	let { title, className = '', children } = $$props;

	$$renderer.push(`<section${$.attr_class(`mt-6 ${$.stringify(className)}`)}><h3 class="mb-2 text-xl font-semibold text-gray-800 dark:text-gray-200">${$.escape(title)}</h3> `);

	if (children) {
		$$renderer.push('<!--[0-->');
		children($$renderer);
		$$renderer.push(`<!---->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></section>`);
}