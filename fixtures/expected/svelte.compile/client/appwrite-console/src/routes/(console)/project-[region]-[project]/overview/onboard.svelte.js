import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

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

var root = $.from_html(`<div><!></div>`);

var root_1 = $.from_html(
	`<!> <div class="build-info"><span>Start building with your preferred web, mobile, and
                                            native frameworks.</span></div>`,
	1
);

var root_2 = $.from_html(`<div slot="start"><!></div>`);
var root_3 = $.from_html(`<div class="arrow-icon svelte-1cwqimf"><!></div>`);
var root_4 = $.from_html(`<!> <!>`, 1);
var root_5 = $.from_html(`<div class="card-top-image web-image-light svelte-1cwqimf"></div> <div class="card-top-image web-image-dark svelte-1cwqimf"></div> <!> <!>`, 1);
var root_6 = $.from_html(`<div class="card-top-image reactnative-image-light svelte-1cwqimf"></div> <div class="card-top-image reactnative-image-dark svelte-1cwqimf"></div> <!> <!>`, 1);
var root_7 = $.from_html(`<img class="platform-image svelte-1cwqimf" alt=""/> <!> <!>`, 1);
var root_8 = $.from_html(`<!> <!> <!>`, 1);
var root_9 = $.from_html(`<!> <div class="arrow-icon svelte-1cwqimf"><!></div>`, 1);
var root_10 = $.from_html(`<div class="card-top-image api-key-card-image svelte-1cwqimf"><!></div>`);
var root_11 = $.from_html(`<!> <!> <span class="with-separators eyebrow-heading-3">or</span> <!>`, 1);
var root_12 = $.from_html(`<div class="step-info svelte-1cwqimf"><!></div> <!>`, 1);

var root_13 = $.from_html(
	`<!> <div class="build-info"><span>Continue building your app by setting up services such
                                            as Auth, Databases, Storage and Functions.</span></div>`,
	1
);

var root_14 = $.from_html(`<div class="card-top-image database-card-image svelte-1cwqimf"></div> <!>`, 1);
var root_15 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_16 = $.from_html(`<div class="full-height-card svelte-1cwqimf"><!></div>`);
var root_17 = $.from_html(`<!> <div class="auth-image svelte-1cwqimf"></div>`, 1);
var root_18 = $.from_html(`<div class="double-width-card svelte-1cwqimf"><!></div>`);

var root_19 = $.from_html(
	`Deploy the Appwrite MCP server with a single
                                                        click, or view the <!> for instructions.`,
	1
);

var root_20 = $.from_html(`<img class="discord svelte-1cwqimf" alt=""/> <!>`, 1);
var root_21 = $.from_html(`<!> <div class="arrow-icon arrow-icon-discord svelte-1cwqimf"><!></div>`, 1);
var root_22 = $.from_html(`<div class="svelte-1cwqimf"><div class="console-container svelte-1cwqimf"><div class="dashboard-content svelte-1cwqimf"><!></div></div></div>`);

