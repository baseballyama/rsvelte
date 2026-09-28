import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children']);
var root = $.from_html(`<kbd><!></kbd>`);

export default function Group($$anchor, $$props) {
	let rest = $.rest_props($$props, rest_excludes);
	var kbd = root();

	$.attribute_effect(kbd, () => ({ class: 'inline-flex items-center gap-1', ...rest }));

	var node = $.child(kbd);

	$.snippet(node, () => $$props.children);
	$.reset(kbd);
	$.append($$anchor, kbd);
}