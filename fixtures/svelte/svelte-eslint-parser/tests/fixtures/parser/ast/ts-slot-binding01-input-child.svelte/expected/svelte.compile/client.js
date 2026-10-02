import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Ts_slot_binding01_input_child($$anchor, $$props) {
	let foo = { prop: true };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.slot(
		node,
		$$props,
		'default',
		{
			get foo() {
				return foo;
			}
		},
		null
	);

	$.append($$anchor, fragment);
}