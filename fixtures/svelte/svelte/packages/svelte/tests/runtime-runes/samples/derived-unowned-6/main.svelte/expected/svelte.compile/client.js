import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>RUN THE THING</button>`);

export default function Main($$anchor) {
	function run() {
		let cond = $.state(true);
		let a = $.state("a");
		let b = $.state("b");

		let c = $.derived(() => {
			console.log('computing');

			return $.get(cond) ? $.get(a) : $.get(b);
		});

		console.log($.get(c));
		$.set(b, "bb");
		console.log($.get(c));
		$.set(cond, false);
		console.log($.get(c));
		$.set(a, "aaa");
		console.log($.get(c));
	}

	var button = root();

	$.delegated('click', button, run);
	$.append($$anchor, button);
}

$.delegate(['click']);