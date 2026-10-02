import * as $ from 'svelte/internal/server';
import { InputId } from '$lib/elements/forms';
import { InputProjectId } from '$lib/elements/forms';
import Button from '$lib/elements/forms/button.svelte';
import { IconX } from '@appwrite.io/pink-icons-svelte';
import { Click, trackEvent } from '$lib/actions/analytics';
import { Card, Divider, Icon, Layout, Typography } from '@appwrite.io/pink-svelte';

export default function CustomId($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			show = false,
			name,
			id = null,
			autofocus = true,
			isProject = false,
			required = true,
			syncFrom = undefined,
			disabled = false
		} = $$props;

		let touchedId = false;

		function toIdFormat(str) {
			return str.toLowerCase().replace(/[^a-z0-9\-_. ]+/g, '').replace(/ /g, '_').replace(/^-+/, '').replace(/\.+$/, '').replace(/_{2,}/g, '_').slice(0, 36); // max length
		}

		function handleInput() {
			if (!touchedId) {
				touchedId = true;
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (show) {
				$$renderer.push('<!--[0-->');

				$.css_props(
					$$renderer,
					true,
					{ '--input-background-color': 'var(--bgcolor-neutral-primary)' },
					() => {
						if (Card.Base) {
							$$renderer.push('<!--[-->');

							Card.Base($$renderer, {
								variant: 'secondary',
								padding: 's',
								children: ($$renderer) => {
									if (Layout.Stack) {
										$$renderer.push('<!--[-->');

										Layout.Stack($$renderer, {
											gap: 'xl',
											children: ($$renderer) => {
												if (Layout.Stack) {
													$$renderer.push('<!--[-->');

													Layout.Stack($$renderer, {
														gap: 's',
														children: ($$renderer) => {
															if (Layout.Stack) {
																$$renderer.push('<!--[-->');

																Layout.Stack($$renderer, {
																	direction: 'row',
																	justifyContent: 'space-between',
																	alignContent: 'center',
																	children: ($$renderer) => {
																		if (Typography.Text) {
																			$$renderer.push('<!--[-->');

																			Typography.Text($$renderer, {
																				variant: 'm-600',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->${$.escape(name)} ID`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(` `);

																		Button($$renderer, {
																			extraCompact: true,
																			children: ($$renderer) => {
																				Icon($$renderer, { icon: IconX, size: 's' });
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push(`<!---->`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Typography.Text) {
																$$renderer.push('<!--[-->');

																Typography.Text($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Enter a custom ${$.escape(name)} ID. Leave blank for a randomly generated one.`);
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

												$$renderer.push(` <span style="margin-left: calc(-1* var(--space-7));margin-right: calc(-1* var(--space-7));width:auto;">`);
												Divider($$renderer, {});
												$$renderer.push(`<!----></span> `);

												if (isProject) {
													$$renderer.push('<!--[0-->');

													InputProjectId($$renderer, {
														disabled,
														autofocus,
														get value() {
															return id;
														},

														set value($$value) {
															id = $$value;
															$$settled = false;
														}
													});
												} else {
													$$renderer.push('<!--[-1-->');

													InputId($$renderer, {
														disabled,
														required,
														autofocus,
														get value() {
															return id;
														},

														set value($$value) {
															id = $$value;
															$$settled = false;
														}
													});
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
					true
				);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { show, id });
	});
}