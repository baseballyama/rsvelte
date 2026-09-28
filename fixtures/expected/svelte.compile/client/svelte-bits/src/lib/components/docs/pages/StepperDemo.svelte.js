import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewInput from '$lib/components/docs/preview/PreviewInput.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import Stepper from '$lib/components/library/Components/Stepper/Stepper.svelte';
import source from '$lib/components/library/Components/Stepper/Stepper.svelte?raw';

const step1 = ($$anchor) => {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
};

const step2 = ($$anchor) => {
	var fragment_1 = root_1();

	$.next(2);
	$.append($$anchor, fragment_1);
};

const step4 = ($$anchor) => {
	var fragment_3 = root_3();

	$.next(2);
	$.append($$anchor, fragment_3);
};

var root = $.from_html(`<p style="color:#FF8A4C;font-size:1.2rem;font-weight:600;">Welcome to the svelte-bits stepper!</p> <p style="color:#fff;">Check out the next step!</p>`, 1);
var root_1 = $.from_html(`<h2 style="color:#fff;">Step 2</h2> <p style="color:#fff;margin-top:1em;">Custom step content!</p>`, 1);
var root_2 = $.from_html(`<h2 style="color:#fff;">How about an input?</h2> <input placeholder="Your name?" style="margin-top:0.5rem;width:100%;padding:0.5rem 0.75rem;border-radius:8px;background:#1a1a1a;border:1px solid #333;color:#fff;"/>`, 1);
var root_3 = $.from_html(`<p style="color:#FF8A4C;font-size:1.2rem;font-weight:600;">Final Step</p> <p style="color:#fff;">You made it!</p>`, 1);
var root_4 = $.from_html(`<div class="demo-container" style="position:relative;height:500px;overflow:hidden;display:flex;align-items:center;justify-content:center;"><!></div>`);
var root_5 = $.from_html(`<!> <!> <!>`, 1);
var root_6 = $.from_html(`<h1 class="sub-category">Stepper</h1> <!>`, 1);

export default function StepperDemo($$anchor) {
	const step3 = ($$anchor) => {
		var fragment_2 = root_2();
		var input = $.sibling($.first_child(fragment_2), 2);

		$.remove_input_defaults(input);
		$.bind_value(input, () => $.get(name), ($$value) => $.set(name, $$value));
		$.append($$anchor, fragment_2);
	};

	const DEFAULTS = {
		backButtonText: 'Previous',
		nextButtonText: 'Next',
		disableStepIndicators: false
	};

	let backButtonText = $.state($.proxy(DEFAULTS.backButtonText));
	let nextButtonText = $.state($.proxy(DEFAULTS.nextButtonText));
	let disableStepIndicators = $.state($.proxy(DEFAULTS.disableStepIndicators));
	let name = $.state('');
	const hasChanges = $.derived(() => $.get(backButtonText) !== DEFAULTS.backButtonText || $.get(nextButtonText) !== DEFAULTS.nextButtonText || $.get(disableStepIndicators) !== DEFAULTS.disableStepIndicators);

	function reset() {
		$.set(backButtonText, DEFAULTS.backButtonText, true);
		$.set(nextButtonText, DEFAULTS.nextButtonText, true);
		$.set(disableStepIndicators, DEFAULTS.disableStepIndicators, true);
		$.set(name, '');
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

	var fragment_4 = root_6();

	$.head('7qr787', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Stepper - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment_4), 2);

	{
		const preview = ($$anchor) => {
			var div = root_4();
			var node_1 = $.child(div);

			{
				let $0 = $.derived(() => [step1, step2, step3, step4]);

				Stepper(node_1, {
					get steps() {
						return $.get($0);
					},
					initialStep: 1,
					get backButtonText() {
						return $.get(backButtonText);
					},

					get nextButtonText() {
						return $.get(nextButtonText);
					},

					get disableStepIndicators() {
						return $.get(disableStepIndicators);
					}
				});
			}

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'stepper',
				usage,
				get source() {
					return source;
				}
			});
		};

		const customize = ($$anchor) => {
			Customize($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_7 = root_5();
					var node_2 = $.first_child(fragment_7);

					PreviewInput(node_2, {
						title: 'Back Button Text',
						get value() {
							return $.get(backButtonText);
						},
						placeholder: 'Back',
						onChange: (v) => $.set(backButtonText, v, true)
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewInput(node_3, {
						title: 'Next Button Text',
						get value() {
							return $.get(nextButtonText);
						},
						placeholder: 'Continue',
						onChange: (v) => $.set(nextButtonText, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSwitch(node_4, {
						title: 'Disable Step Indicators',
						get checked() {
							return $.get(disableStepIndicators);
						},
						onChange: (v) => $.set(disableStepIndicators, v, true)
					});

					$.append($$anchor, fragment_7);
				},
				$$slots: { default: true }
			});
		};

		const propTable = ($$anchor) => {
			PropTable($$anchor, {
				get rows() {
					return props;
				}
			});
		};

		TabsLayout(node, {
			onreset: reset,
			get hasChanges() {
				return $.get(hasChanges);
			},
			componentName: 'Stepper',
			usage,
			get source() {
				return source;
			},

			get props() {
				return props;
			},
			preview,
			code,
			customize,
			propTable,
			$$slots: { preview: true, code: true, customize: true, propTable: true }
		});
	}

	$.append($$anchor, fragment_4);
}