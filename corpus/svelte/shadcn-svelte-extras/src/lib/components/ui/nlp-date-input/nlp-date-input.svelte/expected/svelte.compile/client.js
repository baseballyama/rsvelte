import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Command from '$lib/components/ui/command';
import { parseDate } from 'yeezy-dates';

var root = $.from_html(`<div class="flex w-full place-items-center justify-between gap-2"><span> </span> <span class="text-muted-foreground"> </span></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Nlp_date_input($$anchor, $$props) {
	$.push($$props, true);

	let placeholder = $.prop($$props, 'placeholder', 3, 'E.g. "tomorrow at 5pm" or "in 2 hours"');
	let value = $.state('');
	const suggestions = $.derived(() => parseDate($.get(value)).filter((suggestion) => ($$props.min === undefined || suggestion.date > $$props.min) && ($$props.max === undefined || suggestion.date < $$props.max)));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Command.Root, ($$anchor, Command_Root) => {
		Command_Root($$anchor, {
			shouldFilter: false,
			class: 'border-border h-fit border',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Command.Input, ($$anchor, Command_Input) => {
					Command_Input($$anchor, {
						get placeholder() {
							return placeholder();
						},

						get value() {
							return $.get(value);
						},

						set value($$value) {
							$.set(value, $$value, true);
						}
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Command.List, ($$anchor, Command_List) => {
					Command_List($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => Command.Group, ($$anchor, Command_Group) => {
								Command_Group($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_4 = $.first_child(fragment_3);

										$.each(node_4, 16, () => $.get(suggestions), (suggestion) => suggestion, ($$anchor, suggestion) => {
											var fragment_4 = $.comment();
											var node_5 = $.first_child(fragment_4);

											$.component(node_5, () => Command.Item, ($$anchor, Command_Item) => {
												Command_Item($$anchor, {
													onSelect: () => {
														$$props.onChoice?.(suggestion);
													},

													children: ($$anchor, $$slotProps) => {
														var div = root();
														var span = $.child(div);
														var text = $.only_child(span, true);
														var span_1 = $.sibling(span, 2);
														var text_1 = $.only_child(span_1);

														$.reset(div);

														$.template_effect(
															($0, $1) => {
																$.set_text(text, suggestion.label);

																$.set_text(text_1, `${$0 ?? ''}
							${$1 ?? ''}`);
															},
															[
																() => suggestion.date.toDateString(),
																() => suggestion.date.toLocaleTimeString()
															]
														);

														$.append($$anchor, div);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_4);
										});

										$.append($$anchor, fragment_3);
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
	$.pop();
}