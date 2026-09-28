import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Toast, createToaster } from '../../src/index.js';

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Toast_1($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const children = ($$anchor, toast = $.noop) => {
			Toast($$anchor, {
				get toast() {
					return toast();
				},
				'data-testid': 'root',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					$.component(node_1, () => Toast.Title, ($$anchor, Toast_Title) => {
						Toast_Title($$anchor, { 'data-testid': 'title' });
					});

					var node_2 = $.sibling(node_1, 2);

					$.component(node_2, () => Toast.Description, ($$anchor, Toast_Description) => {
						Toast_Description($$anchor, { 'data-testid': 'description' });
					});

					var node_3 = $.sibling(node_2, 2);

					$.component(node_3, () => Toast.ActionTrigger, ($$anchor, Toast_ActionTrigger) => {
						Toast_ActionTrigger($$anchor, { 'data-testid': 'action-trigger' });
					});

					var node_4 = $.sibling(node_3, 2);

					$.component(node_4, () => Toast.CloseTrigger, ($$anchor, Toast_CloseTrigger) => {
						Toast_CloseTrigger($$anchor, { 'data-testid': 'close-trigger' });
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		};

		$.component(node, () => Toast.Group, ($$anchor, Toast_Group) => {
			Toast_Group($$anchor, {
				get toaster() {
					return $$props.toaster;
				},
				'data-testid': 'group',
				children,
				$$slots: { default: true }
			});
		});
	}

	$.append($$anchor, fragment);
}