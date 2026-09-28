import 'svelte/internal/disclose-version';
import { Popover } from "bits-ui";
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'open',
	'overlayProps',
	'withChild'
]);

var root = $.from_html(`<div>overlay</div>`);
var root_1 = $.from_html(`content <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<main data-testid="main"><!> <button data-testid="binding"> </button> <div data-testid="outside">outside</div></main> <div data-testid="portal-target" id="portal-target"></div>`, 1);

export default function Popover_overlay_test($$anchor, $$props) {
	let open = $.prop($$props, 'open', 7, false),
		withChild = $.prop($$props, 'withChild', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = root_3();
	var main = $.first_child(fragment);
	var node = $.child(main);

	$.component(node, () => Popover.Root, ($$anchor, Popover_Root) => {
		Popover_Root($$anchor, $.spread_props(() => restProps, {
			get open() {
				return open();
			},

			set open($$value) {
				open($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
					Popover_Trigger($$anchor, {
						'data-testid': 'trigger',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('trigger');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Popover.Portal, ($$anchor, Popover_Portal) => {
					Popover_Portal($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_2();
							var node_3 = $.first_child(fragment_2);

							{
								var consequent = ($$anchor) => {
									var fragment_3 = $.comment();
									var node_4 = $.first_child(fragment_3);

									{
										const child = ($$anchor, props = $.noop) => {
											var div = root();

											$.attribute_effect(div, () => ({
												...props().props,
												'data-testid': 'overlay-child',
												'data-open': props().open
											}));

											$.append($$anchor, div);
										};

										$.component(node_4, () => Popover.Overlay, ($$anchor, Popover_Overlay) => {
											Popover_Overlay($$anchor, $.spread_props(() => $$props.overlayProps, { 'data-testid': 'overlay', child, $$slots: { child: true } }));
										});
									}

									$.append($$anchor, fragment_3);
								};

								var alternate = ($$anchor) => {
									var fragment_4 = $.comment();
									var node_5 = $.first_child(fragment_4);

									$.component(node_5, () => Popover.Overlay, ($$anchor, Popover_Overlay_1) => {
										Popover_Overlay_1($$anchor, $.spread_props(() => $$props.overlayProps, {
											'data-testid': 'overlay',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('overlay content');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										}));
									});

									$.append($$anchor, fragment_4);
								};

								$.if(node_3, ($$render) => {
									if (withChild()) $$render(consequent); else $$render(alternate, -1);
								});
							}

							var node_6 = $.sibling(node_3, 2);

							$.component(node_6, () => Popover.Content, ($$anchor, Popover_Content) => {
								Popover_Content($$anchor, {
									'data-testid': 'content',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var fragment_5 = root_1();
										var node_7 = $.sibling($.first_child(fragment_5));

										$.component(node_7, () => Popover.Close, ($$anchor, Popover_Close) => {
											Popover_Close($$anchor, {
												'data-testid': 'close',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('close');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										});

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
		}));
	});

	var button = $.sibling(node, 2);
	var text_3 = $.only_child(button, true);

	$.next(2);
	$.reset(main);
	$.next(2);
	$.template_effect(() => $.set_text(text_3, open()));
	$.delegated('click', button, () => open(!open()));
	$.append($$anchor, fragment);
}

$.delegate(['click']);