import * as $ from 'svelte/internal/server';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import { humanizeTTL, calculateCacheExpiry } from '$lib/utils/dns-validation.js';
import { useClipboard } from '$lib/composables';
import { formatNumber } from '$lib/utils/formatters';

export default function TTLCalculator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let ttlInput = '3600';
		let customDate = '';
		let useCustomDate = false;
		let activeTTLIndex = null;
		let activeExampleIndex = null;
		let results = null;
		const clipboard = useClipboard();

		const commonTTLs = [
			{
				seconds: 60,
				label: '1 minute',
				description: 'Very short - high DNS load'
			},

			{
				seconds: 300,
				label: '5 minutes',
				description: 'Short - for frequently changing records'
			},

			{
				seconds: 600,
				label: '10 minutes',
				description: 'Short - development/testing'
			},

			{
				seconds: 1800,
				label: '30 minutes',
				description: 'Medium-short - moderate changes'
			},

			{
				seconds: 3600,
				label: '1 hour',
				description: 'Medium - balanced performance'
			},

			{
				seconds: 7200,
				label: '2 hours',
				description: 'Medium - most web services'
			},

			{
				seconds: 14400,
				label: '4 hours',
				description: 'Medium-long - stable services'
			},

			{
				seconds: 43200,
				label: '12 hours',
				description: 'Long - very stable records'
			},

			{
				seconds: 86400,
				label: '1 day',
				description: 'Long - default for many records'
			},

			{
				seconds: 172800,
				label: '2 days',
				description: 'Very long - infrastructure records'
			},

			{
				seconds: 604800,
				label: '1 week',
				description: 'Very long - rarely changing records'
			}
		];

		const examples = [
			{
				ttl: '300',
				scenario: 'Load Balancer IP',
				description: 'Short TTL for quick failover capability'
			},

			{
				ttl: '3600',
				scenario: 'Web Server A Record',
				description: 'Standard TTL for web services'
			},

			{
				ttl: '86400',
				scenario: 'MX Record',
				description: 'Stable mail server configuration'
			},

			{
				ttl: '604800',
				scenario: 'NS Record',
				description: 'Authoritative name servers rarely change'
			}
		];

		function loadExample(example, index) {
			ttlInput = example.ttl;
			activeExampleIndex = index;
			activeTTLIndex = null;
			calculateTTL();
		}

		function loadCommonTTL(ttl, index) {
			ttlInput = ttl.toString();
			activeTTLIndex = index;
			activeExampleIndex = null;
			calculateTTL();
		}

		function calculateTTL() {
			const ttlSeconds = parseInt(ttlInput);

			if (isNaN(ttlSeconds) || ttlSeconds < 0) {
				results = null;

				return;
			}

			const ttlInfo = humanizeTTL(ttlSeconds);
			const expiryFromNow = calculateCacheExpiry(ttlSeconds);
			let expiryFromCustom;
			let customDateValid = true;

			if (useCustomDate && customDate) {
				const customDateTime = new Date(customDate);

				if (!isNaN(customDateTime.getTime())) {
					expiryFromCustom = calculateCacheExpiry(ttlSeconds, customDateTime);
				} else {
					customDateValid = false;
				}
			}

			results = { ttlInfo, expiryFromNow, expiryFromCustom, customDateValid };
		}

		function formatDateTime(date) {
			return date.toLocaleString('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
				timeZoneName: 'short'
			});
		}

		function formatRelativeTime(date) {
			const now = new Date();
			const diffMs = date.getTime() - now.getTime();
			const diffMinutes = Math.round(diffMs / (1000 * 60));
			const diffHours = Math.round(diffMs / (1000 * 60 * 60));
			const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

			if (Math.abs(diffMinutes) < 60) {
				return diffMinutes > 0
					? `in ${diffMinutes} minutes`
					: `${Math.abs(diffMinutes)} minutes ago`;
			} else if (Math.abs(diffHours) < 24) {
				return diffHours > 0
					? `in ${diffHours} hours`
					: `${Math.abs(diffHours)} hours ago`;
			} else {
				return diffDays > 0
					? `in ${diffDays} days`
					: `${Math.abs(diffDays)} days ago`;
			}
		}

		function handleInputChange() {
			// Clear active states when user manually changes input
			activeTTLIndex = null;

			activeExampleIndex = null;
			calculateTTL();
		}

		// Calculate on component load
		calculateTTL();

		$$renderer.push(`<div class="card"><header class="card-header"><h1>TTL Calculator</h1> <p>Humanize DNS TTL values and compute cache expiry times from now or specific dates</p></header> <div class="card info-card svelte-1ppq2qw"><div class="overview-content svelte-1ppq2qw"><div class="overview-item svelte-1ppq2qw">`);
		Icon($$renderer, { name: 'clock', size: 'sm' });
		$$renderer.push(`<!----> <div><strong class="svelte-1ppq2qw">TTL Humanization:</strong> Convert seconds to human-readable formats like "2 hours" or "1 day".</div></div> <div class="overview-item svelte-1ppq2qw">`);
		Icon($$renderer, { name: 'calendar', size: 'sm' });
		$$renderer.push(`<!----> <div><strong class="svelte-1ppq2qw">Cache Expiry:</strong> Calculate when DNS records will expire from resolver caches.</div></div> <div class="overview-item svelte-1ppq2qw">`);
		Icon($$renderer, { name: 'target', size: 'sm' });
		$$renderer.push(`<!----> <div><strong class="svelte-1ppq2qw">TTL Guidelines:</strong> Get recommendations based on record stability and use case.</div></div></div></div> <div class="card common-ttls-card svelte-1ppq2qw"><details class="common-details svelte-1ppq2qw"><summary class="common-summary svelte-1ppq2qw">`);
		Icon($$renderer, { name: 'chevron-right', size: 'xs' });
		$$renderer.push(`<!----> <h4 class="svelte-1ppq2qw">Common TTL Values</h4></summary> <div class="ttls-grid svelte-1ppq2qw"><!--[-->`);

		const each_array = $.ensure_array_like(commonTTLs);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let ttl = each_array[index];

			$$renderer.push(`<button${$.attr_class(`ttl-card ${activeTTLIndex === index ? 'active' : ''}`, 'svelte-1ppq2qw')}><div class="ttl-value svelte-1ppq2qw">${$.escape(ttl.label)}</div> <div class="ttl-seconds svelte-1ppq2qw">${$.escape(ttl.seconds)}s</div> <div class="ttl-description svelte-1ppq2qw">${$.escape(ttl.description)}</div></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div> <div class="card examples-card svelte-1ppq2qw"><details class="examples-details svelte-1ppq2qw"><summary class="examples-summary svelte-1ppq2qw">`);
		Icon($$renderer, { name: 'chevron-right', size: 'xs' });
		$$renderer.push(`<!----> <h4 class="svelte-1ppq2qw">TTL by Use Case</h4></summary> <div class="examples-grid svelte-1ppq2qw"><!--[-->`);

		const each_array_1 = $.ensure_array_like(examples);

		for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
			let example = each_array_1[index];

			$$renderer.push(`<button${$.attr_class(`example-card ${activeExampleIndex === index ? 'active' : ''}`, 'svelte-1ppq2qw')}><div class="example-scenario svelte-1ppq2qw">${$.escape(example.scenario)}</div> <div class="example-ttl svelte-1ppq2qw">${$.escape(example.ttl)} seconds</div> <div class="example-description svelte-1ppq2qw">${$.escape(example.description)}</div></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div> <div class="card input-card svelte-1ppq2qw"><div class="input-group svelte-1ppq2qw"><label for="ttl-input" class="svelte-1ppq2qw">`);
		Icon($$renderer, { name: 'clock', size: 'sm' });
		$$renderer.push(`<!----> TTL (seconds)</label> <input id="ttl-input" type="number"${$.attr('value', ttlInput)} placeholder="3600" class="ttl-input svelte-1ppq2qw" min="0" max="2147483647"/></div> <div class="input-group svelte-1ppq2qw"><label class="checkbox-label svelte-1ppq2qw"><input type="checkbox" class="styled-checkbox svelte-1ppq2qw"${$.attr('checked', useCustomDate, true)}/> Calculate expiry from custom date/time</label> `);

		if (useCustomDate) {
			$$renderer.push(`<!--[0--><input type="datetime-local"${$.attr('value', customDate)}${$.attr_class(`custom-date-input ${results && !results.customDateValid ? 'invalid' : ''}`, 'svelte-1ppq2qw')}/>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div> `);

		if (results) {
			$$renderer.push(`<!--[0--><div class="card results-card svelte-1ppq2qw"><div class="results-header svelte-1ppq2qw"><h3 class="svelte-1ppq2qw">TTL Analysis</h3> <button${$.attr_class(`copy-button ${clipboard.isCopied() ? 'copied' : ''}`, 'svelte-1ppq2qw')}>`);
			Icon($$renderer, { name: clipboard.isCopied() ? 'check' : 'copy', size: 'sm' });
			$$renderer.push(`<!----> Copy TTL</button></div> <div class="ttl-analysis svelte-1ppq2qw"><div class="ttl-main-info svelte-1ppq2qw"><div class="ttl-human svelte-1ppq2qw"><span class="ttl-human-value svelte-1ppq2qw">${$.escape(results.ttlInfo.human)}</span> <span${$.attr_class(`ttl-category ${$.stringify(results.ttlInfo.category)}`, 'svelte-1ppq2qw')}>${$.escape(results.ttlInfo.category.replace('-', ' '))}</span></div> <div class="ttl-seconds-display svelte-1ppq2qw"><span class="seconds-value svelte-1ppq2qw">${$.escape(formatNumber(results.ttlInfo.seconds))}</span> <span class="seconds-label svelte-1ppq2qw">seconds</span></div></div></div> <div class="expiry-section svelte-1ppq2qw"><h4 class="svelte-1ppq2qw">Cache Expiry Times</h4> <div class="expiry-cards svelte-1ppq2qw"><div class="expiry-card svelte-1ppq2qw"><div class="expiry-label svelte-1ppq2qw">`);
			Icon($$renderer, { name: 'clock', size: 'sm' });
			$$renderer.push(`<!----> From Now</div> <div class="expiry-time svelte-1ppq2qw">${$.escape(formatDateTime(results.expiryFromNow))}</div> <div class="expiry-relative svelte-1ppq2qw">${$.escape(formatRelativeTime(results.expiryFromNow))}</div></div> `);

			if (useCustomDate && results.expiryFromCustom) {
				$$renderer.push(`<!--[0--><div class="expiry-card svelte-1ppq2qw"><div class="expiry-label svelte-1ppq2qw">`);
				Icon($$renderer, { name: 'calendar', size: 'sm' });
				$$renderer.push(`<!----> From Custom Date</div> <div class="expiry-time svelte-1ppq2qw">${$.escape(formatDateTime(results.expiryFromCustom))}</div> <div class="expiry-relative svelte-1ppq2qw">${$.escape(formatRelativeTime(results.expiryFromCustom))}</div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div> <div class="recommendations-section svelte-1ppq2qw"><h4 class="svelte-1ppq2qw">Summary</h4> <ul class="recommendations-list svelte-1ppq2qw"><!--[-->`);

			const each_array_2 = $.ensure_array_like(results.ttlInfo.recommendations);

			for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
				let recommendation = each_array_2[index];

				$$renderer.push(`<li class="recommendation-item svelte-1ppq2qw">${$.escape(recommendation)}</li>`);
			}

			$$renderer.push(`<!--]--></ul></div> <div class="guidelines-section svelte-1ppq2qw"><h4 class="svelte-1ppq2qw">TTL Guidelines by Category</h4> <div class="guidelines-grid svelte-1ppq2qw"><div class="guideline-item svelte-1ppq2qw"><div class="guideline-category very-short svelte-1ppq2qw">Very Short (&lt; 5 min)</div> <div class="guideline-text svelte-1ppq2qw">High DNS load, instant propagation</div></div> <div class="guideline-item svelte-1ppq2qw"><div class="guideline-category short svelte-1ppq2qw">Short (5 min - 1 hr)</div> <div class="guideline-text svelte-1ppq2qw">Frequent changes, good for testing</div></div> <div class="guideline-item svelte-1ppq2qw"><div class="guideline-category medium svelte-1ppq2qw">Medium (1 hr - 1 day)</div> <div class="guideline-text svelte-1ppq2qw">Balanced performance and flexibility</div></div> <div class="guideline-item svelte-1ppq2qw"><div class="guideline-category long svelte-1ppq2qw">Long (1 day - 1 week)</div> <div class="guideline-text svelte-1ppq2qw">Stable records, reduced DNS queries</div></div> <div class="guideline-item svelte-1ppq2qw"><div class="guideline-category very-long svelte-1ppq2qw">Very Long (> 1 week)</div> <div class="guideline-text svelte-1ppq2qw">Infrastructure, rarely changes</div></div></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="education-card svelte-1ppq2qw"><div class="education-grid svelte-1ppq2qw"><div class="education-item info-panel svelte-1ppq2qw"><h4 class="svelte-1ppq2qw">TTL Trade-offs</h4> <p class="svelte-1ppq2qw">Lower TTLs allow faster propagation of DNS changes but increase DNS query load. Higher TTLs reduce DNS traffic
          but slow down change propagation. Balance based on your needs.</p></div> <div class="education-item info-panel svelte-1ppq2qw"><h4 class="svelte-1ppq2qw">Cache Behavior</h4> <p class="svelte-1ppq2qw">DNS resolvers cache records for the TTL duration. Once expired, they must query authoritative servers again.
          Some resolvers may cache slightly longer or shorter than the exact TTL.</p></div> <div class="education-item info-panel svelte-1ppq2qw"><h4 class="svelte-1ppq2qw">Change Planning</h4> <p class="svelte-1ppq2qw">Before making DNS changes, consider lowering TTLs in advance. This reduces the time users see old records.
          After changes stabilize, you can increase TTLs again.</p></div> <div class="education-item info-panel svelte-1ppq2qw"><h4 class="svelte-1ppq2qw">Monitoring Impact</h4> <p class="svelte-1ppq2qw">Monitor DNS query volumes when changing TTLs. Very short TTLs can significantly increase load on authoritative
          servers and may impact DNS provider costs.</p></div></div></div></div>`);
	});
}