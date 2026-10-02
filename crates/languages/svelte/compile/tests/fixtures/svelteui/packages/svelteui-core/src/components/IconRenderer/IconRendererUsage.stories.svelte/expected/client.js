import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Meta, Story } from '@storybook/addon-svelte-csf';
import { InfoCircled } from 'radix-icons-svelte';
import Alert from '../Alert/Alert.svelte';
import Button from '../Button/Button.svelte';
import Input from '../Input/Input.svelte';
import Menu from '../Menu/Menu.svelte';
import MenuItem from '../Menu/MenuItem/MenuItem.svelte';
import Notification from '../Notification/Notification.svelte';
import Tab from '../Tabs/Tab/Tab.svelte';
import Tabs from '../Tabs/Tabs.svelte';
import IconRenderer from './IconRenderer.svelte';

var root = $.from_html(`<!> <br/> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div slot="control">Click Me</div>`);
var root_3 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function IconRendererUsage_stories($$anchor) {
	const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	const iconPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');

	iconSvg.setAttribute('fill', 'none');
	iconSvg.setAttribute('viewBox', '0 0 24 24');
	iconSvg.setAttribute('stroke', 'currentColor');
	iconSvg.classList.add('post-icon');
	iconPath.setAttribute('d', 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1');
	iconPath.setAttribute('stroke-linecap', 'round');
	iconPath.setAttribute('stroke-linejoin', 'round');
	iconPath.setAttribute('stroke-width', '2');
	iconSvg.appendChild(iconPath);

	var fragment = root_3();
	var node = $.first_child(fragment);

	Meta(node, {
		title: 'Components/IconRenderer/Usage',
		get component() {
			return IconRenderer;
		},
		parameters: { controls: { exclude: /.*/g, hideNoControlsWarning: true } }
	});

	var node_1 = $.sibling(node, 2);

	Story(node_1, {
		name: 'Alert',
		id: 'iconRendererAlertStory',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_2 = $.first_child(fragment_1);

			Alert(node_2, {
				get icon() {
					return InfoCircled;
				},
				title: 'Example 1',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('This alert uses a Svelte component for it\'s icon');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 4);

			Alert(node_3, {
				get icon() {
					return iconSvg;
				},
				title: 'Example 2',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('This alert uses an SVG element for it\'s icon');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_1, 2);

	Story(node_4, {
		name: 'Button',
		id: 'iconRendererButtonStory',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root();
			var node_5 = $.first_child(fragment_2);

			Button(node_5, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Button with Svelte component icon');

					$.append($$anchor, text_2);
				},

				$$slots: {
					default: true,
					leftIcon: ($$anchor, $$slotProps) => {
						IconRenderer($$anchor, {
							slot: 'leftIcon',
							get icon() {
								return InfoCircled;
							}
						});
					}
				}
			});

			var node_6 = $.sibling(node_5, 4);

			Button(node_6, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Button with SVG icon');

					$.append($$anchor, text_3);
				},

				$$slots: {
					default: true,
					leftIcon: ($$anchor, $$slotProps) => {
						IconRenderer($$anchor, {
							slot: 'leftIcon',
							get icon() {
								return iconSvg;
							}
						});
					}
				}
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_4, 2);

	Story(node_7, {
		name: 'Input',
		id: 'iconRendererInputStory',
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root();
			var node_8 = $.first_child(fragment_5);

			Input(node_8, {
				get icon() {
					return InfoCircled;
				},
				placeholder: 'Search'
			});

			var node_9 = $.sibling(node_8, 4);

			Input(node_9, {
				get icon() {
					return iconSvg;
				},
				placeholder: 'Search'
			});

			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_7, 2);

	Story(node_10, {
		name: 'MenuItem',
		id: 'iconRendererMenuItemStory',
		children: ($$anchor, $$slotProps) => {
			Menu($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_7 = root_1();
					var node_11 = $.first_child(fragment_7);

					MenuItem(node_11, {
						get icon() {
							return InfoCircled;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Svelte component');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					var node_12 = $.sibling(node_11, 2);

					MenuItem(node_12, {
						get icon() {
							return iconSvg;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('SVG Element');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_7);
				},

				$$slots: {
					default: true,
					control: ($$anchor, $$slotProps) => {
						var div = root_2();

						$.append($$anchor, div);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_13 = $.sibling(node_10, 2);

	Story(node_13, {
		name: 'Notification',
		id: 'iconRendererNotificationStory',
		children: ($$anchor, $$slotProps) => {
			var fragment_8 = root();
			var node_14 = $.first_child(fragment_8);

			Notification(node_14, {
				title: 'Svelte Component',
				get icon() {
					return InfoCircled;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('A notification with an Svelte component icon');

					$.append($$anchor, text_6);
				},
				$$slots: { default: true }
			});

			var node_15 = $.sibling(node_14, 4);

			Notification(node_15, {
				title: 'SVG element',
				get icon() {
					return iconSvg;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_7 = $.text('A notification with an SVG element icon');

					$.append($$anchor, text_7);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_8);
		},
		$$slots: { default: true }
	});

	var node_16 = $.sibling(node_13, 2);

	Story(node_16, {
		name: 'Tabs',
		id: 'iconRendererTabsStory',
		children: ($$anchor, $$slotProps) => {
			Tabs($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_10 = root_1();
					var node_17 = $.first_child(fragment_10);

					Tab(node_17, {
						label: 'Svelte Component',
						get icon() {
							return InfoCircled;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_8 = $.text('A tab with an Svelte component icon');

							$.append($$anchor, text_8);
						},
						$$slots: { default: true }
					});

					var node_18 = $.sibling(node_17, 2);

					Tab(node_18, {
						label: 'SVG element',
						get icon() {
							return iconSvg;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_9 = $.text('A tab with an SVG element icon');

							$.append($$anchor, text_9);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_10);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}