import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Dialog } from "bits-ui";

var root = $.from_html(`<style>html {
			scrollbar-gutter: stable;
		}</style>`);

var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<main><div style="height: 200vh;"><!></div></main>`);

export default function Dialog_scrollbar_gutter_test($$anchor) {
	let open = $.state(false);
	var main = root_2();

	$.head('hz9o90', ($$anchor) => {
		var style = root();

		$.append($$anchor, style);
	});

	var div = $.child(main);
	var node = $.child(div);

	$.component(node, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			get open() {
				return $.get(open);
			},

			set open($$value) {
				$.set(open, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Dialog.Trigger, ($$anchor, Dialog_Trigger) => {
					Dialog_Trigger($$anchor, {
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

				$.component(node_2, () => Dialog.Portal, ($$anchor, Dialog_Portal) => {
					Dialog_Portal($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root_1();
							var node_3 = $.first_child(fragment_1);

							$.component(node_3, () => Dialog.Overlay, ($$anchor, Dialog_Overlay) => {
								Dialog_Overlay($$anchor, { 'data-testid': 'overlay' });
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Dialog.Content, ($$anchor, Dialog_Content) => {
								Dialog_Content($$anchor, {
									'data-testid': 'content',
									children: ($$anchor, $$slotProps) => {
										var fragment_2 = root_1();
										var node_5 = $.first_child(fragment_2);

										$.component(node_5, () => Dialog.Title, ($$anchor, Dialog_Title) => {
											Dialog_Title($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('title');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										var node_6 = $.sibling(node_5, 2);

										$.component(node_6, () => Dialog.Close, ($$anchor, Dialog_Close) => {
											Dialog_Close($$anchor, {
												'data-testid': 'close',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('close');

													$.append($$anchor, text_2);
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
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.reset(main);
	$.append($$anchor, main);
}