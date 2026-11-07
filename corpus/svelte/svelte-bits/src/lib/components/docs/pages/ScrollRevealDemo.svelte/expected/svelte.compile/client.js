import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import ReplayButton from '$lib/components/docs/preview/ReplayButton.svelte';
import ScrollReveal from '$lib/components/library/TextAnimations/ScrollReveal/ScrollReveal.svelte';
import source from '$lib/components/library/TextAnimations/ScrollReveal/ScrollReveal.svelte?raw';

var root = $.from_html(`<div class="demo-container relative w-full" style="height:400px;max-height:400px;overflow-y:scroll;overflow-x:hidden;"><!> <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);color:#2F293A;font-size:clamp(4rem, 6vw, 4rem);font-weight:900;text-align:center;pointer-events:none;">Scroll Down</div> <div style="position:relative;padding-top:1600px;padding-bottom:600px;padding-left:3rem;padding-right:3rem;"><!></div></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Scroll Reveal</h1> <!>`, 1);

export default function ScrollRevealDemo($$anchor) {
	const DEFAULTS = {
		enableBlur: true,
		baseOpacity: 0.1,
		baseRotation: 3,
		blurStrength: 4
	};

	let enableBlur = $.state($.proxy(DEFAULTS.enableBlur));
	let baseOpacity = $.state($.proxy(DEFAULTS.baseOpacity));
	let baseRotation = $.state($.proxy(DEFAULTS.baseRotation));
	let blurStrength = $.state($.proxy(DEFAULTS.blurStrength));
	let replay = $.state(0);
	let scrollEl = $.state(void 0);
	const hasChanges = $.derived(() => $.get(enableBlur) !== DEFAULTS.enableBlur || $.get(baseOpacity) !== DEFAULTS.baseOpacity || $.get(baseRotation) !== DEFAULTS.baseRotation || $.get(blurStrength) !== DEFAULTS.blurStrength);

	function reset() {
		$.set(enableBlur, DEFAULTS.enableBlur, true);
		$.set(baseOpacity, DEFAULTS.baseOpacity, true);
		$.set(baseRotation, DEFAULTS.baseRotation, true);
		$.set(blurStrength, DEFAULTS.blurStrength, true);
		$.get(scrollEl)?.scrollTo({ top: 0, behavior: 'smooth' });
		$.update(replay);
	}

	function rerender() {
		$.get(scrollEl)?.scrollTo({ top: 0, behavior: 'smooth' });
		$.update(replay);
	}

	const usage = $.derived(() => `<ScrollReveal
  text="When does a man die? When he is hit by a bullet? No! When he suffers a disease? No! When he ate a soup made out of a poisonous mushroom? No! A man dies when he is forgotten!"
  enableBlur={${$.get(enableBlur)}}
  baseOpacity={${$.get(baseOpacity)}}
  baseRotation={${$.get(baseRotation)}}
  blurStrength={${$.get(blurStrength)}}
/>`);

	const props = [
		{
			name: 'text',
			type: 'string',
			default: '""',
			description: 'The text to be split into words and animated.'
		},

		{
			name: 'scrollContainer',
			type: 'HTMLElement | null',
			default: 'null',
			description: 'Optional element used as the scroll container; defaults to window.'
		},

		{
			name: 'enableBlur',
			type: 'boolean',
			default: 'true',
			description: 'Enables the blur animation on the words.'
		},

		{
			name: 'baseOpacity',
			type: 'number',
			default: '0.1',
			description: 'Initial opacity of the words before the animation.'
		},

		{
			name: 'baseRotation',
			type: 'number',
			default: '3',
			description: 'Starting rotation in degrees, easing back to 0.'
		},

		{
			name: 'blurStrength',
			type: 'number',
			default: '4',
			description: 'Strength of the blur in pixels at the start of the animation.'
		},

		{
			name: 'containerClassName',
			type: 'string',
			default: '""',
			description: 'Additional class on the container element.'
		},

		{
			name: 'textClassName',
			type: 'string',
			default: '""',
			description: 'Additional class on the text element.'
		},

		{
			name: 'rotationEnd',
			type: 'string',
			default: '"bottom bottom"',
			description: 'ScrollTrigger end value for the rotation tween.'
		},

		{
			name: 'wordAnimationEnd',
			type: 'string',
			default: '"bottom bottom"',
			description: 'ScrollTrigger end value for the word fade/blur tweens.'
		}
	];

	var fragment = root_2();

	$.head('bcq5um', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Scroll Reveal - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			ReplayButton(node_1, { onClick: rerender });

			var div_1 = $.sibling(node_1, 4);
			var node_2 = $.child(div_1);

			$.key(node_2, () => $.get(replay), ($$anchor) => {
				ScrollReveal($$anchor, {
					text: 'When does a man die? When he is hit by a bullet? No! When he suffers a disease? No! When he ate a soup made out of a poisonous mushroom? No! A man dies when he is forgotten!',
					get scrollContainer() {
						return $.get(scrollEl);
					},

					get enableBlur() {
						return $.get(enableBlur);
					},

					get baseOpacity() {
						return $.get(baseOpacity);
					},

					get baseRotation() {
						return $.get(baseRotation);
					},

					get blurStrength() {
						return $.get(blurStrength);
					}
				});
			});

			$.reset(div_1);
			$.reset(div);
			$.bind_this(div, ($$value) => $.set(scrollEl, $$value), () => $.get(scrollEl));
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'scroll-reveal',
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

					PreviewSwitch(node_3, {
						title: 'Enable Blur',
						get checked() {
							return $.get(enableBlur);
						},

						onChange: (v) => {
							$.set(enableBlur, v, true);
							rerender();
						}
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Blur Strength',
						min: 0,
						max: 15,
						step: 1,
						get value() {
							return $.get(blurStrength);
						},

						onChange: (v) => {
							$.set(blurStrength, v, true);
							rerender();
						}
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Starting Opacity',
						min: 0,
						max: 1,
						step: 0.1,
						get value() {
							return $.get(baseOpacity);
						},

						onChange: (v) => {
							$.set(baseOpacity, v, true);
							rerender();
						}
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Starting Rotation',
						min: 0,
						max: 10,
						step: 1,
						get value() {
							return $.get(baseRotation);
						},
						valueUnit: '°',
						onChange: (v) => {
							$.set(baseRotation, v, true);
							rerender();
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
			componentName: 'ScrollReveal',
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