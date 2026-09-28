import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import FloatingLines from '$lib/components/library/Backgrounds/FloatingLines/FloatingLines.svelte';
import source from '$lib/components/library/Backgrounds/FloatingLines/FloatingLines.svelte?raw';

export default function FloatingLinesDemo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		let animationSpeed = D.animationSpeed;
		let interactive = D.interactive;
		let parallax = D.parallax;
		let bendRadius = D.bendRadius;
		let bendStrength = D.bendStrength;
		let mouseDamping = D.mouseDamping;
		let parallaxStrength = D.parallaxStrength;
		let lineCount = D.lineCount;
		let lineDistance = D.lineDistance;
		let enableTop = D.enableTop;
		let enableMiddle = D.enableMiddle;
		let enableBottom = D.enableBottom;
		let showContent = true;

		const enabledWaves = $.derived(() => [
			enableTop ? 'top' : null,
			enableMiddle ? 'middle' : null,
			enableBottom ? 'bottom' : null
		].filter((v) => v !== null));

		const sO = '<' + 'script lang="ts">';
		const sC = '</' + 'script>';
		const hasChanges = $.derived(() => animationSpeed !== D.animationSpeed || interactive !== D.interactive || parallax !== D.parallax || bendRadius !== D.bendRadius || bendStrength !== D.bendStrength || mouseDamping !== D.mouseDamping || parallaxStrength !== D.parallaxStrength || lineCount !== D.lineCount || lineDistance !== D.lineDistance || enableTop !== D.enableTop || enableMiddle !== D.enableMiddle || enableBottom !== D.enableBottom);

		function reset() {
			animationSpeed = D.animationSpeed;
			interactive = D.interactive;
			parallax = D.parallax;
			bendRadius = D.bendRadius;
			bendStrength = D.bendStrength;
			mouseDamping = D.mouseDamping;
			parallaxStrength = D.parallaxStrength;
			lineCount = D.lineCount;
			lineDistance = D.lineDistance;
			enableTop = D.enableTop;
			enableMiddle = D.enableMiddle;
			enableBottom = D.enableBottom;
		}

		const usage = $.derived(() => `${sO}
  import FloatingLines from '$lib/components/FloatingLines.svelte';
${sC}

<div style="position: relative; width: 100%; height: 600px; background: #14110E;">
  <FloatingLines animationSpeed={${animationSpeed}} />
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

		$.head('rj8cvf', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Floating Lines - svelte-bits</title>`);
			});
		});

		$$renderer.push(`<h1 class="sub-category">Floating Lines</h1> `);

		{
			function preview($$renderer) {
				$$renderer.push(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">`);

				FloatingLines($$renderer, {
					animationSpeed,
					interactive,
					parallax,
					bendRadius,
					bendStrength,
					mouseDamping,
					parallaxStrength,
					lineCount,
					lineDistance,
					enabledWaves: enabledWaves(),
					linesGradient: ['#FF3E00', '#FF8A4C', '#FFB089']
				});

				$$renderer.push(`<!----> `);
				BackgroundContentToggle($$renderer, { showContent, onToggle: (v) => showContent = v });
				$$renderer.push(`<!----></div>`);
			}

			function code($$renderer) {
				DemoCodeTab($$renderer, { slug: 'floating-lines', usage: usage(), source });
			}

			function customize($$renderer) {
				Customize($$renderer, {
					children: ($$renderer) => {
						PreviewSlider($$renderer, {
							title: 'Animation Speed',
							min: 0,
							max: 3,
							step: 0.1,
							value: animationSpeed,
							onChange: (v) => animationSpeed = v
						});

						$$renderer.push(`<!----> `);

						PreviewSlider($$renderer, {
							title: 'Line Count',
							min: 1,
							max: 20,
							step: 1,
							value: lineCount,
							onChange: (v) => lineCount = v
						});

						$$renderer.push(`<!----> `);

						PreviewSlider($$renderer, {
							title: 'Line Distance',
							min: 1,
							max: 20,
							step: 0.5,
							value: lineDistance,
							onChange: (v) => lineDistance = v
						});

						$$renderer.push(`<!----> `);

						PreviewSwitch($$renderer, {
							title: 'Top Wave',
							checked: enableTop,
							onChange: (v) => enableTop = v
						});

						$$renderer.push(`<!----> `);

						PreviewSwitch($$renderer, {
							title: 'Middle Wave',
							checked: enableMiddle,
							onChange: (v) => enableMiddle = v
						});

						$$renderer.push(`<!----> `);

						PreviewSwitch($$renderer, {
							title: 'Bottom Wave',
							checked: enableBottom,
							onChange: (v) => enableBottom = v
						});

						$$renderer.push(`<!----> `);

						PreviewSwitch($$renderer, {
							title: 'Interactive',
							checked: interactive,
							onChange: (v) => interactive = v
						});

						$$renderer.push(`<!----> `);

						PreviewSwitch($$renderer, {
							title: 'Parallax',
							checked: parallax,
							onChange: (v) => parallax = v
						});

						$$renderer.push(`<!----> `);

						PreviewSlider($$renderer, {
							title: 'Bend Radius',
							min: 0,
							max: 20,
							step: 0.5,
							value: bendRadius,
							onChange: (v) => bendRadius = v
						});

						$$renderer.push(`<!----> `);

						PreviewSlider($$renderer, {
							title: 'Bend Strength',
							min: -2,
							max: 2,
							step: 0.05,
							value: bendStrength,
							onChange: (v) => bendStrength = v
						});

						$$renderer.push(`<!----> `);

						PreviewSlider($$renderer, {
							title: 'Mouse Damping',
							min: 0.01,
							max: 0.5,
							step: 0.01,
							value: mouseDamping,
							onChange: (v) => mouseDamping = v
						});

						$$renderer.push(`<!----> `);

						PreviewSlider($$renderer, {
							title: 'Parallax Strength',
							min: 0,
							max: 1,
							step: 0.05,
							value: parallaxStrength,
							onChange: (v) => parallaxStrength = v
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			}

			function propTable($$renderer) {
				PropTable($$renderer, { rows: props });
			}

			TabsLayout($$renderer, {
				onreset: reset,
				hasChanges: hasChanges(),
				componentName: 'FloatingLines',
				usage: usage(),
				source,
				props,
				preview,
				code,
				customize,
				propTable,
				$$slots: { preview: true, code: true, customize: true, propTable: true }
			});
		}

		$$renderer.push(`<!---->`);
	});
}