import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Literal_slot01_output($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.slot(node, $$props, 'name', {}, null);
	$.append($$anchor, fragment);
}