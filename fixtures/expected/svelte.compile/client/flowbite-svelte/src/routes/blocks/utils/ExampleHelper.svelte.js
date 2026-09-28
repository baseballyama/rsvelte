import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><!></div>`);

export default function ExampleHelper($$anchor, $$props) {
	var div = root();
	var node = $.child(div);

	$.snippet(node, () => $$props.snippet);
	$.reset(div);
	$.template_effect(() => $.set_class(div, 1, $.clsx($$props.class)));
	$.append($$anchor, div);
}