import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import MagicBento from '$lib/components/library/Components/MagicBento/MagicBento.svelte';
import source from '$lib/components/library/Components/MagicBento/MagicBento.svelte?raw';

var root = $.from_html(`<div class="demo-container" style="position:relative;padding:2rem 0;display:flex;align-items:center;justify-content:center;overflow:hidden;"><!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Magic Bento</h1> <!>`, 1);

export default function MagicBentoDemo($$anchor) {
	const DEFAULTS = {
		enableStars: true,
		enableSpotlight: true,
		disableAnimations: false,
		spotlightRadius: 400,
		enableTilt: false,
		clickEffect: true,
		enableMagnetism: false
	};

	let enableStars = $.state($.proxy(DEFAULTS.enableStars));
	let enableSpotlight = $.state($.proxy(DEFAULTS.enableSpotlight));
	let disableAnimations = $.state($.proxy(DEFAULTS.disableAnimations));
	let spotlightRadius = $.state($.proxy(DEFAULTS.spotlightRadius));
	let enableTilt = $.state($.proxy(DEFAULTS.enableTilt));
	let clickEffect = $.state($.proxy(DEFAULTS.clickEffect));
	let enableMagnetism = $.state($.proxy(DEFAULTS.enableMagnetism));
	let key = $.state(0);
	const hasChanges = $.derived(() => $.get(enableStars) !== DEFAULTS.enableStars || $.get(enableSpotlight) !== DEFAULTS.enableSpotlight || $.get(disableAnimations) !== DEFAULTS.disableAnimations || $.get(spotlightRadius) !== DEFAULTS.spotlightRadius || $.get(enableTilt) !== DEFAULTS.enableTilt || $.get(clickEffect) !== DEFAULTS.clickEffect || $.get(enableMagnetism) !== DEFAULTS.enableMagnetism);

	function reset() {
		$.set(enableStars, DEFAULTS.enableStars, true);
		$.set(enableSpotlight, DEFAULTS.enableSpotlight, true);
		$.set(disableAnimations, DEFAULTS.disableAnimations, true);
		$.set(spotlightRadius, DEFAULTS.spotlightRadius, true);
		$.set(enableTilt, DEFAULTS.enableTilt, true);
		$.set(clickEffect, DEFAULTS.clickEffect, true);
		$.set(enableMagnetism, DEFAULTS.enableMagnetism, true);
		$.update(key);
	}

	const usage = `<MagicBento enableStars enableSpotlight enableBorderGlow />`;

	const props = [
		{
			name: 'textAutoHide',
			type: 'boolean',
			default: 'true',
			description: 'Clamp long text in cards.'
		},

		{
			name: 'enableStars',
			type: 'boolean',
			default: 'true',
			description: 'Particle star animation on hover.'
		},

		{
			name: 'enableSpotlight',
			type: 'boolean',
			default: 'true',
			description: 'Cursor-following spotlight.'
		},

		{
			name: 'enableBorderGlow',
			type: 'boolean',
			default: 'true',
			description: 'Cursor-following border glow.'
		},

		{
			name: 'disableAnimations',
			type: 'boolean',
			default: 'false',
			description: 'Force-disable animations.'
		},

		{
			name: 'spotlightRadius',
			type: 'number',
			default: '300',
			description: 'Spotlight radius in pixels.'
		},

		{
			name: 'particleCount',
			type: 'number',
			default: '12',
			description: 'Particle count per card.'
		},

		{
			name: 'enableTilt',
			type: 'boolean',
			default: 'false',
			description: '3D tilt on hover.'
		},

		{
			name: 'glowColor',
			type: 'string',
			default: '"255, 138, 76"',
			description: 'RGB triplet for glow effects.'
		},

		{
			name: 'clickEffect',
			type: 'boolean',
			default: 'true',
			description: 'Ripple on click.'
		},

		{
			name: 'enableMagnetism',
			type: 'boolean',
			default: 'true',
			description: 'Card attracts to cursor.'
		}
	];

	var fragment = root_2();

	$.head('1imgdgn', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Magic Bento - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			$.key(node_1, () => $.get(key), ($$anchor) => {
				MagicBento($$anchor, {
					get enableStars() {
						return $.get(enableStars);
					},

					get enableSpotlight() {
						return $.get(enableSpotlight);
					},

					get disableAnimations() {
						return $.get(disableAnimations);
					},

					get spotlightRadius() {
						return $.get(spotlightRadius);
					},

					get enableTilt() {
						return $.get(enableTilt);
					},

					get clickEffect() {
						return $.get(clickEffect);
					},

					get enableMagnetism() {
						return $.get(enableMagnetism);
					}
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'magic-bento',
				usage,
				get source() {
					return source;
				}
			});
		};

		const customize = ($$anchor) => {
			Customize($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_1();
					var node_2 = $.first_child(fragment_4);

					PreviewSlider(node_2, {
						title: 'Spotlight Radius',
						min: 50,
						max: 800,
						step: 10,
						get value() {
							return $.get(spotlightRadius);
						},
						onChange: (v) => $.set(spotlightRadius, v, true)
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSwitch(node_3, {
						title: 'Stars Effect',
						get checked() {
							return $.get(enableStars);
						},
						onChange: (v) => $.set(enableStars, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSwitch(node_4, {
						title: 'Spotlight Effect',
						get checked() {
							return $.get(enableSpotlight);
						},
						onChange: (v) => $.set(enableSpotlight, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSwitch(node_5, {
						title: 'Tilt Effect',
						get checked() {
							return $.get(enableTilt);
						},
						onChange: (v) => $.set(enableTilt, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSwitch(node_6, {
						title: 'Click Effect',
						get checked() {
							return $.get(clickEffect);
						},
						onChange: (v) => $.set(clickEffect, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSwitch(node_7, {
						title: 'Magnetism',
						get checked() {
							return $.get(enableMagnetism);
						},
						onChange: (v) => $.set(enableMagnetism, v, true)
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSwitch(node_8, {
						title: 'Disable All Animations',
						get checked() {
							return $.get(disableAnimations);
						},
						onChange: (v) => $.set(disableAnimations, v, true)
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
			componentName: 'MagicBento',
			usage,
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