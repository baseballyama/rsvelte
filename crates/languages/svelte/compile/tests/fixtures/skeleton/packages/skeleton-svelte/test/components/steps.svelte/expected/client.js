import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Steps } from '../../src/index.js';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Steps_1($$anchor) {
	Steps($$anchor, {
		'data-testid': 'root',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			$.component(node, () => Steps.List, ($$anchor, Steps_List) => {
				Steps_List($$anchor, {
					'data-testid': 'list',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Steps.Item, ($$anchor, Steps_Item) => {
							Steps_Item($$anchor, {
								index: 0,
								'data-testid': 'item',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Steps.Trigger, ($$anchor, Steps_Trigger) => {
										Steps_Trigger($$anchor, {
											'data-testid': 'trigger',
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = $.comment();
												var node_3 = $.first_child(fragment_4);

												$.component(node_3, () => Steps.Indicator, ($$anchor, Steps_Indicator) => {
													Steps_Indicator($$anchor, { 'data-testid': 'indicator' });
												});

												$.append($$anchor, fragment_4);
											},
											$$slots: { default: true }
										});
									});

									var node_4 = $.sibling(node_2, 2);

									$.component(node_4, () => Steps.Separator, ($$anchor, Steps_Separator) => {
										Steps_Separator($$anchor, { 'data-testid': 'separator' });
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_5 = $.sibling(node, 2);

			$.component(node_5, () => Steps.Content, ($$anchor, Steps_Content) => {
				Steps_Content($$anchor, { index: 0, 'data-testid': 'content' });
			});

			var node_6 = $.sibling(node_5, 2);

			$.component(node_6, () => Steps.PrevTrigger, ($$anchor, Steps_PrevTrigger) => {
				Steps_PrevTrigger($$anchor, { 'data-testid': 'prev-trigger' });
			});

			var node_7 = $.sibling(node_6, 2);

			$.component(node_7, () => Steps.NextTrigger, ($$anchor, Steps_NextTrigger) => {
				Steps_NextTrigger($$anchor, { 'data-testid': 'next-trigger' });
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}