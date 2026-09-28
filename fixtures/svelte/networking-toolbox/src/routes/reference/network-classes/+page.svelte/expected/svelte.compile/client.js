import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Tooltip from '$lib/components/global/Tooltip.svelte';
import { NETWORK_CLASSES } from '$lib/constants/networks.js';

var root = $.from_html(`<div class="reference-card svelte-8i5au"><div class="card-header-inline svelte-8i5au"><div class="class-info svelte-8i5au"><div> </div> <div class="class-details svelte-8i5au"><h3 class="svelte-8i5au"> </h3> <span class="mask-info svelte-8i5au"> </span></div></div> <span class="range-badge svelte-8i5au"> </span></div> <p class="class-description svelte-8i5au"> </p> <p class="usage-info svelte-8i5au"><strong>Typical Usage:</strong> </p></div>`);
var root_1 = $.from_html(`<div class="card"><header class="card-header"><h2>Network Classes</h2> <p>Class A/B/C overview with default masks, ranges, and typical usage.</p></header> <div class="reference-section fade-in svelte-8i5au"></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var div = root_1();
	var div_1 = $.sibling($.child(div), 2);

	$.each(div_1, 21, () => Object.entries(NETWORK_CLASSES), ([className, classInfo]) => className, ($$anchor, $$item) => {
		var $$array = $.derived(() => $.to_array($.get($$item), 2));
		let className = () => $.get($$array)[0];
		let classInfo = () => $.get($$array)[1];

		{
			let $0 = $.derived(() => `Class ${className()} networks use ${classInfo().defaultMask} (/${classInfo().cidr}) and cover ${classInfo().range}`);

			Tooltip($$anchor, {
				get text() {
					return $.get($0);
				},
				position: 'top',
				children: ($$anchor, $$slotProps) => {
					var div_2 = root();
					var div_3 = $.child(div_2);
					var div_4 = $.child(div_3);
					var div_5 = $.child(div_4);
					var text = $.only_child(div_5, true);
					var div_6 = $.sibling(div_5, 2);
					var h3 = $.child(div_6);
					var text_1 = $.only_child(h3);
					var span = $.sibling(h3, 2);
					var text_2 = $.only_child(span);

					$.reset(div_6);
					$.reset(div_4);

					var span_1 = $.sibling(div_4, 2);
					var text_3 = $.only_child(span_1);

					$.reset(div_3);

					var p = $.sibling(div_3, 2);
					var text_4 = $.only_child(p, true);
					var p_1 = $.sibling(p, 2);
					var text_5 = $.sibling($.child(p_1));

					$.reset(p_1);
					$.reset(div_2);

					$.template_effect(
						($0, $1, $2) => {
							$.set_class(div_5, 1, `class-badge ${$0 ?? ''}`, 'svelte-8i5au');
							$.set_text(text, className());
							$.set_text(text_1, `Class ${className() ?? ''}`);
							$.set_text(text_2, `${classInfo().defaultMask ?? ''} (/${classInfo().cidr ?? ''})`);
							$.set_text(text_3, `${$1 ?? ''} - ${$2 ?? ''}`);
							$.set_text(text_4, classInfo().description);
							$.set_text(text_5, ` ${classInfo().usage ?? ''}`);
						},
						[
							() => className().toLowerCase(),
							() => classInfo().range.split(' - ')[0],
							() => classInfo().range.split(' - ')[1]
						]
					);

					$.append($$anchor, div_2);
				},
				$$slots: { default: true }
			});
		}
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}