import * as $ from 'svelte/internal/server';
import { Card } from '$lib/components';
import { Icon, Layout, Typography } from '@appwrite.io/pink-svelte';

export default function EmptySheetCards($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { icon, title, subtitle, onClick, href, disabled } = $$props;

		Card($$renderer, {
			href,
			disabled,
			external: true,
			radius: 'm',
			padding: 'xs',
			variant: 'primary',
			isButton: !href,
			children: ($$renderer) => {
				if (Layout.Stack) {
					$$renderer.push('<!--[-->');

					Layout.Stack($$renderer, {
						direction: 'row',
						gap: 'm',
						children: ($$renderer) => {
							if (icon) {
								$$renderer.push('<!--[0-->');
								Icon($$renderer, { icon, size: 'm', color: '--fgcolor-neutral-tertiary' });
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									direction: 'column',
									gap: 'none',
									children: ($$renderer) => {
										if (Typography.Text) {
											$$renderer.push('<!--[-->');

											Typography.Text($$renderer, {
												variant: 'm-500',
												color: '--fgcolor-neutral-primary',
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(title)}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (subtitle) {
											$$renderer.push('<!--[0-->');

											if (Typography.Text) {
												$$renderer.push('<!--[-->');

												Typography.Text($$renderer, {
													color: '--fgcolor-neutral-secondary',
													children: ($$renderer) => {
														$$renderer.push(`<!---->${$.escape(subtitle)}`);
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
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});
	});
}