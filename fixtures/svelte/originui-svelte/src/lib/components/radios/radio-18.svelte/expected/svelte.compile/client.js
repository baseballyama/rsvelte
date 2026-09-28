import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group/index.js';
import IconCheck from '@lucide/svelte/icons/check';
import IconMinus from '@lucide/svelte/icons/minus';
import UiDark from '$assets/ui-dark.png?enhanced';
import UiLight from '$assets/ui-light.png?enhanced';
import UiSystem from '$assets/ui-system.png?enhanced';

var root = $.from_html(`<label><!> <enhanced:img class="border-input ring-offset-background peer-focus-visible:ring-ring/70 peer-data-[state=checked]:border-ring peer-data-[state=checked]:bg-accent relative h-[70px] w-[88px] cursor-pointer overflow-hidden rounded-lg border shadow-xs shadow-black/[.04] transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"></enhanced:img> <span class="group peer-data-[state=unchecked]:text-muted-foreground/70 mt-2 flex items-center gap-1"><!> <!> <span class="text-xs font-medium"> </span></span></label>`);
var root_1 = $.from_html(`<fieldset class="space-y-4"><legend class="text-foreground text-sm leading-none font-medium">Choose a theme</legend> <!></fieldset>`);

export default function Radio_18($$anchor) {
	const items = [
		{
			id: 'radio-18-r1',
			image: UiLight,
			label: 'Light',
			value: 'r1'
		},
		{ id: 'radio-18-r2', image: UiDark, label: 'Dark', value: 'r2' },
		{
			id: 'radio-18-r3',
			image: UiSystem,
			label: 'System',
			value: 'r3'
		}
	];

	var fieldset = root_1();
	var node = $.sibling($.child(fieldset), 2);

	RadioGroup(node, {
		class: 'flex gap-3',
		value: 'r1',
		children: ($$anchor, $$slotProps) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.each(node_1, 17, () => items, (item) => item.id, ($$anchor, item) => {
				var label = root();
				var node_2 = $.child(label);

				RadioGroupItem(node_2, {
					get id() {
						return $.get(item).id;
					},

					get value() {
						return $.get(item).value;
					},
					class: 'peer sr-only after:absolute after:inset-0'
				});

				var enhanced_img = $.sibling(node_2, 2);
				var span = $.sibling(enhanced_img, 2);
				var node_3 = $.child(span);

				IconCheck(node_3, {
					size: 16,
					'stroke-width': '2',
					class: 'in-[.group]:peer-data-[state=unchecked]:hidden',
					'aria-hidden': 'true'
				});

				var node_4 = $.sibling(node_3, 2);

				IconMinus(node_4, {
					size: 16,
					'stroke-width': '2',
					class: 'in-[.group]:peer-data-[state=checked]:hidden',
					'aria-hidden': 'true'
				});

				var span_1 = $.sibling(node_4, 2);
				var text = $.only_child(span_1, true);

				$.reset(span);
				$.reset(label);

				$.template_effect(() => {
					$.set_attribute(enhanced_img, 'src', $.get(item).image);
					$.set_attribute(enhanced_img, 'alt', $.get(item).label);
					$.set_text(text, $.get(item).label);
				});

				$.append($$anchor, label);
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(fieldset);
	$.append($$anchor, fieldset);
}