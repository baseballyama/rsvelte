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
	'form',
	'name'
]);

export default function Form_fieldset($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn('space-y-2', $$props.class));

		$.component(node, () => FormPrimitive.Fieldset, ($$anchor, FormPrimitive_Fieldset) => {
			FormPrimitive_Fieldset($$anchor, $.spread_props(
				{
					get form() {
						return $$props.form;
					},

					get name() {
						return $$props.name;
					},

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
					}
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}