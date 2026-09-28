import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import ScrollStack from '$lib/components/library/Components/ScrollStack/ScrollStack.svelte';
import source from '$lib/components/library/Components/ScrollStack/ScrollStack.svelte?raw';

function card1($$renderer) {
	$$renderer.push(`<h3>Text Animations</h3>`);
}

function card2($$renderer) {
	$$renderer.push(`<h3>Animations</h3>`);
}

function card3($$renderer) {
	$$renderer.push(`<h3>Components</h3>`);
}

function card4($$renderer) {
	$$renderer.push(`<h3>Backgrounds</h3>`);
}

function card5($$renderer) {
	$$renderer.push(`<h3>All on svelte-bits!</h3>`);
}

export default function ScrollStackDemo($$renderer) {
	const DEFAULTS = {
		itemDistance: 200,
		itemStackDistance: 30,
		baseScale: 0.85,
		rotationAmount: 0,
		blurAmount: 0,
		stackPosition: '20%'
	};

	let itemDistance = DEFAULTS.itemDistance;
	let itemStackDistance = DEFAULTS.itemStackDistance;
	let baseScale = DEFAULTS.baseScale;
	let rotationAmount = DEFAULTS.rotationAmount;
	let blurAmount = DEFAULTS.blurAmount;
	let stackPosition = DEFAULTS.stackPosition;
	let key = 0;
	let isCompleted = false;
	const hasChanges = $.derived(() => itemDistance !== DEFAULTS.itemDistance || itemStackDistance !== DEFAULTS.itemStackDistance || baseScale !== DEFAULTS.baseScale || rotationAmount !== DEFAULTS.rotationAmount || blurAmount !== DEFAULTS.blurAmount || stackPosition !== DEFAULTS.stackPosition);

	function reset() {
		itemDistance = DEFAULTS.itemDistance;
		itemStackDistance = DEFAULTS.itemStackDistance;
		baseScale = DEFAULTS.baseScale;
		rotationAmount = DEFAULTS.rotationAmount;
		blurAmount = DEFAULTS.blurAmount;
		stackPosition = DEFAULTS.stackPosition;
		refresh();
	}

	function refresh() {
		key++;
		isCompleted = false;
	}

	function bump(setter, v) {
		setter(v);
		refresh();
	}

	const usage = `<ScrollStack cards={[c1, c2, c3]} itemDistance={200} baseScale={0.85} stackPosition="20%" />`;

	const props = [
		{
			name: 'cards',
			type: 'Snippet[]',
			default: '-',
			description: 'Array of card content snippets.'
		},

		{
			name: 'itemDistance',
			type: 'number',
			default: '100',
			description: 'Distance between stacked items in px.'
		},

		{
			name: 'itemScale',
			type: 'number',
			default: '0.03',
			description: 'Scale increment per item.'
		},

		{
			name: 'itemStackDistance',
			type: 'number',
			default: '30',
			description: 'Distance when items start stacking.'
		},

		{
			name: 'stackPosition',
			type: 'string',
			default: '"20%"',
			description: 'Where stacking begins (% of viewport).'
		},

		{
			name: 'scaleEndPosition',
			type: 'string',
			default: '"10%"',
			description: 'Where scaling ends (% of viewport).'
		},

		{
			name: 'baseScale',
			type: 'number',
			default: '0.85',
			description: 'Base scale of first item.'
		},

		{
			name: 'rotationAmount',
			type: 'number',
			default: '0',
			description: 'Rotation per item in degrees.'
		},

		{
			name: 'blurAmount',
			type: 'number',
			default: '0',
			description: 'Blur for back items.'
		},

		{
			name: 'useWindowScroll',
			type: 'boolean',
			default: 'false',
			description: 'Use window scroll instead of container.'
		},

		{
			name: 'onStackComplete',
			type: '() => void',
			default: '-',
			description: 'Fires when stack completes.'
		}
	];

	const stackPositionOptions = [
		{ value: '10%', label: '10%' },
		{ value: '15%', label: '15%' },
		{ value: '20%', label: '20%' },
		{ value: '25%', label: '25%' },
		{ value: '30%', label: '30%' },
		{ value: '35%', label: '35%' }
	];

	$.head('488nc9', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Scroll Stack - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Scroll Stack</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container" style="position:relative;height:400px;padding:0;overflow:hidden;"><button class="refresh-btn svelte-488nc9" aria-label="Refresh" type="button"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svelte-488nc9"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg></button> <div style="text-align:center;color:#222222;font-size:clamp(2rem,4vw,3rem);font-weight:900;position:absolute;top:25%;left:50%;transform:translate(-50%,-50%);pointer-events:none;transition:all 0.3s ease;z-index:1;">${$.escape(isCompleted ? 'Stack Completed!' : 'Scroll Down')}</div> <!---->`);

			{
				ScrollStack($$renderer, {
					cards: [card1, card2, card3, card4, card5],
					itemDistance,
					itemStackDistance,
					stackPosition,
					baseScale,
					rotationAmount,
					blurAmount,
					itemClass: 'scroll-stack-card-demo',
					onStackComplete: () => isCompleted = true
				});
			}

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'scroll-stack', usage, source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSlider($$renderer, {
						title: 'Item Distance',
						min: 0,
						max: 1000,
						step: 10,
						value: itemDistance,
						valueUnit: 'px',
						onChange: (v) => bump((x) => itemDistance = x, v)
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Stack Distance',
						min: 0,
						max: 40,
						step: 5,
						value: itemStackDistance,
						valueUnit: 'px',
						onChange: (v) => bump((x) => itemStackDistance = x, v)
					});

					$$renderer.push(`<!----> `);

					PreviewSelect($$renderer, {
						title: 'Stack Position',
						options: stackPositionOptions,
						value: stackPosition,
						onChange: (v) => bump((x) => stackPosition = x, v)
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Base Scale',
						min: 0.5,
						max: 1.0,
						step: 0.05,
						value: baseScale,
						onChange: (v) => bump((x) => baseScale = x, v)
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Rotation Amount',
						min: 0,
						max: 1,
						step: 0.1,
						value: rotationAmount,
						valueUnit: '°',
						onChange: (v) => bump((x) => rotationAmount = x, v)
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Blur Amount',
						min: 0,
						max: 10,
						step: 0.5,
						value: blurAmount,
						valueUnit: 'px',
						onChange: (v) => bump((x) => blurAmount = x, v)
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
			componentName: 'ScrollStack',
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