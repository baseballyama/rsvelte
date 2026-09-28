import 'svelte/internal/disclose-version';
import { Tooltip } from "bits-ui";
import * as $ from 'svelte/internal/client';

const Content = ($$anchor, $$arg0) => {
	let props = () => ($$arg0?.()).props;
	let wrapperProps = () => ($$arg0?.()).wrapperProps;
	var div = root();

	$.attribute_effect(div, () => ({ ...wrapperProps() }));

	var div_1 = $.child(div);

	$.attribute_effect(div_1, () => ({ ...props() }));
	$.reset(div);
	$.append($$anchor, div);
};

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'open',
	'portalProps',
	'contentProps',
	'withOpenCheck'
]);

var root = $.from_html(`<div><div>Content</div></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<main data-testid="main"><!> <button data-testid="binding"> </button> <div class="h-96"></div> <div data-testid="outside">outside</div></main> <div data-testid="portal-target" id="portal-target"></div>`, 1);

export default function Tooltip_force_mount_test($$anchor, $$props) {
	let open = $.prop($$props, 'open', 7, false),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = root_2();
	var main = $.first_child(fragment);
	var node = $.child(main);

	$.component(node, () => Tooltip.Provider, ($$anchor, Tooltip_Provider) => {
		Tooltip_Provider($$anchor, {
			delayDuration: 0,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, $.spread_props(() => restProps, {
						get open() {
							return open();
						},

						set open($$value) {
							open($$value);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
								Tooltip_Trigger($$anchor, {
									'data-testid': 'trigger',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('@sveltejs');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Tooltip.Portal, ($$anchor, Tooltip_Portal) => {
								Tooltip_Portal($$anchor, $.spread_props(() => $$props.portalProps, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_4 = $.first_child(fragment_3);

										{
											var consequent_1 = ($$anchor) => {
												var fragment_4 = $.comment();
												var node_5 = $.first_child(fragment_4);

												{
													const child = ($$anchor, props = $.noop) => {
														var fragment_5 = $.comment();
														var node_6 = $.first_child(fragment_5);

														{
															var consequent = ($$anchor) => {
																Content($$anchor, props);
															};

															$.if(node_6, ($$render) => {
																if (props().open) $$render(consequent);
															});
														}

														$.append($$anchor, fragment_5);
													};

													$.component(node_5, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
														Tooltip_Content($$anchor, $.spread_props(() => $$props.contentProps, {
															'data-testid': 'content',
															class: 'w-80',
															forceMount: true,
															child,
															$$slots: { child: true }
														}));
													});
												}

												$.append($$anchor, fragment_4);
											};

											var alternate = ($$anchor) => {
												var fragment_7 = $.comment();
												var node_7 = $.first_child(fragment_7);

												{
													const child = ($$anchor, props = $.noop) => {
														Content($$anchor, props);
													};

													$.component(node_7, () => Tooltip.Content, ($$anchor, Tooltip_Content_1) => {
														Tooltip_Content_1($$anchor, $.spread_props(() => $$props.contentProps, {
															'data-testid': 'content',
															class: 'w-80',
															forceMount: true,
															child,
															$$slots: { child: true }
														}));
													});
												}

												$.append($$anchor, fragment_7);
											};

											$.if(node_4, ($$render) => {
												if ($$props.withOpenCheck) $$render(consequent_1); else $$render(alternate, -1);
											});
										}

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								}));
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					}));
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	var button = $.sibling(node, 2);
	var text_1 = $.only_child(button, true);

	$.next(4);
	$.reset(main);
	$.next(2);
	$.template_effect(() => $.set_text(text_1, open()));
	$.delegated('click', button, () => open(!open()));
	$.append($$anchor, fragment);
}

$.delegate(['click']);