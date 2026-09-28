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
import RotatingText from '$lib/components/library/TextAnimations/RotatingText/RotatingText.svelte';
import source from '$lib/components/library/TextAnimations/RotatingText/RotatingText.svelte?raw';

var root = $.from_html(`<p style="display:flex;align-items:center;gap:0.4em;margin:0;"><span>Creative</span> <span style="display:inline-flex;padding:0.125rem 0.5rem;background-color:#5227FF;color:#fff;border-radius:0.5rem;overflow:hidden;"><!></span></p>`);
var root_1 = $.from_html(`<div class="demo-container relative w-full overflow-hidden" style="height:400px;display:flex;align-items:center;justify-content:center;font-size:clamp(1.5rem, 4vw, 3rem);font-weight:900;"><!> <!></div>`);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<h1 class="sub-category">Rotating Text</h1> <!>`, 1);

export default function RotatingTextDemo($$anchor) {
	const DEFAULTS = {
		rotationInterval: 2000,
		staggerDuration: 0.025,
		staggerFrom: 'last',
		splitBy: 'characters',
		auto: true,
		loop: true
	};

	let rotationInterval = $.state($.proxy(DEFAULTS.rotationInterval));
	let staggerDuration = $.state($.proxy(DEFAULTS.staggerDuration));
	let staggerFrom = $.state($.proxy(DEFAULTS.staggerFrom));
	let splitBy = $.state($.proxy(DEFAULTS.splitBy));
	let auto = $.state($.proxy(DEFAULTS.auto));
	let loop = $.state($.proxy(DEFAULTS.loop));
	let replay = $.state(0);
	const words = ['thinking', 'coding', 'components!'];
	const hasChanges = $.derived(() => $.get(rotationInterval) !== DEFAULTS.rotationInterval || $.get(staggerDuration) !== DEFAULTS.staggerDuration || $.get(staggerFrom) !== DEFAULTS.staggerFrom || $.get(splitBy) !== DEFAULTS.splitBy || $.get(auto) !== DEFAULTS.auto || $.get(loop) !== DEFAULTS.loop);

	function reset() {
		$.set(rotationInterval, DEFAULTS.rotationInterval, true);
		$.set(staggerDuration, DEFAULTS.staggerDuration, true);
		$.set(staggerFrom, DEFAULTS.staggerFrom, true);
		$.set(splitBy, DEFAULTS.splitBy, true);
		$.set(auto, DEFAULTS.auto, true);
		$.set(loop, DEFAULTS.loop, true);
		$.update(replay);
	}

	const usage = $.derived(() => `<RotatingText
  texts={['thinking', 'coding', 'components!']}
  rotationInterval={${$.get(rotationInterval)}}
  staggerDuration={${$.get(staggerDuration)}}
  staggerFrom="${$.get(staggerFrom)}"
  splitBy="${$.get(splitBy)}"
  auto={${$.get(auto)}}
  loop={${$.get(loop)}}
/>`);

	const props = [
		{
			name: 'texts',
			type: 'string[]',
			default: '[]',
			description: 'Array of phrases to cycle through.'
		},

		{
			name: 'rotationInterval',
			type: 'number',
			default: '2000',
			description: 'Milliseconds between automatic rotations.'
		},

		{
			name: 'staggerDuration',
			type: 'number',
			default: '0',
			description: "Delay between each character's animation."
		},

		{
			name: 'staggerFrom',
			type: '"first" | "last" | "center" | "random" | number',
			default: '"first"',
			description: 'Origin from which the stagger propagates.'
		},

		{
			name: 'loop',
			type: 'boolean',
			default: 'true',
			description: 'Whether the rotation wraps after the last item.'
		},

		{
			name: 'auto',
			type: 'boolean',
			default: 'true',
			description: 'Whether the rotation starts automatically.'
		},

		{
			name: 'splitBy',
			type: '"characters" | "words" | "lines" | string',
			default: '"characters"',
			description: 'How the text is split into animatable elements.'
		},

		{
			name: 'mainClassName',
			type: 'string',
			default: '""',
			description: 'Additional class on the outer wrapper.'
		},

		{
			name: 'splitLevelClassName',
			type: 'string',
			default: '""',
			description: 'Additional class on each split group (word).'
		},

		{
			name: 'elementLevelClassName',
			type: 'string',
			default: '""',
			description: 'Additional class on each animated element.'
		},

		{
			name: 'transitionDamping',
			type: 'number',
			default: '25',
			description: 'Spring damping used for entry and exit.'
		},

		{
			name: 'transitionStiffness',
			type: 'number',
			default: '300',
			description: 'Spring stiffness used for entry and exit.'
		},

		{
			name: 'initialY',
			type: 'string | number',
			default: '"100%"',
			description: 'Initial Y offset for entering characters.'
		},

		{
			name: 'animateY',
			type: 'string | number',
			default: '0',
			description: 'Resting Y position once entry completes.'
		},

		{
			name: 'exitY',
			type: 'string | number',
			default: '"-120%"',
			description: 'Y offset characters animate to when exiting.'
		},

		{
			name: 'onNext',
			type: '(index: number) => void',
			default: 'undefined',
			description: 'Callback fired with the new index after a rotation.'
		}
	];

	var fragment = root_3();

	$.head('pmn9bd', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Rotating Text - svelte-bits';
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
				var p = root();
				var span = $.sibling($.child(p), 2);
				var node_3 = $.child(span);

				RotatingText(node_3, {
					get texts() {
						return words;
					},

					get staggerFrom() {
						return $.get(staggerFrom);
					},

					get staggerDuration() {
						return $.get(staggerDuration);
					},

					get splitBy() {
						return $.get(splitBy);
					},
					transitionDamping: 30,
					transitionStiffness: 400,
					get rotationInterval() {
						return $.get(rotationInterval);
					},

					get auto() {
						return $.get(auto);
					},

					get loop() {
						return $.get(loop);
					},
					splitLevelClassName: 'rotating-text-split'
				});

				$.reset(span);
				$.reset(p);
				$.append($$anchor, p);
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'rotating-text',
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
					var node_4 = $.first_child(fragment_3);

					PreviewSlider(node_4, {
						title: 'Rotation Interval (ms)',
						min: 500,
						max: 5000,
						step: 100,
						get value() {
							return $.get(rotationInterval);
						},

						onChange: (v) => {
							$.set(rotationInterval, v, true);
							$.update(replay);
						}
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Stagger Duration',
						min: 0,
						max: 0.1,
						step: 0.005,
						get value() {
							return $.get(staggerDuration);
						},

						onChange: (v) => {
							$.set(staggerDuration, v, true);
							$.update(replay);
						}
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSelect(node_6, {
						title: 'Stagger From',
						get value() {
							return $.get(staggerFrom);
						},

						options: [
							{ value: 'first', label: 'First' },
							{ value: 'last', label: 'Last' },
							{ value: 'center', label: 'Center' },
							{ value: 'random', label: 'Random' }
						],

						onChange: (v) => {
							$.set(staggerFrom, v, true);
							$.update(replay);
						}
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSelect(node_7, {
						title: 'Split By',
						get value() {
							return $.get(splitBy);
						},

						options: [
							{ value: 'characters', label: 'Characters' },
							{ value: 'words', label: 'Words' },
							{ value: 'lines', label: 'Lines' }
						],

						onChange: (v) => {
							$.set(splitBy, v, true);
							$.update(replay);
						}
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSwitch(node_8, {
						title: 'Auto',
						get checked() {
							return $.get(auto);
						},

						onChange: (v) => {
							$.set(auto, v, true);
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
			componentName: 'RotatingText',
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