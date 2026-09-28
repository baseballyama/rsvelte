import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>Add</button> `, 1);

export default function Main($$anchor) {
	let items = $.proxy([]);
	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.sibling(button);

	$.template_effect(($0) => $.set_text(text, ` ${$0 ?? ''}`), [() => JSON.stringify(items.sort())]);
	$.delegated('click', button, () => items.push(3, 2, 1));
	$.append($$anchor, fragment);
}

$.delegate(['click']);