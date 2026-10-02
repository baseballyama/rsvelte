import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import { parseZoneFile, compareZones } from '$lib/utils/zone-parser.js';
import { useClipboard } from '$lib/composables';

var root = $.from_html(`<button><div class="example-name svelte-ltl2nf"> </div> <div class="example-description svelte-ltl2nf"> </div></button>`);
var root_1 = $.from_html(`<div class="diff-card unified svelte-ltl2nf"><h4 class="svelte-ltl2nf"><!> Unified Diff</h4> <div class="code-output svelte-ltl2nf"><pre class="svelte-ltl2nf"> </pre></div></div>`);
var root_2 = $.from_html(`<div class="record-item added svelte-ltl2nf"><!> <code class="svelte-ltl2nf"> </code></div>`);
var root_3 = $.from_html(`<div class="diff-card added-card svelte-ltl2nf"><h4 class="svelte-ltl2nf"><!> </h4> <div class="records-list svelte-ltl2nf"></div></div>`);
var root_4 = $.from_html(`<div class="record-item removed svelte-ltl2nf"><!> <code class="svelte-ltl2nf"> </code></div>`);
var root_5 = $.from_html(`<div class="diff-card removed-card svelte-ltl2nf"><h4 class="svelte-ltl2nf"><!> </h4> <div class="records-list svelte-ltl2nf"></div></div>`);
var root_6 = $.from_html(`<div class="change-group svelte-ltl2nf"><div class="record-item removed svelte-ltl2nf"><!> <code class="svelte-ltl2nf"> </code></div> <div class="record-item added svelte-ltl2nf"><!> <code class="svelte-ltl2nf"> </code></div></div>`);
var root_7 = $.from_html(`<div class="diff-card changed-card svelte-ltl2nf"><h4 class="svelte-ltl2nf"><!> </h4> <div class="records-list svelte-ltl2nf"></div></div>`);
var root_8 = $.from_html(`<div class="diff-sections svelte-ltl2nf"><!> <!> <!></div>`);
var root_9 = $.from_html(`<section class="results-section svelte-ltl2nf"><div class="results-header svelte-ltl2nf"><h3 class="svelte-ltl2nf">Zone Comparison Results</h3> <div class="results-controls svelte-ltl2nf"><label class="diff-format-toggle svelte-ltl2nf"><input type="checkbox" class="styled-checkbox svelte-ltl2nf"/> <span class="checkbox-text svelte-ltl2nf">Unified diff format</span></label> <button><!> </button></div></div> <div class="results-inner svelte-ltl2nf"><div class="summary-card svelte-ltl2nf"><h4 class="svelte-ltl2nf"><!> Change Summary</h4> <div class="summary-stats svelte-ltl2nf"><div class="stat-item added svelte-ltl2nf"><div class="stat-value svelte-ltl2nf"> </div> <div class="stat-label svelte-ltl2nf">Added</div></div> <div class="stat-item removed svelte-ltl2nf"><div class="stat-value svelte-ltl2nf"> </div> <div class="stat-label svelte-ltl2nf">Removed</div></div> <div class="stat-item changed svelte-ltl2nf"><div class="stat-value svelte-ltl2nf"> </div> <div class="stat-label svelte-ltl2nf">Changed</div></div> <div class="stat-item unchanged svelte-ltl2nf"><div class="stat-value svelte-ltl2nf"> </div> <div class="stat-label svelte-ltl2nf">Unchanged</div></div></div></div> <!></div></section>`);

