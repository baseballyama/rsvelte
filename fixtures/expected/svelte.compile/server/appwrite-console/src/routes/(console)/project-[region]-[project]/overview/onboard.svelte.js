import * as $ from 'svelte/internal/server';

import {
	Step,
	Link,
	Icon,
	Layout,
	Card,
	Typography,
	Badge,
	ProgressCircle,
	Button
} from '@appwrite.io/pink-svelte';

import { addPlatform, continuePlatform } from './platforms/+page.svelte';
import { app } from '$lib/stores/app';
import AuthPreview from './assets/auth-preview.svg';
import AuthPreviewDark from './assets/auth-preview-dark.svg';
import { IconArrowRight } from '@appwrite.io/pink-icons-svelte';
import DatabaseImgSource from './assets/database.png';
import DatabaseImgSourceDark from './assets/database-dark.png';
import DiscordImgSource from './assets/discord.png';
import DiscordImgSourceDark from './assets/discord-dark.png';
import { mcpTools } from '../store';
import PlatformIosImgSource from './assets/platform-ios.svg';
import PlatformIosImgSourceDark from './assets/platform-ios-dark.svg';
import PlatformAndroidImgSource from './assets/platform-android.svg';
import PlatformAndroidImgSourceDark from './assets/platform-android-dark.svg';
import PlatformFlutterImgSource from './assets/platform-flutter.svg';
import PlatformFlutterImgSourceDark from './assets/platform-flutter-dark.svg';
import PlatformSdkImgSource from './assets/platform-sdk.jpg';
import PlatformSdkImgSourceDark from './assets/platform-sdk-dark.png';
import { resolve } from '$app/paths';
import { isSmallViewport } from '$lib/stores/viewport';
import { getPlatformInfo, getPlatformIdentifier } from '$lib/helpers/platform';
import { Click, trackEvent } from '$lib/actions/analytics';
import { goto } from '$app/navigation';
import { page } from '$app/state';
import { Platform } from './platforms/+page.svelte';

