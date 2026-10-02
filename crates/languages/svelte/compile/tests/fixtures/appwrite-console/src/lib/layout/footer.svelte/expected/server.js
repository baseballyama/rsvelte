import * as $ from 'svelte/internal/server';
import { isCloud } from '$lib/system';
import { version } from '$routes/(console)/store';
import { IconCloud, IconDiscord, IconGithub } from '@appwrite.io/pink-icons-svelte';
import { Layout, Typography, Link, Icon, Divider, Button, Badge } from '@appwrite.io/pink-svelte';
import { isSmallViewport } from '$lib/stores/viewport';
import { page } from '$app/state';

export default function Footer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const currentYear = new Date().getFullYear();

		const hideFooter = $.derived(() => {
			const endings = [
				'collection-[collection]',
				'collection-[collection]/indexes',
				'table-[table]',
				'table-[table]/columns',
				'table-[table]/indexes'
			];

			return endings.some((end) => page.route.id?.endsWith(end));
		});

		$$renderer.push(`<footer${$.attr_class('svelte-kjga07', void 0, { 'hide': hideFooter() })}>`);
		Divider($$renderer, {});
		$$renderer.push(`<!----> `);

		if (Layout.Stack) {
			$$renderer.push('<!--[-->');

			Layout.Stack($$renderer, {
				direction: $.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport) ? 'column-reverse' : 'row',
				children: ($$renderer) => {
					if (Layout.Stack) {
						$$renderer.push('<!--[-->');

						Layout.Stack($$renderer, {
							direction: 'row',
							alignItems: 'center',
							gap: $.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport) ? 'm' : 'l',
							justifyContent: 'flex-start',
							children: ($$renderer) => {
								if (Typography.Caption) {
									$$renderer.push('<!--[-->');

									Typography.Caption($$renderer, {
										variant: '400',
										children: ($$renderer) => {
											$$renderer.push(`<!---->ⓒ ${$.escape(currentYear)} Appwrite. All rights reserved.`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` <span class="divider-wrapper svelte-kjga07">`);
								Divider($$renderer, { vertical: true });
								$$renderer.push(`<!----></span> `);

								if (Layout.Stack) {
									$$renderer.push('<!--[-->');

									Layout.Stack($$renderer, {
										direction: 'row',
										gap: 'xxs',
										inline: true,
										children: ($$renderer) => {
											if (Button.Anchor) {
												$$renderer.push('<!--[-->');

												Button.Anchor($$renderer, {
													icon: true,
													size: 'xs',
													variant: 'ghost',
													href: 'https://github.com/appwrite/appwrite',
													target: '_blank',
													rel: 'noreferrer',
													'aria-label': 'Appwrite on Github',
													children: ($$renderer) => {
														Icon($$renderer, { size: 's', icon: IconGithub });
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Button.Anchor) {
												$$renderer.push('<!--[-->');

												Button.Anchor($$renderer, {
													icon: true,
													size: 'xs',
													variant: 'ghost',
													href: 'https://appwrite.io/discord',
													target: '_blank',
													rel: 'noreferrer',
													'aria-label': 'Appwrite on Discord',
													children: ($$renderer) => {
														Icon($$renderer, { size: 's', icon: IconDiscord });
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

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Layout.Stack) {
						$$renderer.push('<!--[-->');

						Layout.Stack($$renderer, {
							direction: 'row',
							justifyContent: $.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport) ? 'flex-start' : 'flex-end',
							alignItems: 'center',
							wrap: $.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport) ? 'wrap' : 'normal',
							children: ($$renderer) => {
								if (!$.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport)) {
									$$renderer.push('<!--[0-->');

									if (isCloud) {
										$$renderer.push('<!--[0-->');

										Badge($$renderer, {
											size: 'xs',
											type: 'success',
											variant: 'secondary',
											content: 'Generally Available',
											style: 'white-space: nowrap;'
										});

										$$renderer.push(`<!----> `);
										Icon($$renderer, { size: 's', icon: IconCloud });
										$$renderer.push(`<!---->`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--> `);

									if ($.store_get($$store_subs ??= {}, '$version', version) && !isCloud) {
										$$renderer.push('<!--[0-->');

										if (Link.Anchor) {
											$$renderer.push('<!--[-->');

											Link.Anchor($$renderer, {
												size: 's',
												variant: 'quiet',
												href: 'https://github.com/appwrite/appwrite/releases',
												'aria-label': 'Appwrite releases on Github',
												target: '_blank',
												rel: 'noreferrer',
												style: 'white-space: nowrap;',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Version ${$.escape($.store_get($$store_subs ??= {}, '$version', version))}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` <span class="divider-wrapper svelte-kjga07">`);
										Divider($$renderer, { vertical: true });
										$$renderer.push(`<!----></span>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]-->`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--> `);

								if (Link.Anchor) {
									$$renderer.push('<!--[-->');

									Link.Anchor($$renderer, {
										size: 's',
										variant: 'quiet',
										href: 'https://appwrite.io/docs',
										target: '_blank',
										rel: 'noreferrer',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Docs`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` <span class="divider-wrapper svelte-kjga07">`);
								Divider($$renderer, { vertical: true });
								$$renderer.push(`<!----></span> `);

								if (Link.Anchor) {
									$$renderer.push('<!--[-->');

									Link.Anchor($$renderer, {
										size: 's',
										variant: 'quiet',
										href: 'https://appwrite.io/terms',
										target: '_blank',
										rel: 'noreferrer',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Terms`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` <span class="divider-wrapper svelte-kjga07">`);
								Divider($$renderer, { vertical: true });
								$$renderer.push(`<!----></span> `);

								if (Link.Anchor) {
									$$renderer.push('<!--[-->');

									Link.Anchor($$renderer, {
										size: 's',
										variant: 'quiet',
										href: 'https://appwrite.io/privacy',
										target: '_blank',
										rel: 'noreferrer',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Privacy`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (isCloud) {
									$$renderer.push(`<!--[0--><span class="divider-wrapper svelte-kjga07">`);
									Divider($$renderer, { vertical: true });
									$$renderer.push(`<!----></span> `);

									if (Link.Anchor) {
										$$renderer.push('<!--[-->');

										Link.Anchor($$renderer, {
											size: 's',
											variant: 'quiet',
											href: 'https://appwrite.io/cookies',
											target: '_blank',
											rel: 'noreferrer',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Cookies`);
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

								$$renderer.push(`<!--]--> `);

								if ($.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport)) {
									$$renderer.push('<!--[0-->');

									if ($.store_get($$store_subs ??= {}, '$version', version) && !isCloud) {
										$$renderer.push(`<!--[0--><span class="divider-wrapper svelte-kjga07">`);
										Divider($$renderer, { vertical: true });
										$$renderer.push(`<!----></span> `);

										if (Link.Anchor) {
											$$renderer.push('<!--[-->');

											Link.Anchor($$renderer, {
												size: 's',
												variant: 'quiet',
												href: 'https://github.com/appwrite/appwrite/releases',
												'aria-label': 'Appwrite releases on Github',
												target: '_blank',
												rel: 'noreferrer',
												style: 'white-space: nowrap;',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Version ${$.escape($.store_get($$store_subs ??= {}, '$version', version))}`);
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

									$$renderer.push(`<!--]--> `);

									if (isCloud) {
										$$renderer.push(`<!--[0--><span class="divider-wrapper svelte-kjga07">`);
										Divider($$renderer, { vertical: true });
										$$renderer.push(`<!----></span> `);
										Icon($$renderer, { size: 's', icon: IconCloud });
										$$renderer.push(`<!----> `);

										Badge($$renderer, {
											size: 'xs',
											type: 'success',
											variant: 'secondary',
											content: 'Generally Available',
											style: 'white-space: nowrap;'
										});

										$$renderer.push(`<!---->`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]-->`);
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

		$$renderer.push(`</footer>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}