import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Select as SelectPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';
import { buttonVariants } from '$lib/components/ui/button';
import { useSplitButtonRootCtx } from './split-button.svelte.js';
import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'variant',
	'size',
	'disabled',
	'children'
]);

export default function Split_button_select_trigger($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		variant = $.prop($$props, 'variant', 3, 'default'),
		size = $.prop($$props, 'size', 3, 'icon'),
		restProps = $.rest_props($$props, rest_excludes);

	const root = useSplitButtonRootCtx();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => $$props.disabled || root.disabled);
		let $1 = $.derived(() => cn(buttonVariants({ variant: variant(), size: size() }), $$props.class));

		$.component(node, () => SelectPrimitive.Trigger, ($$anchor, SelectPrimitive_Trigger) => {
			SelectPrimitive_Trigger($$anchor, $.spread_props(
				{
					'data-slot': 'split-button-select-trigger',
					get disabled() {
						return $.get($0);
					},

					get class() {
						return $.get($1);
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

					children: ($$anchor, $$slotProps) => {
						var fragment_1 = $.comment();
						var node_1 = $.first_child(fragment_1);

						{
							var consequent = ($$anchor) => {
								var fragment_2 = $.comment();
								var node_2 = $.first_child(fragment_2);

								$.snippet(node_2, () => $$props.children);
								$.append($$anchor, fragment_2);
							};

							var alternate = ($$anchor) => {
								ChevronDownIcon($$anchor, {});
							};

							$.if(node_1, ($$render) => {
								if ($$props.children) $$render(consequent); else $$render(alternate, -1);
							});
						}

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}