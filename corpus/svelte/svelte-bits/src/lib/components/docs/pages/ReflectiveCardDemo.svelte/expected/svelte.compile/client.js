import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import ReflectiveCard from '$lib/components/library/Components/ReflectiveCard/ReflectiveCard.svelte';
import source from '$lib/components/library/Components/ReflectiveCard/ReflectiveCard.svelte?raw';

var root = $.from_html(`<div class="demo-container" style="position:relative;height:700px;overflow:hidden;display:flex;align-items:center;justify-content:center;"><!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Reflective Card</h1> <!>`, 1);

export default function ReflectiveCardDemo($$anchor) {
	const DEFAULTS = {
		blurStrength: 12,
		metalness: 1,
		roughness: 0.75,
		displacementStrength: 20,
		noiseScale: 1,
		specularConstant: 5,
		grayscale: 0.15,
		glassDistortion: 30
	};

	let blurStrength = $.state($.proxy(DEFAULTS.blurStrength));
	let metalness = $.state($.proxy(DEFAULTS.metalness));
	let roughness = $.state($.proxy(DEFAULTS.roughness));
	let displacementStrength = $.state($.proxy(DEFAULTS.displacementStrength));
	let noiseScale = $.state($.proxy(DEFAULTS.noiseScale));
	let specularConstant = $.state($.proxy(DEFAULTS.specularConstant));
	let grayscale = $.state($.proxy(DEFAULTS.grayscale));
	let glassDistortion = $.state($.proxy(DEFAULTS.glassDistortion));
	const hasChanges = $.derived(() => $.get(blurStrength) !== DEFAULTS.blurStrength || $.get(metalness) !== DEFAULTS.metalness || $.get(roughness) !== DEFAULTS.roughness || $.get(displacementStrength) !== DEFAULTS.displacementStrength || $.get(noiseScale) !== DEFAULTS.noiseScale || $.get(specularConstant) !== DEFAULTS.specularConstant || $.get(grayscale) !== DEFAULTS.grayscale || $.get(glassDistortion) !== DEFAULTS.glassDistortion);

	function reset() {
		$.set(blurStrength, DEFAULTS.blurStrength, true);
		$.set(metalness, DEFAULTS.metalness, true);
		$.set(roughness, DEFAULTS.roughness, true);
		$.set(displacementStrength, DEFAULTS.displacementStrength, true);
		$.set(noiseScale, DEFAULTS.noiseScale, true);
		$.set(specularConstant, DEFAULTS.specularConstant, true);
		$.set(grayscale, DEFAULTS.grayscale, true);
		$.set(glassDistortion, DEFAULTS.glassDistortion, true);
	}

	const usage = `<ReflectiveCard blurStrength={12} metalness={1} roughness={0.75} displacementStrength={20} noiseScale={1} specularConstant={5} grayscale={0.15} glassDistortion={30} />`;

	const props = [
		{
			name: 'blurStrength',
			type: 'number',
			default: '12',
			description: 'Intensity of the blur effect (0–20px).'
		},

		{
			name: 'metalness',
			type: 'number',
			default: '1',
			description: 'Opacity of the metallic sheen (0–1).'
		},

		{
			name: 'roughness',
			type: 'number',
			default: '0.4',
			description: 'Opacity of the noise texture (0–1).'
		},

		{
			name: 'displacementStrength',
			type: 'number',
			default: '20',
			description: 'Strength of the displacement.'
		},

		{
			name: 'noiseScale',
			type: 'number',
			default: '1',
			description: 'Scale of the noise texture.'
		},

		{
			name: 'specularConstant',
			type: 'number',
			default: '1.2',
			description: 'Specular shininess.'
		},

		{
			name: 'grayscale',
			type: 'number',
			default: '1',
			description: 'Grayscale intensity (0–1).'
		},

		{
			name: 'glassDistortion',
			type: 'number',
			default: '0',
			description: 'Strength of the glass edge distortion.'
		},

		{
			name: 'color',
			type: 'string',
			default: "'white'",
			description: 'Base text color.'
		},

		{
			name: 'overlayColor',
			type: 'string',
			default: "'rgba(255,255,255,0.1)'",
			description: 'Overlay tint color.'
		}
	];

	var fragment = root_2();

	$.head('148tmw5', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Reflective Card - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			ReflectiveCard(node_1, {
				get blurStrength() {
					return $.get(blurStrength);
				},

				get metalness() {
					return $.get(metalness);
				},

				get roughness() {
					return $.get(roughness);
				},

				get displacementStrength() {
					return $.get(displacementStrength);
				},

				get noiseScale() {
					return $.get(noiseScale);
				},

				get specularConstant() {
					return $.get(specularConstant);
				},

				get grayscale() {
					return $.get(grayscale);
				},

				get glassDistortion() {
					return $.get(glassDistortion);
				}
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'reflective-card',
				usage,
				get source() {
					return source;
				}
			});
		};

		const customize = ($$anchor) => {
			Customize($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_1();
					var node_2 = $.first_child(fragment_3);

					PreviewSlider(node_2, {
						title: 'Blur Strength',
						min: 0,
						max: 20,
						step: 0.5,
						get value() {
							return $.get(blurStrength);
						},
						onChange: (v) => $.set(blurStrength, v, true)
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSlider(node_3, {
						title: 'Metalness',
						min: 0,
						max: 1,
						step: 0.05,
						get value() {
							return $.get(metalness);
						},
						onChange: (v) => $.set(metalness, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Roughness',
						min: 0,
						max: 1,
						step: 0.05,
						get value() {
							return $.get(roughness);
						},
						onChange: (v) => $.set(roughness, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Warp Strength',
						min: 0,
						max: 50,
						step: 1,
						get value() {
							return $.get(displacementStrength);
						},
						onChange: (v) => $.set(displacementStrength, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Warp Scale',
						min: 0.1,
						max: 5,
						step: 0.1,
						get value() {
							return $.get(noiseScale);
						},
						onChange: (v) => $.set(noiseScale, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Glass Distortion',
						min: 0,
						max: 50,
						step: 1,
						get value() {
							return $.get(glassDistortion);
						},
						onChange: (v) => $.set(glassDistortion, v, true)
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSlider(node_8, {
						title: 'Shininess',
						min: 0,
						max: 5,
						step: 0.1,
						get value() {
							return $.get(specularConstant);
						},
						onChange: (v) => $.set(specularConstant, v, true)
					});

					var node_9 = $.sibling(node_8, 2);

					PreviewSlider(node_9, {
						title: 'Grayscale',
						min: 0,
						max: 1,
						step: 0.05,
						get value() {
							return $.get(grayscale);
						},
						onChange: (v) => $.set(grayscale, v, true)
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
			componentName: 'ReflectiveCard',
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