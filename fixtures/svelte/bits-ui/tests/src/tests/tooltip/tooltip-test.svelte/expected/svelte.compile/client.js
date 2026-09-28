import 'svelte/internal/disclose-version';
import { Tooltip } from "bits-ui";
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'open',
	'portalProps',
	'contentProps',
	'providerProps',
	'triggerProps',
	'withCustomAnchor'
]);

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<main data-testid="main"><!> <button data-testid="binding"> </button> <div class="h-96"></div> <div data-testid="outside">outside</div> <div data-testid="custom-anchor">Content</div></main> <div data-testid="portal-target" id="portal-target"></div>`, 1);

export default function Tooltip_test($$anchor, $$props) {
	let open = $.prop($$props, 'open', 7, false),
		withCustomAnchor = $.prop($$props, 'withCustomAnchor', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	let customAnchor = $.state(null);
	var fragment = root_1();
	var main = $.first_child(fragment);
	var node = $.child(main);

	$.component(node, () => Tooltip.Provider, ($$anchor, Tooltip_Provider) => {
		Tooltip_Provider($$anchor, $.spread_props({ delayDuration: 0 }, () => $$props.providerProps, {
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
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
								Tooltip_Trigger($$anchor, $.spread_props({ 'data-testid': 'trigger' }, () => $$props.triggerProps, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('@sveltejs');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								}));
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Tooltip.Portal, ($$anchor, Tooltip_Portal) => {
								Tooltip_Portal($$anchor, $.spread_props(() => $$props.portalProps, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_4 = $.first_child(fragment_3);

										{
											let $0 = $.derived(() => withCustomAnchor() ? $.get(customAnchor) : undefined);

											$.component(node_4, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
												Tooltip_Content($$anchor, $.spread_props(() => $$props.contentProps, {
													get customAnchor() {
														return $.get($0);
													},
													'data-testid': 'content',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_1 = $.text('Content');

														$.append($$anchor, text_1);
													},
													$$slots: { default: true }
												}));
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
		}));
	});

	var button = $.sibling(node, 2);
	var text_2 = $.only_child(button, true);
	var div = $.sibling(button, 6);

	$.bind_this(div, ($$value) => $.set(customAnchor, $$value), () => $.get(customAnchor));
	$.reset(main);
	$.next(2);
	$.template_effect(() => $.set_text(text_2, open()));
	$.delegated('click', button, () => open(!open()));
	$.append($$anchor, fragment);
}

$.delegate(['click']);