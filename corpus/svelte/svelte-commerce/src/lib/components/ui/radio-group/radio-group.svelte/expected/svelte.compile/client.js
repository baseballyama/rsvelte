import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RadioGroup as RadioGroupPrimitive } from 'bits-ui';
import { cn } from '$lib/core/utils';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class', 'value']);

export default function Radio_group($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		className = $.prop($$props, 'class', 7),
		value = $.prop($$props, 'value', 15),
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
		let $0 = $.derived(() => cn('grid gap-2', className()));

		$.component(node, () => RadioGroupPrimitive.Root, ($$anchor, RadioGroupPrimitive_Root) => {
			RadioGroupPrimitive_Root($$anchor, $.spread_props(
				{
					get class() {
						return $.get($0);
					}
				},
				() => restProps,
				{
					get value() {
						return value();
					},

					set value($$value) {
						value($$value);
					},

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