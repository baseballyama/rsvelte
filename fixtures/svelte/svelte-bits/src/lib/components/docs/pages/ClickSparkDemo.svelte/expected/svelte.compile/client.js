import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import ClickSpark from '$lib/components/library/Animations/ClickSpark/ClickSpark.svelte';
import source from '$lib/components/library/Animations/ClickSpark/ClickSpark.svelte?raw';

var root = $.from_html(`<div style="display:flex;align-items:center;justify-content:center;min-height:400px;color:var(--text-secondary);font-weight:600;">Click anywhere</div>`);
var root_1 = $.from_html(`<div style="position:relative;min-height:400px;width:100%;"><!></div>`);
var root_2 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<h1 class="sub-category">Click Spark</h1> <!>`, 1);

export default function ClickSparkDemo($$anchor) {
	const DEFAULTS = {
		sparkColor: '#FF8A4C',
		sparkSize: 10,
		sparkRadius: 15,
		sparkCount: 8,
		duration: 400
	};

	let sparkColor = $.state($.proxy(DEFAULTS.sparkColor));
	let sparkSize = $.state($.proxy(DEFAULTS.sparkSize));
	let sparkRadius = $.state($.proxy(DEFAULTS.sparkRadius));
	let sparkCount = $.state($.proxy(DEFAULTS.sparkCount));
	let duration = $.state($.proxy(DEFAULTS.duration));
	const hasChanges = $.derived(() => $.get(sparkColor) !== DEFAULTS.sparkColor || $.get(sparkSize) !== DEFAULTS.sparkSize || $.get(sparkRadius) !== DEFAULTS.sparkRadius || $.get(sparkCount) !== DEFAULTS.sparkCount || $.get(duration) !== DEFAULTS.duration);

	function reset() {
		Object.assign({}, DEFAULTS);
		$.set(sparkColor, DEFAULTS.sparkColor, true);
		$.set(sparkSize, DEFAULTS.sparkSize, true);
		$.set(sparkRadius, DEFAULTS.sparkRadius, true);
		$.set(sparkCount, DEFAULTS.sparkCount, true);
		$.set(duration, DEFAULTS.duration, true);
	}

	const usage = $.derived(() => `<ClickSpark sparkColor="${$.get(sparkColor)}" sparkSize={${$.get(sparkSize)}} sparkRadius={${$.get(sparkRadius)}} sparkCount={${$.get(sparkCount)}} duration={${$.get(duration)}}>
  <div>Click anywhere</div>
</ClickSpark>`);

	const props = [
		{
			name: 'children',
			type: 'Snippet',
			default: '-',
			description: 'Slot content. Sparks render over the wrapper.'
		},

		{
			name: 'sparkColor',
			type: 'string',
			default: '"#fff"',
			description: 'Color of each spark line.'
		},

		{
			name: 'sparkSize',
			type: 'number',
			default: '10',
			description: 'Length of each spark in px.'
		},

		{
			name: 'sparkRadius',
			type: 'number',
			default: '15',
			description: 'How far the sparks travel from the click point.'
		},

		{
			name: 'sparkCount',
			type: 'number',
			default: '8',
			description: 'Number of sparks per click.'
		},

		{
			name: 'duration',
			type: 'number',
			default: '400',
			description: 'Animation duration in ms.'
		},

		{
			name: 'easing',
			type: 'string',
			default: '"ease-out"',
			description: 'Easing for spark travel.'
		},

		{
			name: 'extraScale',
			type: 'number',
			default: '1.0',
			description: 'Multiplier on spark length over time.'
		}
	];

	var fragment = root_3();

	$.head('l0lbhb', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Click Spark - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root_1();
			var node_1 = $.child(div);

			ClickSpark(node_1, {
				get sparkColor() {
					return $.get(sparkColor);
				},

				get sparkSize() {
					return $.get(sparkSize);
				},

				get sparkRadius() {
					return $.get(sparkRadius);
				},

				get sparkCount() {
					return $.get(sparkCount);
				},

				get duration() {
					return $.get(duration);
				},

				children: ($$anchor, $$slotProps) => {
					var div_1 = root();

					$.append($$anchor, div_1);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'click-spark',
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
					var fragment_3 = root_2();
					var node_2 = $.first_child(fragment_3);

					PreviewColorPicker(node_2, {
						title: 'Spark Color',
						get value() {
							return $.get(sparkColor);
						},
						onChange: (v) => $.set(sparkColor, v, true)
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSlider(node_3, {
						title: 'Spark Size',
						min: 4,
						max: 40,
						step: 1,
						get value() {
							return $.get(sparkSize);
						},
						valueUnit: 'px',
						onChange: (v) => $.set(sparkSize, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Spark Radius',
						min: 5,
						max: 80,
						step: 1,
						get value() {
							return $.get(sparkRadius);
						},
						valueUnit: 'px',
						onChange: (v) => $.set(sparkRadius, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Spark Count',
						min: 3,
						max: 24,
						step: 1,
						get value() {
							return $.get(sparkCount);
						},
						onChange: (v) => $.set(sparkCount, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Duration',
						min: 100,
						max: 1500,
						step: 50,
						get value() {
							return $.get(duration);
						},
						valueUnit: 'ms',
						onChange: (v) => $.set(duration, v, true)
					});

					$.append($$anchor, fragment_3);
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
			componentName: 'ClickSpark',
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