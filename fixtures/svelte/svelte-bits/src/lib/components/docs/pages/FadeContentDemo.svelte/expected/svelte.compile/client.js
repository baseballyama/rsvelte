import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import ReplayButton from '$lib/components/docs/preview/ReplayButton.svelte';
import FadeContent from '$lib/components/library/Animations/FadeContent/FadeContent.svelte';
import fadeContentSource from '$lib/components/library/Animations/FadeContent/FadeContent.svelte?raw';

var root = $.from_html(`<div style="padding:1.2em 2em;border-radius:14px;border:1px solid var(--border-primary);background:var(--bg-elevated);color:var(--text-primary);font-size:1.1rem;font-weight:600;">Fade me in!</div>`);
var root_1 = $.from_html(`<div style="position:relative;min-height:400px;display:flex;align-items:center;justify-content:center;width:100%;"><!> <!></div>`);
var root_2 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<h1 class="sub-category">Fade Content</h1> <!>`, 1);

export default function FadeContentDemo($$anchor) {
	const DEFAULTS = {
		blur: false,
		duration: 1000,
		delay: 0,
		threshold: 0.1,
		initialOpacity: 0
	};

	let blur = $.state($.proxy(DEFAULTS.blur));
	let duration = $.state($.proxy(DEFAULTS.duration));
	let delay = $.state($.proxy(DEFAULTS.delay));
	let threshold = $.state($.proxy(DEFAULTS.threshold));
	let initialOpacity = $.state($.proxy(DEFAULTS.initialOpacity));
	let replay = $.state(0);
	const hasChanges = $.derived(() => $.get(blur) !== DEFAULTS.blur || $.get(duration) !== DEFAULTS.duration || $.get(delay) !== DEFAULTS.delay || $.get(threshold) !== DEFAULTS.threshold || $.get(initialOpacity) !== DEFAULTS.initialOpacity);

	function reset() {
		$.set(blur, DEFAULTS.blur, true);
		$.set(duration, DEFAULTS.duration, true);
		$.set(delay, DEFAULTS.delay, true);
		$.set(threshold, DEFAULTS.threshold, true);
		$.set(initialOpacity, DEFAULTS.initialOpacity, true);
		$.update(replay);
	}

	const usage = $.derived(() => `${'<' + 'script lang="ts">'}
  import FadeContent from '$lib/components/FadeContent.svelte';
${'</' + 'script>'}

<FadeContent
  blur={${$.get(blur)}}
  duration={${$.get(duration)}}
  delay={${$.get(delay)}}
  threshold={${$.get(threshold)}}
  initialOpacity={${$.get(initialOpacity)}}
>
  <p>Fade me in!</p>
</FadeContent>`);

	const props = [
		{
			name: 'children',
			type: 'Snippet',
			default: '-',
			description: 'Content to fade in.'
		},

		{
			name: 'blur',
			type: 'boolean',
			default: 'false',
			description: 'Whether to also animate a 10px blur on entrance.'
		},

		{
			name: 'duration',
			type: 'number',
			default: '1000',
			description: 'Animation duration; values >10 are treated as ms, otherwise seconds.'
		},

		{
			name: 'ease',
			type: 'string',
			default: '"power2.out"',
			description: 'GSAP easing string.'
		},

		{
			name: 'delay',
			type: 'number',
			default: '0',
			description: 'Delay before animation starts; values >10 treated as ms.'
		},

		{
			name: 'threshold',
			type: 'number',
			default: '0.1',
			description: 'IntersectionObserver-style trigger threshold.'
		},

		{
			name: 'initialOpacity',
			type: 'number',
			default: '0',
			description: 'Starting opacity (0–1).'
		},

		{
			name: 'disappearAfter',
			type: 'number',
			default: '0',
			description: 'If >0, fades back out after this duration once entrance completes.'
		},

		{
			name: 'disappearDuration',
			type: 'number',
			default: '0.5',
			description: 'Duration of the disappear tween.'
		},

		{
			name: 'disappearEase',
			type: 'string',
			default: '"power2.in"',
			description: 'GSAP easing for the disappear tween.'
		},

		{
			name: 'onComplete',
			type: '() => void',
			default: 'undefined',
			description: 'Fires when the entrance animation completes.'
		},

		{
			name: 'onDisappearanceComplete',
			type: '() => void',
			default: 'undefined',
			description: 'Fires when the optional disappear animation completes.'
		},

		{
			name: 'container',
			type: 'Element | string | null',
			default: 'null',
			description: 'Optional scroller (selector or element) for ScrollTrigger.'
		},

		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'Extra classes for the wrapper.'
		}
	];

	var fragment = root_3();

	$.head('1lzvibx', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Fade Content - svelte-bits';
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
				FadeContent($$anchor, {
					get blur() {
						return $.get(blur);
					},

					get duration() {
						return $.get(duration);
					},

					get delay() {
						return $.get(delay);
					},

					get threshold() {
						return $.get(threshold);
					},

					get initialOpacity() {
						return $.get(initialOpacity);
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
				slug: 'fade-content',
				get usage() {
					return $.get(usage);
				},

				get source() {
					return fadeContentSource;
				}
			});
		};

		const customize = ($$anchor) => {
			Customize($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_2();
					var node_3 = $.first_child(fragment_4);

					PreviewSwitch(node_3, {
						title: 'Blur',
						get checked() {
							return $.get(blur);
						},

						onChange: (v) => {
							$.set(blur, v, true);
							$.update(replay);
						}
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Duration',
						min: 100,
						max: 3000,
						step: 50,
						get value() {
							return $.get(duration);
						},
						valueUnit: 'ms',
						onChange: (v) => $.set(duration, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Delay',
						min: 0,
						max: 2000,
						step: 50,
						get value() {
							return $.get(delay);
						},
						valueUnit: 'ms',
						onChange: (v) => $.set(delay, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Threshold',
						min: 0,
						max: 1,
						step: 0.05,
						get value() {
							return $.get(threshold);
						},
						onChange: (v) => $.set(threshold, v, true)
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
			componentName: 'FadeContent',
			get usage() {
				return $.get(usage);
			},

			get source() {
				return fadeContentSource;
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