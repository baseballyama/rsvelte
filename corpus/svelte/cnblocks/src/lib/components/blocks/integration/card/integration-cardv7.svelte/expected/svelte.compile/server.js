import * as $ from 'svelte/internal/server';

export default function Integration_cardv7($$renderer, $$props) {
	let { children, class: _class = "", isCenter = false } = $$props;

	$$renderer.push(`<div${$.attr_class($.clsx([
		"relative z-20 flex size-12 rounded-full border bg-background",
		_class
	]))}><div${$.attr_class($.clsx(["m-auto size-fit *:size-5", isCenter && "*:size-8"]))}>`);

	children($$renderer);
	$$renderer.push(`<!----></div></div>`);
}