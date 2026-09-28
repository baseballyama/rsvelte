import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Popover } from "bits-ui";

var root = $.from_html(`content <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<main data-testid="main"><div data-testid="spacer-top" style="height: 720px;"></div> <div data-testid="anchor-zone" style="padding-left: 64px;"><!></div> <div data-testid="spacer-bottom" style="height: 2000px;"></div> <div data-testid="open-binding"> </div></main>`);

export default function Popover_scroll_jitter_test($$anchor) {
	let open = $.state(false);
	var main = root_2();
	var div = $.sibling($.child(main), 2);
	var node = $.child(div);

	$.component(node, () => Popover.Root, ($$anchor, Popover_Root) => {
		Popover_Root($$anchor, {
			get open() {
				return $.get(open);
			},

			set open($$value) {
				$.set(open, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var node_1 = $.first_child(fragment);

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
							var fragment_1 = $.comment();
							var node_3 = $.first_child(fragment_1);

							$.component(node_3, () => Popover.Content, ($$anchor, Popover_Content) => {
								Popover_Content($$anchor, {
									'data-testid': 'content',
									preventScroll: false,
									side: 'bottom',
									sideOffset: 8,
									children: ($$anchor, $$slotProps) => {
										$.next();

										var fragment_2 = root();
										var node_4 = $.sibling($.first_child(fragment_2));

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

										var node_5 = $.sibling(node_4, 2);

										$.component(node_5, () => Popover.Arrow, ($$anchor, Popover_Arrow) => {
											Popover_Arrow($$anchor, { 'data-testid': 'arrow' });
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
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);

	var div_1 = $.sibling(div, 4);
	var text_2 = $.only_child(div_1, true);

	$.reset(main);
	$.template_effect(() => $.set_text(text_2, $.get(open) ? "true" : "false"));
	$.append($$anchor, main);
}