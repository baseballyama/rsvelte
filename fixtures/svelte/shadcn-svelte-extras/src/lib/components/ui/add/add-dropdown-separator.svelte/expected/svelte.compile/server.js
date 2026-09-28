import * as $ from 'svelte/internal/server';
import * as DropdownMenu from '$lib/components/ui/dropdown-menu';

export default function Add_dropdown_separator($$renderer, $$props) {
	let { class: className, $$slots, $$events, ...rest } = $$props;

	if (DropdownMenu.Separator) {
		$$renderer.push('<!--[-->');
		DropdownMenu.Separator($$renderer, $.spread_props([{ class: className }, rest]));
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}