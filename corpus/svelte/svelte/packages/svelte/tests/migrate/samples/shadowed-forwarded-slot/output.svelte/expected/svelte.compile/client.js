import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<div></div>`);
var root_2 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Output($$anchor, $$props) {
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [label]
	 * @property {import('svelte').Snippet} [children]
	 */
	/** @type {Props} */
	const label_render = $.derived(() => $$props.label);

	const children_render = $.derived(() => $$props.children);
	var fragment = root_2();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.label ?? $.noop);
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($$props.label) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node, 2);

	{
		const label = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_3 = $.first_child(fragment_2);

			$.snippet(node_3, () => $.get(label_render) ?? $.noop);
			$.append($$anchor, fragment_2);
		};

		MyInput(node_2, { label, $$slots: { label: true } });
	}

	var node_4 = $.sibling(node_2, 2);

	{
		const label = ($$anchor) => {
			var div = root();
			var node_5 = $.child(div);

			{
				const label = ($$anchor) => {
					var div_1 = root();
					var node_6 = $.child(div_1);

					$.snippet(node_6, () => $.get(label_render) ?? $.noop);
					$.reset(div_1);
					$.append($$anchor, div_1);
				};

				MyComponent(node_5, { label, $$slots: { label: true } });
			}

			$.reset(div);
			$.append($$anchor, div);
		};

		MyInput(node_4, { label, $$slots: { label: true } });
	}

	var node_7 = $.sibling(node_4, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let args = () => ($$arg0?.()).args;
			var fragment_3 = $.comment();
			var node_8 = $.first_child(fragment_3);

			$.snippet(node_8, () => $.get(children_render) ?? $.noop);
			$.append($$anchor, fragment_3);
		};

		MyInput(node_7, { children, $$slots: { default: true } });
	}

	var node_9 = $.sibling(node_7, 2);

	MyInput(node_9, {
		children: ($$anchor, $$slotProps) => {
			var div_2 = root_1();

			{
				const children = ($$anchor, $$arg0) => {
					let args = () => ($$arg0?.()).args;
					var fragment_4 = $.comment();
					var node_10 = $.first_child(fragment_4);

					$.snippet(node_10, () => $.get(children_render) ?? $.noop);
					$.append($$anchor, fragment_4);
				};
			}

			$.append($$anchor, div_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}