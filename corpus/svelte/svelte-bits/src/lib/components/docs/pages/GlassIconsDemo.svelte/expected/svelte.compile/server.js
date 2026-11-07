import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import GlassIcons from '$lib/components/library/Components/GlassIcons/GlassIcons.svelte';
import source from '$lib/components/library/Components/GlassIcons/GlassIcons.svelte?raw';

function fileText($$renderer) {
	$$renderer.push(`<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`);
}

function book($$renderer) {
	$$renderer.push(`<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`);
}

function heart($$renderer) {
	$$renderer.push(`<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`);
}

function cloud($$renderer) {
	$$renderer.push(`<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>`);
}

function edit($$renderer) {
	$$renderer.push(`<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`);
}

function barChart($$renderer) {
	$$renderer.push(`<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`);
}

export default function GlassIconsDemo($$renderer) {
	const DEFAULTS = { colorful: false };
	let colorful = DEFAULTS.colorful;
	const hasChanges = $.derived(() => colorful !== DEFAULTS.colorful);

	function reset() {
		colorful = DEFAULTS.colorful;
	}

	const usage = `<GlassIcons items={items} />`;

	const props = [
		{
			name: 'items',
			type: 'GlassIconsItem[]',
			default: '[]',
			description: 'Array of items. Each: { icon: Snippet, color: string, label: string, customClass?: string }.'
		},

		{
			name: 'class',
			type: 'string',
			default: "''",
			description: 'Optional additional class for the container.'
		}
	];

	$.head('o7hoqk', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Glass Icons - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Glass Icons</h1> `);

	{
		function preview($$renderer) {
			const data = [
				{
					icon: fileText,
					color: colorful ? 'blue' : '#444',
					label: 'Files'
				},

				{
					icon: book,
					color: colorful ? 'purple' : '#444',
					label: 'Books'
				},

				{
					icon: heart,
					color: colorful ? 'red' : '#444',
					label: 'Health'
				},

				{
					icon: cloud,
					color: colorful ? 'indigo' : '#444',
					label: 'Weather'
				},

				{
					icon: edit,
					color: colorful ? 'orange' : '#444',
					label: 'Notes'
				},

				{
					icon: barChart,
					color: colorful ? 'green' : '#444',
					label: 'Stats'
				}
			];

			$$renderer.push(`<div class="demo-container" style="position:relative;display:flex;align-items:center;justify-content:center;min-height:500px;overflow:hidden;">`);
			GlassIcons($$renderer, { items: data });
			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'glass-icons', usage, source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSwitch($$renderer, {
						title: 'Colorful',
						checked: colorful,
						onChange: (v) => colorful = v
					});
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
			componentName: 'GlassIcons',
			usage,
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