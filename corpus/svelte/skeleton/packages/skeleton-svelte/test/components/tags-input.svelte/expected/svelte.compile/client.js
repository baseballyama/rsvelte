import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { TagsInput } from '../../src/index.js';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Tags_input($$anchor) {
	TagsInput($$anchor, {
		'data-testid': 'root',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			$.component(node, () => TagsInput.Label, ($$anchor, TagsInput_Label) => {
				TagsInput_Label($$anchor, { 'data-testid': 'label' });
			});

			var node_1 = $.sibling(node, 2);

			$.component(node_1, () => TagsInput.Control, ($$anchor, TagsInput_Control) => {
				TagsInput_Control($$anchor, {
					'data-testid': 'control',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => TagsInput.Item, ($$anchor, TagsInput_Item) => {
							TagsInput_Item($$anchor, {
								index: 1,
								value: 'test',
								'data-testid': 'item',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_3 = $.first_child(fragment_3);

									$.component(node_3, () => TagsInput.ItemPreview, ($$anchor, TagsInput_ItemPreview) => {
										TagsInput_ItemPreview($$anchor, {
											'data-testid': 'item-preview',
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root();
												var node_4 = $.first_child(fragment_4);

												$.component(node_4, () => TagsInput.ItemText, ($$anchor, TagsInput_ItemText) => {
													TagsInput_ItemText($$anchor, { 'data-testid': 'item-text' });
												});

												var node_5 = $.sibling(node_4, 2);

												$.component(node_5, () => TagsInput.ItemDeleteTrigger, ($$anchor, TagsInput_ItemDeleteTrigger) => {
													TagsInput_ItemDeleteTrigger($$anchor, { 'data-testid': 'item-delete-trigger' });
												});

												$.append($$anchor, fragment_4);
											},
											$$slots: { default: true }
										});
									});

									var node_6 = $.sibling(node_3, 2);

									$.component(node_6, () => TagsInput.ItemInput, ($$anchor, TagsInput_ItemInput) => {
										TagsInput_ItemInput($$anchor, { 'data-testid': 'item-input' });
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

			var node_7 = $.sibling(node_1, 2);

			$.component(node_7, () => TagsInput.Input, ($$anchor, TagsInput_Input) => {
				TagsInput_Input($$anchor, { 'data-testid': 'input' });
			});

			var node_8 = $.sibling(node_7, 2);

			$.component(node_8, () => TagsInput.ClearTrigger, ($$anchor, TagsInput_ClearTrigger) => {
				TagsInput_ClearTrigger($$anchor, { 'data-testid': 'clear-trigger' });
			});

			var node_9 = $.sibling(node_8, 2);

			$.component(node_9, () => TagsInput.HiddenInput, ($$anchor, TagsInput_HiddenInput) => {
				TagsInput_HiddenInput($$anchor, { 'data-testid': 'hidden-input' });
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}