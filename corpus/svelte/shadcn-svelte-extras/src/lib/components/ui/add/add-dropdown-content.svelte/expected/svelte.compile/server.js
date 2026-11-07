import * as $ from 'svelte/internal/server';
import * as DropdownMenu from '$lib/components/ui/dropdown-menu';

export default function Add_dropdown_content($$renderer, $$props) {
	let { align = 'end', children, $$slots, $$events, ...rest } = $$props;

	if (DropdownMenu.Content) {
		$$renderer.push('<!--[-->');

		DropdownMenu.Content($$renderer, $.spread_props([
			{ align, class: 'w-fit' },
			rest,
			{
				children: ($$renderer) => {
					children?.($$renderer);
					$$renderer.push(`<!---->`);
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