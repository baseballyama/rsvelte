import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Accordion } from "bits-ui";

var root = $.from_html(`<div> </div>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Accordion_single_force_mount_test($$anchor, $$props) {
	let disabled = $.prop($$props, 'disabled', 3, false),
		items = $.prop($$props, 'items', 19, () => []),
		value = $.prop($$props, 'value', 3, ""),
		withOpenCheck = $.prop($$props, 'withOpenCheck', 3, false);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Accordion.Root, ($$anchor, Accordion_Root) => {
		Accordion_Root($$anchor, {
			type: 'single',
			get value() {
				return value();
			},

			get disabled() {
				return disabled();
			},
			'data-testid': 'root',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.each(node_1, 17, items, ({ value, title, disabled, content, level }) => value, ($$anchor, $$item, $$index, $$array) => {
					let value = () => $.get($$item).value;
					let title = () => $.get($$item).title;
					let disabled = () => $.get($$item).disabled;
					let content = () => $.get($$item).content;
					let level = () => $.get($$item).level;
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					$.component(node_2, () => Accordion.Item, ($$anchor, Accordion_Item) => {
						Accordion_Item($$anchor, {
							get value() {
								return value();
							},

							get disabled() {
								return disabled();
							},

							get 'data-testid'() {
								return `${value() ?? ''}-item`;
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root_1();
								var node_3 = $.first_child(fragment_3);

								$.component(node_3, () => Accordion.Header, ($$anchor, Accordion_Header) => {
									Accordion_Header($$anchor, {
										get level() {
											return level();
										},

										get 'data-testid'() {
											return `${value() ?? ''}-header`;
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_4 = $.comment();
											var node_4 = $.first_child(fragment_4);

											$.component(node_4, () => Accordion.Trigger, ($$anchor, Accordion_Trigger) => {
												Accordion_Trigger($$anchor, {
													get disabled() {
														return disabled();
													},

													get 'data-testid'() {
														return `${value() ?? ''}-trigger`;
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text = $.text();

														$.template_effect(() => $.set_text(text, title()));
														$.append($$anchor, text);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_4);
										},
										$$slots: { default: true }
									});
								});

								var node_5 = $.sibling(node_3, 2);

								{
									var consequent_1 = ($$anchor) => {
										var fragment_6 = $.comment();
										var node_6 = $.first_child(fragment_6);

										{
											const child = ($$anchor, $$arg0) => {
												let props = () => ($$arg0?.()).props;
												let open = () => ($$arg0?.()).open;
												var fragment_7 = $.comment();
												var node_7 = $.first_child(fragment_7);

												{
													var consequent = ($$anchor) => {
														var div = root();

														$.attribute_effect(div, () => ({ ...props() }));

														var text_1 = $.only_child(div, true);

														$.template_effect(() => $.set_text(text_1, content()));
														$.append($$anchor, div);
													};

													$.if(node_7, ($$render) => {
														if (open()) $$render(consequent);
													});
												}

												$.append($$anchor, fragment_7);
											};

											$.component(node_6, () => Accordion.Content, ($$anchor, Accordion_Content) => {
												Accordion_Content($$anchor, {
													get 'data-testid'() {
														return `${value() ?? ''}-content`;
													},
													forceMount: true,
													child,
													$$slots: { child: true }
												});
											});
										}

										$.append($$anchor, fragment_6);
									};

									var alternate = ($$anchor) => {
										var fragment_8 = $.comment();
										var node_8 = $.first_child(fragment_8);

										{
											const child = ($$anchor, $$arg0) => {
												let props = () => ($$arg0?.()).props;
												let _open = () => ($$arg0?.()).open;
												var div_1 = root();

												$.attribute_effect(div_1, () => ({ ...props() }));

												var text_2 = $.only_child(div_1, true);

												$.template_effect(() => $.set_text(text_2, content()));
												$.append($$anchor, div_1);
											};

											$.component(node_8, () => Accordion.Content, ($$anchor, Accordion_Content_1) => {
												Accordion_Content_1($$anchor, {
													get 'data-testid'() {
														return `${value() ?? ''}-content`;
													},
													forceMount: true,
													child,
													$$slots: { child: true }
												});
											});
										}

										$.append($$anchor, fragment_8);
									};

									$.if(node_5, ($$render) => {
										if (withOpenCheck()) $$render(consequent_1); else $$render(alternate, -1);
									});
								}

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_2);
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}