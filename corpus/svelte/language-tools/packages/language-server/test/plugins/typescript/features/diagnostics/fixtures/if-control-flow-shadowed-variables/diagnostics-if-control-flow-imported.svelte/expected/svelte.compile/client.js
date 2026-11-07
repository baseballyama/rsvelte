import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Diagnostics_if_control_flow_imported($$anchor, $$props) {
	const foo = '';
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.slot(node, $$props, 'default', { foo, b: foo }, null);
	$.append($$anchor, fragment);
}