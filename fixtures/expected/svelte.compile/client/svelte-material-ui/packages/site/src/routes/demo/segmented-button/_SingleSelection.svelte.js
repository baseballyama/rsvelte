import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SegmentedButton, { Segment } from '@smui/segmented-button';
import Button from '@smui/button';
import { Label } from '@smui/common';

var root = $.from_html(`<!> <div style="margin-top: 1em;">Programmatically select:</div> <!> <!> <!> <!> <pre class="status"> </pre>`, 1);

export default function _SingleSelection($$anchor) {
	let choices = ['Morning', 'Afternoon', 'Evening', 'Night'];
	let selected = $.state('Morning');
	var fragment = root();
	var node = $.first_child(fragment);

	{
		const segment = ($$anchor, segment = $.noop) => {
			Segment($$anchor, {
				get segment() {
					return segment();
				},

				children: ($$anchor, $$slotProps) => {
					Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, segment()));
							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		};

		SegmentedButton(node, {
			get segments() {
				return choices;
			},
			singleSelect: true,
			get selected() {
				return $.get(selected);
			},

			set selected($$value) {
				$.set(selected, $$value, true);
			},
			segment,
			$$slots: { segment: true }
		});
	}

	var node_1 = $.sibling(node, 4);

	Button(node_1, {
		onclick: () => $.set(selected, 'Morning'),
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Morning');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		onclick: () => $.set(selected, 'Afternoon'),
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Afternoon');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Button(node_3, {
		onclick: () => $.set(selected, 'Evening'),
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Evening');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Button(node_4, {
		onclick: () => $.set(selected, 'Night'),
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Night');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var pre = $.sibling(node_4, 2);
	var text_5 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_5, `Selected: ${$.get(selected) ?? ''}`));
	$.append($$anchor, fragment);
}