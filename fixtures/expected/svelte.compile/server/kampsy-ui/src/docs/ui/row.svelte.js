import * as $ from 'svelte/internal/server';

export default function Row($$renderer, $$props) {
	let { class: klass = "", bottomLine = true, children } = $$props;

	const bottomLineClass = $.derived(() => {
		if (bottomLine) {
			return "border-b border-kui-light-gray-200 dark:border-kui-dark-gray-400";
		}

		return "";
	});

	$$renderer.push(`<section${$.attr_class(`p-6 lg:p-12 ${$.stringify(bottomLineClass())} ${$.stringify(klass)}`)}>`);
	children($$renderer);
	$$renderer.push(`<!----></section>`);
}