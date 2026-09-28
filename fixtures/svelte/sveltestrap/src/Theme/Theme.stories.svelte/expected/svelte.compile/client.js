import 'svelte/internal/disclose-version';
import Theme from './Theme.svelte';
import * as $ from 'svelte/internal/client';
import { Story } from '@storybook/addon-svelte-csf';

import {
	Button,
	Card,
	CardBody,
	CardHeader,
	CardFooter,
	CardSubtitle,
	CardText,
	CardTitle,
	Toast,
	ThemeToggler,
	Icon,
	colorMode,
	useColorMode
} from '@sveltestrap/sveltestrap';

export const meta = { title: 'Stories/Theme', component: Theme };

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`light <!>`, 1);
var root_3 = $.from_html(`dark <!>`, 1);
var root_4 = $.from_html(`auto <!>`, 1);
var root_5 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Theme_stories($$anchor, $$props) {
	$.push($$props, true);

	const $colorMode = () => $.store_get(colorMode, '$colorMode', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	var fragment = root_5();
	var node = $.first_child(fragment);

	Story(node, {
		name: 'Basic',
		children: ($$anchor, $$slotProps) => {
			Theme($$anchor, {
				theme: 'dark',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node_1 = $.first_child(fragment_2);

					Card(node_1, {
						class: 'mb-3',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_2 = $.first_child(fragment_3);

							CardHeader(node_2, {
								children: ($$anchor, $$slotProps) => {
									CardTitle($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text('Dark Theme');

											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							var node_3 = $.sibling(node_2, 2);

							CardBody(node_3, {
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root();
									var node_4 = $.first_child(fragment_5);

									CardSubtitle(node_4, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text('Card subtitle');

											$.append($$anchor, text_1);
										},
										$$slots: { default: true }
									});

									var node_5 = $.sibling(node_4, 2);

									CardText(node_5, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text('Some quick example text to build on the card title and make up the bulk of the card\'s content.');

											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});

									var node_6 = $.sibling(node_5, 2);

									Button(node_6, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_3 = $.text('Button');

											$.append($$anchor, text_3);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});

							var node_7 = $.sibling(node_3, 2);

							CardFooter(node_7, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Footer');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_1, 2);

					Toast(node_8, {
						body: true,
						header: 'Dark Theme',
						style: '--bs-toast-color: #fff;',
						isOpen: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore\n      magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo\n      consequat.');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node, 2);

	Story(node_9, {
		name: 'Hook',
		children: ($$anchor, $$slotProps) => {
			var fragment_6 = root();
			var node_10 = $.first_child(fragment_6);

			{
				let $0 = $.derived(() => $colorMode() === 'light');

				Button(node_10, {
					color: 'primary',
					outline: true,
					get active() {
						return $.get($0);
					},
					$$events: { click: () => useColorMode('light') },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var fragment_7 = root_2();
						var node_11 = $.sibling($.first_child(fragment_7));

						Icon(node_11, { name: 'sun-fill' });
						$.append($$anchor, fragment_7);
					},
					$$slots: { default: true }
				});
			}

			var node_12 = $.sibling(node_10, 2);

			{
				let $0 = $.derived(() => $colorMode() === 'dark');

				Button(node_12, {
					color: 'primary',
					outline: true,
					get active() {
						return $.get($0);
					},
					$$events: { click: () => useColorMode('dark') },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var fragment_8 = root_3();
						var node_13 = $.sibling($.first_child(fragment_8));

						Icon(node_13, { name: 'moon-stars-fill' });
						$.append($$anchor, fragment_8);
					},
					$$slots: { default: true }
				});
			}

			var node_14 = $.sibling(node_12, 2);

			{
				let $0 = $.derived(() => $colorMode() === 'auto');

				Button(node_14, {
					color: 'primary',
					outline: true,
					get active() {
						return $.get($0);
					},
					$$events: { click: () => useColorMode('auto') },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var fragment_9 = root_4();
						var node_15 = $.sibling($.first_child(fragment_9));

						Icon(node_15, { name: 'circle-half' });
						$.append($$anchor, fragment_9);
					},
					$$slots: { default: true }
				});
			}

			$.append($$anchor, fragment_6);
		},
		$$slots: { default: true }
	});

	var node_16 = $.sibling(node_9, 2);

	Story(node_16, {
		name: 'Store',
		children: ($$anchor, $$slotProps) => {
			var fragment_10 = root();
			var node_17 = $.first_child(fragment_10);

			{
				let $0 = $.derived(() => $colorMode() === 'light');

				Button(node_17, {
					color: 'primary',
					outline: true,
					get active() {
						return $.get($0);
					},
					$$events: { click: () => $.store_set(colorMode, 'light') },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var fragment_11 = root_2();
						var node_18 = $.sibling($.first_child(fragment_11));

						Icon(node_18, { name: 'sun-fill' });
						$.append($$anchor, fragment_11);
					},
					$$slots: { default: true }
				});
			}

			var node_19 = $.sibling(node_17, 2);

			{
				let $0 = $.derived(() => $colorMode() === 'dark');

				Button(node_19, {
					color: 'primary',
					outline: true,
					get active() {
						return $.get($0);
					},
					$$events: { click: () => $.store_set(colorMode, 'dark') },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var fragment_12 = root_3();
						var node_20 = $.sibling($.first_child(fragment_12));

						Icon(node_20, { name: 'moon-stars-fill' });
						$.append($$anchor, fragment_12);
					},
					$$slots: { default: true }
				});
			}

			var node_21 = $.sibling(node_19, 2);

			{
				let $0 = $.derived(() => $colorMode() === 'auto');

				Button(node_21, {
					color: 'primary',
					outline: true,
					get active() {
						return $.get($0);
					},
					$$events: { click: () => $.store_set(colorMode, 'auto') },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var fragment_13 = root_4();
						var node_22 = $.sibling($.first_child(fragment_13));

						Icon(node_22, { name: 'circle-half' });
						$.append($$anchor, fragment_13);
					},
					$$slots: { default: true }
				});
			}

			$.append($$anchor, fragment_10);
		},
		$$slots: { default: true }
	});

	var node_23 = $.sibling(node_16, 2);

	Story(node_23, {
		name: 'Toggler',
		children: ($$anchor, $$slotProps) => {
			var fragment_14 = root_1();
			var node_24 = $.first_child(fragment_14);

			ThemeToggler(node_24, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const currentColorMode = $.derived(() => $$slotProps.currentColorMode);
						const toggleColorMode = $.derived(() => $$slotProps.toggleColorMode);

						Button($$anchor, {
							color: 'primary',
							$$events: { click: () => $.get(toggleColorMode)() },
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_6 = $.text();

								$.template_effect(() => $.set_text(text_6, `Toggle Theme: ${$.get(currentColorMode) ?? ''}`));
								$.append($$anchor, text_6);
							},
							$$slots: { default: true }
						});
					}
				}
			});

			var node_25 = $.sibling(node_24, 2);

			Card(node_25, {
				class: 'mt-3',
				children: ($$anchor, $$slotProps) => {
					var fragment_17 = root();
					var node_26 = $.first_child(fragment_17);

					CardHeader(node_26, {
						children: ($$anchor, $$slotProps) => {
							CardTitle($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_7 = $.text('Dark Theme');

									$.append($$anchor, text_7);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_27 = $.sibling(node_26, 2);

					CardBody(node_27, {
						children: ($$anchor, $$slotProps) => {
							var fragment_19 = root();
							var node_28 = $.first_child(fragment_19);

							CardSubtitle(node_28, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_8 = $.text('Card subtitle');

									$.append($$anchor, text_8);
								},
								$$slots: { default: true }
							});

							var node_29 = $.sibling(node_28, 2);

							CardText(node_29, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_9 = $.text('Some quick example text to build on the card title and make up the bulk of the card\'s content.');

									$.append($$anchor, text_9);
								},
								$$slots: { default: true }
							});

							var node_30 = $.sibling(node_29, 2);

							Button(node_30, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_10 = $.text('Button');

									$.append($$anchor, text_10);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_19);
						},
						$$slots: { default: true }
					});

					var node_31 = $.sibling(node_27, 2);

					CardFooter(node_31, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_11 = $.text('Footer');

							$.append($$anchor, text_11);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_17);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_14);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}