import * as $ from 'svelte/internal/server';

export default function NodeActionButton($$renderer, $$props) {
	let {
		children,
		onclick,
		busy,
		disabled,
		$$slots,
		$$events,
		...rest
	} = $$props;

	let button = void 0;

	function focus() {
		button?.focus();
	}

	$$renderer.push(`<button${$.attributes(
		{
			type: 'button',
			disabled: disabled || busy,
			'aria-busy': busy,
			...rest
		},
		'svelte-1n0q7vk'
	)}>`);

	children?.($$renderer);
	$$renderer.push(`<!----></button>`);
	$.bind_props($$props, { focus });
}