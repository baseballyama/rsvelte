import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { NETWORK_CLASSES } from '$lib/constants/networks.js';
import Tooltip from '$lib/components/global/Tooltip.svelte';
import _SvgIcon from '$lib/components/global/SvgIcon.svelte';
import Icon from '$lib/components/global/Icon.svelte';
import '../../styles/converters.scss';
import '../../styles/components.scss';

var root = $.from_html(`<div class="reference-card"><div class="card-header-inline"><div class="class-info"><div> </div> <div class="class-details"><h3> </h3> <span class="mask-info"> </span></div></div> <span class="range-badge"> </span></div> <p class="class-description"> </p> <p class="usage-info"><strong>Typical Usage:</strong> </p></div>`);

var root_1 = $.from_html(`<div class="card"><header class="card-header"><h2>Network Classes Reference</h2> <p>Traditional IP address classes and their characteristics for network planning.</p></header> <div class="reference-section"></div> <section class="tips-section"><h4 class="tips-header"><!> Understanding Network Classes</h4> <div class="tips-content"><p><strong>Historical Context:</strong> Network classes were the original method of IP address allocation, now largely
        replaced by CIDR (Classless Inter-Domain Routing) for more efficient address utilization.</p> <ul class="tips-list"><li>• <strong>Class A:</strong> Large networks with millions of hosts (0-127 first octet)</li> <li>• <strong>Class B:</strong> Medium networks with thousands of hosts (128-191 first octet)</li> <li>• <strong>Class C:</strong> Small networks with up to 254 hosts (192-223 first octet)</li> <li>• Classes D and E are reserved for multicast and experimental use</li></ul></div></section> <div class="explainer-card"><h3><!> Network Class Fundamentals</h3> <div class="explainer-content"><p>Network classes provide a standardized way to understand IP address ranges and their intended use. While modern
        networks use CIDR notation, understanding classes helps with legacy systems and network analysis.</p> <div class="class-comparison"><h4>Class Comparison</h4> <div class="comparison-grid"><div class="comparison-item"><span class="class-name class-a">Class A</span> <span>16.7M networks, 16.7M hosts each</span></div> <div class="comparison-item"><span class="class-name class-b">Class B</span> <span>65K networks, 65K hosts each</span></div> <div class="comparison-item"><span class="class-name class-c">Class C</span> <span>2M networks, 254 hosts each</span></div></div></div></div></div></div>`);

export default function NetworkClassesReference($$anchor, $$props) {
	$.push($$props, true);

	var div = root_1();
	var div_1 = $.sibling($.child(div), 2);

	$.each(div_1, 21, () => Object.entries(NETWORK_CLASSES), ([className, classInfo]) => className, ($$anchor, $$item) => {
		var $$array = $.derived(() => $.to_array($.get($$item), 2));
		let className = () => $.get($$array)[0];
		let classInfo = () => $.get($$array)[1];

		Tooltip($$anchor, {
			get text() {
				return `Class ${className() ?? ''} networks use ${classInfo().defaultMask ?? ''} as default subnet mask and support ${classInfo().range ?? ''}`;
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
						$.set_class(div_5, 1, `class-badge ${$0 ?? ''}`);
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
	});

	$.reset(div_1);

	var section = $.sibling(div_1, 2);
	var h4 = $.child(section);
	var node = $.child(h4);

	Icon(node, { name: 'info', size: 'md' });
	$.next();
	$.reset(h4);
	$.next(2);
	$.reset(section);

	var div_7 = $.sibling(section, 2);
	var h3_1 = $.child(div_7);
	var node_1 = $.child(h3_1);

	Icon(node_1, { name: 'info', size: 'md' });
	$.next();
	$.reset(h3_1);
	$.next(2);
	$.reset(div_7);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}