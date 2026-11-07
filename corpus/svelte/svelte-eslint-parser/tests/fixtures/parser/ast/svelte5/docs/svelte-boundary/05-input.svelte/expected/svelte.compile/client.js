import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>oops! try again</button>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function _5_input($$anchor) {
	let error = $.state(null);
	let reset = $.state(() => {});

	function onerror(e, r) {
		$.set(error, e, true);
		$.set(reset, r, true);
	}

	var fragment = root_1();
	var node = $.first_child(fragment);

	$.boundary(node, { onerror }, ($$anchor) => {
		FlakyComponent($$anchor, {});
	});

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var button = root();

			$.delegated('click', button, () => {
				$.set(error, null);
				$.get(reset)();
			});

			$.append($$anchor, button);
		};

		$.if(node_1, ($$render) => {
			if ($.get(error)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}

$.delegate(['click']);