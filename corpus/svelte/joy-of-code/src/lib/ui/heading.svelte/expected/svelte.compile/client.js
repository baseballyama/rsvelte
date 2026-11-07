import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<h1 class="svelte-qy2nrw"><!></h1>`);

export default function Heading($$anchor, $$props) {
	$.push($$props, true);

	let props = $.rest_props($$props, rest_excludes);
	var h1 = root();
	var node = $.child(h1);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(h1);
	$.append($$anchor, h1);
	$.pop();
}