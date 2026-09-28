import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Main($$anchor) {
	let count = $.state(0);

	function create_derived() {
		console.log('create_derived');

		return () => {
			return {
				get double() {
					return $.get(count) * 2;
				}
			};
		};
	}

	let $$d = $.derived(create_derived()),
		double = $.derived(() => $.get($$d).double);

	var button = root();
	var text = $.only_child(button, true);

	$.template_effect(() => $.set_text(text, $.get(double)));
	$.event('click', button, () => $.update(count));
	$.append($$anchor, button);
}