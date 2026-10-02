import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tooltip } from "bits-ui";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<main data-testid="main" style="position: relative; width: 360px; height: 320px; padding: 24px;"><!> <button data-testid="rail" style="position: absolute; left: 110px; top: 74px; width: 120px; height: 36px;">Rail</button></main>`);

export default function Tooltip_safe_polygon_intermediate_target_test($$anchor) {
	var main = root_1();
	var node = $.child(main);

	$.component(node, () => Tooltip.Provider, ($$anchor, Tooltip_Provider) => {
		Tooltip_Provider($$anchor, {
			delayDuration: 0,
			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root();
							var node_2 = $.first_child(fragment_1);

							$.component(node_2, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
								Tooltip_Trigger($$anchor, {
									'data-testid': 'trigger',
									style: 'position: absolute; left: 120px; top: 24px;',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Trigger');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Tooltip.Portal, ($$anchor, Tooltip_Portal) => {
								Tooltip_Portal($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_2 = $.comment();
										var node_4 = $.first_child(fragment_2);

										$.component(node_4, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
											Tooltip_Content($$anchor, {
												'data-testid': 'content',
												side: 'bottom',
												sideOffset: 72,
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('Content');

													$.append($$anchor, text_1);
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

	$.next(2);
	$.reset(main);
	$.append($$anchor, main);
}