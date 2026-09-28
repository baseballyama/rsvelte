import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewInput from '$lib/components/docs/preview/PreviewInput.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import Stepper from '$lib/components/library/Components/Stepper/Stepper.svelte';
import source from '$lib/components/library/Components/Stepper/Stepper.svelte?raw';

function step1($$renderer) {
	$$renderer.push(`<p style="color:#FF8A4C;font-size:1.2rem;font-weight:600;">Welcome to the svelte-bits stepper!</p> <p style="color:#fff;">Check out the next step!</p>`);
}

function step2($$renderer) {
	$$renderer.push(`<h2 style="color:#fff;">Step 2</h2> <p style="color:#fff;margin-top:1em;">Custom step content!</p>`);
}

function step4($$renderer) {
	$$renderer.push(`<p style="color:#FF8A4C;font-size:1.2rem;font-weight:600;">Final Step</p> <p style="color:#fff;">You made it!</p>`);
}

export default function StepperDemo($$renderer) {
	const DEFAULTS = {
		backButtonText: 'Previous',
		nextButtonText: 'Next',
		disableStepIndicators: false
	};

	let backButtonText = DEFAULTS.backButtonText;
	let nextButtonText = DEFAULTS.nextButtonText;
	let disableStepIndicators = DEFAULTS.disableStepIndicators;
	let name = '';
	const hasChanges = $.derived(() => backButtonText !== DEFAULTS.backButtonText || nextButtonText !== DEFAULTS.nextButtonText || disableStepIndicators !== DEFAULTS.disableStepIndicators);

	function reset() {
		backButtonText = DEFAULTS.backButtonText;
		nextButtonText = DEFAULTS.nextButtonText;
		disableStepIndicators = DEFAULTS.disableStepIndicators;
		name = '';
	}

	const usage = `<Stepper steps={[step1, step2, step3]} initialStep={1} onStepChange={(s) => {}} onFinalStepCompleted={() => {}} backButtonText="Back" nextButtonText="Continue" />`;

	const props = [
		{
			name: 'steps',
			type: 'Snippet[]',
			default: '-',
			description: 'Array of step content snippets.'
		},

		{
			name: 'initialStep',
			type: 'number',
			default: '1',
			description: 'First step displayed.'
		},

		{
			name: 'onStepChange',
			type: '(step: number) => void',
			default: '-',
			description: 'Fired on step change.'
		},

		{
			name: 'onFinalStepCompleted',
			type: '() => void',
			default: '-',
			description: 'Fired after final step.'
		},

		{
			name: 'backButtonText',
			type: 'string',
			default: '"Back"',
			description: 'Text for the Back button.'
		},

		{
			name: 'nextButtonText',
			type: 'string',
			default: '"Continue"',
			description: 'Text for the Next button.'
		},

		{
			name: 'disableStepIndicators',
			type: 'boolean',
			default: 'false',
			description: 'Disables click on step indicators.'
		},

		{
			name: 'accentColor',
			type: 'string',
			default: '"#FF8A4C"',
			description: 'Brand accent color.'
		}
	];

	function step3($$renderer) {
		$$renderer.push(`<h2 style="color:#fff;">How about an input?</h2> <input${$.attr('value', name)} placeholder="Your name?" style="margin-top:0.5rem;width:100%;padding:0.5rem 0.75rem;border-radius:8px;background:#1a1a1a;border:1px solid #333;color:#fff;"/>`);
	}

	$.head('7qr787', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Stepper - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Stepper</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container" style="position:relative;height:500px;overflow:hidden;display:flex;align-items:center;justify-content:center;">`);

			Stepper($$renderer, {
				steps: [step1, step2, step3, step4],
				initialStep: 1,
				backButtonText,
				nextButtonText,
				disableStepIndicators
			});

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'stepper', usage, source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewInput($$renderer, {
						title: 'Back Button Text',
						value: backButtonText,
						placeholder: 'Back',
						onChange: (v) => backButtonText = v
					});

					$$renderer.push(`<!----> `);

					PreviewInput($$renderer, {
						title: 'Next Button Text',
						value: nextButtonText,
						placeholder: 'Continue',
						onChange: (v) => nextButtonText = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Disable Step Indicators',
						checked: disableStepIndicators,
						onChange: (v) => disableStepIndicators = v
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
			componentName: 'Stepper',
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