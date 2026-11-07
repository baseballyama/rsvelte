import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import Folder from '$lib/components/library/Components/Folder/Folder.svelte';
import source from '$lib/components/library/Components/Folder/Folder.svelte?raw';

export default function FolderDemo($$renderer) {
	const DEFAULTS = { color: '#FF8A4C', size: 2 };
	let color = DEFAULTS.color;
	let size = DEFAULTS.size;
	const hasChanges = $.derived(() => color !== DEFAULTS.color || size !== DEFAULTS.size);

	function reset() {
		color = DEFAULTS.color;
		size = DEFAULTS.size;
	}

	const usage = $.derived(() => `<Folder color="${color}" size={${size}} />`);

	const props = [
		{
			name: 'color',
			type: 'string',
			default: '"#FF8A4C"',
			description: 'Folder color.'
		},

		{
			name: 'size',
			type: 'number',
			default: '1',
			description: 'Visual scale factor.'
		},

		{
			name: 'items',
			type: 'FolderItem[]',
			default: '[]',
			description: 'Up to 3 papers to display inside.'
		}
	];

	$.head('ih10a2', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Folder - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Folder</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container" style="position:relative;display:flex;align-items:center;justify-content:center;min-height:500px;">`);
			Folder($$renderer, { color, size });
			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'folder', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewColorPicker($$renderer, { title: 'Color', value: color, onChange: (v) => color = v });
					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Size',
						min: 0.5,
						max: 4,
						step: 0.1,
						value: size,
						onChange: (v) => size = v
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
			componentName: 'Folder',
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