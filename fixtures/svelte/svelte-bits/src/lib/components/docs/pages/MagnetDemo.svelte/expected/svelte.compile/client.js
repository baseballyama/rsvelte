import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import Magnet from '$lib/components/library/Animations/Magnet/Magnet.svelte';
import source from '$lib/components/library/Animations/Magnet/Magnet.svelte?raw';

var root = $.from_html(`<p style="font-size:1.5rem;color:var(--text-primary);font-weight:600;text-align:center;padding:1.5em 2em;">Star Svelte Bits on GitHub!</p>`);
var root_1 = $.from_html(`<div class="demo-container" style="position:relative;height:500px;display:flex;align-items:center;justify-content:center;"><!></div>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<h1 class="sub-category">Magnet</h1> <!>`, 1);

export default function MagnetDemo($$anchor) {
	const DEFAULTS = { disabled: false, padding: 100, magnetStrength: 2 };
	let disabled = $.state($.proxy(DEFAULTS.disabled));
	let padding = $.state($.proxy(DEFAULTS.padding));
	let magnetStrength = $.state($.proxy(DEFAULTS.magnetStrength));
	const hasChanges = $.derived(() => $.get(disabled) !== DEFAULTS.disabled || $.get(padding) !== DEFAULTS.padding || $.get(magnetStrength) !== DEFAULTS.magnetStrength);

	function reset() {
		$.set(disabled, DEFAULTS.disabled, true);
		$.set(padding, DEFAULTS.padding, true);
		$.set(magnetStrength, DEFAULTS.magnetStrength, true);
	}

	const usage = $.derived(() => `<Magnet padding={${$.get(padding)}} disabled={${$.get(disabled)}} magnetStrength={${$.get(magnetStrength)}}>
  <p>Star React Bits on GitHub!</p>
</Magnet>`);

	const props = [
		{
			name: 'padding',
			type: 'number',
			default: '100',
			description: 'Distance (px) around element that activates magnet pull.'
		},

		{
			name: 'disabled',
			type: 'boolean',
			default: 'false',
			description: 'Disables the magnet effect.'
		},

		{
			name: 'magnetStrength',
			type: 'number',
			default: '2',
			description: 'Pull strength; higher reduces movement.'
		},

		{
			name: 'activeTransition',
			type: 'string',
			default: '"transform 0.3s ease-out"',
			description: 'CSS transition while magnetized.'
		},

		{
			name: 'inactiveTransition',
			type: 'string',
			default: '"transform 0.5s ease-in-out"',
			description: 'CSS transition when not magnetized.'
		},

		{
			name: 'wrapperClass',
			type: 'string',
			default: '""',
			description: 'Class for wrapper element.'
		},

		{
			name: 'innerClass',
			type: 'string',
			default: '""',
			description: 'Class for inner element.'
		}
	];

	var fragment = root_3();

	$.head('3nwrbg', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Magnet - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root_1();
			var node_1 = $.child(div);

			Magnet(node_1, {
				get padding() {
					return $.get(padding);
				},

				get disabled() {
					return $.get(disabled);
				},

				get magnetStrength() {
					return $.get(magnetStrength);
				},

				children: ($$anchor, $$slotProps) => {
					var p = root();

					$.append($$anchor, p);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'magnet',
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

					PreviewSwitch(node_2, {
						title: 'Disabled',
						get checked() {
							return $.get(disabled);
						},
						onChange: (v) => $.set(disabled, v, true)
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSlider(node_3, {
						title: 'Padding',
						min: 0,
						max: 300,
						step: 10,
						get value() {
							return $.get(padding);
						},
						valueUnit: 'px',
						onChange: (v) => $.set(padding, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Magnet Strength',
						min: 1,
						max: 10,
						step: 0.5,
						get value() {
							return $.get(magnetStrength);
						},
						onChange: (v) => $.set(magnetStrength, v, true)
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
			componentName: 'Magnet',
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