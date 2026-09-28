import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	function throws() {
		throw new Error('component error');
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.boundary(node, { onerror: () => {} }, ($$anchor) => {
		var p = root();
		var text = $.only_child(p, true);

		$.template_effect(($0) => $.set_text(text, $0), [() => throws()]);
		$.append($$anchor, p);
	});

	$.append($$anchor, fragment);
	$.pop();
}