import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Sheet from "$lib/registry/ui/sheet/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { buttonVariants } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <div class="grid flex-1 auto-rows-min gap-6 px-4"><div class="grid gap-3"><!> <!></div> <div class="grid gap-3"><!> <!></div></div> <!>`, 1);

export default function Sheet_demo($$anchor, $$props) {
	$.push($$props, true);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Sheet.Root, ($$anchor, Sheet_Root) => {
		Sheet_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				{
					let $0 = $.derived(() => buttonVariants({ variant: "outline" }));

					$.component(node_1, () => Sheet.Trigger, ($$anchor, Sheet_Trigger) => {
						Sheet_Trigger($$anchor, {
							get class() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('Open');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});
				}

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Sheet.Content, ($$anchor, Sheet_Content) => {
					Sheet_Content($$anchor, {
						side: 'right',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => Sheet.Header, ($$anchor, Sheet_Header) => {
								Sheet_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_4 = $.first_child(fragment_3);

										$.component(node_4, () => Sheet.Title, ($$anchor, Sheet_Title) => {
											Sheet_Title($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('Edit profile');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										var node_5 = $.sibling(node_4, 2);

										$.component(node_5, () => Sheet.Description, ($$anchor, Sheet_Description) => {
											Sheet_Description($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('Make changes to your profile here. Click save when you\'re done.');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							var div = $.sibling(node_3, 2);
							var div_1 = $.child(div);
							var node_6 = $.child(div_1);

							Label(node_6, {
								for: 'name',
								class: 'text-end',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Name');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});

							var node_7 = $.sibling(node_6, 2);

							Input(node_7, { id: 'name', value: 'Pedro Duarte' });
							$.reset(div_1);

							var div_2 = $.sibling(div_1, 2);
							var node_8 = $.child(div_2);

							Label(node_8, {
								for: 'username',
								class: 'text-end',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Username');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});

							var node_9 = $.sibling(node_8, 2);

							Input(node_9, { id: 'username', value: '@peduarte' });
							$.reset(div_2);
							$.reset(div);

							var node_10 = $.sibling(div, 2);

							$.component(node_10, () => Sheet.Footer, ($$anchor, Sheet_Footer) => {
								Sheet_Footer($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root();
										var node_11 = $.first_child(fragment_4);

										Button(node_11, {
											type: 'submit',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_5 = $.text('Save changes');

												$.append($$anchor, text_5);
											},
											$$slots: { default: true }
										});

										var node_12 = $.sibling(node_11, 2);

										{
											let $0 = $.derived(() => buttonVariants({ variant: "outline" }));

											$.component(node_12, () => Sheet.Close, ($$anchor, Sheet_Close) => {
												Sheet_Close($$anchor, {
													get class() {
														return $.get($0);
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_6 = $.text('Close');

														$.append($$anchor, text_6);
													},
													$$slots: { default: true }
												});
											});
										}

										$.append($$anchor, fragment_4);
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