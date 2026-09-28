import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group/index.js';

var root = $.from_html(`<div class="flex items-center gap-2"><!> <!></div> <div class="flex items-center gap-2"><!> <!></div> <div class="flex items-center gap-2"><!> <!></div>`, 1);
var root_1 = $.from_html(`<svelte-css-wrapper style="display: contents"><!></svelte-css-wrapper>`, 1);

export default function Radio_02($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		$.css_props(node, () => ({
			'--primary': '238.7 83.5% 66.7%',
			'--ring': '238.7 83.5% 66.7%'
		}));

		RadioGroup(node.lastChild, {
			value: 'r2',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var div = $.first_child(fragment_1);
				var node_1 = $.child(div);

				RadioGroupItem(node_1, { value: 'r1', id: 'radio-02-r1' });

				var node_2 = $.sibling(node_1, 2);

				Label(node_2, {
					for: 'radio-02-r1',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Option 1');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				$.reset(div);

				var div_1 = $.sibling(div, 2);
				var node_3 = $.child(div_1);

				RadioGroupItem(node_3, { value: 'r2', id: 'radio-02-r2' });

				var node_4 = $.sibling(node_3, 2);

				Label(node_4, {
					for: 'radio-02-r2',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Option 2');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				$.reset(div_1);

				var div_2 = $.sibling(div_1, 2);
				var node_5 = $.child(div_2);

				RadioGroupItem(node_5, { value: 'r3', id: 'radio-02-r3' });

				var node_6 = $.sibling(node_5, 2);

				Label(node_6, {
					for: 'radio-02-r3',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('Option 3');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});

				$.reset(div_2);
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});

		$.reset(node);
	}

	$.append($$anchor, fragment);
}