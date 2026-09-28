import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>a += 1</button> <button>b += 1</button> <button>c += 1</button> <button>d += 1</button> <p> </p>`, 1);

export default function Input($$anchor) {
	let a = $.state(1);
	let b = 2;
	let c = 3;
	let d = 4;
	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var button_3 = $.sibling(button_2, 2);
	var p = $.sibling(button_3, 2);
	var text = $.only_child(p);

	$.template_effect(() => $.set_text(text, `${$.get(a) ?? ''} + ${b ?? ''} + ${c ?? ''} = ${$.get(a) + b + c}`));
	$.delegated('click', button, () => $.set(a, $.get(a) + 1));
	$.delegated('click', button_1, () => b += 1);
	$.delegated('click', button_2, () => c += 1);
	$.delegated('click', button_3, () => d += 1);
	$.append($$anchor, fragment);
}

$.delegate(['click']);