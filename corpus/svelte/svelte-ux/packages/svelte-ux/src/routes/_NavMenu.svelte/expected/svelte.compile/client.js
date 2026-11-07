import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<h2> </h2> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <h1>Components</h1> <!> <h1>Charts</h1> <!> <h1>Actions</h1> <!> <!> <h1>Stores</h1> <!> <!> <h1>Utils</h1> <!> <!>`, 1);

export default function _NavMenu($$anchor, $$props) {
	$.push($$props, true);

	const $page = () => $.store_get(page, '$page', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

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

	var fragment = root_1();
	var node = $.first_child(fragment);

	NavItem(node, {
		text: 'Getting Started',
		get icon() {
			return mdiHome;
		},

		get currentUrl() {
			return $page().url;
		},
		path: '/'
	});

	var node_1 = $.sibling(node, 2);

	NavItem(node_1, {
		text: 'Customization',
		get icon() {
			return mdiCog;
		},

		get currentUrl() {
			return $page().url;
		},
		path: '/customization'
	});

	var node_2 = $.sibling(node_1, 2);

	NavItem(node_2, {
		text: 'Theme',
		get icon() {
			return mdiPalette;
		},

		get currentUrl() {
			return $page().url;
		},
		path: '/theme'
	});

	var node_3 = $.sibling(node_2, 2);

	NavItem(node_3, {
		text: 'Changelog',
		get icon() {
			return mdiFormatListBulleted;
		},

		get currentUrl() {
			return $page().url;
		},
		path: '/changelog'
	});

	var node_4 = $.sibling(node_3, 4);

	$.each(node_4, 17, () => entries(components), $.index, ($$anchor, $$item) => {
		var $$array = $.derived(() => $.to_array($.get($$item), 2));
		let header = () => $.get($$array)[0];
		let items = () => $.get($$array)[1];
		var fragment_1 = root();
		var h2 = $.first_child(fragment_1);
		var text = $.only_child(h2, true);
		var node_5 = $.sibling(h2, 2);

		$.each(node_5, 17, items, $.index, ($$anchor, item) => {
			var fragment_2 = $.comment();
			var node_6 = $.first_child(fragment_2);

			{
				var consequent = ($$anchor) => {
					NavItem($$anchor, {
						get text() {
							return $.get(item).label;
						},

						get currentUrl() {
							return $page().url;
						},

						get path() {
							return `/docs/components/${$.get(item).value ?? ''}`;
						}
					});
				};

				var alternate = ($$anchor) => {
					NavItem($$anchor, {
						get text() {
							return $.get(item);
						},

						get currentUrl() {
							return $page().url;
						},

						get path() {
							return `/docs/components/${$.get(item) ?? ''}`;
						}
					});
				};

				$.if(node_6, ($$render) => {
					if (typeof $.get(item) === 'object') $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_2);
		});

		$.template_effect(() => $.set_text(text, header()));
		$.append($$anchor, fragment_1);
	});

	var node_7 = $.sibling(node_4, 4);

	NavItem(node_7, {
		text: 'LayerChart',
		get icon() {
			return mdiOpenInNew;
		},

		get currentUrl() {
			return $page().url;
		},
		path: 'https://www.layerchart.com',
		target: '_blank'
	});

	var node_8 = $.sibling(node_7, 4);

	NavItem(node_8, {
		text: '@layerstack/svelte-actions',
		get icon() {
			return mdiOpenInNew;
		},

		get currentUrl() {
			return $page().url;
		},
		path: 'https://www.layerstack.dev/docs/svelte-actions',
		target: '_blank'
	});

	var node_9 = $.sibling(node_8, 2);

	NavItem(node_9, {
		text: '@layerstack/svelte-table',
		get icon() {
			return mdiOpenInNew;
		},

		get currentUrl() {
			return $page().url;
		},
		path: 'https://www.layerstack.dev/docs/svelte-table/actions',
		target: '_blank'
	});

	var node_10 = $.sibling(node_9, 4);

	NavItem(node_10, {
		text: '@layerstack/svelte-stores',
		get icon() {
			return mdiOpenInNew;
		},

		get currentUrl() {
			return $page().url;
		},
		path: 'https://www.layerstack.dev/docs/svelte-stores',
		target: '_blank'
	});

	var node_11 = $.sibling(node_10, 2);

	NavItem(node_11, {
		text: '@layerstack/svelte-table',
		get icon() {
			return mdiOpenInNew;
		},

		get currentUrl() {
			return $page().url;
		},
		path: 'https://www.layerstack.dev/docs/svelte-table/stores',
		target: '_blank'
	});

	var node_12 = $.sibling(node_11, 4);

	NavItem(node_12, {
		text: '@layerstack/tailwind',
		get icon() {
			return mdiOpenInNew;
		},

		get currentUrl() {
			return $page().url;
		},
		path: 'https://www.layerstack.dev/docs/tailwind',
		target: '_blank'
	});

	var node_13 = $.sibling(node_12, 2);

	NavItem(node_13, {
		text: '@layerstack/utils',
		get icon() {
			return mdiOpenInNew;
		},

		get currentUrl() {
			return $page().url;
		},
		path: 'https://www.layerstack.dev/docs/utils',
		target: '_blank'
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}