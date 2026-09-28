import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Dialog } from '../../src/index.js';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Dialog_1($$anchor) {
	Dialog($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			$.component(node, () => Dialog.Trigger, ($$anchor, Dialog_Trigger) => {
				Dialog_Trigger($$anchor, { 'data-testid': 'trigger' });
			});

			var node_1 = $.sibling(node, 2);

			$.component(node_1, () => Dialog.Backdrop, ($$anchor, Dialog_Backdrop) => {
				Dialog_Backdrop($$anchor, { 'data-testid': 'backdrop' });
			});

			var node_2 = $.sibling(node_1, 2);

			$.component(node_2, () => Dialog.Positioner, ($$anchor, Dialog_Positioner) => {
				Dialog_Positioner($$anchor, {
					'data-testid': 'positioner',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_3 = $.first_child(fragment_2);

						$.component(node_3, () => Dialog.Content, ($$anchor, Dialog_Content) => {
							Dialog_Content($$anchor, {
								'data-testid': 'content',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_4 = $.first_child(fragment_3);

									$.component(node_4, () => Dialog.Title, ($$anchor, Dialog_Title) => {
										Dialog_Title($$anchor, { 'data-testid': 'title' });
									});

									var node_5 = $.sibling(node_4, 2);

									$.component(node_5, () => Dialog.Description, ($$anchor, Dialog_Description) => {
										Dialog_Description($$anchor, { 'data-testid': 'description' });
									});

									var node_6 = $.sibling(node_5, 2);

									$.component(node_6, () => Dialog.CloseTrigger, ($$anchor, Dialog_CloseTrigger) => {
										Dialog_CloseTrigger($$anchor, { 'data-testid': 'close-trigger' });
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

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}