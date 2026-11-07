import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

var root = $.from_html(`<button> </button> <!> <div><input type="checkbox"/></div>`, 1);

export default function Main($$anchor) {
	let a = $.state(0);
	let check = $.state(true);
	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.only_child(button);
	var node = $.sibling(button, 2);
	var bind_get = () => $.get(a);

	var bind_set = (v) => {
		console.log('a', v);
		$.set(a, v, true);
	};

	Child(node, {
		get a() {
			return bind_get();
		},

		set a($$value) {
			bind_set($$value);
		}
	});

	var div = $.sibling(node, 2);
	var input = $.child(div);

	$.remove_input_defaults(input);
	$.reset(div);
	$.template_effect(() => $.set_text(text, `a: ${$.get(a) ?? ''}`));
	$.delegated('click', button, () => $.update(a));

	$.bind_checked(input, () => $.get(check), (v) => {
		console.log('check', v);
		$.set(check, v, true);
	});

	$.append($$anchor, fragment);
}

$.delegate(['click']);