import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import FloatingLines from '$lib/components/library/Backgrounds/FloatingLines/FloatingLines.svelte';
import source from '$lib/components/library/Backgrounds/FloatingLines/FloatingLines.svelte?raw';

var root = $.from_html(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Floating Lines</h1> <!>`, 1);

export default function FloatingLinesDemo($$anchor, $$props) {
	$.push($$props, true);

	const D = {
		animationSpeed: 1,
		interactive: true,
		parallax: true,
		bendRadius: 5,
		bendStrength: -0.5,
		mouseDamping: 0.05,
		parallaxStrength: 0.2,
		lineCount: 6,
		lineDistance: 5,
		enableTop: true,
		enableMiddle: true,
		enableBottom: true
	};

	let animationSpeed = $.state($.proxy(D.animationSpeed));
	let interactive = $.state($.proxy(D.interactive));
	let parallax = $.state($.proxy(D.parallax));
	let bendRadius = $.state($.proxy(D.bendRadius));
	let bendStrength = $.state($.proxy(D.bendStrength));
	let mouseDamping = $.state($.proxy(D.mouseDamping));
	let parallaxStrength = $.state($.proxy(D.parallaxStrength));
	let lineCount = $.state($.proxy(D.lineCount));
	let lineDistance = $.state($.proxy(D.lineDistance));
	let enableTop = $.state($.proxy(D.enableTop));
	let enableMiddle = $.state($.proxy(D.enableMiddle));
	let enableBottom = $.state($.proxy(D.enableBottom));
	let showContent = $.state(true);

	const enabledWaves = $.derived(() => [
		$.get(enableTop) ? 'top' : null,
		$.get(enableMiddle) ? 'middle' : null,
		$.get(enableBottom) ? 'bottom' : null
	].filter((v) => v !== null));

	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';
	const hasChanges = $.derived(() => $.get(animationSpeed) !== D.animationSpeed || $.get(interactive) !== D.interactive || $.get(parallax) !== D.parallax || $.get(bendRadius) !== D.bendRadius || $.get(bendStrength) !== D.bendStrength || $.get(mouseDamping) !== D.mouseDamping || $.get(parallaxStrength) !== D.parallaxStrength || $.get(lineCount) !== D.lineCount || $.get(lineDistance) !== D.lineDistance || $.get(enableTop) !== D.enableTop || $.get(enableMiddle) !== D.enableMiddle || $.get(enableBottom) !== D.enableBottom);

	function reset() {
		$.set(animationSpeed, D.animationSpeed, true);
		$.set(interactive, D.interactive, true);
		$.set(parallax, D.parallax, true);
		$.set(bendRadius, D.bendRadius, true);
		$.set(bendStrength, D.bendStrength, true);
		$.set(mouseDamping, D.mouseDamping, true);
		$.set(parallaxStrength, D.parallaxStrength, true);
		$.set(lineCount, D.lineCount, true);
		$.set(lineDistance, D.lineDistance, true);
		$.set(enableTop, D.enableTop, true);
		$.set(enableMiddle, D.enableMiddle, true);
		$.set(enableBottom, D.enableBottom, true);
	}

	const usage = $.derived(() => `${sO}
  import FloatingLines from '$lib/components/FloatingLines.svelte';
${sC}

<div style="position: relative; width: 100%; height: 600px; background: #14110E;">
  <FloatingLines animationSpeed={${$.get(animationSpeed)}} />
</div>`);

	const props = [
		{
			name: 'linesGradient',
			type: 'string[]',
			default: 'undefined',
			description: 'Gradient stops for line colors (up to 8).'
		},

		{
			name: 'enabledWaves',
			type: "Array<'top'|'middle'|'bottom'>",
			default: "['top','middle','bottom']",
			description: 'Which wave sets to render.'
		},

		{
			name: 'lineCount',
			type: 'number | number[]',
			default: '[6]',
			description: 'Lines per enabled wave.'
		},

		{
			name: 'lineDistance',
			type: 'number | number[]',
			default: '[5]',
			description: 'Spacing between lines.'
		},

		{
			name: 'topWavePosition',
			type: '{x,y,rotate}',
			default: '-',
			description: 'Top wave position/rotate.'
		},

		{
			name: 'middleWavePosition',
			type: '{x,y,rotate}',
			default: '-',
			description: 'Middle wave position/rotate.'
		},

		{
			name: 'bottomWavePosition',
			type: '{x,y,rotate}',
			default: '{x:2,y:-0.7,rotate:-1}',
			description: 'Bottom wave position/rotate.'
		},

		{
			name: 'animationSpeed',
			type: 'number',
			default: '1',
			description: 'Animation speed.'
		},

		{
			name: 'interactive',
			type: 'boolean',
			default: 'true',
			description: 'Bend lines toward cursor.'
		},

		{
			name: 'bendRadius',
			type: 'number',
			default: '5',
			description: 'Bend falloff radius.'
		},

		{
			name: 'bendStrength',
			type: 'number',
			default: '-0.5',
			description: 'Bend strength.'
		},

		{
			name: 'mouseDamping',
			type: 'number',
			default: '0.05',
			description: 'Mouse smoothing.'
		},

		{
			name: 'parallax',
			type: 'boolean',
			default: 'true',
			description: 'Parallax with cursor.'
		},

		{
			name: 'parallaxStrength',
			type: 'number',
			default: '0.2',
			description: 'Parallax strength.'
		},

		{
			name: 'mixBlendMode',
			type: 'string',
			default: "'screen'",
			description: 'CSS mix-blend-mode.'
		}
	];

	var fragment = root_2();

	$.head('rj8cvf', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Floating Lines - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			FloatingLines(node_1, {
				get animationSpeed() {
					return $.get(animationSpeed);
				},

				get interactive() {
					return $.get(interactive);
				},

				get parallax() {
					return $.get(parallax);
				},

				get bendRadius() {
					return $.get(bendRadius);
				},

				get bendStrength() {
					return $.get(bendStrength);
				},

				get mouseDamping() {
					return $.get(mouseDamping);
				},

				get parallaxStrength() {
					return $.get(parallaxStrength);
				},

				get lineCount() {
					return $.get(lineCount);
				},

				get lineDistance() {
					return $.get(lineDistance);
				},

				get enabledWaves() {
					return $.get(enabledWaves);
				},
				linesGradient: ['#FF3E00', '#FF8A4C', '#FFB089']
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
				slug: 'floating-lines',
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

					PreviewSlider(node_3, {
						title: 'Animation Speed',
						min: 0,
						max: 3,
						step: 0.1,
						get value() {
							return $.get(animationSpeed);
						},
						onChange: (v) => $.set(animationSpeed, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Line Count',
						min: 1,
						max: 20,
						step: 1,
						get value() {
							return $.get(lineCount);
						},
						onChange: (v) => $.set(lineCount, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Line Distance',
						min: 1,
						max: 20,
						step: 0.5,
						get value() {
							return $.get(lineDistance);
						},
						onChange: (v) => $.set(lineDistance, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSwitch(node_6, {
						title: 'Top Wave',
						get checked() {
							return $.get(enableTop);
						},
						onChange: (v) => $.set(enableTop, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSwitch(node_7, {
						title: 'Middle Wave',
						get checked() {
							return $.get(enableMiddle);
						},
						onChange: (v) => $.set(enableMiddle, v, true)
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSwitch(node_8, {
						title: 'Bottom Wave',
						get checked() {
							return $.get(enableBottom);
						},
						onChange: (v) => $.set(enableBottom, v, true)
					});

					var node_9 = $.sibling(node_8, 2);

					PreviewSwitch(node_9, {
						title: 'Interactive',
						get checked() {
							return $.get(interactive);
						},
						onChange: (v) => $.set(interactive, v, true)
					});

					var node_10 = $.sibling(node_9, 2);

					PreviewSwitch(node_10, {
						title: 'Parallax',
						get checked() {
							return $.get(parallax);
						},
						onChange: (v) => $.set(parallax, v, true)
					});

					var node_11 = $.sibling(node_10, 2);

					PreviewSlider(node_11, {
						title: 'Bend Radius',
						min: 0,
						max: 20,
						step: 0.5,
						get value() {
							return $.get(bendRadius);
						},
						onChange: (v) => $.set(bendRadius, v, true)
					});

					var node_12 = $.sibling(node_11, 2);

					PreviewSlider(node_12, {
						title: 'Bend Strength',
						min: -2,
						max: 2,
						step: 0.05,
						get value() {
							return $.get(bendStrength);
						},
						onChange: (v) => $.set(bendStrength, v, true)
					});

					var node_13 = $.sibling(node_12, 2);

					PreviewSlider(node_13, {
						title: 'Mouse Damping',
						min: 0.01,
						max: 0.5,
						step: 0.01,
						get value() {
							return $.get(mouseDamping);
						},
						onChange: (v) => $.set(mouseDamping, v, true)
					});

					var node_14 = $.sibling(node_13, 2);

					PreviewSlider(node_14, {
						title: 'Parallax Strength',
						min: 0,
						max: 1,
						step: 0.05,
						get value() {
							return $.get(parallaxStrength);
						},
						onChange: (v) => $.set(parallaxStrength, v, true)
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
			componentName: 'FloatingLines',
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
	$.pop();
}