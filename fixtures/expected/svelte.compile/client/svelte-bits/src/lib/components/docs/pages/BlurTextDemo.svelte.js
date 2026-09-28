import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import ReplayButton from '$lib/components/docs/preview/ReplayButton.svelte';
import BlurText from '$lib/components/library/TextAnimations/BlurText/BlurText.svelte';
import blurTextSource from '$lib/components/library/TextAnimations/BlurText/BlurText.svelte?raw';

var root = $.from_html(`<div style="position:relative;min-height:400px;display:flex;align-items:center;justify-content:center;width:100%;font-size:48px;font-weight:700;"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Blur Text</h1> <!>`, 1);

export default function BlurTextDemo($$anchor) {
	const DEFAULTS = {
		text: 'Isn\u2019t this so cool?!',
		delay: 200,
		animateBy: 'words',
		direction: 'top',
		threshold: 0.1,
		stepDuration: 0.35
	};

	let text = $.state($.proxy(DEFAULTS.text));
	let delay = $.state($.proxy(DEFAULTS.delay));
	let animateBy = $.state($.proxy(DEFAULTS.animateBy));
	let direction = $.state($.proxy(DEFAULTS.direction));
	let threshold = $.state($.proxy(DEFAULTS.threshold));
	let stepDuration = $.state($.proxy(DEFAULTS.stepDuration));
	let replay = $.state(0);
	const hasChanges = $.derived(() => $.get(text) !== DEFAULTS.text || $.get(delay) !== DEFAULTS.delay || $.get(animateBy) !== DEFAULTS.animateBy || $.get(direction) !== DEFAULTS.direction || $.get(threshold) !== DEFAULTS.threshold || $.get(stepDuration) !== DEFAULTS.stepDuration);

	function reset() {
		$.set(text, DEFAULTS.text, true);
		$.set(delay, DEFAULTS.delay, true);
		$.set(animateBy, DEFAULTS.animateBy, true);
		$.set(direction, DEFAULTS.direction, true);
		$.set(threshold, DEFAULTS.threshold, true);
		$.set(stepDuration, DEFAULTS.stepDuration, true);
		$.update(replay);
	}

	const usage = $.derived(() => `${'<' + 'script lang="ts">'}
  import BlurText from '$lib/components/BlurText.svelte';
${'</' + 'script>'}

<BlurText
  text="${$.get(text)}"
  delay={${$.get(delay)}}
  animateBy="${$.get(animateBy)}"
  direction="${$.get(direction)}"
  threshold={${$.get(threshold)}}
  stepDuration={${$.get(stepDuration)}}
  onAnimationComplete={() => console.log('done')}
/>`);

	const props = [
		{
			name: 'text',
			type: 'string',
			default: '""',
			description: 'The text to animate.'
		},

		{
			name: 'delay',
			type: 'number',
			default: '200',
			description: 'Per-segment stagger in milliseconds.'
		},

		{
			name: 'animateBy',
			type: "'words' | 'letters'",
			default: '"words"',
			description: 'Whether to animate one segment per word or per letter.'
		},

		{
			name: 'direction',
			type: "'top' | 'bottom'",
			default: '"top"',
			description: 'Direction segments enter from.'
		},

		{
			name: 'threshold',
			type: 'number',
			default: '0.1',
			description: 'IntersectionObserver threshold to trigger.'
		},

		{
			name: 'rootMargin',
			type: 'string',
			default: '"0px"',
			description: 'IntersectionObserver root margin.'
		},

		{
			name: 'animationFrom',
			type: 'Record<string, string | number>',
			default: 'undefined',
			description: 'Override the initial keyframe.'
		},

		{
			name: 'animationTo',
			type: 'Array<Record<string, string | number>>',
			default: 'undefined',
			description: 'Override the array of intermediate/final keyframes.'
		},

		{
			name: 'easing',
			type: 'Easing',
			default: '(t) => t',
			description: 'Easing function or array passed through to motion.'
		},

		{
			name: 'stepDuration',
			type: 'number',
			default: '0.35',
			description: 'Duration of each keyframe step in seconds.'
		},

		{
			name: 'onAnimationComplete',
			type: '() => void',
			default: 'undefined',
			description: 'Fires when the last segment finishes.'
		},

		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'Extra classes for the paragraph wrapper.'
		}
	];

	var fragment = root_2();

	$.head('gz8ugk', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Blur Text - svelte-bits';
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
				BlurText($$anchor, {
					get text() {
						return $.get(text);
					},

					get delay() {
						return $.get(delay);
					},

					get animateBy() {
						return $.get(animateBy);
					},

					get direction() {
						return $.get(direction);
					},

					get threshold() {
						return $.get(threshold);
					},

					get stepDuration() {
						return $.get(stepDuration);
					}
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'blur-text',
				get usage() {
					return $.get(usage);
				},

				get source() {
					return blurTextSource;
				}
			});
		};

		const customize = ($$anchor) => {
			Customize($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_1();
					var node_3 = $.first_child(fragment_4);

					PreviewSlider(node_3, {
						title: 'Delay',
						min: 0,
						max: 1000,
						step: 10,
						get value() {
							return $.get(delay);
						},
						valueUnit: 'ms',
						onChange: (v) => $.set(delay, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSelect(node_4, {
						title: 'Animate By',
						options: [
							{ label: 'Words', value: 'words' },
							{ label: 'Letters', value: 'letters' }
						],

						get value() {
							return $.get(animateBy);
						},

						onChange: (v) => {
							$.set(animateBy, v, true);
							$.update(replay);
						}
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSelect(node_5, {
						title: 'Direction',
						options: [
							{ label: 'Top', value: 'top' },
							{ label: 'Bottom', value: 'bottom' }
						],

						get value() {
							return $.get(direction);
						},

						onChange: (v) => {
							$.set(direction, v, true);
							$.update(replay);
						}
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
						title: 'Step Duration',
						min: 0.1,
						max: 1.5,
						step: 0.05,
						get value() {
							return $.get(stepDuration);
						},
						valueUnit: 's',
						onChange: (v) => $.set(stepDuration, v, true)
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
			componentName: 'BlurText',
			get usage() {
				return $.get(usage);
			},

			get source() {
				return blurTextSource;
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