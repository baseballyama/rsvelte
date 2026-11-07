import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Field, MenuField, Switch } from 'svelte-ux';

var root = $.from_html(`<div class="flex justify-end gap-2 items-end mb-2"><!> <!></div>`);

export default function DagrePlaygroundControls($$anchor, $$props) {
	$.push($$props, true);

	let selectedGraphValue = $.prop($$props, 'selectedGraphValue', 15),
		showSettings = $.prop($$props, 'showSettings', 15);

	var div = root();
	var node = $.child(div);

	MenuField(node, {
		label: 'Graph',
		options: [
			{ label: 'Simple', value: 'simple' },
			{ label: 'Medium', value: 'medium' },
			{ label: 'Large', value: 'large' },
			{ label: 'Les Misérables', value: 'miserables' },
			{ label: 'Generated (simple)', value: 'simple-generated' },
			{ label: 'Generated (complex)', value: 'complex-generated' }
		],
		menuIcon: '',
		dense: true,
		stepper: true,
		class: 'w-64',
		get value() {
			return selectedGraphValue();
		},

		set value($$value) {
			selectedGraphValue($$value);
		}
	});

	var node_1 = $.sibling(node, 2);

	Field(node_1, {
		label: 'Settings',
		labelPlacement: 'inset',
		dense: true,
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const id = $.derived(() => $$slotProps.id);

				Switch($$anchor, {
					get checked() {
						return showSettings();
					},

					get id() {
						return $.get(id);
					},
					size: 'md',
					$$events: { change: () => showSettings(!showSettings()) }
				});
			}
		}
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}