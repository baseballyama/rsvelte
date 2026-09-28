import * as $ from 'svelte/internal/server';

export default function ExampleHelper($$renderer, $$props) {
	let { snippet, class: className } = $$props;

	$$renderer.push(`<div${$.attr_class($.clsx(className))}>`);
	snippet($$renderer);
	$$renderer.push(`<!----></div>`);
}