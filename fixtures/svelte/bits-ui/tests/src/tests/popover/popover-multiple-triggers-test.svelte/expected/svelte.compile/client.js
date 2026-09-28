import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Popover } from "bits-ui";

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Popover_multiple_triggers_test($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Popover.Root, ($$anchor, Popover_Root) => {
		Popover_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
					Popover_Trigger($$anchor, {
						'data-testid': 'trigger-1',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('trigger-1');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Popover.Trigger, ($$anchor, Popover_Trigger_1) => {
					Popover_Trigger_1($$anchor, {
						'data-testid': 'trigger-2',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('trigger-2');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				});

				var node_3 = $.sibling(node_2, 2);

				$.component(node_3, () => Popover.Trigger, ($$anchor, Popover_Trigger_2) => {
					Popover_Trigger_2($$anchor, {
						'data-testid': 'trigger-3',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('trigger-3');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_3, 2);

				$.component(node_4, () => Popover.Portal, ($$anchor, Popover_Portal) => {
					Popover_Portal($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_5 = $.first_child(fragment_2);

							$.component(node_5, () => Popover.Content, ($$anchor, Popover_Content) => {
								Popover_Content($$anchor, {
									'data-testid': 'content',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text('content');

										$.append($$anchor, text_3);
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
}