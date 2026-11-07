import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>click me</button>`);

export default function Main($$anchor) {
	let structured = $.proxy({
		handler() {
			console.log('works!');
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			const computed_const = $.derived(() => {
				return structured;
			});

			var button = root();

			$.delegated('click', button, () => $.get(computed_const).handler());
			$.append($$anchor, button);
		};

		$.if(node, ($$render) => {
			if (structured) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}

$.delegate(['click']);