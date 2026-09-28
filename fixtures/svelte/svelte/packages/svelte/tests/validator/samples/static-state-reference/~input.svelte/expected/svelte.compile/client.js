import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	let obj = $.proxy({ a: 0 });
	let count = $.state(0);
	let doubled = $.derived(() => $.get(count) * 2);
	let tripled = $.get(count) * 3;

	console.log(obj);
	console.log($.get(count));
	console.log($.get(doubled));

	let other_prop = $.prop($$props, 'other_prop', 19, () => $$props.prop);
	let prop_state = $.state($.proxy($$props.prop));
	let prop_derived = $.derived(() => $$props.prop);

	console.log($$props.prop);
	console.log($.get(prop_derived));

	// writes are okay
	$.update(count);

	$.set(count, 1);
	obj.a++;
	obj.a = 1;
	$.set(prop_state, 1);
	$.set(prop_derived, 1);

	// `count` here is correctly identified as a non-reference
	let typed = null;

	var $$exports = {
		get count() {
			return $.get(count);
		},

		set count($$value) {
			$.set(count, $.proxy($$value));
		}
	};

	var button = root();
	var text = $.only_child(button);

	$.template_effect(() => $.set_text(text, `clicks: ${$.get(count) ?? ''}`));
	$.delegated('click', button, () => $.set(count, $.get(count) + 1));
	$.append($$anchor, button);

	return $.pop($$exports);
}

$.delegate(['click']);