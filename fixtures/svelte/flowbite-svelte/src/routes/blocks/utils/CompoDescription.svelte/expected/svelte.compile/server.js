import * as $ from 'svelte/internal/server';

export default function CompoDescription($$renderer, $$props) {
	let {
		children,
		pClass = "text-lg text-gray-600 dark:text-gray-400"
	} = $$props;

	$$renderer.push(`<p${$.attr_class($.clsx(pClass))}>`);
	children($$renderer);
	$$renderer.push(`<!----></p>`);
}