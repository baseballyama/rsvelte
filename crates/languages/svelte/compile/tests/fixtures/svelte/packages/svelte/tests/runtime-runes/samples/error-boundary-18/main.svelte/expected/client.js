import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div> </div> <button>Increment</button> `, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let count = $.state(0);

	function maybe_throw() {
		if ($.get(count) > 1) {
			throw new Error('test');
		}

		return $.get(count);
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.boundary(
		node,
		{
			onerror: (e) => {
				throw e;
			}
		},
		($$anchor) => {
			var fragment_1 = root();
			var div = $.first_child(fragment_1);
			var text = $.only_child(div);
			var button = $.sibling(div, 2);
			var text_1 = $.sibling(button);

			$.template_effect(
				($0) => {
					$.set_text(text, `Count: ${$.get(count) ?? ''}`);
					$.set_text(text_1, ` ${$.get(count) ?? ''} / ${$0 ?? ''}`);
				},
				[() => maybe_throw()]
			);

			$.delegated('click', button, () => $.update(count));
			$.append($$anchor, fragment_1);
		}
	);

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);