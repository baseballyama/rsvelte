import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>a</button> <button>b</button> <p> </p>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let object = $.state({ a: 0, b: 0 });

	function a() {
		console.log('a');

		return $.get(object).a;
	}

	function b() {
		console.log('b');

		let double = $.derived(() => $.get(object).b);

		return $.get(double);
	}

	$.user_effect(() => {
		$.get(object).a;
		console.log('effect a');
	});

	$.user_effect(() => {
		const b = $.derived(() => $.get(object).b);

		$.get(b);
		console.log('effect b');
	});

	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var p = $.sibling(button_1, 2);
	var text = $.only_child(p);

	$.template_effect(($0, $1) => $.set_text(text, `${$0 ?? ''}/${$1 ?? ''}`), [() => a(), () => b()]);
	$.delegated('click', button, () => $.set(object, { ...$.get(object), a: $.get(object).a + 1 }));
	$.delegated('click', button_1, () => $.set(object, { ...$.get(object), b: $.get(object).b + 1 }));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);