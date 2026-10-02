import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import { parseZoneFile, normalizeZone, formatZoneFile } from '$lib/utils/zone-parser.js';
import { useClipboard } from '$lib/composables';

var root = $.from_html(`<button><div class="example-name svelte-1o1sghw"> </div> <div class="example-description svelte-1o1sghw"> </div></button>`);
var root_1 = $.from_html(`<div class="issue-item error svelte-1o1sghw"><!> <div><span class="issue-line svelte-1o1sghw"> </span> </div></div>`);
var root_2 = $.from_html(`<div class="error-list svelte-1o1sghw"><h5 class="svelte-1o1sghw"> </h5> <!></div>`);
var root_3 = $.from_html(`<div class="issue-item warning svelte-1o1sghw"><!> <div><span class="issue-line svelte-1o1sghw"> </span> </div></div>`);
var root_4 = $.from_html(`<div class="warning-list svelte-1o1sghw"><h5 class="svelte-1o1sghw"> </h5> <!></div>`);
var root_5 = $.from_html(`<div class="issues-card svelte-1o1sghw"><h4 class="svelte-1o1sghw"><!> Issues Found</h4> <!> <!></div>`);
var root_6 = $.from_html(`<section class="results-section svelte-1o1sghw"><h3 class="svelte-1o1sghw">Linting Results</h3> <div class="results-inner svelte-1o1sghw"><!> <div class="summary-card svelte-1o1sghw"><h4 class="svelte-1o1sghw"><!> Zone Summary</h4> <div class="summary-stats svelte-1o1sghw"><div class="stat-item svelte-1o1sghw"><div class="stat-label svelte-1o1sghw">Total Records</div> <div class="stat-value svelte-1o1sghw"> </div></div> <div class="stat-item svelte-1o1sghw"><div class="stat-label svelte-1o1sghw">Origin</div> <div class="stat-value svelte-1o1sghw"> </div></div> <div class="stat-item svelte-1o1sghw"><div class="stat-label svelte-1o1sghw">Default TTL</div> <div class="stat-value svelte-1o1sghw"> </div></div> <div class="stat-item svelte-1o1sghw"><div class="stat-label svelte-1o1sghw">Has SOA</div> <div> </div></div></div></div> <div class="output-card svelte-1o1sghw"><div class="output-header svelte-1o1sghw"><h4 class="svelte-1o1sghw"><!> Normalized Zone File</h4> <div class="output-actions svelte-1o1sghw"><button><!> </button> <button class="download-button svelte-1o1sghw"><!> Download</button></div></div> <div class="code-output svelte-1o1sghw"><pre class="svelte-1o1sghw"> </pre></div></div></div></section>`);

var root_7 = $.from_html(`<div class="card"><header class="card-header"><h1>DNS Zone Linter</h1> <p>Normalize and canonicalize BIND zone files with error checking and formatting</p></header> <div class="card info-card svelte-1o1sghw"><div class="overview-content svelte-1o1sghw"><div class="overview-item svelte-1o1sghw"><!> <div><strong class="svelte-1o1sghw">Normalization:</strong> Sort records, remove duplicates, and apply consistent formatting.</div></div> <div class="overview-item svelte-1o1sghw"><!> <div><strong class="svelte-1o1sghw">Error Detection:</strong> Identify syntax errors, missing records, and configuration issues.</div></div> <div class="overview-item svelte-1o1sghw"><!> <div><strong class="svelte-1o1sghw">Canonicalization:</strong> Apply standard ordering and TTL defaults for clean output.</div></div></div></div> <div class="card examples-card svelte-1o1sghw"><details class="examples-details svelte-1o1sghw"><summary class="examples-summary svelte-1o1sghw"><!> <h3 class="svelte-1o1sghw">Zone File Examples</h3></summary> <div class="examples-grid svelte-1o1sghw"></div></details></div> <div class="card input-card svelte-1o1sghw"><div class="input-group svelte-1o1sghw"><label for="zone-input" class="svelte-1o1sghw"><!> Zone File Content</label> <textarea id="zone-input" placeholder="$ORIGIN example.com.
$TTL 3600
@	IN	SOA	ns1.example.com. admin.example.com. (
		2023010101	; Serial
		3600		; Refresh
		1800		; Retry
		1209600		; Expire
		86400 )		; Minimum TTL

	IN	NS	ns1.example.com.
	IN	NS	ns2.example.com.

www	IN	A	192.0.2.1" class="zone-textarea svelte-1o1sghw" rows="12"></textarea></div></div> <!> <div class="education-card svelte-1o1sghw"><div class="education-grid svelte-1o1sghw"><div class="education-item info-panel svelte-1o1sghw"><h4 class="svelte-1o1sghw">Zone File Format</h4> <p class="svelte-1o1sghw">BIND zone files define DNS records for a domain. They include resource records (RRs) with owner names, TTL
          values, classes, types, and data. Proper formatting ensures reliable DNS operation.</p></div> <div class="education-item info-panel svelte-1o1sghw"><h4 class="svelte-1o1sghw">Normalization Benefits</h4> <p class="svelte-1o1sghw">Normalizing zone files improves readability, reduces errors, and ensures consistent formatting. It also helps
          identify duplicate records and missing essential records like SOA and NS.</p></div> <div class="education-item info-panel svelte-1o1sghw"><h4 class="svelte-1o1sghw">Common Issues</h4> <p class="svelte-1o1sghw">Watch for missing trailing dots in FQDNs, duplicate records, incorrect TTL values, and missing SOA or NS
          records. The linter helps catch these configuration problems early.</p></div> <div class="education-item info-panel svelte-1o1sghw"><h4 class="svelte-1o1sghw">Best Practices</h4> <p class="svelte-1o1sghw">Use consistent TTL values, maintain proper record ordering, include comprehensive NS records, and regularly
          validate your zones. Consider using shorter TTLs during transitions.</p></div></div></div></div>`);

