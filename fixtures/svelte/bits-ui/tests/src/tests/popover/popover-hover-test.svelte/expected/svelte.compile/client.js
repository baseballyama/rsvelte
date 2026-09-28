import 'svelte/internal/disclose-version';
import { Popover } from "bits-ui";
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'open',
	'triggerProps',
	'contentProps'
]);

var root = $.from_html(`<div data-testid="content-text">content</div> <button data-testid="focusable-button">focusable button</button> <input data-testid="focusable-input" type="text" placeholder="input"/> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<main data-testid="main" style="display: flex; flex-direction: column; gap: 200px; padding: 20px;"><div><!> <button data-testid="binding"> </button></div> <div data-testid="outside" style="padding: 20px; background: #eee;">outside</div></main>`);

export default function Popover_hover_test($$anchor, $$props) {
	$.push($$props, true);

	let open = $.prop($$props, 'open', 15, false),
		restProps = $.rest_props($$props, rest_excludes);

	var main = root_2();
	var div = $.child(main);
	var node = $.child(div);

	$.component(node, () => Popover.Root, ($$anchor, Popover_Root) => {
		Popover_Root($$anchor, $.spread_props(() => restProps, {
			get open() {
				return open();
			},

			set open($$value) {
				open($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
					Popover_Trigger($$anchor, $.spread_props({ 'data-testid': 'trigger' }, () => $$props.triggerProps, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('trigger');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					}));
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Popover.Portal, ($$anchor, Popover_Portal) => {
					Popover_Portal($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = $.comment();
							var node_3 = $.first_child(fragment_1);

							$.component(node_3, () => Popover.Content, ($$anchor, Popover_Content) => {
								Popover_Content($$anchor, $.spread_props(() => $$props.contentProps, {
									'data-testid': 'content',
									children: ($$anchor, $$slotProps) => {
										var fragment_2 = root();
										var node_4 = $.sibling($.first_child(fragment_2), 6);

										$.component(node_4, () => Popover.Close, ($$anchor, Popover_Close) => {
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

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		}));
	});

	var button = $.sibling(node, 2);
	var text_2 = $.only_child(button, true);

	$.reset(div);
	$.next(2);
	$.reset(main);
	$.template_effect(() => $.set_text(text_2, open()));
	$.delegated('click', button, () => open(!open()));
	$.append($$anchor, main);
	$.pop();
}

$.delegate(['click']);