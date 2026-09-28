import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import ElasticSlider from '$lib/components/library/Components/ElasticSlider/ElasticSlider.svelte';
import source from '$lib/components/library/Components/ElasticSlider/ElasticSlider.svelte?raw';

var root = $.from_html(`<div class="demo-container" style="position:relative;display:flex;align-items:center;justify-content:center;min-height:400px;"><!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Elastic Slider</h1> <!>`, 1);

export default function ElasticSliderDemo($$anchor) {
	const DEFAULTS = {
		defaultValue: 50,
		startingValue: 0,
		maxValue: 100,
		isStepped: false,
		stepSize: 1
	};

	let defaultValue = $.state($.proxy(DEFAULTS.defaultValue));
	let startingValue = $.state($.proxy(DEFAULTS.startingValue));
	let maxValue = $.state($.proxy(DEFAULTS.maxValue));
	let isStepped = $.state($.proxy(DEFAULTS.isStepped));
	let stepSize = $.state($.proxy(DEFAULTS.stepSize));
	let key = $.state(0);
	const hasChanges = $.derived(() => $.get(defaultValue) !== DEFAULTS.defaultValue || $.get(startingValue) !== DEFAULTS.startingValue || $.get(maxValue) !== DEFAULTS.maxValue || $.get(isStepped) !== DEFAULTS.isStepped || $.get(stepSize) !== DEFAULTS.stepSize);

	function reset() {
		$.set(defaultValue, DEFAULTS.defaultValue, true);
		$.set(startingValue, DEFAULTS.startingValue, true);
		$.set(maxValue, DEFAULTS.maxValue, true);
		$.set(isStepped, DEFAULTS.isStepped, true);
		$.set(stepSize, DEFAULTS.stepSize, true);
		$.update(key);
	}

	const usage = $.derived(() => `<ElasticSlider defaultValue={${$.get(defaultValue)}} startingValue={${$.get(startingValue)}} maxValue={${$.get(maxValue)}} isStepped={${$.get(isStepped)}} stepSize={${$.get(stepSize)}} />`);

	const props = [
		{
			name: 'defaultValue',
			type: 'number',
			default: '50',
			description: 'Initial value.'
		},

		{
			name: 'startingValue',
			type: 'number',
			default: '0',
			description: 'Min value.'
		},

		{
			name: 'maxValue',
			type: 'number',
			default: '100',
			description: 'Max value.'
		},

		{
			name: 'isStepped',
			type: 'boolean',
			default: 'false',
			description: 'Snap to step increments.'
		},

		{
			name: 'stepSize',
			type: 'number',
			default: '1',
			description: 'Step size when stepped.'
		},

		{
			name: 'leftIcon',
			type: 'Snippet',
			default: '"-"',
			description: 'Left-side icon.'
		},

		{
			name: 'rightIcon',
			type: 'Snippet',
			default: '"+"',
			description: 'Right-side icon.'
		}
	];

	var fragment = root_2();

	$.head('g2r3n2', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Elastic Slider - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			$.key(node_1, () => $.get(key), ($$anchor) => {
				ElasticSlider($$anchor, {
					get defaultValue() {
						return $.get(defaultValue);
					},

					get startingValue() {
						return $.get(startingValue);
					},

					get maxValue() {
						return $.get(maxValue);
					},

					get isStepped() {
						return $.get(isStepped);
					},

					get stepSize() {
						return $.get(stepSize);
					}
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'elastic-slider',
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

					PreviewSlider(node_2, {
						title: 'Default Value',
						min: 0,
						max: 100,
						step: 1,
						get value() {
							return $.get(defaultValue);
						},

						onChange: (v) => {
							$.set(defaultValue, v, true);
							$.update(key);
						}
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSlider(node_3, {
						title: 'Starting Value',
						min: -100,
						max: 0,
						step: 1,
						get value() {
							return $.get(startingValue);
						},

						onChange: (v) => {
							$.set(startingValue, v, true);
							$.update(key);
						}
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Max Value',
						min: 1,
						max: 1000,
						step: 1,
						get value() {
							return $.get(maxValue);
						},

						onChange: (v) => {
							$.set(maxValue, v, true);
							$.update(key);
						}
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSwitch(node_5, {
						title: 'Is Stepped',
						get checked() {
							return $.get(isStepped);
						},

						onChange: (v) => {
							$.set(isStepped, v, true);
							$.update(key);
						}
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Step Size',
						min: 1,
						max: 50,
						step: 1,
						get value() {
							return $.get(stepSize);
						},

						onChange: (v) => {
							$.set(stepSize, v, true);
							$.update(key);
						}
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
			componentName: 'ElasticSlider',
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