var root_10 = $.from_html(`<div class="card"><header class="card-header"><h1>DNS Zone Diff</h1> <p>Compare two zone files and identify added, removed, and changed DNS records</p></header> <div class="card info-card svelte-ltl2nf"><div class="overview-content svelte-ltl2nf"><div class="overview-item svelte-ltl2nf"><!> <div><strong class="svelte-ltl2nf">Added Records:</strong> Identify new DNS records in the updated zone file.</div></div> <div class="overview-item svelte-ltl2nf"><!> <div><strong class="svelte-ltl2nf">Removed Records:</strong> Find records that were deleted from the original zone.</div></div> <div class="overview-item svelte-ltl2nf"><!> <div><strong class="svelte-ltl2nf">Changed Records:</strong> Detect modifications to existing records' data or TTL.</div></div></div></div> <div class="card examples-card svelte-ltl2nf"><details class="examples-details svelte-ltl2nf"><summary class="examples-summary svelte-ltl2nf"><!> <h3 class="svelte-ltl2nf">Zone Comparison Examples</h3></summary> <div class="examples-grid svelte-ltl2nf"></div></details></div> <div class="card input-card svelte-ltl2nf"><div class="input-layout svelte-ltl2nf"><div class="zone-input-group svelte-ltl2nf"><label for="old-zone" class="svelte-ltl2nf"><!> Original Zone</label> <textarea id="old-zone" placeholder="Original zone file content..." class="zone-textarea svelte-ltl2nf" rows="10"></textarea></div> <div class="zone-input-group svelte-ltl2nf"><label for="new-zone" class="svelte-ltl2nf"><!> Updated Zone</label> <textarea id="new-zone" placeholder="Updated zone file content..." class="zone-textarea svelte-ltl2nf" rows="10"></textarea></div></div></div> <!> <div class="education-card svelte-ltl2nf"><div class="education-grid svelte-ltl2nf"><div class="education-item info-panel svelte-ltl2nf"><h4 class="svelte-ltl2nf">Zone File Comparison</h4> <p class="svelte-ltl2nf">Comparing zone files helps track DNS changes during migrations, updates, or troubleshooting. It identifies
          exactly what records were added, removed, or modified between two zone versions.</p></div> <div class="education-item info-panel svelte-ltl2nf"><h4 class="svelte-ltl2nf">Change Types</h4> <p class="svelte-ltl2nf">Added records are new entries in the updated zone. Removed records exist in the original but not the updated
          zone. Changed records have the same owner and type but different data or TTL values.</p></div> <div class="education-item info-panel svelte-ltl2nf"><h4 class="svelte-ltl2nf">Diff Formats</h4> <p class="svelte-ltl2nf">Structured format groups changes by type for easy review. Unified diff format follows standard patch
          conventions, useful for version control systems and automated processing.</p></div> <div class="education-item info-panel svelte-ltl2nf"><h4 class="svelte-ltl2nf">Migration Planning</h4> <p class="svelte-ltl2nf">Use zone diffs to plan DNS migrations, verify changes before deployment, and audit modifications. Consider TTL
          impact on propagation when planning record updates or deletions.</p></div></div></div></div>`);

