import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '$lib/components/global/Icon.svelte';
import { SUB_NAV } from '$lib/constants/nav.js';

var root = $.from_html(`<a class="tool-card svelte-vncaaf"><div class="tool-icon svelte-vncaaf"><!></div> <div class="tool-info svelte-vncaaf"><h3 class="svelte-vncaaf"> </h3> <p class="svelte-vncaaf"> </p></div> <div class="tool-arrow svelte-vncaaf"><!></div></a>`);

var root_1 = $.from_html(`<div class="zone-tools-page svelte-vncaaf"><div class="hero-section svelte-vncaaf"><div class="hero-content svelte-vncaaf"><h1 class="svelte-vncaaf">DNS Zone File Tools</h1> <p class="svelte-vncaaf">Professional tools for DNS zone file analysis, validation, and management. Built for network administrators, DNS
        engineers, and automation workflows.</p></div></div> <div class="tools-grid svelte-vncaaf"></div> <div class="features-section svelte-vncaaf"><div class="features-grid svelte-vncaaf"><div class="feature-card svelte-vncaaf"><div class="feature-icon svelte-vncaaf"><!></div> <div class="feature-content svelte-vncaaf"><h4 class="svelte-vncaaf">Zone Validation</h4> <p class="svelte-vncaaf">Comprehensive RFC compliance checking with detailed error reporting and recommendations for fixing common
            issues.</p></div></div> <div class="feature-card svelte-vncaaf"><div class="feature-icon svelte-vncaaf"><!></div> <div class="feature-content svelte-vncaaf"><h4 class="svelte-vncaaf">Change Tracking</h4> <p class="svelte-vncaaf">Compare zone file versions to track DNS changes, plan migrations, and audit modifications with unified diff
            support.</p></div></div> <div class="feature-card svelte-vncaaf"><div class="feature-icon svelte-vncaaf"><!></div> <div class="feature-content svelte-vncaaf"><h4 class="svelte-vncaaf">Analytics & Insights</h4> <p class="svelte-vncaaf">Deep analysis of record distribution, TTL patterns, name lengths, and zone health metrics for optimization.</p></div></div> <div class="feature-card svelte-vncaaf"><div class="feature-icon svelte-vncaaf"><!></div> <div class="feature-content svelte-vncaaf"><h4 class="svelte-vncaaf">Standards Compliance</h4> <p class="svelte-vncaaf">Ensure DNS names meet RFC length limits and zone files follow best practices for reliable DNS operation.</p></div></div></div></div> <div class="use-cases-section svelte-vncaaf"><h2 class="svelte-vncaaf">Common Use Cases</h2> <div class="use-cases-grid svelte-vncaaf"><div class="use-case svelte-vncaaf"><h4 class="svelte-vncaaf">DNS Migration Planning</h4> <p class="svelte-vncaaf">Compare existing and target zones to understand exactly what changes during migrations and ensure nothing is
          missed.</p></div> <div class="use-case svelte-vncaaf"><h4 class="svelte-vncaaf">Zone File Cleanup</h4> <p class="svelte-vncaaf">Normalize messy zone files with consistent formatting, proper ordering, duplicate removal, and error
          correction.</p></div> <div class="use-case svelte-vncaaf"><h4 class="svelte-vncaaf">Compliance Auditing</h4> <p class="svelte-vncaaf">Validate zone files against DNS standards to identify potential issues before they cause resolution failures.</p></div> <div class="use-case svelte-vncaaf"><h4 class="svelte-vncaaf">Configuration Analysis</h4> <p class="svelte-vncaaf">Understand zone structure, identify optimization opportunities, and track DNS infrastructure growth over time.</p></div></div></div> <div class="best-practices-section svelte-vncaaf"><h2 class="svelte-vncaaf">Zone File Best Practices</h2> <div class="practices-grid svelte-vncaaf"><div class="practice svelte-vncaaf"><!> <span>Always include SOA and NS records for proper delegation</span></div> <div class="practice svelte-vncaaf"><!> <span>Use fully qualified domain names ending with dots</span></div> <div class="practice svelte-vncaaf"><!> <span>Maintain consistent TTL values based on change frequency</span></div> <div class="practice svelte-vncaaf"><!> <span>Keep domain names under 63 characters per label</span></div> <div class="practice svelte-vncaaf"><!> <span>Remove duplicate records to avoid confusion</span></div> <div class="practice svelte-vncaaf"><!> <span>Validate zones after changes before deployment</span></div></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const zoneTools = (() => {
		const dnsNavGroup = SUB_NAV['/dns']?.find((group) => typeof group === 'object' && 'title' in group && group.title === 'Zone File Tools');

		return dnsNavGroup && 'items' in dnsNavGroup ? dnsNavGroup.items : [];
	})();

	var div = root_1();
	var div_1 = $.sibling($.child(div), 2);

	$.each(div_1, 21, () => zoneTools, (tool) => tool.href, ($$anchor, tool) => {
		var a = root();
		var div_2 = $.child(a);
		var node = $.child(div_2);

		Icon(node, { name: 'file', size: 'lg' });
		$.reset(div_2);

		var div_3 = $.sibling(div_2, 2);
		var h3 = $.child(div_3);
		var text = $.only_child(h3, true);
		var p = $.sibling(h3, 2);
		var text_1 = $.only_child(p, true);

		$.reset(div_3);

		var div_4 = $.sibling(div_3, 2);
		var node_1 = $.child(div_4);

		Icon(node_1, { name: 'chevron-right', size: 'sm' });
		$.reset(div_4);
		$.reset(a);

		$.template_effect(() => {
			$.set_attribute(a, 'href', $.get(tool).href);
			$.set_text(text, $.get(tool).label);
			$.set_text(text_1, $.get(tool).description);
		});

		$.append($$anchor, a);
	});

	$.reset(div_1);

	var div_5 = $.sibling(div_1, 2);
	var div_6 = $.child(div_5);
	var div_7 = $.child(div_6);
	var div_8 = $.child(div_7);
	var node_2 = $.child(div_8);

	Icon(node_2, { name: 'check-circle', size: 'lg' });
	$.reset(div_8);
	$.next(2);
	$.reset(div_7);

	var div_9 = $.sibling(div_7, 2);
	var div_10 = $.child(div_9);
	var node_3 = $.child(div_10);

	Icon(node_3, { name: 'git-compare', size: 'lg' });
	$.reset(div_10);
	$.next(2);
	$.reset(div_9);

	var div_11 = $.sibling(div_9, 2);
	var div_12 = $.child(div_11);
	var node_4 = $.child(div_12);

	Icon(node_4, { name: 'bar-chart', size: 'lg' });
	$.reset(div_12);
	$.next(2);
	$.reset(div_11);

	var div_13 = $.sibling(div_11, 2);
	var div_14 = $.child(div_13);
	var node_5 = $.child(div_14);

	Icon(node_5, { name: 'shield', size: 'lg' });
	$.reset(div_14);
	$.next(2);
	$.reset(div_13);
	$.reset(div_6);
	$.reset(div_5);

	var div_15 = $.sibling(div_5, 4);
	var div_16 = $.sibling($.child(div_15), 2);
	var div_17 = $.child(div_16);
	var node_6 = $.child(div_17);

	Icon(node_6, { name: 'check', size: 'sm' });
	$.next(2);
	$.reset(div_17);

	var div_18 = $.sibling(div_17, 2);
	var node_7 = $.child(div_18);

	Icon(node_7, { name: 'check', size: 'sm' });
	$.next(2);
	$.reset(div_18);

	var div_19 = $.sibling(div_18, 2);
	var node_8 = $.child(div_19);

	Icon(node_8, { name: 'check', size: 'sm' });
	$.next(2);
	$.reset(div_19);

	var div_20 = $.sibling(div_19, 2);
	var node_9 = $.child(div_20);

	Icon(node_9, { name: 'check', size: 'sm' });
	$.next(2);
	$.reset(div_20);

	var div_21 = $.sibling(div_20, 2);
	var node_10 = $.child(div_21);

	Icon(node_10, { name: 'check', size: 'sm' });
	$.next(2);
	$.reset(div_21);

	var div_22 = $.sibling(div_21, 2);
	var node_11 = $.child(div_22);

	Icon(node_11, { name: 'check', size: 'sm' });
	$.next(2);
	$.reset(div_22);
	$.reset(div_16);
	$.reset(div_15);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}