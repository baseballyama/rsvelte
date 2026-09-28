import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import PixelTransition from '$lib/components/library/Animations/PixelTransition/PixelTransition.svelte';
import source from '$lib/components/library/Animations/PixelTransition/PixelTransition.svelte?raw';

var root = $.from_html(`<img src="https://picsum.photos/seed/pix/400/400" alt="" style="width:100%;height:100%;object-fit:cover;"/>`);
var root_1 = $.from_html(`<div style="display:grid;place-items:center;width:100%;height:100%;background:#111;color:#fff;font-size:1.6rem;font-weight:700;">Hello!</div>`);
var root_2 = $.from_html(`<div class="demo-container" style="position:relative;height:500px;display:flex;align-items:center;justify-content:center;"><div style="width:340px;"><!></div></div>`);
var root_3 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<h1 class="sub-category">Pixel Transition</h1> <!>`, 1);

export default function PixelTransitionDemo($$anchor) {
	const DEFAULTS = {
		gridSize: 8,
		pixelColor: '#ffffff',
		animationStepDuration: 0.4,
		once: false
	};

	let gridSize = $.state($.proxy(DEFAULTS.gridSize));
	let pixelColor = $.state($.proxy(DEFAULTS.pixelColor));
	let animationStepDuration = $.state($.proxy(DEFAULTS.animationStepDuration));
	let once = $.state($.proxy(DEFAULTS.once));
	const hasChanges = $.derived(() => $.get(gridSize) !== DEFAULTS.gridSize || $.get(pixelColor) !== DEFAULTS.pixelColor || $.get(animationStepDuration) !== DEFAULTS.animationStepDuration || $.get(once) !== DEFAULTS.once);

	function reset() {
		$.set(gridSize, DEFAULTS.gridSize, true);
		$.set(pixelColor, DEFAULTS.pixelColor, true);
		$.set(animationStepDuration, DEFAULTS.animationStepDuration, true);
		$.set(once, DEFAULTS.once, true);
	}

	const usage = $.derived(() => `<PixelTransition gridSize={${$.get(gridSize)}} pixelColor="${$.get(pixelColor)}" animationStepDuration={${$.get(animationStepDuration)}} aspectRatio="100%">
  {#snippet firstContent()}<img src="..." />{/snippet}
  {#snippet secondContent()}<div>Hello!</div>{/snippet}
</PixelTransition>`);

	const props = [
		{
			name: 'firstContent',
			type: 'Snippet',
			default: 'required',
			description: 'Initial content.'
		},

		{
			name: 'secondContent',
			type: 'Snippet',
			default: 'required',
			description: 'Revealed content on hover.'
		},

		{
			name: 'gridSize',
			type: 'number',
			default: '7',
			description: 'Pixel grid resolution.'
		},

		{
			name: 'pixelColor',
			type: 'string',
			default: '"currentColor"',
			description: 'Color of transition pixels.'
		},

		{
			name: 'animationStepDuration',
			type: 'number',
			default: '0.3',
			description: 'Per-step duration (s).'
		},

		{
			name: 'aspectRatio',
			type: 'string',
			default: '"100%"',
			description: 'CSS aspect-ratio padding-bottom.'
		},

		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'Wrapper class.'
		},

		{
			name: 'pixelClass',
			type: 'string',
			default: '""',
			description: 'Class for each pixel.'
		}
	];

	var fragment = root_4();

	$.head('y93ehd', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Pixel Transition - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root_2();
			var div_1 = $.child(div);
			var node_1 = $.child(div_1);

			{
				const firstContent = ($$anchor) => {
					var img = root();

					$.append($$anchor, img);
				};

				const secondContent = ($$anchor) => {
					var div_2 = root_1();

					$.append($$anchor, div_2);
				};

				PixelTransition(node_1, {
					get gridSize() {
						return $.get(gridSize);
					},

					get pixelColor() {
						return $.get(pixelColor);
					},

					get animationStepDuration() {
						return $.get(animationStepDuration);
					},
					aspectRatio: '100%',
					firstContent,
					secondContent,
					$$slots: { firstContent: true, secondContent: true }
				});
			}

			$.reset(div_1);
			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'pixel-transition',
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
					var fragment_3 = root_3();
					var node_2 = $.first_child(fragment_3);

					PreviewColorPicker(node_2, {
						title: 'Pixel Color',
						get value() {
							return $.get(pixelColor);
						},
						onChange: (v) => $.set(pixelColor, v, true)
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSlider(node_3, {
						title: 'Grid Size',
						min: 2,
						max: 20,
						step: 1,
						get value() {
							return $.get(gridSize);
						},
						onChange: (v) => $.set(gridSize, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Step Duration',
						min: 0.1,
						max: 2,
						step: 0.05,
						get value() {
							return $.get(animationStepDuration);
						},
						valueUnit: 's',
						onChange: (v) => $.set(animationStepDuration, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSwitch(node_5, {
						title: 'Play Once',
						get checked() {
							return $.get(once);
						},
						onChange: (v) => $.set(once, v, true)
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
			componentName: 'PixelTransition',
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