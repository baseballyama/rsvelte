import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>RUN THE THING</button>`);

export default function Main($$anchor) {
	function run() {
		let a = $.state('a');

		let b = $.derived(() => {
			console.log('computing B', $.get(a));

			return 'foo';
		});

		let c = $.derived(() => {
			console.log('computing C');

			return $.get(b);
		});

		console.log($.get(c));
		$.set(a, "aaa");
		console.log($.get(c));
	}

	var button = root();

	$.delegated('click', button, run);
	$.append($$anchor, button);
}

$.delegate(['click']);