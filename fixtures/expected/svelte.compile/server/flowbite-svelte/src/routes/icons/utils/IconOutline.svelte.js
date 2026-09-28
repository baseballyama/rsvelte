import * as $ from 'svelte/internal/server';

export default function IconOutline($$renderer, $$props) {
	let {
		Icon,
		size,
		role,
		color = "currentColor",
		ariaLabel,
		class: classname,
		$$slots,
		$$events,
		...restProps
	} = $$props;

	if (Icon) {
		$$renderer.push('<!--[-->');

		Icon($$renderer, $.spread_props([
			{ fill: 'none', color },
			restProps,
			{ role, size, class: classname, ariaLabel }
		]));

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}