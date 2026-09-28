import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tooltip } from "bits-ui";

var root = $.from_html(`<!> <!>`, 1);

export default function Tooltip_many_test($$anchor, $$props) {
	let count = $.prop($$props, 'count', 3, 50),
		delayDuration = $.prop($$props, 'delayDuration', 3, 0),
		skipDelayDuration = $.prop($$props, 'skipDelayDuration', 3, 300),
		disableHoverableContent = $.prop($$props, 'disableHoverableContent', 3, false);

	const items = Array.from({ length: count() }, (_, i) => i);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Tooltip.Provider, ($$anchor, Tooltip_Provider) => {
		Tooltip_Provider($$anchor, {
			get delayDuration() {
				return delayDuration();
			},

			get skipDelayDuration() {
				return skipDelayDuration();
			},

			get disableHoverableContent() {
				return disableHoverableContent();
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.each(node_1, 17, () => items, $.index, ($$anchor, item) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					$.component(node_2, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
						Tooltip_Root($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root();
								var node_3 = $.first_child(fragment_3);

								{
									let $0 = $.derived(() => `trigger-${$.get(item)}`);

									$.component(node_3, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
										Tooltip_Trigger($$anchor, {
											get 'data-testid'() {
												return $.get($0);
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text();

												$.template_effect(() => $.set_text(text, `trigger-${$.get(item) ?? ''}`));
												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});
								}

								var node_4 = $.sibling(node_3, 2);

								$.component(node_4, () => Tooltip.Portal, ($$anchor, Tooltip_Portal) => {
									Tooltip_Portal($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_5 = $.comment();
											var node_5 = $.first_child(fragment_5);

											{
												let $0 = $.derived(() => `content-${$.get(item)}`);

												$.component(node_5, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
													Tooltip_Content($$anchor, {
														get 'data-testid'() {
															return $.get($0);
														},

														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text();

															$.template_effect(() => $.set_text(text_1, `content-${$.get(item) ?? ''}`));
															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												});
											}

											$.append($$anchor, fragment_5);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_2);
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}