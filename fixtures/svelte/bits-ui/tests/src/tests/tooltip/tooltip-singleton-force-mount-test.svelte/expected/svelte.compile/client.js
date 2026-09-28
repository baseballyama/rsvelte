import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tooltip } from "bits-ui";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'withOpenCheck']);
var root = $.from_html(`<div><div><span data-testid="payload"> </span></div></div>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<main data-testid="main"><!> <div data-testid="open-binding"> </div> <div data-testid="trigger-binding"> </div> <div data-testid="outside">outside</div></main>`);

export default function Tooltip_singleton_force_mount_test($$anchor, $$props) {
	$.push($$props, true);

	let withOpenCheck = $.prop($$props, 'withOpenCheck', 3, false),
		rootProps = $.rest_props($$props, rest_excludes);

	const tether = Tooltip.createTether();
	let open = $.state(false);
	let triggerId = $.state(null);
	var main = root_2();
	var node = $.child(main);

	$.component(node, () => Tooltip.Provider, ($$anchor, Tooltip_Provider) => {
		Tooltip_Provider($$anchor, {
			delayDuration: 0,
			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				{
					const children = ($$anchor, $$arg0) => {
						let payload = () => ($$arg0?.()).payload;
						var fragment_1 = root_1();
						var node_2 = $.first_child(fragment_1);

						$.component(node_2, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
							Tooltip_Trigger($$anchor, {
								id: 'trigger-1',
								'data-testid': 'trigger-1',
								get tether() {
									return tether;
								},
								payload: { label: "Alpha" },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Alpha');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger_1) => {
							Tooltip_Trigger_1($$anchor, {
								id: 'trigger-2',
								'data-testid': 'trigger-2',
								get tether() {
									return tether;
								},
								payload: { label: "Beta" },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Beta');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						});

						var node_4 = $.sibling(node_3, 2);

						$.component(node_4, () => Tooltip.Portal, ($$anchor, Tooltip_Portal) => {
							Tooltip_Portal($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_2 = $.comment();
									var node_5 = $.first_child(fragment_2);

									{
										const child = ($$anchor, $$arg0) => {
											let wrapperProps = () => ($$arg0?.()).wrapperProps;
											let props = () => ($$arg0?.()).props;
											let contentOpen = () => ($$arg0?.()).open;
											var fragment_3 = $.comment();
											var node_6 = $.first_child(fragment_3);

											{
												var consequent_1 = ($$anchor) => {
													var fragment_4 = $.comment();
													var node_7 = $.first_child(fragment_4);

													{
														var consequent = ($$anchor) => {
															var div = root();

															$.attribute_effect(div, () => ({ ...wrapperProps() }));

															var div_1 = $.child(div);

															$.attribute_effect(div_1, () => ({ ...props(), 'data-testid': 'content-node' }));

															var span = $.child(div_1);
															var text_2 = $.only_child(span, true);

															$.reset(div_1);
															$.reset(div);
															$.template_effect(() => $.set_text(text_2, payload()?.label ?? "null"));
															$.append($$anchor, div);
														};

														$.if(node_7, ($$render) => {
															if (contentOpen()) $$render(consequent);
														});
													}

													$.append($$anchor, fragment_4);
												};

												var alternate = ($$anchor) => {
													var div_2 = root();

													$.attribute_effect(div_2, () => ({ ...wrapperProps() }));

													var div_3 = $.child(div_2);

													$.attribute_effect(div_3, () => ({ ...props(), 'data-testid': 'content-node' }));

													var span_1 = $.child(div_3);
													var text_3 = $.only_child(span_1, true);

													$.reset(div_3);
													$.reset(div_2);
													$.template_effect(() => $.set_text(text_3, payload()?.label ?? "null"));
													$.append($$anchor, div_2);
												};

												$.if(node_6, ($$render) => {
													if (withOpenCheck()) $$render(consequent_1); else $$render(alternate, -1);
												});
											}

											$.append($$anchor, fragment_3);
										};

										$.component(node_5, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
											Tooltip_Content($$anchor, {
												'data-testid': 'content',
												forceMount: true,
												child,
												$$slots: { child: true }
											});
										});
									}

									$.append($$anchor, fragment_2);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_1);
					};

					$.component(node_1, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
						Tooltip_Root($$anchor, $.spread_props(
							{
								get tether() {
									return tether;
								}
							},
							() => rootProps,
							{
								get open() {
									return $.get(open);
								},

								set open($$value) {
									$.set(open, $$value, true);
								},

								get triggerId() {
									return $.get(triggerId);
								},

								set triggerId($$value) {
									$.set(triggerId, $$value, true);
								},
								children,
								$$slots: { default: true }
							}
						));
					});
				}

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	var div_4 = $.sibling(node, 2);
	var text_4 = $.only_child(div_4, true);
	var div_5 = $.sibling(div_4, 2);
	var text_5 = $.only_child(div_5, true);

	$.next(2);
	$.reset(main);

	$.template_effect(() => {
		$.set_text(text_4, $.get(open) ? "true" : "false");
		$.set_text(text_5, $.get(triggerId) ?? "null");
	});

	$.append($$anchor, main);
	$.pop();
}