import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox, Element, TabGroup, TabPage, Text } from '$lib';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function TestElementIfStatement($$anchor) {
	// https://github.com/kitschpatrol/svelte-tweakpane-ui/issues/18
	// https://svelte.dev/repl/3cc711caf304411dbf2d6fc8d2493219?version=4.2.19
	let text = '#1234';

	let text2 = '#1235';
	let check = false;

	TabGroup($$anchor, {
		children: ($$anchor, $$slotProps) => {
			TabPage($$anchor, {
				title: 'A',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node = $.first_child(fragment_2);

					Checkbox(node, {
						label: 'Visibility',
						get value() {
							return check;
						},

						set value($$value) {
							check = $$value;
						}
					});

					var node_1 = $.sibling(node, 2);

					{
						var consequent = ($$anchor) => {
							var fragment_3 = root();
							var node_2 = $.first_child(fragment_3);

							Element(node_2, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('🅱️');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							var node_3 = $.sibling(node_2, 2);

							Text(node_3, {
								label: 'C',
								get value() {
									return text;
								},

								set value($$value) {
									text = $$value;
								}
							});

							$.append($$anchor, fragment_3);
						};

						$.if(node_1, ($$render) => {
							if (check) $$render(consequent);
						});
					}

					var node_4 = $.sibling(node_1, 2);

					Text(node_4, {
						label: 'D',
						get value() {
							return text2;
						},

						set value($$value) {
							text2 = $$value;
						}
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}