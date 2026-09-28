import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Steps } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> `, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <div class="flex justify-between items-center gap-2"><!> <!></div>`, 1);

export default function Controlled($$anchor) {
	const steps = [
		{ title: 'First', content: 'First do this.' },
		{ title: 'Then', content: 'Then do that.' },
		{ title: 'Finally', content: 'Almost done...' }
	];

	let step = $.state(0);

	Steps($$anchor, {
		get step() {
			return $.get(step);
		},
		onStepChange: (details) => $.set(step, details.step, true),
		get count() {
			return steps.length;
		},
		class: 'w-full',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			$.component(node, () => Steps.List, ($$anchor, Steps_List) => {
				Steps_List($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.each(node_1, 17, () => steps, $.index, ($$anchor, item, index) => {
							var fragment_3 = $.comment();
							var node_2 = $.first_child(fragment_3);

							$.component(node_2, () => Steps.Item, ($$anchor, Steps_Item) => {
								Steps_Item($$anchor, {
									index,
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_1();
										var node_3 = $.first_child(fragment_4);

										$.component(node_3, () => Steps.Trigger, ($$anchor, Steps_Trigger) => {
											Steps_Trigger($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root();
													var node_4 = $.first_child(fragment_5);

													$.component(node_4, () => Steps.Indicator, ($$anchor, Steps_Indicator) => {
														Steps_Indicator($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text = $.text();

																text.nodeValue = index + 1;
																$.append($$anchor, text);
															},
															$$slots: { default: true }
														});
													});

													var text_1 = $.sibling(node_4);

													$.template_effect(() => $.set_text(text_1, ` ${$.get(item).title ?? ''}`));
													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										var node_5 = $.sibling(node_3, 2);

										{
											var consequent = ($$anchor) => {
												var fragment_7 = $.comment();
												var node_6 = $.first_child(fragment_7);

												$.component(node_6, () => Steps.Separator, ($$anchor, Steps_Separator) => {
													Steps_Separator($$anchor, {});
												});

												$.append($$anchor, fragment_7);
											};

											$.if(node_5, ($$render) => {
												if (index < steps.length - 1) $$render(consequent);
											});
										}

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_3);
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_7 = $.sibling(node, 2);

			$.each(node_7, 17, () => steps, $.index, ($$anchor, item, index) => {
				var fragment_8 = $.comment();
				var node_8 = $.first_child(fragment_8);

				$.component(node_8, () => Steps.Content, ($$anchor, Steps_Content) => {
					Steps_Content($$anchor, {
						index,
						class: 'card preset-filled-surface-100-900 p-4 flex justify-center items-center',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text();

							$.template_effect(() => $.set_text(text_2, $.get(item).content));
							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_8);
			});

			var node_9 = $.sibling(node_7, 2);

			$.component(node_9, () => Steps.Content, ($$anchor, Steps_Content_1) => {
				Steps_Content_1($$anchor, {
					get index() {
						return steps.length;
					},
					class: 'card preset-filled-surface-100-900 p-4 flex justify-center items-center',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text('All done!');

						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});
			});

			var div = $.sibling(node_9, 2);
			var node_10 = $.child(div);

			$.component(node_10, () => Steps.PrevTrigger, ($$anchor, Steps_PrevTrigger) => {
				Steps_PrevTrigger($$anchor, {
					class: 'btn preset-filled',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text('Back');

						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});
			});

			var node_11 = $.sibling(node_10, 2);

			$.component(node_11, () => Steps.NextTrigger, ($$anchor, Steps_NextTrigger) => {
				Steps_NextTrigger($$anchor, {
					class: 'btn preset-filled',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text('Next');

						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}