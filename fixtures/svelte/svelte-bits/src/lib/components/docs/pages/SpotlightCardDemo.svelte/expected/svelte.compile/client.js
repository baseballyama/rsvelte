import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import SpotlightCard from '$lib/components/library/Components/SpotlightCard/SpotlightCard.svelte';
import source from '$lib/components/library/Components/SpotlightCard/SpotlightCard.svelte?raw';

var root = $.from_html(`<div class="flex h-full flex-col items-start justify-center"><svg width="48" height="48" viewBox="0 0 24 24" fill="white" class="mb-3"><path d="M12 2l1.8 5.4L19 9l-5.2 1.6L12 16l-1.8-5.4L5 9l5.2-1.6L12 2zm7 11l.9 2.7L22 17l-2.1.9L19 21l-.9-2.1L16 17l2.1-1.3L19 13zM5 13l.7 2.3L8 17l-2.3.7L5 21l-.7-2.3L2 17l2.3-1.7L5 13z"></path></svg> <p style="font-weight:600;font-size:1.4rem;letter-spacing:-0.5px;color:white;">Boost Your Experience</p> <p style="color:#a1a1aa;font-size:14px;margin-top:4px;margin-bottom:2rem;">Get exclusive benefits, features & 24/7 support as a permanent club member.</p></div>`);
var root_1 = $.from_html(`<div class="demo-container" style="position:relative;display:flex;align-items:center;justify-content:center;padding:2.5rem 0;"><!></div>`);
var root_2 = $.from_html(`<h1 class="sub-category">Spotlight Card</h1> <!>`, 1);

export default function SpotlightCardDemo($$anchor) {
	const DEFAULT = '#ffffff40';
	let spotlightColor = $.state(DEFAULT);
	const hasChanges = $.derived(() => $.get(spotlightColor) !== DEFAULT);

	const usage = `<SpotlightCard spotlightColor="rgba(255,255,255,0.25)">
  <!-- content -->
</SpotlightCard>`;

	const props = [
		{
			name: 'spotlightColor',
			type: 'string',
			default: 'rgba(255, 255, 255, 0.25)',
			description: 'Color of the radial spotlight gradient.'
		},

		{
			name: 'class',
			type: 'string',
			default: "''",
			description: 'Additional classes for the card.'
		}
	];

	function reset() {
		$.set(spotlightColor, DEFAULT);
	}

	var fragment = root_2();

	$.head('1nt2w6q', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Spotlight Card - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root_1();
			var node_1 = $.child(div);

			SpotlightCard(node_1, {
				class: 'w-[320px]',
				get spotlightColor() {
					return $.get(spotlightColor);
				},

				children: ($$anchor, $$slotProps) => {
					var div_1 = root();

					$.append($$anchor, div_1);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'spotlight-card',
				usage,
				get source() {
					return source;
				}
			});
		};

		const customize = ($$anchor) => {
			Customize($$anchor, {
				children: ($$anchor, $$slotProps) => {
					PreviewColorPicker($$anchor, {
						title: 'Spotlight Color',
						get value() {
							return $.get(spotlightColor);
						},
						onChange: (v) => $.set(spotlightColor, v, true)
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
			componentName: 'SpotlightCard',
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