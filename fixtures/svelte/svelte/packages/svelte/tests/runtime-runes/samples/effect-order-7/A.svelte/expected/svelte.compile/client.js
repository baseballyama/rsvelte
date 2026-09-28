import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import B from './B.svelte';

var root = $.from_html(`<span> </span> <!>`, 1);

export default function A($$anchor, $$props) {
	var fragment = root();
	var span = $.first_child(fragment);
	var text = $.only_child(span);
	var node = $.sibling(span, 2);

	B(node, {
		get closed() {
			return $$props.closed;
		},

		get close() {
			return $$props.close;
		}
	});

	$.template_effect(() => $.set_text(text, `${$$props.boolean ?? ''} ${$$props.closed ?? ''}`));
	$.append($$anchor, fragment);
}