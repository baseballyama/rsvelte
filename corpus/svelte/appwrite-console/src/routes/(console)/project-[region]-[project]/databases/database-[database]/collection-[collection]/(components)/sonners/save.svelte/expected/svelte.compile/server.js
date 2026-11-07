import * as $ from 'svelte/internal/server';
import { Button } from '$lib/elements/forms';
import CheckCircleDuotone from './icons/CheckCircleDuotone.svelte';
import { Badge, FloatingActionBar, Layout, Spinner, Typography } from '@appwrite.io/pink-svelte';
import { sleep } from '$lib/helpers/promises';
import { isSmallViewport } from '$lib/stores/viewport';
import { SAVE_UNDO_TOOLBAR_TIMEOUT } from '../editor/helpers/constants';

export default function Save($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { state = null, onUndo = null } = $$props;
		let previousState = state;

		if (state) {
			$$renderer.push(`<!--[0--><div${$.attr('data-state', state)} class="floating-action-bar svelte-vo050l">`);

			FloatingActionBar($$renderer, {
				$$slots: {
					start: ($$renderer) => {
						{
							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									inline: true,
									gap: 's',
									direction: 'row',
									alignItems: 'center',
									style: 'width: max-content;',
									children: ($$renderer) => {
										if (state === 'saving') {
											$$renderer.push('<!--[0-->');
											Spinner($$renderer, { size: 'm' });
											$$renderer.push(`<!----> `);

											if (Typography.Caption) {
												$$renderer.push('<!--[-->');

												Typography.Caption($$renderer, {
													variant: '500',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Saving changes...`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										} else {
											$$renderer.push('<!--[-1-->');
											CheckCircleDuotone($$renderer, {});
											$$renderer.push(`<!----> `);

											if (Typography.Caption) {
												$$renderer.push('<!--[-->');

												Typography.Caption($$renderer, {
													variant: '500',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Changes saved`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										}

										$$renderer.push(`<!--]-->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}
					},

					end: ($$renderer) => {
						{
							if (state === 'saved' && !$.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport)) {
								$$renderer.push('<!--[0-->');

								Button($$renderer, {
									secondary: true,
									size: 'xs',
									children: ($$renderer) => {
										if (Typography.Caption) {
											$$renderer.push('<!--[-->');

											Typography.Caption($$renderer, {
												variant: '500',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Undo`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);
										Badge($$renderer, { content: '⌘Z', variant: 'secondary', size: 'xs' });
										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						}
					}
				}
			});

			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}