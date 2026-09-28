import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Output from './output.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Output_1($$anchor, $$props) {
	$.push($$props, true);

	/** @type {{ [key: string]: any }} */
	let props = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Output(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			Output(node_2, { with_attributes: true });

			var node_3 = $.sibling(node_2, 2);

			Output(node_3, { count: count + 1 });

			var node_4 = $.sibling(node_3, 2);

			Output(node_4, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('child');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			Output(node_5, {
				count: count + 1,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('child');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_5, 2);

			Output(node_6, {
				get count() {
					return $$props.count;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('child');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_6, 2);

			Output(node_7, {});
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (false) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}