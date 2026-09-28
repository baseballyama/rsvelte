import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Dialog from "$lib/registry/ui/dialog/index.js";
import { Button, buttonVariants } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <div class="grid gap-4"><div class="grid gap-3"><!> <!></div> <div class="grid gap-3"><!> <!></div></div> <!>`, 1);
var root_2 = $.from_html(`<form><!> <!></form>`);

export default function Dialog_demo($$anchor, $$props) {
	$.push($$props, true);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var form = root_2();
				var node_1 = $.child(form);

				{
					let $0 = $.derived(() => buttonVariants({ variant: "outline" }));

					$.component(node_1, () => Dialog.Trigger, ($$anchor, Dialog_Trigger) => {
						Dialog_Trigger($$anchor, {
							type: 'button',
							get class() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('Open Dialog');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});
				}

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Dialog.Content, ($$anchor, Dialog_Content) => {
					Dialog_Content($$anchor, {
						class: 'sm:max-w-[425px]',
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root_1();
							var node_3 = $.first_child(fragment_1);

							$.component(node_3, () => Dialog.Header, ($$anchor, Dialog_Header) => {
								Dialog_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_2 = root();
										var node_4 = $.first_child(fragment_2);

										$.component(node_4, () => Dialog.Title, ($$anchor, Dialog_Title) => {
											Dialog_Title($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('Edit profile');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										var node_5 = $.sibling(node_4, 2);

										$.component(node_5, () => Dialog.Description, ($$anchor, Dialog_Description) => {
											Dialog_Description($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('Make changes to your profile here. Click save when you\'re done.');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_2);
									},
									$$slots: { default: true }
								});
							});

							var div = $.sibling(node_3, 2);
							var div_1 = $.child(div);
							var node_6 = $.child(div_1);

							Label(node_6, {
								for: 'name-1',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Name');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});

							var node_7 = $.sibling(node_6, 2);

							Input(node_7, { id: 'name-1', name: 'name', defaultValue: 'Pedro Duarte' });
							$.reset(div_1);

							var div_2 = $.sibling(div_1, 2);
							var node_8 = $.child(div_2);

							Label(node_8, {
								for: 'username-1',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Username');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});

							var node_9 = $.sibling(node_8, 2);

							Input(node_9, {
								id: 'username-1',
								name: 'username',
								defaultValue: '@peduarte'
							});

							$.reset(div_2);
							$.reset(div);

							var node_10 = $.sibling(div, 2);

							$.component(node_10, () => Dialog.Footer, ($$anchor, Dialog_Footer) => {
								Dialog_Footer($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_11 = $.first_child(fragment_3);

										{
											let $0 = $.derived(() => buttonVariants({ variant: "outline" }));

											$.component(node_11, () => Dialog.Close, ($$anchor, Dialog_Close) => {
												Dialog_Close($$anchor, {
													type: 'button',
													get class() {
														return $.get($0);
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_5 = $.text('Cancel');

														$.append($$anchor, text_5);
													},
													$$slots: { default: true }
												});
											});
										}

										var node_12 = $.sibling(node_11, 2);

										Button(node_12, {
											type: 'submit',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_6 = $.text('Save changes');

												$.append($$anchor, text_6);
											},
											$$slots: { default: true }
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
				});

				$.reset(form);
				$.append($$anchor, form);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}