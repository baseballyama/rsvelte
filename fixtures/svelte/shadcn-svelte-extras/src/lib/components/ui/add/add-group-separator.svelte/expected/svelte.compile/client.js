import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Separator } from '$lib/components/ui/separator';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class']);

export default function Add_group_separator($$anchor, $$props) {
	let rest = $.rest_props($$props, rest_excludes);

	Separator($$anchor, $.spread_props(
		{
			orientation: 'vertical',
			get class() {
				return $$props.class;
			}
		},
		() => rest
	));
}