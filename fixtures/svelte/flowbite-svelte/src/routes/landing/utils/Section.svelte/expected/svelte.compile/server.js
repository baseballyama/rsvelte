import * as $ from 'svelte/internal/server';

export default function Section($$renderer, $$props) {
	let { children, tinted = false, class: className = undefined } = $$props;

	$$renderer.push(`<section${$.attr_class($.clsx(tinted ? "bg-gray-50 dark:bg-gray-800" : ""))}><div${$.attr_class($.clsx(["mx-auto max-w-screen-xl px-4 py-8 lg:px-4", className]))}>`);
	children?.($$renderer);
	$$renderer.push(`<!----></div></section>`);
}