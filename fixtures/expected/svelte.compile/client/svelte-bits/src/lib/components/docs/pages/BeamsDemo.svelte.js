import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import Beams from '$lib/components/library/Backgrounds/Beams/Beams.svelte';
import source from '$lib/components/library/Backgrounds/Beams/Beams.svelte?raw';

var root = $.from_html(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Beams</h1> <!>`, 1);

export default function BeamsDemo($$anchor) {
	const D = {
		beamWidth: 2,
		beamHeight: 15,
		beamNumber: 12,
		lightColor: '#ffffff',
		speed: 2,
		noiseIntensity: 1.75,
		scale: 0.2,
		rotation: 30
	};

	let beamWidth = $.state($.proxy(D.beamWidth));
	let beamHeight = $.state($.proxy(D.beamHeight));
	let beamNumber = $.state($.proxy(D.beamNumber));
	let lightColor = $.state($.proxy(D.lightColor));
	let speed = $.state($.proxy(D.speed));
	let noiseIntensity = $.state($.proxy(D.noiseIntensity));
	let scale = $.state($.proxy(D.scale));
	let rotation = $.state($.proxy(D.rotation));
	let showContent = $.state(true);
	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';
	const hasChanges = $.derived(() => $.get(beamWidth) !== D.beamWidth || $.get(beamHeight) !== D.beamHeight || $.get(beamNumber) !== D.beamNumber || $.get(lightColor) !== D.lightColor || $.get(speed) !== D.speed || $.get(noiseIntensity) !== D.noiseIntensity || $.get(scale) !== D.scale || $.get(rotation) !== D.rotation);

	function reset() {
		$.set(beamWidth, D.beamWidth, true);
		$.set(beamHeight, D.beamHeight, true);
		$.set(beamNumber, D.beamNumber, true);
		$.set(lightColor, D.lightColor, true);
		$.set(speed, D.speed, true);
		$.set(noiseIntensity, D.noiseIntensity, true);
		$.set(scale, D.scale, true);
		$.set(rotation, D.rotation, true);
	}

	const usage = $.derived(() => `${sO}
  import Beams from '$lib/components/Beams.svelte';
${sC}

<div style="width: 100%; height: 600px; position: relative;">
  <Beams beamNumber={${$.get(beamNumber)}} speed={${$.get(speed)}} lightColor="${$.get(lightColor)}" />
</div>`);

	const props = [
		{
			name: 'beamWidth',
			type: 'number',
			default: '2',
			description: 'Width of each beam.'
		},

		{
			name: 'beamHeight',
			type: 'number',
			default: '15',
			description: 'Height of each beam.'
		},

		{
			name: 'beamNumber',
			type: 'number',
			default: '12',
			description: 'Number of beams.'
		},

		{
			name: 'lightColor',
			type: 'string',
			default: '"#ffffff"',
			description: 'Directional light color.'
		},

		{
			name: 'speed',
			type: 'number',
			default: '2',
			description: 'Animation speed.'
		},

		{
			name: 'noiseIntensity',
			type: 'number',
			default: '1.75',
			description: 'Noise overlay intensity.'
		},

		{
			name: 'scale',
			type: 'number',
			default: '0.2',
			description: 'Noise scale.'
		},

		{
			name: 'rotation',
			type: 'number',
			default: '0',
			description: 'Group rotation in degrees.'
		}
	];

	var fragment = root_2();

	$.head('8bcxco', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Beams - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			Beams(node_1, {
				get beamWidth() {
					return $.get(beamWidth);
				},

				get beamHeight() {
					return $.get(beamHeight);
				},

				get beamNumber() {
					return $.get(beamNumber);
				},

				get lightColor() {
					return $.get(lightColor);
				},

				get speed() {
					return $.get(speed);
				},

				get noiseIntensity() {
					return $.get(noiseIntensity);
				},

				get scale() {
					return $.get(scale);
				},

				get rotation() {
					return $.get(rotation);
				}
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
				slug: 'beams',
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
					var fragment_3 = root_1();
					var node_3 = $.first_child(fragment_3);

					PreviewColorPicker(node_3, {
						title: 'Light Color',
						get value() {
							return $.get(lightColor);
						},
						onChange: (v) => $.set(lightColor, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Beam Number',
						min: 1,
						max: 30,
						step: 1,
						get value() {
							return $.get(beamNumber);
						},
						onChange: (v) => $.set(beamNumber, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Beam Width',
						min: 0.5,
						max: 10,
						step: 0.1,
						get value() {
							return $.get(beamWidth);
						},
						onChange: (v) => $.set(beamWidth, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Beam Height',
						min: 1,
						max: 30,
						step: 1,
						get value() {
							return $.get(beamHeight);
						},
						onChange: (v) => $.set(beamHeight, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Speed',
						min: 0,
						max: 10,
						step: 0.1,
						get value() {
							return $.get(speed);
						},
						onChange: (v) => $.set(speed, v, true)
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSlider(node_8, {
						title: 'Noise Intensity',
						min: 0,
						max: 5,
						step: 0.05,
						get value() {
							return $.get(noiseIntensity);
						},
						onChange: (v) => $.set(noiseIntensity, v, true)
					});

					var node_9 = $.sibling(node_8, 2);

					PreviewSlider(node_9, {
						title: 'Scale',
						min: 0.05,
						max: 2,
						step: 0.05,
						get value() {
							return $.get(scale);
						},
						onChange: (v) => $.set(scale, v, true)
					});

					var node_10 = $.sibling(node_9, 2);

					PreviewSlider(node_10, {
						title: 'Rotation',
						min: -180,
						max: 180,
						step: 1,
						get value() {
							return $.get(rotation);
						},
						onChange: (v) => $.set(rotation, v, true)
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
			componentName: 'Beams',
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