import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';
import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group/index.js';

var root = $.from_html(`<div><div class="flex items-start gap-2"><!> <div class="grow"><div class="grid grow gap-2"><!> <p id="radio-05-with-expansion-description" class="text-muted-foreground text-xs">You can use this radio with a label and a description.</p></div> <div role="region" id="radio-input-05" aria-labelledby="radio-05-with-expansion" class="grid transition-all ease-in-out data-[state=collapsed]:grid-rows-[0fr] data-[state=collapsed]:opacity-0 data-[state=expanded]:grid-rows-[1fr] data-[state=expanded]:opacity-100"><div class="-m-2 overflow-hidden p-2"><div class="mt-3"><!></div></div></div></div></div></div> <div class="flex items-start gap-2"><!> <div class="grid grow gap-2"><!> <p id="radio-05-without-expansion-description" class="text-muted-foreground text-xs">You can use this checkbox with a label and a description.</p></div></div>`, 1);

export default function Radio_05($$anchor) {
	let selectedValue = $.state('without-expansion');
	let inputElement = $.state(null);

	const handleTransitionEnd = () => {
		if ($.get(selectedValue) === 'with-expansion' && $.get(inputElement)) {
			$.get(inputElement).focus();
		}
	};

	RadioGroup($$anchor, {
		class: 'gap-6',
		get value() {
			return $.get(selectedValue);
		},

		set value($$value) {
			$.set(selectedValue, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var div = $.first_child(fragment_1);
			var div_1 = $.child(div);
			var node = $.child(div_1);

			RadioGroupItem(node, {
				value: 'with-expansion',
				id: 'radio-05-with-expansion',
				'aria-describedby': 'radio-05-with-expansion-description',
				'aria-controls': 'radio-input-05'
			});

			var div_2 = $.sibling(node, 2);
			var div_3 = $.child(div_2);
			var node_1 = $.child(div_3);

			Label(node_1, {
				for: 'radio-05-with-expansion',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Radio with expansion');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.next(2);
			$.reset(div_3);

			var div_4 = $.sibling(div_3, 2);
			var div_5 = $.child(div_4);
			var div_6 = $.child(div_5);
			var node_2 = $.child(div_6);

			{
				let $0 = $.derived(() => $.get(selectedValue) !== 'with-expansion');

				Input(node_2, {
					type: 'text',
					id: 'radio-05-additional-info',
					placeholder: 'Enter details',
					'aria-label': 'Additional Information',
					get disabled() {
						return $.get($0);
					},

					get ref() {
						return $.get(inputElement);
					},

					set ref($$value) {
						$.set(inputElement, $$value, true);
					}
				});
			}

			$.reset(div_6);
			$.reset(div_5);
			$.reset(div_4);
			$.reset(div_2);
			$.reset(div_1);
			$.reset(div);

			var div_7 = $.sibling(div, 2);
			var node_3 = $.child(div_7);

			RadioGroupItem(node_3, {
				value: 'without-expansion',
				id: 'radio-05-without-expansion',
				'aria-describedby': 'radio-05-without-expansion-description'
			});

			var div_8 = $.sibling(node_3, 2);
			var node_4 = $.child(div_8);

			Label(node_4, {
				for: 'radio-05-without-expansion',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Radio without expansion');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.next(2);
			$.reset(div_8);
			$.reset(div_7);
			$.template_effect(() => $.set_attribute(div_4, 'data-state', $.get(selectedValue) === 'with-expansion' ? 'expanded' : 'collapsed'));
			$.event('transitionend', div_4, handleTransitionEnd);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}