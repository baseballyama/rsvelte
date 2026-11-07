import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib/elements/forms';
import CheckCircleDuotone from './icons/CheckCircleDuotone.svelte';
import { Badge, FloatingActionBar, Layout, Spinner, Typography } from '@appwrite.io/pink-svelte';
import { sleep } from '$lib/helpers/promises';
import { isSmallViewport } from '$lib/stores/viewport';
import { SAVE_UNDO_TOOLBAR_TIMEOUT } from '../editor/helpers/constants';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="floating-action-bar svelte-vo050l"><!></div>`);

export default function Save($$anchor, $$props) {
	$.push($$props, true);

	const $isSmallViewport = () => $.store_get(isSmallViewport, '$isSmallViewport', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let state = $.prop($$props, 'state', 7, null),
		onUndo = $.prop($$props, 'onUndo', 3, null);

	let previousState = state();

	$.user_effect(() => {
		if (state() === 'saved' && previousState !== 'saved') {
			sleep(SAVE_UNDO_TOOLBAR_TIMEOUT).then(() => {
				previousState = state();
				state(null);
			});
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_2 = ($$anchor) => {
			var div = root_1();
			var node_1 = $.child(div);

			FloatingActionBar(node_1, {
				$$slots: {
					start: ($$anchor, $$slotProps) => {
						var fragment_1 = $.comment();
						var node_2 = $.first_child(fragment_1);

						$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack) => {
							Layout_Stack($$anchor, {
								inline: true,
								gap: 's',
								direction: 'row',
								alignItems: 'center',
								style: 'width: max-content;',
								children: ($$anchor, $$slotProps) => {
									var fragment_2 = $.comment();
									var node_3 = $.first_child(fragment_2);

									{
										var consequent = ($$anchor) => {
											var fragment_3 = root();
											var node_4 = $.first_child(fragment_3);

											Spinner(node_4, { size: 'm' });

											var node_5 = $.sibling(node_4, 2);

											$.component(node_5, () => Typography.Caption, ($$anchor, Typography_Caption) => {
												Typography_Caption($$anchor, {
													variant: '500',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text = $.text('Saving changes...');

														$.append($$anchor, text);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_3);
										};

										var alternate = ($$anchor) => {
											var fragment_4 = root();
											var node_6 = $.first_child(fragment_4);

											CheckCircleDuotone(node_6, {});

											var node_7 = $.sibling(node_6, 2);

											$.component(node_7, () => Typography.Caption, ($$anchor, Typography_Caption_1) => {
												Typography_Caption_1($$anchor, {
													variant: '500',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_1 = $.text('Changes saved');

														$.append($$anchor, text_1);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_4);
										};

										$.if(node_3, ($$render) => {
											if (state() === 'saving') $$render(consequent); else $$render(alternate, -1);
										});
									}

									$.append($$anchor, fragment_2);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_1);
					},

					end: ($$anchor, $$slotProps) => {
						var fragment_5 = $.comment();
						var node_8 = $.first_child(fragment_5);

						{
							var consequent_1 = ($$anchor) => {
								Button($$anchor, {
									secondary: true,
									size: 'xs',
									$$events: { click: async () => onUndo()?.() },
									children: ($$anchor, $$slotProps) => {
										var fragment_7 = root();
										var node_9 = $.first_child(fragment_7);

										$.component(node_9, () => Typography.Caption, ($$anchor, Typography_Caption_2) => {
											Typography_Caption_2($$anchor, {
												variant: '500',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('Undo');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										});

										var node_10 = $.sibling(node_9, 2);

										Badge(node_10, { content: '⌘Z', variant: 'secondary', size: 'xs' });
										$.append($$anchor, fragment_7);
									},
									$$slots: { default: true }
								});
							};

							$.if(node_8, ($$render) => {
								if (state() === 'saved' && !$isSmallViewport()) $$render(consequent_1);
							});
						}

						$.append($$anchor, fragment_5);
					}
				}
			});

			$.reset(div);
			$.template_effect(() => $.set_attribute(div, 'data-state', state()));
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (state()) $$render(consequent_2);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}