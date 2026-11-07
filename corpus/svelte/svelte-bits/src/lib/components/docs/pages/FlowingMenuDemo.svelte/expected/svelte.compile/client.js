import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import FlowingMenu from '$lib/components/library/Components/FlowingMenu/FlowingMenu.svelte';
import source from '$lib/components/library/Components/FlowingMenu/FlowingMenu.svelte?raw';

var root = $.from_html(`<div class="demo-container" style="position:relative;height:600px;overflow:hidden;"><!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Flowing Menu</h1> <!>`, 1);

export default function FlowingMenuDemo($$anchor) {
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

	let speed = $.state($.proxy(DEFAULTS.speed));
	let textColor = $.state($.proxy(DEFAULTS.textColor));
	let bgColor = $.state($.proxy(DEFAULTS.bgColor));
	let marqueeBgColor = $.state($.proxy(DEFAULTS.marqueeBgColor));
	let marqueeTextColor = $.state($.proxy(DEFAULTS.marqueeTextColor));
	let borderColor = $.state($.proxy(DEFAULTS.borderColor));
	let key = $.state(0);
	const hasChanges = $.derived(() => $.get(speed) !== DEFAULTS.speed || $.get(textColor) !== DEFAULTS.textColor || $.get(bgColor) !== DEFAULTS.bgColor || $.get(marqueeBgColor) !== DEFAULTS.marqueeBgColor || $.get(marqueeTextColor) !== DEFAULTS.marqueeTextColor || $.get(borderColor) !== DEFAULTS.borderColor);

	function reset() {
		$.set(speed, DEFAULTS.speed, true);
		$.set(textColor, DEFAULTS.textColor, true);
		$.set(bgColor, DEFAULTS.bgColor, true);
		$.set(marqueeBgColor, DEFAULTS.marqueeBgColor, true);
		$.set(marqueeTextColor, DEFAULTS.marqueeTextColor, true);
		$.set(borderColor, DEFAULTS.borderColor, true);
		$.update(key);
	}

	const usage = $.derived(() => `<FlowingMenu items={items} speed={${$.get(speed)}} textColor="${$.get(textColor)}" bgColor="${$.get(bgColor)}" marqueeBgColor="${$.get(marqueeBgColor)}" marqueeTextColor="${$.get(marqueeTextColor)}" borderColor="${$.get(borderColor)}" />`);

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

	var fragment = root_2();

	$.head('1uzcto9', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Flowing Menu - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			$.key(node_1, () => $.get(key), ($$anchor) => {
				FlowingMenu($$anchor, {
					get items() {
						return demoItems;
					},

					get speed() {
						return $.get(speed);
					},

					get textColor() {
						return $.get(textColor);
					},

					get bgColor() {
						return $.get(bgColor);
					},

					get marqueeBgColor() {
						return $.get(marqueeBgColor);
					},

					get marqueeTextColor() {
						return $.get(marqueeTextColor);
					},

					get borderColor() {
						return $.get(borderColor);
					}
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'flowing-menu',
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
					var node_2 = $.first_child(fragment_4);

					PreviewSlider(node_2, {
						title: 'Speed',
						min: 1,
						max: 60,
						step: 1,
						get value() {
							return $.get(speed);
						},

						onChange: (v) => {
							$.set(speed, v, true);
							$.update(key);
						}
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewColorPicker(node_3, {
						title: 'Text Color',
						get value() {
							return $.get(textColor);
						},

						onChange: (v) => {
							$.set(textColor, v, true);
							$.update(key);
						}
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewColorPicker(node_4, {
						title: 'Background Color',
						get value() {
							return $.get(bgColor);
						},

						onChange: (v) => {
							$.set(bgColor, v, true);
							$.update(key);
						}
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewColorPicker(node_5, {
						title: 'Marquee Bg Color',
						get value() {
							return $.get(marqueeBgColor);
						},

						onChange: (v) => {
							$.set(marqueeBgColor, v, true);
							$.update(key);
						}
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewColorPicker(node_6, {
						title: 'Marquee Text Color',
						get value() {
							return $.get(marqueeTextColor);
						},

						onChange: (v) => {
							$.set(marqueeTextColor, v, true);
							$.update(key);
						}
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewColorPicker(node_7, {
						title: 'Border Color',
						get value() {
							return $.get(borderColor);
						},

						onChange: (v) => {
							$.set(borderColor, v, true);
							$.update(key);
						}
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
			componentName: 'FlowingMenu',
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