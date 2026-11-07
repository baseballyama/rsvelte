import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<hr/>`);

export default function Hr($$anchor, $$props) {
	const rest = $.rest_props($$props, rest_excludes);
	var hr = root();

	$.attribute_effect(hr, () => ({ class: 'hr', ...rest }));
	$.append($$anchor, hr);
}