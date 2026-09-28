import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Toast, createToaster } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<button class="btn preset-filled">Toast</button> <label class="label"><span class="label-text">Options</span> <div class="rounded-container border border-surface-200-800 p-2 flex flex-col gap-2"><label class="flex items-center space-x-2"><input class="checkbox" type="checkbox"/> <span>Overlap</span></label> <label class="label"><span class="label-text">Duration (ms)</span> <input class="input w-32" type="number"/></label></div></label> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let overlap = $.state(false);
	let duration = $.state($.proxy(Infinity));
	let toaster = $.derived(() => createToaster({ overlap: $.get(overlap) }));

	const createToast = () => {
		$.get(toaster).info({
			title: 'Toast',
			description: 'This is a toast message.',
			duration: $.get(duration),
			action: {
				label: 'Undo',
				onClick: () => $.get(toaster).success({ title: 'Undone' })
			}
		});
	};

	var fragment = root_2();
	var button = $.first_child(fragment);
	var label = $.sibling(button, 2);
	var div = $.sibling($.child(label), 2);
	var label_1 = $.child(div);
	var input = $.child(label_1);

	$.remove_input_defaults(input);
	$.next(2);
	$.reset(label_1);

	var label_2 = $.sibling(label_1, 2);
	var input_1 = $.sibling($.child(label_2), 2);

	$.remove_input_defaults(input_1);
	$.reset(label_2);
	$.reset(div);
	$.reset(label);

	var node = $.sibling(label, 2);

	$.key(node, () => $.get(toaster), ($$anchor) => {
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		{
			const children = ($$anchor, toast = $.noop) => {
				Toast($$anchor, {
					get toast() {
						return toast();
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root_1();
						var node_2 = $.first_child(fragment_3);

						$.component(node_2, () => Toast.Message, ($$anchor, Toast_Message) => {
							Toast_Message($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root();
									var node_3 = $.first_child(fragment_4);

									$.component(node_3, () => Toast.Title, ($$anchor, Toast_Title) => {
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

									var node_4 = $.sibling(node_3, 2);

									$.component(node_4, () => Toast.Description, ($$anchor, Toast_Description) => {
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

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						});

						var node_5 = $.sibling(node_2, 2);

						{
							var consequent = ($$anchor) => {
								var fragment_7 = $.comment();
								var node_6 = $.first_child(fragment_7);

								$.component(node_6, () => Toast.ActionTrigger, ($$anchor, Toast_ActionTrigger) => {
									Toast_ActionTrigger($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text();

											$.template_effect(() => $.set_text(text_2, toast().action.label));
											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_7);
							};

							$.if(node_5, ($$render) => {
								if (toast().action) $$render(consequent);
							});
						}

						var node_7 = $.sibling(node_5, 2);

						$.component(node_7, () => Toast.CloseTrigger, ($$anchor, Toast_CloseTrigger) => {
							Toast_CloseTrigger($$anchor, {});
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			};

			$.component(node_1, () => Toast.Group, ($$anchor, Toast_Group) => {
				Toast_Group($$anchor, {
					get toaster() {
						return $.get(toaster);
					},
					children,
					$$slots: { default: true }
				});
			});
		}

		$.append($$anchor, fragment_1);
	});

	$.delegated('click', button, createToast);
	$.bind_checked(input, () => $.get(overlap), ($$value) => $.set(overlap, $$value));
	$.bind_value(input_1, () => $.get(duration), ($$value) => $.set(duration, $$value));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);