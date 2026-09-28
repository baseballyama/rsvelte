import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card } from '$lib/components';
import { Icon, Layout, Typography } from '@appwrite.io/pink-svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function EmptySheetCards($$anchor, $$props) {
	$.push($$props, true);

	{
		let $0 = $.derived(() => !$$props.href);

		Card($$anchor, {
			get href() {
				return $$props.href;
			},

			get disabled() {
				return $$props.disabled;
			},
			external: true,
			radius: 'm',
			padding: 'xs',
			variant: 'primary',
			get isButton() {
				return $.get($0);
			},
			$$events: { click: () => $$props.onClick?.() },
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
					Layout_Stack($$anchor, {
						direction: 'row',
						gap: 'm',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_1 = $.first_child(fragment_2);

							{
								var consequent = ($$anchor) => {
									Icon($$anchor, {
										get icon() {
											return $$props.icon;
										},
										size: 'm',
										color: '--fgcolor-neutral-tertiary'
									});
								};

								$.if(node_1, ($$render) => {
									if ($$props.icon) $$render(consequent);
								});
							}

							var node_2 = $.sibling(node_1, 2);

							$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
								Layout_Stack_1($$anchor, {
									direction: 'column',
									gap: 'none',
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root();
										var node_3 = $.first_child(fragment_4);

										$.component(node_3, () => Typography.Text, ($$anchor, Typography_Text) => {
											Typography_Text($$anchor, {
												variant: 'm-500',
												color: '--fgcolor-neutral-primary',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text();

													$.template_effect(() => $.set_text(text, $$props.title));
													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										});

										var node_4 = $.sibling(node_3, 2);

										{
											var consequent_1 = ($$anchor) => {
												var fragment_6 = $.comment();
												var node_5 = $.first_child(fragment_6);

												$.component(node_5, () => Typography.Text, ($$anchor, Typography_Text_1) => {
													Typography_Text_1($$anchor, {
														color: '--fgcolor-neutral-secondary',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text();

															$.template_effect(() => $.set_text(text_1, $$props.subtitle));
															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_6);
											};

											$.if(node_4, ($$render) => {
												if ($$props.subtitle) $$render(consequent_1);
											});
										}

										$.append($$anchor, fragment_4);
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
	}

	$.pop();
}