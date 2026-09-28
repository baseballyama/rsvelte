import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import ChromaGrid from '$lib/components/library/Components/ChromaGrid/ChromaGrid.svelte';
import source from '$lib/components/library/Components/ChromaGrid/ChromaGrid.svelte?raw';

var root = $.from_html(`<div class="demo-container" style="position:relative;min-height:600px;padding:1.5rem;"><!></div>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Chroma Grid</h1> <!>`, 1);

export default function ChromaGridDemo($$anchor) {
	const DEFAULTS = { radius: 300, damping: 0.45, fadeOut: 0.6 };
	let radius = $.state($.proxy(DEFAULTS.radius));
	let damping = $.state($.proxy(DEFAULTS.damping));
	let fadeOut = $.state($.proxy(DEFAULTS.fadeOut));
	let key = $.state(0);
	const hasChanges = $.derived(() => $.get(radius) !== DEFAULTS.radius || $.get(damping) !== DEFAULTS.damping || $.get(fadeOut) !== DEFAULTS.fadeOut);

	function reset() {
		$.set(radius, DEFAULTS.radius, true);
		$.set(damping, DEFAULTS.damping, true);
		$.set(fadeOut, DEFAULTS.fadeOut, true);
		$.update(key);
	}

	const usage = $.derived(() => `<ChromaGrid radius={${$.get(radius)}} damping={${$.get(damping)}} fadeOut={${$.get(fadeOut)}} />`);

	const props = [
		{
			name: 'items',
			type: 'ChromaItem[]',
			default: '6 demo cards',
			description: 'Cards to render.'
		},

		{
			name: 'radius',
			type: 'number',
			default: '300',
			description: 'Spotlight radius (px).'
		},

		{
			name: 'damping',
			type: 'number',
			default: '0.45',
			description: 'GSAP follow duration.'
		},

		{
			name: 'fadeOut',
			type: 'number',
			default: '0.6',
			description: 'Fade-back duration on leave.'
		},

		{
			name: 'ease',
			type: 'string',
			default: '"power3.out"',
			description: 'GSAP easing.'
		}
	];

	var fragment = root_2();

	$.head('r7esrg', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Chroma Grid - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			$.key(node_1, () => $.get(key), ($$anchor) => {
				ChromaGrid($$anchor, {
					get radius() {
						return $.get(radius);
					},

					get damping() {
						return $.get(damping);
					},

					get fadeOut() {
						return $.get(fadeOut);
					}
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'chroma-grid',
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
						title: 'Radius',
						min: 50,
						max: 600,
						step: 10,
						get value() {
							return $.get(radius);
						},

						onChange: (v) => {
							$.set(radius, v, true);
						}
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSlider(node_3, {
						title: 'Damping',
						min: 0,
						max: 2,
						step: 0.05,
						get value() {
							return $.get(damping);
						},

						onChange: (v) => {
							$.set(damping, v, true);
						}
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Fade Out',
						min: 0,
						max: 2,
						step: 0.05,
						get value() {
							return $.get(fadeOut);
						},

						onChange: (v) => {
							$.set(fadeOut, v, true);
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
			componentName: 'ChromaGrid',
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