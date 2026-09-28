import * as $ from 'svelte/internal/server';
import Customize from "$lib/components/docs/preview/Customize.svelte";
import DemoCodeTab from "$lib/components/docs/preview/DemoCodeTab.svelte";
import PreviewInput from "$lib/components/docs/preview/PreviewInput.svelte";
import PreviewSelect from "$lib/components/docs/preview/PreviewSelect.svelte";
import PreviewSlider from "$lib/components/docs/preview/PreviewSlider.svelte";
import PropTable from "$lib/components/docs/preview/PropTable.svelte";
import TabsLayout from "$lib/components/docs/preview/TabsLayout.svelte";
import CircularText from "$lib/components/library/TextAnimations/CircularText/CircularText.svelte";
import source from "$lib/components/library/TextAnimations/CircularText/CircularText.svelte?raw";

export default function CircularTextDemo($$renderer) {
	const DEFAULTS = {
		text: "SVELTE*BITS*COMPONENTS*",
		onHover: "speedUp",
		spinDuration: 20
	};

	let text = DEFAULTS.text;
	let onHover = DEFAULTS.onHover;
	let spinDuration = DEFAULTS.spinDuration;
	let replay = 0;
	const hasChanges = $.derived(() => text !== DEFAULTS.text || onHover !== DEFAULTS.onHover || spinDuration !== DEFAULTS.spinDuration);

	function reset() {
		text = DEFAULTS.text;
		onHover = DEFAULTS.onHover;
		spinDuration = DEFAULTS.spinDuration;
		replay++;
	}

	const usage = $.derived(() => `${"<" + 'script lang="ts">'}
  import CircularText from '$lib/components/CircularText.svelte';
${"</" + "script>"}

<CircularText
  text="${text}"
  onHover="${onHover}"
  spinDuration={${spinDuration}}
  className="custom-class"
/>`);

	const props = [
		{
			name: "text",
			type: "string",
			default: "''",
			description: "The text to display in a circular layout."
		},

		{
			name: "spinDuration",
			type: "number",
			default: "20",
			description: "The duration (in seconds) for one full rotation."
		},

		{
			name: "onHover",
			type: "'slowDown' | 'speedUp' | 'pause' | 'goBonkers'",
			default: "undefined",
			description: "Specifies the hover behavior variant. Options include 'slowDown', 'speedUp', 'pause', and 'goBonkers'."
		},

		{
			name: "className",
			type: "string",
			default: "''",
			description: "Optional additional CSS classes to apply to the component."
		}
	];

	$.head('96g4jw', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Circular Text - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Circular Text</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="relative p-0 h-125 overflow-hidden demo-container"><!---->`);

			{
				CircularText($$renderer, { text, onHover, spinDuration });
			}

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'circular-text', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewInput($$renderer, {
						title: 'Text',
						value: text,
						placeholder: 'Enter text...',
						onChange: (v) => text = v
					});

					$$renderer.push(`<!----> `);

					PreviewSelect($$renderer, {
						title: 'On Hover',
						options: [
							{ label: "Slow Down", value: "slowDown" },
							{ label: "Speed Up", value: "speedUp" },
							{ label: "Pause", value: "pause" },
							{ label: "Go Bonkers", value: "goBonkers" }
						],
						value: onHover,
						onChange: (v) => onHover = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Spin Duration',
						value: spinDuration,
						min: 1,
						max: 60,
						step: 1,
						valueUnit: 's',
						onChange: (v) => spinDuration = v
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
			componentName: 'CircularText',
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