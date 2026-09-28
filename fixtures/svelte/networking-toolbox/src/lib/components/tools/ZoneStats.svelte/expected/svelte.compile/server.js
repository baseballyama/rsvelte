import * as $ from 'svelte/internal/server';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import { parseZoneFile, generateZoneStats } from '$lib/utils/zone-parser.js';
import { useClipboard } from '$lib/composables';

export default function ZoneStats($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let zoneInput = '';
		let results = null;
		const clipboard = useClipboard();
		let activeExampleIndex = null;

		const examples = [
			{
				name: 'Simple Zone',
				content: `$ORIGIN example.com.
$TTL 86400
@	IN	SOA	ns1.example.com. admin.example.com. (
		2023010101	; Serial
		10800		; Refresh
		3600		; Retry
		604800		; Expire
		86400 )		; Minimum TTL

	IN	NS	ns1.example.com.
	IN	NS	ns2.example.com.
	IN	MX	10	mail.example.com.

www	300	IN	A	192.0.2.1
mail	IN	A	192.0.2.10
ftp	IN	CNAME	www.example.com.`,
				description: 'Basic zone with common record types'
			},

			{
				name: 'Complex Zone',
				content: `$ORIGIN example.com.
$TTL 3600
@	IN	SOA	ns1.example.com. hostmaster.example.com. 2023010101 10800 3600 604800 86400
	IN	NS	ns1.example.com.
	IN	NS	ns2.example.com.
	IN	NS	ns3.example.com.
	IN	MX	10	mail.example.com.
	IN	TXT	"v=spf1 mx include:_spf.google.com ~all"

www	300	IN	A	192.0.2.1
www	300	IN	AAAA	2001:db8::1
api	300	IN	A	192.0.2.2
cdn	300	IN	A	203.0.113.1
mail	3600	IN	A	192.0.2.10
mail	3600	IN	AAAA	2001:db8::10

_http._tcp	IN	SRV	0 5 80 www.example.com.
_https._tcp	IN	SRV	0 5 443 www.example.com.
_sip._tcp	IN	SRV	10 60 5060 sip.example.com.

blog	IN	CNAME	www.example.com.
shop	IN	CNAME	www.example.com.`,
				description: 'Comprehensive zone with diverse record types and TTLs'
			},

			{
				name: 'Large Organization',
				content: `$ORIGIN bigcorp.com.
$TTL 7200

@	IN	SOA	dns1.bigcorp.com. hostmaster.bigcorp.com. (
		2023010201 21600 3600 1209600 86400 )

; Name servers
	IN	NS	dns1.bigcorp.com.
	IN	NS	dns2.bigcorp.com.
	IN	NS	dns3.bigcorp.com.
	IN	NS	dns4.bigcorp.com.

; Mail servers
	IN	MX	10	mx1.bigcorp.com.
	IN	MX	20	mx2.bigcorp.com.
	IN	MX	30	mx-backup.bigcorp.com.

; Web services
www	300	IN	A	203.0.113.10
www	300	IN	A	203.0.113.11
www	300	IN	A	203.0.113.12
app	300	IN	A	203.0.113.20
api	300	IN	A	203.0.113.30
cdn	60	IN	A	203.0.113.40

; Mail infrastructure
mx1	IN	A	203.0.113.100
mx2	IN	A	203.0.113.101
mx-backup	IN	A	203.0.113.102

; DNS infrastructure
dns1	IN	A	203.0.113.110
dns2	IN	A	203.0.113.111
dns3	IN	A	203.0.113.112
dns4	IN	A	203.0.113.113

; Regional offices
london	IN	A	203.0.113.200
tokyo	IN	A	203.0.113.201
sydney	IN	A	203.0.113.202`,
				description: 'Large organization with multiple services and locations'
			}
		];

		function loadExample(example, index) {
			zoneInput = example.content;
			activeExampleIndex = index;
			analyzeZone();
		}

		function clearActiveIfChanged() {
			if (activeExampleIndex !== null) {
				const activeExample = examples[activeExampleIndex];

				if (!activeExample || zoneInput !== activeExample.content) {
					activeExampleIndex = null;
				}
			}
		}

		function analyzeZone() {
			if (!zoneInput.trim()) {
				results = null;

				return;
			}

			try {
				const parsed = parseZoneFile(zoneInput);

				results = generateZoneStats(parsed);
			} catch(error) {
				console.error('Failed to analyze zone:', error);
				results = null;
			}
		}

		function formatStatsForCopy(stats) {
			const lines = [];

			lines.push(`DNS Zone Statistics Report`);
			lines.push(`========================\n`);
			lines.push(`Total Records: ${stats.totalRecords}\n`);
			lines.push(`Records by Type:`);

			Object.entries(stats.recordsByType).sort(([, a], [, b]) => b - a).forEach(([type, count]) => {
				lines.push(`  ${type}: ${count}`);
			});

			lines.push('');
			lines.push(`TTL Distribution:`);

			Object.entries(stats.ttlDistribution).sort(([a], [b]) => parseInt(a) - parseInt(b)).forEach(([ttl, count]) => {
				lines.push(`  ${ttl}s: ${count} record${count !== 1 ? 's' : ''}`);
			});

			lines.push('');
			lines.push(`Name Statistics:`);
			lines.push(`  Shortest name: ${stats.nameDepths.min} characters`);
			lines.push(`  Longest name: ${stats.nameDepths.max} characters`);
			lines.push(`  Average length: ${stats.nameDepths.average.toFixed(1)} characters`);
			lines.push('');
			lines.push(`Largest Record: ${stats.largestRecord.size} bytes`);
			lines.push(`  ${stats.largestRecord.record.owner} ${stats.largestRecord.record.type}`);
			lines.push('');
			lines.push(`Zone Health:`);
			lines.push(`  Has SOA: ${stats.sanityChecks.hasSoa ? 'Yes' : 'No'}`);
			lines.push(`  Has NS records: ${stats.sanityChecks.hasNs ? 'Yes' : 'No'}`);
			lines.push(`  Duplicate records: ${stats.sanityChecks.duplicates.length}`);
			lines.push(`  Orphaned glue: ${stats.sanityChecks.orphanedGlue.length}`);

			return lines.join('\n');
		}

		function handleInputChange() {
			clearActiveIfChanged();
			analyzeZone();
		}

		function getTTLColor(ttl) {
			if (ttl < 300) return 'var(--color-error)';
			if (ttl < 3600) return 'var(--color-warning)';
			if (ttl < 86400) return 'var(--color-success)';

			return 'var(--color-info)';
		}

		function getTTLLabel(ttl) {
			if (ttl < 300) return 'Very Short';
			if (ttl < 3600) return 'Short';
			if (ttl < 86400) return 'Medium';

			return 'Long';
		}

		$$renderer.push(`<div class="card"><header class="card-header"><h1>DNS Zone Statistics</h1> <p>Analyze zone file structure, record distribution, and configuration health</p></header> <div class="card info-card svelte-1ctj0xd"><div class="overview-content svelte-1ctj0xd"><div class="overview-item svelte-1ctj0xd">`);
		Icon($$renderer, { name: 'bar-chart', size: 'sm' });
		$$renderer.push(`<!----> <div><strong class="svelte-1ctj0xd">Record Analysis:</strong> Count and categorize all DNS records by type and TTL.</div></div> <div class="overview-item svelte-1ctj0xd">`);
		Icon($$renderer, { name: 'ruler', size: 'sm' });
		$$renderer.push(`<!----> <div><strong class="svelte-1ctj0xd">Size Metrics:</strong> Identify largest records and analyze name length distribution.</div></div> <div class="overview-item svelte-1ctj0xd">`);
		Icon($$renderer, { name: 'shield', size: 'sm' });
		$$renderer.push(`<!----> <div><strong class="svelte-1ctj0xd">Health Checks:</strong> Validate zone structure and identify potential issues.</div></div></div></div> <div class="card examples-card svelte-1ctj0xd"><details class="examples-details svelte-1ctj0xd"><summary class="examples-summary svelte-1ctj0xd">`);
		Icon($$renderer, { name: 'chevron-right', size: 'sm' });
		$$renderer.push(`<!----> <h3 class="svelte-1ctj0xd">Zone Analysis Examples</h3></summary> <div class="examples-grid svelte-1ctj0xd"><!--[-->`);

		const each_array = $.ensure_array_like(examples);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let example = each_array[index];

			$$renderer.push(`<button${$.attr_class(`example-card ${activeExampleIndex === index ? 'active' : ''}`, 'svelte-1ctj0xd')}><div class="example-name svelte-1ctj0xd">${$.escape(example.name)}</div> <div class="example-description svelte-1ctj0xd">${$.escape(example.description)}</div></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div> <div class="card input-card svelte-1ctj0xd"><div class="input-group svelte-1ctj0xd"><label for="zone-input" class="svelte-1ctj0xd">`);
		Icon($$renderer, { name: 'file', size: 'sm' });

		$$renderer.push(`<!----> Zone File Content</label> <textarea id="zone-input" placeholder="$ORIGIN example.com.
$TTL 3600
@	IN	SOA	ns1.example.com. admin.example.com. (
		2023010101	; Serial
		10800		; Refresh
		3600		; Retry
		604800		; Expire
		86400 )		; Minimum TTL

	IN	NS	ns1.example.com.
	IN	NS	ns2.example.com.

www	IN	A	192.0.2.1" class="zone-textarea svelte-1ctj0xd" rows="12">`);

		const $$body = $.escape(zoneInput);

		if ($$body) {
			$$renderer.push(`${$$body}`);
		} else {}

		$$renderer.push(`</textarea></div></div> `);

		if (results) {
			$$renderer.push(`<!--[0--><section class="results-section svelte-1ctj0xd"><div class="results-header svelte-1ctj0xd"><h3 class="svelte-1ctj0xd">Zone Analysis Report</h3> <button${$.attr_class(`copy-button ${clipboard.isCopied() ? 'copied' : ''}`, 'svelte-1ctj0xd')}>`);
			Icon($$renderer, { name: clipboard.isCopied() ? 'check' : 'copy', size: 'sm' });
			$$renderer.push(`<!----> ${$.escape(clipboard.isCopied() ? 'Copied!' : 'Copy Report')}</button></div> <div class="results-inner svelte-1ctj0xd"><div class="overview-stats svelte-1ctj0xd"><div class="stat-card primary svelte-1ctj0xd"><div class="stat-icon svelte-1ctj0xd">`);
			Icon($$renderer, { name: 'hash', size: 'lg' });
			$$renderer.push(`<!----></div> <div class="stat-info svelte-1ctj0xd"><div class="stat-value svelte-1ctj0xd">${$.escape(results.totalRecords)}</div> <div class="stat-label svelte-1ctj0xd">Total Records</div></div></div> <div class="stat-card svelte-1ctj0xd"><div class="stat-icon svelte-1ctj0xd">`);
			Icon($$renderer, { name: 'layers', size: 'lg' });
			$$renderer.push(`<!----></div> <div class="stat-info svelte-1ctj0xd"><div class="stat-value svelte-1ctj0xd">${$.escape(Object.keys(results.recordsByType).length)}</div> <div class="stat-label svelte-1ctj0xd">Record Types</div></div></div> <div class="stat-card svelte-1ctj0xd"><div class="stat-icon svelte-1ctj0xd">`);
			Icon($$renderer, { name: 'clock', size: 'lg' });
			$$renderer.push(`<!----></div> <div class="stat-info svelte-1ctj0xd"><div class="stat-value svelte-1ctj0xd">${$.escape(Object.keys(results.ttlDistribution).length)}</div> <div class="stat-label svelte-1ctj0xd">Unique TTLs</div></div></div> <div class="stat-card svelte-1ctj0xd"><div class="stat-icon svelte-1ctj0xd">`);
			Icon($$renderer, { name: 'ruler', size: 'lg' });
			$$renderer.push(`<!----></div> <div class="stat-info svelte-1ctj0xd"><div class="stat-value svelte-1ctj0xd">${$.escape(results.nameDepths.average.toFixed(1))}</div> <div class="stat-label svelte-1ctj0xd">Avg Name Length</div></div></div></div> <div class="chart-card svelte-1ctj0xd"><h4 class="svelte-1ctj0xd">`);
			Icon($$renderer, { name: 'pie', size: 'sm' });
			$$renderer.push(`<!----> Record Type Distribution</h4> <div class="record-types-chart svelte-1ctj0xd"><!--[-->`);

			const each_array_1 = $.ensure_array_like(Object.entries(results.recordsByType).sort(([, a], [, b]) => b - a));

			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let [type, count] = each_array_1[$$index_1];

				$$renderer.push(`<div class="type-row svelte-1ctj0xd"><div class="type-info svelte-1ctj0xd"><span class="type-name svelte-1ctj0xd">${$.escape(type)}</span> <span class="type-count svelte-1ctj0xd">${$.escape(count)} record${$.escape(count !== 1 ? 's' : '')}</span></div> <div class="type-bar-container svelte-1ctj0xd"><div class="type-bar svelte-1ctj0xd"${$.attr_style(`width: ${$.stringify(count / results.totalRecords * 100)}%`)}></div></div> <div class="type-percentage svelte-1ctj0xd">${$.escape((count / results.totalRecords * 100).toFixed(1))}%</div></div>`);
			}

			$$renderer.push(`<!--]--></div></div> <div class="chart-card svelte-1ctj0xd"><h4 class="svelte-1ctj0xd">`);
			Icon($$renderer, { name: 'clock', size: 'sm' });
			$$renderer.push(`<!----> TTL Distribution</h4> <div class="ttl-distribution svelte-1ctj0xd"><!--[-->`);

			const each_array_2 = $.ensure_array_like(Object.entries(results.ttlDistribution).sort(([a], [b]) => parseInt(a) - parseInt(b)));

			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let [ttl, count] = each_array_2[$$index_2];

				$$renderer.push(`<div class="ttl-row svelte-1ctj0xd"><div class="ttl-info svelte-1ctj0xd"><span class="ttl-value svelte-1ctj0xd"${$.attr_style(`color: ${$.stringify(getTTLColor(parseInt(ttl)))}`)}>${$.escape(parseInt(ttl))}s</span> <span class="ttl-label svelte-1ctj0xd">(${$.escape(getTTLLabel(parseInt(ttl)))})</span></div> <div class="ttl-count svelte-1ctj0xd">${$.escape(count)} record${$.escape(count !== 1 ? 's' : '')}</div></div>`);
			}

			$$renderer.push(`<!--]--></div></div> <div class="analysis-card svelte-1ctj0xd"><h4 class="svelte-1ctj0xd">`);
			Icon($$renderer, { name: 'ruler', size: 'sm' });
			$$renderer.push(`<!----> Name Length Analysis</h4> <div class="name-stats svelte-1ctj0xd"><div class="name-stat svelte-1ctj0xd"><div class="name-stat-label svelte-1ctj0xd">Shortest Name</div> <div class="name-stat-value svelte-1ctj0xd">${$.escape(results.nameDepths.min)} chars</div></div> <div class="name-stat svelte-1ctj0xd"><div class="name-stat-label svelte-1ctj0xd">Longest Name</div> <div class="name-stat-value svelte-1ctj0xd">${$.escape(results.nameDepths.max)} chars</div> <div class="name-stat-detail svelte-1ctj0xd">${$.escape(results.longestName.name)}</div></div> <div class="name-stat svelte-1ctj0xd"><div class="name-stat-label svelte-1ctj0xd">Average Length</div> <div class="name-stat-value svelte-1ctj0xd">${$.escape(results.nameDepths.average.toFixed(1))} chars</div></div></div></div> <div class="analysis-card svelte-1ctj0xd"><h4 class="svelte-1ctj0xd">`);
			Icon($$renderer, { name: 'maximize', size: 'sm' });

			$$renderer.push(`<!----> Largest Record</h4> <div class="largest-record svelte-1ctj0xd"><div class="record-size svelte-1ctj0xd">${$.escape(results.largestRecord.size)} bytes</div> <div class="record-details svelte-1ctj0xd"><div class="record-owner svelte-1ctj0xd">${$.escape(results.largestRecord.record.owner)}</div> <div class="record-type-data svelte-1ctj0xd">${$.escape(results.largestRecord.record.type)}
                ${$.escape(results.largestRecord.record.rdata)}</div></div></div></div> <div class="health-card svelte-1ctj0xd"><h4 class="svelte-1ctj0xd">`);

			Icon($$renderer, { name: 'shield', size: 'sm' });
			$$renderer.push(`<!----> Zone Health Checks</h4> <div class="health-checks svelte-1ctj0xd"><div${$.attr_class(`health-check ${results.sanityChecks.hasSoa ? 'pass' : 'fail'}`, 'svelte-1ctj0xd')}>`);

			Icon($$renderer, {
				name: results.sanityChecks.hasSoa ? 'check-circle' : 'x-circle',
				size: 'sm'
			});

			$$renderer.push(`<!----> <span>SOA Record Present</span></div> <div${$.attr_class(`health-check ${results.sanityChecks.hasNs ? 'pass' : 'fail'}`, 'svelte-1ctj0xd')}>`);

			Icon($$renderer, {
				name: results.sanityChecks.hasNs ? 'check-circle' : 'x-circle',
				size: 'sm'
			});

			$$renderer.push(`<!----> <span>NS Records Present</span></div> <div${$.attr_class(`health-check ${results.sanityChecks.duplicates.length === 0 ? 'pass' : 'warn'}`, 'svelte-1ctj0xd')}>`);

			Icon($$renderer, {
				name: results.sanityChecks.duplicates.length === 0 ? 'check-circle' : 'alert-triangle',
				size: 'sm'
			});

			$$renderer.push(`<!----> <span>${$.escape(results.sanityChecks.duplicates.length === 0
				? 'No Duplicate Records'
				: `${results.sanityChecks.duplicates.length} Duplicate Record${results.sanityChecks.duplicates.length !== 1 ? 's' : ''}`)}</span></div> <div${$.attr_class(`health-check ${results.sanityChecks.orphanedGlue.length === 0 ? 'pass' : 'warn'}`, 'svelte-1ctj0xd')}>`);

			Icon($$renderer, {
				name: results.sanityChecks.orphanedGlue.length === 0 ? 'check-circle' : 'alert-triangle',
				size: 'sm'
			});

			$$renderer.push(`<!----> <span>${$.escape(results.sanityChecks.orphanedGlue.length === 0
				? 'No Orphaned Glue Records'
				: `${results.sanityChecks.orphanedGlue.length} Orphaned Glue Record${results.sanityChecks.orphanedGlue.length !== 1 ? 's' : ''}`)}</span></div></div></div></div></section>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="education-card svelte-1ctj0xd"><div class="education-grid svelte-1ctj0xd"><div class="education-item info-panel svelte-1ctj0xd"><h4 class="svelte-1ctj0xd">Zone Statistics</h4> <p class="svelte-1ctj0xd">Zone statistics help understand DNS structure, identify optimization opportunities, and spot potential issues.
          Analyze record distribution, TTL patterns, and naming conventions for better zone management.</p></div> <div class="education-item info-panel svelte-1ctj0xd"><h4 class="svelte-1ctj0xd">TTL Strategy</h4> <p class="svelte-1ctj0xd">TTL distribution reveals caching patterns. Short TTLs enable quick changes but increase DNS load. Long TTLs
          reduce queries but slow propagation. Balance based on change frequency and traffic patterns.</p></div> <div class="education-item info-panel svelte-1ctj0xd"><h4 class="svelte-1ctj0xd">Record Analysis</h4> <p class="svelte-1ctj0xd">Record type distribution shows zone complexity. Heavy A/AAAA records suggest web services, many MX records
          indicate mail infrastructure, and diverse types show comprehensive DNS usage.</p></div> <div class="education-item info-panel svelte-1ctj0xd"><h4 class="svelte-1ctj0xd">Health Monitoring</h4> <p class="svelte-1ctj0xd">Regular zone analysis catches configuration drift, identifies duplicates, and ensures essential records exist.
          Use statistics to track zone growth and optimize DNS performance over time.</p></div></div></div></div>`);
	});
}