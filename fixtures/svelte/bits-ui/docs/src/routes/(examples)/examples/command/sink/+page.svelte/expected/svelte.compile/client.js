import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Command } from "bits-ui";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div> </div> <div><!></div>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	// prettier-ignore
	const ten_first_names = [
		"John",
		"Doe",
		"Jane",
		"Smith",
		"Michael",
		"Brown",
		"William",
		"Johnson",
		"David",
		"Williams"
	];

	// prettier-ignore
	const ten_middle_names = [
		"James",
		"Lee",
		"Robert",
		"Michael",
		"David",
		"Joseph",
		"Thomas",
		"Charles",
		"Christopher",
		"Daniel"
	];

	// prettier-ignore
	const ten_last_names = [
		"Smith",
		"Johnson",
		"Williams",
		"Brown",
		"Jones",
		"Garcia",
		"Miller",
		"Davis",
		"Rodriguez",
		"Martinez"
	];

	// prettier-ignore
	const ten_second_first_names = [
		"Emma",
		"Liam",
		"Sophia",
		"Noah",
		"Olivia",
		"Ethan",
		"Ava",
		"Mason",
		"Isabella",
		"William"
	];

	const names = ten_first_names.map((first) => {
		return ten_middle_names.map((middle) => {
			return ten_last_names.map((last) => {
				return ten_second_first_names.map((second) => {
					return `${first} ${second} ${middle} ${last}`;
				});
			});
		});
	}).flat(3).slice(0, 2500);

	var fragment = root_1();
	var div = $.first_child(fragment);
	var text = $.only_child(div);
	var div_1 = $.sibling(div, 2);

	$.set_style(div_1, '', {}, { padding: '16px' });

	var node = $.child(div_1);

	$.component(node, () => Command.Root, ($$anchor, Command_Root) => {
		Command_Root($$anchor, {
			loop: true,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Command.Input, ($$anchor, Command_Input) => {
					Command_Input($$anchor, { placeholder: 'Search items...' });
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Command.List, ($$anchor, Command_List) => {
					Command_List($$anchor, {
						class: 'h-[var(--cmdk-list-height)]',
						style: 'height: 200px; overflow-y: auto; max-width: 300px;',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => Command.Empty, ($$anchor, Command_Empty) => {
								Command_Empty($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('No item found.');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.each(node_4, 16, () => names, (txt) => txt, ($$anchor, txt) => {
								var fragment_3 = $.comment();
								var node_5 = $.first_child(fragment_3);

								$.component(node_5, () => Command.Item, ($$anchor, Command_Item) => {
									Command_Item($$anchor, {
										get value() {
											return txt;
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text();

											$.template_effect(() => $.set_text(text_2, txt));
											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_3);
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_1);
	$.template_effect(() => $.set_text(text, `Total items: ${names.length ?? ''}`));
	$.append($$anchor, fragment);
	$.pop();
}