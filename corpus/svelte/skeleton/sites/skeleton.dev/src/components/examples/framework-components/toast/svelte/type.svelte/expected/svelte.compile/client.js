import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Toast, createToaster } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="grid grid-cols-2 gap-2"><button class="btn preset-filled">Info</button> <button class="btn preset-filled-success-500">Success</button> <button class="btn preset-filled-warning-500">Warning</button> <button class="btn preset-filled-error-500">Error</button></div> <!>`, 1);

export default function Type($$anchor, $$props) {
	$.push($$props, true);

	const toaster = createToaster();
	var fragment = root_1();
	var div = $.first_child(fragment);
	var button = $.child(div);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var button_3 = $.sibling(button_2, 2);

	$.reset(div);

	var node = $.sibling(div, 2);

	{
		const children = ($$anchor, toast = $.noop) => {
			Toast($$anchor, {
				get toast() {
					return toast();
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					$.component(node_1, () => Toast.Message, ($$anchor, Toast_Message) => {
						Toast_Message($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root();
								var node_2 = $.first_child(fragment_3);

								$.component(node_2, () => Toast.Title, ($$anchor, Toast_Title) => {
									Toast_Title($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text();

											$.template_effect(() => $.set_text(text, toast().title));
											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});
								});

								var node_3 = $.sibling(node_2, 2);

								$.component(node_3, () => Toast.Description, ($$anchor, Toast_Description) => {
									Toast_Description($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text();

											$.template_effect(() => $.set_text(text_1, toast().description));
											$.append($$anchor, text_1);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					});

					var node_4 = $.sibling(node_1, 2);

					$.component(node_4, () => Toast.CloseTrigger, ($$anchor, Toast_CloseTrigger) => {
						Toast_CloseTrigger($$anchor, {});
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		};

		$.component(node, () => Toast.Group, ($$anchor, Toast_Group) => {
			Toast_Group($$anchor, {
				get toaster() {
					return toaster;
				},
				children,
				$$slots: { default: true }
			});
		});
	}

	$.delegated('click', button, () => toaster.info({ title: 'Info', description: 'This is an info toast.' }));
	$.delegated('click', button_1, () => toaster.success({ title: 'Success', description: 'This is a success toast.' }));
	$.delegated('click', button_2, () => toaster.warning({ title: 'Warning', description: 'This is a warning toast.' }));
	$.delegated('click', button_3, () => toaster.error({ title: 'Error', description: 'This is an error toast.' }));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);