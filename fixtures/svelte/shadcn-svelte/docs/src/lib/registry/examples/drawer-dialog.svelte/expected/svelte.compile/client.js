import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { MediaQuery } from "svelte/reactivity";
import * as Dialog from "$lib/registry/ui/dialog/index.js";
import * as Drawer from "$lib/registry/ui/drawer/index.js";
import { Button, buttonVariants } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <form class="grid items-start gap-4"><div class="grid gap-2"><!> <!></div> <div class="grid gap-2"><!> <!></div> <!></form>`, 1);
var root_2 = $.from_html(`<!> <form class="grid items-start gap-4 px-4"><div class="grid gap-2"><!> <!></div> <div class="grid gap-2"><!> <!></div> <!></form> <!>`, 1);

export default function Drawer_dialog($$anchor, $$props) {
	const id = $.props_id();

	$.push($$props, true);

	let open = $.state(false);
	const isDesktop = new MediaQuery("(min-width: 768px)");
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => Dialog.Root, ($$anchor, Dialog_Root) => {
				Dialog_Root($$anchor, {
					get open() {
						return $.get(open);
					},

					set open($$value) {
						$.set(open, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_2 = $.first_child(fragment_2);

						{
							let $0 = $.derived(() => buttonVariants({ variant: "outline" }));

							$.component(node_2, () => Dialog.Trigger, ($$anchor, Dialog_Trigger) => {
								Dialog_Trigger($$anchor, {
									get class() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Edit Profile');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});
						}

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => Dialog.Content, ($$anchor, Dialog_Content) => {
							Dialog_Content($$anchor, {
								class: 'sm:max-w-[425px]',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_1();
									var node_4 = $.first_child(fragment_3);

									$.component(node_4, () => Dialog.Header, ($$anchor, Dialog_Header) => {
										Dialog_Header($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root();
												var node_5 = $.first_child(fragment_4);

												$.component(node_5, () => Dialog.Title, ($$anchor, Dialog_Title) => {
													Dialog_Title($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('Edit profile');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												});

												var node_6 = $.sibling(node_5, 2);

												$.component(node_6, () => Dialog.Description, ($$anchor, Dialog_Description) => {
													Dialog_Description($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text('Make changes to your profile here. Click save when you\'re done.');

															$.append($$anchor, text_2);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_4);
											},
											$$slots: { default: true }
										});
									});

									var form = $.sibling(node_4, 2);
									var div = $.child(form);
									var node_7 = $.child(div);

									Label(node_7, {
										get for() {
											return `email-${id}`;
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_3 = $.text('Email');

											$.append($$anchor, text_3);
										},
										$$slots: { default: true }
									});

									var node_8 = $.sibling(node_7, 2);

									Input(node_8, {
										type: 'email',
										get id() {
											return `email-${id}`;
										},
										value: 'shadcn@example.com'
									});

									$.reset(div);

									var div_1 = $.sibling(div, 2);
									var node_9 = $.child(div_1);

									Label(node_9, {
										get for() {
											return `username-${id}`;
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_4 = $.text('Username');

											$.append($$anchor, text_4);
										},
										$$slots: { default: true }
									});

									var node_10 = $.sibling(node_9, 2);

									Input(node_10, {
										get id() {
											return `username-${id}`;
										},
										value: '@shadcn'
									});

									$.reset(div_1);

									var node_11 = $.sibling(div_1, 2);

									Button(node_11, {
										type: 'submit',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_5 = $.text('Save changes');

											$.append($$anchor, text_5);
										},
										$$slots: { default: true }
									});

									$.reset(form);
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
		};

		var alternate = ($$anchor) => {
			var fragment_5 = $.comment();
			var node_12 = $.first_child(fragment_5);

			$.component(node_12, () => Drawer.Root, ($$anchor, Drawer_Root) => {
				Drawer_Root($$anchor, {
					get open() {
						return $.get(open);
					},

					set open($$value) {
						$.set(open, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_6 = root();
						var node_13 = $.first_child(fragment_6);

						{
							let $0 = $.derived(() => buttonVariants({ variant: "outline" }));

							$.component(node_13, () => Drawer.Trigger, ($$anchor, Drawer_Trigger) => {
								Drawer_Trigger($$anchor, {
									get class() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_6 = $.text('Edit Profile');

										$.append($$anchor, text_6);
									},
									$$slots: { default: true }
								});
							});
						}

						var node_14 = $.sibling(node_13, 2);

						$.component(node_14, () => Drawer.Content, ($$anchor, Drawer_Content) => {
							Drawer_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = root_2();
									var node_15 = $.first_child(fragment_7);

									$.component(node_15, () => Drawer.Header, ($$anchor, Drawer_Header) => {
										Drawer_Header($$anchor, {
											class: 'text-start',
											children: ($$anchor, $$slotProps) => {
												var fragment_8 = root();
												var node_16 = $.first_child(fragment_8);

												$.component(node_16, () => Drawer.Title, ($$anchor, Drawer_Title) => {
													Drawer_Title($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_7 = $.text('Edit profile');

															$.append($$anchor, text_7);
														},
														$$slots: { default: true }
													});
												});

												var node_17 = $.sibling(node_16, 2);

												$.component(node_17, () => Drawer.Description, ($$anchor, Drawer_Description) => {
													Drawer_Description($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_8 = $.text('Make changes to your profile here. Click save when you\'re done.');

															$.append($$anchor, text_8);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_8);
											},
											$$slots: { default: true }
										});
									});

									var form_1 = $.sibling(node_15, 2);
									var div_2 = $.child(form_1);
									var node_18 = $.child(div_2);

									Label(node_18, {
										get for() {
											return `email-${id}`;
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_9 = $.text('Email');

											$.append($$anchor, text_9);
										},
										$$slots: { default: true }
									});

									var node_19 = $.sibling(node_18, 2);

									Input(node_19, {
										type: 'email',
										get id() {
											return `email-${id}`;
										},
										value: 'shadcn@example.com'
									});

									$.reset(div_2);

									var div_3 = $.sibling(div_2, 2);
									var node_20 = $.child(div_3);

									Label(node_20, {
										get for() {
											return `username-${id}`;
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_10 = $.text('Username');

											$.append($$anchor, text_10);
										},
										$$slots: { default: true }
									});

									var node_21 = $.sibling(node_20, 2);

									Input(node_21, {
										get id() {
											return `username-${id}`;
										},
										value: '@shadcn'
									});

									$.reset(div_3);

									var node_22 = $.sibling(div_3, 2);

									Button(node_22, {
										type: 'submit',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_11 = $.text('Save changes');

											$.append($$anchor, text_11);
										},
										$$slots: { default: true }
									});

									$.reset(form_1);

									var node_23 = $.sibling(form_1, 2);

									$.component(node_23, () => Drawer.Footer, ($$anchor, Drawer_Footer) => {
										Drawer_Footer($$anchor, {
											class: 'pt-2',
											children: ($$anchor, $$slotProps) => {
												var fragment_9 = $.comment();
												var node_24 = $.first_child(fragment_9);

												{
													let $0 = $.derived(() => buttonVariants({ variant: "outline" }));

													$.component(node_24, () => Drawer.Close, ($$anchor, Drawer_Close) => {
														Drawer_Close($$anchor, {
															get class() {
																return $.get($0);
															},

															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_12 = $.text('Cancel');

																$.append($$anchor, text_12);
															},
															$$slots: { default: true }
														});
													});
												}

												$.append($$anchor, fragment_9);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_6);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_5);
		};

		$.if(node, ($$render) => {
			if (isDesktop.current) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}