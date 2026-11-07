import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as FormPrimitive from 'formsnap';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class']);

export default function Form_description($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn('text-muted-foreground text-sm', $$props.class));

		$.component(node, () => FormPrimitive.Description, ($$anchor, FormPrimitive_Description) => {
			FormPrimitive_Description($$anchor, $.spread_props(
				{
					'data-slot': 'form-description',
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