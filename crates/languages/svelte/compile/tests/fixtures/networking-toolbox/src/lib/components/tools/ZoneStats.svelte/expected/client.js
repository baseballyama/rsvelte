import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import { parseZoneFile, generateZoneStats } from '$lib/utils/zone-parser.js';
import { useClipboard } from '$lib/composables';

var root = $.from_html(`<button><div class="example-name svelte-1ctj0xd"> </div> <div class="example-description svelte-1ctj0xd"> </div></button>`);
var root_1 = $.from_html(`<div class="type-row svelte-1ctj0xd"><div class="type-info svelte-1ctj0xd"><span class="type-name svelte-1ctj0xd"> </span> <span class="type-count svelte-1ctj0xd"> </span></div> <div class="type-bar-container svelte-1ctj0xd"><div class="type-bar svelte-1ctj0xd"></div></div> <div class="type-percentage svelte-1ctj0xd"> </div></div>`);
var root_2 = $.from_html(`<div class="ttl-row svelte-1ctj0xd"><div class="ttl-info svelte-1ctj0xd"><span class="ttl-value svelte-1ctj0xd"> </span> <span class="ttl-label svelte-1ctj0xd"> </span></div> <div class="ttl-count svelte-1ctj0xd"> </div></div>`);
var root_3 = $.from_html(`<section class="results-section svelte-1ctj0xd"><div class="results-header svelte-1ctj0xd"><h3 class="svelte-1ctj0xd">Zone Analysis Report</h3> <button><!> </button></div> <div class="results-inner svelte-1ctj0xd"><div class="overview-stats svelte-1ctj0xd"><div class="stat-card primary svelte-1ctj0xd"><div class="stat-icon svelte-1ctj0xd"><!></div> <div class="stat-info svelte-1ctj0xd"><div class="stat-value svelte-1ctj0xd"> </div> <div class="stat-label svelte-1ctj0xd">Total Records</div></div></div> <div class="stat-card svelte-1ctj0xd"><div class="stat-icon svelte-1ctj0xd"><!></div> <div class="stat-info svelte-1ctj0xd"><div class="stat-value svelte-1ctj0xd"> </div> <div class="stat-label svelte-1ctj0xd">Record Types</div></div></div> <div class="stat-card svelte-1ctj0xd"><div class="stat-icon svelte-1ctj0xd"><!></div> <div class="stat-info svelte-1ctj0xd"><div class="stat-value svelte-1ctj0xd"> </div> <div class="stat-label svelte-1ctj0xd">Unique TTLs</div></div></div> <div class="stat-card svelte-1ctj0xd"><div class="stat-icon svelte-1ctj0xd"><!></div> <div class="stat-info svelte-1ctj0xd"><div class="stat-value svelte-1ctj0xd"> </div> <div class="stat-label svelte-1ctj0xd">Avg Name Length</div></div></div></div> <div class="chart-card svelte-1ctj0xd"><h4 class="svelte-1ctj0xd"><!> Record Type Distribution</h4> <div class="record-types-chart svelte-1ctj0xd"></div></div> <div class="chart-card svelte-1ctj0xd"><h4 class="svelte-1ctj0xd"><!> TTL Distribution</h4> <div class="ttl-distribution svelte-1ctj0xd"></div></div> <div class="analysis-card svelte-1ctj0xd"><h4 class="svelte-1ctj0xd"><!> Name Length Analysis</h4> <div class="name-stats svelte-1ctj0xd"><div class="name-stat svelte-1ctj0xd"><div class="name-stat-label svelte-1ctj0xd">Shortest Name</div> <div class="name-stat-value svelte-1ctj0xd"> </div></div> <div class="name-stat svelte-1ctj0xd"><div class="name-stat-label svelte-1ctj0xd">Longest Name</div> <div class="name-stat-value svelte-1ctj0xd"> </div> <div class="name-stat-detail svelte-1ctj0xd"> </div></div> <div class="name-stat svelte-1ctj0xd"><div class="name-stat-label svelte-1ctj0xd">Average Length</div> <div class="name-stat-value svelte-1ctj0xd"> </div></div></div></div> <div class="analysis-card svelte-1ctj0xd"><h4 class="svelte-1ctj0xd"><!> Largest Record</h4> <div class="largest-record svelte-1ctj0xd"><div class="record-size svelte-1ctj0xd"> </div> <div class="record-details svelte-1ctj0xd"><div class="record-owner svelte-1ctj0xd"> </div> <div class="record-type-data svelte-1ctj0xd"> </div></div></div></div> <div class="health-card svelte-1ctj0xd"><h4 class="svelte-1ctj0xd"><!> Zone Health Checks</h4> <div class="health-checks svelte-1ctj0xd"><div><!> <span>SOA Record Present</span></div> <div><!> <span>NS Records Present</span></div> <div><!> <span> </span></div> <div><!> <span> </span></div></div></div></div></section>`);

