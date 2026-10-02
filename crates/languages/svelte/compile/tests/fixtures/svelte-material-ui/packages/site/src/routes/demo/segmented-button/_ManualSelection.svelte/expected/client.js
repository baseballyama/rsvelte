import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SegmentedButton, { Segment, Label } from '@smui/segmented-button';

var root = $.from_html(`<!> <pre class="status"> </pre>`, 1);

export default function _ManualSelection($$anchor, $$props) {
	$.push($$props, true);

	let choices = $.proxy([
		{ name: 'Shoes', selected: true },
		{ name: 'Pants', selected: false },
		{ name: 'Shirts', selected: true },
		{ name: 'Hats', selected: false },
		{ name: 'Coats', selected: true }
	]);

	var fragment = root();
	var node = $.first_child(fragment);

	{
		const segment = ($$anchor, segment = $.noop) => {
			Segment($$anchor, {
				get segment() {
					return segment();
				},

				get selected() {
					return segment().selected;
				},

				onclick: () => {
					segment().selected = !segment().selected;
				},

				children: ($$anchor, $$slotProps) => {
					Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, segment().name));
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
			key: (segment) => segment.name,
			segment,
			$$slots: { segment: true }
		});
	}

	var pre = $.sibling(node, 2);
	var text_1 = $.only_child(pre);

	$.template_effect(($0) => $.set_text(text_1, `Selected: ${$0 ?? ''}`), [
		() => choices.filter((choice) => choice.selected).map((choice) => choice.name).join(', ')
	]);

	$.append($$anchor, fragment);
	$.pop();
}