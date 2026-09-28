import * as $ from 'svelte/internal/server';
import { NETWORK_CLASSES } from '$lib/constants/networks.js';
import Tooltip from '$lib/components/global/Tooltip.svelte';
import _SvgIcon from '$lib/components/global/SvgIcon.svelte';
import Icon from '$lib/components/global/Icon.svelte';
import '../../styles/converters.scss';
import '../../styles/components.scss';

export default function NetworkClassesReference($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="card"><header class="card-header"><h2>Network Classes Reference</h2> <p>Traditional IP address classes and their characteristics for network planning.</p></header> <div class="reference-section"><!--[-->`);

		const each_array = $.ensure_array_like(Object.entries(NETWORK_CLASSES));

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let [className, classInfo] = each_array[$$index];

			Tooltip($$renderer, {
				text: `Class ${$.stringify(className)} networks use ${$.stringify(classInfo.defaultMask)} as default subnet mask and support ${$.stringify(classInfo.range)}`,
				position: 'top',
				children: ($$renderer) => {
					$$renderer.push(`<div class="reference-card"><div class="card-header-inline"><div class="class-info"><div${$.attr_class(`class-badge ${$.stringify(className.toLowerCase())}`)}>${$.escape(className)}</div> <div class="class-details"><h3>Class ${$.escape(className)}</h3> <span class="mask-info">${$.escape(classInfo.defaultMask)} (/${$.escape(classInfo.cidr)})</span></div></div> <span class="range-badge">${$.escape(classInfo.range.split(' - ')[0])} - ${$.escape(classInfo.range.split(' - ')[1])}</span></div> <p class="class-description">${$.escape(classInfo.description)}</p> <p class="usage-info"><strong>Typical Usage:</strong> ${$.escape(classInfo.usage)}</p></div>`);
				},
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!--]--></div> <section class="tips-section"><h4 class="tips-header">`);
		Icon($$renderer, { name: 'info', size: 'md' });

		$$renderer.push(`<!----> Understanding Network Classes</h4> <div class="tips-content"><p><strong>Historical Context:</strong> Network classes were the original method of IP address allocation, now largely
        replaced by CIDR (Classless Inter-Domain Routing) for more efficient address utilization.</p> <ul class="tips-list"><li>• <strong>Class A:</strong> Large networks with millions of hosts (0-127 first octet)</li> <li>• <strong>Class B:</strong> Medium networks with thousands of hosts (128-191 first octet)</li> <li>• <strong>Class C:</strong> Small networks with up to 254 hosts (192-223 first octet)</li> <li>• Classes D and E are reserved for multicast and experimental use</li></ul></div></section> <div class="explainer-card"><h3>`);

		Icon($$renderer, { name: 'info', size: 'md' });

		$$renderer.push(`<!----> Network Class Fundamentals</h3> <div class="explainer-content"><p>Network classes provide a standardized way to understand IP address ranges and their intended use. While modern
        networks use CIDR notation, understanding classes helps with legacy systems and network analysis.</p> <div class="class-comparison"><h4>Class Comparison</h4> <div class="comparison-grid"><div class="comparison-item"><span class="class-name class-a">Class A</span> <span>16.7M networks, 16.7M hosts each</span></div> <div class="comparison-item"><span class="class-name class-b">Class B</span> <span>65K networks, 65K hosts each</span></div> <div class="comparison-item"><span class="class-name class-c">Class C</span> <span>2M networks, 254 hosts each</span></div></div></div></div></div></div>`);
	});
}