export default function ZoneLinter($$anchor, $$props) {
	$.push($$props, true);

	let zoneInput = $.state('');
	let results = $.state(null);
	const clipboard = useClipboard();
	let activeExampleIndex = $.state(null);

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
		$.set(zoneInput, example.content, true);
		$.set(activeExampleIndex, index, true);
		lintZone();
	}

	function clearActiveIfChanged() {
		if ($.get(activeExampleIndex) !== null) {
			const activeExample = examples[$.get(activeExampleIndex)];

			if (!activeExample || $.get(zoneInput) !== activeExample.content) {
				$.set(activeExampleIndex, null);
			}
		}
	}

	function lintZone() {
		if (!$.get(zoneInput).trim()) {
			$.set(results, null);

			return;
		}

		try {
			const parsed = parseZoneFile($.get(zoneInput));
			const normalized = normalizeZone(parsed);
			const formattedZone = formatZoneFile(normalized);

			$.set(results, { normalized, formattedZone }, true);
		} catch(error) {
			console.error('Failed to parse zone:', error);
			$.set(results, null);
		}
	}

	function copyZone() {
		if (!$.get(results)) return;

		clipboard.copy($.get(results).formattedZone);
	}

	function handleInputChange() {
		clearActiveIfChanged();
		lintZone();
	}

	function downloadZone() {
		if (!$.get(results)) return;

		const blob = new Blob([$.get(results).formattedZone], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');

		a.href = url;
		a.download = 'normalized-zone.txt';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	var div = root_7();
	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var node = $.child(div_3);

	Icon(node, { name: 'check-circle', size: 'sm' });
	$.next(2);
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_1 = $.child(div_4);

	Icon(node_1, { name: 'alert-triangle', size: 'sm' });
	$.next(2);
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_2 = $.child(div_5);

	Icon(node_2, { name: 'layout', size: 'sm' });
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
			$.set_class(button, 1, `example-card ${$.get(activeExampleIndex) === $.get(index) ? 'active' : ''}`, 'svelte-1o1sghw');
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
	$.action(label, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Paste your BIND zone file content here for analysis and normalization');

	var textarea = $.sibling(label, 2);

	$.remove_textarea_child(textarea);
	$.reset(div_11);
	$.reset(div_10);

	var node_5 = $.sibling(div_10, 2);

	{
		var consequent_3 = ($$anchor) => {
			var section = root_6();
			var div_12 = $.sibling($.child(section), 2);
			var node_6 = $.child(div_12);

			{
				var consequent_2 = ($$anchor) => {
					var div_13 = root_5();
					var h4 = $.child(div_13);
					var node_7 = $.child(h4);

					Icon(node_7, { name: 'alert-circle', size: 'sm' });
					$.next();
					$.reset(h4);

					var node_8 = $.sibling(h4, 2);

					{
						var consequent = ($$anchor) => {
							var div_14 = root_2();
							var h5 = $.child(div_14);
							var text_2 = $.only_child(h5);
							var node_9 = $.sibling(h5, 2);

							$.each(node_9, 17, () => $.get(results).normalized.errors, $.index, ($$anchor, error) => {
								var div_15 = root_1();
								var node_10 = $.child(div_15);

								Icon(node_10, { name: 'x-circle', size: 'sm' });

								var div_16 = $.sibling(node_10, 2);
								var span = $.child(div_16);
								var text_3 = $.only_child(span);
								var text_4 = $.sibling(span);

								$.reset(div_16);
								$.reset(div_15);

								$.template_effect(() => {
									$.set_text(text_3, `Line ${$.get(error).line ?? ''}:`);
									$.set_text(text_4, ` ${$.get(error).message ?? ''}`);
								});

								$.append($$anchor, div_15);
							});

							$.reset(div_14);
							$.template_effect(() => $.set_text(text_2, `Errors (${$.get(results).normalized.errors.length ?? ''})`));
							$.append($$anchor, div_14);
						};

						$.if(node_8, ($$render) => {
							if ($.get(results).normalized.errors.length > 0) $$render(consequent);
						});
					}

					var node_11 = $.sibling(node_8, 2);

					{
						var consequent_1 = ($$anchor) => {
							var div_17 = root_4();
							var h5_1 = $.child(div_17);
							var text_5 = $.only_child(h5_1);
							var node_12 = $.sibling(h5_1, 2);

							$.each(node_12, 17, () => $.get(results).normalized.warnings, $.index, ($$anchor, warning) => {
								var div_18 = root_3();
								var node_13 = $.child(div_18);

								Icon(node_13, { name: 'alert-triangle', size: 'sm' });

								var div_19 = $.sibling(node_13, 2);
								var span_1 = $.child(div_19);
								var text_6 = $.only_child(span_1);
								var text_7 = $.sibling(span_1);

								$.reset(div_19);
								$.reset(div_18);

								$.template_effect(() => {
									$.set_text(text_6, `Line ${($.get(warning).line || 'General') ?? ''}:`);
									$.set_text(text_7, ` ${$.get(warning).message ?? ''}`);
								});

								$.append($$anchor, div_18);
							});

							$.reset(div_17);
							$.template_effect(() => $.set_text(text_5, `Warnings (${$.get(results).normalized.warnings.length ?? ''})`));
							$.append($$anchor, div_17);
						};

						$.if(node_11, ($$render) => {
							if ($.get(results).normalized.warnings.length > 0) $$render(consequent_1);
						});
					}

					$.reset(div_13);
					$.append($$anchor, div_13);
				};

				$.if(node_6, ($$render) => {
					if ($.get(results).normalized.errors.length > 0 || $.get(results).normalized.warnings.length > 0) $$render(consequent_2);
				});
			}

			var div_20 = $.sibling(node_6, 2);
			var h4_1 = $.child(div_20);
			var node_14 = $.child(h4_1);

			Icon(node_14, { name: 'info', size: 'sm' });
			$.next();
			$.reset(h4_1);

			var div_21 = $.sibling(h4_1, 2);
			var div_22 = $.child(div_21);
			var div_23 = $.sibling($.child(div_22), 2);
			var text_8 = $.only_child(div_23, true);

			$.reset(div_22);

			var div_24 = $.sibling(div_22, 2);
			var div_25 = $.sibling($.child(div_24), 2);
			var text_9 = $.only_child(div_25, true);

			$.reset(div_24);

			var div_26 = $.sibling(div_24, 2);
			var div_27 = $.sibling($.child(div_26), 2);
			var text_10 = $.only_child(div_27, true);

			$.reset(div_26);

			var div_28 = $.sibling(div_26, 2);
			var div_29 = $.sibling($.child(div_28), 2);
			var text_11 = $.only_child(div_29, true);

			$.reset(div_28);
			$.reset(div_21);
			$.reset(div_20);

			var div_30 = $.sibling(div_20, 2);
			var div_31 = $.child(div_30);
			var h4_2 = $.child(div_31);
			var node_15 = $.child(h4_2);

			Icon(node_15, { name: 'file', size: 'sm' });
			$.next();
			$.reset(h4_2);

			var div_32 = $.sibling(h4_2, 2);
			var button_1 = $.child(div_32);
			var node_16 = $.child(button_1);

			{
				let $0 = $.derived(() => clipboard.isCopied() ? 'check' : 'copy');

				Icon(node_16, {
					get name() {
						return $.get($0);
					},
					size: 'sm'
				});
			}

			var text_12 = $.sibling(node_16);

			$.reset(button_1);

			var button_2 = $.sibling(button_1, 2);
			var node_17 = $.child(button_2);

			Icon(node_17, { name: 'download', size: 'sm' });
			$.next();
			$.reset(button_2);
			$.reset(div_32);
			$.reset(div_31);

			var div_33 = $.sibling(div_31, 2);
			var pre = $.child(div_33);
			var text_13 = $.only_child(pre, true);

			$.reset(div_33);
			$.reset(div_30);
			$.reset(div_12);
			$.reset(section);

			$.template_effect(
				($0, $1) => {
					$.set_text(text_8, $.get(results).normalized.records.length);
					$.set_text(text_9, $.get(results).normalized.origin || 'Not specified');
					$.set_text(text_10, $.get(results).normalized.defaultTTL || 'Not specified');
					$.set_class(div_29, 1, `stat-value ${$.get(results).normalized.soa ? 'success' : 'error'}`, 'svelte-1o1sghw');
					$.set_text(text_11, $.get(results).normalized.soa ? 'Yes' : 'No');
					$.set_class(button_1, 1, `copy-button ${$0 ?? ''}`, 'svelte-1o1sghw');
					$.set_text(text_12, ` ${$1 ?? ''}`);
					$.set_text(text_13, $.get(results).formattedZone);
				},
				[
					() => clipboard.isCopied() ? 'copied' : '',
					() => clipboard.isCopied() ? 'Copied!' : 'Copy'
				]
			);

			$.delegated('click', button_1, copyZone);
			$.delegated('click', button_2, downloadZone);
			$.append($$anchor, section);
		};

		$.if(node_5, ($$render) => {
			if ($.get(results)) $$render(consequent_3);
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