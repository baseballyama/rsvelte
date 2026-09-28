import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import ClickSpark from '$lib/components/library/Animations/ClickSpark/ClickSpark.svelte';
import source from '$lib/components/library/Animations/ClickSpark/ClickSpark.svelte?raw';

export default function ClickSparkDemo($$renderer) {
	const DEFAULTS = {
		sparkColor: '#FF8A4C',
		sparkSize: 10,
		sparkRadius: 15,
		sparkCount: 8,
		duration: 400
	};

	let sparkColor = DEFAULTS.sparkColor;
	let sparkSize = DEFAULTS.sparkSize;
	let sparkRadius = DEFAULTS.sparkRadius;
	let sparkCount = DEFAULTS.sparkCount;
	let duration = DEFAULTS.duration;
	const hasChanges = $.derived(() => sparkColor !== DEFAULTS.sparkColor || sparkSize !== DEFAULTS.sparkSize || sparkRadius !== DEFAULTS.sparkRadius || sparkCount !== DEFAULTS.sparkCount || duration !== DEFAULTS.duration);

	function reset() {
		Object.assign({}, DEFAULTS);
		sparkColor = DEFAULTS.sparkColor;
		sparkSize = DEFAULTS.sparkSize;
		sparkRadius = DEFAULTS.sparkRadius;
		sparkCount = DEFAULTS.sparkCount;
		duration = DEFAULTS.duration;
	}

	const usage = $.derived(() => `<ClickSpark sparkColor="${sparkColor}" sparkSize={${sparkSize}} sparkRadius={${sparkRadius}} sparkCount={${sparkCount}} duration={${duration}}>
  <div>Click anywhere</div>
</ClickSpark>`);

	const props = [
		{
			name: 'children',
			type: 'Snippet',
			default: '-',
			description: 'Slot content. Sparks render over the wrapper.'
		},

		{
			name: 'sparkColor',
			type: 'string',
			default: '"#fff"',
			description: 'Color of each spark line.'
		},

		{
			name: 'sparkSize',
			type: 'number',
			default: '10',
			description: 'Length of each spark in px.'
		},

		{
			name: 'sparkRadius',
			type: 'number',
			default: '15',
			description: 'How far the sparks travel from the click point.'
		},

		{
			name: 'sparkCount',
			type: 'number',
			default: '8',
			description: 'Number of sparks per click.'
		},

		{
			name: 'duration',
			type: 'number',
			default: '400',
			description: 'Animation duration in ms.'
		},

		{
			name: 'easing',
			type: 'string',
			default: '"ease-out"',
			description: 'Easing for spark travel.'
		},

		{
			name: 'extraScale',
			type: 'number',
			default: '1.0',
			description: 'Multiplier on spark length over time.'
		}
	];

	$.head('l0lbhb', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Click Spark - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Click Spark</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div style="position:relative;min-height:400px;width:100%;">`);

			ClickSpark($$renderer, {
				sparkColor,
				sparkSize,
				sparkRadius,
				sparkCount,
				duration,
				children: ($$renderer) => {
					$$renderer.push(`<div style="display:flex;align-items:center;justify-content:center;min-height:400px;color:var(--text-secondary);font-weight:600;">Click anywhere</div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'click-spark', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewColorPicker($$renderer, {
						title: 'Spark Color',
						value: sparkColor,
						onChange: (v) => sparkColor = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Spark Size',
						min: 4,
						max: 40,
						step: 1,
						value: sparkSize,
						valueUnit: 'px',
						onChange: (v) => sparkSize = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Spark Radius',
						min: 5,
						max: 80,
						step: 1,
						value: sparkRadius,
						valueUnit: 'px',
						onChange: (v) => sparkRadius = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Spark Count',
						min: 3,
						max: 24,
						step: 1,
						value: sparkCount,
						onChange: (v) => sparkCount = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Duration',
						min: 100,
						max: 1500,
						step: 50,
						value: duration,
						valueUnit: 'ms',
						onChange: (v) => duration = v
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
			componentName: 'ClickSpark',
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