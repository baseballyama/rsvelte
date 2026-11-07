import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewInput from '$lib/components/docs/preview/PreviewInput.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import ReplayButton from '$lib/components/docs/preview/ReplayButton.svelte';
import TextPressure from '$lib/components/library/TextAnimations/TextPressure/TextPressure.svelte';
import source from '$lib/components/library/TextAnimations/TextPressure/TextPressure.svelte?raw';

export default function TextPressureDemo($$renderer) {
	const DEFAULTS = {
		text: 'Hello!',
		flex: true,
		alpha: false,
		stroke: false,
		width: true,
		weight: true,
		italic: true,
		textColor: '#ffffff',
		strokeColor: '#5227FF'
	};

	let text = DEFAULTS.text;
	let flex = DEFAULTS.flex;
	let alpha = DEFAULTS.alpha;
	let stroke = DEFAULTS.stroke;
	let width = DEFAULTS.width;
	let weight = DEFAULTS.weight;
	let italic = DEFAULTS.italic;
	let textColor = DEFAULTS.textColor;
	let strokeColor = DEFAULTS.strokeColor;
	let replay = 0;
	const hasChanges = $.derived(() => text !== DEFAULTS.text || flex !== DEFAULTS.flex || alpha !== DEFAULTS.alpha || stroke !== DEFAULTS.stroke || width !== DEFAULTS.width || weight !== DEFAULTS.weight || italic !== DEFAULTS.italic || textColor !== DEFAULTS.textColor || strokeColor !== DEFAULTS.strokeColor);

	function reset() {
		text = DEFAULTS.text;
		flex = DEFAULTS.flex;
		alpha = DEFAULTS.alpha;
		stroke = DEFAULTS.stroke;
		width = DEFAULTS.width;
		weight = DEFAULTS.weight;
		italic = DEFAULTS.italic;
		textColor = DEFAULTS.textColor;
		strokeColor = DEFAULTS.strokeColor;
		replay++;
	}

	const usage = $.derived(() => `<TextPressure
  text="${text}"
  flex={${flex}}
  alpha={${alpha}}
  stroke={${stroke}}
  width={${width}}
  weight={${weight}}
  italic={${italic}}
  textColor="${textColor}"
  strokeColor="${strokeColor}"
  minFontSize={36}
/>`);

	const props = [
		{
			name: 'text',
			type: 'string',
			default: '"Hello!"',
			description: 'Text content that will be displayed and animated.'
		},

		{
			name: 'fontFamily',
			type: 'string',
			default: '"Compressa VF"',
			description: 'Name of the variable font family.'
		},

		{
			name: 'fontUrl',
			type: 'string',
			default: 'CompressaPRO-GX.woff2',
			description: 'URL for the variable font file (needed).'
		},

		{
			name: 'flex',
			type: 'boolean',
			default: 'true',
			description: 'Whether the characters are spaced using flex layout.'
		},

		{
			name: 'scale',
			type: 'boolean',
			default: 'false',
			description: 'If true, vertically scales the text to fill its container height.'
		},

		{
			name: 'alpha',
			type: 'boolean',
			default: 'false',
			description: 'If true, applies an opacity effect based on cursor distance.'
		},

		{
			name: 'stroke',
			type: 'boolean',
			default: 'false',
			description: 'If true, adds a stroke effect around characters.'
		},

		{
			name: 'width',
			type: 'boolean',
			default: 'true',
			description: 'If true, varies the variable-font "width" axis.'
		},

		{
			name: 'weight',
			type: 'boolean',
			default: 'true',
			description: 'If true, varies the variable-font "weight" axis.'
		},

		{
			name: 'italic',
			type: 'boolean',
			default: 'true',
			description: 'If true, varies the variable-font "italics" axis.'
		},

		{
			name: 'textColor',
			type: 'string',
			default: '"#FFFFFF"',
			description: 'The fill color of the text.'
		},

		{
			name: 'strokeColor',
			type: 'string',
			default: '"#FF0000"',
			description: 'The stroke color applied when "stroke" is true.'
		},

		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'Additional class for styling the <h1> wrapper.'
		},

		{
			name: 'minFontSize',
			type: 'number',
			default: '24',
			description: 'Minimum font-size to avoid overly tiny text on smaller screens.'
		}
	];

	$.head('1hjmzzy', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Text Pressure - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Text Pressure</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container relative w-full overflow-hidden" style="height:400px;max-height:450px;display:flex;align-items:center;justify-content:center;">`);
			ReplayButton($$renderer, { onClick: () => replay++ });
			$$renderer.push(`<!----> <div style="width:100%;height:100%;"><!---->`);

			{
				TextPressure($$renderer, {
					text,
					flex,
					alpha,
					stroke,
					width,
					weight,
					italic,
					textColor,
					strokeColor,
					minFontSize: 36
				});
			}

			$$renderer.push(`<!----></div></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'text-pressure', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewColorPicker($$renderer, {
						title: 'Text Color',
						value: textColor,
						onChange: (v) => {
							textColor = v;
							replay++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewColorPicker($$renderer, {
						title: 'Stroke Color',
						value: strokeColor,
						onChange: (v) => {
							strokeColor = v;
							replay++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewInput($$renderer, {
						title: 'Text',
						value: text,
						placeholder: 'Your text here...',
						maxlength: 10,
						onChange: (v) => {
							text = v;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Flex',
						checked: flex,
						onChange: (v) => {
							flex = v;
							replay++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Alpha',
						checked: alpha,
						onChange: (v) => {
							alpha = v;
							replay++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Stroke',
						checked: stroke,
						onChange: (v) => {
							stroke = v;
							replay++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Width',
						checked: width,
						onChange: (v) => {
							width = v;
							replay++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Weight',
						checked: weight,
						onChange: (v) => {
							weight = v;
							replay++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Italic',
						checked: italic,
						onChange: (v) => {
							italic = v;
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
			componentName: 'TextPressure',
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