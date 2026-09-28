import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Customize from "$lib/components/docs/preview/Customize.svelte";
import DemoCodeTab from "$lib/components/docs/preview/DemoCodeTab.svelte";
import PreviewInput from "$lib/components/docs/preview/PreviewInput.svelte";
import PreviewSelect from "$lib/components/docs/preview/PreviewSelect.svelte";
import PreviewSlider from "$lib/components/docs/preview/PreviewSlider.svelte";
import PropTable from "$lib/components/docs/preview/PropTable.svelte";
import TabsLayout from "$lib/components/docs/preview/TabsLayout.svelte";
import CircularText from "$lib/components/library/TextAnimations/CircularText/CircularText.svelte";
import source from "$lib/components/library/TextAnimations/CircularText/CircularText.svelte?raw";

var root = $.from_html(`<div class="relative p-0 h-125 overflow-hidden demo-container"><!></div>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Circular Text</h1> <!>`, 1);

export default function CircularTextDemo($$anchor) {
	const DEFAULTS = {
		text: "SVELTE*BITS*COMPONENTS*",
		onHover: "speedUp",
		spinDuration: 20
	};

	let text = $.state($.proxy(DEFAULTS.text));
	let onHover = $.state($.proxy(DEFAULTS.onHover));
	let spinDuration = $.state($.proxy(DEFAULTS.spinDuration));
	let replay = $.state(0);
	const hasChanges = $.derived(() => $.get(text) !== DEFAULTS.text || $.get(onHover) !== DEFAULTS.onHover || $.get(spinDuration) !== DEFAULTS.spinDuration);

	function reset() {
		$.set(text, DEFAULTS.text, true);
		$.set(onHover, DEFAULTS.onHover, true);
		$.set(spinDuration, DEFAULTS.spinDuration, true);
		$.update(replay);
	}

	const usage = $.derived(() => `${"<" + 'script lang="ts">'}
  import CircularText from '$lib/components/CircularText.svelte';
${"</" + "script>"}

<CircularText
  text="${$.get(text)}"
  onHover="${$.get(onHover)}"
  spinDuration={${$.get(spinDuration)}}
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

	var fragment = root_2();

	$.head('96g4jw', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Circular Text - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			$.key(node_1, () => $.get(replay), ($$anchor) => {
				CircularText($$anchor, {
					get text() {
						return $.get(text);
					},

					get onHover() {
						return $.get(onHover);
					},

					get spinDuration() {
						return $.get(spinDuration);
					}
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'circular-text',
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
					var node_2 = $.first_child(fragment_4);

					PreviewInput(node_2, {
						title: 'Text',
						get value() {
							return $.get(text);
						},
						placeholder: 'Enter text...',
						onChange: (v) => $.set(text, v, true)
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSelect(node_3, {
						title: 'On Hover',
						options: [
							{ label: "Slow Down", value: "slowDown" },
							{ label: "Speed Up", value: "speedUp" },
							{ label: "Pause", value: "pause" },
							{ label: "Go Bonkers", value: "goBonkers" }
						],

						get value() {
							return $.get(onHover);
						},
						onChange: (v) => $.set(onHover, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Spin Duration',
						get value() {
							return $.get(spinDuration);
						},
						min: 1,
						max: 60,
						step: 1,
						valueUnit: 's',
						onChange: (v) => $.set(spinDuration, v, true)
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
			componentName: 'CircularText',
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