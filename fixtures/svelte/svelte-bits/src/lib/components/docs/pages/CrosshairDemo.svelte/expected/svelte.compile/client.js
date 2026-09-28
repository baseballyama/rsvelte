import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import Crosshair from '$lib/components/library/Animations/Crosshair/Crosshair.svelte';
import source from '$lib/components/library/Animations/Crosshair/Crosshair.svelte?raw';

var root = $.from_html(`<div class="demo-container" style="position:relative;height:500px;display:flex;align-items:center;justify-content:center;cursor:none;"><p style="font-size:2.5rem;font-weight:900;color:var(--text-primary);text-align:center;">Hover inside this box.</p> <!></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Crosshair</h1> <!>`, 1);

export default function CrosshairDemo($$anchor) {
	const DEFAULTS = { color: '#FF8A4C', targeted: true };
	let color = $.state($.proxy(DEFAULTS.color));
	let targeted = $.state($.proxy(DEFAULTS.targeted));
	let containerRef = $.state(null);
	const hasChanges = $.derived(() => $.get(color) !== DEFAULTS.color || $.get(targeted) !== DEFAULTS.targeted);

	function reset() {
		$.set(color, DEFAULTS.color, true);
		$.set(targeted, DEFAULTS.targeted, true);
	}

	const usage = $.derived(() => `<Crosshair color="${$.get(color)}" containerRef={ref} />`);

	const props = [
		{
			name: 'color',
			type: 'string',
			default: '"white"',
			description: 'Color of the crosshair lines.'
		},

		{
			name: 'containerRef',
			type: 'HTMLElement | null',
			default: 'null',
			description: 'Optional container ref to limit crosshair to specific element. If null, the crosshair will be active on the entire viewport.'
		}
	];

	var fragment = root_2();

	$.head('16lx88o', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Crosshair - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.sibling($.child(div), 2);

			{
				var consequent = ($$anchor) => {
					{
						let $0 = $.derived(() => $.get(targeted) ? $.get(containerRef) : null);

						Crosshair($$anchor, {
							get color() {
								return $.get(color);
							},

							get containerRef() {
								return $.get($0);
							}
						});
					}
				};

				$.if(node_1, ($$render) => {
					if ($.get(containerRef) !== undefined) $$render(consequent);
				});
			}

			$.reset(div);
			$.bind_this(div, ($$value) => $.set(containerRef, $$value), () => $.get(containerRef));
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'crosshair',
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

					PreviewColorPicker(node_2, {
						title: 'Color',
						get value() {
							return $.get(color);
						},
						onChange: (v) => $.set(color, v, true)
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSwitch(node_3, {
						title: 'Targeted',
						get checked() {
							return $.get(targeted);
						},
						onChange: (v) => $.set(targeted, v, true)
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
			componentName: 'Crosshair',
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