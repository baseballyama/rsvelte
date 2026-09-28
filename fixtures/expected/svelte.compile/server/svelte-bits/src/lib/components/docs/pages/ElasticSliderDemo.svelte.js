import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import ElasticSlider from '$lib/components/library/Components/ElasticSlider/ElasticSlider.svelte';
import source from '$lib/components/library/Components/ElasticSlider/ElasticSlider.svelte?raw';

export default function ElasticSliderDemo($$renderer) {
	const DEFAULTS = {
		defaultValue: 50,
		startingValue: 0,
		maxValue: 100,
		isStepped: false,
		stepSize: 1
	};

	let defaultValue = DEFAULTS.defaultValue;
	let startingValue = DEFAULTS.startingValue;
	let maxValue = DEFAULTS.maxValue;
	let isStepped = DEFAULTS.isStepped;
	let stepSize = DEFAULTS.stepSize;
	let key = 0;
	const hasChanges = $.derived(() => defaultValue !== DEFAULTS.defaultValue || startingValue !== DEFAULTS.startingValue || maxValue !== DEFAULTS.maxValue || isStepped !== DEFAULTS.isStepped || stepSize !== DEFAULTS.stepSize);

	function reset() {
		defaultValue = DEFAULTS.defaultValue;
		startingValue = DEFAULTS.startingValue;
		maxValue = DEFAULTS.maxValue;
		isStepped = DEFAULTS.isStepped;
		stepSize = DEFAULTS.stepSize;
		key++;
	}

	const usage = $.derived(() => `<ElasticSlider defaultValue={${defaultValue}} startingValue={${startingValue}} maxValue={${maxValue}} isStepped={${isStepped}} stepSize={${stepSize}} />`);

	const props = [
		{
			name: 'defaultValue',
			type: 'number',
			default: '50',
			description: 'Initial value.'
		},

		{
			name: 'startingValue',
			type: 'number',
			default: '0',
			description: 'Min value.'
		},

		{
			name: 'maxValue',
			type: 'number',
			default: '100',
			description: 'Max value.'
		},

		{
			name: 'isStepped',
			type: 'boolean',
			default: 'false',
			description: 'Snap to step increments.'
		},

		{
			name: 'stepSize',
			type: 'number',
			default: '1',
			description: 'Step size when stepped.'
		},

		{
			name: 'leftIcon',
			type: 'Snippet',
			default: '"-"',
			description: 'Left-side icon.'
		},

		{
			name: 'rightIcon',
			type: 'Snippet',
			default: '"+"',
			description: 'Right-side icon.'
		}
	];

	$.head('g2r3n2', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Elastic Slider - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Elastic Slider</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container" style="position:relative;display:flex;align-items:center;justify-content:center;min-height:400px;"><!---->`);

			{
				ElasticSlider($$renderer, { defaultValue, startingValue, maxValue, isStepped, stepSize });
			}

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'elastic-slider', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSlider($$renderer, {
						title: 'Default Value',
						min: 0,
						max: 100,
						step: 1,
						value: defaultValue,
						onChange: (v) => {
							defaultValue = v;
							key++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Starting Value',
						min: -100,
						max: 0,
						step: 1,
						value: startingValue,
						onChange: (v) => {
							startingValue = v;
							key++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Max Value',
						min: 1,
						max: 1000,
						step: 1,
						value: maxValue,
						onChange: (v) => {
							maxValue = v;
							key++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Is Stepped',
						checked: isStepped,
						onChange: (v) => {
							isStepped = v;
							key++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Step Size',
						min: 1,
						max: 50,
						step: 1,
						value: stepSize,
						onChange: (v) => {
							stepSize = v;
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
			componentName: 'ElasticSlider',
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