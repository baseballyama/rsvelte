import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import Dock from '$lib/components/library/Components/Dock/Dock.svelte';
import source from '$lib/components/library/Components/Dock/Dock.svelte?raw';

function home($$renderer) {
	$$renderer.push(`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`);
}

function archive($$renderer) {
	$$renderer.push(`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>`);
}

function profile($$renderer) {
	$$renderer.push(`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`);
}

function settings($$renderer) {
	$$renderer.push(`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`);
}

export default function DockDemo($$renderer) {
	const DEFAULTS = {
		panelHeight: 68,
		baseItemSize: 50,
		magnification: 70,
		distance: 200
	};

	let panelHeight = DEFAULTS.panelHeight;
	let baseItemSize = DEFAULTS.baseItemSize;
	let magnification = DEFAULTS.magnification;
	let distance = DEFAULTS.distance;
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

	const hasChanges = $.derived(() => panelHeight !== DEFAULTS.panelHeight || baseItemSize !== DEFAULTS.baseItemSize || magnification !== DEFAULTS.magnification || distance !== DEFAULTS.distance);

	function reset() {
		panelHeight = DEFAULTS.panelHeight;
		baseItemSize = DEFAULTS.baseItemSize;
		magnification = DEFAULTS.magnification;
		distance = DEFAULTS.distance;
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
  panelHeight={${panelHeight}}
  baseItemSize={${baseItemSize}}
  magnification={${magnification}}
  distance={${distance}}
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

	$.head('1bctsgt', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Dock - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Dock</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="relative" style="min-height:300px;display:flex;align-items:flex-end;justify-content:center;width:100%;padding-bottom:1em;">`);
			Dock($$renderer, { items, panelHeight, baseItemSize, magnification, distance });
			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'dock', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSlider($$renderer, {
						title: 'Panel Height',
						min: 48,
						max: 120,
						step: 2,
						value: panelHeight,
						valueUnit: 'px',
						onChange: (v) => panelHeight = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Base Item Size',
						min: 32,
						max: 80,
						step: 2,
						value: baseItemSize,
						valueUnit: 'px',
						onChange: (v) => baseItemSize = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Magnification',
						min: 40,
						max: 140,
						step: 2,
						value: magnification,
						valueUnit: 'px',
						onChange: (v) => magnification = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Distance',
						min: 50,
						max: 400,
						step: 10,
						value: distance,
						valueUnit: 'px',
						onChange: (v) => distance = v
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
			componentName: 'Dock',
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