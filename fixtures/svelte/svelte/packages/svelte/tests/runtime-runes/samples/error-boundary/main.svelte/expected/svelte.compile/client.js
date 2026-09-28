import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	function throw_error() {
		throw new Error('test');
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.boundary(node, { onerror: (e) => console.log('error caught') }, ($$anchor) => {
		$.next();

		var text = $.text();

		$.template_effect(($0) => $.set_text(text, $0), [() => throw_error()]);
		$.append($$anchor, text);
	});

	$.append($$anchor, fragment);
	$.pop();
}