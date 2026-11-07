import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import "../../app.css";
import { RadioGroup } from "bits-ui";

var root = $.from_html(`<div style="height: 24px;"> </div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div data-testid="shell" style="height: 320px; overflow: hidden;"><div style="display: flex; height: 100%;"><aside data-testid="sidebar" style="width: 120px; flex-shrink: 0; overflow-y: auto; border-right: 1px solid black;"></aside> <main data-testid="panel" style="min-width: 0; flex: 1; overflow-y: auto; padding: 12px;"><!> <!> <!></main></div></div>`);

export default function Radio_group_scroll_layout_test($$anchor, $$props) {
	const rows = Array.from({ length: 120 }, (_, index) => index + 1);
	let value = $.state("one");
	var div = root_2();
	var div_1 = $.child(div);
	var aside = $.child(div_1);

	$.each(aside, 21, () => rows, $.index, ($$anchor, row) => {
		var div_2 = root();
		var text = $.only_child(div_2);

		$.template_effect(() => $.set_text(text, `Sidebar row ${$.get(row) ?? ''}`));
		$.append($$anchor, div_2);
	});

	$.reset(aside);

	var main = $.sibling(aside, 2);
	var node = $.child(main);

	$.each(node, 17, () => rows, $.index, ($$anchor, row) => {
		var div_3 = root();
		var text_1 = $.only_child(div_3);

		$.template_effect(() => $.set_text(text_1, `Before row ${$.get(row) ?? ''}`));
		$.append($$anchor, div_3);
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => RadioGroup.Root, ($$anchor, RadioGroup_Root) => {
		RadioGroup_Root($$anchor, {
			get name() {
				return $$props.name;
			},
			orientation: 'horizontal',
			'data-testid': 'root',
			get value() {
				return $.get(value);
			},

			set value($$value) {
				$.set(value, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var node_2 = $.first_child(fragment);

				$.component(node_2, () => RadioGroup.Item, ($$anchor, RadioGroup_Item) => {
					RadioGroup_Item($$anchor, {
						value: 'one',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('One');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				});

				var node_3 = $.sibling(node_2, 2);

				$.component(node_3, () => RadioGroup.Item, ($$anchor, RadioGroup_Item_1) => {
					RadioGroup_Item_1($$anchor, {
						value: 'two',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Two');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	var node_4 = $.sibling(node_1, 2);

	$.each(node_4, 17, () => rows, $.index, ($$anchor, row) => {
		var div_4 = root();
		var text_4 = $.only_child(div_4);

		$.template_effect(() => $.set_text(text_4, `After row ${$.get(row) ?? ''}`));
		$.append($$anchor, div_4);
	});

	$.reset(main);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}