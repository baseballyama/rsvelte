import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import Dock from '$lib/components/library/Components/Dock/Dock.svelte';
import source from '$lib/components/library/Components/Dock/Dock.svelte?raw';

const home = ($$anchor) => {
	var svg = root();

	$.append($$anchor, svg);
};

const archive = ($$anchor) => {
	var svg_1 = root_1();

	$.append($$anchor, svg_1);
};

const profile = ($$anchor) => {
	var svg_2 = root_2();

	$.append($$anchor, svg_2);
};

const settings = ($$anchor) => {
	var svg_3 = root_3();

	$.append($$anchor, svg_3);
};

var root = $.from_svg(`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`);
var root_1 = $.from_svg(`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>`);
var root_2 = $.from_svg(`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`);
var root_3 = $.from_svg(`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`);
var root_4 = $.from_html(`<div class="relative" style="min-height:300px;display:flex;align-items:flex-end;justify-content:center;width:100%;padding-bottom:1em;"><!></div>`);
var root_5 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_6 = $.from_html(`<h1 class="sub-category">Dock</h1> <!>`, 1);

export default function DockDemo($$anchor) {
	const DEFAULTS = {
		panelHeight: 68,
		baseItemSize: 50,
		magnification: 70,
		distance: 200
	};

	let panelHeight = $.state($.proxy(DEFAULTS.panelHeight));
	let baseItemSize = $.state($.proxy(DEFAULTS.baseItemSize));
	let magnification = $.state($.proxy(DEFAULTS.magnification));
	let distance = $.state($.proxy(DEFAULTS.distance));
	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';

	const items = [
		{
			label: 'Home',
			onClick: () => console.log('Home'),
			icon: home
		},

		{
			label: 'Archive',
			onClick: () => console.log('Archive'),
			icon: archive
		},

		{
			label: 'Profile',
			onClick: () => console.log('Profile'),
			icon: profile
		},

		{
			label: 'Settings',
			onClick: () => console.log('Settings'),
			icon: settings
		}
	];

	const hasChanges = $.derived(() => $.get(panelHeight) !== DEFAULTS.panelHeight || $.get(baseItemSize) !== DEFAULTS.baseItemSize || $.get(magnification) !== DEFAULTS.magnification || $.get(distance) !== DEFAULTS.distance);

	function reset() {
		$.set(panelHeight, DEFAULTS.panelHeight, true);
		$.set(baseItemSize, DEFAULTS.baseItemSize, true);
		$.set(magnification, DEFAULTS.magnification, true);
		$.set(distance, DEFAULTS.distance, true);
	}

	const usage = $.derived(() => `${scriptOpen}
  import Dock from '$lib/components/Dock.svelte';

  const items = [
    { label: 'Home', icon: homeSnippet, onClick: () => {} },
    { label: 'Archive', icon: archiveSnippet, onClick: () => {} }
  ];
${scriptClose}

<Dock
  {items}
  panelHeight={${$.get(panelHeight)}}
  baseItemSize={${$.get(baseItemSize)}}
  magnification={${$.get(magnification)}}
  distance={${$.get(distance)}}
/>`);

	const props = [
		{
			name: 'items',
			type: 'DockItemData[]',
			default: '-',
			description: 'Items rendered inside the dock.'
		},

		{
			name: 'panelHeight',
			type: 'number',
			default: '64',
			description: 'Base panel height in pixels.'
		},

		{
			name: 'baseItemSize',
			type: 'number',
			default: '50',
			description: 'Resting size of each dock item.'
		},

		{
			name: 'magnification',
			type: 'number',
			default: '70',
			description: 'Maximum item size on hover.'
		},

		{
			name: 'distance',
			type: 'number',
			default: '200',
			description: 'Cursor distance (px) over which magnification falls off.'
		},

		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'Extra classes for the panel.'
		}
	];

	var fragment = root_6();

	$.head('1bctsgt', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Dock - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root_4();
			var node_1 = $.child(div);

			Dock(node_1, {
				get items() {
					return items;
				},

				get panelHeight() {
					return $.get(panelHeight);
				},

				get baseItemSize() {
					return $.get(baseItemSize);
				},

				get magnification() {
					return $.get(magnification);
				},

				get distance() {
					return $.get(distance);
				}
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'dock',
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
					var fragment_3 = root_5();
					var node_2 = $.first_child(fragment_3);

					PreviewSlider(node_2, {
						title: 'Panel Height',
						min: 48,
						max: 120,
						step: 2,
						get value() {
							return $.get(panelHeight);
						},
						valueUnit: 'px',
						onChange: (v) => $.set(panelHeight, v, true)
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSlider(node_3, {
						title: 'Base Item Size',
						min: 32,
						max: 80,
						step: 2,
						get value() {
							return $.get(baseItemSize);
						},
						valueUnit: 'px',
						onChange: (v) => $.set(baseItemSize, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Magnification',
						min: 40,
						max: 140,
						step: 2,
						get value() {
							return $.get(magnification);
						},
						valueUnit: 'px',
						onChange: (v) => $.set(magnification, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Distance',
						min: 50,
						max: 400,
						step: 10,
						get value() {
							return $.get(distance);
						},
						valueUnit: 'px',
						onChange: (v) => $.set(distance, v, true)
					});

					$.append($$anchor, fragment_3);
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
			componentName: 'Dock',
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