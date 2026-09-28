import * as $ from 'svelte/internal/server';
import Customize from "$lib/components/docs/preview/Customize.svelte";
import DemoCodeTab from "$lib/components/docs/preview/DemoCodeTab.svelte";
import PreviewSlider from "$lib/components/docs/preview/PreviewSlider.svelte";
import PropTable from "$lib/components/docs/preview/PropTable.svelte";
import TabsLayout from "$lib/components/docs/preview/TabsLayout.svelte";
import FallingText from "$lib/components/library/TextAnimations/FallingText/FallingText.svelte";
import fallingTextSource from "$lib/components/library/TextAnimations/FallingText/FallingText.svelte?raw";
import PreviewSelect from "../preview/PreviewSelect.svelte";

export default function FallingTextDemo($$renderer) {
	const DEFAULTS = {
		gravity: 0.56,
		mouseConstraintStiffness: 0.9,
		trigger: "hover"
	};

	let gravity = DEFAULTS.gravity;
	let mouseConstraintStiffness = DEFAULTS.mouseConstraintStiffness;
	let trigger = DEFAULTS.trigger;
	let replay = 0;
	const hasChanges = $.derived(() => gravity !== DEFAULTS.gravity || mouseConstraintStiffness !== DEFAULTS.mouseConstraintStiffness || trigger !== DEFAULTS.trigger);

	function reset() {
		gravity = DEFAULTS.gravity;
		mouseConstraintStiffness = DEFAULTS.mouseConstraintStiffness;
		trigger = DEFAULTS.trigger;
		replay++;
	}

	const usage = $.derived(() => `${"<" + 'script lang="ts">'}
  import FallingText from '$lib/components/FallingText.svelte';
${"</" + "script>"}

<FallingText
  text={\`Svelte Bits is a library of animated and interactive Svelte components designed to streamline UI development and simplify your workflow.\`}
  highlightWords={["Svelte", "Bits", "animated", "components", "simplify"]}
  highlightClass="highlighted"
  trigger="${trigger}"
  backgroundColor="transparent"
  wireframes={false}
  gravity={${gravity}}
  fontSize="2rem"
  mouseConstraintStiffness={${mouseConstraintStiffness}}
/>`);

	const props = [
		{
			name: "text",
			type: "string",
			default: "",
			description: "The text content to display and eventually animate."
		},

		{
			name: "highlightWords",
			type: "string[]",
			default: "[]",
			description: "List of words or substrings to apply a highlight style."
		},

		{
			name: "highlightClass",
			type: "string",
			default: `"highlighted"`,
			description: "CSS class name for highlighted words."
		},

		{
			name: "trigger",
			type: "'click' | 'hover' | 'auto' | 'scroll'",
			default: `"click"`,
			description: "Defines how the falling effect is activated."
		},

		{
			name: "backgroundColor",
			type: "string",
			default: `"transparent"`,
			description: "Canvas background color for the physics world."
		},

		{
			name: "wireframes",
			type: "boolean",
			default: "false",
			description: "Whether to render the physics bodies in wireframe mode."
		},

		{
			name: "gravity",
			type: "number",
			default: "1",
			description: "Vertical gravity factor for the physics engine."
		},

		{
			name: "mouseConstraintStiffness",
			type: "number",
			default: "0.2",
			description: "Stiffness for the mouse drag constraint."
		},

		{
			name: "fontSize",
			type: "string",
			default: `"1rem"`,
			description: "Font size applied to the text before it falls."
		},

		{
			name: "wordSpacing",
			type: "string",
			default: `"2px"`,
			description: "Horizontal spacing between each word."
		}
	];

	$.head('1ceysns', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Falling Text - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Falling Text</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="relative p-0 h-125 overflow-hidden demo-container"><!---->`);

			{
				FallingText($$renderer, {
					text: 'Svelte Bits is a library of animated and interactive Svelte components designed to streamline UI development and simplify your workflow.',
					highlightWords: ["Svelte", "Bits", "animated", "components", "simplify"],
					highlightClass: 'text-orange-500 font-bold',
					trigger,
					gravity,
					fontSize: '2rem',
					mouseConstraintStiffness
				});
			}

			$$renderer.push(`<!----> <div class="z-0 absolute font-black text-[#222] text-[4rem] select-none">${$.escape(trigger === "hover"
				? "Hover Me"
				: trigger === "click" ? "Click Me" : "Auto Start")}</div></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, {
				slug: 'true-focus',
				usage: usage(),
				source: fallingTextSource
			});
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSelect($$renderer, {
						title: 'Trigger',
						options: [
							{ value: "hover", label: "Hover" },
							{ value: "click", label: "Click" },
							{ value: "auto", label: "Auto" },
							{ value: "scroll", label: "Scroll" }
						],
						value: trigger,
						onChange: (v) => {
							trigger = v;
							replay++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Gravity',
						min: 0.1,
						max: 2,
						step: 0.01,
						value: gravity,
						onChange: (v) => gravity = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Mouse Constraint Stiffness',
						min: 0.1,
						max: 2,
						step: 0.1,
						value: mouseConstraintStiffness,
						onChange: (v) => mouseConstraintStiffness = v
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
			componentName: 'FallingText',
			usage: usage(),
			source: fallingTextSource,
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