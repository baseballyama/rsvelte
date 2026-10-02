import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import Crosshair from '$lib/components/library/Animations/Crosshair/Crosshair.svelte';
import source from '$lib/components/library/Animations/Crosshair/Crosshair.svelte?raw';

export default function CrosshairDemo($$renderer) {
	const DEFAULTS = { color: '#FF8A4C', targeted: true };
	let color = DEFAULTS.color;
	let targeted = DEFAULTS.targeted;
	let containerRef = null;
	const hasChanges = $.derived(() => color !== DEFAULTS.color || targeted !== DEFAULTS.targeted);

	function reset() {
		color = DEFAULTS.color;
		targeted = DEFAULTS.targeted;
	}

	const usage = $.derived(() => `<Crosshair color="${color}" containerRef={ref} />`);

	const props = [
		{
			name: 'color',
			type: 'string',
			default: '"white"',
			description: 'Color of the crosshair lines.'
		},

		{
			name: 'containerRef',
			type: 'HTMLElement | null',
			default: 'null',
			description: 'Optional container ref to limit crosshair to specific element. If null, the crosshair will be active on the entire viewport.'
		}
	];

	$.head('16lx88o', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Crosshair - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Crosshair</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container" style="position:relative;height:500px;display:flex;align-items:center;justify-content:center;cursor:none;"><p style="font-size:2.5rem;font-weight:900;color:var(--text-primary);text-align:center;">Hover inside this box.</p> `);

			if (containerRef !== undefined) {
				$$renderer.push('<!--[0-->');
				Crosshair($$renderer, { color, containerRef: targeted ? containerRef : null });
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'crosshair', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewColorPicker($$renderer, { title: 'Color', value: color, onChange: (v) => color = v });
					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Targeted',
						checked: targeted,
						onChange: (v) => targeted = v
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
			componentName: 'Crosshair',
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