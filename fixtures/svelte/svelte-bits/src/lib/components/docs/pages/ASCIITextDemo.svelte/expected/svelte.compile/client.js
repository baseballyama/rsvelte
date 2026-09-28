import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div class="relative flex justify-center items-center w-full min-h-100 overflow-hidden demo-container"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">ASCII Text</h1> <!>`, 1);

export default function ASCIITextDemo($$anchor) {
	const DEFAULTS = { text: "Hey!", enableWaves: true, asciiFontSize: 8 };
	let text = $.state($.proxy(DEFAULTS.text));
	let enableWaves = $.state($.proxy(DEFAULTS.enableWaves));
	let asciiFontSize = $.state($.proxy(DEFAULTS.asciiFontSize));
	let replay = $.state(0);
	const hasChanges = $.derived(() => $.get(text) !== DEFAULTS.text || $.get(enableWaves) !== DEFAULTS.enableWaves || $.get(asciiFontSize) !== DEFAULTS.asciiFontSize);

	function reset() {
		$.set(text, DEFAULTS.text, true);
		$.set(enableWaves, DEFAULTS.enableWaves, true);
		$.set(asciiFontSize, DEFAULTS.asciiFontSize, true);
		$.update(replay);
	}

	const scriptOpen = "<" + 'script lang="ts">';
	const scriptClose = "</" + "script>";

	const usage = $.derived(() => `${scriptOpen}
  import AnimatedContent from '$lib/components/AnimatedContent.svelte';
${scriptClose}

<ASCIIText
  text="${$.get(text)}"
  enableWaves={${$.get(enableWaves)}}
  asciiFontSize={${$.get(asciiFontSize)}}
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

	var fragment = root_2();

	$.head('1lrq0dw', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'ASCII Text - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			ReplayButton(node_1, { onClick: () => $.update(replay) });

			var node_2 = $.sibling(node_1, 2);

			$.key(node_2, () => $.get(replay), ($$anchor) => {
				ASCIIText($$anchor, {
					get text() {
						return $.get(text);
					},

					get enableWaves() {
						return $.get(enableWaves);
					},

					get asciiFontSize() {
						return $.get(asciiFontSize);
					}
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'ascii-text',
				get usage() {
					return $.get(usage);
				},

				get source() {
					return source;
				}
			});
		};

		const customize = ($$anchor) => {
			Customize($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_1();
					var node_3 = $.first_child(fragment_4);

					PreviewInput(node_3, {
						title: 'Text',
						get value() {
							return $.get(text);
						},
						placeholder: 'Enter text...',
						onChange: (val) => $.set(text, val, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Size',
						min: 1,
						max: 64,
						step: 1,
						get value() {
							return $.get(asciiFontSize);
						},
						onChange: (val) => $.set(asciiFontSize, val, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSwitch(node_5, {
						title: 'Waves',
						get checked() {
							return $.get(enableWaves);
						},
						onChange: (checked) => $.set(enableWaves, checked, true)
					});

					$.append($$anchor, fragment_4);
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
			componentName: 'ASCIIText',
			get usage() {
				return $.get(usage);
			},

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

	$.append($$anchor, fragment);
}