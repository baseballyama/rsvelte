import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { isCloud } from '$lib/system';
import { version } from '$routes/(console)/store';
import { IconCloud, IconDiscord, IconGithub } from '@appwrite.io/pink-icons-svelte';
import { Layout, Typography, Link, Icon, Divider, Button, Badge } from '@appwrite.io/pink-svelte';
import { isSmallViewport } from '$lib/stores/viewport';
import { page } from '$app/state';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <span class="divider-wrapper svelte-kjga07"><!></span> <!>`, 1);
var root_2 = $.from_html(`<!> <span class="divider-wrapper svelte-kjga07"><!></span>`, 1);
var root_3 = $.from_html(`<span class="divider-wrapper svelte-kjga07"><!></span> <!>`, 1);
var root_4 = $.from_html(`<span class="divider-wrapper svelte-kjga07"><!></span> <!> <!>`, 1);
var root_5 = $.from_html(`<!> <!> <span class="divider-wrapper svelte-kjga07"><!></span> <!> <span class="divider-wrapper svelte-kjga07"><!></span> <!> <!> <!>`, 1);
var root_6 = $.from_html(`<footer><!> <!></footer>`);

export default function Footer($$anchor, $$props) {
	$.push($$props, true);

	const $isSmallViewport = () => $.store_get(isSmallViewport, '$isSmallViewport', $$stores);
	const $version = () => $.store_get(version, '$version', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
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

	var footer = root_6();
	let classes;
	var node = $.child(footer);

	Divider(node, {});

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => $isSmallViewport() ? 'column-reverse' : 'row');

		$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack) => {
			Layout_Stack($$anchor, {
				get direction() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment = root();
					var node_2 = $.first_child(fragment);

					{
						let $0 = $.derived(() => $isSmallViewport() ? 'm' : 'l');

						$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
							Layout_Stack_1($$anchor, {
								direction: 'row',
								alignItems: 'center',
								get gap() {
									return $.get($0);
								},
								justifyContent: 'flex-start',
								children: ($$anchor, $$slotProps) => {
									var fragment_1 = root_1();
									var node_3 = $.first_child(fragment_1);

									$.component(node_3, () => Typography.Caption, ($$anchor, Typography_Caption) => {
										Typography_Caption($$anchor, {
											variant: '400',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text();

												$.template_effect(() => $.set_text(text, `ⓒ ${currentYear ?? ''} Appwrite. All rights reserved.`));
												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									var span = $.sibling(node_3, 2);
									var node_4 = $.child(span);

									Divider(node_4, { vertical: true });
									$.reset(span);

									var node_5 = $.sibling(span, 2);

									$.component(node_5, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
										Layout_Stack_2($$anchor, {
											direction: 'row',
											gap: 'xxs',
											inline: true,
											children: ($$anchor, $$slotProps) => {
												var fragment_3 = root();
												var node_6 = $.first_child(fragment_3);

												$.component(node_6, () => Button.Anchor, ($$anchor, Button_Anchor) => {
													Button_Anchor($$anchor, {
														icon: true,
														size: 'xs',
														variant: 'ghost',
														href: 'https://github.com/appwrite/appwrite',
														target: '_blank',
														rel: 'noreferrer',
														'aria-label': 'Appwrite on Github',
														children: ($$anchor, $$slotProps) => {
															Icon($$anchor, {
																size: 's',
																get icon() {
																	return IconGithub;
																}
															});
														},
														$$slots: { default: true }
													});
												});

												var node_7 = $.sibling(node_6, 2);

												$.component(node_7, () => Button.Anchor, ($$anchor, Button_Anchor_1) => {
													Button_Anchor_1($$anchor, {
														icon: true,
														size: 'xs',
														variant: 'ghost',
														href: 'https://appwrite.io/discord',
														target: '_blank',
														rel: 'noreferrer',
														'aria-label': 'Appwrite on Discord',
														children: ($$anchor, $$slotProps) => {
															Icon($$anchor, {
																size: 's',
																get icon() {
																	return IconDiscord;
																}
															});
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_3);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_1);
								},
								$$slots: { default: true }
							});
						});
					}

					var node_8 = $.sibling(node_2, 2);

					{
						let $0 = $.derived(() => $isSmallViewport() ? 'flex-start' : 'flex-end');
						let $1 = $.derived(() => $isSmallViewport() ? 'wrap' : 'normal');

						$.component(node_8, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
							Layout_Stack_3($$anchor, {
								direction: 'row',
								get justifyContent() {
									return $.get($0);
								},
								alignItems: 'center',
								get wrap() {
									return $.get($1);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_6 = root_5();
									var node_9 = $.first_child(fragment_6);

									{
										var consequent_2 = ($$anchor) => {
											var fragment_7 = root();
											var node_10 = $.first_child(fragment_7);

											{
												var consequent = ($$anchor) => {
													var fragment_8 = root();
													var node_11 = $.first_child(fragment_8);

													Badge(node_11, {
														size: 'xs',
														type: 'success',
														variant: 'secondary',
														content: 'Generally Available',
														style: 'white-space: nowrap;'
													});

													var node_12 = $.sibling(node_11, 2);

													Icon(node_12, {
														size: 's',
														get icon() {
															return IconCloud;
														}
													});

													$.append($$anchor, fragment_8);
												};

												$.if(node_10, ($$render) => {
													if (isCloud) $$render(consequent);
												});
											}

											var node_13 = $.sibling(node_10, 2);

											{
												var consequent_1 = ($$anchor) => {
													var fragment_9 = root_2();
													var node_14 = $.first_child(fragment_9);

													$.component(node_14, () => Link.Anchor, ($$anchor, Link_Anchor) => {
														Link_Anchor($$anchor, {
															size: 's',
															variant: 'quiet',
															href: 'https://github.com/appwrite/appwrite/releases',
															'aria-label': 'Appwrite releases on Github',
															target: '_blank',
															rel: 'noreferrer',
															style: 'white-space: nowrap;',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_1 = $.text();

																$.template_effect(() => $.set_text(text_1, `Version ${$version() ?? ''}`));
																$.append($$anchor, text_1);
															},
															$$slots: { default: true }
														});
													});

													var span_1 = $.sibling(node_14, 2);
													var node_15 = $.child(span_1);

													Divider(node_15, { vertical: true });
													$.reset(span_1);
													$.append($$anchor, fragment_9);
												};

												$.if(node_13, ($$render) => {
													if ($version() && !isCloud) $$render(consequent_1);
												});
											}

											$.append($$anchor, fragment_7);
										};

										$.if(node_9, ($$render) => {
											if (!$isSmallViewport()) $$render(consequent_2);
										});
									}

									var node_16 = $.sibling(node_9, 2);

									$.component(node_16, () => Link.Anchor, ($$anchor, Link_Anchor_1) => {
										Link_Anchor_1($$anchor, {
											size: 's',
											variant: 'quiet',
											href: 'https://appwrite.io/docs',
											target: '_blank',
											rel: 'noreferrer',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('Docs');

												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});
									});

									var span_2 = $.sibling(node_16, 2);
									var node_17 = $.child(span_2);

									Divider(node_17, { vertical: true });
									$.reset(span_2);

									var node_18 = $.sibling(span_2, 2);

									$.component(node_18, () => Link.Anchor, ($$anchor, Link_Anchor_2) => {
										Link_Anchor_2($$anchor, {
											size: 's',
											variant: 'quiet',
											href: 'https://appwrite.io/terms',
											target: '_blank',
											rel: 'noreferrer',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text('Terms');

												$.append($$anchor, text_3);
											},
											$$slots: { default: true }
										});
									});

									var span_3 = $.sibling(node_18, 2);
									var node_19 = $.child(span_3);

									Divider(node_19, { vertical: true });
									$.reset(span_3);

									var node_20 = $.sibling(span_3, 2);

									$.component(node_20, () => Link.Anchor, ($$anchor, Link_Anchor_3) => {
										Link_Anchor_3($$anchor, {
											size: 's',
											variant: 'quiet',
											href: 'https://appwrite.io/privacy',
											target: '_blank',
											rel: 'noreferrer',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_4 = $.text('Privacy');

												$.append($$anchor, text_4);
											},
											$$slots: { default: true }
										});
									});

									var node_21 = $.sibling(node_20, 2);

									{
										var consequent_3 = ($$anchor) => {
											var fragment_11 = root_3();
											var span_4 = $.first_child(fragment_11);
											var node_22 = $.child(span_4);

											Divider(node_22, { vertical: true });
											$.reset(span_4);

											var node_23 = $.sibling(span_4, 2);

											$.component(node_23, () => Link.Anchor, ($$anchor, Link_Anchor_4) => {
												Link_Anchor_4($$anchor, {
													size: 's',
													variant: 'quiet',
													href: 'https://appwrite.io/cookies',
													target: '_blank',
													rel: 'noreferrer',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_5 = $.text('Cookies');

														$.append($$anchor, text_5);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_11);
										};

										$.if(node_21, ($$render) => {
											if (isCloud) $$render(consequent_3);
										});
									}

									var node_24 = $.sibling(node_21, 2);

									{
										var consequent_6 = ($$anchor) => {
											var fragment_12 = root();
											var node_25 = $.first_child(fragment_12);

											{
												var consequent_4 = ($$anchor) => {
													var fragment_13 = root_3();
													var span_5 = $.first_child(fragment_13);
													var node_26 = $.child(span_5);

													Divider(node_26, { vertical: true });
													$.reset(span_5);

													var node_27 = $.sibling(span_5, 2);

													$.component(node_27, () => Link.Anchor, ($$anchor, Link_Anchor_5) => {
														Link_Anchor_5($$anchor, {
															size: 's',
															variant: 'quiet',
															href: 'https://github.com/appwrite/appwrite/releases',
															'aria-label': 'Appwrite releases on Github',
															target: '_blank',
															rel: 'noreferrer',
															style: 'white-space: nowrap;',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_6 = $.text();

																$.template_effect(() => $.set_text(text_6, `Version ${$version() ?? ''}`));
																$.append($$anchor, text_6);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_13);
												};

												$.if(node_25, ($$render) => {
													if ($version() && !isCloud) $$render(consequent_4);
												});
											}

											var node_28 = $.sibling(node_25, 2);

											{
												var consequent_5 = ($$anchor) => {
													var fragment_15 = root_4();
													var span_6 = $.first_child(fragment_15);
													var node_29 = $.child(span_6);

													Divider(node_29, { vertical: true });
													$.reset(span_6);

													var node_30 = $.sibling(span_6, 2);

													Icon(node_30, {
														size: 's',
														get icon() {
															return IconCloud;
														}
													});

													var node_31 = $.sibling(node_30, 2);

													Badge(node_31, {
														size: 'xs',
														type: 'success',
														variant: 'secondary',
														content: 'Generally Available',
														style: 'white-space: nowrap;'
													});

													$.append($$anchor, fragment_15);
												};

												$.if(node_28, ($$render) => {
													if (isCloud) $$render(consequent_5);
												});
											}

											$.append($$anchor, fragment_12);
										};

										$.if(node_24, ($$render) => {
											if ($isSmallViewport()) $$render(consequent_6);
										});
									}

									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							});
						});
					}

					$.append($$anchor, fragment);
				},
				$$slots: { default: true }
			});
		});
	}

	$.reset(footer);
	$.template_effect(() => classes = $.set_class(footer, 1, 'svelte-kjga07', null, classes, { hide: $.get(hideFooter) }));
	$.append($$anchor, footer);
	$.pop();
	$$cleanup();
}