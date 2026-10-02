import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(` <div>Foo</div>`, 1);

export default function Child($$anchor, $$props) {
	$.push($$props, true);

	function throw_error() {
		throw new Error('throw_error');
	}

	$.next();

	var fragment = root();
	var text = $.first_child(fragment);

	$.next();
	$.template_effect(($0) => $.set_text(text, `${$0 ?? ''} `), [() => throw_error()]);
	$.append($$anchor, fragment);
	$.pop();
}