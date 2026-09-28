import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Tooltip from '$lib/components/global/Tooltip.svelte';
import { RESERVED_RANGES } from '$lib/constants/networks.js';

var root = $.from_html(`<div class="private-notice svelte-1yargik"><strong>Private Network:</strong> Not routed on the public Internet</div>`);
var root_1 = $.from_html(`<div class="reference-card svelte-1yargik"><div class="card-header-inline svelte-1yargik"><div class="range-info svelte-1yargik"><h3 class="range-address svelte-1yargik"> </h3> <span class="range-description svelte-1yargik"> </span></div> <span class="rfc-badge svelte-1yargik"> </span></div> <!></div>`);
var root_2 = $.from_html(`<div class="card"><header class="card-header"><h2>Reserved Ranges</h2> <p>Special-purpose IPv4 ranges (loopback, private, link-local, multicast, etc.).</p></header> <div class="reference-section fade-in svelte-1yargik"></div></div>`);

export default function _page($$anchor) {
	var div = root_2();
	var div_1 = $.sibling($.child(div), 2);

	$.each(div_1, 21, () => Object.entries(RESERVED_RANGES), ([rangeName, rangeInfo]) => rangeName, ($$anchor, $$item) => {
		var $$array = $.derived(() => $.to_array($.get($$item), 2));
		let rangeName = () => $.get($$array)[0];
		let rangeInfo = () => $.get($$array)[1];

		{
			let $0 = $.derived(() => `${rangeInfo().description} — Defined in ${rangeInfo().rfc}`);

			Tooltip($$anchor, {
				get text() {
					return $.get($0);
				},
				position: 'top',
				children: ($$anchor, $$slotProps) => {
					var div_2 = root_1();
					var div_3 = $.child(div_2);
					var div_4 = $.child(div_3);
					var h3 = $.child(div_4);
					var text = $.only_child(h3, true);
					var span = $.sibling(h3, 2);
					var text_1 = $.only_child(span, true);

					$.reset(div_4);

					var span_1 = $.sibling(div_4, 2);
					var text_2 = $.only_child(span_1, true);

					$.reset(div_3);

					var node = $.sibling(div_3, 2);

					{
						var consequent = ($$anchor) => {
							var div_5 = root();

							$.append($$anchor, div_5);
						};

						var d = $.derived(() => rangeName().includes('PRIVATE'));

						$.if(node, ($$render) => {
							if ($.get(d)) $$render(consequent);
						});
					}

					$.reset(div_2);

					$.template_effect(() => {
						$.set_text(text, rangeInfo().range);
						$.set_text(text_1, rangeInfo().description);
						$.set_text(text_2, rangeInfo().rfc);
					});

					$.append($$anchor, div_2);
				},
				$$slots: { default: true }
			});
		}
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}