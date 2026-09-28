import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import OneLineView from './components/OneLineView.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'type']);

export default function CustomLine($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	OneLineView($$anchor, $.spread_props(
		{
			get type() {
				return $$props.type;
			}
		},
		() => props
	));
}