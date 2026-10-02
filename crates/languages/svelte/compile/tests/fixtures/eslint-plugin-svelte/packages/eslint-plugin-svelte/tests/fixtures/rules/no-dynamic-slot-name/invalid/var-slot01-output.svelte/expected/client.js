import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Var_slot01_output($$anchor, $$props) {
	$.push($$props, true);

	const SLOT_NAME = 'name';
	var $$exports = { SLOT_NAME };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.slot(node, $$props, 'name', {}, null);
	$.append($$anchor, fragment);

	return $.pop($$exports);
}