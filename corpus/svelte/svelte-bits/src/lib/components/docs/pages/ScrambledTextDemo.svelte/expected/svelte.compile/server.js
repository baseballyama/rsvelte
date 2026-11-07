import * as $ from 'svelte/internal/server';
import Customize from "$lib/components/docs/preview/Customize.svelte";
import DemoCodeTab from "$lib/components/docs/preview/DemoCodeTab.svelte";
import PreviewInput from "$lib/components/docs/preview/PreviewInput.svelte";
import PreviewSlider from "$lib/components/docs/preview/PreviewSlider.svelte";
import PropTable from "$lib/components/docs/preview/PropTable.svelte";
import TabsLayout from "$lib/components/docs/preview/TabsLayout.svelte";
import ScrambledText from "$lib/components/library/TextAnimations/ScrambledText/ScrambledText.svelte";
import scrambledTextSource from "$lib/components/library/TextAnimations/ScrambledText/ScrambledText.svelte?raw";

export default function ScrambledTextDemo($$renderer) {
	const DEFAULTS = { radius: 100, duration: 1.2, speed: 0.5, scrambleChars: ".:" };
	let radius = DEFAULTS.radius;
	let duration = DEFAULTS.duration;
	let speed = DEFAULTS.speed;
	let scrambleChars = DEFAULTS.scrambleChars;
	let replay = 0;
	const hasChanges = $.derived(() => radius !== DEFAULTS.radius || duration !== DEFAULTS.duration || speed !== DEFAULTS.speed || scrambleChars !== DEFAULTS.scrambleChars);

	function reset() {
		radius = DEFAULTS.radius;
		duration = DEFAULTS.duration;
		speed = DEFAULTS.speed;
		scrambleChars = DEFAULTS.scrambleChars;
		replay++;
	}

	const usage = $.derived(() => `${"<" + 'script lang="ts">'}
  import ScrambledText from '$lib/components/ScrambledText.svelte';
${"</" + "script>"}

<ScrambledText
  className="scrambled-text-demo"
  radius={${radius}}
  duration={${duration}}
  speed={${speed}}
  scrambleChars="${scrambleChars}"
>
  Lorem ipsum dolor sit amet consectetur adipisicing elit. 
  Similique pariatur dignissimos porro eius quam doloremque 
  et enim velit nobis maxime.
</ScrambledText>`);

	const props = [
		{
			name: "radius",
			type: "number",
			default: "100",
			description: "The radius around the mouse pointer within which characters will scramble."
		},

		{
			name: "duration",
			type: "number",
			default: "1.2",
			description: "The duration of the scramble effect on a character."
		},

		{
			name: "speed",
			type: "number",
			default: "0.5",
			description: "The speed of the scramble animation."
		},

		{
			name: "scrambleChars",
			type: "string",
			default: "'.:'",
			description: "The characters used for scrambling."
		},

		{
			name: "className",
			type: "string",
			default: '""',
			description: "Additional CSS classes for the component."
		},

		{
			name: "style",
			type: "string",
			default: '""',
			description: "Inline styles for the component."
		}
	];

	$.head('1wbxkye', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Scrambled Text - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Scrambled Text</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="relative p-0 h-125 overflow-hidden demo-container"><!---->`);

			{
				ScrambledText($$renderer, {
					className: 'max-w-150 font-bold text-[1rem] text-(--color-primary)',
					radius,
					duration,
					speed,
					scrambleChars,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Once you hover over me, you will see the effect in action! You can
          customize the radius, duration, and speed of the scramble effect.`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, {
				slug: 'scrambled-text',
				usage: usage(),
				source: scrambledTextSource
			});
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewInput($$renderer, {
						title: 'Scramble Characters',
						value: scrambleChars,
						placeholder: 'Enter text...',
						onChange: (v) => scrambleChars = v,
						maxlength: 5
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Radius',
						min: 10,
						max: 300,
						step: 10,
						value: radius,
						onChange: (v) => radius = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Duration',
						min: 0.1,
						max: 5,
						step: 0.1,
						value: duration,
						onChange: (v) => duration = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Speed',
						min: 0.1,
						max: 2,
						step: 0.1,
						value: speed,
						onChange: (v) => speed = v
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
			componentName: 'ScrambledText',
			usage: usage(),
			source: scrambledTextSource,
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