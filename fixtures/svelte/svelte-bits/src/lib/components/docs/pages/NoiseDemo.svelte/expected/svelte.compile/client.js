import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import Noise from '$lib/components/library/Animations/Noise/Noise.svelte';
import noiseSource from '$lib/components/library/Animations/Noise/Noise.svelte?raw';

var root = $.from_html(`<div class="relative min-h-[400px] w-full overflow-hidden rounded-[14px] bg-[#111]"><p class="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-[clamp(3rem,12vw,6rem)] font-black leading-none text-[#333]">Ooh, edgy!</p> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Noise</h1> <!>`, 1);

export default function NoiseDemo($$anchor) {
	const DEFAULTS = {
		patternSize: 250,
		patternScaleX: 2,
		patternScaleY: 2,
		patternAlpha: 15
	};

	let patternSize = $.state($.proxy(DEFAULTS.patternSize));
	let patternScaleX = $.state($.proxy(DEFAULTS.patternScaleX));
	let patternScaleY = $.state($.proxy(DEFAULTS.patternScaleY));
	let patternAlpha = $.state($.proxy(DEFAULTS.patternAlpha));
	let renderKey = $.state(0);
	const hasChanges = $.derived(() => $.get(patternSize) !== DEFAULTS.patternSize || $.get(patternScaleX) !== DEFAULTS.patternScaleX || $.get(patternScaleY) !== DEFAULTS.patternScaleY || $.get(patternAlpha) !== DEFAULTS.patternAlpha);

	function forceRerender() {
		$.set(renderKey, $.get(renderKey) + 1);
	}

	function reset() {
		$.set(patternSize, DEFAULTS.patternSize, true);
		$.set(patternScaleX, DEFAULTS.patternScaleX, true);
		$.set(patternScaleY, DEFAULTS.patternScaleY, true);
		$.set(patternAlpha, DEFAULTS.patternAlpha, true);
		forceRerender();
	}

	const usage = $.derived(() => `${'<' + 'script lang="ts">'}
  import Noise from '$lib/components/Noise.svelte';
${'</' + 'script>'}

<div style="position:relative;width:100%;height:600px;overflow:hidden;">
  <Noise
    patternSize={${$.get(patternSize)}}
    patternScaleX={${$.get(patternScaleX)}}
    patternScaleY={${$.get(patternScaleY)}}
    patternAlpha={${$.get(patternAlpha)}}
  />
</div>`);

	const props = [
		{
			name: 'patternSize',
			type: 'number',
			default: '250',
			description: 'Defines the size of the grain pattern.'
		},

		{
			name: 'patternScaleX',
			type: 'number',
			default: '1',
			description: 'Scaling factor for the X-axis of the grain pattern.'
		},

		{
			name: 'patternScaleY',
			type: 'number',
			default: '1',
			description: 'Scaling factor for the Y-axis of the grain pattern.'
		},

		{
			name: 'patternRefreshInterval',
			type: 'number',
			default: '2',
			description: 'Number of frames between regenerations of the grain.'
		},

		{
			name: 'patternAlpha',
			type: 'number',
			default: '15',
			description: 'Opacity of the grain pattern (0-255).'
		}
	];

	var fragment = root_2();

	$.head('u6vhp6', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Noise - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.sibling($.child(div), 2);

			$.key(node_1, () => $.get(renderKey), ($$anchor) => {
				Noise($$anchor, {
					get patternSize() {
						return $.get(patternSize);
					},

					get patternScaleX() {
						return $.get(patternScaleX);
					},

					get patternScaleY() {
						return $.get(patternScaleY);
					},

					get patternAlpha() {
						return $.get(patternAlpha);
					}
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'noise',
				get usage() {
					return $.get(usage);
				},

				get source() {
					return noiseSource;
				}
			});
		};

		const customize = ($$anchor) => {
			Customize($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_1();
					var node_2 = $.first_child(fragment_4);

					PreviewSlider(node_2, {
						title: 'Pattern Size',
						min: 50,
						max: 500,
						step: 10,
						get value() {
							return $.get(patternSize);
						},
						valueUnit: 'px',
						onChange: (v) => {
							$.set(patternSize, v, true);
							forceRerender();
						}
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSlider(node_3, {
						title: 'Scale X',
						min: 0.1,
						max: 5,
						step: 0.1,
						get value() {
							return $.get(patternScaleX);
						},

						onChange: (v) => {
							$.set(patternScaleX, v, true);
							forceRerender();
						}
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Scale Y',
						min: 0.1,
						max: 5,
						step: 0.1,
						get value() {
							return $.get(patternScaleY);
						},

						onChange: (v) => {
							$.set(patternScaleY, v, true);
							forceRerender();
						}
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Pattern Alpha',
						min: 0,
						max: 25,
						step: 5,
						get value() {
							return $.get(patternAlpha);
						},

						onChange: (v) => {
							$.set(patternAlpha, v, true);
							forceRerender();
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
			componentName: 'Noise',
			get usage() {
				return $.get(usage);
			},

			get source() {
				return noiseSource;
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