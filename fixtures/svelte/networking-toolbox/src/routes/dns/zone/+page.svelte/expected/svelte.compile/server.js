import * as $ from 'svelte/internal/server';
import Icon from '$lib/components/global/Icon.svelte';
import { SUB_NAV } from '$lib/constants/nav.js';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const zoneTools = (() => {
			const dnsNavGroup = SUB_NAV['/dns']?.find((group) => typeof group === 'object' && 'title' in group && group.title === 'Zone File Tools');

			return dnsNavGroup && 'items' in dnsNavGroup ? dnsNavGroup.items : [];
		})();

		$$renderer.push(`<div class="zone-tools-page svelte-vncaaf"><div class="hero-section svelte-vncaaf"><div class="hero-content svelte-vncaaf"><h1 class="svelte-vncaaf">DNS Zone File Tools</h1> <p class="svelte-vncaaf">Professional tools for DNS zone file analysis, validation, and management. Built for network administrators, DNS
        engineers, and automation workflows.</p></div></div> <div class="tools-grid svelte-vncaaf"><!--[-->`);

		const each_array = $.ensure_array_like(zoneTools);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let tool = each_array[$$index];

			$$renderer.push(`<a${$.attr('href', tool.href)} class="tool-card svelte-vncaaf"><div class="tool-icon svelte-vncaaf">`);
			Icon($$renderer, { name: 'file', size: 'lg' });
			$$renderer.push(`<!----></div> <div class="tool-info svelte-vncaaf"><h3 class="svelte-vncaaf">${$.escape(tool.label)}</h3> <p class="svelte-vncaaf">${$.escape(tool.description)}</p></div> <div class="tool-arrow svelte-vncaaf">`);
			Icon($$renderer, { name: 'chevron-right', size: 'sm' });
			$$renderer.push(`<!----></div></a>`);
		}

		$$renderer.push(`<!--]--></div> <div class="features-section svelte-vncaaf"><div class="features-grid svelte-vncaaf"><div class="feature-card svelte-vncaaf"><div class="feature-icon svelte-vncaaf">`);
		Icon($$renderer, { name: 'check-circle', size: 'lg' });

		$$renderer.push(`<!----></div> <div class="feature-content svelte-vncaaf"><h4 class="svelte-vncaaf">Zone Validation</h4> <p class="svelte-vncaaf">Comprehensive RFC compliance checking with detailed error reporting and recommendations for fixing common
            issues.</p></div></div> <div class="feature-card svelte-vncaaf"><div class="feature-icon svelte-vncaaf">`);

		Icon($$renderer, { name: 'git-compare', size: 'lg' });

		$$renderer.push(`<!----></div> <div class="feature-content svelte-vncaaf"><h4 class="svelte-vncaaf">Change Tracking</h4> <p class="svelte-vncaaf">Compare zone file versions to track DNS changes, plan migrations, and audit modifications with unified diff
            support.</p></div></div> <div class="feature-card svelte-vncaaf"><div class="feature-icon svelte-vncaaf">`);

		Icon($$renderer, { name: 'bar-chart', size: 'lg' });
		$$renderer.push(`<!----></div> <div class="feature-content svelte-vncaaf"><h4 class="svelte-vncaaf">Analytics &amp; Insights</h4> <p class="svelte-vncaaf">Deep analysis of record distribution, TTL patterns, name lengths, and zone health metrics for optimization.</p></div></div> <div class="feature-card svelte-vncaaf"><div class="feature-icon svelte-vncaaf">`);
		Icon($$renderer, { name: 'shield', size: 'lg' });

		$$renderer.push(`<!----></div> <div class="feature-content svelte-vncaaf"><h4 class="svelte-vncaaf">Standards Compliance</h4> <p class="svelte-vncaaf">Ensure DNS names meet RFC length limits and zone files follow best practices for reliable DNS operation.</p></div></div></div></div> <div class="use-cases-section svelte-vncaaf"><h2 class="svelte-vncaaf">Common Use Cases</h2> <div class="use-cases-grid svelte-vncaaf"><div class="use-case svelte-vncaaf"><h4 class="svelte-vncaaf">DNS Migration Planning</h4> <p class="svelte-vncaaf">Compare existing and target zones to understand exactly what changes during migrations and ensure nothing is
          missed.</p></div> <div class="use-case svelte-vncaaf"><h4 class="svelte-vncaaf">Zone File Cleanup</h4> <p class="svelte-vncaaf">Normalize messy zone files with consistent formatting, proper ordering, duplicate removal, and error
          correction.</p></div> <div class="use-case svelte-vncaaf"><h4 class="svelte-vncaaf">Compliance Auditing</h4> <p class="svelte-vncaaf">Validate zone files against DNS standards to identify potential issues before they cause resolution failures.</p></div> <div class="use-case svelte-vncaaf"><h4 class="svelte-vncaaf">Configuration Analysis</h4> <p class="svelte-vncaaf">Understand zone structure, identify optimization opportunities, and track DNS infrastructure growth over time.</p></div></div></div> <div class="best-practices-section svelte-vncaaf"><h2 class="svelte-vncaaf">Zone File Best Practices</h2> <div class="practices-grid svelte-vncaaf"><div class="practice svelte-vncaaf">`);

		Icon($$renderer, { name: 'check', size: 'sm' });
		$$renderer.push(`<!----> <span>Always include SOA and NS records for proper delegation</span></div> <div class="practice svelte-vncaaf">`);
		Icon($$renderer, { name: 'check', size: 'sm' });
		$$renderer.push(`<!----> <span>Use fully qualified domain names ending with dots</span></div> <div class="practice svelte-vncaaf">`);
		Icon($$renderer, { name: 'check', size: 'sm' });
		$$renderer.push(`<!----> <span>Maintain consistent TTL values based on change frequency</span></div> <div class="practice svelte-vncaaf">`);
		Icon($$renderer, { name: 'check', size: 'sm' });
		$$renderer.push(`<!----> <span>Keep domain names under 63 characters per label</span></div> <div class="practice svelte-vncaaf">`);
		Icon($$renderer, { name: 'check', size: 'sm' });
		$$renderer.push(`<!----> <span>Remove duplicate records to avoid confusion</span></div> <div class="practice svelte-vncaaf">`);
		Icon($$renderer, { name: 'check', size: 'sm' });
		$$renderer.push(`<!----> <span>Validate zones after changes before deployment</span></div></div></div></div>`);
	});
}