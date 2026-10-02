import 'svelte/internal/disclose-version';
import { Accordion } from "bits-ui";
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!>`, 1);

export default function Accordion_test_isolated($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Accordion.Root, ($$anchor, Accordion_Root) => {
		Accordion_Root($$anchor, {
			type: 'single',
			value: '1',
			'data-testid': 'root',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Accordion.Item, ($$anchor, Accordion_Item) => {
					Accordion_Item($$anchor, {
						value: '1',
						'data-testid': 'item',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Accordion.Header, ($$anchor, Accordion_Header) => {
								Accordion_Header($$anchor, {
									'data-testid': 'header',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_3 = $.first_child(fragment_3);

										$.component(node_3, () => Accordion.Trigger, ($$anchor, Accordion_Trigger) => {
											Accordion_Trigger($$anchor, $.spread_props({ 'data-testid': 'trigger' }, () => $$props.triggerProps, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text('open');

													$.append($$anchor, text);
												},
												$$slots: { default: true }
											}));
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_2, 2);

							$.component(node_4, () => Accordion.Content, ($$anchor, Accordion_Content) => {
								Accordion_Content($$anchor, {
									'data-testid': 'content',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('item 1');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
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

	$.append($$anchor, fragment);
}