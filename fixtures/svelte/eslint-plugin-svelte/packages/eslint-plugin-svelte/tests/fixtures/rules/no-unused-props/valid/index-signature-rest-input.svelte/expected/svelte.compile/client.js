import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'name', 'age']);

export default function Index_signature_rest_input($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);

	console.log($$props.name, $$props.age, $$props.isAdmin, $$props.role);
	$.pop();
}