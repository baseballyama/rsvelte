import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import GradualBlur from '$lib/components/library/Animations/GradualBlur/GradualBlur.svelte';
import source from '$lib/components/library/Animations/GradualBlur/GradualBlur.svelte?raw';

var root = $.from_html(`<div style="padding:1.5rem;background:linear-gradient(135deg, rgba(255,138,76,0.15), rgba(255,138,76,0.04));border:1px solid #2a2a2a;border-radius:12px;"><h3 style="margin:0 0 .5rem;font-size:1.1rem;font-weight:700;"></h3> <p style="margin:0;color:#aaa;font-size:.9rem;line-height:1.5;">Scroll to see the gradual blur fade content behind the overlay edge. The blur stacks multiple layers with progressively higher strength.</p></div>`);
var root_1 = $.from_html(`<div class="demo-container" style="position:relative;height:500px;overflow:hidden;padding:0;"><div style="position:absolute;inset:0;overflow-y:auto;"><div style="padding:1.5rem;color:#fff;display:flex;flex-direction:column;gap:1rem;"></div></div> <!></div>`);
var root_2 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<h1 class="sub-category">Gradual Blur</h1> <!>`, 1);

export default function GradualBlurDemo($$anchor) {
	const DEFAULTS = {
		position: 'bottom',
		strength: 2,
		height: '6rem',
		divCount: 5,
		exponential: true,
		opacity: 1
	};

	let position = $.state($.proxy(DEFAULTS.position));
	let strength = $.state($.proxy(DEFAULTS.strength));
	let height = $.state($.proxy(DEFAULTS.height));
	let divCount = $.state($.proxy(DEFAULTS.divCount));
	let exponential = $.state($.proxy(DEFAULTS.exponential));
	let opacity = $.state($.proxy(DEFAULTS.opacity));
	const hasChanges = $.derived(() => $.get(position) !== DEFAULTS.position || $.get(strength) !== DEFAULTS.strength || $.get(height) !== DEFAULTS.height || $.get(divCount) !== DEFAULTS.divCount || $.get(exponential) !== DEFAULTS.exponential || $.get(opacity) !== DEFAULTS.opacity);

	function reset() {
		$.set(position, DEFAULTS.position, true);
		$.set(strength, DEFAULTS.strength, true);
		$.set(height, DEFAULTS.height, true);
		$.set(divCount, DEFAULTS.divCount, true);
		$.set(exponential, DEFAULTS.exponential, true);
		$.set(opacity, DEFAULTS.opacity, true);
	}

	const usage = $.derived(() => `<GradualBlur position="${$.get(position)}" strength={${$.get(strength)}} height="${$.get(height)}" divCount={${$.get(divCount)}} exponential={${$.get(exponential)}} opacity={${$.get(opacity)}} />`);

	const props = [
		{
			name: 'position',
			type: '"top" | "bottom" | "left" | "right"',
			default: '"bottom"',
			description: 'Edge to apply blur.'
		},

		{
			name: 'strength',
			type: 'number',
			default: '2',
			description: 'Maximum blur strength.'
		},

		{
			name: 'height',
			type: 'string',
			default: '"6rem"',
			description: 'Overlay thickness.'
		},

		{
			name: 'width',
			type: 'string',
			default: 'undefined',
			description: 'Overlay width (for left/right).'
		},

		{
			name: 'divCount',
			type: 'number',
			default: '5',
			description: 'Number of stacked blur layers.'
		},

		{
			name: 'exponential',
			type: 'boolean',
			default: 'false',
			description: 'Exponential blur ramp.'
		},

		{
			name: 'curve',
			type: '"linear" | "bezier" | "ease-in" | "ease-out" | "ease-in-out"',
			default: '"linear"',
			description: 'Blur ramp curve.'
		},

		{
			name: 'opacity',
			type: 'number',
			default: '1',
			description: 'Overall opacity.'
		},

		{
			name: 'animated',
			type: 'boolean | "scroll"',
			default: 'false',
			description: 'Enable transition / scroll-reveal.'
		},

		{
			name: 'duration',
			type: 'string',
			default: '"0.3s"',
			description: 'Transition duration.'
		},

		{
			name: 'easing',
			type: 'string',
			default: '"ease-out"',
			description: 'Transition easing.'
		},

		{
			name: 'hoverIntensity',
			type: 'number',
			default: 'undefined',
			description: 'Multiplier on hover.'
		},

		{
			name: 'target',
			type: '"parent" | "page"',
			default: '"parent"',
			description: 'Whether to attach to parent or fixed to viewport.'
		},

		{
			name: 'preset',
			type: 'string',
			default: 'undefined',
			description: 'Apply a built-in preset.'
		}
	];

	var fragment = root_3();

	$.head('1vh307x', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Gradual Blur - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root_1();
			var div_1 = $.child(div);
			var div_2 = $.child(div_1);

			$.each(div_2, 20, () => Array(20), $.index, ($$anchor, _, i) => {
				var div_3 = root();
				var h3 = $.child(div_3);

				h3.textContent = `Card #${i + 1}`;
				$.next(2);
				$.reset(div_3);
				$.append($$anchor, div_3);
			});

			$.reset(div_2);
			$.reset(div_1);

			var node_1 = $.sibling(div_1, 2);

			GradualBlur(node_1, {
				get position() {
					return $.get(position);
				},

				get strength() {
					return $.get(strength);
				},

				get height() {
					return $.get(height);
				},

				get divCount() {
					return $.get(divCount);
				},

				get exponential() {
					return $.get(exponential);
				},

				get opacity() {
					return $.get(opacity);
				}
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'gradual-blur',
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

					PreviewSelect(node_2, {
						title: 'Position',
						get value() {
							return $.get(position);
						},

						options: [
							{ label: 'Bottom', value: 'bottom' },
							{ label: 'Top', value: 'top' },
							{ label: 'Left', value: 'left' },
							{ label: 'Right', value: 'right' }
						],
						onChange: (v) => $.set(position, v, true)
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSlider(node_3, {
						title: 'Strength',
						min: 0,
						max: 10,
						step: 0.1,
						get value() {
							return $.get(strength);
						},
						onChange: (v) => $.set(strength, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Div Count',
						min: 1,
						max: 20,
						step: 1,
						get value() {
							return $.get(divCount);
						},
						onChange: (v) => $.set(divCount, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Opacity',
						min: 0,
						max: 1,
						step: 0.05,
						get value() {
							return $.get(opacity);
						},
						onChange: (v) => $.set(opacity, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSwitch(node_6, {
						title: 'Exponential',
						get checked() {
							return $.get(exponential);
						},
						onChange: (v) => $.set(exponential, v, true)
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
			componentName: 'GradualBlur',
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