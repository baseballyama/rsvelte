import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function No_false_custom_element_props_identifier_warning_without_custom_element_input($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);
}