var root_4 = $.from_html(`<div class="card"><header class="card-header"><h1>DNS Zone Statistics</h1> <p>Analyze zone file structure, record distribution, and configuration health</p></header> <div class="card info-card svelte-1ctj0xd"><div class="overview-content svelte-1ctj0xd"><div class="overview-item svelte-1ctj0xd"><!> <div><strong class="svelte-1ctj0xd">Record Analysis:</strong> Count and categorize all DNS records by type and TTL.</div></div> <div class="overview-item svelte-1ctj0xd"><!> <div><strong class="svelte-1ctj0xd">Size Metrics:</strong> Identify largest records and analyze name length distribution.</div></div> <div class="overview-item svelte-1ctj0xd"><!> <div><strong class="svelte-1ctj0xd">Health Checks:</strong> Validate zone structure and identify potential issues.</div></div></div></div> <div class="card examples-card svelte-1ctj0xd"><details class="examples-details svelte-1ctj0xd"><summary class="examples-summary svelte-1ctj0xd"><!> <h3 class="svelte-1ctj0xd">Zone Analysis Examples</h3></summary> <div class="examples-grid svelte-1ctj0xd"></div></details></div> <div class="card input-card svelte-1ctj0xd"><div class="input-group svelte-1ctj0xd"><label for="zone-input" class="svelte-1ctj0xd"><!> Zone File Content</label> <textarea id="zone-input" placeholder="$ORIGIN example.com.
$TTL 3600
@	IN	SOA	ns1.example.com. admin.example.com. (
		2023010101	; Serial
		10800		; Refresh
		3600		; Retry
		604800		; Expire
		86400 )		; Minimum TTL

	IN	NS	ns1.example.com.
	IN	NS	ns2.example.com.

www	IN	A	192.0.2.1" class="zone-textarea svelte-1ctj0xd" rows="12"></textarea></div></div> <!> <div class="education-card svelte-1ctj0xd"><div class="education-grid svelte-1ctj0xd"><div class="education-item info-panel svelte-1ctj0xd"><h4 class="svelte-1ctj0xd">Zone Statistics</h4> <p class="svelte-1ctj0xd">Zone statistics help understand DNS structure, identify optimization opportunities, and spot potential issues.
          Analyze record distribution, TTL patterns, and naming conventions for better zone management.</p></div> <div class="education-item info-panel svelte-1ctj0xd"><h4 class="svelte-1ctj0xd">TTL Strategy</h4> <p class="svelte-1ctj0xd">TTL distribution reveals caching patterns. Short TTLs enable quick changes but increase DNS load. Long TTLs
          reduce queries but slow propagation. Balance based on change frequency and traffic patterns.</p></div> <div class="education-item info-panel svelte-1ctj0xd"><h4 class="svelte-1ctj0xd">Record Analysis</h4> <p class="svelte-1ctj0xd">Record type distribution shows zone complexity. Heavy A/AAAA records suggest web services, many MX records
          indicate mail infrastructure, and diverse types show comprehensive DNS usage.</p></div> <div class="education-item info-panel svelte-1ctj0xd"><h4 class="svelte-1ctj0xd">Health Monitoring</h4> <p class="svelte-1ctj0xd">Regular zone analysis catches configuration drift, identifies duplicates, and ensures essential records exist.
          Use statistics to track zone growth and optimize DNS performance over time.</p></div></div></div></div>`);

