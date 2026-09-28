import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import FlowingMenu from '$lib/components/library/Components/FlowingMenu/FlowingMenu.svelte';
import source from '$lib/components/library/Components/FlowingMenu/FlowingMenu.svelte?raw';

export default function FlowingMenuDemo($$renderer) {
	const demoItems = [
		{
			link: '#',
			text: 'Mojave',
			image: 'https://picsum.photos/600/400?random=1'
		},

		{
			link: '#',
			text: 'Sonoma',
			image: 'https://picsum.photos/600/400?random=2'
		},

		{
			link: '#',
			text: 'Ventura',
			image: 'https://picsum.photos/600/400?random=3'
		},

		{
			link: '#',
			text: 'Sequoia',
			image: 'https://picsum.photos/600/400?random=4'
		}
	];

	const DEFAULTS = {
		speed: 15,
		textColor: '#fff',
		bgColor: '#14110E',
		marqueeBgColor: '#fff',
		marqueeTextColor: '#14110E',
		borderColor: '#fff'
	};

	let speed = DEFAULTS.speed;
	let textColor = DEFAULTS.textColor;
	let bgColor = DEFAULTS.bgColor;
	let marqueeBgColor = DEFAULTS.marqueeBgColor;
	let marqueeTextColor = DEFAULTS.marqueeTextColor;
	let borderColor = DEFAULTS.borderColor;
	let key = 0;
	const hasChanges = $.derived(() => speed !== DEFAULTS.speed || textColor !== DEFAULTS.textColor || bgColor !== DEFAULTS.bgColor || marqueeBgColor !== DEFAULTS.marqueeBgColor || marqueeTextColor !== DEFAULTS.marqueeTextColor || borderColor !== DEFAULTS.borderColor);

	function reset() {
		speed = DEFAULTS.speed;
		textColor = DEFAULTS.textColor;
		bgColor = DEFAULTS.bgColor;
		marqueeBgColor = DEFAULTS.marqueeBgColor;
		marqueeTextColor = DEFAULTS.marqueeTextColor;
		borderColor = DEFAULTS.borderColor;
		key++;
	}

	const usage = $.derived(() => `<FlowingMenu items={items} speed={${speed}} textColor="${textColor}" bgColor="${bgColor}" marqueeBgColor="${marqueeBgColor}" marqueeTextColor="${marqueeTextColor}" borderColor="${borderColor}" />`);

	const props = [
		{
			name: 'items',
			type: 'FlowingMenuItem[]',
			default: '[]',
			description: 'Menu rows.'
		},

		{
			name: 'speed',
			type: 'number',
			default: '15',
			description: 'Marquee duration.'
		},

		{
			name: 'textColor',
			type: 'string',
			default: '"#fff"',
			description: 'Row text color.'
		},

		{
			name: 'bgColor',
			type: 'string',
			default: '"#14110E"',
			description: 'Container background.'
		},

		{
			name: 'marqueeBgColor',
			type: 'string',
			default: '"#fff"',
			description: 'Marquee panel background.'
		},

		{
			name: 'marqueeTextColor',
			type: 'string',
			default: '"#14110E"',
			description: 'Marquee text color.'
		},

		{
			name: 'borderColor',
			type: 'string',
			default: '"#fff"',
			description: 'Divider color.'
		}
	];

	$.head('1uzcto9', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Flowing Menu - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Flowing Menu</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container" style="position:relative;height:600px;overflow:hidden;"><!---->`);

			{
				FlowingMenu($$renderer, {
					items: demoItems,
					speed,
					textColor,
					bgColor,
					marqueeBgColor,
					marqueeTextColor,
					borderColor
				});
			}

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'flowing-menu', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSlider($$renderer, {
						title: 'Speed',
						min: 1,
						max: 60,
						step: 1,
						value: speed,
						onChange: (v) => {
							speed = v;
							key++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewColorPicker($$renderer, {
						title: 'Text Color',
						value: textColor,
						onChange: (v) => {
							textColor = v;
							key++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewColorPicker($$renderer, {
						title: 'Background Color',
						value: bgColor,
						onChange: (v) => {
							bgColor = v;
							key++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewColorPicker($$renderer, {
						title: 'Marquee Bg Color',
						value: marqueeBgColor,
						onChange: (v) => {
							marqueeBgColor = v;
							key++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewColorPicker($$renderer, {
						title: 'Marquee Text Color',
						value: marqueeTextColor,
						onChange: (v) => {
							marqueeTextColor = v;
							key++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewColorPicker($$renderer, {
						title: 'Border Color',
						value: borderColor,
						onChange: (v) => {
							borderColor = v;
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
			componentName: 'FlowingMenu',
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