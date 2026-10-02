import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import Masonry from '$lib/components/library/Components/Masonry/Masonry.svelte';
import source from '$lib/components/library/Components/Masonry/Masonry.svelte?raw';

var root = $.from_html(`<div class="demo-container" style="position:relative;height:700px;overflow:hidden;padding:1.5rem;"><!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Masonry</h1> <!>`, 1);

export default function MasonryDemo($$anchor) {
	const DEFAULTS = {
		ease: 'power3.out',
		animateFrom: 'bottom',
		duration: 0.6,
		stagger: 0.05,
		scaleOnHover: true,
		blurToFocus: true,
		colorShiftOnHover: false
	};

	let ease = $.state($.proxy(DEFAULTS.ease));
	let animateFrom = $.state($.proxy(DEFAULTS.animateFrom));
	let duration = $.state($.proxy(DEFAULTS.duration));
	let stagger = $.state($.proxy(DEFAULTS.stagger));
	let scaleOnHover = $.state($.proxy(DEFAULTS.scaleOnHover));
	let blurToFocus = $.state($.proxy(DEFAULTS.blurToFocus));
	let colorShiftOnHover = $.state($.proxy(DEFAULTS.colorShiftOnHover));
	let key = $.state(0);

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
	const hasChanges = $.derived(() => $.get(ease) !== DEFAULTS.ease || $.get(animateFrom) !== DEFAULTS.animateFrom || $.get(duration) !== DEFAULTS.duration || $.get(stagger) !== DEFAULTS.stagger || $.get(scaleOnHover) !== DEFAULTS.scaleOnHover || $.get(blurToFocus) !== DEFAULTS.blurToFocus || $.get(colorShiftOnHover) !== DEFAULTS.colorShiftOnHover);

	function reset() {
		$.set(ease, DEFAULTS.ease, true);
		$.set(animateFrom, DEFAULTS.animateFrom, true);
		$.set(duration, DEFAULTS.duration, true);
		$.set(stagger, DEFAULTS.stagger, true);
		$.set(scaleOnHover, DEFAULTS.scaleOnHover, true);
		$.set(blurToFocus, DEFAULTS.blurToFocus, true);
		$.set(colorShiftOnHover, DEFAULTS.colorShiftOnHover, true);
		$.update(key);
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

	var fragment = root_2();

	$.head('jjtww1', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Masonry - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			$.key(node_1, () => $.get(key), ($$anchor) => {
				Masonry($$anchor, {
					get items() {
						return items;
					},

					get ease() {
						return $.get(ease);
					},

					get animateFrom() {
						return $.get(animateFrom);
					},

					get duration() {
						return $.get(duration);
					},

					get stagger() {
						return $.get(stagger);
					},

					get scaleOnHover() {
						return $.get(scaleOnHover);
					},

					get blurToFocus() {
						return $.get(blurToFocus);
					},

					get colorShiftOnHover() {
						return $.get(colorShiftOnHover);
					}
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'masonry',
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

					PreviewSelect(node_2, {
						title: 'Ease',
						get options() {
							return easeOptions;
						},

						get value() {
							return $.get(ease);
						},

						onChange: (v) => {
							$.set(ease, v, true);
							$.update(key);
						}
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSelect(node_3, {
						title: 'Animate From',
						get options() {
							return animateFromOptions;
						},

						get value() {
							return $.get(animateFrom);
						},

						onChange: (v) => {
							$.set(animateFrom, v, true);
							$.update(key);
						}
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Duration',
						min: 0.1,
						max: 2.0,
						step: 0.1,
						get value() {
							return $.get(duration);
						},
						onChange: (v) => $.set(duration, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Stagger',
						min: 0.01,
						max: 0.2,
						step: 0.01,
						get value() {
							return $.get(stagger);
						},
						onChange: (v) => $.set(stagger, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSwitch(node_6, {
						title: 'Scale on Hover',
						get checked() {
							return $.get(scaleOnHover);
						},
						onChange: (v) => $.set(scaleOnHover, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSwitch(node_7, {
						title: 'Blur to Focus',
						get checked() {
							return $.get(blurToFocus);
						},

						onChange: (v) => {
							$.set(blurToFocus, v, true);
							$.update(key);
						}
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSwitch(node_8, {
						title: 'Color Shift on Hover',
						get checked() {
							return $.get(colorShiftOnHover);
						},
						onChange: (v) => $.set(colorShiftOnHover, v, true)
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
			componentName: 'Masonry',
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