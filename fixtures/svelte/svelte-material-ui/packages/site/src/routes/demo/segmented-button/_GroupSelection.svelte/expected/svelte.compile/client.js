import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SegmentedButton, { Segment, Label } from '@smui/segmented-button';

var root = $.from_html(`<!> <pre class="status"> </pre>`, 1);

export default function _GroupSelection($$anchor) {
	let choices = ['Shoes', 'Pants', 'Shirts', 'Hats', 'Coats'];
	let selected = $.state($.proxy(['Shoes', 'Shirts', 'Coats']));
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

	var pre = $.sibling(node, 2);
	var text_1 = $.only_child(pre);

	$.template_effect(($0) => $.set_text(text_1, `Selected: ${$0 ?? ''}`), [() => $.get(selected).join(', ')]);
	$.append($$anchor, fragment);
}