import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import Masonry from '$lib/components/library/Components/Masonry/Masonry.svelte';
import source from '$lib/components/library/Components/Masonry/Masonry.svelte?raw';

export default function MasonryDemo($$renderer) {
	const DEFAULTS = {
		ease: 'power3.out',
		animateFrom: 'bottom',
		duration: 0.6,
		stagger: 0.05,
		scaleOnHover: true,
		blurToFocus: true,
		colorShiftOnHover: false
	};

	let ease = DEFAULTS.ease;
	let animateFrom = DEFAULTS.animateFrom;
	let duration = DEFAULTS.duration;
	let stagger = DEFAULTS.stagger;
	let scaleOnHover = DEFAULTS.scaleOnHover;
	let blurToFocus = DEFAULTS.blurToFocus;
	let colorShiftOnHover = DEFAULTS.colorShiftOnHover;
	let key = 0;

	const items = [
		{
			id: '1',
			img: 'https://picsum.photos/id/1015/600/900?grayscale',
			url: '#',
			height: 400
		},

		{
			id: '2',
			img: 'https://picsum.photos/id/1011/600/750?grayscale',
			url: '#',
			height: 250
		},

		{
			id: '3',
			img: 'https://picsum.photos/id/1020/600/800?grayscale',
			url: '#',
			height: 600
		},

		{
			id: '4',
			img: 'https://picsum.photos/id/1018/600/660?grayscale',
			url: '#',
			height: 260
		},

		{
			id: '5',
			img: 'https://picsum.photos/id/1016/600/520?grayscale',
			url: '#',
			height: 120
		},

		{
			id: '6',
			img: 'https://picsum.photos/id/1025/600/850?grayscale',
			url: '#',
			height: 850
		},

		{
			id: '7',
			img: 'https://picsum.photos/id/1031/600/720?grayscale',
			url: '#',
			height: 720
		},

		{
			id: '8',
			img: 'https://picsum.photos/id/1035/600/680?grayscale',
			url: '#',
			height: 200
		},

		{
			id: '9',
			img: 'https://picsum.photos/id/1040/600/950?grayscale',
			url: '#',
			height: 350
		},

		{
			id: '10',
			img: 'https://picsum.photos/id/1043/600/600?grayscale',
			url: '#',
			height: 300
		},

		{
			id: '11',
			img: 'https://picsum.photos/id/1050/600/780?grayscale',
			url: '#',
			height: 350
		},

		{
			id: '12',
			img: 'https://picsum.photos/id/1055/600/640?grayscale',
			url: '#',
			height: 240
		},

		{
			id: '13',
			img: 'https://picsum.photos/id/1060/600/820?grayscale',
			url: '#',
			height: 320
		},

		{
			id: '14',
			img: 'https://picsum.photos/id/1065/600/590?grayscale',
			url: '#',
			height: 290
		}
	];

	const easeOptions = [
		'power1.out',
		'power2.out',
		'power3.out',
		'power4.out',
		'back.out',
		'bounce.out',
		'elastic.out',
		'sine.out'
	];

	const animateFromOptions = ['top', 'bottom', 'left', 'right', 'center', 'random'];
	const hasChanges = $.derived(() => ease !== DEFAULTS.ease || animateFrom !== DEFAULTS.animateFrom || duration !== DEFAULTS.duration || stagger !== DEFAULTS.stagger || scaleOnHover !== DEFAULTS.scaleOnHover || blurToFocus !== DEFAULTS.blurToFocus || colorShiftOnHover !== DEFAULTS.colorShiftOnHover);

	function reset() {
		ease = DEFAULTS.ease;
		animateFrom = DEFAULTS.animateFrom;
		duration = DEFAULTS.duration;
		stagger = DEFAULTS.stagger;
		scaleOnHover = DEFAULTS.scaleOnHover;
		blurToFocus = DEFAULTS.blurToFocus;
		colorShiftOnHover = DEFAULTS.colorShiftOnHover;
		key++;
	}

	const usage = `<Masonry items={items} ease="power3.out" animateFrom="bottom" duration={0.6} stagger={0.05} scaleOnHover blurToFocus />`;

	const props = [
		{
			name: 'items',
			type: 'MasonryItem[]',
			default: '-',
			description: 'Items to display in the masonry layout.'
		},

		{
			name: 'ease',
			type: 'string',
			default: '"power3.out"',
			description: 'GSAP easing function.'
		},

		{
			name: 'duration',
			type: 'number',
			default: '0.6',
			description: 'Animation duration (s).'
		},

		{
			name: 'stagger',
			type: 'number',
			default: '0.05',
			description: 'Stagger between items (s).'
		},

		{
			name: 'animateFrom',
			type: 'string',
			default: '"bottom"',
			description: "Direction items animate from."
		},

		{
			name: 'scaleOnHover',
			type: 'boolean',
			default: 'true',
			description: 'Scale items on hover.'
		},

		{
			name: 'hoverScale',
			type: 'number',
			default: '0.95',
			description: 'Scale value on hover.'
		},

		{
			name: 'blurToFocus',
			type: 'boolean',
			default: 'true',
			description: 'Animate blur to focus on entry.'
		},

		{
			name: 'colorShiftOnHover',
			type: 'boolean',
			default: 'false',
			description: 'Color overlay on hover.'
		}
	];

	$.head('jjtww1', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Masonry - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Masonry</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container" style="position:relative;height:700px;overflow:hidden;padding:1.5rem;"><!---->`);

			{
				Masonry($$renderer, {
					items,
					ease,
					animateFrom,
					duration,
					stagger,
					scaleOnHover,
					blurToFocus,
					colorShiftOnHover
				});
			}

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'masonry', usage, source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSelect($$renderer, {
						title: 'Ease',
						options: easeOptions,
						value: ease,
						onChange: (v) => {
							ease = v;
							key++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSelect($$renderer, {
						title: 'Animate From',
						options: animateFromOptions,
						value: animateFrom,
						onChange: (v) => {
							animateFrom = v;
							key++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Duration',
						min: 0.1,
						max: 2.0,
						step: 0.1,
						value: duration,
						onChange: (v) => duration = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Stagger',
						min: 0.01,
						max: 0.2,
						step: 0.01,
						value: stagger,
						onChange: (v) => stagger = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Scale on Hover',
						checked: scaleOnHover,
						onChange: (v) => scaleOnHover = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Blur to Focus',
						checked: blurToFocus,
						onChange: (v) => {
							blurToFocus = v;
							key++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Color Shift on Hover',
						checked: colorShiftOnHover,
						onChange: (v) => colorShiftOnHover = v
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
			componentName: 'Masonry',
			usage,
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