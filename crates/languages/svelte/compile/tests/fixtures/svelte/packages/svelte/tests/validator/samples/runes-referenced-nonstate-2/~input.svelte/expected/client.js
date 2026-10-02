import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>a += 1</button> <p> </p>`, 1);

export default function Input($$anchor) {
	let a = $.proxy({ b: 0 });
	var fragment = root();
	var button = $.first_child(fragment);
	var p = $.sibling(button, 2);
	var text = $.only_child(p);

	$.template_effect(($0) => $.set_text(text, `${$0 ?? ''} + ${a.b ?? ''}`), [() => JSON.stringify(a)]);
	$.delegated('click', button, () => a.b += 1);
	$.append($$anchor, fragment);
}

$.delegate(['click']);