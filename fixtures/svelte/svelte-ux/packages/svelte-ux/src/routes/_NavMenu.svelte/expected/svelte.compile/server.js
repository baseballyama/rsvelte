import * as $ from 'svelte/internal/server';
import { NavItem } from 'svelte-ux';
import { entries } from '@layerstack/utils';
import { page } from '$app/stores';

import {
	mdiCog,
	mdiFormatListBulleted,
	mdiHome,
	mdiPalette,
	mdiOpenInNew
} from '@mdi/js';

export default function _NavMenu($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		const components = {
			App: [
				'AppBar',
				'AppLayout',
				'NavItem',
				'Settings',
				'ThemeInit',
				'ThemeSelect',
				'ThemeSwitch'
			],
			Elements: ['Avatar', 'Button', 'ButtonGroup', 'Card', 'Icon'],
			Inputs: [
				'Checkbox',
				'Field',
				'Input',
				'MultiSelect',
				'MultiSelectField',
				'MultiSelectMenu',
				'NumberStepper',
				'Radio',
				'RangeField',
				'RangeSlider',
				'SelectField',
				'Switch',
				'TextField',
				'ToggleGroup'
			],
			Navigation: [
				'Breadcrumb',
				'Paginate',
				'Pagination',
				'TableOfContents',
				'Tabs',
				'TreeList'
			],
			Layout: [
				'Collapse',
				'ExpansionPanel',
				'Grid',
				{ label: 'Grid (classes)', value: 'GridTailwind' },
				'InfiniteScroll',
				'Lazy',
				'ListItem',
				'Overflow',
				'Overlay',
				'ScrollContainer',
				'Stack',
				{ label: 'Stack (classes)', value: 'StackTailwind' },
				'Steps',
				'Table',
				'Timeline'
			],
			Modal: [
				'Dialog',
				'Drawer',
				'Menu',
				'MenuButton',
				'MenuField',
				'MenuItem',
				'ResponsiveMenu',
				'Notification',
				'Popover',
				'Tooltip'
			],
			Feedback: ['Badge', 'Progress', 'ProgressCircle'],
			Visualization: ['BarStack'],
			Date: [
				'DateField',
				'DatePickerField',
				'DateRange',
				'DateRangeField',
				'Duration',
				'Month',
				'MonthList',
				'MonthListByYear',
				'YearList'
			],
			State: [
				'Form',
				'Selection',
				'State',
				'StoreSubscribe',
				'Toggle',
				'ToggleButton'
			],
			Motion: ['ScrollingValue', 'SpringValue', 'Tilt', 'TweenedValue'],
			Effects: ['Gooey', 'Shine'],
			Other: ['CopyButton']
		};

		NavItem($$renderer, {
			text: 'Getting Started',
			icon: mdiHome,
			currentUrl: $.store_get($$store_subs ??= {}, '$page', page).url,
			path: '/'
		});

		$$renderer.push(`<!----> `);

		NavItem($$renderer, {
			text: 'Customization',
			icon: mdiCog,
			currentUrl: $.store_get($$store_subs ??= {}, '$page', page).url,
			path: '/customization'
		});

		$$renderer.push(`<!----> `);

		NavItem($$renderer, {
			text: 'Theme',
			icon: mdiPalette,
			currentUrl: $.store_get($$store_subs ??= {}, '$page', page).url,
			path: '/theme'
		});

		$$renderer.push(`<!----> `);

		NavItem($$renderer, {
			text: 'Changelog',
			icon: mdiFormatListBulleted,
			currentUrl: $.store_get($$store_subs ??= {}, '$page', page).url,
			path: '/changelog'
		});

		$$renderer.push(`<!----> <h1>Components</h1> <!--[-->`);

		const each_array = $.ensure_array_like(entries(components));

		for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
			let [header, items] = each_array[$$index_1];

			$$renderer.push(`<h2>${$.escape(header)}</h2> <!--[-->`);

			const each_array_1 = $.ensure_array_like(items);

			for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
				let item = each_array_1[$$index];

				if (typeof item === 'object') {
					$$renderer.push('<!--[0-->');

					NavItem($$renderer, {
						text: item.label,
						currentUrl: $.store_get($$store_subs ??= {}, '$page', page).url,
						path: `/docs/components/${$.stringify(item.value)}`
					});
				} else {
					$$renderer.push('<!--[-1-->');

					NavItem($$renderer, {
						text: item,
						currentUrl: $.store_get($$store_subs ??= {}, '$page', page).url,
						path: `/docs/components/${$.stringify(item)}`
					});
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--> <h1>Charts</h1> `);

		NavItem($$renderer, {
			text: 'LayerChart',
			icon: mdiOpenInNew,
			currentUrl: $.store_get($$store_subs ??= {}, '$page', page).url,
			path: 'https://www.layerchart.com',
			target: '_blank'
		});

		$$renderer.push(`<!----> <h1>Actions</h1> `);

		NavItem($$renderer, {
			text: '@layerstack/svelte-actions',
			icon: mdiOpenInNew,
			currentUrl: $.store_get($$store_subs ??= {}, '$page', page).url,
			path: 'https://www.layerstack.dev/docs/svelte-actions',
			target: '_blank'
		});

		$$renderer.push(`<!----> `);

		NavItem($$renderer, {
			text: '@layerstack/svelte-table',
			icon: mdiOpenInNew,
			currentUrl: $.store_get($$store_subs ??= {}, '$page', page).url,
			path: 'https://www.layerstack.dev/docs/svelte-table/actions',
			target: '_blank'
		});

		$$renderer.push(`<!----> <h1>Stores</h1> `);

		NavItem($$renderer, {
			text: '@layerstack/svelte-stores',
			icon: mdiOpenInNew,
			currentUrl: $.store_get($$store_subs ??= {}, '$page', page).url,
			path: 'https://www.layerstack.dev/docs/svelte-stores',
			target: '_blank'
		});

		$$renderer.push(`<!----> `);

		NavItem($$renderer, {
			text: '@layerstack/svelte-table',
			icon: mdiOpenInNew,
			currentUrl: $.store_get($$store_subs ??= {}, '$page', page).url,
			path: 'https://www.layerstack.dev/docs/svelte-table/stores',
			target: '_blank'
		});

		$$renderer.push(`<!----> <h1>Utils</h1> `);

		NavItem($$renderer, {
			text: '@layerstack/tailwind',
			icon: mdiOpenInNew,
			currentUrl: $.store_get($$store_subs ??= {}, '$page', page).url,
			path: 'https://www.layerstack.dev/docs/tailwind',
			target: '_blank'
		});

		$$renderer.push(`<!----> `);

		NavItem($$renderer, {
			text: '@layerstack/utils',
			icon: mdiOpenInNew,
			currentUrl: $.store_get($$store_subs ??= {}, '$page', page).url,
			path: 'https://www.layerstack.dev/docs/utils',
			target: '_blank'
		});

		$$renderer.push(`<!---->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}