import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import ReplayButton from '$lib/components/docs/preview/ReplayButton.svelte';
import DecryptedText from '$lib/components/library/TextAnimations/DecryptedText/DecryptedText.svelte';
import source from '$lib/components/library/TextAnimations/DecryptedText/DecryptedText.svelte?raw';

export default function DecryptedTextDemo($$renderer) {
	const DEFAULTS = {
		speed: 60,
		maxIterations: 10,
		sequential: true,
		useOriginalCharsOnly: false,
		revealDirection: 'start',
		animateOn: 'view',
		clickMode: 'once'
	};

	let speed = DEFAULTS.speed;
	let maxIterations = DEFAULTS.maxIterations;
	let sequential = DEFAULTS.sequential;
	let useOriginalCharsOnly = DEFAULTS.useOriginalCharsOnly;
	let revealDirection = DEFAULTS.revealDirection;
	let animateOn = DEFAULTS.animateOn;
	let clickMode = DEFAULTS.clickMode;
	let replay = 0;
	const hasChanges = $.derived(() => speed !== DEFAULTS.speed || maxIterations !== DEFAULTS.maxIterations || sequential !== DEFAULTS.sequential || useOriginalCharsOnly !== DEFAULTS.useOriginalCharsOnly || revealDirection !== DEFAULTS.revealDirection || animateOn !== DEFAULTS.animateOn || clickMode !== DEFAULTS.clickMode);

	function reset() {
		speed = DEFAULTS.speed;
		maxIterations = DEFAULTS.maxIterations;
		sequential = DEFAULTS.sequential;
		useOriginalCharsOnly = DEFAULTS.useOriginalCharsOnly;
		revealDirection = DEFAULTS.revealDirection;
		animateOn = DEFAULTS.animateOn;
		clickMode = DEFAULTS.clickMode;
		replay++;
	}

	const usage = $.derived(() => `<DecryptedText
  text="Hacking into the mainframe..."
  speed={${speed}}
  maxIterations={${maxIterations}}
  sequential={${sequential}}
  revealDirection="${revealDirection}"
  useOriginalCharsOnly={${useOriginalCharsOnly}}
  animateOn="${animateOn}"
  clickMode="${clickMode}"
/>`);

	const props = [
		{
			name: 'text',
			type: 'string',
			default: '""',
			description: 'The text content to decrypt.'
		},

		{
			name: 'speed',
			type: 'number',
			default: '50',
			description: 'Time in ms between each iteration.'
		},

		{
			name: 'maxIterations',
			type: 'number',
			default: '10',
			description: 'Max number of random iterations (non-sequential mode).'
		},

		{
			name: 'sequential',
			type: 'boolean',
			default: 'false',
			description: 'Whether to reveal one character at a time in sequence.'
		},

		{
			name: 'revealDirection',
			type: '"start" | "end" | "center"',
			default: '"start"',
			description: 'From which position characters begin to reveal in sequential mode.'
		},

		{
			name: 'useOriginalCharsOnly',
			type: 'boolean',
			default: 'false',
			description: 'Restrict scrambling to only the characters already in the text.'
		},

		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'CSS class for revealed characters.'
		},

		{
			name: 'parentClassName',
			type: 'string',
			default: '""',
			description: 'CSS class for the main characters container.'
		},

		{
			name: 'encryptedClassName',
			type: 'string',
			default: '""',
			description: 'CSS class for encrypted characters.'
		},

		{
			name: 'animateOn',
			type: '"view" | "hover" | "inViewHover" | "click"',
			default: '"hover"',
			description: 'Trigger scrambling on hover, scroll-into-view, or click.'
		},

		{
			name: 'clickMode',
			type: '"once" | "toggle"',
			default: '"once"',
			description: 'Click behavior; only applies when animateOn is "click".'
		}
	];

	const animateOptions = [
		{ value: 'view', label: 'View' },
		{ value: 'hover', label: 'Hover' },
		{ value: 'inViewHover', label: 'View & Hover' },
		{ value: 'click', label: 'Click' }
	];

	const clickOptions = [
		{ value: 'once', label: 'Once' },
		{ value: 'toggle', label: 'Toggle' }
	];

	const directionOptions = [
		{ value: 'start', label: 'Start' },
		{ value: 'end', label: 'End' },
		{ value: 'center', label: 'Center' }
	];

	$.head('11e2gfd', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Decrypted Text - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Decrypted Text</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container relative w-full overflow-hidden" style="height:400px;display:flex;align-items:center;justify-content:center;font-size:clamp(1.25rem, 3vw, 2.5rem);font-weight:600;">`);
			ReplayButton($$renderer, { onClick: () => replay++ });
			$$renderer.push(`<!----> <!---->`);

			{
				DecryptedText($$renderer, {
					text: 'Hacking into the mainframe...',
					speed,
					maxIterations,
					sequential,
					revealDirection,
					useOriginalCharsOnly,
					animateOn,
					clickMode
				});
			}

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'decrypted-text', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSelect($$renderer, {
						title: 'Animate On',
						options: animateOptions,
						value: animateOn,
						onChange: (v) => {
							animateOn = v;
							replay++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSelect($$renderer, {
						title: 'Click Mode',
						options: clickOptions,
						value: clickMode,
						isDisabled: animateOn !== 'click',
						onChange: (v) => {
							clickMode = v;
							replay++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSelect($$renderer, {
						title: 'Direction',
						options: directionOptions,
						value: revealDirection,
						onChange: (v) => {
							revealDirection = v;
							replay++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Speed',
						min: 10,
						max: 200,
						step: 10,
						value: speed,
						valueUnit: 'ms',
						onChange: (v) => {
							speed = v;
							replay++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Iterations',
						min: 1,
						max: 50,
						step: 1,
						value: maxIterations,
						onChange: (v) => {
							maxIterations = v;
							replay++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Sequential',
						checked: sequential,
						onChange: (v) => {
							sequential = v;
							replay++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Original Chars',
						checked: useOriginalCharsOnly,
						onChange: (v) => {
							useOriginalCharsOnly = v;
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
			componentName: 'DecryptedText',
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