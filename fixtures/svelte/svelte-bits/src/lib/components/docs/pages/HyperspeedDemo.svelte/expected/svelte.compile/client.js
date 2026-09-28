import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import hyperspeedSource from '$lib/components/library/Backgrounds/Hyperspeed/Hyperspeed.svelte?raw';

var root = $.from_html(`<div class="relative h-[500px] w-full cursor-pointer overflow-hidden"><!> <!></div>`);
var root_1 = $.from_html(`<h1 class="sub-category">Hyperspeed</h1> <!>`, 1);

export default function HyperspeedDemo($$anchor, $$props) {
	$.push($$props, true);

	const DEFAULTS = { activePreset: 'one' };

	const presetOptions = [
		{ value: 'one', label: 'Cyberpunk' },
		{ value: 'two', label: 'Akira' },
		{ value: 'three', label: 'Golden' },
		{ value: 'four', label: 'Split' },
		{ value: 'five', label: 'Highway' }
	];

	let activePreset = $.state($.proxy(DEFAULTS.activePreset));
	let renderKey = $.state(0);
	let showContent = $.state(true);
	let Hyperspeed = $.state(null);
	let hyperspeedPresets = $.state($.proxy({}));
	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';
	const hasChanges = $.derived(() => $.get(activePreset) !== DEFAULTS.activePreset);
	const effectOptions = $.derived(() => $.get(hyperspeedPresets)[$.get(activePreset)] ?? null);

	$.user_effect(() => {
		let cancelled = false;

		import('$lib/components/library/Backgrounds/Hyperspeed/Hyperspeed.svelte').then((module) => {
			if (cancelled) return;

			$.set(Hyperspeed, module.default, true);
			$.set(hyperspeedPresets, module.hyperspeedPresets, true);
		});

		return () => {
			cancelled = true;
		};
	});

	function reset() {
		$.set(activePreset, DEFAULTS.activePreset, true);
		$.set(renderKey, $.get(renderKey) + 1);
	}

	const usage = $.derived(() => `${scriptOpen}
  import Hyperspeed, { hyperspeedPresets } from '$lib/components/Hyperspeed.svelte';
${scriptClose}

<div style="height: 500px; position: relative; overflow: hidden; cursor: pointer;">
  <Hyperspeed effectOptions={hyperspeedPresets.${$.get(activePreset)}} />
</div>`);

	const props = [
		{
			name: 'effectOptions',
			type: 'Partial<HyperspeedOptions>',
			default: '{}',
			description: 'Configuration object controlling colors, distortion, road geometry, light trail properties, field of view, and speed-up behavior.'
		},

		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'Extra classes for the root container.'
		}
	];

	var fragment = root_1();

	$.head('11ncrdz', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Hyperspeed - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			$.key(node_1, () => $.get(renderKey), ($$anchor) => {
				var fragment_1 = $.comment();
				var node_2 = $.first_child(fragment_1);

				{
					var consequent = ($$anchor) => {
						var fragment_2 = $.comment();
						var node_3 = $.first_child(fragment_2);

						$.component(node_3, () => $.get(Hyperspeed), ($$anchor, Hyperspeed_1) => {
							Hyperspeed_1($$anchor, {
								get effectOptions() {
									return $.get(effectOptions);
								}
							});
						});

						$.append($$anchor, fragment_2);
					};

					$.if(node_2, ($$render) => {
						if ($.get(Hyperspeed) && $.get(effectOptions)) $$render(consequent);
					});
				}

				$.append($$anchor, fragment_1);
			});

			var node_4 = $.sibling(node_1, 2);

			BackgroundContentToggle(node_4, {
				get showContent() {
					return $.get(showContent);
				},
				headline: 'Click & hold to see the real magic of hyperspeed!',
				onToggle: (v) => $.set(showContent, v, true)
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'hyperspeed',
				get usage() {
					return $.get(usage);
				},

				get source() {
					return hyperspeedSource;
				}
			});
		};

		const customize = ($$anchor) => {
			Customize($$anchor, {
				children: ($$anchor, $$slotProps) => {
					PreviewSelect($$anchor, {
						title: 'Animation Preset',
						get options() {
							return presetOptions;
						},

						get value() {
							return $.get(activePreset);
						},

						onChange: (v) => {
							$.set(activePreset, v, true);
							$.set(renderKey, $.get(renderKey) + 1);
						}
					});
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
			componentName: 'Hyperspeed',
			get usage() {
				return $.get(usage);
			},

			get source() {
				return hyperspeedSource;
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
	$.pop();
}