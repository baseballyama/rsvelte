import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Dialog as SheetPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class']);

export default function Sheet_description($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn('text-sm text-muted-foreground', $$props.class));

		$.component(node, () => SheetPrimitive.Description, ($$anchor, SheetPrimitive_Description) => {
			SheetPrimitive_Description($$anchor, $.spread_props(
				{
					'data-slot': 'sheet-description',
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