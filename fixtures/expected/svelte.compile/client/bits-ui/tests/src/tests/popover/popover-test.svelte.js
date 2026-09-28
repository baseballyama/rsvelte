import 'svelte/internal/disclose-version';
import { Popover } from "bits-ui";
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'open',
	'contentProps',
	'portalProps',
	'overlayProps',
	'withOverlay'
]);

var root = $.from_html(`content <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<main data-testid="main"><!> <button data-testid="binding"> </button> <div data-testid="outside">outside</div></main> <div data-testid="portal-target" id="portal-target"></div>`, 1);

export default function Popover_test($$anchor, $$props) {
	let open = $.prop($$props, 'open', 7, false),
		withOverlay = $.prop($$props, 'withOverlay', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = root_2();
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
				var fragment_1 = root_1();
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
					Popover_Portal($$anchor, $.spread_props(() => $$props.portalProps, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var node_3 = $.first_child(fragment_2);

							{
								var consequent = ($$anchor) => {
									var fragment_3 = $.comment();
									var node_4 = $.first_child(fragment_3);

									$.component(node_4, () => Popover.Overlay, ($$anchor, Popover_Overlay) => {
										Popover_Overlay($$anchor, $.spread_props(() => $$props.overlayProps, { 'data-testid': 'overlay' }));
									});

									$.append($$anchor, fragment_3);
								};

								$.if(node_3, ($$render) => {
									if (withOverlay()) $$render(consequent);
								});
							}

							var node_5 = $.sibling(node_3, 2);

							$.component(node_5, () => Popover.Content, ($$anchor, Popover_Content) => {
								Popover_Content($$anchor, $.spread_props(() => $$props.contentProps, {
									'data-testid': 'content',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var fragment_4 = root();
										var node_6 = $.sibling($.first_child(fragment_4));

										$.component(node_6, () => Popover.Close, ($$anchor, Popover_Close) => {
											Popover_Close($$anchor, {
												'data-testid': 'close',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('close');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										var node_7 = $.sibling(node_6, 2);

										$.component(node_7, () => Popover.Arrow, ($$anchor, Popover_Arrow) => {
											Popover_Arrow($$anchor, { 'data-testid': 'arrow' });
										});

										$.append($$anchor, fragment_4);
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
		}));
	});

	var button = $.sibling(node, 2);
	var text_2 = $.only_child(button, true);

	$.next(2);
	$.reset(main);
	$.next(2);
	$.template_effect(() => $.set_text(text_2, open()));
	$.delegated('click', button, () => open(!open()));
	$.append($$anchor, fragment);
}

$.delegate(['click']);