export default function Onboard($$anchor, $$props) {
	$.push($$props, true);

	const $isSmallViewport = () => $.store_get(isSmallViewport, '$isSmallViewport', $$stores);
	const $app = () => $.store_get(app, '$app', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let pingCount = $.prop($$props, 'pingCount', 3, 0),
		platforms = $.prop($$props, 'platforms', 19, () => []);

	const platformMap = $.derived(() => {
		const map = new Map();

		platforms().forEach((platform) => {
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
		goto(`${$.get(projectRoute)}/overview/api-keys/create`, { replaceState: true });
	}

	function openPlatformWizard(type, platform) {
		if (platform) {
			continuePlatform(type, platform.name, getPlatformIdentifier(platform), platform.type);
		} else {
			trackEvent(Click.PlatformCreateClick, { source: 'onboarding' });
			addPlatform(type);
		}
	}

	var div = root_22();

	$.set_style(div, '', {}, { 'container-type': 'inline-size' });

	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	{
		var consequent_10 = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => Step.List, ($$anchor, Step_List) => {
				Step_List($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root_8();
						var node_2 = $.first_child(fragment_1);

						$.component(node_2, () => Step.Item, ($$anchor, Step_Item) => {
							Step_Item($$anchor, {
								state: 'previous',
								children: ($$anchor, $$slotProps) => {
									var div_3 = root();
									var node_3 = $.child(div_3);

									$.component(node_3, () => Typography.Title, ($$anchor, Typography_Title) => {
										Typography_Title($$anchor, {
											color: '--fgcolor-neutral-tertiary',
											size: 's',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Create project');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									$.reset(div_3);
									$.append($$anchor, div_3);
								},
								$$slots: { default: true }
							});
						});

						var node_4 = $.sibling(node_2, 2);

						$.component(node_4, () => Step.Item, ($$anchor, Step_Item_1) => {
							Step_Item_1($$anchor, {
								state: 'current',
								children: ($$anchor, $$slotProps) => {
									var fragment_2 = $.comment();
									var node_5 = $.first_child(fragment_2);

									{
										let $0 = $.derived(() => $isSmallViewport() ? 'column' : 'row');
										let $1 = $.derived(() => $isSmallViewport() ? 'xl' : 'xxl');

										$.component(node_5, () => Layout.Stack, ($$anchor, Layout_Stack) => {
											Layout_Stack($$anchor, {
												get direction() {
													return $.get($0);
												},

												get gap() {
													return $.get($1);
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_3 = root_12();
													var div_4 = $.first_child(fragment_3);
													var node_6 = $.child(div_4);

													$.component(node_6, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
														Layout_Stack_1($$anchor, {
															gap: 'm',
															children: ($$anchor, $$slotProps) => {
																var fragment_4 = root_1();
																var node_7 = $.first_child(fragment_4);

																$.component(node_7, () => Typography.Title, ($$anchor, Typography_Title_1) => {
																	Typography_Title_1($$anchor, {
																		color: '--fgcolor-neutral-primary',
																		size: 's',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_1 = $.text('Connect your platform');

																			$.append($$anchor, text_1);
																		},
																		$$slots: { default: true }
																	});
																});

																$.next(2);
																$.append($$anchor, fragment_4);
															},
															$$slots: { default: true }
														});
													});

													$.reset(div_4);

													var node_8 = $.sibling(div_4, 2);

													$.component(node_8, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
														Layout_Stack_2($$anchor, {
															gap: 'l',
															children: ($$anchor, $$slotProps) => {
																var fragment_5 = root_11();
																var node_9 = $.first_child(fragment_5);

																{
																	let $0 = $.derived(() => $isSmallViewport() ? 'column' : 'row');

																	$.component(node_9, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
																		Layout_Stack_3($$anchor, {
																			gap: 'l',
																			get direction() {
																				return $.get($0);
																			},

																			children: ($$anchor, $$slotProps) => {
																				var fragment_6 = root_4();
																				var node_10 = $.first_child(fragment_6);

																				$.component(node_10, () => Card.Button, ($$anchor, Card_Button) => {
																					Card_Button($$anchor, {
																						padding: 's',
																						$$events: {
																							click: () => {
																								openPlatformWizard(Platform.Web, $.get(platformMap).get('Web'));
																							}
																						},

																						children: ($$anchor, $$slotProps) => {
																							var fragment_7 = $.comment();
																							var node_11 = $.first_child(fragment_7);

																							{
																								let $0 = $.derived(() => $.get(platformMap).has('Web') ? 'm' : 'xl');

																								$.component(node_11, () => Layout.Stack, ($$anchor, Layout_Stack_4) => {
																									Layout_Stack_4($$anchor, {
																										get gap() {
																											return $.get($0);
																										},
																										height: '100%',
																										justifyContent: 'space-between',
																										children: ($$anchor, $$slotProps) => {
																											var fragment_8 = root_5();
																											var node_12 = $.sibling($.first_child(fragment_8), 4);

																											{
																												var consequent = ($$anchor) => {
																													var fragment_9 = $.comment();
																													var node_13 = $.first_child(fragment_9);

																													$.component(node_13, () => Layout.Stack, ($$anchor, Layout_Stack_5) => {
																														Layout_Stack_5($$anchor, {
																															alignItems: 'flex-start',
																															children: ($$anchor, $$slotProps) => {
																																Badge($$anchor, {
																																	size: 's',
																																	variant: 'secondary',
																																	content: 'In progress',
																																	$$slots: {
																																		start: ($$anchor, $$slotProps) => {
																																			var div_5 = root_2();

																																			$.set_style(div_5, '', {}, { margin: '-4px 0 0 2px' });

																																			var node_14 = $.child(div_5);

																																			ProgressCircle(node_14, {
																																				size: 'xs',
																																				showAnimation: false,
																																				backgroundStrokeColor: '--progress-background-color',
																																				progress: 33
																																			});

																																			$.reset(div_5);
																																			$.append($$anchor, div_5);
																																		}
																																	}
																																});
																															},
																															$$slots: { default: true }
																														});
																													});

																													$.append($$anchor, fragment_9);
																												};

																												var d = $.derived(() => $.get(platformMap).has('Web'));

																												$.if(node_12, ($$render) => {
																													if ($.get(d)) $$render(consequent);
																												});
																											}

																											var node_15 = $.sibling(node_12, 2);

																											$.component(node_15, () => Layout.Stack, ($$anchor, Layout_Stack_6) => {
																												Layout_Stack_6($$anchor, {
																													direction: 'row',
																													alignItems: 'center',
																													justifyContent: 'space-between',
																													children: ($$anchor, $$slotProps) => {
																														var fragment_11 = root_4();
																														var node_16 = $.first_child(fragment_11);

																														$.component(node_16, () => Typography.Title, ($$anchor, Typography_Title_2) => {
																															Typography_Title_2($$anchor, {
																																size: 's',
																																children: ($$anchor, $$slotProps) => {
																																	$.next();

																																	var text_2 = $.text('Web');

																																	$.append($$anchor, text_2);
																																},
																																$$slots: { default: true }
																															});
																														});

																														var node_17 = $.sibling(node_16, 2);

																														{
																															var consequent_1 = ($$anchor) => {
																																var fragment_12 = $.comment();
																																var node_18 = $.first_child(fragment_12);

																																$.component(node_18, () => Button.Button, ($$anchor, Button_Button) => {
																																	Button_Button($$anchor, {
																																		size: 'xs',
																																		children: ($$anchor, $$slotProps) => {
																																			$.next();

																																			var text_3 = $.text('Continue');

																																			$.append($$anchor, text_3);
																																		},
																																		$$slots: { default: true }
																																	});
																																});

																																$.append($$anchor, fragment_12);
																															};

																															var d_1 = $.derived(() => $.get(platformMap).has('Web'));

																															var alternate = ($$anchor) => {
																																var div_6 = root_3();
																																var node_19 = $.child(div_6);

																																Icon(node_19, {
																																	get icon() {
																																		return IconArrowRight;
																																	},
																																	size: 's'
																																});

																																$.reset(div_6);
																																$.append($$anchor, div_6);
																															};

																															$.if(node_17, ($$render) => {
																																if ($.get(d_1)) $$render(consequent_1); else $$render(alternate, -1);
																															});
																														}

																														$.append($$anchor, fragment_11);
																													},
																													$$slots: { default: true }
																												});
																											});

																											$.append($$anchor, fragment_8);
																										},
																										$$slots: { default: true }
																									});
																								});
																							}

																							$.append($$anchor, fragment_7);
																						},
																						$$slots: { default: true }
																					});
																				});

																				var node_20 = $.sibling(node_10, 2);

																				$.component(node_20, () => Card.Button, ($$anchor, Card_Button_1) => {
																					Card_Button_1($$anchor, {
																						padding: 's',
																						$$events: {
																							click: () => {
																								openPlatformWizard(Platform.ReactNative, $.get(platformMap).get('React Native'));
																							}
																						},

																						children: ($$anchor, $$slotProps) => {
																							var fragment_13 = $.comment();
																							var node_21 = $.first_child(fragment_13);

																							{
																								let $0 = $.derived(() => $.get(platformMap).has('React Native') ? 'm' : 'xl');

																								$.component(node_21, () => Layout.Stack, ($$anchor, Layout_Stack_7) => {
																									Layout_Stack_7($$anchor, {
																										get gap() {
																											return $.get($0);
																										},
																										height: '100%',
																										justifyContent: 'space-between',
																										children: ($$anchor, $$slotProps) => {
																											var fragment_14 = root_6();
																											var node_22 = $.sibling($.first_child(fragment_14), 4);

																											{
																												var consequent_2 = ($$anchor) => {
																													var fragment_15 = $.comment();
																													var node_23 = $.first_child(fragment_15);

																													$.component(node_23, () => Layout.Stack, ($$anchor, Layout_Stack_8) => {
																														Layout_Stack_8($$anchor, {
																															alignItems: 'flex-start',
																															children: ($$anchor, $$slotProps) => {
																																Badge($$anchor, {
																																	size: 's',
																																	variant: 'secondary',
																																	content: 'In progress',
																																	$$slots: {
																																		start: ($$anchor, $$slotProps) => {
																																			var div_7 = root_2();

																																			$.set_style(div_7, '', {}, { margin: '-4px 0 0 2px' });

																																			var node_24 = $.child(div_7);

																																			ProgressCircle(node_24, {
																																				size: 'xs',
																																				showAnimation: false,
																																				backgroundStrokeColor: '--progress-background-color',
																																				progress: 33
																																			});

																																			$.reset(div_7);
																																			$.append($$anchor, div_7);
																																		}
																																	}
																																});
																															},
																															$$slots: { default: true }
																														});
																													});

																													$.append($$anchor, fragment_15);
																												};

																												var d_2 = $.derived(() => $.get(platformMap).has('React Native'));

																												$.if(node_22, ($$render) => {
																													if ($.get(d_2)) $$render(consequent_2);
																												});
																											}

																											var node_25 = $.sibling(node_22, 2);

																											$.component(node_25, () => Layout.Stack, ($$anchor, Layout_Stack_9) => {
																												Layout_Stack_9($$anchor, {
																													direction: 'row',
																													alignItems: 'center',
																													justifyContent: 'space-between',
																													children: ($$anchor, $$slotProps) => {
																														var fragment_17 = root_4();
																														var node_26 = $.first_child(fragment_17);

																														$.component(node_26, () => Typography.Title, ($$anchor, Typography_Title_3) => {
																															Typography_Title_3($$anchor, {
																																size: 's',
																																children: ($$anchor, $$slotProps) => {
																																	$.next();

																																	var text_4 = $.text('React Native');

																																	$.append($$anchor, text_4);
																																},
																																$$slots: { default: true }
																															});
																														});

																														var node_27 = $.sibling(node_26, 2);

																														{
																															var consequent_3 = ($$anchor) => {
																																var fragment_18 = $.comment();
																																var node_28 = $.first_child(fragment_18);

																																$.component(node_28, () => Button.Button, ($$anchor, Button_Button_1) => {
																																	Button_Button_1($$anchor, {
																																		size: 'xs',
																																		children: ($$anchor, $$slotProps) => {
																																			$.next();

																																			var text_5 = $.text('Continue');

																																			$.append($$anchor, text_5);
																																		},
																																		$$slots: { default: true }
																																	});
																																});

																																$.append($$anchor, fragment_18);
																															};

																															var d_3 = $.derived(() => $.get(platformMap).has('React Native'));

																															var alternate_1 = ($$anchor) => {
																																var div_8 = root_3();
																																var node_29 = $.child(div_8);

																																Icon(node_29, {
																																	get icon() {
																																		return IconArrowRight;
																																	},
																																	size: 's'
																																});

																																$.reset(div_8);
																																$.append($$anchor, div_8);
																															};

																															$.if(node_27, ($$render) => {
																																if ($.get(d_3)) $$render(consequent_3); else $$render(alternate_1, -1);
																															});
																														}

																														$.append($$anchor, fragment_17);
																													},
																													$$slots: { default: true }
																												});
																											});

																											$.append($$anchor, fragment_14);
																										},
																										$$slots: { default: true }
																									});
																								});
																							}

																							$.append($$anchor, fragment_13);
																						},
																						$$slots: { default: true }
																					});
																				});

																				$.append($$anchor, fragment_6);
																			},
																			$$slots: { default: true }
																		});
																	});
																}

																var node_30 = $.sibling(node_9, 2);

																{
																	let $0 = $.derived(() => $isSmallViewport() ? 'column' : 'row');

																	$.component(node_30, () => Layout.Stack, ($$anchor, Layout_Stack_10) => {
																		Layout_Stack_10($$anchor, {
																			gap: 'l',
																			get direction() {
																				return $.get($0);
																			},

																			children: ($$anchor, $$slotProps) => {
																				var fragment_19 = root_8();
																				var node_31 = $.first_child(fragment_19);

																				$.component(node_31, () => Card.Button, ($$anchor, Card_Button_2) => {
																					Card_Button_2($$anchor, {
																						padding: 's',
																						$$events: {
																							click: () => {
																								openPlatformWizard(Platform.Apple, $.get(platformMap).get('Apple'));
																							}
																						},

																						children: ($$anchor, $$slotProps) => {
																							var fragment_20 = $.comment();
																							var node_32 = $.first_child(fragment_20);

																							{
																								let $0 = $.derived(() => $.get(platformMap).has('Apple') ? 's' : 'xxl');

																								$.component(node_32, () => Layout.Stack, ($$anchor, Layout_Stack_11) => {
																									Layout_Stack_11($$anchor, {
																										get gap() {
																											return $.get($0);
																										},
																										height: '100%',
																										justifyContent: 'space-between',
																										children: ($$anchor, $$slotProps) => {
																											var fragment_21 = root_7();
																											var img = $.first_child(fragment_21);
																											var node_33 = $.sibling(img, 2);

																											{
																												var consequent_4 = ($$anchor) => {
																													var fragment_22 = $.comment();
																													var node_34 = $.first_child(fragment_22);

																													$.component(node_34, () => Layout.Stack, ($$anchor, Layout_Stack_12) => {
																														Layout_Stack_12($$anchor, {
																															alignItems: 'flex-start',
																															children: ($$anchor, $$slotProps) => {
																																Badge($$anchor, {
																																	size: 's',
																																	variant: 'secondary',
																																	content: 'In progress',
																																	$$slots: {
																																		start: ($$anchor, $$slotProps) => {
																																			var div_9 = root_2();

																																			$.set_style(div_9, '', {}, { margin: '-4px 0 0 2px' });

																																			var node_35 = $.child(div_9);

																																			ProgressCircle(node_35, {
																																				size: 'xs',
																																				showAnimation: false,
																																				backgroundStrokeColor: '--progress-background-color',
																																				progress: 33
																																			});

																																			$.reset(div_9);
																																			$.append($$anchor, div_9);
																																		}
																																	}
																																});
																															},
																															$$slots: { default: true }
																														});
																													});

																													$.append($$anchor, fragment_22);
																												};

																												var d_4 = $.derived(() => $.get(platformMap).has('Apple'));

																												$.if(node_33, ($$render) => {
																													if ($.get(d_4)) $$render(consequent_4);
																												});
																											}

																											var node_36 = $.sibling(node_33, 2);

																											$.component(node_36, () => Layout.Stack, ($$anchor, Layout_Stack_13) => {
																												Layout_Stack_13($$anchor, {
																													direction: 'row',
																													alignItems: 'center',
																													justifyContent: 'space-between',
																													children: ($$anchor, $$slotProps) => {
																														var fragment_24 = root_4();
																														var node_37 = $.first_child(fragment_24);

																														$.component(node_37, () => Typography.Title, ($$anchor, Typography_Title_4) => {
																															Typography_Title_4($$anchor, {
																																size: 's',
																																children: ($$anchor, $$slotProps) => {
																																	$.next();

																																	var text_6 = $.text('Apple');

																																	$.append($$anchor, text_6);
																																},
																																$$slots: { default: true }
																															});
																														});

																														var node_38 = $.sibling(node_37, 2);

																														{
																															var consequent_5 = ($$anchor) => {
																																var fragment_25 = $.comment();
																																var node_39 = $.first_child(fragment_25);

																																$.component(node_39, () => Button.Button, ($$anchor, Button_Button_2) => {
																																	Button_Button_2($$anchor, {
																																		size: 'xs',
																																		children: ($$anchor, $$slotProps) => {
																																			$.next();

																																			var text_7 = $.text('Continue');

																																			$.append($$anchor, text_7);
																																		},
																																		$$slots: { default: true }
																																	});
																																});

																																$.append($$anchor, fragment_25);
																															};

																															var d_5 = $.derived(() => $.get(platformMap).has('Apple'));

																															var alternate_2 = ($$anchor) => {
																																var div_10 = root_3();
																																var node_40 = $.child(div_10);

																																Icon(node_40, {
																																	get icon() {
																																		return IconArrowRight;
																																	},
																																	size: 's'
																																});

																																$.reset(div_10);
																																$.append($$anchor, div_10);
																															};

																															$.if(node_38, ($$render) => {
																																if ($.get(d_5)) $$render(consequent_5); else $$render(alternate_2, -1);
																															});
																														}

																														$.append($$anchor, fragment_24);
																													},
																													$$slots: { default: true }
																												});
																											});

																											$.template_effect(() => $.set_attribute(img, 'src', $app().themeInUse === 'dark' ? PlatformIosImgSourceDark : PlatformIosImgSource));
																											$.append($$anchor, fragment_21);
																										},
																										$$slots: { default: true }
																									});
																								});
																							}

																							$.append($$anchor, fragment_20);
																						},
																						$$slots: { default: true }
																					});
																				});

																				var node_41 = $.sibling(node_31, 2);

																				$.component(node_41, () => Card.Button, ($$anchor, Card_Button_3) => {
																					Card_Button_3($$anchor, {
																						padding: 's',
																						$$events: {
																							click: () => {
																								openPlatformWizard(Platform.Android, $.get(platformMap).get('Android'));
																							}
																						},

																						children: ($$anchor, $$slotProps) => {
																							var fragment_26 = $.comment();
																							var node_42 = $.first_child(fragment_26);

																							{
																								let $0 = $.derived(() => $.get(platformMap).has('Android') ? 's' : 'xxl');

																								$.component(node_42, () => Layout.Stack, ($$anchor, Layout_Stack_14) => {
																									Layout_Stack_14($$anchor, {
																										get gap() {
																											return $.get($0);
																										},
																										height: '100%',
																										justifyContent: 'space-between',
																										children: ($$anchor, $$slotProps) => {
																											var fragment_27 = root_7();
																											var img_1 = $.first_child(fragment_27);
																											var node_43 = $.sibling(img_1, 2);

																											{
																												var consequent_6 = ($$anchor) => {
																													var fragment_28 = $.comment();
																													var node_44 = $.first_child(fragment_28);

																													$.component(node_44, () => Layout.Stack, ($$anchor, Layout_Stack_15) => {
																														Layout_Stack_15($$anchor, {
																															alignItems: 'flex-start',
																															children: ($$anchor, $$slotProps) => {
																																Badge($$anchor, {
																																	size: 's',
																																	variant: 'secondary',
																																	content: 'In progress',
																																	$$slots: {
																																		start: ($$anchor, $$slotProps) => {
																																			var div_11 = root_2();

																																			$.set_style(div_11, '', {}, { margin: '-4px 0 0 2px' });

																																			var node_45 = $.child(div_11);

																																			ProgressCircle(node_45, {
																																				size: 'xs',
																																				showAnimation: false,
																																				backgroundStrokeColor: '--progress-background-color',
																																				progress: 33
																																			});

																																			$.reset(div_11);
																																			$.append($$anchor, div_11);
																																		}
																																	}
																																});
																															},
																															$$slots: { default: true }
																														});
																													});

																													$.append($$anchor, fragment_28);
																												};

																												var d_6 = $.derived(() => $.get(platformMap).has('Android'));

																												$.if(node_43, ($$render) => {
																													if ($.get(d_6)) $$render(consequent_6);
																												});
																											}

																											var node_46 = $.sibling(node_43, 2);

																											$.component(node_46, () => Layout.Stack, ($$anchor, Layout_Stack_16) => {
																												Layout_Stack_16($$anchor, {
																													direction: 'row',
																													alignItems: 'center',
																													justifyContent: 'space-between',
																													children: ($$anchor, $$slotProps) => {
																														var fragment_30 = root_4();
																														var node_47 = $.first_child(fragment_30);

																														$.component(node_47, () => Typography.Title, ($$anchor, Typography_Title_5) => {
																															Typography_Title_5($$anchor, {
																																size: 's',
																																children: ($$anchor, $$slotProps) => {
																																	$.next();

																																	var text_8 = $.text('Android');

																																	$.append($$anchor, text_8);
																																},
																																$$slots: { default: true }
																															});
																														});

																														var node_48 = $.sibling(node_47, 2);

																														{
																															var consequent_7 = ($$anchor) => {
																																var fragment_31 = $.comment();
																																var node_49 = $.first_child(fragment_31);

																																$.component(node_49, () => Button.Button, ($$anchor, Button_Button_3) => {
																																	Button_Button_3($$anchor, {
																																		size: 'xs',
																																		children: ($$anchor, $$slotProps) => {
																																			$.next();

																																			var text_9 = $.text('Continue');

																																			$.append($$anchor, text_9);
																																		},
																																		$$slots: { default: true }
																																	});
																																});

																																$.append($$anchor, fragment_31);
																															};

																															var d_7 = $.derived(() => $.get(platformMap).has('Android'));

																															var alternate_3 = ($$anchor) => {
																																var div_12 = root_3();
																																var node_50 = $.child(div_12);

																																Icon(node_50, {
																																	get icon() {
																																		return IconArrowRight;
																																	},
																																	size: 's'
																																});

																																$.reset(div_12);
																																$.append($$anchor, div_12);
																															};

																															$.if(node_48, ($$render) => {
																																if ($.get(d_7)) $$render(consequent_7); else $$render(alternate_3, -1);
																															});
																														}

																														$.append($$anchor, fragment_30);
																													},
																													$$slots: { default: true }
																												});
																											});

																											$.template_effect(() => $.set_attribute(img_1, 'src', $app().themeInUse === 'dark'
																												? PlatformAndroidImgSourceDark
																												: PlatformAndroidImgSource));

																											$.append($$anchor, fragment_27);
																										},
																										$$slots: { default: true }
																									});
																								});
																							}

																							$.append($$anchor, fragment_26);
																						},
																						$$slots: { default: true }
																					});
																				});

																				var node_51 = $.sibling(node_41, 2);

																				$.component(node_51, () => Card.Button, ($$anchor, Card_Button_4) => {
																					Card_Button_4($$anchor, {
																						padding: 's',
																						$$events: {
																							click: () => {
																								openPlatformWizard(Platform.Flutter, $.get(platformMap).get('Flutter'));
																							}
																						},

																						children: ($$anchor, $$slotProps) => {
																							var fragment_32 = $.comment();
																							var node_52 = $.first_child(fragment_32);

																							{
																								let $0 = $.derived(() => $.get(platformMap).has('Flutter') ? 's' : 'xxl');

																								$.component(node_52, () => Layout.Stack, ($$anchor, Layout_Stack_17) => {
																									Layout_Stack_17($$anchor, {
																										get gap() {
																											return $.get($0);
																										},
																										height: '100%',
																										justifyContent: 'space-between',
																										children: ($$anchor, $$slotProps) => {
																											var fragment_33 = root_7();
																											var img_2 = $.first_child(fragment_33);
																											var node_53 = $.sibling(img_2, 2);

																											{
																												var consequent_8 = ($$anchor) => {
																													var fragment_34 = $.comment();
																													var node_54 = $.first_child(fragment_34);

																													$.component(node_54, () => Layout.Stack, ($$anchor, Layout_Stack_18) => {
																														Layout_Stack_18($$anchor, {
																															alignItems: 'flex-start',
																															children: ($$anchor, $$slotProps) => {
																																Badge($$anchor, {
																																	size: 's',
																																	variant: 'secondary',
																																	content: 'In progress',
																																	$$slots: {
																																		start: ($$anchor, $$slotProps) => {
																																			var div_13 = root_2();

																																			$.set_style(div_13, '', {}, { margin: '-4px 0 0 2px' });

																																			var node_55 = $.child(div_13);

																																			ProgressCircle(node_55, {
																																				size: 'xs',
																																				showAnimation: false,
																																				backgroundStrokeColor: '--progress-background-color',
																																				progress: 33
																																			});

																																			$.reset(div_13);
																																			$.append($$anchor, div_13);
																																		}
																																	}
																																});
																															},
																															$$slots: { default: true }
																														});
																													});

																													$.append($$anchor, fragment_34);
																												};

																												var d_8 = $.derived(() => $.get(platformMap).has('Flutter'));

																												$.if(node_53, ($$render) => {
																													if ($.get(d_8)) $$render(consequent_8);
																												});
																											}

																											var node_56 = $.sibling(node_53, 2);

																											$.component(node_56, () => Layout.Stack, ($$anchor, Layout_Stack_19) => {
																												Layout_Stack_19($$anchor, {
																													direction: 'row',
																													alignItems: 'center',
																													justifyContent: 'space-between',
																													children: ($$anchor, $$slotProps) => {
																														var fragment_36 = root_4();
																														var node_57 = $.first_child(fragment_36);

																														$.component(node_57, () => Typography.Title, ($$anchor, Typography_Title_6) => {
																															Typography_Title_6($$anchor, {
																																size: 's',
																																children: ($$anchor, $$slotProps) => {
																																	$.next();

																																	var text_10 = $.text('Flutter');

																																	$.append($$anchor, text_10);
																																},
																																$$slots: { default: true }
																															});
																														});

																														var node_58 = $.sibling(node_57, 2);

																														{
																															var consequent_9 = ($$anchor) => {
																																var fragment_37 = $.comment();
																																var node_59 = $.first_child(fragment_37);

																																$.component(node_59, () => Button.Button, ($$anchor, Button_Button_4) => {
																																	Button_Button_4($$anchor, {
																																		size: 'xs',
																																		children: ($$anchor, $$slotProps) => {
																																			$.next();

																																			var text_11 = $.text('Continue');

																																			$.append($$anchor, text_11);
																																		},
																																		$$slots: { default: true }
																																	});
																																});

																																$.append($$anchor, fragment_37);
																															};

																															var d_9 = $.derived(() => $.get(platformMap).has('Flutter'));

																															var alternate_4 = ($$anchor) => {
																																var div_14 = root_3();
																																var node_60 = $.child(div_14);

																																Icon(node_60, {
																																	get icon() {
																																		return IconArrowRight;
																																	},
																																	size: 's'
																																});

																																$.reset(div_14);
																																$.append($$anchor, div_14);
																															};

																															$.if(node_58, ($$render) => {
																																if ($.get(d_9)) $$render(consequent_9); else $$render(alternate_4, -1);
																															});
																														}

																														$.append($$anchor, fragment_36);
																													},
																													$$slots: { default: true }
																												});
																											});

																											$.template_effect(() => $.set_attribute(img_2, 'src', $app().themeInUse === 'dark'
																												? PlatformFlutterImgSourceDark
																												: PlatformFlutterImgSource));

																											$.append($$anchor, fragment_33);
																										},
																										$$slots: { default: true }
																									});
																								});
																							}

																							$.append($$anchor, fragment_32);
																						},
																						$$slots: { default: true }
																					});
																				});

																				$.append($$anchor, fragment_19);
																			},
																			$$slots: { default: true }
																		});
																	});
																}

																var node_61 = $.sibling(node_30, 4);

																$.component(node_61, () => Card.Button, ($$anchor, Card_Button_5) => {
																	Card_Button_5($$anchor, {
																		padding: 'none',
																		$$events: { click: createKey },
																		children: ($$anchor, $$slotProps) => {
																			var fragment_38 = $.comment();
																			var node_62 = $.first_child(fragment_38);

																			$.component(node_62, () => Layout.Stack, ($$anchor, Layout_Stack_20) => {
																				Layout_Stack_20($$anchor, {
																					gap: 'xl',
																					children: ($$anchor, $$slotProps) => {
																						var div_15 = root_10();
																						let styles;
																						var node_63 = $.child(div_15);

																						$.component(node_63, () => Layout.Stack, ($$anchor, Layout_Stack_21) => {
																							Layout_Stack_21($$anchor, {
																								direction: 'row',
																								alignItems: 'center',
																								justifyContent: 'space-between',
																								children: ($$anchor, $$slotProps) => {
																									var fragment_39 = root_9();
																									var node_64 = $.first_child(fragment_39);

																									$.component(node_64, () => Layout.Stack, ($$anchor, Layout_Stack_22) => {
																										Layout_Stack_22($$anchor, {
																											gap: 'xxs',
																											children: ($$anchor, $$slotProps) => {
																												var fragment_40 = root_4();
																												var node_65 = $.first_child(fragment_40);

																												$.component(node_65, () => Typography.Title, ($$anchor, Typography_Title_7) => {
																													Typography_Title_7($$anchor, {
																														size: 's',
																														children: ($$anchor, $$slotProps) => {
																															$.next();

																															var text_12 = $.text('Create API key');

																															$.append($$anchor, text_12);
																														},
																														$$slots: { default: true }
																													});
																												});

																												var node_66 = $.sibling(node_65, 2);

																												$.component(node_66, () => Typography.Text, ($$anchor, Typography_Text) => {
																													Typography_Text($$anchor, {
																														children: ($$anchor, $$slotProps) => {
																															$.next();

																															var text_13 = $.text('Connect your server or backend to Appwrite');

																															$.append($$anchor, text_13);
																														},
																														$$slots: { default: true }
																													});
																												});

																												$.append($$anchor, fragment_40);
																											},
																											$$slots: { default: true }
																										});
																									});

																									var div_16 = $.sibling(node_64, 2);
																									var node_67 = $.child(div_16);

																									Icon(node_67, {
																										get icon() {
																											return IconArrowRight;
																										},
																										size: 's'
																									});

																									$.reset(div_16);
																									$.append($$anchor, fragment_39);
																								},
																								$$slots: { default: true }
																							});
																						});

																						$.reset(div_15);

																						$.template_effect(() => styles = $.set_style(div_15, '', styles, {
																							'background-image': `url('${$app().themeInUse === 'dark' ? PlatformSdkImgSourceDark : PlatformSdkImgSource}')`
																						}));

																						$.append($$anchor, div_15);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_38);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_5);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_3);
												},
												$$slots: { default: true }
											});
										});
									}

									$.append($$anchor, fragment_2);
								},
								$$slots: { default: true }
							});
						});

						var node_68 = $.sibling(node_4, 2);

						$.component(node_68, () => Step.Item, ($$anchor, Step_Item_2) => {
							Step_Item_2($$anchor, {
								state: 'next',
								children: ($$anchor, $$slotProps) => {
									var div_17 = root();
									var node_69 = $.child(div_17);

									$.component(node_69, () => Typography.Title, ($$anchor, Typography_Title_8) => {
										Typography_Title_8($$anchor, {
											color: '--fgcolor-neutral-tertiary',
											size: 's',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_14 = $.text('Build your app');

												$.append($$anchor, text_14);
											},
											$$slots: { default: true }
										});
									});

									$.reset(div_17);
									$.append($$anchor, div_17);
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
		};

		var alternate_5 = ($$anchor) => {
			var fragment_41 = $.comment();
			var node_70 = $.first_child(fragment_41);

			$.component(node_70, () => Step.List, ($$anchor, Step_List_1) => {
				Step_List_1($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_42 = root_8();
						var node_71 = $.first_child(fragment_42);

						$.component(node_71, () => Step.Item, ($$anchor, Step_Item_3) => {
							Step_Item_3($$anchor, {
								state: 'previous',
								children: ($$anchor, $$slotProps) => {
									var div_18 = root();
									var node_72 = $.child(div_18);

									$.component(node_72, () => Typography.Title, ($$anchor, Typography_Title_9) => {
										Typography_Title_9($$anchor, {
											color: '--fgcolor-neutral-tertiary',
											size: 's',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_15 = $.text('Create project');

												$.append($$anchor, text_15);
											},
											$$slots: { default: true }
										});
									});

									$.reset(div_18);
									$.append($$anchor, div_18);
								},
								$$slots: { default: true }
							});
						});

						var node_73 = $.sibling(node_71, 2);

						$.component(node_73, () => Step.Item, ($$anchor, Step_Item_4) => {
							Step_Item_4($$anchor, {
								state: 'previous',
								children: ($$anchor, $$slotProps) => {
									var div_19 = root();
									var node_74 = $.child(div_19);

									$.component(node_74, () => Typography.Title, ($$anchor, Typography_Title_10) => {
										Typography_Title_10($$anchor, {
											color: '--fgcolor-neutral-tertiary',
											size: 's',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_16 = $.text('Connect your platform');

												$.append($$anchor, text_16);
											},
											$$slots: { default: true }
										});
									});

									$.reset(div_19);
									$.append($$anchor, div_19);
								},
								$$slots: { default: true }
							});
						});

						var node_75 = $.sibling(node_73, 2);

						$.component(node_75, () => Step.Item, ($$anchor, Step_Item_5) => {
							Step_Item_5($$anchor, {
								state: 'current',
								children: ($$anchor, $$slotProps) => {
									var fragment_43 = $.comment();
									var node_76 = $.first_child(fragment_43);

									{
										let $0 = $.derived(() => $isSmallViewport() ? 'column' : 'row');
										let $1 = $.derived(() => $isSmallViewport() ? 'xl' : 'xxl');

										$.component(node_76, () => Layout.Stack, ($$anchor, Layout_Stack_23) => {
											Layout_Stack_23($$anchor, {
												get direction() {
													return $.get($0);
												},

												get gap() {
													return $.get($1);
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_44 = root_12();
													var div_20 = $.first_child(fragment_44);
													var node_77 = $.child(div_20);

													$.component(node_77, () => Layout.Stack, ($$anchor, Layout_Stack_24) => {
														Layout_Stack_24($$anchor, {
															gap: 'm',
															children: ($$anchor, $$slotProps) => {
																var fragment_45 = root_13();
																var node_78 = $.first_child(fragment_45);

																$.component(node_78, () => Typography.Title, ($$anchor, Typography_Title_11) => {
																	Typography_Title_11($$anchor, {
																		color: '--fgcolor-neutral-primary',
																		size: 's',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_17 = $.text('Build your app');

																			$.append($$anchor, text_17);
																		},
																		$$slots: { default: true }
																	});
																});

																$.next(2);
																$.append($$anchor, fragment_45);
															},
															$$slots: { default: true }
														});
													});

													$.reset(div_20);

													var node_79 = $.sibling(div_20, 2);

													$.component(node_79, () => Layout.Stack, ($$anchor, Layout_Stack_25) => {
														Layout_Stack_25($$anchor, {
															gap: 'l',
															children: ($$anchor, $$slotProps) => {
																var fragment_46 = root_8();
																var node_80 = $.first_child(fragment_46);

																{
																	let $0 = $.derived(() => $isSmallViewport() ? 'column' : 'row');

																	$.component(node_80, () => Layout.Stack, ($$anchor, Layout_Stack_26) => {
																		Layout_Stack_26($$anchor, {
																			gap: 'l',
																			get direction() {
																				return $.get($0);
																			},

																			children: ($$anchor, $$slotProps) => {
																				var fragment_47 = root_4();
																				var node_81 = $.first_child(fragment_47);

																				$.component(node_81, () => Card.Button, ($$anchor, Card_Button_6) => {
																					Card_Button_6($$anchor, {
																						padding: 's',
																						$$events: {
																							click: () => {
																								trackEvent(Click.OnboardingSetupDatabaseClick);
																								goto(`${$.get(projectRoute)}/databases`);
																							}
																						},

																						children: ($$anchor, $$slotProps) => {
																							var fragment_48 = $.comment();
																							var node_82 = $.first_child(fragment_48);

																							$.component(node_82, () => Layout.Stack, ($$anchor, Layout_Stack_27) => {
																								Layout_Stack_27($$anchor, {
																									gap: 'xl',
																									children: ($$anchor, $$slotProps) => {
																										var fragment_49 = root_14();
																										var div_21 = $.first_child(fragment_49);
																										let styles_1;
																										var node_83 = $.sibling(div_21, 2);

																										$.component(node_83, () => Layout.Stack, ($$anchor, Layout_Stack_28) => {
																											Layout_Stack_28($$anchor, {
																												direction: 'row',
																												alignItems: 'center',
																												justifyContent: 'space-between',
																												children: ($$anchor, $$slotProps) => {
																													var fragment_50 = root_9();
																													var node_84 = $.first_child(fragment_50);

																													$.component(node_84, () => Typography.Title, ($$anchor, Typography_Title_12) => {
																														Typography_Title_12($$anchor, {
																															size: 's',
																															children: ($$anchor, $$slotProps) => {
																																$.next();

																																var text_18 = $.text('Set up your database');

																																$.append($$anchor, text_18);
																															},
																															$$slots: { default: true }
																														});
																													});

																													var div_22 = $.sibling(node_84, 2);
																													var node_85 = $.child(div_22);

																													Icon(node_85, {
																														get icon() {
																															return IconArrowRight;
																														},
																														size: 's'
																													});

																													$.reset(div_22);
																													$.append($$anchor, fragment_50);
																												},
																												$$slots: { default: true }
																											});
																										});

																										$.template_effect(() => styles_1 = $.set_style(div_21, '', styles_1, {
																											'background-image': `url('${$app().themeInUse === 'dark' ? DatabaseImgSourceDark : DatabaseImgSource}')`
																										}));

																										$.append($$anchor, fragment_49);
																									},
																									$$slots: { default: true }
																								});
																							});

																							$.append($$anchor, fragment_48);
																						},
																						$$slots: { default: true }
																					});
																				});

																				var node_86 = $.sibling(node_81, 2);

																				$.component(node_86, () => Card.Base, ($$anchor, Card_Base) => {
																					Card_Base($$anchor, {
																						padding: 's',
																						children: ($$anchor, $$slotProps) => {
																							var div_23 = root_16();
																							var node_87 = $.child(div_23);

																							$.component(node_87, () => Layout.Stack, ($$anchor, Layout_Stack_29) => {
																								Layout_Stack_29($$anchor, {
																									gap: 'xl',
																									justifyContent: 'space-between',
																									children: ($$anchor, $$slotProps) => {
																										var fragment_51 = root_4();
																										var node_88 = $.first_child(fragment_51);

																										$.component(node_88, () => Typography.Title, ($$anchor, Typography_Title_13) => {
																											Typography_Title_13($$anchor, {
																												size: 's',
																												children: ($$anchor, $$slotProps) => {
																													$.next();

																													var text_19 = $.text('Discover our docs');

																													$.append($$anchor, text_19);
																												},
																												$$slots: { default: true }
																											});
																										});

																										var node_89 = $.sibling(node_88, 2);

																										$.component(node_89, () => Layout.Stack, ($$anchor, Layout_Stack_30) => {
																											Layout_Stack_30($$anchor, {
																												direction: 'column',
																												gap: 's',
																												justifyContent: 'flex-end',
																												children: ($$anchor, $$slotProps) => {
																													var fragment_52 = root_15();
																													var node_90 = $.first_child(fragment_52);

																													$.component(node_90, () => Link.Anchor, ($$anchor, Link_Anchor) => {
																														Link_Anchor($$anchor, {
																															variant: 'quiet-muted',
																															href: 'https://appwrite.io/docs/references',
																															target: '_blank',
																															$$events: {
																																click: () => {
																																	trackEvent(Click.OnboardingApiReferencesClick);
																																}
																															},

																															children: ($$anchor, $$slotProps) => {
																																$.next();

																																var text_20 = $.text('API references');

																																$.append($$anchor, text_20);
																															},
																															$$slots: { default: true }
																														});
																													});

																													var node_91 = $.sibling(node_90, 2);

																													$.component(node_91, () => Link.Anchor, ($$anchor, Link_Anchor_1) => {
																														Link_Anchor_1($$anchor, {
																															variant: 'quiet-muted',
																															href: 'https://appwrite.io/docs/tutorials',
																															target: '_blank',
																															$$events: {
																																click: () => {
																																	trackEvent(Click.OnboardingTutorialsClick);
																																}
																															},

																															children: ($$anchor, $$slotProps) => {
																																$.next();

																																var text_21 = $.text('Tutorials');

																																$.append($$anchor, text_21);
																															},
																															$$slots: { default: true }
																														});
																													});

																													var node_92 = $.sibling(node_91, 2);

																													$.component(node_92, () => Link.Anchor, ($$anchor, Link_Anchor_2) => {
																														Link_Anchor_2($$anchor, {
																															variant: 'quiet-muted',
																															href: 'https://appwrite.io/docs/products/storage/quick-start',
																															target: '_blank',
																															$$events: {
																																click: () => {
																																	trackEvent(Click.OnboardingStorageQuickstartClick);
																																}
																															},

																															children: ($$anchor, $$slotProps) => {
																																$.next();

																																var text_22 = $.text('Storage quick start');

																																$.append($$anchor, text_22);
																															},
																															$$slots: { default: true }
																														});
																													});

																													var node_93 = $.sibling(node_92, 2);

																													$.component(node_93, () => Link.Anchor, ($$anchor, Link_Anchor_3) => {
																														Link_Anchor_3($$anchor, {
																															variant: 'quiet-muted',
																															href: 'https://appwrite.io/docs/products/functions/quick-start',
																															target: '_blank',
																															$$events: {
																																click: () => {
																																	trackEvent(Click.OnboardingFunctionsQuickstartClick);
																																}
																															},

																															children: ($$anchor, $$slotProps) => {
																																$.next();

																																var text_23 = $.text('Functions quick start');

																																$.append($$anchor, text_23);
																															},
																															$$slots: { default: true }
																														});
																													});

																													$.append($$anchor, fragment_52);
																												},
																												$$slots: { default: true }
																											});
																										});

																										$.append($$anchor, fragment_51);
																									},
																									$$slots: { default: true }
																								});
																							});

																							$.reset(div_23);
																							$.append($$anchor, div_23);
																						},
																						$$slots: { default: true }
																					});
																				});

																				$.append($$anchor, fragment_47);
																			},
																			$$slots: { default: true }
																		});
																	});
																}

																var node_94 = $.sibling(node_80, 2);

																{
																	let $0 = $.derived(() => $isSmallViewport() ? 'column' : 'row');

																	$.component(node_94, () => Layout.Stack, ($$anchor, Layout_Stack_31) => {
																		Layout_Stack_31($$anchor, {
																			gap: 'l',
																			get direction() {
																				return $.get($0);
																			},

																			children: ($$anchor, $$slotProps) => {
																				var div_24 = root_18();
																				var node_95 = $.child(div_24);

																				$.component(node_95, () => Card.Base, ($$anchor, Card_Base_1) => {
																					Card_Base_1($$anchor, {
																						padding: 's',
																						children: ($$anchor, $$slotProps) => {
																							var div_25 = root_16();
																							var node_96 = $.child(div_25);

																							{
																								let $0 = $.derived(() => $isSmallViewport() ? 'column' : 'row');

																								$.component(node_96, () => Layout.Stack, ($$anchor, Layout_Stack_32) => {
																									Layout_Stack_32($$anchor, {
																										get direction() {
																											return $.get($0);
																										},

																										children: ($$anchor, $$slotProps) => {
																											var fragment_53 = root_17();
																											var node_97 = $.first_child(fragment_53);

																											{
																												let $0 = $.derived(() => `flex: ${$isSmallViewport() ? '1 1 auto' : '0 0 30%'}; min-width: ${$isSmallViewport() ? 'auto' : '240px'}`);

																												$.component(node_97, () => Layout.Stack, ($$anchor, Layout_Stack_33) => {
																													Layout_Stack_33($$anchor, {
																														gap: 'xl',
																														justifyContent: 'space-between',
																														get style() {
																															return $.get($0);
																														},

																														children: ($$anchor, $$slotProps) => {
																															var fragment_54 = root_4();
																															var node_98 = $.first_child(fragment_54);

																															$.component(node_98, () => Typography.Title, ($$anchor, Typography_Title_14) => {
																																Typography_Title_14($$anchor, {
																																	size: 's',
																																	children: ($$anchor, $$slotProps) => {
																																		$.next();

																																		var text_24 = $.text('Set up Auth');

																																		$.append($$anchor, text_24);
																																	},
																																	$$slots: { default: true }
																																});
																															});

																															var node_99 = $.sibling(node_98, 2);

																															$.component(node_99, () => Layout.Stack, ($$anchor, Layout_Stack_34) => {
																																Layout_Stack_34($$anchor, {
																																	direction: 'column',
																																	gap: 's',
																																	justifyContent: 'flex-end',
																																	children: ($$anchor, $$slotProps) => {
																																		var fragment_55 = root_8();
																																		var node_100 = $.first_child(fragment_55);

																																		{
																																			let $0 = $.derived(() => `${$.get(projectRoute)}/auth/settings`);

																																			$.component(node_100, () => Link.Anchor, ($$anchor, Link_Anchor_4) => {
																																				Link_Anchor_4($$anchor, {
																																					variant: 'quiet-muted',
																																					get href() {
																																						return $.get($0);
																																					},

																																					$$events: {
																																						click: () => {
																																							trackEvent(Click.OnboardingAuthEmailPasswordClick);
																																						}
																																					},

																																					children: ($$anchor, $$slotProps) => {
																																						$.next();

																																						var text_25 = $.text('E-mail and password');

																																						$.append($$anchor, text_25);
																																					},
																																					$$slots: { default: true }
																																				});
																																			});
																																		}

																																		var node_101 = $.sibling(node_100, 2);

																																		{
																																			let $0 = $.derived(() => `${$.get(projectRoute)}/auth/settings`);

																																			$.component(node_101, () => Link.Anchor, ($$anchor, Link_Anchor_5) => {
																																				Link_Anchor_5($$anchor, {
																																					variant: 'quiet-muted',
																																					get href() {
																																						return $.get($0);
																																					},

																																					$$events: {
																																						click: () => {
																																							trackEvent(Click.OnboardingAuthOauth2Click);
																																						}
																																					},

																																					children: ($$anchor, $$slotProps) => {
																																						$.next();

																																						var text_26 = $.text('OAuth 2');

																																						$.append($$anchor, text_26);
																																					},
																																					$$slots: { default: true }
																																				});
																																			});
																																		}

																																		var node_102 = $.sibling(node_101, 2);

																																		{
																																			let $0 = $.derived(() => `${$.get(projectRoute)}/auth/settings`);

																																			$.component(node_102, () => Link.Anchor, ($$anchor, Link_Anchor_6) => {
																																				Link_Anchor_6($$anchor, {
																																					variant: 'quiet-muted',
																																					get href() {
																																						return $.get($0);
																																					},

																																					$$events: {
																																						click: () => {
																																							trackEvent(Click.OnboardingAuthAllMethodsClick);
																																						}
																																					},

																																					children: ($$anchor, $$slotProps) => {
																																						$.next();

																																						var text_27 = $.text('View all methods');

																																						$.append($$anchor, text_27);
																																					},
																																					$$slots: { default: true }
																																				});
																																			});
																																		}

																																		$.append($$anchor, fragment_55);
																																	},
																																	$$slots: { default: true }
																																});
																															});

																															$.append($$anchor, fragment_54);
																														},
																														$$slots: { default: true }
																													});
																												});
																											}

																											var div_26 = $.sibling(node_97, 2);
																											let styles_2;

																											$.template_effect(() => styles_2 = $.set_style(div_26, 'flex: 1 1 auto', styles_2, {
																												'background-image': `url('${$app().themeInUse === 'dark' ? AuthPreviewDark : AuthPreview}')`
																											}));

																											$.append($$anchor, fragment_53);
																										},
																										$$slots: { default: true }
																									});
																								});
																							}

																							$.reset(div_25);
																							$.append($$anchor, div_25);
																						},
																						$$slots: { default: true }
																					});
																				});

																				$.reset(div_24);
																				$.append($$anchor, div_24);
																			},
																			$$slots: { default: true }
																		});
																	});
																}

																var node_103 = $.sibling(node_94, 2);

																{
																	let $0 = $.derived(() => $isSmallViewport() ? 'column' : 'row');

																	$.component(node_103, () => Layout.Stack, ($$anchor, Layout_Stack_35) => {
																		Layout_Stack_35($$anchor, {
																			gap: 'l',
																			get direction() {
																				return $.get($0);
																			},

																			children: ($$anchor, $$slotProps) => {
																				var fragment_56 = root_4();
																				var node_104 = $.first_child(fragment_56);

																				{
																					let $0 = $.derived(() => `flex: ${$isSmallViewport() ? '1 1 auto' : '1 1 70%'};`);

																					$.component(node_104, () => Card.Base, ($$anchor, Card_Base_2) => {
																						Card_Base_2($$anchor, {
																							padding: 's',
																							get style() {
																								return $.get($0);
																							},

																							children: ($$anchor, $$slotProps) => {
																								var div_27 = root_16();
																								var node_105 = $.child(div_27);

																								$.component(node_105, () => Layout.Stack, ($$anchor, Layout_Stack_36) => {
																									Layout_Stack_36($$anchor, {
																										gap: 'xl',
																										justifyContent: 'space-between',
																										children: ($$anchor, $$slotProps) => {
																											var fragment_57 = root_4();
																											var node_106 = $.first_child(fragment_57);

																											$.component(node_106, () => Layout.Stack, ($$anchor, Layout_Stack_37) => {
																												Layout_Stack_37($$anchor, {
																													gap: 's',
																													children: ($$anchor, $$slotProps) => {
																														var fragment_58 = root_4();
																														var node_107 = $.first_child(fragment_58);

																														$.component(node_107, () => Typography.Title, ($$anchor, Typography_Title_15) => {
																															Typography_Title_15($$anchor, {
																																color: '--fgcolor-neutral-secondary',
																																size: 's',
																																children: ($$anchor, $$slotProps) => {
																																	$.next();

																																	var text_28 = $.text('MCP server');

																																	$.append($$anchor, text_28);
																																},
																																$$slots: { default: true }
																															});
																														});

																														var node_108 = $.sibling(node_107, 2);

																														$.component(node_108, () => Typography.Text, ($$anchor, Typography_Text_1) => {
																															Typography_Text_1($$anchor, {
																																color: '--fgcolor-neutral-secondary',
																																children: ($$anchor, $$slotProps) => {
																																	$.next();

																																	var fragment_59 = root_19();
																																	var node_109 = $.sibling($.first_child(fragment_59));

																																	$.component(node_109, () => Link.Anchor, ($$anchor, Link_Anchor_7) => {
																																		Link_Anchor_7($$anchor, {
																																			href: 'https://appwrite.io/docs/tooling/ai/mcp-servers',
																																			target: '_blank',
																																			children: ($$anchor, $$slotProps) => {
																																				$.next();

																																				var text_29 = $.text('docs');

																																				$.append($$anchor, text_29);
																																			},
																																			$$slots: { default: true }
																																		});
																																	});

																																	$.next();
																																	$.append($$anchor, fragment_59);
																																},
																																$$slots: { default: true }
																															});
																														});

																														$.append($$anchor, fragment_58);
																													},
																													$$slots: { default: true }
																												});
																											});

																											var node_110 = $.sibling(node_106, 2);

																											$.component(node_110, () => Layout.Stack, ($$anchor, Layout_Stack_38) => {
																												Layout_Stack_38($$anchor, {
																													gap: 's',
																													children: ($$anchor, $$slotProps) => {
																														var fragment_60 = root_4();
																														var node_111 = $.first_child(fragment_60);

																														$.component(node_111, () => Typography.Text, ($$anchor, Typography_Text_2) => {
																															Typography_Text_2($$anchor, {
																																color: '--fgcolor-neutral-tertiary',
																																size: 's',
																																children: ($$anchor, $$slotProps) => {
																																	$.next();

																																	var text_30 = $.text('Quick install');

																																	$.append($$anchor, text_30);
																																},
																																$$slots: { default: true }
																															});
																														});

																														var node_112 = $.sibling(node_111, 2);

																														$.component(node_112, () => Layout.Stack, ($$anchor, Layout_Stack_39) => {
																															Layout_Stack_39($$anchor, {
																																direction: 'row',
																																gap: 's',
																																wrap: 'wrap',
																																children: ($$anchor, $$slotProps) => {
																																	var fragment_61 = $.comment();
																																	var node_113 = $.first_child(fragment_61);

																																	$.each(node_113, 17, () => mcpTools, $.index, ($$anchor, tool) => {
																																		var fragment_62 = $.comment();
																																		var node_114 = $.first_child(fragment_62);

																																		$.component(node_114, () => Button.Anchor, ($$anchor, Button_Anchor) => {
																																			Button_Anchor($$anchor, {
																																				get href() {
																																					return $.get(tool).href;
																																				},
																																				target: '_blank',
																																				rel: 'noreferrer',
																																				size: 's',
																																				variant: 'secondary',
																																				children: ($$anchor, $$slotProps) => {
																																					$.next();

																																					var text_31 = $.text();

																																					$.template_effect(() => $.set_text(text_31, $.get(tool).label));
																																					$.append($$anchor, text_31);
																																				},

																																				$$slots: {
																																					default: true,
																																					start: ($$anchor, $$slotProps) => {
																																						Icon($$anchor, {
																																							slot: 'start',
																																							get icon() {
																																								return $.get(tool).icon;
																																							},
																																							size: 'xs'
																																						});
																																					}
																																				}
																																			});
																																		});

																																		$.append($$anchor, fragment_62);
																																	});

																																	$.append($$anchor, fragment_61);
																																},
																																$$slots: { default: true }
																															});
																														});

																														$.append($$anchor, fragment_60);
																													},
																													$$slots: { default: true }
																												});
																											});

																											$.append($$anchor, fragment_57);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.reset(div_27);
																								$.append($$anchor, div_27);
																							},
																							$$slots: { default: true }
																						});
																					});
																				}

																				var node_115 = $.sibling(node_104, 2);

																				{
																					let $0 = $.derived(() => `flex: ${$isSmallViewport() ? '1 1 auto' : '1 1 28%'};`);

																					$.component(node_115, () => Card.Link, ($$anchor, Card_Link) => {
																						Card_Link($$anchor, {
																							href: 'https://appwrite.io/discord',
																							padding: 's',
																							get style() {
																								return $.get($0);
																							},

																							$$events: {
																								click: () => {
																									trackEvent(Click.OnboardingDiscordClick);
																								}
																							},

																							children: ($$anchor, $$slotProps) => {
																								var div_28 = root_16();
																								var node_116 = $.child(div_28);

																								$.component(node_116, () => Layout.Stack, ($$anchor, Layout_Stack_40) => {
																									Layout_Stack_40($$anchor, {
																										gap: 'xs',
																										justifyContent: 'space-between',
																										children: ($$anchor, $$slotProps) => {
																											var fragment_65 = root_4();
																											var node_117 = $.first_child(fragment_65);

																											$.component(node_117, () => Layout.Stack, ($$anchor, Layout_Stack_41) => {
																												Layout_Stack_41($$anchor, {
																													direction: 'row',
																													alignItems: 'center',
																													justifyContent: 'space-between',
																													class: 'discord-header',
																													children: ($$anchor, $$slotProps) => {
																														var fragment_66 = root_21();
																														var node_118 = $.first_child(fragment_66);

																														$.component(node_118, () => Layout.Stack, ($$anchor, Layout_Stack_42) => {
																															Layout_Stack_42($$anchor, {
																																direction: 'row',
																																alignItems: 'flex-start',
																																gap: 'xs',
																																children: ($$anchor, $$slotProps) => {
																																	var fragment_67 = root_20();
																																	var img_3 = $.first_child(fragment_67);
																																	var node_119 = $.sibling(img_3, 2);

																																	$.component(node_119, () => Typography.Title, ($$anchor, Typography_Title_16) => {
																																		Typography_Title_16($$anchor, {
																																			size: 's',
																																			children: ($$anchor, $$slotProps) => {
																																				$.next();

																																				var text_32 = $.text('Discord');

																																				$.append($$anchor, text_32);
																																			},
																																			$$slots: { default: true }
																																		});
																																	});

																																	$.template_effect(() => $.set_attribute(img_3, 'src', $app().themeInUse === 'dark' ? DiscordImgSourceDark : DiscordImgSource));
																																	$.append($$anchor, fragment_67);
																																},
																																$$slots: { default: true }
																															});
																														});

																														var div_29 = $.sibling(node_118, 2);
																														var node_120 = $.child(div_29);

																														Icon(node_120, {
																															get icon() {
																																return IconArrowRight;
																															},
																															size: 's'
																														});

																														$.reset(div_29);
																														$.append($$anchor, fragment_66);
																													},
																													$$slots: { default: true }
																												});
																											});

																											var node_121 = $.sibling(node_117, 2);

																											$.component(node_121, () => Layout.Stack, ($$anchor, Layout_Stack_43) => {
																												Layout_Stack_43($$anchor, {
																													direction: 'row',
																													alignItems: 'flex-end',
																													justifyContent: 'space-between',
																													children: ($$anchor, $$slotProps) => {
																														var fragment_68 = $.comment();
																														var node_122 = $.first_child(fragment_68);

																														$.component(node_122, () => Typography.Text, ($$anchor, Typography_Text_3) => {
																															Typography_Text_3($$anchor, {
																																size: 'm',
																																color: '--fgcolor-neutral-secondary',
																																children: ($$anchor, $$slotProps) => {
																																	$.next();

																																	var text_33 = $.text('Join our Discord for support, tips and\n                                                        product updates');

																																	$.append($$anchor, text_33);
																																},
																																$$slots: { default: true }
																															});
																														});

																														$.append($$anchor, fragment_68);
																													},
																													$$slots: { default: true }
																												});
																											});

																											$.append($$anchor, fragment_65);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.reset(div_28);
																								$.append($$anchor, div_28);
																							},
																							$$slots: { default: true }
																						});
																					});
																				}

																				$.append($$anchor, fragment_56);
																			},
																			$$slots: { default: true }
																		});
																	});
																}

																$.append($$anchor, fragment_46);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_44);
												},
												$$slots: { default: true }
											});
										});
									}

									$.append($$anchor, fragment_43);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_42);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_41);
		};

		$.if(node, ($$render) => {
			if (platforms().length === 0 || pingCount() === 0) $$render(consequent_10); else $$render(alternate_5, -1);
		});
	}

	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}