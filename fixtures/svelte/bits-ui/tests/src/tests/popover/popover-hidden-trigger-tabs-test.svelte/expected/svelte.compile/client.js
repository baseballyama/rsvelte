import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Popover } from "bits-ui";

var root = $.from_html(`content <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<main data-testid="main" style="display: flex; flex-direction: column; gap: 24px; padding-top: 72px; padding-left: 72px;"><div role="tablist" aria-label="popover hidden trigger test tabs"><button role="tab" data-testid="tab-popover" aria-controls="popover-panel">Popover Tab</button> <button role="tab" data-testid="tab-other" aria-controls="other-panel">Other Tab</button></div> <div id="popover-panel" role="tabpanel" data-testid="panel-popover" style="padding-top: 120px; padding-left: 220px;"><!></div> <div id="other-panel" role="tabpanel" data-testid="panel-other"><div data-testid="outside">outside panel</div></div> <div data-testid="open-binding"> </div></main>`);

export default function Popover_hidden_trigger_tabs_test($$anchor) {
	let activeTab = $.state("popover");
	let open = $.state(false);
	var main = root_2();
	var div = $.child(main);
	var button = $.child(div);
	var button_1 = $.sibling(button, 2);

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node = $.child(div_1);

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

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var div_3 = $.sibling(div_2, 2);
	var text_2 = $.only_child(div_3, true);

	$.reset(main);

	$.template_effect(() => {
		$.set_attribute(button, 'aria-selected', $.get(activeTab) === "popover");
		$.set_attribute(button_1, 'aria-selected', $.get(activeTab) === "other");
		$.set_attribute(div_1, 'hidden', $.get(activeTab) !== "popover");
		$.set_attribute(div_2, 'hidden', $.get(activeTab) !== "other");
		$.set_text(text_2, $.get(open) ? "true" : "false");
	});

	$.delegated('click', button, () => $.set(activeTab, "popover"));
	$.delegated('click', button_1, () => $.set(activeTab, "other"));
	$.append($$anchor, main);
}

$.delegate(['click']);