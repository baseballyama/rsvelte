import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Dialog as SheetPrimitive } from 'bits-ui';
import { cn } from '$site/utils.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class']);

export default function Sheet_overlay($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn('fixed inset-0 z-50 bg-black/10 supports-backdrop-filter:backdrop-blur-xs', $$props.class));

		$.component(node, () => SheetPrimitive.Overlay, ($$anchor, SheetPrimitive_Overlay) => {
			SheetPrimitive_Overlay($$anchor, $.spread_props(
				{
					'data-slot': 'sheet-overlay',
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