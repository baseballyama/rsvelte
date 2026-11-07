import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<span> </span>`);

export default function $props_without_destructuring_runes_input($$anchor, $$props) {
	// It should not be recognized as a store.
	const props = $.rest_props($$props, rest_excludes);

	var span = root();
	var text = $.only_child(span, true);

	$.template_effect(() => $.set_text(text, props));
	$.append($$anchor, span);
}