export default function ZoneStats($$anchor, $$props) {
	$.push($$props, true);

	let zoneInput = $.state('');
	let results = $.state(null);
	const clipboard = useClipboard();
	let activeExampleIndex = $.state(null);

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
		$.set(zoneInput, example.content, true);
		$.set(activeExampleIndex, index, true);
		analyzeZone();
	}

	function clearActiveIfChanged() {
		if ($.get(activeExampleIndex) !== null) {
			const activeExample = examples[$.get(activeExampleIndex)];

			if (!activeExample || $.get(zoneInput) !== activeExample.content) {
				$.set(activeExampleIndex, null);
			}
		}
	}

	function analyzeZone() {
		if (!$.get(zoneInput).trim()) {
			$.set(results, null);

			return;
		}

		try {
			const parsed = parseZoneFile($.get(zoneInput));

			$.set(results, generateZoneStats(parsed), true);
		} catch(error) {
			console.error('Failed to analyze zone:', error);
			$.set(results, null);
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

	var div = root_4();
	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var node = $.child(div_3);

	Icon(node, { name: 'bar-chart', size: 'sm' });
	$.next(2);
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_1 = $.child(div_4);

	Icon(node_1, { name: 'ruler', size: 'sm' });
	$.next(2);
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_2 = $.child(div_5);

	Icon(node_2, { name: 'shield', size: 'sm' });
	$.next(2);
	$.reset(div_5);
	$.reset(div_2);
	$.reset(div_1);

	var div_6 = $.sibling(div_1, 2);
	var details = $.child(div_6);
	var summary = $.child(details);
	var node_3 = $.child(summary);

	Icon(node_3, { name: 'chevron-right', size: 'sm' });
	$.next(2);
	$.reset(summary);

	var div_7 = $.sibling(summary, 2);

	$.each(div_7, 23, () => examples, (example) => example.name, ($$anchor, example, index) => {
		var button = root();
		var div_8 = $.child(button);
		var text = $.only_child(div_8, true);
		var div_9 = $.sibling(div_8, 2);
		var text_1 = $.only_child(div_9, true);

		$.reset(button);

		$.template_effect(() => {
			$.set_class(button, 1, `example-card ${$.get(activeExampleIndex) === $.get(index) ? 'active' : ''}`, 'svelte-1ctj0xd');
			$.set_text(text, $.get(example).name);
			$.set_text(text_1, $.get(example).description);
		});

		$.delegated('click', button, () => loadExample($.get(example), $.get(index)));
		$.append($$anchor, button);
	});

	$.reset(div_7);
	$.reset(details);
	$.reset(div_6);

	var div_10 = $.sibling(div_6, 2);
	var div_11 = $.child(div_10);
	var label = $.child(div_11);
	var node_4 = $.child(label);

	Icon(node_4, { name: 'file', size: 'sm' });
	$.next();
	$.reset(label);
	$.action(label, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Paste your DNS zone file for comprehensive statistical analysis');

	var textarea = $.sibling(label, 2);

	$.remove_textarea_child(textarea);
	$.reset(div_11);
	$.reset(div_10);

	var node_5 = $.sibling(div_10, 2);

	{
		var consequent = ($$anchor) => {
			var section = root_3();
			var div_12 = $.child(section);
			var button_1 = $.sibling($.child(div_12), 2);
			var node_6 = $.child(button_1);

			{
				let $0 = $.derived(() => clipboard.isCopied() ? 'check' : 'copy');

				Icon(node_6, {
					get name() {
						return $.get($0);
					},
					size: 'sm'
				});
			}

			var text_2 = $.sibling(node_6);

			$.reset(button_1);
			$.reset(div_12);

			var div_13 = $.sibling(div_12, 2);
			var div_14 = $.child(div_13);
			var div_15 = $.child(div_14);
			var div_16 = $.child(div_15);
			var node_7 = $.child(div_16);

			Icon(node_7, { name: 'hash', size: 'lg' });
			$.reset(div_16);

			var div_17 = $.sibling(div_16, 2);
			var div_18 = $.child(div_17);
			var text_3 = $.only_child(div_18, true);

			$.next(2);
			$.reset(div_17);
			$.reset(div_15);

			var div_19 = $.sibling(div_15, 2);
			var div_20 = $.child(div_19);
			var node_8 = $.child(div_20);

			Icon(node_8, { name: 'layers', size: 'lg' });
			$.reset(div_20);

			var div_21 = $.sibling(div_20, 2);
			var div_22 = $.child(div_21);
			var text_4 = $.only_child(div_22, true);

			$.next(2);
			$.reset(div_21);
			$.reset(div_19);

			var div_23 = $.sibling(div_19, 2);
			var div_24 = $.child(div_23);
			var node_9 = $.child(div_24);

			Icon(node_9, { name: 'clock', size: 'lg' });
			$.reset(div_24);

			var div_25 = $.sibling(div_24, 2);
			var div_26 = $.child(div_25);
			var text_5 = $.only_child(div_26, true);

			$.next(2);
			$.reset(div_25);
			$.reset(div_23);

			var div_27 = $.sibling(div_23, 2);
			var div_28 = $.child(div_27);
			var node_10 = $.child(div_28);

			Icon(node_10, { name: 'ruler', size: 'lg' });
			$.reset(div_28);

			var div_29 = $.sibling(div_28, 2);
			var div_30 = $.child(div_29);
			var text_6 = $.only_child(div_30, true);

			$.next(2);
			$.reset(div_29);
			$.reset(div_27);
			$.reset(div_14);

			var div_31 = $.sibling(div_14, 2);
			var h4 = $.child(div_31);
			var node_11 = $.child(h4);

			Icon(node_11, { name: 'pie', size: 'sm' });
			$.next();
			$.reset(h4);

			var div_32 = $.sibling(h4, 2);

			$.each(div_32, 21, () => Object.entries($.get(results).recordsByType).sort(([, a], [, b]) => b - a), ([type, count]) => type, ($$anchor, $$item) => {
				var $$array = $.derived(() => $.to_array($.get($$item), 2));
				let type = () => $.get($$array)[0];
				let count = () => $.get($$array)[1];
				var div_33 = root_1();
				var div_34 = $.child(div_33);
				var span = $.child(div_34);
				var text_7 = $.only_child(span, true);
				var span_1 = $.sibling(span, 2);
				var text_8 = $.only_child(span_1);

				$.reset(div_34);

				var div_35 = $.sibling(div_34, 2);
				var div_36 = $.only_child(div_35);
				var div_37 = $.sibling(div_35, 2);
				var text_9 = $.only_child(div_37);

				$.reset(div_33);

				$.template_effect(
					($0) => {
						$.set_text(text_7, type());
						$.set_text(text_8, `${count() ?? ''} record${count() !== 1 ? 's' : ''}`);
						$.set_style(div_36, `width: ${count() / $.get(results).totalRecords * 100}%`);
						$.set_text(text_9, `${$0 ?? ''}%`);
					},
					[
						() => (count() / $.get(results).totalRecords * 100).toFixed(1)
					]
				);

				$.append($$anchor, div_33);
			});

			$.reset(div_32);
			$.reset(div_31);

			var div_38 = $.sibling(div_31, 2);
			var h4_1 = $.child(div_38);
			var node_12 = $.child(h4_1);

			Icon(node_12, { name: 'clock', size: 'sm' });
			$.next();
			$.reset(h4_1);

			var div_39 = $.sibling(h4_1, 2);

			$.each(div_39, 21, () => Object.entries($.get(results).ttlDistribution).sort(([a], [b]) => parseInt(a) - parseInt(b)), ([ttl, count]) => ttl, ($$anchor, $$item) => {
				var $$array_1 = $.derived(() => $.to_array($.get($$item), 2));
				let ttl = () => $.get($$array_1)[0];
				let count = () => $.get($$array_1)[1];
				var div_40 = root_2();
				var div_41 = $.child(div_40);
				var span_2 = $.child(div_41);
				var text_10 = $.only_child(span_2);
				var span_3 = $.sibling(span_2, 2);
				var text_11 = $.only_child(span_3);

				$.reset(div_41);

				var div_42 = $.sibling(div_41, 2);
				var text_12 = $.only_child(div_42);

				$.reset(div_40);

				$.template_effect(
					($0, $1, $2) => {
						$.set_style(span_2, `color: ${$0 ?? ''}`);
						$.set_text(text_10, `${$1 ?? ''}s`);
						$.set_text(text_11, `(${$2 ?? ''})`);
						$.set_text(text_12, `${count() ?? ''} record${count() !== 1 ? 's' : ''}`);
					},
					[
						() => getTTLColor(parseInt(ttl())),
						() => parseInt(ttl()),
						() => getTTLLabel(parseInt(ttl()))
					]
				);

				$.append($$anchor, div_40);
			});

			$.reset(div_39);
			$.reset(div_38);

			var div_43 = $.sibling(div_38, 2);
			var h4_2 = $.child(div_43);
			var node_13 = $.child(h4_2);

			Icon(node_13, { name: 'ruler', size: 'sm' });
			$.next();
			$.reset(h4_2);

			var div_44 = $.sibling(h4_2, 2);
			var div_45 = $.child(div_44);
			var div_46 = $.sibling($.child(div_45), 2);
			var text_13 = $.only_child(div_46);

			$.reset(div_45);

			var div_47 = $.sibling(div_45, 2);
			var div_48 = $.sibling($.child(div_47), 2);
			var text_14 = $.only_child(div_48);
			var div_49 = $.sibling(div_48, 2);
			var text_15 = $.only_child(div_49, true);

			$.reset(div_47);

			var div_50 = $.sibling(div_47, 2);
			var div_51 = $.sibling($.child(div_50), 2);
			var text_16 = $.only_child(div_51);

			$.reset(div_50);
			$.reset(div_44);
			$.reset(div_43);

			var div_52 = $.sibling(div_43, 2);
			var h4_3 = $.child(div_52);
			var node_14 = $.child(h4_3);

			Icon(node_14, { name: 'maximize', size: 'sm' });
			$.next();
			$.reset(h4_3);

			var div_53 = $.sibling(h4_3, 2);
			var div_54 = $.child(div_53);
			var text_17 = $.only_child(div_54);
			var div_55 = $.sibling(div_54, 2);
			var div_56 = $.child(div_55);
			var text_18 = $.only_child(div_56, true);
			var div_57 = $.sibling(div_56, 2);
			var text_19 = $.only_child(div_57);

			$.reset(div_55);
			$.reset(div_53);
			$.reset(div_52);

			var div_58 = $.sibling(div_52, 2);
			var h4_4 = $.child(div_58);
			var node_15 = $.child(h4_4);

			Icon(node_15, { name: 'shield', size: 'sm' });
			$.next();
			$.reset(h4_4);

			var div_59 = $.sibling(h4_4, 2);
			var div_60 = $.child(div_59);
			var node_16 = $.child(div_60);

			{
				let $0 = $.derived(() => $.get(results).sanityChecks.hasSoa ? 'check-circle' : 'x-circle');

				Icon(node_16, {
					get name() {
						return $.get($0);
					},
					size: 'sm'
				});
			}

			$.next(2);
			$.reset(div_60);

			var div_61 = $.sibling(div_60, 2);
			var node_17 = $.child(div_61);

			{
				let $0 = $.derived(() => $.get(results).sanityChecks.hasNs ? 'check-circle' : 'x-circle');

				Icon(node_17, {
					get name() {
						return $.get($0);
					},
					size: 'sm'
				});
			}

			$.next(2);
			$.reset(div_61);

			var div_62 = $.sibling(div_61, 2);
			var node_18 = $.child(div_62);

			{
				let $0 = $.derived(() => $.get(results).sanityChecks.duplicates.length === 0 ? 'check-circle' : 'alert-triangle');

				Icon(node_18, {
					get name() {
						return $.get($0);
					},
					size: 'sm'
				});
			}

			var span_4 = $.sibling(node_18, 2);
			var text_20 = $.only_child(span_4, true);

			$.reset(div_62);

			var div_63 = $.sibling(div_62, 2);
			var node_19 = $.child(div_63);

			{
				let $0 = $.derived(() => $.get(results).sanityChecks.orphanedGlue.length === 0 ? 'check-circle' : 'alert-triangle');

				Icon(node_19, {
					get name() {
						return $.get($0);
					},
					size: 'sm'
				});
			}

			var span_5 = $.sibling(node_19, 2);
			var text_21 = $.only_child(span_5, true);

			$.reset(div_63);
			$.reset(div_59);
			$.reset(div_58);
			$.reset(div_13);
			$.reset(section);

			$.template_effect(
				($0, $1, $2, $3, $4, $5) => {
					$.set_class(button_1, 1, `copy-button ${$0 ?? ''}`, 'svelte-1ctj0xd');
					$.set_text(text_2, ` ${$1 ?? ''}`);
					$.set_text(text_3, $.get(results).totalRecords);
					$.set_text(text_4, $2);
					$.set_text(text_5, $3);
					$.set_text(text_6, $4);
					$.set_text(text_13, `${$.get(results).nameDepths.min ?? ''} chars`);
					$.set_text(text_14, `${$.get(results).nameDepths.max ?? ''} chars`);
					$.set_text(text_15, $.get(results).longestName.name);
					$.set_text(text_16, `${$5 ?? ''} chars`);
					$.set_text(text_17, `${$.get(results).largestRecord.size ?? ''} bytes`);
					$.set_text(text_18, $.get(results).largestRecord.record.owner);

					$.set_text(text_19, `${$.get(results).largestRecord.record.type ?? ''}
                ${$.get(results).largestRecord.record.rdata ?? ''}`);

					$.set_class(div_60, 1, `health-check ${$.get(results).sanityChecks.hasSoa ? 'pass' : 'fail'}`, 'svelte-1ctj0xd');
					$.set_class(div_61, 1, `health-check ${$.get(results).sanityChecks.hasNs ? 'pass' : 'fail'}`, 'svelte-1ctj0xd');
					$.set_class(div_62, 1, `health-check ${$.get(results).sanityChecks.duplicates.length === 0 ? 'pass' : 'warn'}`, 'svelte-1ctj0xd');

					$.set_text(text_20, $.get(results).sanityChecks.duplicates.length === 0
						? 'No Duplicate Records'
						: `${$.get(results).sanityChecks.duplicates.length} Duplicate Record${$.get(results).sanityChecks.duplicates.length !== 1 ? 's' : ''}`);

					$.set_class(div_63, 1, `health-check ${$.get(results).sanityChecks.orphanedGlue.length === 0 ? 'pass' : 'warn'}`, 'svelte-1ctj0xd');

					$.set_text(text_21, $.get(results).sanityChecks.orphanedGlue.length === 0
						? 'No Orphaned Glue Records'
						: `${$.get(results).sanityChecks.orphanedGlue.length} Orphaned Glue Record${$.get(results).sanityChecks.orphanedGlue.length !== 1 ? 's' : ''}`);
				},
				[
					() => clipboard.isCopied() ? 'copied' : '',
					() => clipboard.isCopied() ? 'Copied!' : 'Copy Report',
					() => Object.keys($.get(results).recordsByType).length,
					() => Object.keys($.get(results).ttlDistribution).length,
					() => $.get(results).nameDepths.average.toFixed(1),
					() => $.get(results).nameDepths.average.toFixed(1)
				]
			);

			$.delegated('click', button_1, () => $.get(results) && clipboard.copy(formatStatsForCopy($.get(results))));
			$.append($$anchor, section);
		};

		$.if(node_5, ($$render) => {
			if ($.get(results)) $$render(consequent);
		});
	}

	$.next(2);
	$.reset(div);
	$.delegated('input', textarea, handleInputChange);
	$.bind_value(textarea, () => $.get(zoneInput), ($$value) => $.set(zoneInput, $$value));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'input']);