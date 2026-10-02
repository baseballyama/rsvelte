import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fromAction } from 'svelte/attachments';

var root = $.from_html(`<button data-kind="action"></button> <button data-kind="attachment"></button>`, 1);
var root_1 = $.from_html(`<!> <button></button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let count = $.prop($$props, 'count', 7, 0);

	function test(node, thing) {
		const kind = node.dataset.kind;

		console.log('create', thing, kind);

		let t = thing;
		const controller = new AbortController();

		node.addEventListener(
			'click',
			() => {
				console.log(t);
			},
			{ signal: controller.signal }
		);

		return {
			update(new_thing) {
				console.log('update', new_thing, kind);
				t = new_thing;
			},

			destroy() {
				console.log('destroy', kind);
				controller.abort();
			}
		};
	}

	var fragment = root_1();
	var node_1 = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = root();
			var button = $.first_child(fragment_1);

			$.action(button, ($$node, $$action_arg) => test?.($$node, $$action_arg), count);

			var button_1 = $.sibling(button, 2);

			$.attach(button_1, () => fromAction(test, () => count()));
			$.append($$anchor, fragment_1);
		};

		$.if(node_1, ($$render) => {
			if (count() < 2) $$render(consequent);
		});
	}

	var button_2 = $.sibling(node_1, 2);

	$.delegated('click', button_2, () => $.update_prop(count));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);