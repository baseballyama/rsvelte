import * as $ from 'svelte/internal/server';

export default function Integration_cardv4($$renderer, $$props) {
	let { children, class: _class, position, isCenter } = $$props;

	$$renderer.push(`<div${$.attr_class($.clsx([
		"relative flex size-12 rounded-xl border bg-background dark:bg-transparent",
		_class
	]))}><div${$.attr_class($.clsx([
		"relative z-20 m-auto size-fit *:size-6",
		isCenter && "*:size-8"
	]))}>`);

	children($$renderer);
	$$renderer.push(`<!----></div> `);

	if (position && !isCenter) {
		$$renderer.push(`<!--[0--><div${$.attr_class($.clsx([
			"absolute z-10 h-px bg-linear-to-r to-muted-foreground/25",
			position === "left-top" && "top-1/2 left-full w-32.5 origin-left rotate-25",
			position === "left-middle" && "top-1/2 left-full w-30 origin-left",
			position === "left-bottom" && "top-1/2 left-full w-32.5 origin-left rotate-[-25deg]",
			position === "right-top" && "top-1/2 right-full w-32.5 origin-right rotate-[-25deg] bg-linear-to-l",
			position === "right-middle" && "top-1/2 right-full w-30 origin-right bg-linear-to-l",
			position === "right-bottom" && "top-1/2 right-full w-32.5 origin-right rotate-25 bg-linear-to-l"
		]))}></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></div>`);
}