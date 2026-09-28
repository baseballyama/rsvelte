import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Main($$anchor) {
	function createReactive(obj) {
		const reactive = {};

		for (const key of Object.keys(obj)) {
			let inner = $.state($.proxy(obj[key]));

			Object.defineProperty(reactive, key, {
				get() {
					return $.get(inner);
				},

				set(update) {
					$.set(inner, update, true);
				},
				enumerable: true
			});
		}

		return reactive;
	}

	const a = createReactive({ x: 'foo' });
	var button = root();
	var text = $.only_child(button, true);

	$.template_effect(() => $.set_text(text, a.x));
	$.event('click', button, () => a.x = 'bar');
	$.append($$anchor, button);
}