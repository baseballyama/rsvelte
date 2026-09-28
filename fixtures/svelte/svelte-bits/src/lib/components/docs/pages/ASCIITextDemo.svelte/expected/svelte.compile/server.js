import * as $ from 'svelte/internal/server';
import Customize from "$lib/components/docs/preview/Customize.svelte";
import DemoCodeTab from "$lib/components/docs/preview/DemoCodeTab.svelte";
import PreviewInput from "$lib/components/docs/preview/PreviewInput.svelte";
import PreviewSlider from "$lib/components/docs/preview/PreviewSlider.svelte";
import PreviewSwitch from "$lib/components/docs/preview/PreviewSwitch.svelte";
import PropTable from "$lib/components/docs/preview/PropTable.svelte";
import ReplayButton from "$lib/components/docs/preview/ReplayButton.svelte";
import TabsLayout from "$lib/components/docs/preview/TabsLayout.svelte";
import ASCIIText from "$lib/components/library/TextAnimations/ASCIIText/ASCIIText.svelte";
import source from "$lib/components/library/TextAnimations/ASCIIText/ASCIIText.svelte?raw";

export default function ASCIITextDemo($$renderer) {
	const DEFAULTS = { text: "Hey!", enableWaves: true, asciiFontSize: 8 };
	let text = DEFAULTS.text;
	let enableWaves = DEFAULTS.enableWaves;
	let asciiFontSize = DEFAULTS.asciiFontSize;
	let replay = 0;
	const hasChanges = $.derived(() => text !== DEFAULTS.text || enableWaves !== DEFAULTS.enableWaves || asciiFontSize !== DEFAULTS.asciiFontSize);

	function reset() {
		text = DEFAULTS.text;
		enableWaves = DEFAULTS.enableWaves;
		asciiFontSize = DEFAULTS.asciiFontSize;
		replay++;
	}

	const scriptOpen = "<" + 'script lang="ts">';
	const scriptClose = "</" + "script>";

	const usage = $.derived(() => `${scriptOpen}
  import AnimatedContent from '$lib/components/AnimatedContent.svelte';
${scriptClose}

<ASCIIText
  text="${text}"
  enableWaves={${enableWaves}}
  asciiFontSize={${asciiFontSize}}
/>`);

	const props = [
		{
			name: "text",
			type: "string",
			default: '"Hello World!"',
			description: "The text displayed on the plane in the ASCII scene."
		},

		{
			name: "enableWaves",
			type: "boolean",
			default: "true",
			description: "If false, disables the wavy text animation."
		},

		{
			name: "asciiFontSize",
			type: "number",
			default: "12",
			description: "Size of the ASCII glyphs in the overlay."
		},

		{
			name: "textFontSize",
			type: "number",
			default: "200",
			description: "Pixel size for the text that's drawn onto the plane texture."
		},

		{
			name: "planeBaseHeight",
			type: "number",
			default: "8",
			description: "How tall the plane is in 3D. The plane width is auto-based on text aspect."
		},

		{
			name: "textColor",
			type: "string",
			default: "#FF8A4C",
			description: "The color of the text drawn onto the plane texture."
		},

		{
			name: "strokeColor",
			type: "string",
			default: "N/A",
			description: "Not used here, but you could add it if you want an outline effect."
		}
	];

	$.head('1lrq0dw', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>ASCII Text - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">ASCII Text</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="relative flex justify-center items-center w-full min-h-100 overflow-hidden demo-container">`);
			ReplayButton($$renderer, { onClick: () => replay++ });
			$$renderer.push(`<!----> <!---->`);

			{
				ASCIIText($$renderer, { text, enableWaves, asciiFontSize });
			}

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'ascii-text', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewInput($$renderer, {
						title: 'Text',
						value: text,
						placeholder: 'Enter text...',
						onChange: (val) => text = val
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Size',
						min: 1,
						max: 64,
						step: 1,
						value: asciiFontSize,
						onChange: (val) => asciiFontSize = val
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Waves',
						checked: enableWaves,
						onChange: (checked) => enableWaves = checked
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
			componentName: 'ASCIIText',
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