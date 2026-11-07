import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Customize from "$lib/components/docs/preview/Customize.svelte";
import DemoCodeTab from "$lib/components/docs/preview/DemoCodeTab.svelte";
import PreviewInput from "$lib/components/docs/preview/PreviewInput.svelte";
import PreviewSlider from "$lib/components/docs/preview/PreviewSlider.svelte";
import PropTable from "$lib/components/docs/preview/PropTable.svelte";
import TabsLayout from "$lib/components/docs/preview/TabsLayout.svelte";
import ScrambledText from "$lib/components/library/TextAnimations/ScrambledText/ScrambledText.svelte";
import scrambledTextSource from "$lib/components/library/TextAnimations/ScrambledText/ScrambledText.svelte?raw";

var root = $.from_html(`<div class="relative p-0 h-125 overflow-hidden demo-container"><!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Scrambled Text</h1> <!>`, 1);

export default function ScrambledTextDemo($$anchor) {
	const DEFAULTS = { radius: 100, duration: 1.2, speed: 0.5, scrambleChars: ".:" };
	let radius = $.state($.proxy(DEFAULTS.radius));
	let duration = $.state($.proxy(DEFAULTS.duration));
	let speed = $.state($.proxy(DEFAULTS.speed));
	let scrambleChars = $.state($.proxy(DEFAULTS.scrambleChars));
	let replay = $.state(0);
	const hasChanges = $.derived(() => $.get(radius) !== DEFAULTS.radius || $.get(duration) !== DEFAULTS.duration || $.get(speed) !== DEFAULTS.speed || $.get(scrambleChars) !== DEFAULTS.scrambleChars);

	function reset() {
		$.set(radius, DEFAULTS.radius, true);
		$.set(duration, DEFAULTS.duration, true);
		$.set(speed, DEFAULTS.speed, true);
		$.set(scrambleChars, DEFAULTS.scrambleChars, true);
		$.update(replay);
	}

	const usage = $.derived(() => `${"<" + 'script lang="ts">'}
  import ScrambledText from '$lib/components/ScrambledText.svelte';
${"</" + "script>"}

<ScrambledText
  className="scrambled-text-demo"
  radius={${$.get(radius)}}
  duration={${$.get(duration)}}
  speed={${$.get(speed)}}
  scrambleChars="${$.get(scrambleChars)}"
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

	var fragment = root_2();

	$.head('1wbxkye', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Scrambled Text - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			$.key(node_1, () => $.get(replay), ($$anchor) => {
				ScrambledText($$anchor, {
					className: 'max-w-150 font-bold text-[1rem] text-(--color-primary)',
					get radius() {
						return $.get(radius);
					},

					get duration() {
						return $.get(duration);
					},

					get speed() {
						return $.get(speed);
					},

					get scrambleChars() {
						return $.get(scrambleChars);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Once you hover over me, you will see the effect in action! You can\n          customize the radius, duration, and speed of the scramble effect.');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'scrambled-text',
				get usage() {
					return $.get(usage);
				},

				get source() {
					return scrambledTextSource;
				}
			});
		};

		const customize = ($$anchor) => {
			Customize($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_1();
					var node_2 = $.first_child(fragment_4);

					PreviewInput(node_2, {
						title: 'Scramble Characters',
						get value() {
							return $.get(scrambleChars);
						},
						placeholder: 'Enter text...',
						onChange: (v) => $.set(scrambleChars, v, true),
						maxlength: 5
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSlider(node_3, {
						title: 'Radius',
						min: 10,
						max: 300,
						step: 10,
						get value() {
							return $.get(radius);
						},
						onChange: (v) => $.set(radius, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Duration',
						min: 0.1,
						max: 5,
						step: 0.1,
						get value() {
							return $.get(duration);
						},
						onChange: (v) => $.set(duration, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Speed',
						min: 0.1,
						max: 2,
						step: 0.1,
						get value() {
							return $.get(speed);
						},
						onChange: (v) => $.set(speed, v, true)
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
			componentName: 'ScrambledText',
			get usage() {
				return $.get(usage);
			},

			get source() {
				return scrambledTextSource;
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