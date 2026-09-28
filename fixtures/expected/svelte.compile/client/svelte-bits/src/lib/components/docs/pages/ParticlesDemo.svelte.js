import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import Particles from '$lib/components/library/Backgrounds/Particles/Particles.svelte';
import source from '$lib/components/library/Backgrounds/Particles/Particles.svelte?raw';

var root = $.from_html(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Particles</h1> <!>`, 1);

export default function ParticlesDemo($$anchor) {
	const D = {
		particleCount: 200,
		particleSpread: 10,
		speed: 0.1,
		moveParticlesOnHover: false,
		particleHoverFactor: 1,
		alphaParticles: false,
		particleBaseSize: 100,
		sizeRandomness: 1,
		cameraDistance: 20,
		disableRotation: false
	};

	let particleCount = $.state($.proxy(D.particleCount));
	let particleSpread = $.state($.proxy(D.particleSpread));
	let speed = $.state($.proxy(D.speed));
	let moveParticlesOnHover = $.state($.proxy(D.moveParticlesOnHover));
	let particleHoverFactor = $.state($.proxy(D.particleHoverFactor));
	let alphaParticles = $.state($.proxy(D.alphaParticles));
	let particleBaseSize = $.state($.proxy(D.particleBaseSize));
	let sizeRandomness = $.state($.proxy(D.sizeRandomness));
	let cameraDistance = $.state($.proxy(D.cameraDistance));
	let disableRotation = $.state($.proxy(D.disableRotation));
	let showContent = $.state(true);
	let key = $.state(0);
	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';
	const hasChanges = $.derived(() => $.get(particleCount) !== D.particleCount || $.get(particleSpread) !== D.particleSpread || $.get(speed) !== D.speed || $.get(moveParticlesOnHover) !== D.moveParticlesOnHover || $.get(particleHoverFactor) !== D.particleHoverFactor || $.get(alphaParticles) !== D.alphaParticles || $.get(particleBaseSize) !== D.particleBaseSize || $.get(sizeRandomness) !== D.sizeRandomness || $.get(cameraDistance) !== D.cameraDistance || $.get(disableRotation) !== D.disableRotation);

	function reset() {
		$.set(particleCount, D.particleCount, true);
		$.set(particleSpread, D.particleSpread, true);
		$.set(speed, D.speed, true);
		$.set(moveParticlesOnHover, D.moveParticlesOnHover, true);
		$.set(particleHoverFactor, D.particleHoverFactor, true);
		$.set(alphaParticles, D.alphaParticles, true);
		$.set(particleBaseSize, D.particleBaseSize, true);
		$.set(sizeRandomness, D.sizeRandomness, true);
		$.set(cameraDistance, D.cameraDistance, true);
		$.set(disableRotation, D.disableRotation, true);
		$.update(key);
	}

	const usage = $.derived(() => `${sO}
  import Particles from '$lib/components/Particles.svelte';
${sC}

<div style="width: 100%; height: 600px; position: relative;">
  <Particles particleCount={${$.get(particleCount)}} speed={${$.get(speed)}} />
</div>`);

	const props = [
		{
			name: 'particleCount',
			type: 'number',
			default: '200',
			description: 'Number of particles.'
		},

		{
			name: 'particleSpread',
			type: 'number',
			default: '10',
			description: 'Distribution spread.'
		},

		{
			name: 'speed',
			type: 'number',
			default: '0.1',
			description: 'Animation speed.'
		},

		{
			name: 'particleColors',
			type: 'string[]',
			default: 'undefined',
			description: 'Hex palette.'
		},

		{
			name: 'moveParticlesOnHover',
			type: 'boolean',
			default: 'false',
			description: 'React to hover.'
		},

		{
			name: 'particleHoverFactor',
			type: 'number',
			default: '1',
			description: 'Hover offset factor.'
		},

		{
			name: 'alphaParticles',
			type: 'boolean',
			default: 'false',
			description: 'Soft alpha edges.'
		},

		{
			name: 'particleBaseSize',
			type: 'number',
			default: '100',
			description: 'Base size in px.'
		},

		{
			name: 'sizeRandomness',
			type: 'number',
			default: '1',
			description: 'Size variance.'
		},

		{
			name: 'cameraDistance',
			type: 'number',
			default: '20',
			description: 'Camera distance.'
		},

		{
			name: 'disableRotation',
			type: 'boolean',
			default: 'false',
			description: 'Disable rotation.'
		}
	];

	var fragment = root_2();

	$.head('bfegkx', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Particles - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			$.key(node_1, () => $.get(key) + $.get(particleCount) + $.get(particleSpread) + $.get(particleBaseSize) + $.get(sizeRandomness) + $.get(cameraDistance), ($$anchor) => {
				Particles($$anchor, {
					get particleCount() {
						return $.get(particleCount);
					},

					get particleSpread() {
						return $.get(particleSpread);
					},

					get speed() {
						return $.get(speed);
					},

					get moveParticlesOnHover() {
						return $.get(moveParticlesOnHover);
					},

					get particleHoverFactor() {
						return $.get(particleHoverFactor);
					},

					get alphaParticles() {
						return $.get(alphaParticles);
					},

					get particleBaseSize() {
						return $.get(particleBaseSize);
					},

					get sizeRandomness() {
						return $.get(sizeRandomness);
					},

					get cameraDistance() {
						return $.get(cameraDistance);
					},

					get disableRotation() {
						return $.get(disableRotation);
					}
				});
			});

			var node_2 = $.sibling(node_1, 2);

			BackgroundContentToggle(node_2, {
				get showContent() {
					return $.get(showContent);
				},
				onToggle: (v) => $.set(showContent, v, true)
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'particles',
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

					PreviewSlider(node_3, {
						title: 'Particle Count',
						min: 10,
						max: 1000,
						step: 10,
						get value() {
							return $.get(particleCount);
						},
						onChange: (v) => $.set(particleCount, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Spread',
						min: 1,
						max: 50,
						step: 1,
						get value() {
							return $.get(particleSpread);
						},
						onChange: (v) => $.set(particleSpread, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Speed',
						min: 0,
						max: 2,
						step: 0.05,
						get value() {
							return $.get(speed);
						},
						onChange: (v) => $.set(speed, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Base Size',
						min: 10,
						max: 400,
						step: 5,
						get value() {
							return $.get(particleBaseSize);
						},
						onChange: (v) => $.set(particleBaseSize, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Size Randomness',
						min: 0,
						max: 3,
						step: 0.05,
						get value() {
							return $.get(sizeRandomness);
						},
						onChange: (v) => $.set(sizeRandomness, v, true)
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSlider(node_8, {
						title: 'Camera Distance',
						min: 5,
						max: 60,
						step: 1,
						get value() {
							return $.get(cameraDistance);
						},
						onChange: (v) => $.set(cameraDistance, v, true)
					});

					var node_9 = $.sibling(node_8, 2);

					PreviewSwitch(node_9, {
						title: 'Alpha Particles',
						get checked() {
							return $.get(alphaParticles);
						},
						onChange: (v) => $.set(alphaParticles, v, true)
					});

					var node_10 = $.sibling(node_9, 2);

					PreviewSwitch(node_10, {
						title: 'Move on Hover',
						get checked() {
							return $.get(moveParticlesOnHover);
						},
						onChange: (v) => $.set(moveParticlesOnHover, v, true)
					});

					var node_11 = $.sibling(node_10, 2);

					PreviewSlider(node_11, {
						title: 'Hover Factor',
						min: 0,
						max: 5,
						step: 0.05,
						get value() {
							return $.get(particleHoverFactor);
						},
						onChange: (v) => $.set(particleHoverFactor, v, true)
					});

					var node_12 = $.sibling(node_11, 2);

					PreviewSwitch(node_12, {
						title: 'Disable Rotation',
						get checked() {
							return $.get(disableRotation);
						},
						onChange: (v) => $.set(disableRotation, v, true)
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
			componentName: 'Particles',
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