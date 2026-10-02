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
import FuzzyText from '$lib/components/library/TextAnimations/FuzzyText/FuzzyText.svelte';
import source from '$lib/components/library/TextAnimations/FuzzyText/FuzzyText.svelte?raw';

var root = $.from_html(`<div style="display:flex;flex-direction:column;align-items:center;"><!> <div style="height:4px;"></div> <!></div>`);
var root_1 = $.from_html(`<div class="demo-container relative w-full overflow-hidden" style="height:400px;display:flex;align-items:center;justify-content:center;"><!> <!></div>`);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<h1 class="sub-category">Fuzzy Text</h1> <!>`, 1);

export default function FuzzyTextDemo($$anchor) {
	const DEFAULTS = {
		baseIntensity: 0.2,
		hoverIntensity: 0.5,
		enableHover: true,
		fuzzRange: 30,
		fps: 60,
		direction: 'horizontal',
		transitionDuration: 0,
		clickEffect: false,
		glitchMode: false,
		glitchInterval: 2000,
		glitchDuration: 200,
		letterSpacing: 0
	};

	let baseIntensity = $.state($.proxy(DEFAULTS.baseIntensity));
	let hoverIntensity = $.state($.proxy(DEFAULTS.hoverIntensity));
	let enableHover = $.state($.proxy(DEFAULTS.enableHover));
	let fuzzRange = $.state($.proxy(DEFAULTS.fuzzRange));
	let fps = $.state($.proxy(DEFAULTS.fps));
	let direction = $.state($.proxy(DEFAULTS.direction));
	let transitionDuration = $.state($.proxy(DEFAULTS.transitionDuration));
	let clickEffect = $.state($.proxy(DEFAULTS.clickEffect));
	let glitchMode = $.state($.proxy(DEFAULTS.glitchMode));
	let glitchInterval = $.state($.proxy(DEFAULTS.glitchInterval));
	let glitchDuration = $.state($.proxy(DEFAULTS.glitchDuration));
	let letterSpacing = $.state($.proxy(DEFAULTS.letterSpacing));
	let replay = $.state(0);
	const hasChanges = $.derived(() => $.get(baseIntensity) !== DEFAULTS.baseIntensity || $.get(hoverIntensity) !== DEFAULTS.hoverIntensity || $.get(enableHover) !== DEFAULTS.enableHover || $.get(fuzzRange) !== DEFAULTS.fuzzRange || $.get(fps) !== DEFAULTS.fps || $.get(direction) !== DEFAULTS.direction || $.get(transitionDuration) !== DEFAULTS.transitionDuration || $.get(clickEffect) !== DEFAULTS.clickEffect || $.get(glitchMode) !== DEFAULTS.glitchMode || $.get(glitchInterval) !== DEFAULTS.glitchInterval || $.get(glitchDuration) !== DEFAULTS.glitchDuration || $.get(letterSpacing) !== DEFAULTS.letterSpacing);

	function reset() {
		$.set(baseIntensity, DEFAULTS.baseIntensity, true);
		$.set(hoverIntensity, DEFAULTS.hoverIntensity, true);
		$.set(enableHover, DEFAULTS.enableHover, true);
		$.set(fuzzRange, DEFAULTS.fuzzRange, true);
		$.set(fps, DEFAULTS.fps, true);
		$.set(direction, DEFAULTS.direction, true);
		$.set(transitionDuration, DEFAULTS.transitionDuration, true);
		$.set(clickEffect, DEFAULTS.clickEffect, true);
		$.set(glitchMode, DEFAULTS.glitchMode, true);
		$.set(glitchInterval, DEFAULTS.glitchInterval, true);
		$.set(glitchDuration, DEFAULTS.glitchDuration, true);
		$.set(letterSpacing, DEFAULTS.letterSpacing, true);
		$.update(replay);
	}

	const usage = $.derived(() => `<FuzzyText
  text="404"
  baseIntensity={${$.get(baseIntensity)}}
  hoverIntensity={${$.get(hoverIntensity)}}
  enableHover={${$.get(enableHover)}}
  fuzzRange={${$.get(fuzzRange)}}
  fps={${$.get(fps)}}
  direction="${$.get(direction)}"
  transitionDuration={${$.get(transitionDuration)}}
  clickEffect={${$.get(clickEffect)}}
  glitchMode={${$.get(glitchMode)}}
  glitchInterval={${$.get(glitchInterval)}}
  glitchDuration={${$.get(glitchDuration)}}
  letterSpacing={${$.get(letterSpacing)}}
  fontSize={140}
