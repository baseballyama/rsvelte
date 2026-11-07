import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="container"><div class="example svelte-8raa54"><button>-</button> <span class="svelte-8raa54"> </span> <button>+</button></div></div>`);

export default function Expressions($$anchor) {
	let banana = $.state(1);
	var div = root();
	var div_1 = $.child(div);
	var button = $.child(div_1);
	var span = $.sibling(button, 2);
	var text = $.only_child(span);
	var button_1 = $.sibling(span, 2);

	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		button.disabled = $.get(banana) === 0;
		$.set_text(text, `There's ${$.get(banana) ?? ''} ${$.get(banana) === 1 ? 'banana' : 'bananas'} left`);
	});

	$.delegated('click', button, () => $.update(banana, -1));
	$.delegated('click', button_1, () => $.update(banana));
	$.append($$anchor, div);
}

$.delegate(['click']);