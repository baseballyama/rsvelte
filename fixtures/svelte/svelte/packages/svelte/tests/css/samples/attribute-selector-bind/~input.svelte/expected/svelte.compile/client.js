import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<details class="svelte-1amdp23">Hello</details>`);

export default function Input($$anchor) {
	let open = false;
	var details = root();

	$.bind_property('open', 'toggle', details, ($$value) => open = $$value, () => open);
	$.append($$anchor, details);
}