/>`);

	const props = [
		{
			name: 'text',
			type: 'string',
			default: '""',
			description: 'The text content rendered by the fuzzy effect.'
		},

		{
			name: 'fontSize',
			type: 'number | string',
			default: '"clamp(2rem, 10vw, 10rem)"',
			description: 'Font size — accepts any CSS font-size or a pixel number.'
		},

		{
			name: 'fontWeight',
			type: 'string | number',
			default: '900',
			description: 'Font weight of the text.'
		},

		{
			name: 'fontFamily',
			type: 'string',
			default: '"inherit"',
			description: 'Font family. "inherit" resolves to the canvas computed style.'
		},

		{
			name: 'color',
			type: 'string',
			default: '"#fff"',
			description: 'Text color.'
		},

		{
			name: 'enableHover',
			type: 'boolean',
			default: 'true',
			description: 'Enables the hover effect.'
		},

		{
			name: 'baseIntensity',
			type: 'number',
			default: '0.18',
			description: 'Fuzz intensity at rest.'
		},

		{
			name: 'hoverIntensity',
			type: 'number',
			default: '0.5',
			description: 'Fuzz intensity while hovered.'
		},

		{
			name: 'fuzzRange',
			type: 'number',
			default: '30',
			description: 'Maximum pixel displacement of the fuzz effect.'
		},

		{
			name: 'fps',
			type: 'number',
			default: '60',
			description: 'Frame-rate cap of the animation loop.'
		},

		{
			name: 'direction',
			type: '"horizontal" | "vertical" | "both"',
			default: '"horizontal"',
			description: 'Axis along which the fuzz displaces.'
		},

		{
			name: 'transitionDuration',
			type: 'number',
			default: '0',
			description: 'Frames over which to ease intensity changes.'
		},

		{
			name: 'clickEffect',
			type: 'boolean',
			default: 'false',
			description: 'Triggers a maximum-intensity burst on click.'
		},

		{
			name: 'glitchMode',
			type: 'boolean',
			default: 'false',
			description: 'Periodically spikes intensity to simulate a glitch.'
		},

		{
			name: 'glitchInterval',
			type: 'number',
			default: '2000',
			description: 'Milliseconds between glitch bursts.'
		},

		{
			name: 'glitchDuration',
			type: 'number',
			default: '200',
			description: 'Milliseconds duration of each glitch burst.'
		},

		{
			name: 'gradient',
			type: 'string[] | null',
			default: 'null',
			description: 'Optional array of colors to render as a horizontal gradient fill.'
		},

		{
			name: 'letterSpacing',
			type: 'number',
			default: '0',
			description: 'Extra pixels between characters.'
		},

		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'Optional class for the canvas element.'
		}
	];

	var fragment = root_3();

	$.head('1953hqh', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Fuzzy Text - svelte-bits';
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
				var div_1 = root();
				var node_3 = $.child(div_1);

				FuzzyText(node_3, {
					text: '404',
					get baseIntensity() {
						return $.get(baseIntensity);
					},

					get hoverIntensity() {
						return $.get(hoverIntensity);
					},

					get enableHover() {
						return $.get(enableHover);
					},

					get fuzzRange() {
						return $.get(fuzzRange);
					},

					get fps() {
						return $.get(fps);
					},

					get direction() {
						return $.get(direction);
					},

					get transitionDuration() {
						return $.get(transitionDuration);
					},

					get clickEffect() {
						return $.get(clickEffect);
					},

					get glitchMode() {
						return $.get(glitchMode);
					},

					get glitchInterval() {
						return $.get(glitchInterval);
					},

					get glitchDuration() {
						return $.get(glitchDuration);
					},

					get letterSpacing() {
						return $.get(letterSpacing);
					},
					fontSize: 140
				});

				var node_4 = $.sibling(node_3, 4);

				FuzzyText(node_4, {
					text: 'not found',
					get baseIntensity() {
						return $.get(baseIntensity);
					},

					get hoverIntensity() {
						return $.get(hoverIntensity);
					},

					get enableHover() {
						return $.get(enableHover);
					},

					get fuzzRange() {
						return $.get(fuzzRange);
					},

					get fps() {
						return $.get(fps);
					},

					get direction() {
						return $.get(direction);
					},

					get transitionDuration() {
						return $.get(transitionDuration);
					},

					get clickEffect() {
						return $.get(clickEffect);
					},

					get glitchMode() {
						return $.get(glitchMode);
					},

					get glitchInterval() {
						return $.get(glitchInterval);
					},

					get glitchDuration() {
						return $.get(glitchDuration);
					},

					get letterSpacing() {
						return $.get(letterSpacing);
					},
					fontSize: 70,
					fontFamily: 'Gochi Hand'
				});

				$.reset(div_1);
				$.append($$anchor, div_1);
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'fuzzy-text',
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
					var node_5 = $.first_child(fragment_3);

					PreviewSlider(node_5, {
						title: 'Base Intensity',
						min: 0,
						max: 1,
						step: 0.01,
						get value() {
							return $.get(baseIntensity);
						},

						onChange: (v) => {
							$.set(baseIntensity, v, true);
							$.update(replay);
						}
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Hover Intensity',
						min: 0,
						max: 2,
						step: 0.01,
						get value() {
							return $.get(hoverIntensity);
						},

						onChange: (v) => {
							$.set(hoverIntensity, v, true);
							$.update(replay);
						}
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Fuzz Range',
						min: 5,
						max: 100,
						step: 1,
						get value() {
							return $.get(fuzzRange);
						},

						onChange: (v) => {
							$.set(fuzzRange, v, true);
							$.update(replay);
						}
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSlider(node_8, {
						title: 'FPS',
						min: 10,
						max: 120,
						step: 5,
						get value() {
							return $.get(fps);
						},

						onChange: (v) => {
							$.set(fps, v, true);
							$.update(replay);
						}
					});

					var node_9 = $.sibling(node_8, 2);

					PreviewSlider(node_9, {
						title: 'Transition Duration',
						min: 0,
						max: 60,
						step: 1,
						get value() {
							return $.get(transitionDuration);
						},

						onChange: (v) => {
							$.set(transitionDuration, v, true);
							$.update(replay);
						}
					});

					var node_10 = $.sibling(node_9, 2);

					PreviewSlider(node_10, {
						title: 'Letter Spacing',
						min: -10,
						max: 50,
						step: 1,
						get value() {
							return $.get(letterSpacing);
						},

						onChange: (v) => {
							$.set(letterSpacing, v, true);
							$.update(replay);
						}
					});

					var node_11 = $.sibling(node_10, 2);

					PreviewSelect(node_11, {
						title: 'Direction',
						options: [
							{ value: 'horizontal', label: 'Horizontal' },
							{ value: 'vertical', label: 'Vertical' },
							{ value: 'both', label: 'Both' }
						],

						get value() {
							return $.get(direction);
						},

						onChange: (v) => {
							$.set(direction, v, true);
							$.update(replay);
						}
					});

					var node_12 = $.sibling(node_11, 2);

					PreviewSwitch(node_12, {
						title: 'Enable Hover',
						get checked() {
							return $.get(enableHover);
						},

						onChange: (v) => {
							$.set(enableHover, v, true);
							$.update(replay);
						}
					});

					var node_13 = $.sibling(node_12, 2);

					PreviewSwitch(node_13, {
						title: 'Click Effect',
						get checked() {
							return $.get(clickEffect);
						},

						onChange: (v) => {
							$.set(clickEffect, v, true);
							$.update(replay);
						}
					});

					var node_14 = $.sibling(node_13, 2);

					PreviewSwitch(node_14, {
						title: 'Glitch Mode',
						get checked() {
							return $.get(glitchMode);
						},

						onChange: (v) => {
							$.set(glitchMode, v, true);
							$.update(replay);
						}
					});

					var node_15 = $.sibling(node_14, 2);

					{
						let $0 = $.derived(() => !$.get(glitchMode));

						PreviewSlider(node_15, {
							title: 'Glitch Interval',
							min: 500,
							max: 5000,
							step: 100,
							get value() {
								return $.get(glitchInterval);
							},

							get isDisabled() {
								return $.get($0);
							},

							onChange: (v) => {
								$.set(glitchInterval, v, true);
								$.update(replay);
							}
						});
					}

					var node_16 = $.sibling(node_15, 2);

					{
						let $0 = $.derived(() => !$.get(glitchMode));

						PreviewSlider(node_16, {
							title: 'Glitch Duration',
							min: 50,
							max: 1000,
							step: 50,
							get value() {
								return $.get(glitchDuration);
							},

							get isDisabled() {
								return $.get($0);
							},

							onChange: (v) => {
								$.set(glitchDuration, v, true);
								$.update(replay);
							}
						});
					}

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
			componentName: 'FuzzyText',
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