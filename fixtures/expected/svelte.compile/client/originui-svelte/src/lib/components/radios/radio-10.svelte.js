import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group/index.js';

var root = $.from_html(`Label <span class="text-muted-foreground text-xs leading-[inherit] font-normal">(Sublabel)</span>`, 1);
var root_1 = $.from_html(`<div class="border-input has-data-[state=checked]:border-ring relative flex w-full items-start gap-2 rounded-lg border p-4 shadow-xs shadow-black/[.04]"><!> <div class="flex grow items-center gap-3"><svg class="shrink-0" xmlns="http://www.w3.org/2000/svg" width="32" height="32" aria-hidden="true"><circle cx="16" cy="16" r="16" fill="#121212"></circle><g clip-path="url(#sb-a)"><path fill="url(#sb-b)" d="M17.63 25.52c-.506.637-1.533.287-1.545-.526l-.178-11.903h8.003c1.45 0 2.259 1.674 1.357 2.81l-7.637 9.618Z"></path><path fill="url(#sb-c)" fill-opacity=".2" d="M17.63 25.52c-.506.637-1.533.287-1.545-.526l-.178-11.903h8.003c1.45 0 2.259 1.674 1.357 2.81l-7.637 9.618Z"></path><path fill="#3ECF8E" d="M14.375 6.367c.506-.638 1.532-.289 1.544.525l.078 11.903H8.094c-1.45 0-2.258-1.674-1.357-2.81l7.638-9.618Z"></path></g><defs><linearGradient id="sb-b" x1="15.907" x2="23.02" y1="15.73" y2="18.713" gradientUnits="userSpaceOnUse"><stop stop-color="#249361"></stop><stop offset="1" stop-color="#3ECF8E"></stop></linearGradient><linearGradient id="sb-c" x1="12.753" x2="15.997" y1="11.412" y2="17.519" gradientUnits="userSpaceOnUse"><stop></stop><stop offset="1" stop-opacity="0"></stop></linearGradient><clip-path><path fill="#fff" d="M6.354 6h19.292v20H6.354z"></path></clip-path></defs></svg> <div class="grid grow gap-2"><!> <p id="radio-10-r1-description" class="text-muted-foreground text-xs">You can use this card with a label and a description.</p></div></div></div> <div class="border-input has-data-[state=checked]:border-ring relative flex items-center gap-2 rounded-lg border p-4 shadow-xs shadow-black/[.04]"><!> <div class="flex grow items-start gap-3"><svg class="shrink-0" xmlns="http://www.w3.org/2000/svg" width="32" height="32" aria-hidden="true"><circle cx="16" cy="16" r="16" fill="#090A15"></circle><path fill="#fff" fill-rule="evenodd" d="M8.004 19.728a.996.996 0 0 1-.008-1.054l7.478-12.199a.996.996 0 0 1 1.753.104l6.832 14.82a.996.996 0 0 1-.618 1.37l-10.627 3.189a.996.996 0 0 1-1.128-.42l-3.682-5.81Zm8.333-9.686a.373.373 0 0 1 .709-.074l4.712 10.904a.374.374 0 0 1-.236.506L14.18 23.57a.373.373 0 0 1-.473-.431l2.63-13.097Z" clip-rule="evenodd"></path></svg> <div class="grid grow gap-2"><!> <p id="radio-10-r2-description" class="text-muted-foreground text-xs">You can use this card with a label and a description.</p></div></div></div>`, 3);

export default function Radio_10($$anchor) {
	RadioGroup($$anchor, {
		class: 'gap-2',
		value: 'r1',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var div = $.first_child(fragment_1);
			var node = $.child(div);

			RadioGroupItem(node, {
				value: 'r1',
				id: 'radio-10-r1',
				'aria-describedby': 'radio-10-r1-description',
				class: 'order-1 after:absolute after:inset-0'
			});

			var div_1 = $.sibling(node, 2);
			var svg = $.child(div_1);
			var defs = $.sibling($.child(svg), 2);
			var clip_path = $.sibling($.child(defs), 2);

			$.set_custom_element_data(clip_path, 'id', 'sb-a');
			$.reset(defs);
			$.reset(svg);

			var div_2 = $.sibling(svg, 2);
			var node_1 = $.child(div_2);

			Label(node_1, {
				for: 'radio-10-r1',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_2 = root();

					$.next();
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.next(2);
			$.reset(div_2);
			$.reset(div_1);
			$.reset(div);

			var div_3 = $.sibling(div, 2);
			var node_2 = $.child(div_3);

			RadioGroupItem(node_2, {
				value: 'r2',
				id: 'radio-10-r2',
				'aria-describedby': 'radio-10-r2-description',
				class: 'order-1 after:absolute after:inset-0'
			});

			var div_4 = $.sibling(node_2, 2);
			var div_5 = $.sibling($.child(div_4), 2);
			var node_3 = $.child(div_5);

			Label(node_3, {
				for: 'radio-10-r2',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_3 = root();

					$.next();
					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			$.next(2);
			$.reset(div_5);
			$.reset(div_4);
			$.reset(div_3);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}