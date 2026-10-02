import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<button>increment</button> <!> <p> </p>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	class Foo {
		#value = $.state(0);

		get value() {
			return $.get(this.#value);
		}

		set value(value) {
			$.set(this.#value, value, true);
		}

		#double = $.derived(() => this.value * 2);

		get double() {
			return $.get(this.#double);
		}

		set double(value) {
			$.set(this.#double, value);
		}

		constructor() {
			console.log(this.value, this.double);
		}

		increment() {
			this.value++;
		}
	}

	let foo = $.state(void 0);

	$.user_effect(() => {
		$.set(foo, new Foo(), true);
	});

	let bar = $.derived(() => new Foo());
	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			var p = root();
			var text = $.only_child(p);

			$.template_effect(() => $.set_text(text, `${$.get(foo).value ?? ''}/${$.get(foo).double ?? ''}`));
			$.append($$anchor, p);
		};

		$.if(node, ($$render) => {
			if ($.get(foo)) $$render(consequent);
		});
	}

	var p_1 = $.sibling(node, 2);
	var text_1 = $.only_child(p_1);

	$.template_effect(() => $.set_text(text_1, `${$.get(bar).value ?? ''}/${$.get(bar).double ?? ''}`));

	$.delegated('click', button, () => {
		$.get(foo).increment();
		$.get(bar).increment();
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);