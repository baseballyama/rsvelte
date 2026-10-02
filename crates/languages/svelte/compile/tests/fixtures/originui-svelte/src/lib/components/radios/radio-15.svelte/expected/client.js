import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group/index.js';

var root = $.from_html(`<span class="-mt-1 ml-2 inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-300/15 px-1 py-0.5 text-[10px] font-medium text-emerald-600 uppercase">Popular</span>`);
var root_1 = $.from_html(` <!>`, 1);
var root_2 = $.from_html(`<div class="border-input has-data-[state=checked]:border-ring has-data-[state=checked]:bg-accent relative flex flex-col gap-4 border p-4 first:rounded-t-lg last:rounded-b-lg has-data-[state=checked]:z-10"><div class="flex items-center justify-between"><div class="flex items-center gap-2"><!> <!></div> <div class="text-muted-foreground text-xs leading-[inherit]"> </div></div></div>`);
var root_3 = $.from_html(`<fieldset class="space-y-4"><legend class="text-foreground text-sm leading-none font-medium">Choose plan</legend> <!></fieldset>`);

export default function Radio_15($$anchor) {
	const items = [
		{
			id: 'radio-15-r1',
			label: 'Hobby',
			price: '$9/mo',
			value: 'r1'
		},

		{
			id: 'radio-15-r2',
			label: 'Plus',
			price: '$29/mo',
			value: 'r2'
		},

		{
			id: 'radio-15-r3',
			label: 'Team',
			price: '$49/mo',
			value: 'r3'
		},

		{
			id: 'radio-15-r4',
			label: 'Enterprise',
			price: 'Custom',
			value: 'r4'
		}
	];

	let selectedValue = $.state('r2');
	var fieldset = root_3();
	var node = $.sibling($.child(fieldset), 2);

	RadioGroup(node, {
		class: 'gap-0 -space-y-px rounded-lg shadow-xs shadow-black/[.04]',
		get value() {
			return $.get(selectedValue);
		},

		set value($$value) {
			$.set(selectedValue, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.each(node_1, 17, () => items, (item) => item.id, ($$anchor, item) => {
				var div = root_2();
				var div_1 = $.child(div);
				var div_2 = $.child(div_1);
				var node_2 = $.child(div_2);

				{
					let $0 = $.derived(() => `${$.get(item).id}-price`);

					RadioGroupItem(node_2, {
						get id() {
							return $.get(item).id;
						},

						get value() {
							return $.get(item).value;
						},
						class: 'after:absolute after:inset-0',
						get 'aria-describedby'() {
							return $.get($0);
						}
					});
				}

				var node_3 = $.sibling(node_2, 2);

				Label(node_3, {
					class: 'inline-flex items-start leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ',
					get for() {
						return $.get(item).id;
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var fragment_1 = root_1();
						var text = $.first_child(fragment_1);
						var node_4 = $.sibling(text);

						{
							var consequent = ($$anchor) => {
								var span = root();

								$.append($$anchor, span);
							};

							$.if(node_4, ($$render) => {
								if ($.get(item).value === 'r2') $$render(consequent);
							});
						}

						$.template_effect(() => $.set_text(text, `${$.get(item).label ?? ''} `));
						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});

				$.reset(div_2);

				var div_3 = $.sibling(div_2, 2);
				var text_1 = $.only_child(div_3, true);

				$.reset(div_1);
				$.reset(div);

				$.template_effect(() => {
					$.set_attribute(div_3, 'id', `${$.get(item).id}-price`);
					$.set_text(text_1, $.get(item).price);
				});

				$.append($$anchor, div);
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(fieldset);
	$.append($$anchor, fieldset);
}