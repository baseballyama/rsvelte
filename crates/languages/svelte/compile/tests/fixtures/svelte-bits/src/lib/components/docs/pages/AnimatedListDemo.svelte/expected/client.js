import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import AnimatedList from '$lib/components/library/Components/AnimatedList/AnimatedList.svelte';
import source from '$lib/components/library/Components/AnimatedList/AnimatedList.svelte?raw';

var root = $.from_html(`<div class="demo-container" style="position:relative;height:400px;overflow:hidden;"><!></div>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Animated List</h1> <!>`, 1);

export default function AnimatedListDemo($$anchor) {
	const DEFAULTS = {
		showGradients: true,
		enableArrowNavigation: true,
		displayScrollbar: true
	};

	let showGradients = $.state($.proxy(DEFAULTS.showGradients));
	let enableArrowNavigation = $.state($.proxy(DEFAULTS.enableArrowNavigation));
	let displayScrollbar = $.state($.proxy(DEFAULTS.displayScrollbar));
	let key = $.state(0);
	const hasChanges = $.derived(() => $.get(showGradients) !== DEFAULTS.showGradients || $.get(enableArrowNavigation) !== DEFAULTS.enableArrowNavigation || $.get(displayScrollbar) !== DEFAULTS.displayScrollbar);

	function reset() {
		$.set(showGradients, DEFAULTS.showGradients, true);
		$.set(enableArrowNavigation, DEFAULTS.enableArrowNavigation, true);
		$.set(displayScrollbar, DEFAULTS.displayScrollbar, true);
		$.update(key);
	}

	const usage = $.derived(() => `<AnimatedList showGradients={${$.get(showGradients)}} enableArrowNavigation={${$.get(enableArrowNavigation)}} displayScrollbar={${$.get(displayScrollbar)}} />`);

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

	var fragment = root_2();

	$.head('19pkahr', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Animated List - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			$.key(node_1, () => $.get(key), ($$anchor) => {
				AnimatedList($$anchor, {
					get showGradients() {
						return $.get(showGradients);
					},

					get enableArrowNavigation() {
						return $.get(enableArrowNavigation);
					},

					get displayScrollbar() {
						return $.get(displayScrollbar);
					}
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'animated-list',
				get usage() {
					return $.get(usage);
				},

				get source() {
					return source;
				}
			});
		};

		const customize = ($$anchor) => {
			Customize($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_1();
					var node_2 = $.first_child(fragment_4);

					PreviewSwitch(node_2, {
						title: 'Fade Items',
						get checked() {
							return $.get(showGradients);
						},

						onChange: (v) => {
							$.set(showGradients, v, true);
							$.update(key);
						}
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSwitch(node_3, {
						title: 'Keyboard Navigation',
						get checked() {
							return $.get(enableArrowNavigation);
						},

						onChange: (v) => {
							$.set(enableArrowNavigation, v, true);
							$.update(key);
						}
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSwitch(node_4, {
						title: 'Show Scrollbar',
						get checked() {
							return $.get(displayScrollbar);
						},

						onChange: (v) => {
							$.set(displayScrollbar, v, true);
							$.update(key);
						}
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});
		};

		const propTable = ($$anchor) => {
			PropTable($$anchor, {
				get rows() {
					return props;
				}
			});
		};

		TabsLayout(node, {
			onreset: reset,
			get hasChanges() {
				return $.get(hasChanges);
			},
			componentName: 'AnimatedList',
			get usage() {
				return $.get(usage);
			},

			get source() {
				return source;
			},

			get props() {
				return props;
			},
			preview,
			code,
			customize,
			propTable,
			$$slots: { preview: true, code: true, customize: true, propTable: true }
		});
	}

	$.append($$anchor, fragment);
}