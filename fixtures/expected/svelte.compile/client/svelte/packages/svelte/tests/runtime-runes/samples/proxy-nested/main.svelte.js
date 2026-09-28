import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Main($$anchor) {
	const inner = $.proxy({ count: 0 });
	const object = $.proxy({ outer: { inner } });
	var button = root();
	var text = $.only_child(button);

	$.template_effect(() => $.set_text(text, `clicks: ${object.outer.inner.count ?? ''}`));
	$.delegated('click', button, () => inner.count += 1);
	$.append($$anchor, button);
}

$.delegate(['click']);