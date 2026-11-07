import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';
import { Dialog as SheetPrimitive } from 'bits-ui';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'ref']);

export default function Sheet_overlay($$anchor, $$props) {
	$.push($$props, true);

	let className = $.prop($$props, 'class', 7),
		ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var $$exports = {
		get class() {
			return className();
		},

		set class($$value) {
			className($$value);
		}
	};

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn('data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0  fixed inset-0 z-50 bg-black/80', className()));

		$.component(node, () => SheetPrimitive.Overlay, ($$anchor, SheetPrimitive_Overlay) => {
			SheetPrimitive_Overlay($$anchor, $.spread_props(
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
					}
				}
			));
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}