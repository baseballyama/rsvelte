import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="container svelte-1qwf8ul"><button class="svelte-1qwf8ul"><span>Accordion</span> <span>👈️</span></button></div>`);

export default function Dynamic_classes($$anchor) {
	let open = $.state(false);
	var div = root();
	var button = $.child(div);
	var span = $.sibling($.child(button), 2);

	$.reset(button);
	$.reset(div);
	$.template_effect(() => $.set_class(span, 1, `trigger ${$.get(open) ? 'open' : ''}`, 'svelte-1qwf8ul'));
	$.delegated('click', button, () => $.set(open, !$.get(open)));
	$.append($$anchor, div);
}

$.delegate(['click']);