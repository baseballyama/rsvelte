import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Ts_$$slots03_named_type_output($$anchor, $$props) {
	const $$slots = $.sanitize_slots($$props);

	$$slots; // $$slots: Record<"foo", boolean>

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.slot(node, $$props, 'foo', {}, null);
	$.append($$anchor, fragment);
}