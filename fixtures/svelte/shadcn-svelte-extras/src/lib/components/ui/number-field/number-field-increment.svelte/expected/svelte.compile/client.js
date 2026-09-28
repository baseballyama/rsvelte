import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import PlusIcon from '@lucide/svelte/icons/plus';
import Button from '$lib/components/button.svelte';
import { useNumberFieldButton } from './number-field.svelte.js';
import { cn } from '$lib/utils';
import { box } from 'svelte-toolbelt';
import { onDestroy } from 'svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'variant',
	'size',
	'class',
	'children',
	'disabled',
	'onpointerdown',
	'onpointerup',
	'onpointerleave',
	'onpointercancel',
	'onclick',
	'tabindex'
]);

export default function Number_field_increment($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		variant = $.prop($$props, 'variant', 3, 'ghost'),
		size = $.prop($$props, 'size', 3, 'icon'),
		disabled = $.prop($$props, 'disabled', 3, false),
		tabindex = $.prop($$props, 'tabindex', 19, () => -1),
		rest = $.rest_props($$props, rest_excludes);

	const buttonState = useNumberFieldButton({
		direction: 'up',
		onpointerdown: box.with(() => $$props.onpointerdown),
		onpointerup: box.with(() => $$props.onpointerup),
		onpointerleave: box.with(() => $$props.onpointerleave),
		onpointercancel: box.with(() => $$props.onpointercancel),
		onclick: box.with(() => $$props.onclick),
		disabled: box.with(() => disabled())
	});

	onDestroy(() => buttonState.destroy());

	{
		let $0 = $.derived(() => cn('touch-manipulation', $$props.class));

		Button($$anchor, $.spread_props(
			{
				get variant() {
					return variant();
				},

				get size() {
					return size();
				},

				get tabindex() {
					return tabindex();
				},
				'data-slot': 'number-field-increment',
				'aria-label': 'Increase',
				get class() {
					return $.get($0);
				}
			},
			() => buttonState.props,
			() => rest,
			{
				get ref() {
					return ref();
				},

				set ref($$value) {
					ref($$value);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = $.comment();
					var node = $.first_child(fragment_1);

					{
						var consequent = ($$anchor) => {
							var fragment_2 = $.comment();
							var node_1 = $.first_child(fragment_2);

							$.snippet(node_1, () => $$props.children ?? $.noop);
							$.append($$anchor, fragment_2);
						};

						var alternate = ($$anchor) => {
							PlusIcon($$anchor, {});
						};

						$.if(node, ($$render) => {
							if ($$props.children) $$render(consequent); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			}
		));
	}

	$.pop();
}