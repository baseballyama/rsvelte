import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="counter svelte-18h6zmf"><h1>Counter</h1> <p> </p> <p> </p> <label>Step <input type="number" min="1"/></label> <div class="buttons svelte-18h6zmf"><button class="svelte-18h6zmf">-</button> <button class="svelte-18h6zmf">+</button> <button class="svelte-18h6zmf">Reset</button></div></div>`);

export default function Component($$anchor, $$props) {
	$.push($$props, true);

	let count = $.state(0);
	let step = $.state(1);
	let doubled = $.derived(() => $.get(count) * 2);
	let parity = $.derived(() => $.get(count) % 2 === 0 ? 'even' : 'odd');

	$.user_effect(() => {
		document.title = `Count: ${$.get(count)}`;
	});

	function increment() {
		$.set(count, $.get(count) + $.get(step));
	}

	function decrement() {
		$.set(count, $.get(count) - $.get(step));
	}

	function reset() {
		$.set(count, 0);
		$.set(step, 1);
	}

	var div = root();
	var p = $.sibling($.child(div), 2);
	var text = $.child(p);

	$.reset(p);

	var p_1 = $.sibling(p, 2);
	var text_1 = $.child(p_1);

	$.reset(p_1);

	var label = $.sibling(p_1, 2);
	var input = $.sibling($.child(label));

	$.remove_input_defaults(input);
	$.reset(label);

	var div_1 = $.sibling(label, 2);
	var button = $.child(div_1);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);

	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, `Current: ${$.get(count) ?? ''} (${$.get(parity) ?? ''})`);
		$.set_text(text_1, `Doubled: ${$.get(doubled) ?? ''}`);
		button_2.disabled = $.get(count) === 0;
	});

	$.bind_value(input, () => $.get(step), ($$value) => $.set(step, $$value));
	$.delegated('click', button, decrement);
	$.delegated('click', button_1, increment);
	$.delegated('click', button_2, reset);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);
