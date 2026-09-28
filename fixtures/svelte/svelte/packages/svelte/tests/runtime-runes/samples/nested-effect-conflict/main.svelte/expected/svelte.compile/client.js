import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>toggle</button>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let c = $.state($.proxy({ a: 0 }));

	$.user_effect(() => {
		console.log('top level');

		$.user_effect(() => {
			if ($.get(c)) {
				$.user_effect(() => {
					console.log('inner', $.get(c).a);

					return () => console.log('destroy inner', $.get(c)?.a);
				});
			}

			return () => console.log('destroy outer', $.get(c)?.a);
		});
	});

	var button = root();

	$.delegated('click', button, () => {
		$.get(c).a = 1;
		$.set(c, null);
	});

	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);