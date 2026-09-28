import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import PreviewInput from '$lib/components/docs/preview/PreviewInput.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import ReplayButton from '$lib/components/docs/preview/ReplayButton.svelte';
import CountUp from '$lib/components/library/TextAnimations/CountUp/CountUp.svelte';
import countUpSource from '$lib/components/library/TextAnimations/CountUp/CountUp.svelte?raw';

export default function CountUpDemo($$renderer) {
	const DEFAULTS = {
		from: 0,
		to: 100,
		duration: 1,
		delay: 0,
		direction: 'up',
		separator: ','
	};

	let from = DEFAULTS.from;
	let to = DEFAULTS.to;
	let duration = DEFAULTS.duration;
	let delay = DEFAULTS.delay;
	let direction = DEFAULTS.direction;
	let separator = DEFAULTS.separator;
	let replay = 0;
	const hasChanges = $.derived(() => from !== DEFAULTS.from || to !== DEFAULTS.to || duration !== DEFAULTS.duration || delay !== DEFAULTS.delay || direction !== DEFAULTS.direction || separator !== DEFAULTS.separator);

	function reset() {
		from = DEFAULTS.from;
		to = DEFAULTS.to;
		duration = DEFAULTS.duration;
		delay = DEFAULTS.delay;
		direction = DEFAULTS.direction;
		separator = DEFAULTS.separator;
		replay++;
	}

	const usage = $.derived(() => `${'<' + 'script lang="ts">'}
  import CountUp from '$lib/components/CountUp.svelte';
${'</' + 'script>'}

<CountUp
  from={${from}}
  to={${to}}
  separator="${separator}"
  direction="${direction}"
  duration={${duration}}
  delay={${delay}}
/>`);

	const props = [
		{
			name: 'to',
			type: 'number',
			default: '-',
			description: 'The target number to count up to.'
		},

		{
			name: 'from',
			type: 'number',
			default: '0',
			description: 'The initial number from which the count starts.'
		},

		{
			name: 'direction',
			type: 'string',
			default: '"up"',
			description: 'Direction of the count; can be "up" or "down". When this is set to "down", "from" and "to" become reversed, in order to count down.'
		},

		{
			name: 'delay',
			type: 'number',
			default: '0',
			description: 'Delay in seconds before the counting starts.'
		},

		{
			name: 'duration',
			type: 'number',
			default: '2',
			description: 'Duration of the count animation - based on the damping and stiffness configured inside the component.'
		},

		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'CSS class to apply to the component for additional styling.'
		},

		{
			name: 'startWhen',
			type: 'boolean',
			default: 'true',
			description: 'A boolean to control whether the animation should start when the component is in view. It basically works like an if statement, if this is true, the count will start.'
		},

		{
			name: 'separator',
			type: 'string',
			default: '""',
			description: 'Character to use as a thousands separator in the displayed number.'
		},

		{
			name: 'onStart',
			type: 'function',
			default: '-',
			description: 'Callback function that is called when the count animation starts.'
		},

		{
			name: 'onEnd',
			type: 'function',
			default: '-',
			description: 'Callback function that is called when the count animation ends.'
		}
	];

	$.head('185xr4y', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Count Up - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Count Up</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container" style="position:relative;min-height:400px;font-size:80px;font-weight:700;">`);
			ReplayButton($$renderer, { onClick: () => replay++ });
			$$renderer.push(`<!----> <!---->`);

			{
				CountUp($$renderer, { from, to, duration, delay, direction, separator });
			}

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'count-up', usage: usage(), source: countUpSource });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSlider($$renderer, {
						title: 'To',
						min: 0,
						max: 10000,
						step: 100,
						value: to,
						onChange: (v) => {
							to = v;
							replay++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'From',
						min: 0,
						max: 1000,
						step: 10,
						value: from,
						onChange: (v) => {
							from = v;
							replay++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Duration',
						min: 0.5,
						max: 10,
						step: 0.5,
						value: duration,
						valueUnit: 's',
						onChange: (v) => duration = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Delay',
						min: 0,
						max: 5,
						step: 0.5,
						value: delay,
						valueUnit: 's',
						onChange: (v) => delay = v
					});

					$$renderer.push(`<!----> `);

					PreviewSelect($$renderer, {
						title: 'Direction',
						options: [
							{ label: 'Up', value: 'up' },
							{ label: 'Down', value: 'down' }
						],
						value: direction,
						onChange: (v) => {
							direction = v;
							replay++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewInput($$renderer, {
						title: 'Separator',
						value: separator,
						placeholder: ',',
						maxlength: 1,
						onChange: (v) => {
							separator = v.slice(-1);
							replay++;
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
			componentName: 'CountUp',
			usage: usage(),
			source: countUpSource,
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