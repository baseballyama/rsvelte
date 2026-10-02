import * as $ from 'svelte/internal/server';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import { parseZoneFile, normalizeZone, formatZoneFile } from '$lib/utils/zone-parser.js';
import { useClipboard } from '$lib/composables';

export default function ZoneLinter($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let zoneInput = '';
		let results = null;
		const clipboard = useClipboard();
		let activeExampleIndex = null;

		const examples = [
			{
				name: 'Basic Zone',
				content: `$ORIGIN example.com.
$TTL 3600
@	IN	SOA	ns1.example.com. admin.example.com. (
		2023010101	; Serial
		3600		; Refresh
		1800		; Retry
		1209600		; Expire
		86400 )		; Minimum TTL

	IN	NS	ns1.example.com.
	IN	NS	ns2.example.com.

www	IN	A	192.0.2.1
mail	IN	A	192.0.2.10
	IN	MX	10 mail.example.com.`,
				description: 'Standard zone with SOA, NS, A, and MX records'
			},

			{
				name: 'Messy Zone',
				content: `example.com.	3600	IN	SOA	ns1.example.com. admin.example.com. 2023010101 3600 1800 1209600 86400
www.example.com.	300	IN	A	192.0.2.1
www.example.com.	300	IN	A	192.0.2.1
mail.example.com.	IN	A	192.0.2.10
example.com.	IN	MX	10	mail.example.com.
example.com.		IN	NS	ns1.example.com.
example.com.	IN	NS	ns2.example.com.`,
				description: 'Unorganized zone with duplicates and inconsistent formatting'
			},

			{
				name: 'Complex Zone',
				content: `$ORIGIN example.com.
$TTL 86400

@	IN	SOA	ns1.example.com. hostmaster.example.com. (
		2023010101 10800 3600 604800 86400 )

	IN	NS	ns1.example.com.
	IN	NS	ns2.example.com.
	IN	MX	10	mail.example.com.
	IN	TXT	"v=spf1 mx ~all"

www	300	IN	A	192.0.2.1
	300	IN	AAAA	2001:db8::1
ftp	IN	CNAME	www.example.com.
mail	IN	A	192.0.2.10
	IN	AAAA	2001:db8::10

_http._tcp	IN	SRV	0 5 80 www.example.com.
_https._tcp	IN	SRV	0 5 443 www.example.com.`,
				description: 'Comprehensive zone with multiple record types'
			}
		];

		function loadExample(example, index) {
			zoneInput = example.content;
			activeExampleIndex = index;
			lintZone();
		}

		function clearActiveIfChanged() {
			if (activeExampleIndex !== null) {
				const activeExample = examples[activeExampleIndex];

				if (!activeExample || zoneInput !== activeExample.content) {
					activeExampleIndex = null;
				}
			}
		}

		function lintZone() {
			if (!zoneInput.trim()) {
				results = null;

				return;
			}

			try {
				const parsed = parseZoneFile(zoneInput);
				const normalized = normalizeZone(parsed);
				const formattedZone = formatZoneFile(normalized);

				results = { normalized, formattedZone };
			} catch(error) {
				console.error('Failed to parse zone:', error);
				results = null;
			}
		}

		function copyZone() {
			if (!results) return;

			clipboard.copy(results.formattedZone);
		}

		function handleInputChange() {
			clearActiveIfChanged();
			lintZone();
		}

		function downloadZone() {
			if (!results) return;

			const blob = new Blob([results.formattedZone], { type: 'text/plain' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');

			a.href = url;
			a.download = 'normalized-zone.txt';
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		}

		$$renderer.push(`<div class="card"><header class="card-header"><h1>DNS Zone Linter</h1> <p>Normalize and canonicalize BIND zone files with error checking and formatting</p></header> <div class="card info-card svelte-1o1sghw"><div class="overview-content svelte-1o1sghw"><div class="overview-item svelte-1o1sghw">`);
		Icon($$renderer, { name: 'check-circle', size: 'sm' });
		$$renderer.push(`<!----> <div><strong class="svelte-1o1sghw">Normalization:</strong> Sort records, remove duplicates, and apply consistent formatting.</div></div> <div class="overview-item svelte-1o1sghw">`);
		Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
		$$renderer.push(`<!----> <div><strong class="svelte-1o1sghw">Error Detection:</strong> Identify syntax errors, missing records, and configuration issues.</div></div> <div class="overview-item svelte-1o1sghw">`);
		Icon($$renderer, { name: 'layout', size: 'sm' });
		$$renderer.push(`<!----> <div><strong class="svelte-1o1sghw">Canonicalization:</strong> Apply standard ordering and TTL defaults for clean output.</div></div></div></div> <div class="card examples-card svelte-1o1sghw"><details class="examples-details svelte-1o1sghw"><summary class="examples-summary svelte-1o1sghw">`);
		Icon($$renderer, { name: 'chevron-right', size: 'sm' });
		$$renderer.push(`<!----> <h3 class="svelte-1o1sghw">Zone File Examples</h3></summary> <div class="examples-grid svelte-1o1sghw"><!--[-->`);

		const each_array = $.ensure_array_like(examples);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let example = each_array[index];

			$$renderer.push(`<button${$.attr_class(`example-card ${activeExampleIndex === index ? 'active' : ''}`, 'svelte-1o1sghw')}><div class="example-name svelte-1o1sghw">${$.escape(example.name)}</div> <div class="example-description svelte-1o1sghw">${$.escape(example.description)}</div></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div> <div class="card input-card svelte-1o1sghw"><div class="input-group svelte-1o1sghw"><label for="zone-input" class="svelte-1o1sghw">`);
		Icon($$renderer, { name: 'file', size: 'sm' });

		$$renderer.push(`<!----> Zone File Content</label> <textarea id="zone-input" placeholder="$ORIGIN example.com.
$TTL 3600
@	IN	SOA	ns1.example.com. admin.example.com. (
		2023010101	; Serial
		3600		; Refresh
		1800		; Retry
		1209600		; Expire
		86400 )		; Minimum TTL

	IN	NS	ns1.example.com.
	IN	NS	ns2.example.com.

www	IN	A	192.0.2.1" class="zone-textarea svelte-1o1sghw" rows="12">`);

		const $$body = $.escape(zoneInput);

		if ($$body) {
			$$renderer.push(`${$$body}`);
		} else {}

		$$renderer.push(`</textarea></div></div> `);

		if (results) {
			$$renderer.push(`<!--[0--><section class="results-section svelte-1o1sghw"><h3 class="svelte-1o1sghw">Linting Results</h3> <div class="results-inner svelte-1o1sghw">`);

			if (results.normalized.errors.length > 0 || results.normalized.warnings.length > 0) {
				$$renderer.push(`<!--[0--><div class="issues-card svelte-1o1sghw"><h4 class="svelte-1o1sghw">`);
				Icon($$renderer, { name: 'alert-circle', size: 'sm' });
				$$renderer.push(`<!----> Issues Found</h4> `);

				if (results.normalized.errors.length > 0) {
					$$renderer.push(`<!--[0--><div class="error-list svelte-1o1sghw"><h5 class="svelte-1o1sghw">Errors (${$.escape(results.normalized.errors.length)})</h5> <!--[-->`);

					const each_array_1 = $.ensure_array_like(results.normalized.errors);

					for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
						let error = each_array_1[index];

						$$renderer.push(`<div class="issue-item error svelte-1o1sghw">`);
						Icon($$renderer, { name: 'x-circle', size: 'sm' });
						$$renderer.push(`<!----> <div><span class="issue-line svelte-1o1sghw">Line ${$.escape(error.line)}:</span> ${$.escape(error.message)}</div></div>`);
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (results.normalized.warnings.length > 0) {
					$$renderer.push(`<!--[0--><div class="warning-list svelte-1o1sghw"><h5 class="svelte-1o1sghw">Warnings (${$.escape(results.normalized.warnings.length)})</h5> <!--[-->`);

					const each_array_2 = $.ensure_array_like(results.normalized.warnings);

					for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
						let warning = each_array_2[index];

						$$renderer.push(`<div class="issue-item warning svelte-1o1sghw">`);
						Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
						$$renderer.push(`<!----> <div><span class="issue-line svelte-1o1sghw">Line ${$.escape(warning.line || 'General')}:</span> ${$.escape(warning.message)}</div></div>`);
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div class="summary-card svelte-1o1sghw"><h4 class="svelte-1o1sghw">`);
			Icon($$renderer, { name: 'info', size: 'sm' });
			$$renderer.push(`<!----> Zone Summary</h4> <div class="summary-stats svelte-1o1sghw"><div class="stat-item svelte-1o1sghw"><div class="stat-label svelte-1o1sghw">Total Records</div> <div class="stat-value svelte-1o1sghw">${$.escape(results.normalized.records.length)}</div></div> <div class="stat-item svelte-1o1sghw"><div class="stat-label svelte-1o1sghw">Origin</div> <div class="stat-value svelte-1o1sghw">${$.escape(results.normalized.origin || 'Not specified')}</div></div> <div class="stat-item svelte-1o1sghw"><div class="stat-label svelte-1o1sghw">Default TTL</div> <div class="stat-value svelte-1o1sghw">${$.escape(results.normalized.defaultTTL || 'Not specified')}</div></div> <div class="stat-item svelte-1o1sghw"><div class="stat-label svelte-1o1sghw">Has SOA</div> <div${$.attr_class(`stat-value ${results.normalized.soa ? 'success' : 'error'}`, 'svelte-1o1sghw')}>${$.escape(results.normalized.soa ? 'Yes' : 'No')}</div></div></div></div> <div class="output-card svelte-1o1sghw"><div class="output-header svelte-1o1sghw"><h4 class="svelte-1o1sghw">`);
			Icon($$renderer, { name: 'file', size: 'sm' });
			$$renderer.push(`<!----> Normalized Zone File</h4> <div class="output-actions svelte-1o1sghw"><button${$.attr_class(`copy-button ${clipboard.isCopied() ? 'copied' : ''}`, 'svelte-1o1sghw')}>`);
			Icon($$renderer, { name: clipboard.isCopied() ? 'check' : 'copy', size: 'sm' });
			$$renderer.push(`<!----> ${$.escape(clipboard.isCopied() ? 'Copied!' : 'Copy')}</button> <button class="download-button svelte-1o1sghw">`);
			Icon($$renderer, { name: 'download', size: 'sm' });
			$$renderer.push(`<!----> Download</button></div></div> <div class="code-output svelte-1o1sghw"><pre class="svelte-1o1sghw">${$.escape(results.formattedZone)}</pre></div></div></div></section>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="education-card svelte-1o1sghw"><div class="education-grid svelte-1o1sghw"><div class="education-item info-panel svelte-1o1sghw"><h4 class="svelte-1o1sghw">Zone File Format</h4> <p class="svelte-1o1sghw">BIND zone files define DNS records for a domain. They include resource records (RRs) with owner names, TTL
          values, classes, types, and data. Proper formatting ensures reliable DNS operation.</p></div> <div class="education-item info-panel svelte-1o1sghw"><h4 class="svelte-1o1sghw">Normalization Benefits</h4> <p class="svelte-1o1sghw">Normalizing zone files improves readability, reduces errors, and ensures consistent formatting. It also helps
          identify duplicate records and missing essential records like SOA and NS.</p></div> <div class="education-item info-panel svelte-1o1sghw"><h4 class="svelte-1o1sghw">Common Issues</h4> <p class="svelte-1o1sghw">Watch for missing trailing dots in FQDNs, duplicate records, incorrect TTL values, and missing SOA or NS
          records. The linter helps catch these configuration problems early.</p></div> <div class="education-item info-panel svelte-1o1sghw"><h4 class="svelte-1o1sghw">Best Practices</h4> <p class="svelte-1o1sghw">Use consistent TTL values, maintain proper record ordering, include comprehensive NS records, and regularly
          validate your zones. Consider using shorter TTLs during transitions.</p></div></div></div></div>`);
	});
}