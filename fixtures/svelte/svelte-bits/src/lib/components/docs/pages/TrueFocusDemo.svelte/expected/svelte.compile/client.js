import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DemoCodeTab from "$lib/components/docs/preview/DemoCodeTab.svelte";
import Customize from "$lib/components/docs/preview/Customize.svelte";
import PreviewColorPicker from "$lib/components/docs/preview/PreviewColorPicker.svelte";
import PreviewSlider from "$lib/components/docs/preview/PreviewSlider.svelte";
import PreviewSwitch from "$lib/components/docs/preview/PreviewSwitch.svelte";
import PropTable from "$lib/components/docs/preview/PropTable.svelte";
import TabsLayout from "$lib/components/docs/preview/TabsLayout.svelte";
import TrueFocus from "$lib/components/library/TextAnimations/TrueFocus/TrueFocus.svelte";
import trueFocusSource from "$lib/components/library/TextAnimations/TrueFocus/TrueFocus.svelte?raw";

var root = $.from_html(`<div style="position:relative;min-height:400px;display:flex;align-items:center;justify-content:center;width:100%;font-size:48px;font-weight:700;"><!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">True Focus</h1> <!>`, 1);

export default function TrueFocusDemo($$anchor) {
	const DEFAULTS = {
		manualMode: false,
		blurAmount: 5,
		animationDuration: 0.5,
		pauseBetweenAnimations: 1,
		borderColor: "#ff8a4c"
	};

	const text = "True Focus";
	let manualMode = $.state($.proxy(DEFAULTS.manualMode));
	let blurAmount = $.state($.proxy(DEFAULTS.blurAmount));
	let animationDuration = $.state($.proxy(DEFAULTS.animationDuration));
	let pauseBetweenAnimations = $.state($.proxy(DEFAULTS.pauseBetweenAnimations));
	let borderColor = $.state($.proxy(DEFAULTS.borderColor));
	let replay = $.state(0);
	const hasChanges = $.derived(() => $.get(manualMode) !== DEFAULTS.manualMode || $.get(blurAmount) !== DEFAULTS.blurAmount || $.get(animationDuration) !== DEFAULTS.animationDuration || $.get(pauseBetweenAnimations) !== DEFAULTS.pauseBetweenAnimations || $.get(borderColor) !== DEFAULTS.borderColor);

	function reset() {
		$.set(manualMode, DEFAULTS.manualMode, true);
		$.set(blurAmount, DEFAULTS.blurAmount, true);
		$.set(animationDuration, DEFAULTS.animationDuration, true);
		$.set(pauseBetweenAnimations, DEFAULTS.pauseBetweenAnimations, true);
		$.set(borderColor, DEFAULTS.borderColor, true);
		$.update(replay);
	}

	const usage = $.derived(() => `${"<" + 'script lang="ts">'}
  import TrueFocus from '$lib/components/TrueFocus.svelte';
${"</" + "script>"}

<TrueFocus
  sentence="${text}"
  manualMode={${$.get(manualMode)}}
  blurAmount={${$.get(blurAmount)}}
  borderColor="${$.get(borderColor)}"
  animationDuration={${$.get(animationDuration)}}
  pauseBetweenAnimations={${$.get(pauseBetweenAnimations)}}
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

	var fragment = root_2();

	$.head('li6svg', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'True Focus - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			$.key(node_1, () => $.get(replay), ($$anchor) => {
				TrueFocus($$anchor, {
					sentence: text,
					get manualMode() {
						return $.get(manualMode);
					},

					get blurAmount() {
						return $.get(blurAmount);
					},

					get borderColor() {
						return $.get(borderColor);
					},

					get animationDuration() {
						return $.get(animationDuration);
					},

					get pauseBetweenAnimations() {
						return $.get(pauseBetweenAnimations);
					}
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'true-focus',
				get usage() {
					return $.get(usage);
				},

				get source() {
					return trueFocusSource;
				}
			});
		};

		const customize = ($$anchor) => {
			Customize($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_1();
					var node_2 = $.first_child(fragment_4);

					PreviewColorPicker(node_2, {
						title: 'Border Color',
						get value() {
							return $.get(borderColor);
						},
						onChange: (v) => $.set(borderColor, v, true)
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSwitch(node_3, {
						title: 'Hover Mode',
						get checked() {
							return $.get(manualMode);
						},

						onChange: (v) => {
							$.set(manualMode, v, true);
						}
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Blur Amount',
						min: 0,
						max: 15,
						step: 0.05,
						valueUnit: 'px',
						get value() {
							return $.get(blurAmount);
						},
						onChange: (v) => $.set(blurAmount, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					{
						let $0 = $.derived(() => !$.get(manualMode));

						PreviewSlider(node_5, {
							title: 'Animation Duration',
							min: 0.1,
							max: 3,
							step: 0.1,
							valueUnit: 's',
							get value() {
								return $.get(animationDuration);
							},
							onChange: (v) => $.set(animationDuration, v, true),
							get isDisabled() {
								return $.get($0);
							}
						});
					}

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Pause Between Animations',
						min: 0,
						max: 5,
						step: 0.5,
						valueUnit: 's',
						get value() {
							return $.get(pauseBetweenAnimations);
						},
						onChange: (v) => $.set(pauseBetweenAnimations, v, true)
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
			componentName: 'TrueFocus',
			get usage() {
				return $.get(usage);
			},

			get source() {
				return trueFocusSource;
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