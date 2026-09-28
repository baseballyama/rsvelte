import * as $ from 'svelte/internal/server';

export default function IconSolid($$renderer, $$props) {
	let {
		Icon,
		size,
		role,
		color = "currentColor",
		ariaLabel,
		strokeWidth,
		class: classname,
		$$slots,
		$$events,
		...restProps
	} = $$props;

	if (Icon) {
		$$renderer.push('<!--[-->');

		Icon($$renderer, $.spread_props([
			{ fill: color },
			restProps,
			{ role, size, strokeWidth, class: classname, ariaLabel }
		]));

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}