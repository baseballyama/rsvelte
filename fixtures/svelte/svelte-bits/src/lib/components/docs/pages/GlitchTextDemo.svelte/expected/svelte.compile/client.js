import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import GlitchText from '$lib/components/library/TextAnimations/GlitchText/GlitchText.svelte';
import glitchTextSource from '$lib/components/library/TextAnimations/GlitchText/GlitchText.svelte?raw';

var root = $.from_html(`<div class="demo-container"><!></div>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Glitch Text</h1> <!>`, 1);

export default function GlitchTextDemo($$anchor) {
	const DEFAULTS = { speed: 1, enableShadows: true, enableOnHover: false };
	let speed = $.state($.proxy(DEFAULTS.speed));
	let enableShadows = $.state($.proxy(DEFAULTS.enableShadows));
	let enableOnHover = $.state($.proxy(DEFAULTS.enableOnHover));
	const hasChanges = $.derived(() => $.get(speed) !== DEFAULTS.speed || $.get(enableShadows) !== DEFAULTS.enableShadows || $.get(enableOnHover) !== DEFAULTS.enableOnHover);

	function reset() {
		$.set(speed, DEFAULTS.speed, true);
		$.set(enableShadows, DEFAULTS.enableShadows, true);
		$.set(enableOnHover, DEFAULTS.enableOnHover, true);
	}

	const usage = $.derived(() => `${'<' + 'script lang="ts">'}
  import GlitchText from '$lib/components/GlitchText.svelte';
${'</' + 'script>'}

<GlitchText
  text={${$.get(enableOnHover) ? '"Hover Me"' : '"Svelte Bits"'}}
  speed={${$.get(speed)}}
  enableShadows={${$.get(enableShadows)}}
  enableOnHover={${$.get(enableOnHover)}}
/>`);

	const props = [
		{
			name: 'text',
			type: 'string',
			default: '-',
			description: 'The text content that will display the glitch effect.'
		},

		{
			name: 'speed',
			type: 'number',
			default: '0.5',
			description: 'Multiplier for the animation speed. Higher values slow down the glitch effect.'
		},

		{
			name: 'enableShadows',
			type: 'boolean',
			default: 'true',
			description: 'Show the cyan/red text shadow split.'
		},

		{
			name: 'enableOnHover',
			type: 'boolean',
			default: 'false',
			description: 'Only run the glitch effect while hovered.'
		},

		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'Extra classes for the wrapper.'
		},

		{
			name: 'className',
			type: 'string',
			default: '""',
			description: 'React Bits-compatible extra class prop.'
		}
	];

	var fragment = root_2();

	$.head('80binw', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Glitch Text - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			{
				let $0 = $.derived(() => $.get(enableOnHover) ? 'Hover Me' : 'Svelte Bits');

				GlitchText(node_1, {
					get text() {
						return $.get($0);
					},

					get speed() {
						return $.get(speed);
					},

					get enableShadows() {
						return $.get(enableShadows);
					},

					get enableOnHover() {
						return $.get(enableOnHover);
					}
				});
			}

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'glitch-text',
				get usage() {
					return $.get(usage);
				},

				get source() {
					return glitchTextSource;
				}
			});
		};

		const customize = ($$anchor) => {
			Customize($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_1();
					var node_2 = $.first_child(fragment_3);

					PreviewSlider(node_2, {
						title: 'Speed',
						min: 0.1,
						max: 2,
						step: 0.05,
						get value() {
							return $.get(speed);
						},
						onChange: (v) => $.set(speed, v, true)
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSwitch(node_3, {
						title: 'Enable Shadows',
						get checked() {
							return $.get(enableShadows);
						},
						onChange: (v) => $.set(enableShadows, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSwitch(node_4, {
						title: 'Enable On Hover',
						get checked() {
							return $.get(enableOnHover);
						},
						onChange: (v) => $.set(enableOnHover, v, true)
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
			componentName: 'GlitchText',
			get usage() {
				return $.get(usage);
			},

			get source() {
				return glitchTextSource;
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