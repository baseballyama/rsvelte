import * as $ from 'svelte/internal/server';

export default function Integration_cardv2($$renderer, $$props) {
	let { children, class: _class, borderClassName } = $$props;

	$$renderer.push(`<div${$.attr_class($.clsx([
		"relative flex size-20 rounded-xl bg-background dark:bg-transparent",
		_class
	]))}><div role="presentation"${$.attr_class($.clsx([
		"absolute inset-0 rounded-xl border border-black/20 dark:border-white/25",
		borderClassName
	]))}></div> <div class="relative z-20 m-auto size-fit *:size-8">`);

	children?.($$renderer);
	$$renderer.push(`<!----></div></div>`);
}