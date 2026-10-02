import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>Click</button>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let count = $.state(0);

	$.user_effect(() => {
		let double = $.derived(() => $.get(count) * 2);

		console.log('init ' + $.get(double));

		return function () {
			console.log('cleanup ' + $.get(double));

			// @ts-expect-error
			console.log(this);
		};
	});

	var button = root();

	$.delegated('click', button, () => $.update(count));
	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);