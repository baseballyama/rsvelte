import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as FormPrimitive from 'formsnap';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'errorClasses',
	'children'
]);

var root = $.from_html(`<div> </div>`);

export default function Form_field_errors($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const children = ($$anchor, $$arg0) => {
			let errors = () => ($$arg0?.()).errors;
			let errorProps = () => ($$arg0?.()).errorProps;
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					$.snippet(node_2, () => $$props.children, () => ({ errors: errors(), errorProps: errorProps() }));
					$.append($$anchor, fragment_2);
				};

				var alternate = ($$anchor) => {
					var fragment_3 = $.comment();
					var node_3 = $.first_child(fragment_3);

					$.each(node_3, 16, errors, (error) => error, ($$anchor, error) => {
						var div = root();

						$.attribute_effect(div, ($0) => ({ ...errorProps(), class: $0 }), [() => cn($$props.errorClasses)]);

						var text = $.only_child(div, true);

						$.template_effect(() => $.set_text(text, error));
						$.append($$anchor, div);
					});

					$.append($$anchor, fragment_3);
				};

				$.if(node_1, ($$render) => {
					if ($$props.children) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(() => cn('text-destructive text-sm font-medium', $$props.class));

		$.component(node, () => FormPrimitive.FieldErrors, ($$anchor, FormPrimitive_FieldErrors) => {
			FormPrimitive_FieldErrors($$anchor, $.spread_props(
				{
					get class() {
						return $.get($0);
					}
				},
				() => restProps,
				{
					get ref() {
						return ref();
					},

					set ref($$value) {
						ref($$value);
					},
					children,
					$$slots: { default: true }
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}