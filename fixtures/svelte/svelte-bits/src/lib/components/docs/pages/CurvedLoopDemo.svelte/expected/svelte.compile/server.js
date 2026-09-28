import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewInput from '$lib/components/docs/preview/PreviewInput.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import ReplayButton from '$lib/components/docs/preview/ReplayButton.svelte';
import CurvedLoop from '$lib/components/library/TextAnimations/CurvedLoop/CurvedLoop.svelte';
import source from '$lib/components/library/TextAnimations/CurvedLoop/CurvedLoop.svelte?raw';

export default function CurvedLoopDemo($$renderer) {
	const DEFAULTS = {
		marqueeText: 'Be ✦ Creative ✦ With ✦ Svelte ✦ Bits ✦',
		speed: 2,
		curveAmount: 400,
		interactive: true
	};

	let marqueeText = DEFAULTS.marqueeText;
	let speed = DEFAULTS.speed;
	let curveAmount = DEFAULTS.curveAmount;
	let interactive = DEFAULTS.interactive;
	let replay = 0;
	const hasChanges = $.derived(() => marqueeText !== DEFAULTS.marqueeText || speed !== DEFAULTS.speed || curveAmount !== DEFAULTS.curveAmount || interactive !== DEFAULTS.interactive);

	function reset() {
		marqueeText = DEFAULTS.marqueeText;
		speed = DEFAULTS.speed;
		curveAmount = DEFAULTS.curveAmount;
		interactive = DEFAULTS.interactive;
		replay++;
	}

	const usage = $.derived(() => `<CurvedLoop
  marqueeText="${marqueeText}"
  speed={${speed}}
  curveAmount={${curveAmount}}
  interactive={${interactive}}
/>`);

	const props = [
		{
			name: 'marqueeText',
			type: 'string',
			default: '""',
			description: 'The text to display in the curved marquee.'
		},

		{
			name: 'speed',
			type: 'number',
			default: '2',
			description: 'Animation speed of the marquee text.'
		},

		{
			name: 'class',
			type: 'string',
			default: 'undefined',
			description: 'CSS class name for styling the text.'
		},

		{
			name: 'curveAmount',
			type: 'number',
			default: '400',
			description: 'Amount of curve in the text path.'
		},

		{
			name: 'direction',
			type: '"left" | "right"',
			default: '"left"',
			description: 'Initial direction of the marquee animation.'
		},

		{
			name: 'interactive',
			type: 'boolean',
			default: 'true',
			description: 'Whether the marquee can be dragged by the user.'
		}
	];

	$.head('bk2rtd', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Curved Loop - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Curved Loop</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container relative w-full overflow-hidden" style="height:400px;padding:0;">`);
			ReplayButton($$renderer, { onClick: () => replay++ });
			$$renderer.push(`<!----> <!---->`);

			{
				CurvedLoop($$renderer, { marqueeText, speed, curveAmount, interactive });
			}

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'curved-loop', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewInput($$renderer, {
						title: 'Marquee Text',
						value: marqueeText,
						placeholder: 'Enter text...',
						onChange: (v) => {
							marqueeText = v;
							replay++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Speed',
						min: 0,
						max: 10,
						step: 0.1,
						value: speed,
						onChange: (v) => {
							speed = v;
							replay++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Curve Amount',
						min: -400,
						max: 400,
						step: 10,
						value: curveAmount,
						valueUnit: 'px',
						onChange: (v) => {
							curveAmount = v;
							replay++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Draggable',
						checked: interactive,
						onChange: (v) => {
							interactive = v;
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
			componentName: 'CurvedLoop',
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