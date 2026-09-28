import * as $ from 'svelte/internal/server';
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

export default function IconRendererUsage_stories($$renderer) {
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

	Meta($$renderer, {
		title: 'Components/IconRenderer/Usage',
		component: IconRenderer,
		parameters: { controls: { exclude: /.*/g, hideNoControlsWarning: true } }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Alert',
		id: 'iconRendererAlertStory',
		children: ($$renderer) => {
			Alert($$renderer, {
				icon: InfoCircled,
				title: 'Example 1',
				children: ($$renderer) => {
					$$renderer.push(`<!---->This alert uses a Svelte component for it's icon`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <br/> `);

			Alert($$renderer, {
				icon: iconSvg,
				title: 'Example 2',
				children: ($$renderer) => {
					$$renderer.push(`<!---->This alert uses an SVG element for it's icon`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Button',
		id: 'iconRendererButtonStory',
		children: ($$renderer) => {
			Button($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Button with Svelte component icon`);
				},

				$$slots: {
					default: true,
					leftIcon: ($$renderer) => {
						IconRenderer($$renderer, { slot: 'leftIcon', icon: InfoCircled });
					}
				}
			});

			$$renderer.push(`<!----> <br/> `);

			Button($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Button with SVG icon`);
				},

				$$slots: {
					default: true,
					leftIcon: ($$renderer) => {
						IconRenderer($$renderer, { slot: 'leftIcon', icon: iconSvg });
					}
				}
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Input',
		id: 'iconRendererInputStory',
		children: ($$renderer) => {
			Input($$renderer, { icon: InfoCircled, placeholder: 'Search' });
			$$renderer.push(`<!----> <br/> `);
			Input($$renderer, { icon: iconSvg, placeholder: 'Search' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'MenuItem',
		id: 'iconRendererMenuItemStory',
		children: ($$renderer) => {
			Menu($$renderer, {
				children: ($$renderer) => {
					MenuItem($$renderer, {
						icon: InfoCircled,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Svelte component`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					MenuItem($$renderer, {
						icon: iconSvg,
						children: ($$renderer) => {
							$$renderer.push(`<!---->SVG Element`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},

				$$slots: {
					default: true,
					control: ($$renderer) => {
						$$renderer.push(`<div slot="control">Click Me</div>`);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Notification',
		id: 'iconRendererNotificationStory',
		children: ($$renderer) => {
			Notification($$renderer, {
				title: 'Svelte Component',
				icon: InfoCircled,
				children: ($$renderer) => {
					$$renderer.push(`<!---->A notification with an Svelte component icon`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <br/> `);

			Notification($$renderer, {
				title: 'SVG element',
				icon: iconSvg,
				children: ($$renderer) => {
					$$renderer.push(`<!---->A notification with an SVG element icon`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Tabs',
		id: 'iconRendererTabsStory',
		children: ($$renderer) => {
			Tabs($$renderer, {
				children: ($$renderer) => {
					Tab($$renderer, {
						label: 'Svelte Component',
						icon: InfoCircled,
						children: ($$renderer) => {
							$$renderer.push(`<!---->A tab with an Svelte component icon`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Tab($$renderer, {
						label: 'SVG element',
						icon: iconSvg,
						children: ($$renderer) => {
							$$renderer.push(`<!---->A tab with an SVG element icon`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}