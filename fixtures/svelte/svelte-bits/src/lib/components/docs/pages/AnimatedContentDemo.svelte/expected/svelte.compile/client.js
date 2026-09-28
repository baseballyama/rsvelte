import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import ReplayButton from '$lib/components/docs/preview/ReplayButton.svelte';
import AnimatedContent from '$lib/components/library/Animations/AnimatedContent/AnimatedContent.svelte';
import source from '$lib/components/library/Animations/AnimatedContent/AnimatedContent.svelte?raw';

var root = $.from_html(`<div style="padding:1.2em 2em;border-radius:14px;border:1px solid var(--border-primary);background:var(--bg-elevated);color:var(--text-primary);font-size:1.1rem;font-weight:600;">Animate me!</div>`);
var root_1 = $.from_html(`<div style="position:relative;min-height:400px;display:flex;align-items:center;justify-content:center;width:100%;"><!> <!></div>`);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<h1 class="sub-category">Animated Content</h1> <!>`, 1);

export default function AnimatedContentDemo($$anchor) {
	const DEFAULTS = {
		distance: 100,
		direction: 'vertical',
		reverse: false,
		duration: 0.8,
		initialOpacity: 0,
		animateOpacity: true,
		scale: 1,
		threshold: 0.1,
		delay: 0
	};

	let distance = $.state($.proxy(DEFAULTS.distance));
	let direction = $.state($.proxy(DEFAULTS.direction));
	let reverse = $.state($.proxy(DEFAULTS.reverse));
	let duration = $.state($.proxy(DEFAULTS.duration));
	let initialOpacity = $.state($.proxy(DEFAULTS.initialOpacity));
	let animateOpacity = $.state($.proxy(DEFAULTS.animateOpacity));
	let scale = $.state($.proxy(DEFAULTS.scale));
	let threshold = $.state($.proxy(DEFAULTS.threshold));
	let delay = $.state($.proxy(DEFAULTS.delay));

	// remount key to replay animation when props change
	let replay = $.state(0);

	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';
	const hasChanges = $.derived(() => $.get(distance) !== DEFAULTS.distance || $.get(direction) !== DEFAULTS.direction || $.get(reverse) !== DEFAULTS.reverse || $.get(duration) !== DEFAULTS.duration || $.get(initialOpacity) !== DEFAULTS.initialOpacity || $.get(animateOpacity) !== DEFAULTS.animateOpacity || $.get(scale) !== DEFAULTS.scale || $.get(threshold) !== DEFAULTS.threshold || $.get(delay) !== DEFAULTS.delay);

	function reset() {
		$.set(distance, DEFAULTS.distance, true);
		$.set(direction, DEFAULTS.direction, true);
		$.set(reverse, DEFAULTS.reverse, true);
		$.set(duration, DEFAULTS.duration, true);
		$.set(initialOpacity, DEFAULTS.initialOpacity, true);
		$.set(animateOpacity, DEFAULTS.animateOpacity, true);
		$.set(scale, DEFAULTS.scale, true);
		$.set(threshold, DEFAULTS.threshold, true);
		$.set(delay, DEFAULTS.delay, true);
		$.set(replay, $.get(replay) + 1);
	}

	const usage = $.derived(() => `${scriptOpen}
  import AnimatedContent from '$lib/components/AnimatedContent.svelte';
${scriptClose}

<AnimatedContent
  distance={${$.get(distance)}}
  direction="${$.get(direction)}"
  reverse={${$.get(reverse)}}
  duration={${$.get(duration)}}
  initialOpacity={${$.get(initialOpacity)}}
  animateOpacity={${$.get(animateOpacity)}}
  scale={${$.get(scale)}}
  threshold={${$.get(threshold)}}
  delay={${$.get(delay)}}
>
  <p>Animate me!</p>
