import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Ts_$$slots01_type_output($$anchor, $$props) {
	const $$slots = $.sanitize_slots($$props);

	$$slots; // $$slots: Record<"default", boolean>

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.slot(node, $$props, 'default', {}, null);
	$.append($$anchor, fragment);
}