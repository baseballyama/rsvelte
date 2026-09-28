import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group/index.js';

var root = $.from_html(`<label class="border-input ring-offset-background has-data-[state=checked]:border-ring has-data-[state=checked]:bg-accent has-focus-visible:ring-ring/70 relative flex size-9 flex-1 cursor-pointer flex-col items-center justify-center gap-3 border text-center text-sm font-medium transition-colors first:rounded-s-lg last:rounded-e-lg has-focus-visible:ring-2 has-focus-visible:ring-offset-2 has-disabled:cursor-not-allowed has-disabled:opacity-50 has-data-[state=checked]:z-10"><!> </label>`);
var root_1 = $.from_html(`<fieldset class="space-y-4"><legend class="text-foreground text-sm leading-none font-medium">How likely are you to recommend us?</legend> <!></fieldset> <div class="mt-1 flex justify-between text-xs font-medium"><p><span class="text-base">😡</span> Not likely</p> <p>Very Likely <span class="text-base">😍</span></p></div>`, 1);

export default function Radio_17($$anchor) {
	let selectedValue = $.state('');
	var fragment = root_1();
	var fieldset = $.first_child(fragment);
	var node = $.sibling($.child(fieldset), 2);

	RadioGroup(node, {
		class: 'flex gap-0 -space-x-px rounded-lg shadow-xs shadow-black/[.04]',
		get value() {
			return $.get(selectedValue);
		},

		set value($$value) {
			$.set(selectedValue, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.each(node_1, 16, () => [0, 1, 2, 3, 4, 5], (number) => number, ($$anchor, number) => {
				var label = root();
				var node_2 = $.child(label);

				{
					let $0 = $.derived(() => number.toString());

					RadioGroupItem(node_2, {
						get id() {
							return `radio-17-r${number ?? ''}`;
						},

						get value() {
							return $.get($0);
						},
						class: 'sr-only after:absolute after:inset-0'
					});
				}

				var text = $.sibling(node_2);

				$.reset(label);
				$.template_effect(() => $.set_text(text, ` ${number ?? ''}`));
				$.append($$anchor, label);
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(fieldset);
	$.next(2);
	$.append($$anchor, fragment);
}