</AnimatedContent>`);

	const props = [
		{
			name: 'distance',
			type: 'number',
			default: '100',
			description: 'Distance (px) the element travels.'
		},

		{
			name: 'direction',
			type: "'vertical' | 'horizontal'",
			default: '"vertical"',
			description: 'Movement axis.'
		},

		{
			name: 'reverse',
			type: 'boolean',
			default: 'false',
			description: 'Inverts the start direction.'
		},

		{
			name: 'duration',
			type: 'number',
			default: '0.8',
			description: 'Animation duration in seconds.'
		},

		{
			name: 'easing',
			type: 'string',
			default: '"cubic-bezier(0.16, 1, 0.3, 1)"',
			description: 'CSS easing function.'
		},

		{
			name: 'initialOpacity',
			type: 'number',
			default: '0',
			description: 'Starting opacity (0–1).'
		},

		{
			name: 'animateOpacity',
			type: 'boolean',
			default: 'true',
			description: 'Whether opacity is animated.'
		},

		{
			name: 'scale',
			type: 'number',
			default: '1',
			description: 'Starting scale.'
		},

		{
			name: 'threshold',
			type: 'number',
			default: '0.1',
			description: 'IntersectionObserver threshold to trigger.'
		},

		{
			name: 'delay',
			type: 'number',
			default: '0',
			description: 'Delay before animation (seconds).'
		},

		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'Extra classes for the wrapper.'
		}
	];

	var fragment = root_3();

	$.head('tft7ju', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Animated Content - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root_1();
			var node_1 = $.child(div);

			ReplayButton(node_1, { onClick: () => $.update(replay) });

			var node_2 = $.sibling(node_1, 2);

			$.key(node_2, () => $.get(replay), ($$anchor) => {
				AnimatedContent($$anchor, {
					get distance() {
						return $.get(distance);
					},

					get direction() {
						return $.get(direction);
					},

					get reverse() {
						return $.get(reverse);
					},

					get duration() {
						return $.get(duration);
					},

					get initialOpacity() {
						return $.get(initialOpacity);
					},

					get animateOpacity() {
						return $.get(animateOpacity);
					},

					get scale() {
						return $.get(scale);
					},

					get threshold() {
						return $.get(threshold);
					},

					get delay() {
						return $.get(delay);
					},

					children: ($$anchor, $$slotProps) => {
						var div_1 = root();

						$.append($$anchor, div_1);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'animated-content',
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
					var fragment_4 = root_2();
					var node_3 = $.first_child(fragment_4);

					PreviewSlider(node_3, {
						title: 'Distance',
						min: 0,
						max: 400,
						step: 10,
						get value() {
							return $.get(distance);
						},
						valueUnit: 'px',
						onChange: (v) => $.set(distance, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSelect(node_4, {
						title: 'Direction',
						options: [
							{ label: 'Vertical', value: 'vertical' },
							{ label: 'Horizontal', value: 'horizontal' }
						],

						get value() {
							return $.get(direction);
						},
						onChange: (v) => $.set(direction, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Duration',
						min: 0.1,
						max: 3,
						step: 0.1,
						get value() {
							return $.get(duration);
						},
						valueUnit: 's',
						onChange: (v) => $.set(duration, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Delay',
						min: 0,
						max: 2,
						step: 0.05,
						get value() {
							return $.get(delay);
						},
						valueUnit: 's',
						onChange: (v) => $.set(delay, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Initial Opacity',
						min: 0,
						max: 1,
						step: 0.05,
						get value() {
							return $.get(initialOpacity);
						},
						onChange: (v) => $.set(initialOpacity, v, true)
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSlider(node_8, {
						title: 'Scale',
						min: 0.5,
						max: 2,
						step: 0.05,
						get value() {
							return $.get(scale);
						},
						onChange: (v) => $.set(scale, v, true)
					});

					var node_9 = $.sibling(node_8, 2);

					PreviewSlider(node_9, {
						title: 'Threshold',
						min: 0,
						max: 1,
						step: 0.05,
						get value() {
							return $.get(threshold);
						},
						onChange: (v) => $.set(threshold, v, true)
					});

					var node_10 = $.sibling(node_9, 2);

					PreviewSwitch(node_10, {
						title: 'Reverse',
						get checked() {
							return $.get(reverse);
						},
						onChange: (v) => $.set(reverse, v, true)
					});

					var node_11 = $.sibling(node_10, 2);

					PreviewSwitch(node_11, {
						title: 'Animate Opacity',
						get checked() {
							return $.get(animateOpacity);
						},
						onChange: (v) => $.set(animateOpacity, v, true)
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
			componentName: 'AnimatedContent',
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