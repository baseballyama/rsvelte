import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import TargetCursor from '$lib/components/library/Animations/TargetCursor/TargetCursor.svelte';
import source from '$lib/components/library/Animations/TargetCursor/TargetCursor.svelte?raw';

export default function TargetCursorDemo($$renderer) {
	const DEFAULTS = {
		spinDuration: 2,
		hideDefaultCursor: true,
		hoverDuration: 0.2,
		parallaxOn: true
	};

	let spinDuration = DEFAULTS.spinDuration;
	let hideDefaultCursor = DEFAULTS.hideDefaultCursor;
	let hoverDuration = DEFAULTS.hoverDuration;
	let parallaxOn = DEFAULTS.parallaxOn;
	const hasChanges = $.derived(() => spinDuration !== DEFAULTS.spinDuration || hideDefaultCursor !== DEFAULTS.hideDefaultCursor || hoverDuration !== DEFAULTS.hoverDuration || parallaxOn !== DEFAULTS.parallaxOn);

	function reset() {
		spinDuration = DEFAULTS.spinDuration;
		hideDefaultCursor = DEFAULTS.hideDefaultCursor;
		hoverDuration = DEFAULTS.hoverDuration;
		parallaxOn = DEFAULTS.parallaxOn;
	}

	const usage = $.derived(() => `<TargetCursor targetSelector=".cursor-target" spinDuration={${spinDuration}} hideDefaultCursor={${hideDefaultCursor}} hoverDuration={${hoverDuration}} parallaxOn={${parallaxOn}} />`);

	const props = [
		{
			name: 'targetSelector',
			type: 'string',
			default: '".cursor-target"',
			description: 'Selector for target elements.'
		},

		{
			name: 'spinDuration',
			type: 'number',
			default: '2',
			description: 'Idle spin duration (s).'
		},

		{
			name: 'hideDefaultCursor',
			type: 'boolean',
			default: 'true',
			description: 'Hide native cursor while active.'
		},

		{
			name: 'hoverDuration',
			type: 'number',
			default: '0.2',
			description: 'Hover-lock transition duration (s).'
		},

		{
			name: 'parallaxOn',
			type: 'boolean',
			default: 'true',
			description: 'Subtle corner parallax on target hover.'
		}
	];

	$.head('18yyxjt', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Target Cursor - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Target Cursor</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container" style="position:relative;height:500px;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:1.5rem;">`);

			TargetCursor($$renderer, {
				targetSelector: '.cursor-target',
				spinDuration,
				hideDefaultCursor,
				hoverDuration,
				parallaxOn
			});

			$$renderer.push(`<!----> <button class="cursor-target" style="padding:1em 2em;border-radius:12px;background:#1a1a1a;color:#fff;border:1px solid #333;font-weight:600;cursor:none;">Target 1</button> <button class="cursor-target" style="padding:1em 2em;border-radius:12px;background:#1a1a1a;color:#fff;border:1px solid #333;font-weight:600;cursor:none;">Target 2</button> <button class="cursor-target" style="padding:1em 2em;border-radius:12px;background:#1a1a1a;color:#fff;border:1px solid #333;font-weight:600;cursor:none;">Target 3</button></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'target-cursor', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSlider($$renderer, {
						title: 'Spin Duration',
						min: 0.5,
						max: 6,
						step: 0.1,
						value: spinDuration,
						valueUnit: 's',
						onChange: (v) => spinDuration = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Hover Duration',
						min: 0.05,
						max: 1,
						step: 0.05,
						value: hoverDuration,
						valueUnit: 's',
						onChange: (v) => hoverDuration = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Hide Default Cursor',
						checked: hideDefaultCursor,
						onChange: (v) => hideDefaultCursor = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Parallax On Hover',
						checked: parallaxOn,
						onChange: (v) => parallaxOn = v
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
			componentName: 'TargetCursor',
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