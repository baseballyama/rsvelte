import * as $ from 'svelte/internal/server';

export default function Section($$renderer, $$props) {
	let { tinted = false, children, class: className } = $$props;

	$$renderer.push(`<section${$.attr_class($.clsx(tinted ? "bg-gray-50 dark:bg-gray-800" : ""))}><div${$.attr_class(`max-w-8xl mx-auto px-4 py-8 lg:px-20 ${$.stringify(className ?? '')}`)}>`);
	children($$renderer);
	$$renderer.push(`<!----></div></section>`);
}