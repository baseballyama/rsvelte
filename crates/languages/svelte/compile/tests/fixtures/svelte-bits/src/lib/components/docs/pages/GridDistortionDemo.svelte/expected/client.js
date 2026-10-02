import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import GridDistortion from '$lib/components/library/Backgrounds/GridDistortion/GridDistortion.svelte';
import source from '$lib/components/library/Backgrounds/GridDistortion/GridDistortion.svelte?raw';

var root = $.from_html(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Grid Distortion</h1> <!>`, 1);

export default function GridDistortionDemo($$anchor) {
	const D = { grid: 15, mouse: 0.1, strength: 0.15, relaxation: 0.9 };
	const imageSrc = 'https://images.unsplash.com/photo-1707343843437-caacff5cfa74?w=1200&q=80';
	let grid = $.state($.proxy(D.grid));
	let mouse = $.state($.proxy(D.mouse));
	let strength = $.state($.proxy(D.strength));
	let relaxation = $.state($.proxy(D.relaxation));
	let showContent = $.state(true);
	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';
	const hasChanges = $.derived(() => $.get(grid) !== D.grid || $.get(mouse) !== D.mouse || $.get(strength) !== D.strength || $.get(relaxation) !== D.relaxation);

	function reset() {
		$.set(grid, D.grid, true);
		$.set(mouse, D.mouse, true);
		$.set(strength, D.strength, true);
		$.set(relaxation, D.relaxation, true);
	}

	const usage = $.derived(() => `${sO}
  import GridDistortion from '$lib/components/GridDistortion.svelte';
${sC}

<div style="width: 100%; height: 600px; position: relative;">
  <GridDistortion imageSrc="..." grid={${$.get(grid)}} mouse={${$.get(mouse)}} strength={${$.get(strength)}} relaxation={${$.get(relaxation)}} />
</div>`);

	const props = [
		{
			name: 'grid',
			type: 'number',
			default: '15',
			description: 'Grid resolution.'
		},

		{
			name: 'mouse',
			type: 'number',
			default: '0.1',
			description: 'Cursor radius.'
		},

		{
			name: 'strength',
			type: 'number',
			default: '0.15',
			description: 'Distortion strength.'
		},

		{
			name: 'relaxation',
			type: 'number',
			default: '0.9',
			description: 'Distortion relaxation.'
		},

		{
			name: 'imageSrc',
			type: 'string',
			description: 'Image source URL.'
		}
	];

	var fragment = root_2();

	$.head('u0by31', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Grid Distortion - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.key(node_1, () => `${$.get(grid)}-${imageSrc}`, ($$anchor) => {
				var div = root();
				var node_2 = $.child(div);

				GridDistortion(node_2, {
					get grid() {
						return $.get(grid);
					},

					get mouse() {
						return $.get(mouse);
					},

					get strength() {
						return $.get(strength);
					},

					get relaxation() {
						return $.get(relaxation);
					},
					imageSrc
				});

				var node_3 = $.sibling(node_2, 2);

				BackgroundContentToggle(node_3, {
					get showContent() {
						return $.get(showContent);
					},
					onToggle: (v) => $.set(showContent, v, true)
				});

				$.reset(div);
				$.append($$anchor, div);
			});

			$.append($$anchor, fragment_1);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'grid-distortion',
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
					var node_4 = $.first_child(fragment_4);

					PreviewSlider(node_4, {
						title: 'Grid',
						min: 4,
						max: 50,
						step: 1,
						get value() {
							return $.get(grid);
						},
						onChange: (v) => $.set(grid, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Mouse Radius',
						min: 0.01,
						max: 1,
						step: 0.01,
						get value() {
							return $.get(mouse);
						},
						onChange: (v) => $.set(mouse, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Strength',
						min: 0,
						max: 1,
						step: 0.01,
						get value() {
							return $.get(strength);
						},
						onChange: (v) => $.set(strength, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Relaxation',
						min: 0,
						max: 1,
						step: 0.01,
						get value() {
							return $.get(relaxation);
						},
						onChange: (v) => $.set(relaxation, v, true)
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
			componentName: 'GridDistortion',
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