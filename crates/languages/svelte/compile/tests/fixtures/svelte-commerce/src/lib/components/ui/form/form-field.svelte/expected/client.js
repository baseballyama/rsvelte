import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as FormPrimitive from 'formsnap';
import { cn } from '$lib/core/utils';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'form',
	'name',
	'children'
]);

var root = $.from_html(`<div><!></div>`);

export default function Form_field($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const children = ($$anchor, $$arg0) => {
			let constraints = () => ($$arg0?.()).constraints;
			let errors = () => ($$arg0?.()).errors;
			let tainted = () => ($$arg0?.()).tainted;
			let value = () => ($$arg0?.()).value;
			var div = root();

			$.attribute_effect(div, ($0) => ({ class: $0, ...restProps }), [() => cn('space-y-2', $$props.class)]);

			var node_1 = $.child(div);

			$.snippet(node_1, () => $$props.children ?? $.noop, () => ({
				constraints: constraints(),
				errors: errors(),
				tainted: tainted(),
				value: value()
			}));

			$.reset(div);
			$.bind_this(div, ($$value) => ref($$value), () => ref());
			$.append($$anchor, div);
		};

		$.component(node, () => FormPrimitive.Field, ($$anchor, FormPrimitive_Field) => {
			FormPrimitive_Field($$anchor, {
				get form() {
					return $$props.form;
				},

				get name() {
					return $$props.name;
				},
				children,
				$$slots: { default: true }
			});
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}