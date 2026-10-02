import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RESERVED_RANGES } from '$lib/constants/networks.js';
import Tooltip from '$lib/components/global/Tooltip.svelte';
import _SvgIcon from '$lib/components/global/SvgIcon.svelte';
import Icon from '$lib/components/global/Icon.svelte';
import '../../styles/converters.scss';
import '../../styles/components.scss';

var root = $.from_html(`<div class="private-notice"><strong>Private Network:</strong> Not routed on the public Internet</div>`);
var root_1 = $.from_html(`<div class="reference-card"><div class="card-header-inline"><div class="range-info"><h3 class="range-address"> </h3> <span class="range-description"> </span></div> <span class="rfc-badge"> </span></div> <!></div>`);

var root_2 = $.from_html(`<div class="card"><header class="card-header"><h2>Reserved IP Ranges Reference</h2> <p>Special-purpose IP address ranges defined by RFCs and their intended uses.</p></header> <div class="reference-section"></div> <div class="explainer-card"><h3><!> Understanding Reserved IP Ranges</h3> <div class="explainer-content"><p>Reserved IP ranges serve specific purposes in networking and are defined by various RFCs (Request for Comments).
        Understanding these ranges is crucial for network planning and avoiding conflicts.</p> <div class="range-categories"><h4>Key Categories</h4> <ul><li><strong>Private Networks (RFC 1918):</strong> Used for internal networks, not routed on the Internet</li> <li><strong>Loopback (RFC 1122):</strong> Traffic that never leaves the local machine</li> <li><strong>Link-Local (RFC 3927):</strong> Automatic IP configuration when DHCP is unavailable</li> <li><strong>Multicast (RFC 3171):</strong> One-to-many communication protocols</li></ul></div></div></div></div>`);

export default function ReservedRangesReference($$anchor) {
	var div = root_2();
	var div_1 = $.sibling($.child(div), 2);

	$.each(div_1, 21, () => Object.entries(RESERVED_RANGES), ([rangeName, rangeInfo]) => rangeName, ($$anchor, $$item) => {
		var $$array = $.derived(() => $.to_array($.get($$item), 2));
		let rangeName = () => $.get($$array)[0];
		let rangeInfo = () => $.get($$array)[1];

		Tooltip($$anchor, {
			get text() {
				return `${rangeInfo().description ?? ''} - Defined in ${rangeInfo().rfc ?? ''}`;
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
	});

	$.reset(div_1);

	var div_6 = $.sibling(div_1, 2);
	var h3_1 = $.child(div_6);
	var node_1 = $.child(h3_1);

	Icon(node_1, { name: 'info', size: 'md' });
	$.next();
	$.reset(h3_1);
	$.next(2);
	$.reset(div_6);
	$.reset(div);
	$.append($$anchor, div);
}