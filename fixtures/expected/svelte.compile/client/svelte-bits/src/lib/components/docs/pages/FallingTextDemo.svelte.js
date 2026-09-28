import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Customize from "$lib/components/docs/preview/Customize.svelte";
import DemoCodeTab from "$lib/components/docs/preview/DemoCodeTab.svelte";
import PreviewSlider from "$lib/components/docs/preview/PreviewSlider.svelte";
import PropTable from "$lib/components/docs/preview/PropTable.svelte";
import TabsLayout from "$lib/components/docs/preview/TabsLayout.svelte";
import FallingText from "$lib/components/library/TextAnimations/FallingText/FallingText.svelte";
import fallingTextSource from "$lib/components/library/TextAnimations/FallingText/FallingText.svelte?raw";
import PreviewSelect from "../preview/PreviewSelect.svelte";

var root = $.from_html(`<div class="relative p-0 h-125 overflow-hidden demo-container"><!> <div class="z-0 absolute font-black text-[#222] text-[4rem] select-none"> </div></div>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Falling Text</h1> <!>`, 1);

export default function FallingTextDemo($$anchor) {
	const DEFAULTS = {
		gravity: 0.56,
		mouseConstraintStiffness: 0.9,
		trigger: "hover"
	};

	let gravity = $.state($.proxy(DEFAULTS.gravity));
	let mouseConstraintStiffness = $.state($.proxy(DEFAULTS.mouseConstraintStiffness));
	let trigger = $.state($.proxy(DEFAULTS.trigger));
	let replay = $.state(0);
	const hasChanges = $.derived(() => $.get(gravity) !== DEFAULTS.gravity || $.get(mouseConstraintStiffness) !== DEFAULTS.mouseConstraintStiffness || $.get(trigger) !== DEFAULTS.trigger);

	function reset() {
		$.set(gravity, DEFAULTS.gravity, true);
		$.set(mouseConstraintStiffness, DEFAULTS.mouseConstraintStiffness, true);
		$.set(trigger, DEFAULTS.trigger, true);
		$.update(replay);
	}

	const usage = $.derived(() => `${"<" + 'script lang="ts">'}
  import FallingText from '$lib/components/FallingText.svelte';
${"</" + "script>"}

<FallingText
  text={\`Svelte Bits is a library of animated and interactive Svelte components designed to streamline UI development and simplify your workflow.\`}
  highlightWords={["Svelte", "Bits", "animated", "components", "simplify"]}
  highlightClass="highlighted"
  trigger="${$.get(trigger)}"
  backgroundColor="transparent"
  wireframes={false}
  gravity={${$.get(gravity)}}
  fontSize="2rem"
  mouseConstraintStiffness={${$.get(mouseConstraintStiffness)}}
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

	var fragment = root_2();

	$.head('1ceysns', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Falling Text - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			$.key(node_1, () => $.get(replay), ($$anchor) => {
				FallingText($$anchor, {
					text: 'Svelte Bits is a library of animated and interactive Svelte components designed to streamline UI development and simplify your workflow.',
					highlightWords: ["Svelte", "Bits", "animated", "components", "simplify"],
					highlightClass: 'text-orange-500 font-bold',
					get trigger() {
						return $.get(trigger);
					},

					get gravity() {
						return $.get(gravity);
					},
					fontSize: '2rem',
					get mouseConstraintStiffness() {
						return $.get(mouseConstraintStiffness);
					}
				});
			});

			var div_1 = $.sibling(node_1, 2);
			var text = $.only_child(div_1, true);

			$.reset(div);

			$.template_effect(() => $.set_text(text, $.get(trigger) === "hover"
				? "Hover Me"
				: $.get(trigger) === "click" ? "Click Me" : "Auto Start"));

			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'true-focus',
				get usage() {
					return $.get(usage);
				},

				get source() {
					return fallingTextSource;
				}
			});
		};

		const customize = ($$anchor) => {
			Customize($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_1();
					var node_2 = $.first_child(fragment_4);

					PreviewSelect(node_2, {
						title: 'Trigger',
						options: [
							{ value: "hover", label: "Hover" },
							{ value: "click", label: "Click" },
							{ value: "auto", label: "Auto" },
							{ value: "scroll", label: "Scroll" }
						],

						get value() {
							return $.get(trigger);
						},

						onChange: (v) => {
							$.set(trigger, v, true);
							$.update(replay);
						}
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSlider(node_3, {
						title: 'Gravity',
						min: 0.1,
						max: 2,
						step: 0.01,
						get value() {
							return $.get(gravity);
						},
						onChange: (v) => $.set(gravity, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Mouse Constraint Stiffness',
						min: 0.1,
						max: 2,
						step: 0.1,
						get value() {
							return $.get(mouseConstraintStiffness);
						},
						onChange: (v) => $.set(mouseConstraintStiffness, v, true)
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
			componentName: 'FallingText',
			get usage() {
				return $.get(usage);
			},

			get source() {
				return fallingTextSource;
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