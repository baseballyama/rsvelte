import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import InfiniteMenu from '$lib/components/library/Components/InfiniteMenu/InfiniteMenu.svelte';
import source from '$lib/components/library/Components/InfiniteMenu/InfiniteMenu.svelte?raw';

var root = $.from_html(`<div style="height:500px;width:100%;overflow:hidden;"><!></div>`);
var root_1 = $.from_html(`<div class="demo-container" style="position:relative;height:500px;overflow:hidden;padding:0;"><!></div>`);
var root_2 = $.from_html(`<h1 class="sub-category">Infinite Menu</h1> <!>`, 1);

export default function InfiniteMenuDemo($$anchor) {
	const DEFAULTS = { scale: 1.0 };
	let scale = $.state($.proxy(DEFAULTS.scale));
	let key = $.state(0);
	const hasChanges = $.derived(() => $.get(scale) !== DEFAULTS.scale);

	function reset() {
		$.set(scale, DEFAULTS.scale, true);
		$.update(key);
	}

	const items = [
		{
			image: 'https://picsum.photos/300/300?grayscale',
			link: 'https://google.com/',
			title: 'Item 1',
			description: 'This is pretty cool, right?'
		},

		{
			image: 'https://picsum.photos/400/400?grayscale',
			link: 'https://google.com/',
			title: 'Item 2',
			description: 'This is pretty cool, right?'
		},

		{
			image: 'https://picsum.photos/500/500?grayscale',
			link: 'https://google.com/',
			title: 'Item 3',
			description: 'This is pretty cool, right?'
		},

		{
			image: 'https://picsum.photos/600/600?grayscale',
			link: 'https://google.com/',
			title: 'Item 4',
			description: 'This is pretty cool, right?'
		}
	];

	const usage = `<InfiniteMenu items={items} scale={1} />`;

	const props = [
		{
			name: 'items',
			type: 'InfiniteMenuItem[]',
			default: '[{...}]',
			description: 'Items with image, link, title, description.'
		},

		{
			name: 'scale',
			type: 'number',
			default: '1.0',
			description: 'Camera zoom.'
		}
	];

	var fragment = root_2();

	$.head('1itm5d5', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Infinite Menu - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root_1();
			var node_1 = $.child(div);

			$.key(node_1, () => $.get(key), ($$anchor) => {
				var div_1 = root();
				var node_2 = $.child(div_1);

				InfiniteMenu(node_2, {
					get items() {
						return items;
					},

					get scale() {
						return $.get(scale);
					}
				});

				$.reset(div_1);
				$.append($$anchor, div_1);
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'infinite-menu',
				usage,
				get source() {
					return source;
				}
			});
		};

		const customize = ($$anchor) => {
			Customize($$anchor, {
				children: ($$anchor, $$slotProps) => {
					PreviewSlider($$anchor, {
						title: 'Scale',
						min: 0.1,
						max: 3,
						step: 0.1,
						get value() {
							return $.get(scale);
						},
						onChange: (v) => $.set(scale, v, true)
					});
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
			componentName: 'InfiniteMenu',
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