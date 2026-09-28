import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SkullIcon from '@lucide/svelte/icons/skull';
import { Toast, createToaster } from '@skeletonlabs/skeleton-svelte';

const skull = ($$anchor) => {
	SkullIcon($$anchor, { class: 'size-8' });
};

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<button class="btn preset-filled">Toast</button> <!>`, 1);

export default function Meta($$anchor, $$props) {
	$.push($$props, true);

	const toaster = createToaster();
	var fragment_1 = root_2();
	var button = $.first_child(fragment_1);
	var node = $.sibling(button, 2);

	{
		const children = ($$anchor, toast = $.noop) => {
			Toast($$anchor, {
				get toast() {
					return toast();
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_1();
					var node_1 = $.first_child(fragment_3);

					$.snippet(node_1, () => toast().meta.icon);

					var node_2 = $.sibling(node_1, 2);

					$.component(node_2, () => Toast.Message, ($$anchor, Toast_Message) => {
						Toast_Message($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = root();
								var node_3 = $.first_child(fragment_4);

								$.component(node_3, () => Toast.Title, ($$anchor, Toast_Title) => {
									Toast_Title($$anchor, {
										class: 'flex gap-2 items-center',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text();

											$.template_effect(() => $.set_text(text, toast().title));
											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});
								});

								var node_4 = $.sibling(node_3, 2);

								$.component(node_4, () => Toast.Description, ($$anchor, Toast_Description) => {
									Toast_Description($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text();

											$.template_effect(() => $.set_text(text_1, `${toast().description ?? ''} ${toast().meta?.foo ?? ''}`));
											$.append($$anchor, text_1);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});
					});

					var node_5 = $.sibling(node_2, 2);

					$.component(node_5, () => Toast.CloseTrigger, ($$anchor, Toast_CloseTrigger) => {
						Toast_CloseTrigger($$anchor, {});
					});

					$.append($$anchor, fragment_3);
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

	$.delegated('click', button, () => toaster.info({
		title: 'Title',
		description: 'This is a description.',
		meta: { icon: skull }
	}));

	$.append($$anchor, fragment_1);
	$.pop();
}

$.delegate(['click']);