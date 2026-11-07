import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getAbortSignal } from 'svelte';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<button>toggle</button> <button>run</button> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const callbacks = new Map();

	// similar semantics to setInterval, but simpler to test
	function add(fn) {
		const id = crypto.randomUUID();

		callbacks.set(id, fn);

		return id;
	}

	function remove(id) {
		callbacks.delete(id);
	}

	function run() {
		for (const fn of callbacks.values()) {
			fn();
		}
	}

	class Timer {
		#elapsed;

		get elapsed() {
			return $.get(this.#elapsed);
		}

		set elapsed(value) {
			$.set(this.#elapsed, value, true);
		}

		#text;

		get text() {
			return $.get(this.#text);
		}

		set text(value) {
			$.set(this.#text, value);
		}

		constructor(text) {
			this.#elapsed = $.state(0);
			this.#text = $.derived(() => text + ': ' + this.elapsed);

			$.user_effect(() => {
				const id = add(() => {
					this.elapsed += 1;
				});

				getAbortSignal().onabort = () => {
					console.log('aborted');
				};

				return () => remove(id);
			});
		}
	}

	let timer = $.derived(() => new Timer('hello'));
	let visible = $.state(true);
	var fragment = root_1();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var node = $.sibling(button_1, 2);

	{
		var consequent = ($$anchor) => {
			var p = root();
			var text_1 = $.only_child(p, true);

			$.template_effect(() => $.set_text(text_1, $.get(timer).text));
			$.append($$anchor, p);
		};

		$.if(node, ($$render) => {
			if ($.get(visible)) $$render(consequent);
		});
	}

	$.delegated('click', button, () => $.set(visible, !$.get(visible)));
	$.delegated('click', button_1, run);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);