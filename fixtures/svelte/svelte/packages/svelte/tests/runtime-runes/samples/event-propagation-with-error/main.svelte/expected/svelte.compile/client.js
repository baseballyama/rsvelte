import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><button> </button></div>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let y = $.state(0);
	let n = $.state(0);

	function yep() {
		$.set(y, $.get(y) + 1);
	}

	function nope() {
		$.set(n, $.get(n) + 1);

		throw new Error('nope');
	}

	var div = root();
	var button = $.child(div);
	var text = $.only_child(button);

	$.reset(div);
	$.template_effect(() => $.set_text(text, `${$.get(y) ?? ''} ${$.get(n) ?? ''}`));
	$.delegated('click', div, yep);
	$.delegated('click', button, nope);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);