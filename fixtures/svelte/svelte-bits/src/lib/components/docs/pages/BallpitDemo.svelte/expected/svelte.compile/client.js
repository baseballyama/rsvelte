import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import Ballpit from '$lib/components/library/Backgrounds/Ballpit/Ballpit.svelte';
import source from '$lib/components/library/Backgrounds/Ballpit/Ballpit.svelte?raw';

var root = $.from_html(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Ballpit</h1> <!>`, 1);

export default function BallpitDemo($$anchor) {
	const D = {
		count: 200,
		gravity: 0.5,
		friction: 0.9975,
		wallBounce: 0.95,
		followCursor: true
	};

	let count = $.state($.proxy(D.count));
	let gravity = $.state($.proxy(D.gravity));
	let friction = $.state($.proxy(D.friction));
	let wallBounce = $.state($.proxy(D.wallBounce));
	let followCursor = $.state($.proxy(D.followCursor));
	let showContent = $.state(true);
	let key = $.state(0);
	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';
	const hasChanges = $.derived(() => $.get(count) !== D.count || $.get(gravity) !== D.gravity || $.get(friction) !== D.friction || $.get(wallBounce) !== D.wallBounce || $.get(followCursor) !== D.followCursor);

	function reset() {
		$.set(count, D.count, true);
		$.set(gravity, D.gravity, true);
		$.set(friction, D.friction, true);
		$.set(wallBounce, D.wallBounce, true);
		$.set(followCursor, D.followCursor, true);
		$.update(key);
	}

	const usage = $.derived(() => `${sO}
  import Ballpit from '$lib/components/Ballpit.svelte';
${sC}

<div style="width: 100%; height: 600px; position: relative;">
  <Ballpit count={${$.get(count)}} gravity={${$.get(gravity)}} followCursor={${$.get(followCursor)}} />
</div>`);

	const props = [
		{
			name: 'count',
			type: 'number',
			default: '200',
			description: 'Number of spheres.'
		},

		{
			name: 'colors',
			type: 'number[]',
			default: '[0, 0, 0]',
			description: 'Color palette as integer hex values.'
		},

		{
			name: 'ambientColor',
			type: 'number',
			default: '0xffffff',
			description: 'Ambient light color.'
		},

		{
			name: 'ambientIntensity',
			type: 'number',
			default: '1',
			description: 'Ambient light intensity.'
		},

		{
			name: 'lightIntensity',
			type: 'number',
			default: '200',
			description: 'Point light intensity.'
		},

		{
			name: 'minSize',
			type: 'number',
			default: '0.5',
			description: 'Min sphere size.'
		},

		{
			name: 'maxSize',
			type: 'number',
			default: '1',
			description: 'Max sphere size.'
		},

		{
			name: 'gravity',
			type: 'number',
			default: '0.5',
			description: 'Gravity strength.'
		},

		{
			name: 'friction',
			type: 'number',
			default: '0.9975',
			description: 'Velocity friction.'
		},

		{
			name: 'wallBounce',
			type: 'number',
			default: '0.95',
			description: 'Wall bounce factor.'
		},

		{
			name: 'followCursor',
			type: 'boolean',
			default: 'true',
			description: 'Sphere 0 follows cursor.'
		}
	];

	var fragment = root_2();

	$.head('15tc776', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Ballpit - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			$.key(node_1, () => $.get(key), ($$anchor) => {
				Ballpit($$anchor, {
					get count() {
						return $.get(count);
					},

					get gravity() {
						return $.get(gravity);
					},

					get friction() {
						return $.get(friction);
					},

					get wallBounce() {
						return $.get(wallBounce);
					},

					get followCursor() {
						return $.get(followCursor);
					}
				});
			});

			var node_2 = $.sibling(node_1, 2);

			BackgroundContentToggle(node_2, {
				get showContent() {
					return $.get(showContent);
				},
				onToggle: (v) => $.set(showContent, v, true)
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'ballpit',
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
					var node_3 = $.first_child(fragment_4);

					PreviewSlider(node_3, {
						title: 'Count',
						min: 10,
						max: 500,
						step: 1,
						get value() {
							return $.get(count);
						},

						onChange: (v) => {
							$.set(count, v, true);
							$.update(key);
						}
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Gravity',
						min: 0,
						max: 3,
						step: 0.05,
						get value() {
							return $.get(gravity);
						},
						onChange: (v) => $.set(gravity, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Friction',
						min: 0.9,
						max: 1,
						step: 0.0005,
						get value() {
							return $.get(friction);
						},
						onChange: (v) => $.set(friction, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Wall Bounce',
						min: 0,
						max: 1,
						step: 0.01,
						get value() {
							return $.get(wallBounce);
						},
						onChange: (v) => $.set(wallBounce, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSwitch(node_7, {
						title: 'Follow Cursor',
						get checked() {
							return $.get(followCursor);
						},

						onChange: (v) => {
							$.set(followCursor, v, true);
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
			componentName: 'Ballpit',
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