export default function ZoneDiff($$anchor, $$props) {
	$.push($$props, true);

	let oldZoneInput = $.state('');
	let newZoneInput = $.state('');
	let results = $.state(null);
	let showUnified = $.state(false);
	const clipboard = useClipboard();
	let activeExampleIndex = $.state(null);

	const examples = [
		{
			name: 'Simple Changes',
			oldZone: `example.com.	IN	SOA	ns1.example.com. admin.example.com. 2023010101 3600 1800 1209600 86400
example.com.	IN	NS	ns1.example.com.
example.com.	IN	NS	ns2.example.com.
www.example.com.	IN	A	192.0.2.1
mail.example.com.	IN	A	192.0.2.10`,

			newZone: `example.com.	IN	SOA	ns1.example.com. admin.example.com. 2023010102 3600 1800 1209600 86400
example.com.	IN	NS	ns1.example.com.
example.com.	IN	NS	ns2.example.com.
www.example.com.	IN	A	192.0.2.2
ftp.example.com.	IN	A	192.0.2.3
mail.example.com.	IN	A	192.0.2.10`,
			description: 'Changed IP address and added new record'
		},

		{
			name: 'Record Type Changes',
			oldZone: `example.com.	IN	SOA	ns1.example.com. admin.example.com. 2023010101 3600 1800 1209600 86400
www.example.com.	IN	A	192.0.2.1
blog.example.com.	IN	A	192.0.2.2`,

			newZone: `example.com.	IN	SOA	ns1.example.com. admin.example.com. 2023010101 3600 1800 1209600 86400
www.example.com.	IN	A	192.0.2.1
blog.example.com.	IN	CNAME	www.example.com.`,
			description: 'Changed A record to CNAME'
		},

		{
			name: 'Complex Migration',
			oldZone: `$ORIGIN example.com.
$TTL 86400
@	IN	SOA	ns1.example.com. admin.example.com. 2023010101 3600 1800 1209600 86400
	IN	NS	ns1.example.com.
	IN	NS	ns2.example.com.
www	IN	A	192.0.2.1
mail	IN	A	192.0.2.10
	IN	MX	10	mail.example.com.`,

			newZone: `$ORIGIN example.com.
$TTL 3600
@	IN	SOA	ns1.example.com. hostmaster.example.com. 2023010201 10800 3600 604800 86400
	IN	NS	ns1.example.com.
	IN	NS	ns2.example.com.
	IN	NS	ns3.example.com.
www	300	IN	A	203.0.113.1
api	IN	A	203.0.113.2
mail	IN	A	203.0.113.10
	IN	MX	10	mail.example.com.`,
			description: 'Zone migration with IP changes and additions'
		}
	];

	function loadExample(example, index) {
		$.set(oldZoneInput, example.oldZone, true);
		$.set(newZoneInput, example.newZone, true);
		$.set(activeExampleIndex, index, true);
		compareZoneFiles();
	}

	function clearActiveIfChanged() {
		if ($.get(activeExampleIndex) !== null) {
			const activeExample = examples[$.get(activeExampleIndex)];

			if (!activeExample || $.get(oldZoneInput) !== activeExample.oldZone || $.get(newZoneInput) !== activeExample.newZone) {
				$.set(activeExampleIndex, null);
			}
		}
	}

	function compareZoneFiles() {
		if (!$.get(oldZoneInput).trim() || !$.get(newZoneInput).trim()) {
			$.set(results, null);

			return;
		}

		try {
			const oldZone = parseZoneFile($.get(oldZoneInput));
			const newZone = parseZoneFile($.get(newZoneInput));

			$.set(results, compareZones(oldZone, newZone), true);
		} catch(error) {
			console.error('Failed to compare zones:', error);
			$.set(results, null);
		}
	}

	function generateUnifiedDiff() {
		if (!$.get(results)) return '';

		const lines = [];

		lines.push('--- Old Zone');
		lines.push('+++ New Zone');
		lines.push(`@@ -1,${$.get(oldZoneInput).split('\n').length} +1,${$.get(newZoneInput).split('\n').length} @@`);

		// Show removed records
		for (const record of $.get(results).removed) {
			lines.push(`-${formatRecord(record)}`);
		}

		// Show added records
		for (const record of $.get(results).added) {
			lines.push(`+${formatRecord(record)}`);
		}

		// Show changed records
		for (const change of $.get(results).changed) {
			lines.push(`-${formatRecord(change.before)}`);
			lines.push(`+${formatRecord(change.after)}`);
		}

		return lines.join('\n');
	}

	function formatRecord(record) {
		const ttl = record.ttl ? record.ttl.toString() : '';

		return [record.owner, ttl, record.class, record.type, record.rdata].filter(Boolean).join('\t');
	}

	function copyDiff() {
		if (!$.get(results)) return;

		const diffText = $.get(showUnified) ? generateUnifiedDiff() : formatStructuredDiff();

		clipboard.copy(diffText);
	}

	function formatStructuredDiff() {
		if (!$.get(results)) return '';

		const lines = [];

		if ($.get(results).added.length > 0) {
			lines.push(`Added Records (${$.get(results).added.length}):`);

			for (const record of $.get(results).added) {
				lines.push(`+ ${formatRecord(record)}`);
			}

			lines.push('');
		}

		if ($.get(results).removed.length > 0) {
			lines.push(`Removed Records (${$.get(results).removed.length}):`);

			for (const record of $.get(results).removed) {
				lines.push(`- ${formatRecord(record)}`);
			}

			lines.push('');
		}

		if ($.get(results).changed.length > 0) {
			lines.push(`Changed Records (${$.get(results).changed.length}):`);

			for (const change of $.get(results).changed) {
				lines.push(`~ ${formatRecord(change.before)}`);
				lines.push(`  ${formatRecord(change.after)}`);
			}
		}

		return lines.join('\n');
	}

	function handleInputChange() {
		clearActiveIfChanged();
		compareZoneFiles();
	}

	var div = root_10();
	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var node = $.child(div_3);

	Icon(node, { name: 'plus-circle', size: 'sm' });
	$.next(2);
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_1 = $.child(div_4);

	Icon(node_1, { name: 'minus-circle', size: 'sm' });
	$.next(2);
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_2 = $.child(div_5);

	Icon(node_2, { name: 'edit', size: 'sm' });
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
			$.set_class(button, 1, `example-card ${$.get(activeExampleIndex) === $.get(index) ? 'active' : ''}`, 'svelte-ltl2nf');
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
	var div_12 = $.child(div_11);
	var label = $.child(div_12);
	var node_4 = $.child(label);

	Icon(node_4, { name: 'file', size: 'sm' });
	$.next();
	$.reset(label);
	$.action(label, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Original zone file content for comparison');

	var textarea = $.sibling(label, 2);

	$.remove_textarea_child(textarea);
	$.reset(div_12);

	var div_13 = $.sibling(div_12, 2);
	var label_1 = $.child(div_13);
	var node_5 = $.child(label_1);

	Icon(node_5, { name: 'file-tick', size: 'sm' });
	$.next();
	$.reset(label_1);
	$.action(label_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Updated zone file content to compare against');

	var textarea_1 = $.sibling(label_1, 2);

	$.remove_textarea_child(textarea_1);
	$.reset(div_13);
	$.reset(div_11);
	$.reset(div_10);

	var node_6 = $.sibling(div_10, 2);

	{
		var consequent_4 = ($$anchor) => {
			var section = root_9();
			var div_14 = $.child(section);
			var div_15 = $.sibling($.child(div_14), 2);
			var label_2 = $.child(div_15);
			var input = $.child(label_2);

			$.remove_input_defaults(input);
			$.next(2);
			$.reset(label_2);

			var button_1 = $.sibling(label_2, 2);
			var node_7 = $.child(button_1);

			{
				let $0 = $.derived(() => clipboard.isCopied() ? 'check' : 'copy');

				Icon(node_7, {
					get name() {
						return $.get($0);
					},
					size: 'sm'
				});
			}

			var text_2 = $.sibling(node_7);

			$.reset(button_1);
			$.reset(div_15);
			$.reset(div_14);

			var div_16 = $.sibling(div_14, 2);
			var div_17 = $.child(div_16);
			var h4 = $.child(div_17);
			var node_8 = $.child(h4);

			Icon(node_8, { name: 'list-check', size: 'sm' });
			$.next();
			$.reset(h4);

			var div_18 = $.sibling(h4, 2);
			var div_19 = $.child(div_18);
			var div_20 = $.child(div_19);
			var text_3 = $.only_child(div_20, true);

			$.next(2);
			$.reset(div_19);

			var div_21 = $.sibling(div_19, 2);
			var div_22 = $.child(div_21);
			var text_4 = $.only_child(div_22, true);

			$.next(2);
			$.reset(div_21);

			var div_23 = $.sibling(div_21, 2);
			var div_24 = $.child(div_23);
			var text_5 = $.only_child(div_24, true);

			$.next(2);
			$.reset(div_23);

			var div_25 = $.sibling(div_23, 2);
			var div_26 = $.child(div_25);
			var text_6 = $.only_child(div_26, true);

			$.next(2);
			$.reset(div_25);
			$.reset(div_18);
			$.reset(div_17);

			var node_9 = $.sibling(div_17, 2);

			{
				var consequent = ($$anchor) => {
					var div_27 = root_1();
					var h4_1 = $.child(div_27);
					var node_10 = $.child(h4_1);

					Icon(node_10, { name: 'code-diff', size: 'sm' });
					$.next();
					$.reset(h4_1);

					var div_28 = $.sibling(h4_1, 2);
					var pre = $.child(div_28);
					var text_7 = $.only_child(pre, true);

					$.reset(div_28);
					$.reset(div_27);
					$.template_effect(($0) => $.set_text(text_7, $0), [() => generateUnifiedDiff()]);
					$.append($$anchor, div_27);
				};

				var alternate = ($$anchor) => {
					var div_29 = root_8();
					var node_11 = $.child(div_29);

					{
						var consequent_1 = ($$anchor) => {
							var div_30 = root_3();
							var h4_2 = $.child(div_30);
							var node_12 = $.child(h4_2);

							Icon(node_12, { name: 'plus-circle', size: 'sm' });

							var text_8 = $.sibling(node_12);

							$.reset(h4_2);

							var div_31 = $.sibling(h4_2, 2);

							$.each(div_31, 21, () => $.get(results).added, $.index, ($$anchor, record) => {
								var div_32 = root_2();
								var node_13 = $.child(div_32);

								Icon(node_13, { name: 'plus', size: 'sm' });

								var code = $.sibling(node_13, 2);
								var text_9 = $.only_child(code, true);

								$.reset(div_32);
								$.template_effect(($0) => $.set_text(text_9, $0), [() => formatRecord($.get(record))]);
								$.append($$anchor, div_32);
							});

							$.reset(div_31);
							$.reset(div_30);
							$.template_effect(() => $.set_text(text_8, ` Added Records (${$.get(results).added.length ?? ''})`));
							$.append($$anchor, div_30);
						};

						$.if(node_11, ($$render) => {
							if ($.get(results).added.length > 0) $$render(consequent_1);
						});
					}

					var node_14 = $.sibling(node_11, 2);

					{
						var consequent_2 = ($$anchor) => {
							var div_33 = root_5();
							var h4_3 = $.child(div_33);
							var node_15 = $.child(h4_3);

							Icon(node_15, { name: 'minus-circle', size: 'sm' });

							var text_10 = $.sibling(node_15);

							$.reset(h4_3);

							var div_34 = $.sibling(h4_3, 2);

							$.each(div_34, 21, () => $.get(results).removed, $.index, ($$anchor, record) => {
								var div_35 = root_4();
								var node_16 = $.child(div_35);

								Icon(node_16, { name: 'minus', size: 'sm' });

								var code_1 = $.sibling(node_16, 2);
								var text_11 = $.only_child(code_1, true);

								$.reset(div_35);
								$.template_effect(($0) => $.set_text(text_11, $0), [() => formatRecord($.get(record))]);
								$.append($$anchor, div_35);
							});

							$.reset(div_34);
							$.reset(div_33);
							$.template_effect(() => $.set_text(text_10, ` Removed Records (${$.get(results).removed.length ?? ''})`));
							$.append($$anchor, div_33);
						};

						$.if(node_14, ($$render) => {
							if ($.get(results).removed.length > 0) $$render(consequent_2);
						});
					}

					var node_17 = $.sibling(node_14, 2);

					{
						var consequent_3 = ($$anchor) => {
							var div_36 = root_7();
							var h4_4 = $.child(div_36);
							var node_18 = $.child(h4_4);

							Icon(node_18, { name: 'edit', size: 'sm' });

							var text_12 = $.sibling(node_18);

							$.reset(h4_4);

							var div_37 = $.sibling(h4_4, 2);

							$.each(div_37, 21, () => $.get(results).changed, $.index, ($$anchor, change) => {
								var div_38 = root_6();
								var div_39 = $.child(div_38);
								var node_19 = $.child(div_39);

								Icon(node_19, { name: 'minus', size: 'sm' });

								var code_2 = $.sibling(node_19, 2);
								var text_13 = $.only_child(code_2, true);

								$.reset(div_39);

								var div_40 = $.sibling(div_39, 2);
								var node_20 = $.child(div_40);

								Icon(node_20, { name: 'plus', size: 'sm' });

								var code_3 = $.sibling(node_20, 2);
								var text_14 = $.only_child(code_3, true);

								$.reset(div_40);
								$.reset(div_38);

								$.template_effect(
									($0, $1) => {
										$.set_text(text_13, $0);
										$.set_text(text_14, $1);
									},
									[
										() => formatRecord($.get(change).before),
										() => formatRecord($.get(change).after)
									]
								);

								$.append($$anchor, div_38);
							});

							$.reset(div_37);
							$.reset(div_36);
							$.template_effect(() => $.set_text(text_12, ` Changed Records (${$.get(results).changed.length ?? ''})`));
							$.append($$anchor, div_36);
						};

						$.if(node_17, ($$render) => {
							if ($.get(results).changed.length > 0) $$render(consequent_3);
						});
					}

					$.reset(div_29);
					$.append($$anchor, div_29);
				};

				$.if(node_9, ($$render) => {
					if ($.get(showUnified)) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.reset(div_16);
			$.reset(section);

			$.template_effect(
				($0, $1) => {
					$.set_class(button_1, 1, `copy-button ${$0 ?? ''}`, 'svelte-ltl2nf');
					$.set_text(text_2, ` ${$1 ?? ''}`);
					$.set_text(text_3, $.get(results).added.length);
					$.set_text(text_4, $.get(results).removed.length);
					$.set_text(text_5, $.get(results).changed.length);
					$.set_text(text_6, $.get(results).unchanged.length);
				},
				[
					() => clipboard.isCopied() ? 'copied' : '',
					() => clipboard.isCopied() ? 'Copied!' : 'Copy Diff'
				]
			);

			$.bind_checked(input, () => $.get(showUnified), ($$value) => $.set(showUnified, $$value));
			$.delegated('click', button_1, copyDiff);
			$.append($$anchor, section);
		};

		$.if(node_6, ($$render) => {
			if ($.get(results)) $$render(consequent_4);
		});
	}

	$.next(2);
	$.reset(div);
	$.delegated('input', textarea, handleInputChange);
	$.bind_value(textarea, () => $.get(oldZoneInput), ($$value) => $.set(oldZoneInput, $$value));
	$.delegated('input', textarea_1, handleInputChange);
	$.bind_value(textarea_1, () => $.get(newZoneInput), ($$value) => $.set(newZoneInput, $$value));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'input']);