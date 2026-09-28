import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from './ui/button';
import Icon from './Icon.svelte';
import path from 'path';
import * as AlertDialog from '$lib/components/ui/alert-dialog';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function CommandDeeplinkConfirm($$anchor, $$props) {
	$.push($$props, true);

	let open = $.prop($$props, 'open', 15, true);
	const assetsPath = $.derived(() => path.dirname($$props.plugin.pluginPath) + '/assets');
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => AlertDialog.Root, ($$anchor, AlertDialog_Root) => {
		AlertDialog_Root($$anchor, {
			onOpenChange: (isOpen) => !isOpen && $$props.oncancel(),
			get open() {
				return open();
			},

			set open($$value) {
				open($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => AlertDialog.Content, ($$anchor, AlertDialog_Content) => {
					AlertDialog_Content($$anchor, {
						class: 'w-fit',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => AlertDialog.Header, ($$anchor, AlertDialog_Header) => {
								AlertDialog_Header($$anchor, {
									class: 'items-center text-center',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_3 = $.first_child(fragment_3);

										Icon(node_3, {
											get icon() {
												return $$props.plugin.icon;
											},
											class: 'size-16',
											get assetsPath() {
												return $.get(assetsPath);
											}
										});

										var node_4 = $.sibling(node_3, 2);

										$.component(node_4, () => AlertDialog.Title, ($$anchor, AlertDialog_Title) => {
											AlertDialog_Title($$anchor, {
												class: 'text-xl font-semibold',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text();

													$.template_effect(() => $.set_text(text, `Request to open ${$$props.plugin.title ?? ''}`));
													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										});

										var node_5 = $.sibling(node_4, 2);

										$.component(node_5, () => AlertDialog.Description, ($$anchor, AlertDialog_Description) => {
											AlertDialog_Description($$anchor, {
												class: 'text-center text-sm',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('The command was triggered from outside of Flare. If you did not do this, please cancel the\n				operation.');

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

							var node_6 = $.sibling(node_2, 2);

							$.component(node_6, () => AlertDialog.Footer, ($$anchor, AlertDialog_Footer) => {
								AlertDialog_Footer($$anchor, {
									class: 'mt-2 !flex-col gap-2',
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root();
										var node_7 = $.first_child(fragment_5);

										{
											const child = ($$anchor, $$arg0) => {
												let props = () => ($$arg0?.()).props;

												Button($$anchor, $.spread_props(props, {
													get onclick() {
														return $$props.onconfirm;
													},
													class: 'w-full text-base',
													size: 'lg',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_2 = $.text('Open Command');

														$.append($$anchor, text_2);
													},
													$$slots: { default: true }
												}));
											};

											$.component(node_7, () => AlertDialog.Action, ($$anchor, AlertDialog_Action) => {
												AlertDialog_Action($$anchor, { child, $$slots: { child: true } });
											});
										}

										var node_8 = $.sibling(node_7, 2);

										Button(node_8, {
											get onclick() {
												return $$props.onconfirm;
											},
											variant: 'secondary',
											class: 'w-full text-base',
											size: 'lg',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text('Always Open Command');

												$.append($$anchor, text_3);
											},
											$$slots: { default: true }
										});

										var node_9 = $.sibling(node_8, 2);

										{
											const child = ($$anchor, $$arg0) => {
												let props = () => ($$arg0?.()).props;

												Button($$anchor, $.spread_props(props, {
													variant: 'ghost',
													class: 'w-full text-base',
													size: 'lg',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_4 = $.text('Cancel');

														$.append($$anchor, text_4);
													},
													$$slots: { default: true }
												}));
											};

											$.component(node_9, () => AlertDialog.Cancel, ($$anchor, AlertDialog_Cancel) => {
												AlertDialog_Cancel($$anchor, { child, $$slots: { child: true } });
											});
										}

										$.append($$anchor, fragment_5);
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
	$.pop();
}