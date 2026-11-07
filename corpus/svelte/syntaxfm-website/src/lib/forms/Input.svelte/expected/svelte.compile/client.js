import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'label',
	'type',
	'value',
	'id'
]);

var root = $.from_html(`<label class="svelte-1r1hugr"> </label>`);
var root_1 = $.from_html(`<div class="input svelte-1r1hugr"><!> <input/></div>`);

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	let label = $.prop($$props, 'label', 3, ''),
		type = $.prop($$props, 'type', 3, 'text'),
		value = $.prop($$props, 'value', 15, ''),
		rest = $.rest_props($$props, rest_excludes);

	function typeAction(node) {
		node.type = type();
	}

	var div = root_1();
	var node_1 = $.child(div);

	{
		var consequent = ($$anchor) => {
			var label_1 = root();
			var text = $.only_child(label_1, true);

			$.template_effect(() => {
				$.set_attribute(label_1, 'for', $$props.id);
				$.set_text(text, label());
			});

			$.append($$anchor, label_1);
		};

		$.if(node_1, ($$render) => {
			if (label()) $$render(consequent);
		});
	}

	var input = $.sibling(node_1, 2);

	$.attribute_effect(input, () => ({ ...rest, id: $$props.id, name: $$props.id }), void 0, void 0, void 0, 'svelte-1r1hugr', true);
	$.action(input, ($$node) => typeAction?.($$node));
	$.effect(() => $.bind_value(input, value));
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}