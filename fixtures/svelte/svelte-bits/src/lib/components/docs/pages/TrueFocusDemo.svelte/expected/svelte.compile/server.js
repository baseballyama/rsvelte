import * as $ from 'svelte/internal/server';
import DemoCodeTab from "$lib/components/docs/preview/DemoCodeTab.svelte";
import Customize from "$lib/components/docs/preview/Customize.svelte";
import PreviewColorPicker from "$lib/components/docs/preview/PreviewColorPicker.svelte";
import PreviewSlider from "$lib/components/docs/preview/PreviewSlider.svelte";
import PreviewSwitch from "$lib/components/docs/preview/PreviewSwitch.svelte";
import PropTable from "$lib/components/docs/preview/PropTable.svelte";
import TabsLayout from "$lib/components/docs/preview/TabsLayout.svelte";
import TrueFocus from "$lib/components/library/TextAnimations/TrueFocus/TrueFocus.svelte";
import trueFocusSource from "$lib/components/library/TextAnimations/TrueFocus/TrueFocus.svelte?raw";

export default function TrueFocusDemo($$renderer) {
	const DEFAULTS = {
		manualMode: false,
		blurAmount: 5,
		animationDuration: 0.5,
		pauseBetweenAnimations: 1,
		borderColor: "#ff8a4c"
	};

	const text = "True Focus";
	let manualMode = DEFAULTS.manualMode;
	let blurAmount = DEFAULTS.blurAmount;
	let animationDuration = DEFAULTS.animationDuration;
	let pauseBetweenAnimations = DEFAULTS.pauseBetweenAnimations;
	let borderColor = DEFAULTS.borderColor;
	let replay = 0;
	const hasChanges = $.derived(() => manualMode !== DEFAULTS.manualMode || blurAmount !== DEFAULTS.blurAmount || animationDuration !== DEFAULTS.animationDuration || pauseBetweenAnimations !== DEFAULTS.pauseBetweenAnimations || borderColor !== DEFAULTS.borderColor);

	function reset() {
		manualMode = DEFAULTS.manualMode;
		blurAmount = DEFAULTS.blurAmount;
		animationDuration = DEFAULTS.animationDuration;
		pauseBetweenAnimations = DEFAULTS.pauseBetweenAnimations;
		borderColor = DEFAULTS.borderColor;
		replay++;
	}

	const usage = $.derived(() => `${"<" + 'script lang="ts">'}
  import TrueFocus from '$lib/components/TrueFocus.svelte';
${"</" + "script>"}

<TrueFocus
  sentence="${text}"
  manualMode={${manualMode}}
  blurAmount={${blurAmount}}
  borderColor="${borderColor}"
  animationDuration={${animationDuration}}
  pauseBetweenAnimations={${pauseBetweenAnimations}}
/>`);

	const props = [
		{
			name: "sentence",
			type: "string",
			default: "'True Focus'",
			description: "The text to display with the focus animation."
		},

		{
			name: "separator",
			type: "string",
			default: "' '",
			description: "Optional string used to separate words in the sentence."
		},

		{
			name: "manualMode",
			type: "boolean",
			default: "false",
			description: "Disables automatic animation when set to true."
		},

		{
			name: "blurAmount",
			type: "number",
			default: "5",
			description: "The amount of blur applied to non-active words."
		},

		{
			name: "borderColor",
			type: "string",
			default: "'#ff8a4c'",
			description: "The color of the focus borders."
		},

		{
			name: "glowColor",
			type: "string",
			default: "'rgba(0, 255, 0, 0.6)'",
			description: "The color of the glowing effect on the borders."
		},

		{
			name: "animationDuration",
			type: "number",
			default: "0.5",
			description: "The duration of the animation for each word."
		},

		{
			name: "pauseBetweenAnimations",
			type: "number",
			default: "1",
			description: "Time to pause between focusing on each word (in auto mode)."
		}
	];

	$.head('li6svg', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>True Focus - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">True Focus</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div style="position:relative;min-height:400px;display:flex;align-items:center;justify-content:center;width:100%;font-size:48px;font-weight:700;"><!---->`);

			{
				TrueFocus($$renderer, {
					sentence: text,
					manualMode,
					blurAmount,
					borderColor,
					animationDuration,
					pauseBetweenAnimations
				});
			}

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'true-focus', usage: usage(), source: trueFocusSource });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewColorPicker($$renderer, {
						title: 'Border Color',
						value: borderColor,
						onChange: (v) => borderColor = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Hover Mode',
						checked: manualMode,
						onChange: (v) => {
							manualMode = v;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Blur Amount',
						min: 0,
						max: 15,
						step: 0.05,
						valueUnit: 'px',
						value: blurAmount,
						onChange: (v) => blurAmount = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Animation Duration',
						min: 0.1,
						max: 3,
						step: 0.1,
						valueUnit: 's',
						value: animationDuration,
						onChange: (v) => animationDuration = v,
						isDisabled: !manualMode
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Pause Between Animations',
						min: 0,
						max: 5,
						step: 0.5,
						valueUnit: 's',
						value: pauseBetweenAnimations,
						onChange: (v) => pauseBetweenAnimations = v
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
			componentName: 'TrueFocus',
			usage: usage(),
			source: trueFocusSource,
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