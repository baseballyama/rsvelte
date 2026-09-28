import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import Folder from '$lib/components/library/Components/Folder/Folder.svelte';
import source from '$lib/components/library/Components/Folder/Folder.svelte?raw';

var root = $.from_html(`<div class="demo-container" style="position:relative;display:flex;align-items:center;justify-content:center;min-height:500px;"><!></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Folder</h1> <!>`, 1);

export default function FolderDemo($$anchor) {
	const DEFAULTS = { color: '#FF8A4C', size: 2 };
	let color = $.state($.proxy(DEFAULTS.color));
	let size = $.state($.proxy(DEFAULTS.size));
	const hasChanges = $.derived(() => $.get(color) !== DEFAULTS.color || $.get(size) !== DEFAULTS.size);

	function reset() {
		$.set(color, DEFAULTS.color, true);
		$.set(size, DEFAULTS.size, true);
	}

	const usage = $.derived(() => `<Folder color="${$.get(color)}" size={${$.get(size)}} />`);

	const props = [
		{
			name: 'color',
			type: 'string',
			default: '"#FF8A4C"',
			description: 'Folder color.'
		},

		{
			name: 'size',
			type: 'number',
			default: '1',
			description: 'Visual scale factor.'
		},

		{
			name: 'items',
			type: 'FolderItem[]',
			default: '[]',
			description: 'Up to 3 papers to display inside.'
		}
	];

	var fragment = root_2();

	$.head('ih10a2', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Folder - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			Folder(node_1, {
				get color() {
					return $.get(color);
				},

				get size() {
					return $.get(size);
				}
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'folder',
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
					var node_2 = $.first_child(fragment_3);

					PreviewColorPicker(node_2, {
						title: 'Color',
						get value() {
							return $.get(color);
						},
						onChange: (v) => $.set(color, v, true)
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSlider(node_3, {
						title: 'Size',
						min: 0.5,
						max: 4,
						step: 0.1,
						get value() {
							return $.get(size);
						},
						onChange: (v) => $.set(size, v, true)
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
			componentName: 'Folder',
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