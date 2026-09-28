import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import GooeyNav from '$lib/components/library/Components/GooeyNav/GooeyNav.svelte';
import source from '$lib/components/library/Components/GooeyNav/GooeyNav.svelte?raw';

var root = $.from_html(`<div class="demo-container" style="position:relative;height:400px;overflow:hidden;display:flex;align-items:center;justify-content:center;"><!></div>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Gooey Nav</h1> <!>`, 1);

export default function GooeyNavDemo($$anchor) {
	const DEFAULTS = { particleCount: 15, timeVariance: 300, particleR: 100 };
	let particleCount = $.state($.proxy(DEFAULTS.particleCount));
	let timeVariance = $.state($.proxy(DEFAULTS.timeVariance));
	let particleR = $.state($.proxy(DEFAULTS.particleR));
	let key = $.state(0);

	const items = [
		{ label: 'Home', href: '#' },
		{ label: 'About', href: '#' },
		{ label: 'Contact', href: '#' }
	];

	const usage = `<GooeyNav items={items} animationTime={500} particleCount={15} particleDistances={[90, 0]} particleR={100} timeVariance={300} initialActiveIndex={0} />`;

	const props = [
		{
			name: 'items',
			type: 'GooeyNavItem[]',
			default: '[]',
			description: 'Array of navigation items.'
		},

		{
			name: 'animationTime',
			type: 'number',
			default: '600',
			description: 'Duration (ms) of the main animation.'
		},

		{
			name: 'particleCount',
			type: 'number',
			default: '15',
			description: 'Number of bubble particles per transition.'
		},

		{
			name: 'particleDistances',
			type: '[number, number]',
			default: '[90, 10]',
			description: 'Outer and inner distances of bubble spread.'
		},

		{
			name: 'particleR',
			type: 'number',
			default: '100',
			description: 'Radius factor influencing random particle rotation.'
		},

		{
			name: 'timeVariance',
			type: 'number',
			default: '300',
			description: 'Random time variance (ms) for particle animations.'
		},

		{
			name: 'colors',
			type: 'number[]',
			default: '[1, 2, 3, 1, 2, 3, 1, 4]',
			description: 'Color indices used when creating bubble particles.'
		},

		{
			name: 'initialActiveIndex',
			type: 'number',
			default: '0',
			description: 'Which item is selected on mount.'
		}
	];

	const hasChanges = $.derived(() => $.get(particleCount) !== DEFAULTS.particleCount || $.get(timeVariance) !== DEFAULTS.timeVariance || $.get(particleR) !== DEFAULTS.particleR);

	function reset() {
		$.set(particleCount, DEFAULTS.particleCount, true);
		$.set(timeVariance, DEFAULTS.timeVariance, true);
		$.set(particleR, DEFAULTS.particleR, true);
		$.update(key);
	}

	var fragment = root_2();

	$.head('23er1s', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Gooey Nav - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			$.key(node_1, () => $.get(key), ($$anchor) => {
				GooeyNav($$anchor, {
					get items() {
						return items;
					},
					animationTime: 500,
					get particleCount() {
						return $.get(particleCount);
					},
					particleDistances: [90, 0],
					get particleR() {
						return $.get(particleR);
					},

					get timeVariance() {
						return $.get(timeVariance);
					},
					initialActiveIndex: 0
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'gooey-nav',
				usage,
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
						title: 'Particle Count',
						min: 1,
						max: 50,
						step: 1,
						get value() {
							return $.get(particleCount);
						},

						onChange: (v) => {
							$.set(particleCount, v, true);
							$.update(key);
						}
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSlider(node_3, {
						title: 'Animation Variance',
						min: 0,
						max: 2000,
						step: 100,
						get value() {
							return $.get(timeVariance);
						},

						onChange: (v) => {
							$.set(timeVariance, v, true);
							$.update(key);
						}
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Radius Factor',
						min: 0,
						max: 1000,
						step: 100,
						get value() {
							return $.get(particleR);
						},

						onChange: (v) => {
							$.set(particleR, v, true);
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
			componentName: 'GooeyNav',
			usage,
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