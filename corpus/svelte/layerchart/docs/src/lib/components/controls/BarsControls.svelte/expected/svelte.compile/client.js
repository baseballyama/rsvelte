import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="screenshot-hidden"><!></div>`);

export default function BarsControls($$anchor, $$props) {
	$.push($$props, true);

	let chartMode = $.prop($$props, 'chartMode', 15, 'group');
	var div = root_1();
	var node = $.child(div);

	Field(node, {
		label: 'Mode',
		class: 'mb-4',
		children: ($$anchor, $$slotProps) => {
			ToggleGroup($$anchor, {
				variant: 'outline',
				size: 'sm',
				inset: true,
				class: 'w-full',
				get value() {
					return chartMode();
				},

				set value($$value) {
					chartMode($$value);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_1 = $.first_child(fragment_1);

					ToggleOption(node_1, {
						value: 'group',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Grouped');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					ToggleOption(node_2, {
						value: 'stack',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Stacked');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					ToggleOption(node_3, {
						value: 'groupStack',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Grouped & Stacked');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}