export default function Onboard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { pingCount = 0, platforms = [] } = $$props;

		const platformMap = $.derived(() => {
			const map = new Map();

			platforms.forEach((platform) => {
				const platformInfo = getPlatformInfo(platform.type);

				map.set(platformInfo.name, platform);
			});

			return map;
		});

		const projectRoute = $.derived(() => {
			return resolve('/(console)/project-[region]-[project]', { region: page.params.region, project: page.params.project });
		});

		function createKey() {
			trackEvent(Click.KeyCreateClick, { source: 'onboarding' });
			goto(`${projectRoute()}/overview/api-keys/create`, { replaceState: true });
		}

		function openPlatformWizard(type, platform) {
			if (platform) {
				continuePlatform(type, platform.name, getPlatformIdentifier(platform), platform.type);
			} else {
				trackEvent(Click.PlatformCreateClick, { source: 'onboarding' });
				addPlatform(type);
			}
		}

		$$renderer.push(`<div class="svelte-1cwqimf"${$.attr_style('', { 'container-type': 'inline-size' })}><div class="console-container svelte-1cwqimf"><div class="dashboard-content svelte-1cwqimf">`);

		if (platforms.length === 0 || pingCount === 0) {
			$$renderer.push('<!--[0-->');

			if (Step.List) {
				$$renderer.push('<!--[-->');

				Step.List($$renderer, {
					children: ($$renderer) => {
						if (Step.Item) {
							$$renderer.push('<!--[-->');

							Step.Item($$renderer, {
								state: 'previous',
								children: ($$renderer) => {
									$$renderer.push(`<div>`);

									if (Typography.Title) {
										$$renderer.push('<!--[-->');

										Typography.Title($$renderer, {
											color: '--fgcolor-neutral-tertiary',
											size: 's',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Create project`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(`</div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Step.Item) {
							$$renderer.push('<!--[-->');

							Step.Item($$renderer, {
								state: 'current',
								children: ($$renderer) => {
									if (Layout.Stack) {
										$$renderer.push('<!--[-->');

										Layout.Stack($$renderer, {
											direction: $.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport) ? 'column' : 'row',
											gap: $.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport) ? 'xl' : 'xxl',
											children: ($$renderer) => {
												$$renderer.push(`<div class="step-info svelte-1cwqimf">`);

												if (Layout.Stack) {
													$$renderer.push('<!--[-->');

													Layout.Stack($$renderer, {
														gap: 'm',
														children: ($$renderer) => {
															if (Typography.Title) {
																$$renderer.push('<!--[-->');

																Typography.Title($$renderer, {
																	color: '--fgcolor-neutral-primary',
																	size: 's',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Connect your platform`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` <div class="build-info"><span>Start building with your preferred web, mobile, and
                                            native frameworks.</span></div>`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(`</div> `);

												if (Layout.Stack) {
													$$renderer.push('<!--[-->');

													Layout.Stack($$renderer, {
														gap: 'l',
														children: ($$renderer) => {
															if (Layout.Stack) {
																$$renderer.push('<!--[-->');

																Layout.Stack($$renderer, {
																	gap: 'l',
																	direction: $.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport) ? 'column' : 'row',
																	children: ($$renderer) => {
																		if (Card.Button) {
																			$$renderer.push('<!--[-->');

																			Card.Button($$renderer, {
																				padding: 's',
																				children: ($$renderer) => {
																					if (Layout.Stack) {
																						$$renderer.push('<!--[-->');

																						Layout.Stack($$renderer, {
																							gap: platformMap().has('Web') ? 'm' : 'xl',
																							height: '100%',
																							justifyContent: 'space-between',
																							children: ($$renderer) => {
																								$$renderer.push(`<div class="card-top-image web-image-light svelte-1cwqimf"></div> <div class="card-top-image web-image-dark svelte-1cwqimf"></div> `);

																								if (platformMap().has('Web')) {
																									$$renderer.push('<!--[0-->');

																									if (Layout.Stack) {
																										$$renderer.push('<!--[-->');

																										Layout.Stack($$renderer, {
																											alignItems: 'flex-start',
																											children: ($$renderer) => {
																												Badge($$renderer, {
																													size: 's',
																													variant: 'secondary',
																													content: 'In progress',
																													$$slots: {
																														start: ($$renderer) => {
																															$$renderer.push(`<div slot="start"${$.attr_style('', { margin: '-4px 0 0 2px' })}>`);

																															ProgressCircle($$renderer, {
																																size: 'xs',
																																showAnimation: false,
																																backgroundStrokeColor: '--progress-background-color',
																																progress: 33
																															});

																															$$renderer.push(`<!----></div>`);
																														}
																													}
																												});
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

																								if (Layout.Stack) {
																									$$renderer.push('<!--[-->');

																									Layout.Stack($$renderer, {
																										direction: 'row',
																										alignItems: 'center',
																										justifyContent: 'space-between',
																										children: ($$renderer) => {
																											if (Typography.Title) {
																												$$renderer.push('<!--[-->');

																												Typography.Title($$renderer, {
																													size: 's',
																													children: ($$renderer) => {
																														$$renderer.push(`<!---->Web`);
																													},
																													$$slots: { default: true }
																												});

																												$$renderer.push('<!--]-->');
																											} else {
																												$$renderer.push('<!--[!-->');
																												$$renderer.push('<!--]-->');
																											}

																											$$renderer.push(` `);

																											if (platformMap().has('Web')) {
																												$$renderer.push('<!--[0-->');

																												if (Button.Button) {
																													$$renderer.push('<!--[-->');

																													Button.Button($$renderer, {
																														size: 'xs',
																														children: ($$renderer) => {
																															$$renderer.push(`<!---->Continue`);
																														},
																														$$slots: { default: true }
																													});

																													$$renderer.push('<!--]-->');
																												} else {
																													$$renderer.push('<!--[!-->');
																													$$renderer.push('<!--]-->');
																												}
																											} else {
																												$$renderer.push(`<!--[-1--><div class="arrow-icon svelte-1cwqimf">`);
																												Icon($$renderer, { icon: IconArrowRight, size: 's' });
																												$$renderer.push(`<!----></div>`);
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

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(` `);

																		if (Card.Button) {
																			$$renderer.push('<!--[-->');

																			Card.Button($$renderer, {
																				padding: 's',
																				children: ($$renderer) => {
																					if (Layout.Stack) {
																						$$renderer.push('<!--[-->');

																						Layout.Stack($$renderer, {
																							gap: platformMap().has('React Native') ? 'm' : 'xl',
																							height: '100%',
																							justifyContent: 'space-between',
																							children: ($$renderer) => {
																								$$renderer.push(`<div class="card-top-image reactnative-image-light svelte-1cwqimf"></div> <div class="card-top-image reactnative-image-dark svelte-1cwqimf"></div> `);

																								if (platformMap().has('React Native')) {
																									$$renderer.push('<!--[0-->');

																									if (Layout.Stack) {
																										$$renderer.push('<!--[-->');

																										Layout.Stack($$renderer, {
																											alignItems: 'flex-start',
																											children: ($$renderer) => {
																												Badge($$renderer, {
																													size: 's',
																													variant: 'secondary',
																													content: 'In progress',
																													$$slots: {
																														start: ($$renderer) => {
																															$$renderer.push(`<div slot="start"${$.attr_style('', { margin: '-4px 0 0 2px' })}>`);

																															ProgressCircle($$renderer, {
																																size: 'xs',
																																showAnimation: false,
																																backgroundStrokeColor: '--progress-background-color',
																																progress: 33
																															});

																															$$renderer.push(`<!----></div>`);
																														}
																													}
																												});
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

																								if (Layout.Stack) {
																									$$renderer.push('<!--[-->');

																									Layout.Stack($$renderer, {
																										direction: 'row',
																										alignItems: 'center',
																										justifyContent: 'space-between',
																										children: ($$renderer) => {
																											if (Typography.Title) {
																												$$renderer.push('<!--[-->');

																												Typography.Title($$renderer, {
																													size: 's',
																													children: ($$renderer) => {
																														$$renderer.push(`<!---->React Native`);
																													},
																													$$slots: { default: true }
																												});

																												$$renderer.push('<!--]-->');
																											} else {
																												$$renderer.push('<!--[!-->');
																												$$renderer.push('<!--]-->');
																											}

																											$$renderer.push(` `);

																											if (platformMap().has('React Native')) {
																												$$renderer.push('<!--[0-->');

																												if (Button.Button) {
																													$$renderer.push('<!--[-->');

																													Button.Button($$renderer, {
																														size: 'xs',
																														children: ($$renderer) => {
																															$$renderer.push(`<!---->Continue`);
																														},
																														$$slots: { default: true }
																													});

																													$$renderer.push('<!--]-->');
																												} else {
																													$$renderer.push('<!--[!-->');
																													$$renderer.push('<!--]-->');
																												}
																											} else {
																												$$renderer.push(`<!--[-1--><div class="arrow-icon svelte-1cwqimf">`);
																												Icon($$renderer, { icon: IconArrowRight, size: 's' });
																												$$renderer.push(`<!----></div>`);
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
																	gap: 'l',
																	direction: $.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport) ? 'column' : 'row',
																	children: ($$renderer) => {
																		if (Card.Button) {
																			$$renderer.push('<!--[-->');

																			Card.Button($$renderer, {
																				padding: 's',
																				children: ($$renderer) => {
																					if (Layout.Stack) {
																						$$renderer.push('<!--[-->');

																						Layout.Stack($$renderer, {
																							gap: platformMap().has('Apple') ? 's' : 'xxl',
																							height: '100%',
																							justifyContent: 'space-between',
																							children: ($$renderer) => {
																								$$renderer.push(`<img class="platform-image svelte-1cwqimf"${$.attr('src', $.store_get($$store_subs ??= {}, '$app', app).themeInUse === 'dark' ? PlatformIosImgSourceDark : PlatformIosImgSource)} alt=""/> `);

																								if (platformMap().has('Apple')) {
																									$$renderer.push('<!--[0-->');

																									if (Layout.Stack) {
																										$$renderer.push('<!--[-->');

																										Layout.Stack($$renderer, {
																											alignItems: 'flex-start',
																											children: ($$renderer) => {
																												Badge($$renderer, {
																													size: 's',
																													variant: 'secondary',
																													content: 'In progress',
																													$$slots: {
																														start: ($$renderer) => {
																															$$renderer.push(`<div slot="start"${$.attr_style('', { margin: '-4px 0 0 2px' })}>`);

																															ProgressCircle($$renderer, {
																																size: 'xs',
																																showAnimation: false,
																																backgroundStrokeColor: '--progress-background-color',
																																progress: 33
																															});

																															$$renderer.push(`<!----></div>`);
																														}
																													}
																												});
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

																								if (Layout.Stack) {
																									$$renderer.push('<!--[-->');

																									Layout.Stack($$renderer, {
																										direction: 'row',
																										alignItems: 'center',
																										justifyContent: 'space-between',
																										children: ($$renderer) => {
																											if (Typography.Title) {
																												$$renderer.push('<!--[-->');

																												Typography.Title($$renderer, {
																													size: 's',
																													children: ($$renderer) => {
																														$$renderer.push(`<!---->Apple`);
																													},
																													$$slots: { default: true }
																												});

																												$$renderer.push('<!--]-->');
																											} else {
																												$$renderer.push('<!--[!-->');
																												$$renderer.push('<!--]-->');
																											}

																											$$renderer.push(` `);

																											if (platformMap().has('Apple')) {
																												$$renderer.push('<!--[0-->');

																												if (Button.Button) {
																													$$renderer.push('<!--[-->');

																													Button.Button($$renderer, {
																														size: 'xs',
																														children: ($$renderer) => {
																															$$renderer.push(`<!---->Continue`);
																														},
																														$$slots: { default: true }
																													});

																													$$renderer.push('<!--]-->');
																												} else {
																													$$renderer.push('<!--[!-->');
																													$$renderer.push('<!--]-->');
																												}
																											} else {
																												$$renderer.push(`<!--[-1--><div class="arrow-icon svelte-1cwqimf">`);
																												Icon($$renderer, { icon: IconArrowRight, size: 's' });
																												$$renderer.push(`<!----></div>`);
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

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(` `);

																		if (Card.Button) {
																			$$renderer.push('<!--[-->');

																			Card.Button($$renderer, {
																				padding: 's',
																				children: ($$renderer) => {
																					if (Layout.Stack) {
																						$$renderer.push('<!--[-->');

																						Layout.Stack($$renderer, {
																							gap: platformMap().has('Android') ? 's' : 'xxl',
																							height: '100%',
																							justifyContent: 'space-between',
																							children: ($$renderer) => {
																								$$renderer.push(`<img class="platform-image svelte-1cwqimf"${$.attr('src', $.store_get($$store_subs ??= {}, '$app', app).themeInUse === 'dark'
																									? PlatformAndroidImgSourceDark
																									: PlatformAndroidImgSource)} alt=""/> `);

																								if (platformMap().has('Android')) {
																									$$renderer.push('<!--[0-->');

																									if (Layout.Stack) {
																										$$renderer.push('<!--[-->');

																										Layout.Stack($$renderer, {
																											alignItems: 'flex-start',
																											children: ($$renderer) => {
																												Badge($$renderer, {
																													size: 's',
																													variant: 'secondary',
																													content: 'In progress',
																													$$slots: {
																														start: ($$renderer) => {
																															$$renderer.push(`<div slot="start"${$.attr_style('', { margin: '-4px 0 0 2px' })}>`);

																															ProgressCircle($$renderer, {
																																size: 'xs',
																																showAnimation: false,
																																backgroundStrokeColor: '--progress-background-color',
																																progress: 33
																															});

																															$$renderer.push(`<!----></div>`);
																														}
																													}
																												});
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

																								if (Layout.Stack) {
																									$$renderer.push('<!--[-->');

																									Layout.Stack($$renderer, {
																										direction: 'row',
																										alignItems: 'center',
																										justifyContent: 'space-between',
																										children: ($$renderer) => {
																											if (Typography.Title) {
																												$$renderer.push('<!--[-->');

																												Typography.Title($$renderer, {
																													size: 's',
																													children: ($$renderer) => {
																														$$renderer.push(`<!---->Android`);
																													},
																													$$slots: { default: true }
																												});

																												$$renderer.push('<!--]-->');
																											} else {
																												$$renderer.push('<!--[!-->');
																												$$renderer.push('<!--]-->');
																											}

																											$$renderer.push(` `);

																											if (platformMap().has('Android')) {
																												$$renderer.push('<!--[0-->');

																												if (Button.Button) {
																													$$renderer.push('<!--[-->');

																													Button.Button($$renderer, {
																														size: 'xs',
																														children: ($$renderer) => {
																															$$renderer.push(`<!---->Continue`);
																														},
																														$$slots: { default: true }
																													});

																													$$renderer.push('<!--]-->');
																												} else {
																													$$renderer.push('<!--[!-->');
																													$$renderer.push('<!--]-->');
																												}
																											} else {
																												$$renderer.push(`<!--[-1--><div class="arrow-icon svelte-1cwqimf">`);
																												Icon($$renderer, { icon: IconArrowRight, size: 's' });
																												$$renderer.push(`<!----></div>`);
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

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(` `);

																		if (Card.Button) {
																			$$renderer.push('<!--[-->');

																			Card.Button($$renderer, {
																				padding: 's',
																				children: ($$renderer) => {
																					if (Layout.Stack) {
																						$$renderer.push('<!--[-->');

																						Layout.Stack($$renderer, {
																							gap: platformMap().has('Flutter') ? 's' : 'xxl',
																							height: '100%',
																							justifyContent: 'space-between',
																							children: ($$renderer) => {
																								$$renderer.push(`<img class="platform-image svelte-1cwqimf"${$.attr('src', $.store_get($$store_subs ??= {}, '$app', app).themeInUse === 'dark'
																									? PlatformFlutterImgSourceDark
																									: PlatformFlutterImgSource)} alt=""/> `);

																								if (platformMap().has('Flutter')) {
																									$$renderer.push('<!--[0-->');

																									if (Layout.Stack) {
																										$$renderer.push('<!--[-->');

																										Layout.Stack($$renderer, {
																											alignItems: 'flex-start',
																											children: ($$renderer) => {
																												Badge($$renderer, {
																													size: 's',
																													variant: 'secondary',
																													content: 'In progress',
																													$$slots: {
																														start: ($$renderer) => {
																															$$renderer.push(`<div slot="start"${$.attr_style('', { margin: '-4px 0 0 2px' })}>`);

																															ProgressCircle($$renderer, {
																																size: 'xs',
																																showAnimation: false,
																																backgroundStrokeColor: '--progress-background-color',
																																progress: 33
																															});

																															$$renderer.push(`<!----></div>`);
																														}
																													}
																												});
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

																								if (Layout.Stack) {
																									$$renderer.push('<!--[-->');

																									Layout.Stack($$renderer, {
																										direction: 'row',
																										alignItems: 'center',
																										justifyContent: 'space-between',
																										children: ($$renderer) => {
																											if (Typography.Title) {
																												$$renderer.push('<!--[-->');

																												Typography.Title($$renderer, {
																													size: 's',
																													children: ($$renderer) => {
																														$$renderer.push(`<!---->Flutter`);
																													},
																													$$slots: { default: true }
																												});

																												$$renderer.push('<!--]-->');
																											} else {
																												$$renderer.push('<!--[!-->');
																												$$renderer.push('<!--]-->');
																											}

																											$$renderer.push(` `);

																											if (platformMap().has('Flutter')) {
																												$$renderer.push('<!--[0-->');

																												if (Button.Button) {
																													$$renderer.push('<!--[-->');

																													Button.Button($$renderer, {
																														size: 'xs',
																														children: ($$renderer) => {
																															$$renderer.push(`<!---->Continue`);
																														},
																														$$slots: { default: true }
																													});

																													$$renderer.push('<!--]-->');
																												} else {
																													$$renderer.push('<!--[!-->');
																													$$renderer.push('<!--]-->');
																												}
																											} else {
																												$$renderer.push(`<!--[-1--><div class="arrow-icon svelte-1cwqimf">`);
																												Icon($$renderer, { icon: IconArrowRight, size: 's' });
																												$$renderer.push(`<!----></div>`);
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

															$$renderer.push(` <span class="with-separators eyebrow-heading-3">or</span> `);

															if (Card.Button) {
																$$renderer.push('<!--[-->');

																Card.Button($$renderer, {
																	padding: 'none',
																	children: ($$renderer) => {
																		if (Layout.Stack) {
																			$$renderer.push('<!--[-->');

																			Layout.Stack($$renderer, {
																				gap: 'xl',
																				children: ($$renderer) => {
																					$$renderer.push(`<div class="card-top-image api-key-card-image svelte-1cwqimf"${$.attr_style('', {
																						'background-image': `url('${$.store_get($$store_subs ??= {}, '$app', app).themeInUse === 'dark' ? PlatformSdkImgSourceDark : PlatformSdkImgSource}')`
																					})}>`);

																					if (Layout.Stack) {
																						$$renderer.push('<!--[-->');

																						Layout.Stack($$renderer, {
																							direction: 'row',
																							alignItems: 'center',
																							justifyContent: 'space-between',
																							children: ($$renderer) => {
																								if (Layout.Stack) {
																									$$renderer.push('<!--[-->');

																									Layout.Stack($$renderer, {
																										gap: 'xxs',
																										children: ($$renderer) => {
																											if (Typography.Title) {
																												$$renderer.push('<!--[-->');

																												Typography.Title($$renderer, {
																													size: 's',
																													children: ($$renderer) => {
																														$$renderer.push(`<!---->Create API key`);
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
																														$$renderer.push(`<!---->Connect your server or backend to Appwrite`);
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

																								$$renderer.push(` <div class="arrow-icon svelte-1cwqimf">`);
																								Icon($$renderer, { icon: IconArrowRight, size: 's' });
																								$$renderer.push(`<!----></div>`);
																							},
																							$$slots: { default: true }
																						});

																						$$renderer.push('<!--]-->');
																					} else {
																						$$renderer.push('<!--[!-->');
																						$$renderer.push('<!--]-->');
																					}

																					$$renderer.push(`</div>`);
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

						if (Step.Item) {
							$$renderer.push('<!--[-->');

							Step.Item($$renderer, {
								state: 'next',
								children: ($$renderer) => {
									$$renderer.push(`<div>`);

									if (Typography.Title) {
										$$renderer.push('<!--[-->');

										Typography.Title($$renderer, {
											color: '--fgcolor-neutral-tertiary',
											size: 's',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Build your app`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(`</div>`);
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
		} else {
			$$renderer.push('<!--[-1-->');

			if (Step.List) {
				$$renderer.push('<!--[-->');

				Step.List($$renderer, {
					children: ($$renderer) => {
						if (Step.Item) {
							$$renderer.push('<!--[-->');

							Step.Item($$renderer, {
								state: 'previous',
								children: ($$renderer) => {
									$$renderer.push(`<div>`);

									if (Typography.Title) {
										$$renderer.push('<!--[-->');

										Typography.Title($$renderer, {
											color: '--fgcolor-neutral-tertiary',
											size: 's',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Create project`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(`</div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Step.Item) {
							$$renderer.push('<!--[-->');

							Step.Item($$renderer, {
								state: 'previous',
								children: ($$renderer) => {
									$$renderer.push(`<div>`);

									if (Typography.Title) {
										$$renderer.push('<!--[-->');

										Typography.Title($$renderer, {
											color: '--fgcolor-neutral-tertiary',
											size: 's',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Connect your platform`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(`</div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Step.Item) {
							$$renderer.push('<!--[-->');

							Step.Item($$renderer, {
								state: 'current',
								children: ($$renderer) => {
									if (Layout.Stack) {
										$$renderer.push('<!--[-->');

										Layout.Stack($$renderer, {
											direction: $.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport) ? 'column' : 'row',
											gap: $.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport) ? 'xl' : 'xxl',
											children: ($$renderer) => {
												$$renderer.push(`<div class="step-info svelte-1cwqimf">`);

												if (Layout.Stack) {
													$$renderer.push('<!--[-->');

													Layout.Stack($$renderer, {
														gap: 'm',
														children: ($$renderer) => {
															if (Typography.Title) {
																$$renderer.push('<!--[-->');

																Typography.Title($$renderer, {
																	color: '--fgcolor-neutral-primary',
																	size: 's',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Build your app`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` <div class="build-info"><span>Continue building your app by setting up services such
                                            as Auth, Databases, Storage and Functions.</span></div>`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(`</div> `);

												if (Layout.Stack) {
													$$renderer.push('<!--[-->');

													Layout.Stack($$renderer, {
														gap: 'l',
														children: ($$renderer) => {
															if (Layout.Stack) {
																$$renderer.push('<!--[-->');

																Layout.Stack($$renderer, {
																	gap: 'l',
																	direction: $.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport) ? 'column' : 'row',
																	children: ($$renderer) => {
																		if (Card.Button) {
																			$$renderer.push('<!--[-->');

																			Card.Button($$renderer, {
																				padding: 's',
																				children: ($$renderer) => {
																					if (Layout.Stack) {
																						$$renderer.push('<!--[-->');

																						Layout.Stack($$renderer, {
																							gap: 'xl',
																							children: ($$renderer) => {
																								$$renderer.push(`<div class="card-top-image database-card-image svelte-1cwqimf"${$.attr_style('', {
																									'background-image': `url('${$.store_get($$store_subs ??= {}, '$app', app).themeInUse === 'dark' ? DatabaseImgSourceDark : DatabaseImgSource}')`
																								})}></div> `);

																								if (Layout.Stack) {
																									$$renderer.push('<!--[-->');

																									Layout.Stack($$renderer, {
																										direction: 'row',
																										alignItems: 'center',
																										justifyContent: 'space-between',
																										children: ($$renderer) => {
																											if (Typography.Title) {
																												$$renderer.push('<!--[-->');

																												Typography.Title($$renderer, {
																													size: 's',
																													children: ($$renderer) => {
																														$$renderer.push(`<!---->Set up your database`);
																													},
																													$$slots: { default: true }
																												});

																												$$renderer.push('<!--]-->');
																											} else {
																												$$renderer.push('<!--[!-->');
																												$$renderer.push('<!--]-->');
																											}

																											$$renderer.push(` <div class="arrow-icon svelte-1cwqimf">`);
																											Icon($$renderer, { icon: IconArrowRight, size: 's' });
																											$$renderer.push(`<!----></div>`);
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

																		if (Card.Base) {
																			$$renderer.push('<!--[-->');

																			Card.Base($$renderer, {
																				padding: 's',
																				children: ($$renderer) => {
																					$$renderer.push(`<div class="full-height-card svelte-1cwqimf">`);

																					if (Layout.Stack) {
																						$$renderer.push('<!--[-->');

																						Layout.Stack($$renderer, {
																							gap: 'xl',
																							justifyContent: 'space-between',
																							children: ($$renderer) => {
																								if (Typography.Title) {
																									$$renderer.push('<!--[-->');

																									Typography.Title($$renderer, {
																										size: 's',
																										children: ($$renderer) => {
																											$$renderer.push(`<!---->Discover our docs`);
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
																										direction: 'column',
																										gap: 's',
																										justifyContent: 'flex-end',
																										children: ($$renderer) => {
																											if (Link.Anchor) {
																												$$renderer.push('<!--[-->');

																												Link.Anchor($$renderer, {
																													variant: 'quiet-muted',
																													href: 'https://appwrite.io/docs/references',
																													target: '_blank',
																													children: ($$renderer) => {
																														$$renderer.push(`<!---->API references`);
																													},
																													$$slots: { default: true }
																												});

																												$$renderer.push('<!--]-->');
																											} else {
																												$$renderer.push('<!--[!-->');
																												$$renderer.push('<!--]-->');
																											}

																											$$renderer.push(` `);

																											if (Link.Anchor) {
																												$$renderer.push('<!--[-->');

																												Link.Anchor($$renderer, {
																													variant: 'quiet-muted',
																													href: 'https://appwrite.io/docs/tutorials',
																													target: '_blank',
																													children: ($$renderer) => {
																														$$renderer.push(`<!---->Tutorials`);
																													},
																													$$slots: { default: true }
																												});

																												$$renderer.push('<!--]-->');
																											} else {
																												$$renderer.push('<!--[!-->');
																												$$renderer.push('<!--]-->');
																											}

																											$$renderer.push(` `);

																											if (Link.Anchor) {
																												$$renderer.push('<!--[-->');

																												Link.Anchor($$renderer, {
																													variant: 'quiet-muted',
																													href: 'https://appwrite.io/docs/products/storage/quick-start',
																													target: '_blank',
																													children: ($$renderer) => {
																														$$renderer.push(`<!---->Storage quick start`);
																													},
																													$$slots: { default: true }
																												});

																												$$renderer.push('<!--]-->');
																											} else {
																												$$renderer.push('<!--[!-->');
																												$$renderer.push('<!--]-->');
																											}

																											$$renderer.push(` `);

																											if (Link.Anchor) {
																												$$renderer.push('<!--[-->');

																												Link.Anchor($$renderer, {
																													variant: 'quiet-muted',
																													href: 'https://appwrite.io/docs/products/functions/quick-start',
																													target: '_blank',
																													children: ($$renderer) => {
																														$$renderer.push(`<!---->Functions quick start`);
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

																					$$renderer.push(`</div>`);
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
																	gap: 'l',
																	direction: $.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport) ? 'column' : 'row',
																	children: ($$renderer) => {
																		$$renderer.push(`<div class="double-width-card svelte-1cwqimf">`);

																		if (Card.Base) {
																			$$renderer.push('<!--[-->');

																			Card.Base($$renderer, {
																				padding: 's',
																				children: ($$renderer) => {
																					$$renderer.push(`<div class="full-height-card svelte-1cwqimf">`);

																					if (Layout.Stack) {
																						$$renderer.push('<!--[-->');

																						Layout.Stack($$renderer, {
																							direction: $.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport) ? 'column' : 'row',
																							children: ($$renderer) => {
																								if (Layout.Stack) {
																									$$renderer.push('<!--[-->');

																									Layout.Stack($$renderer, {
																										gap: 'xl',
																										justifyContent: 'space-between',
																										style: `flex: ${$.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport) ? '1 1 auto' : '0 0 30%'}; min-width: ${$.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport) ? 'auto' : '240px'}`,
																										children: ($$renderer) => {
																											if (Typography.Title) {
																												$$renderer.push('<!--[-->');

																												Typography.Title($$renderer, {
																													size: 's',
																													children: ($$renderer) => {
																														$$renderer.push(`<!---->Set up Auth`);
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
																													direction: 'column',
																													gap: 's',
																													justifyContent: 'flex-end',
																													children: ($$renderer) => {
																														if (Link.Anchor) {
																															$$renderer.push('<!--[-->');

																															Link.Anchor($$renderer, {
																																variant: 'quiet-muted',
																																href: `${projectRoute()}/auth/settings`,
																																children: ($$renderer) => {
																																	$$renderer.push(`<!---->E-mail and password`);
																																},
																																$$slots: { default: true }
																															});

																															$$renderer.push('<!--]-->');
																														} else {
																															$$renderer.push('<!--[!-->');
																															$$renderer.push('<!--]-->');
																														}

																														$$renderer.push(` `);

																														if (Link.Anchor) {
																															$$renderer.push('<!--[-->');

																															Link.Anchor($$renderer, {
																																variant: 'quiet-muted',
																																href: `${projectRoute()}/auth/settings`,
																																children: ($$renderer) => {
																																	$$renderer.push(`<!---->OAuth 2`);
																																},
																																$$slots: { default: true }
																															});

																															$$renderer.push('<!--]-->');
																														} else {
																															$$renderer.push('<!--[!-->');
																															$$renderer.push('<!--]-->');
																														}

																														$$renderer.push(` `);

																														if (Link.Anchor) {
																															$$renderer.push('<!--[-->');

																															Link.Anchor($$renderer, {
																																variant: 'quiet-muted',
																																href: `${projectRoute()}/auth/settings`,
																																children: ($$renderer) => {
																																	$$renderer.push(`<!---->View all methods`);
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

																								$$renderer.push(` <div class="auth-image svelte-1cwqimf"${$.attr_style('flex: 1 1 auto', {
																									'background-image': `url('${$.store_get($$store_subs ??= {}, '$app', app).themeInUse === 'dark' ? AuthPreviewDark : AuthPreview}')`
																								})}></div>`);
																							},
																							$$slots: { default: true }
																						});

																						$$renderer.push('<!--]-->');
																					} else {
																						$$renderer.push('<!--[!-->');
																						$$renderer.push('<!--]-->');
																					}

																					$$renderer.push(`</div>`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(`</div>`);
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
																	gap: 'l',
																	direction: $.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport) ? 'column' : 'row',
																	children: ($$renderer) => {
																		if (Card.Base) {
																			$$renderer.push('<!--[-->');

																			Card.Base($$renderer, {
																				padding: 's',
																				style: `flex: ${$.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport) ? '1 1 auto' : '1 1 70%'};`,
																				children: ($$renderer) => {
																					$$renderer.push(`<div class="full-height-card svelte-1cwqimf">`);

																					if (Layout.Stack) {
																						$$renderer.push('<!--[-->');

																						Layout.Stack($$renderer, {
																							gap: 'xl',
																							justifyContent: 'space-between',
																							children: ($$renderer) => {
																								if (Layout.Stack) {
																									$$renderer.push('<!--[-->');

																									Layout.Stack($$renderer, {
																										gap: 's',
																										children: ($$renderer) => {
																											if (Typography.Title) {
																												$$renderer.push('<!--[-->');

																												Typography.Title($$renderer, {
																													color: '--fgcolor-neutral-secondary',
																													size: 's',
																													children: ($$renderer) => {
																														$$renderer.push(`<!---->MCP server`);
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
																													color: '--fgcolor-neutral-secondary',
																													children: ($$renderer) => {
																														$$renderer.push(`<!---->Deploy the Appwrite MCP server with a single
                                                        click, or view the `);

																														if (Link.Anchor) {
																															$$renderer.push('<!--[-->');

																															Link.Anchor($$renderer, {
																																href: 'https://appwrite.io/docs/tooling/ai/mcp-servers',
																																target: '_blank',
																																children: ($$renderer) => {
																																	$$renderer.push(`<!---->docs`);
																																},
																																$$slots: { default: true }
																															});

																															$$renderer.push('<!--]-->');
																														} else {
																															$$renderer.push('<!--[!-->');
																															$$renderer.push('<!--]-->');
																														}

																														$$renderer.push(` for instructions.`);
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
																										gap: 's',
																										children: ($$renderer) => {
																											if (Typography.Text) {
																												$$renderer.push('<!--[-->');

																												Typography.Text($$renderer, {
																													color: '--fgcolor-neutral-tertiary',
																													size: 's',
																													children: ($$renderer) => {
																														$$renderer.push(`<!---->Quick install`);
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
																													gap: 's',
																													wrap: 'wrap',
																													children: ($$renderer) => {
																														$$renderer.push(`<!--[-->`);

																														const each_array = $.ensure_array_like(mcpTools);

																														for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																															let tool = each_array[$$index];

																															if (Button.Anchor) {
																																$$renderer.push('<!--[-->');

																																Button.Anchor($$renderer, {
																																	href: tool.href,
																																	target: '_blank',
																																	rel: 'noreferrer',
																																	size: 's',
																																	variant: 'secondary',
																																	children: ($$renderer) => {
																																		$$renderer.push(`<!---->${$.escape(tool.label)}`);
																																	},

																																	$$slots: {
																																		default: true,
																																		start: ($$renderer) => {
																																			Icon($$renderer, { slot: 'start', icon: tool.icon, size: 'xs' });
																																		}
																																	}
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

																					$$renderer.push(`</div>`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(` `);

																		if (Card.Link) {
																			$$renderer.push('<!--[-->');

																			Card.Link($$renderer, {
																				href: 'https://appwrite.io/discord',
																				padding: 's',
																				style: `flex: ${$.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport) ? '1 1 auto' : '1 1 28%'};`,
																				children: ($$renderer) => {
																					$$renderer.push(`<div class="full-height-card svelte-1cwqimf">`);

																					if (Layout.Stack) {
																						$$renderer.push('<!--[-->');

																						Layout.Stack($$renderer, {
																							gap: 'xs',
																							justifyContent: 'space-between',
																							children: ($$renderer) => {
																								if (Layout.Stack) {
																									$$renderer.push('<!--[-->');

																									Layout.Stack($$renderer, {
																										direction: 'row',
																										alignItems: 'center',
																										justifyContent: 'space-between',
																										class: 'discord-header',
																										children: ($$renderer) => {
																											if (Layout.Stack) {
																												$$renderer.push('<!--[-->');

																												Layout.Stack($$renderer, {
																													direction: 'row',
																													alignItems: 'flex-start',
																													gap: 'xs',
																													children: ($$renderer) => {
																														$$renderer.push(`<img${$.attr('src', $.store_get($$store_subs ??= {}, '$app', app).themeInUse === 'dark' ? DiscordImgSourceDark : DiscordImgSource)} class="discord svelte-1cwqimf" alt=""/> `);

																														if (Typography.Title) {
																															$$renderer.push('<!--[-->');

																															Typography.Title($$renderer, {
																																size: 's',
																																children: ($$renderer) => {
																																	$$renderer.push(`<!---->Discord`);
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

																											$$renderer.push(` <div class="arrow-icon arrow-icon-discord svelte-1cwqimf">`);
																											Icon($$renderer, { icon: IconArrowRight, size: 's' });
																											$$renderer.push(`<!----></div>`);
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
																										alignItems: 'flex-end',
																										justifyContent: 'space-between',
																										children: ($$renderer) => {
																											if (Typography.Text) {
																												$$renderer.push('<!--[-->');

																												Typography.Text($$renderer, {
																													size: 'm',
																													color: '--fgcolor-neutral-secondary',
																													children: ($$renderer) => {
																														$$renderer.push(`<!---->Join our Discord for support, tips and
                                                        product updates`);
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

																					$$renderer.push(`</div>`);
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
		}

		$$renderer.push(`<!--]--></div></div></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}