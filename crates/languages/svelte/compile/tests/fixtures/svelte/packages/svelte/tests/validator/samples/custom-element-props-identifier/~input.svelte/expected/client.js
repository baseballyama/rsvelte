import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', '$$host']);

export default function Input($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);
}

$.create_custom_element(Input, {}, [], [], { mode: 'open' });