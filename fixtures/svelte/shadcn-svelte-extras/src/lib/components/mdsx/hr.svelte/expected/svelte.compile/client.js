import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class']);
var root = $.from_html(`<hr/>`);

export default function Hr($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var hr = root();

	$.attribute_effect(hr, ($0) => ({ class: $0, ...restProps }), [() => cn('my-4 md:my-8', $$props.class)]);
	$.append($$anchor, hr);
	$.pop();
}