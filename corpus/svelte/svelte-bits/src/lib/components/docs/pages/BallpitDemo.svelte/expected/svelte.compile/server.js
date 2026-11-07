import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import Ballpit from '$lib/components/library/Backgrounds/Ballpit/Ballpit.svelte';
import source from '$lib/components/library/Backgrounds/Ballpit/Ballpit.svelte?raw';

export default function BallpitDemo($$renderer) {
	const D = {
		count: 200,
		gravity: 0.5,
		friction: 0.9975,
		wallBounce: 0.95,
		followCursor: true
	};

	let count = D.count;
	let gravity = D.gravity;
	let friction = D.friction;
	let wallBounce = D.wallBounce;
	let followCursor = D.followCursor;
	let showContent = true;
	let key = 0;
	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';
	const hasChanges = $.derived(() => count !== D.count || gravity !== D.gravity || friction !== D.friction || wallBounce !== D.wallBounce || followCursor !== D.followCursor);

	function reset() {
		count = D.count;
		gravity = D.gravity;
		friction = D.friction;
		wallBounce = D.wallBounce;
		followCursor = D.followCursor;
		key++;
	}

	const usage = $.derived(() => `${sO}
  import Ballpit from '$lib/components/Ballpit.svelte';
${sC}

<div style="width: 100%; height: 600px; position: relative;">
  <Ballpit count={${count}} gravity={${gravity}} followCursor={${followCursor}} />
</div>`);

	const props = [
		{
			name: 'count',
			type: 'number',
			default: '200',
			description: 'Number of spheres.'
		},

		{
			name: 'colors',
			type: 'number[]',
			default: '[0, 0, 0]',
			description: 'Color palette as integer hex values.'
		},

		{
			name: 'ambientColor',
			type: 'number',
			default: '0xffffff',
			description: 'Ambient light color.'
		},

		{
			name: 'ambientIntensity',
			type: 'number',
			default: '1',
			description: 'Ambient light intensity.'
		},

		{
			name: 'lightIntensity',
			type: 'number',
			default: '200',
			description: 'Point light intensity.'
		},

		{
			name: 'minSize',
			type: 'number',
			default: '0.5',
			description: 'Min sphere size.'
		},

		{
			name: 'maxSize',
			type: 'number',
			default: '1',
			description: 'Max sphere size.'
		},

		{
			name: 'gravity',
			type: 'number',
			default: '0.5',
			description: 'Gravity strength.'
		},

		{
			name: 'friction',
			type: 'number',
			default: '0.9975',
			description: 'Velocity friction.'
		},

		{
			name: 'wallBounce',
			type: 'number',
			default: '0.95',
			description: 'Wall bounce factor.'
		},

		{
			name: 'followCursor',
			type: 'boolean',
			default: 'true',
			description: 'Sphere 0 follows cursor.'
		}
	];

	$.head('15tc776', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Ballpit - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Ballpit</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]"><!---->`);

			{
				Ballpit($$renderer, { count, gravity, friction, wallBounce, followCursor });
			}

			$$renderer.push(`<!----> `);
			BackgroundContentToggle($$renderer, { showContent, onToggle: (v) => showContent = v });
			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'ballpit', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSlider($$renderer, {
						title: 'Count',
						min: 10,
						max: 500,
						step: 1,
						value: count,
						onChange: (v) => {
							count = v;
							key++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Gravity',
						min: 0,
						max: 3,
						step: 0.05,
						value: gravity,
						onChange: (v) => gravity = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Friction',
						min: 0.9,
						max: 1,
						step: 0.0005,
						value: friction,
						onChange: (v) => friction = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Wall Bounce',
						min: 0,
						max: 1,
						step: 0.01,
						value: wallBounce,
						onChange: (v) => wallBounce = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Follow Cursor',
						checked: followCursor,
						onChange: (v) => {
							followCursor = v;
							key++;
						}
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
			componentName: 'Ballpit',
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
}