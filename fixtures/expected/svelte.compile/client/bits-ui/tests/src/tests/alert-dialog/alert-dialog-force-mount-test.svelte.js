import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AlertDialog } from "bits-ui";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'open',
	'contentProps',
	'portalProps',
	'titleProps',
	'descriptionProps',
	'withOpenCheck'
]);

var root = $.from_html(`<div></div>`);
var root_1 = $.from_html(`<div><!> <!> <!> <!> <button id="open-focus-override" data-testid="open-focus-override">open focus override</button></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<main><!> <p data-testid="binding"> </p> <button data-testid="toggle">toggle</button> <button id="close-focus-override" data-testid="close-focus-override">close focus override</button> <div id="portalTarget" data-testid="portalTarget"></div></main>`);

export default function Alert_dialog_force_mount_test($$anchor, $$props) {
	let open = $.prop($$props, 'open', 7, false),
		contentProps = $.prop($$props, 'contentProps', 19, () => ({})),
		portalProps = $.prop($$props, 'portalProps', 19, () => ({})),
		titleProps = $.prop($$props, 'titleProps', 19, () => ({})),
		descriptionProps = $.prop($$props, 'descriptionProps', 19, () => ({})),
		withOpenCheck = $.prop($$props, 'withOpenCheck', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	var main = root_3();
	var node = $.child(main);

	$.component(node, () => AlertDialog.Root, ($$anchor, AlertDialog_Root) => {
		AlertDialog_Root($$anchor, $.spread_props(() => restProps, {
			get open() {
				return open();
			},

			set open($$value) {
				open($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root_2();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => AlertDialog.Trigger, ($$anchor, AlertDialog_Trigger) => {
					AlertDialog_Trigger($$anchor, {
						'data-testid': 'trigger',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('open');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => AlertDialog.Portal, ($$anchor, AlertDialog_Portal) => {
					AlertDialog_Portal($$anchor, $.spread_props(portalProps, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root_2();
							var node_3 = $.first_child(fragment_1);

							{
								var consequent_1 = ($$anchor) => {
									var fragment_2 = $.comment();
									var node_4 = $.first_child(fragment_2);

									{
										const child = ($$anchor, $$arg0) => {
											let props = () => ($$arg0?.()).props;
											let open = () => ($$arg0?.()).open;
											var fragment_3 = $.comment();
											var node_5 = $.first_child(fragment_3);

											{
												var consequent = ($$anchor) => {
													var div = root();

													$.attribute_effect(div, () => ({ ...props() }));
													$.append($$anchor, div);
												};

												$.if(node_5, ($$render) => {
													if (open()) $$render(consequent);
												});
											}

											$.append($$anchor, fragment_3);
										};

										$.component(node_4, () => AlertDialog.Overlay, ($$anchor, AlertDialog_Overlay) => {
											AlertDialog_Overlay($$anchor, {
												forceMount: true,
												'data-testid': 'overlay',
												class: 'fixed inset-0 h-[100vh] w-[100vw] bg-black',
												child,
												$$slots: { child: true }
											});
										});
									}

									$.append($$anchor, fragment_2);
								};

								var alternate = ($$anchor) => {
									var fragment_4 = $.comment();
									var node_6 = $.first_child(fragment_4);

									{
										const child = ($$anchor, $$arg0) => {
											let props = () => ($$arg0?.()).props;
											let _open = () => ($$arg0?.()).open;
											var div_1 = root();

											$.attribute_effect(div_1, () => ({ ...props() }));
											$.append($$anchor, div_1);
										};

										$.component(node_6, () => AlertDialog.Overlay, ($$anchor, AlertDialog_Overlay_1) => {
											AlertDialog_Overlay_1($$anchor, {
												forceMount: true,
												'data-testid': 'overlay',
												class: 'fixed inset-0 h-[100vh] w-[100vw] bg-black',
												child,
												$$slots: { child: true }
											});
										});
									}

									$.append($$anchor, fragment_4);
								};

								$.if(node_3, ($$render) => {
									if (withOpenCheck()) $$render(consequent_1); else $$render(alternate, -1);
								});
							}

							var node_7 = $.sibling(node_3, 2);

							{
								var consequent_3 = ($$anchor) => {
									var fragment_5 = $.comment();
									var node_8 = $.first_child(fragment_5);

									{
										const child = ($$anchor, $$arg0) => {
											let props = () => ($$arg0?.()).props;
											let open = () => ($$arg0?.()).open;
											var fragment_6 = $.comment();
											var node_9 = $.first_child(fragment_6);

											{
												var consequent_2 = ($$anchor) => {
													var div_2 = root_1();

													$.attribute_effect(div_2, () => ({ ...props() }));

													var node_10 = $.child(div_2);

													$.component(node_10, () => AlertDialog.Title, ($$anchor, AlertDialog_Title) => {
														AlertDialog_Title($$anchor, $.spread_props(titleProps, {
															'data-testid': 'title',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_1 = $.text('title');

																$.append($$anchor, text_1);
															},
															$$slots: { default: true }
														}));
													});

													var node_11 = $.sibling(node_10, 2);

													$.component(node_11, () => AlertDialog.Description, ($$anchor, AlertDialog_Description) => {
														AlertDialog_Description($$anchor, $.spread_props(descriptionProps, {
															'data-testid': 'description',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text('description');

																$.append($$anchor, text_2);
															},
															$$slots: { default: true }
														}));
													});

													var node_12 = $.sibling(node_11, 2);

													$.component(node_12, () => AlertDialog.Cancel, ($$anchor, AlertDialog_Cancel) => {
														AlertDialog_Cancel($$anchor, {
															'data-testid': 'cancel',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_3 = $.text('cancel');

																$.append($$anchor, text_3);
															},
															$$slots: { default: true }
														});
													});

													var node_13 = $.sibling(node_12, 2);

													$.component(node_13, () => AlertDialog.Action, ($$anchor, AlertDialog_Action) => {
														AlertDialog_Action($$anchor, {
															'data-testid': 'action',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_4 = $.text('action');

																$.append($$anchor, text_4);
															},
															$$slots: { default: true }
														});
													});

													$.next(2);
													$.reset(div_2);
													$.append($$anchor, div_2);
												};

												$.if(node_9, ($$render) => {
													if (open()) $$render(consequent_2);
												});
											}

											$.append($$anchor, fragment_6);
										};

										$.component(node_8, () => AlertDialog.Content, ($$anchor, AlertDialog_Content) => {
											AlertDialog_Content($$anchor, $.spread_props({ forceMount: true }, contentProps, {
												'data-testid': 'content',
												class: 'tranlate-x-[50%] fixed left-[50%] top-[50%] translate-y-[50%] bg-white p-1',
												child,
												$$slots: { child: true }
											}));
										});
									}

									$.append($$anchor, fragment_5);
								};

								var alternate_1 = ($$anchor) => {
									var fragment_7 = $.comment();
									var node_14 = $.first_child(fragment_7);

									{
										const child = ($$anchor, $$arg0) => {
											let props = () => ($$arg0?.()).props;
											let _open = () => ($$arg0?.()).open;
											var div_3 = root_1();

											$.attribute_effect(div_3, () => ({ ...props() }));

											var node_15 = $.child(div_3);

											$.component(node_15, () => AlertDialog.Title, ($$anchor, AlertDialog_Title_1) => {
												AlertDialog_Title_1($$anchor, $.spread_props(titleProps, {
													'data-testid': 'title',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_5 = $.text('title');

														$.append($$anchor, text_5);
													},
													$$slots: { default: true }
												}));
											});

											var node_16 = $.sibling(node_15, 2);

											$.component(node_16, () => AlertDialog.Description, ($$anchor, AlertDialog_Description_1) => {
												AlertDialog_Description_1($$anchor, $.spread_props(descriptionProps, {
													'data-testid': 'description',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_6 = $.text('description');

														$.append($$anchor, text_6);
													},
													$$slots: { default: true }
												}));
											});

											var node_17 = $.sibling(node_16, 2);

											$.component(node_17, () => AlertDialog.Cancel, ($$anchor, AlertDialog_Cancel_1) => {
												AlertDialog_Cancel_1($$anchor, {
													'data-testid': 'cancel',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_7 = $.text('cancel');

														$.append($$anchor, text_7);
													},
													$$slots: { default: true }
												});
											});

											var node_18 = $.sibling(node_17, 2);

											$.component(node_18, () => AlertDialog.Action, ($$anchor, AlertDialog_Action_1) => {
												AlertDialog_Action_1($$anchor, {
													'data-testid': 'action',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_8 = $.text('action');

														$.append($$anchor, text_8);
													},
													$$slots: { default: true }
												});
											});

											$.next(2);
											$.reset(div_3);
											$.append($$anchor, div_3);
										};

										$.component(node_14, () => AlertDialog.Content, ($$anchor, AlertDialog_Content_1) => {
											AlertDialog_Content_1($$anchor, $.spread_props({ forceMount: true }, contentProps, {
												'data-testid': 'content',
												class: 'tranlate-x-[50%] fixed left-[50%] top-[50%] translate-y-[50%] bg-white p-1',
												child,
												$$slots: { child: true }
											}));
										});
									}

									$.append($$anchor, fragment_7);
								};

								$.if(node_7, ($$render) => {
									if (withOpenCheck()) $$render(consequent_3); else $$render(alternate_1, -1);
								});
							}

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					}));
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		}));
	});

	var p = $.sibling(node, 2);
	var text_9 = $.only_child(p, true);
	var button = $.sibling(p, 2);

	$.next(4);
	$.reset(main);
	$.template_effect(() => $.set_text(text_9, open()));
	$.delegated('click', button, () => open(!open()));
	$.append($$anchor, main);
}

$.delegate(['click']);