import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import GlassIcons from '$lib/components/library/Components/GlassIcons/GlassIcons.svelte';
import source from '$lib/components/library/Components/GlassIcons/GlassIcons.svelte?raw';

const fileText = ($$anchor) => {
	var svg = root();

	$.append($$anchor, svg);
};

const book = ($$anchor) => {
	var svg_1 = root_1();

	$.append($$anchor, svg_1);
};

const heart = ($$anchor) => {
	var svg_2 = root_2();

	$.append($$anchor, svg_2);
};

const cloud = ($$anchor) => {
	var svg_3 = root_3();

	$.append($$anchor, svg_3);
};

const edit = ($$anchor) => {
	var svg_4 = root_4();

	$.append($$anchor, svg_4);
};

const barChart = ($$anchor) => {
	var svg_5 = root_5();

	$.append($$anchor, svg_5);
};

var root = $.from_svg(`<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`);
var root_1 = $.from_svg(`<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`);
var root_2 = $.from_svg(`<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`);
var root_3 = $.from_svg(`<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>`);
var root_4 = $.from_svg(`<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`);
var root_5 = $.from_svg(`<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`);
var root_6 = $.from_html(`<div class="demo-container" style="position:relative;display:flex;align-items:center;justify-content:center;min-height:500px;overflow:hidden;"><!></div>`);
var root_7 = $.from_html(`<h1 class="sub-category">Glass Icons</h1> <!>`, 1);

export default function GlassIconsDemo($$anchor) {
	const DEFAULTS = { colorful: false };
	let colorful = $.state($.proxy(DEFAULTS.colorful));
	const hasChanges = $.derived(() => $.get(colorful) !== DEFAULTS.colorful);

	function reset() {
		$.set(colorful, DEFAULTS.colorful, true);
	}

	const usage = `<GlassIcons items={items} />`;

	const props = [
		{
			name: 'items',
			type: 'GlassIconsItem[]',
			default: '[]',
			description: 'Array of items. Each: { icon: Snippet, color: string, label: string, customClass?: string }.'
		},

		{
			name: 'class',
			type: 'string',
			default: "''",
			description: 'Optional additional class for the container.'
		}
	];

	var fragment = root_7();

	$.head('o7hoqk', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Glass Icons - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			const data = $.derived(() => [
				{
					icon: fileText,
					color: $.get(colorful) ? 'blue' : '#444',
					label: 'Files'
				},

				{
					icon: book,
					color: $.get(colorful) ? 'purple' : '#444',
					label: 'Books'
				},

				{
					icon: heart,
					color: $.get(colorful) ? 'red' : '#444',
					label: 'Health'
				},

				{
					icon: cloud,
					color: $.get(colorful) ? 'indigo' : '#444',
					label: 'Weather'
				},

				{
					icon: edit,
					color: $.get(colorful) ? 'orange' : '#444',
					label: 'Notes'
				},

				{
					icon: barChart,
					color: $.get(colorful) ? 'green' : '#444',
					label: 'Stats'
				}
			]);

			var div = root_6();
			var node_1 = $.child(div);

			GlassIcons(node_1, {
				get items() {
					return $.get(data);
				}
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'glass-icons',
				usage,
				get source() {
					return source;
				}
			});
		};

		const customize = ($$anchor) => {
			Customize($$anchor, {
				children: ($$anchor, $$slotProps) => {
					PreviewSwitch($$anchor, {
						title: 'Colorful',
						get checked() {
							return $.get(colorful);
						},
						onChange: (v) => $.set(colorful, v, true)
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
			componentName: 'GlassIcons',
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