import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ChevronRight from '@lucide/svelte/icons/chevron-right';
import { Switch } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="grid grid-cols-1 xl:grid-cols-2 gap-10"><div class="space-y-10"><div class="text-center space-y-2"><h2 class="h2">Tailwind Components</h2> <p class="text-balance opacity-60">Common visual interfaces, such as cards, buttons, and tables. Using semantic HTML elements and Tailwind utility classes.</p></div> <div class="card bg-noise preset-filled-secondary-500 aspect-video shadow-xl flex justify-center items-center"><button class="btn preset-filled scale-150 shadow-xl"><span>Button</span> <!></button></div></div> <div class="space-y-10"><div class="text-center space-y-2"><h2 class="h2">Framework Components</h2> <p class="text-balance opacity-60">Interactive components for supported frameworks. Handle state and logic for user interaction and form elements.</p></div> <div class="card bg-noise preset-filled-secondary-500 aspect-video shadow-xl flex justify-center items-center"><!></div></div></div>`);

export default function Tailwind_and_framework_components($$anchor) {
	var div = root_1();
	var div_1 = $.child(div);
	var div_2 = $.sibling($.child(div_1), 2);
	var button = $.child(div_2);
	var node = $.sibling($.child(button), 2);

	ChevronRight(node, { class: 'size-4' });
	$.reset(button);
	$.reset(div_2);
	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);
	var div_4 = $.sibling($.child(div_3), 2);
	var node_1 = $.child(div_4);

	Switch(node_1, {
		class: 'scale-[2.0] shadow-xl',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_2 = $.first_child(fragment);

			$.component(node_2, () => Switch.Label, ($$anchor, Switch_Label) => {
				Switch_Label($$anchor, {
					class: 'sr-only',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Toggle');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			var node_3 = $.sibling(node_2, 2);

			$.component(node_3, () => Switch.Control, ($$anchor, Switch_Control) => {
				Switch_Control($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = $.comment();
						var node_4 = $.first_child(fragment_1);

						$.component(node_4, () => Switch.Thumb, ($$anchor, Switch_Thumb) => {
							Switch_Thumb($$anchor, {});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			var node_5 = $.sibling(node_3, 2);

			$.component(node_5, () => Switch.HiddenInput, ($$anchor, Switch_HiddenInput) => {
				Switch_HiddenInput($$anchor, {});
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div_4);
	$.reset(div_3);
	$.reset(div);
	$.append($$anchor, div);
}