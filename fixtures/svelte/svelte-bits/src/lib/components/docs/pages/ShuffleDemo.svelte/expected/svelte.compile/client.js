import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import ReplayButton from '$lib/components/docs/preview/ReplayButton.svelte';
import Shuffle from '$lib/components/library/TextAnimations/Shuffle/Shuffle.svelte';
import source from '$lib/components/library/TextAnimations/Shuffle/Shuffle.svelte?raw';

var root = $.from_html(`<div class="demo-container relative flex min-h-[400px] w-full items-center justify-center overflow-hidden"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Shuffle</h1> <!>`, 1);

export default function ShuffleDemo($$anchor) {
	const DEFAULTS = {
		duration: 0.35,
		shuffleTimes: 1,
		stagger: 0.03,
		shuffleDirection: 'right',
		ease: 'power3.out',
		loop: false,
		loopDelay: 0,
		triggerOnHover: true
	};

	let duration = $.state($.proxy(DEFAULTS.duration));
	let shuffleTimes = $.state($.proxy(DEFAULTS.shuffleTimes));
	let stagger = $.state($.proxy(DEFAULTS.stagger));
	let shuffleDirection = $.state($.proxy(DEFAULTS.shuffleDirection));
	let ease = $.state($.proxy(DEFAULTS.ease));
	let loop = $.state($.proxy(DEFAULTS.loop));
	let loopDelay = $.state($.proxy(DEFAULTS.loopDelay));
	let triggerOnHover = $.state($.proxy(DEFAULTS.triggerOnHover));
	let replay = $.state(0);
	const hasChanges = $.derived(() => $.get(duration) !== DEFAULTS.duration || $.get(shuffleTimes) !== DEFAULTS.shuffleTimes || $.get(stagger) !== DEFAULTS.stagger || $.get(shuffleDirection) !== DEFAULTS.shuffleDirection || $.get(ease) !== DEFAULTS.ease || $.get(loop) !== DEFAULTS.loop || $.get(loopDelay) !== DEFAULTS.loopDelay || $.get(triggerOnHover) !== DEFAULTS.triggerOnHover);

	function reset() {
		$.set(duration, DEFAULTS.duration, true);
		$.set(shuffleTimes, DEFAULTS.shuffleTimes, true);
		$.set(stagger, DEFAULTS.stagger, true);
		$.set(shuffleDirection, DEFAULTS.shuffleDirection, true);
		$.set(ease, DEFAULTS.ease, true);
		$.set(loop, DEFAULTS.loop, true);
		$.set(loopDelay, DEFAULTS.loopDelay, true);
		$.set(triggerOnHover, DEFAULTS.triggerOnHover, true);
		$.update(replay);
	}

	const usage = $.derived(() => `<Shuffle
  text="SVELTE BITS"
  shuffleDirection="${$.get(shuffleDirection)}"
  duration={${$.get(duration)}}
  shuffleTimes={${$.get(shuffleTimes)}}
  stagger={${$.get(stagger)}}
  ease="${$.get(ease)}"
  loop={${$.get(loop)}}
  loopDelay={${$.get(loopDelay)}}
  triggerOnHover={${$.get(triggerOnHover)}}
/>`);

	const props = [
		{
			name: 'text',
			type: 'string',
			default: '""',
			description: 'The text content to shuffle.'
		},

		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'Optional CSS class for the wrapper element.'
		},

		{
			name: 'style',
			type: 'string',
			default: '""',
			description: 'Inline styles applied to the wrapper element.'
		},

		{
			name: 'shuffleDirection',
			type: '"left" | "right" | "up" | "down"',
			default: '"right"',
			description: 'Direction the per-letter strip slides to reveal the final character.'
		},

		{
			name: 'duration',
			type: 'number',
			default: '0.35',
			description: 'Duration (s) of the strip slide per letter.'
		},

		{
			name: 'maxDelay',
			type: 'number',
			default: '0',
			description: 'Max random delay per strip when animationMode = "random".'
		},

		{
			name: 'ease',
			type: 'string | Function',
			default: '"power3.out"',
			description: 'GSAP ease for sliding and color tween.'
		},

		{
			name: 'threshold',
			type: 'number',
			default: '0.1',
			description: 'Portion of the element that must enter view before starting.'
		},

		{
			name: 'rootMargin',
			type: 'string',
			default: '"-100px"',
			description: 'ScrollTrigger start offset (px, %, etc.).'
		},

		{
			name: 'tag',
			type: '"h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span"',
			default: '"p"',
			description: 'HTML tag to render for the text container.'
		},

		{
			name: 'textAlign',
			type: 'string',
			default: '"center"',
			description: 'Text alignment applied via inline style.'
		},

		{
			name: 'onShuffleComplete',
			type: '() => void',
			default: 'undefined',
			description: 'Called after a full run completes (and on each loop repeat).'
		},

		{
			name: 'shuffleTimes',
			type: 'number',
			default: '1',
			description: 'How many interim scrambled glyphs to scroll past before the final char.'
		},

		{
			name: 'animationMode',
			type: '"evenodd" | "random"',
			default: '"evenodd"',
			description: 'Odd/even staggered strips or random per-strip delays.'
		},

		{
			name: 'loop',
			type: 'boolean',
			default: 'false',
			description: 'Repeat the shuffle indefinitely.'
		},

		{
			name: 'loopDelay',
			type: 'number',
			default: '0',
			description: 'Delay (s) between loop repeats.'
		},

		{
			name: 'stagger',
			type: 'number',
			default: '0.03',
			description: 'Stagger (s) for strips in "evenodd" mode.'
		},

		{
			name: 'scrambleCharset',
			type: 'string',
			default: '""',
			description: 'Characters to use for interim scrambles; empty keeps original copies.'
		},

		{
			name: 'colorFrom',
			type: 'string',
			default: 'undefined',
			description: 'Optional starting text color while shuffling.'
		},

		{
			name: 'colorTo',
			type: 'string',
			default: 'undefined',
			description: 'Optional final text color to tween to.'
		},

		{
			name: 'triggerOnce',
			type: 'boolean',
			default: 'true',
			description: 'Auto-run only on first scroll into view.'
		},

		{
			name: 'respectReducedMotion',
			type: 'boolean',
			default: 'true',
			description: 'Skip animation if user prefers reduced motion.'
		},

		{
			name: 'triggerOnHover',
			type: 'boolean',
			default: 'true',
			description: 'Allow re-playing the animation on hover after it completes.'
		}
	];

	const directionOptions = [
		{ label: 'Right', value: 'right' },
		{ label: 'Left', value: 'left' },
		{ label: 'Up', value: 'up' },
		{ label: 'Down', value: 'down' }
	];

	const easeOptions = [
		{ label: 'power2.out', value: 'power2.out' },
		{ label: 'power3.out', value: 'power3.out' },
		{ label: 'back.out(1.1)', value: 'back.out(1.1)' },
		{ label: 'expo.out', value: 'expo.out' }
	];

	var fragment = root_2();

	$.head('1tchaon', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Shuffle - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			ReplayButton(node_1, { onClick: () => $.update(replay) });

			var node_2 = $.sibling(node_1, 2);

			$.key(node_2, () => $.get(replay), ($$anchor) => {
				Shuffle($$anchor, {
					text: 'SVELTE BITS',
					get ease() {
						return $.get(ease);
					},

					get duration() {
						return $.get(duration);
					},

					get shuffleTimes() {
						return $.get(shuffleTimes);
					},

					get stagger() {
						return $.get(stagger);
					},

					get shuffleDirection() {
						return $.get(shuffleDirection);
					},

					get loop() {
						return $.get(loop);
					},

					get loopDelay() {
						return $.get(loopDelay);
					},

					get triggerOnHover() {
						return $.get(triggerOnHover);
					}
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'shuffle',
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

					PreviewSelect(node_3, {
						title: 'Direction',
						get options() {
							return directionOptions;
						},

						get value() {
							return $.get(shuffleDirection);
						},

						onChange: (v) => {
							$.set(shuffleDirection, v, true);
							$.update(replay);
						}
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSelect(node_4, {
						title: 'Ease',
						get options() {
							return easeOptions;
						},

						get value() {
							return $.get(ease);
						},

						onChange: (v) => {
							$.set(ease, v, true);
							$.update(replay);
						}
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Duration',
						min: 0.1,
						max: 1.5,
						step: 0.05,
						get value() {
							return $.get(duration);
						},
						valueUnit: 's',
						onChange: (v) => {
							$.set(duration, v, true);
							$.update(replay);
						}
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Shuffle Times',
						min: 1,
						max: 8,
						step: 1,
						get value() {
							return $.get(shuffleTimes);
						},

						onChange: (v) => {
							$.set(shuffleTimes, v, true);
							$.update(replay);
						}
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Stagger',
						min: 0,
						max: 0.2,
						step: 0.01,
						get value() {
							return $.get(stagger);
						},
						valueUnit: 's',
						onChange: (v) => {
							$.set(stagger, v, true);
							$.update(replay);
						}
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSwitch(node_8, {
						title: 'Hover Replay',
						get checked() {
							return $.get(triggerOnHover);
						},

						onChange: (v) => {
							$.set(triggerOnHover, v, true);
							$.update(replay);
						}
					});

					var node_9 = $.sibling(node_8, 2);

					PreviewSwitch(node_9, {
						title: 'Loop',
						get checked() {
							return $.get(loop);
						},

						onChange: (v) => {
							$.set(loop, v, true);
							$.update(replay);
						}
					});

					var node_10 = $.sibling(node_9, 2);

					{
						let $0 = $.derived(() => !$.get(loop));

						PreviewSlider(node_10, {
							title: 'Loop Delay',
							min: 0,
							max: 2,
							step: 0.1,
							get value() {
								return $.get(loopDelay);
							},

							get isDisabled() {
								return $.get($0);
							},
							valueUnit: 's',
							onChange: (v) => {
								$.set(loopDelay, v, true);
								$.update(replay);
							}
						});
					}

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
			componentName: 'Shuffle',
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