import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Main($$anchor) {
	const object = $.proxy({ count: 0 });
	var button = root();
	var text = $.only_child(button);

	$.template_effect(() => $.set_text(text, `clicks: ${object.count ?? ''}`));
	$.delegated('click', button, () => object.count += 1);
	$.append($$anchor, button);
}

$.delegate(['click']);