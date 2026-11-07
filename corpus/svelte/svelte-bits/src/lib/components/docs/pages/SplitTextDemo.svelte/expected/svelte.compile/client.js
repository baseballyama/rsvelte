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
import SplitText from '$lib/components/library/TextAnimations/SplitText/SplitText.svelte';
import source from '$lib/components/library/TextAnimations/SplitText/SplitText.svelte?raw';

var root = $.from_html(`<div class="demo-container relative flex min-h-[400px] w-full items-center justify-center overflow-hidden text-[48px] font-bold"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Split Text</h1> <!>`, 1);

export default function SplitTextDemo($$anchor) {
	const DEFAULTS = {
		text: 'Hello, you!',
		delay: 50,
		duration: 1.25,
		ease: 'power3.out',
		splitType: 'chars',
		showCallback: true
	};

	let text = $.state($.proxy(DEFAULTS.text));
	let delay = $.state($.proxy(DEFAULTS.delay));
	let duration = $.state($.proxy(DEFAULTS.duration));
	let ease = $.state($.proxy(DEFAULTS.ease));
	let splitType = $.state($.proxy(DEFAULTS.splitType));
	let showCallback = $.state($.proxy(DEFAULTS.showCallback));
	let replay = $.state(0);
	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';
	const hasChanges = $.derived(() => $.get(text) !== DEFAULTS.text || $.get(delay) !== DEFAULTS.delay || $.get(duration) !== DEFAULTS.duration || $.get(ease) !== DEFAULTS.ease || $.get(splitType) !== DEFAULTS.splitType || $.get(showCallback) !== DEFAULTS.showCallback);

	function reset() {
		$.set(text, DEFAULTS.text, true);
		$.set(delay, DEFAULTS.delay, true);
		$.set(duration, DEFAULTS.duration, true);
		$.set(ease, DEFAULTS.ease, true);
		$.set(splitType, DEFAULTS.splitType, true);
		$.set(showCallback, DEFAULTS.showCallback, true);
		$.update(replay);
	}

	function handleAnimationComplete() {
		if ($.get(showCallback)) console.log('All letters have animated!');
	}

	const usage = $.derived(() => `${scriptOpen}
  import SplitText from '$lib/components/SplitText.svelte';

  const handleAnimationComplete = () => {
    console.log('All letters have animated!');
  };
${scriptClose}

<SplitText
  text="${$.get(text)}"
  class="text-2xl font-semibold text-center"
  delay={${$.get(delay)}}
  duration={${$.get(duration)}}
  ease="${$.get(ease)}"
  splitType="${$.get(splitType)}"
  from={{ opacity: 0, y: 40 }}
  to={{ opacity: 1, y: 0 }}
  threshold={0.1}
  rootMargin="-100px"
  textAlign="center"
  onLetterAnimationComplete={handleAnimationComplete}
/>`);

	const props = [
		{
			name: 'tag',
			type: 'string',
			default: '"p"',
			description: 'HTML tag to render: "h1", "h2", "h3", "h4", "h5", "h6", "p", "span".'
		},

		{
			name: 'text',
			type: 'string',
			default: '""',
			description: 'The text content to animate.'
		},

		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'Additional class names to style the component.'
		},

		{
			name: 'delay',
			type: 'number',
			default: '50',
			description: 'Delay between animations for each letter (in ms).'
		},

		{
			name: 'duration',
			type: 'number',
			default: '1.25',
			description: 'Duration of each letter animation (in seconds).'
		},

		{
			name: 'ease',
			type: 'string',
			default: '"power3.out"',
			description: 'GSAP easing function for the animation.'
		},

		{
			name: 'splitType',
			type: 'string',
			default: '"chars"',
			description: 'Split type: "chars", "words", "lines", or "words, chars".'
		},

		{
			name: 'from',
			type: 'object',
			default: '{ opacity: 0, y: 40 }',
			description: 'Initial GSAP properties for each letter/word.'
		},

		{
			name: 'to',
			type: 'object',
			default: '{ opacity: 1, y: 0 }',
			description: 'Target GSAP properties for each letter/word.'
		},

		{
			name: 'threshold',
			type: 'number',
			default: '0.1',
			description: 'Intersection threshold to trigger the animation (0-1).'
		},

		{
			name: 'rootMargin',
			type: 'string',
			default: '"-100px"',
			description: 'Root margin for ScrollTrigger.'
		},

		{
			name: 'textAlign',
			type: 'string',
			default: '"center"',
			description: "Text alignment: 'left', 'center', 'right', etc."
		},

		{
			name: 'onLetterAnimationComplete',
			type: 'function',
			default: 'undefined',
			description: 'Callback function when all animations complete.'
		}
	];

	var fragment = root_2();

	$.head('nfuzil', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Split Text - svelte-bits';
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
				SplitText($$anchor, {
					get text() {
						return $.get(text);
					},

					get delay() {
						return $.get(delay);
					},

					get duration() {
						return $.get(duration);
					},

					get ease() {
						return $.get(ease);
					},

					get splitType() {
						return $.get(splitType);
					},
					class: 'split-text-demo',
					onLetterAnimationComplete: handleAnimationComplete
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'split-text',
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
						title: 'Split Type',
						options: [
							{ label: 'Chars', value: 'chars' },
							{ label: 'Words', value: 'words' },
							{ label: 'Lines', value: 'lines' }
						],

						get value() {
							return $.get(splitType);
						},

						onChange: (v) => {
							$.set(splitType, v, true);
							$.update(replay);
						}
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSelect(node_4, {
						title: 'Ease',
						options: [
							{ label: 'power3.out', value: 'power3.out' },
							{ label: 'bounce.out', value: 'bounce.out' },
							{ label: 'elastic.out', value: 'elastic.out(1, 0.3)' }
						],

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
						title: 'Stagger Delay',
						min: 10,
						max: 500,
						step: 10,
						get value() {
							return $.get(delay);
						},
						valueUnit: 'ms',
						onChange: (v) => {
							$.set(delay, v, true);
							$.update(replay);
						}
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Duration',
						min: 0.1,
						max: 2,
						step: 0.1,
						get value() {
							return $.get(duration);
						},
						valueUnit: 's',
						onChange: (v) => {
							$.set(duration, v, true);
							$.update(replay);
						}
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSwitch(node_7, {
						title: 'Show Completion Callback',
						get checked() {
							return $.get(showCallback);
						},

						onChange: (v) => {
							$.set(showCallback, v, true);
							$.update(replay);
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
			componentName: 'SplitText',
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