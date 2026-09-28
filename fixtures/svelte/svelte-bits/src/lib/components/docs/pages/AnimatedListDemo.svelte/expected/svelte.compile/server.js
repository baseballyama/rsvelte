import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import AnimatedList from '$lib/components/library/Components/AnimatedList/AnimatedList.svelte';
import source from '$lib/components/library/Components/AnimatedList/AnimatedList.svelte?raw';

export default function AnimatedListDemo($$renderer) {
	const DEFAULTS = {
		showGradients: true,
		enableArrowNavigation: true,
		displayScrollbar: true
	};

	let showGradients = DEFAULTS.showGradients;
	let enableArrowNavigation = DEFAULTS.enableArrowNavigation;
	let displayScrollbar = DEFAULTS.displayScrollbar;
	let key = 0;
	const hasChanges = $.derived(() => showGradients !== DEFAULTS.showGradients || enableArrowNavigation !== DEFAULTS.enableArrowNavigation || displayScrollbar !== DEFAULTS.displayScrollbar);

	function reset() {
		showGradients = DEFAULTS.showGradients;
		enableArrowNavigation = DEFAULTS.enableArrowNavigation;
		displayScrollbar = DEFAULTS.displayScrollbar;
		key++;
	}

	const usage = $.derived(() => `<AnimatedList showGradients={${showGradients}} enableArrowNavigation={${enableArrowNavigation}} displayScrollbar={${displayScrollbar}} />`);

	const props = [
		{
			name: 'items',
			type: 'string[]',
			default: "['Item 1', 'Item 2', ...]",
			description: 'An array of items to display in the scrollable list.'
		},

		{
			name: 'onItemSelect',
			type: '(item, index) => void',
			default: 'undefined',
			description: 'Callback fired when an item is selected.'
		},

		{
			name: 'showGradients',
			type: 'boolean',
			default: 'true',
			description: 'Toggle to display the top and bottom gradient overlays.'
		},

		{
			name: 'enableArrowNavigation',
			type: 'boolean',
			default: 'true',
			description: 'Toggle to enable keyboard navigation via arrow and tab keys.'
		},

		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'Additional CSS class names for the main container.'
		},

		{
			name: 'itemClass',
			type: 'string',
			default: '""',
			description: 'Additional CSS class names for each list item.'
		},

		{
			name: 'displayScrollbar',
			type: 'boolean',
			default: 'true',
			description: 'Toggle to display or hide the custom scrollbar.'
		},

		{
			name: 'initialSelectedIndex',
			type: 'number',
			default: '-1',
			description: 'Initial index of the selected item.'
		}
	];

	$.head('19pkahr', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Animated List - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Animated List</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container" style="position:relative;height:400px;overflow:hidden;"><!---->`);

			{
				AnimatedList($$renderer, { showGradients, enableArrowNavigation, displayScrollbar });
			}

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'animated-list', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSwitch($$renderer, {
						title: 'Fade Items',
						checked: showGradients,
						onChange: (v) => {
							showGradients = v;
							key++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Keyboard Navigation',
						checked: enableArrowNavigation,
						onChange: (v) => {
							enableArrowNavigation = v;
							key++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Show Scrollbar',
						checked: displayScrollbar,
						onChange: (v) => {
							displayScrollbar = v;
							key++;
						}
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		}

		function propTable($$renderer) {
			PropTable($$renderer, { rows: props });
		}

		TabsLayout($$renderer, {
			onreset: reset,
			hasChanges: hasChanges(),
			componentName: 'AnimatedList',
			usage: usage(),
			source,
			props,
			preview,
			code,
			customize,
			propTable,
			$$slots: { preview: true, code: true, customize: true, propTable: true }
		});
	}

	$$renderer.push(`<!---->`);
}