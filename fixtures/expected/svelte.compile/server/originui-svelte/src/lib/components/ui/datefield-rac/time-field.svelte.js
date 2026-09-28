import * as $ from 'svelte/internal/server';
import { TimeField } from 'bits-ui';

export default function Time_field($$renderer, $$props) {
	let { children, class: className, $$slots, $$events, ...restProps } = $$props;

	if (TimeField.Root) {
		$$renderer.push('<!--[-->');

		TimeField.Root($$renderer, $.spread_props([
			restProps,
			{
				children: ($$renderer) => {
					$$renderer.push(`<div${$.attr_class($.clsx(className))}>`);
					children?.($$renderer);
					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			}
		]));

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}