import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { FileUpload } from '../../src/index.js';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function File_upload($$anchor, $$props) {
	$.push($$props, true);

	FileUpload($$anchor, {
		'data-testid': 'root',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			$.component(node, () => FileUpload.Label, ($$anchor, FileUpload_Label) => {
				FileUpload_Label($$anchor, { 'data-testid': 'label' });
			});

			var node_1 = $.sibling(node, 2);

			$.component(node_1, () => FileUpload.Dropzone, ($$anchor, FileUpload_Dropzone) => {
				FileUpload_Dropzone($$anchor, {
					'data-testid': 'dropzone',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => FileUpload.Trigger, ($$anchor, FileUpload_Trigger) => {
							FileUpload_Trigger($$anchor, { 'data-testid': 'trigger' });
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => FileUpload.HiddenInput, ($$anchor, FileUpload_HiddenInput) => {
							FileUpload_HiddenInput($$anchor, { 'data-testid': 'hidden-input' });
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_4 = $.sibling(node_1, 2);

			$.component(node_4, () => FileUpload.ClearTrigger, ($$anchor, FileUpload_ClearTrigger) => {
				FileUpload_ClearTrigger($$anchor, { 'data-testid': 'clear-trigger' });
			});

			var node_5 = $.sibling(node_4, 2);

			$.component(node_5, () => FileUpload.ItemGroup, ($$anchor, FileUpload_ItemGroup) => {
				FileUpload_ItemGroup($$anchor, {
					'data-testid': 'item-group',
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = $.comment();
						var node_6 = $.first_child(fragment_3);

						$.component(node_6, () => FileUpload.Item, ($$anchor, FileUpload_Item) => {
							FileUpload_Item($$anchor, {
								file: new File(['test'], 'test.txt', { type: 'text/plain' }),
								'data-testid': 'item',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root_1();
									var node_7 = $.first_child(fragment_4);

									$.component(node_7, () => FileUpload.ItemName, ($$anchor, FileUpload_ItemName) => {
										FileUpload_ItemName($$anchor, { 'data-testid': 'item-name' });
									});

									var node_8 = $.sibling(node_7, 2);

									$.component(node_8, () => FileUpload.ItemSizeText, ($$anchor, FileUpload_ItemSizeText) => {
										FileUpload_ItemSizeText($$anchor, { 'data-testid': 'item-size-text' });
									});

									var node_9 = $.sibling(node_8, 2);

									$.component(node_9, () => FileUpload.ItemDeleteTrigger, ($$anchor, FileUpload_ItemDeleteTrigger) => {
										FileUpload_ItemDeleteTrigger($$anchor, { 'data-testid': 'item-delete-trigger' });
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}