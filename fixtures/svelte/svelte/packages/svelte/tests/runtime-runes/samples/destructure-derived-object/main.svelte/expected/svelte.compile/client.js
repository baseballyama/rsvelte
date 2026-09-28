import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Main($$anchor) {
	function get_values() {
		let a = $.state(0);
		let b = $.state(0);
		let c = $.state(0);

		return {
			get a() {
				return $.get(a);
			},

			get b() {
				return $.get(b);
			},

			get c() {
				return $.get(c);
			},

			increment() {
				$.update(a);
				$.update(b);
				$.update(c);
			}
		};
	}

	const $$d = $.derived(get_values),
		a = $.derived(() => $.get($$d).a),
		b = $.derived(() => $.get($$d).b),
		c = $.derived(() => $.get($$d).c),
		increment = $.derived(() => $.get($$d).increment);

	var button = root();
	var text = $.only_child(button);

	$.template_effect(() => $.set_text(text, `${$.get(a) ?? ''} ${$.get(b) ?? ''} ${$.get(c) ?? ''}`));

	$.delegated('click', button, function (...$$args) {
		$.get(increment)?.apply(this, $$args);
	});

	$.append($$anchor, button);
}

$.delegate(['click']);