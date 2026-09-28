import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import { useClipboard } from '$lib/composables';
import { analyzePTRCoverage } from '$lib/utils/reverse-dns.js';

var root = $.from_html(`<button><div class="example-header"><div class="example-label svelte-lsjtaq"> </div></div> <div class="example-details svelte-lsjtaq"><div class="example-field svelte-lsjtaq">CIDR: <code class="svelte-lsjtaq"> </code></div> <div class="example-field svelte-lsjtaq">Pattern: <code class="svelte-lsjtaq"> </code></div> <div class="example-field svelte-lsjtaq"> </div></div> <div class="example-description svelte-lsjtaq"> </div></button>`);
var root_1 = $.from_html(`<button class="pattern-example svelte-lsjtaq"><code class="pattern-code svelte-lsjtaq"> </code> <span class="pattern-desc svelte-lsjtaq"> </span></button>`);
var root_2 = $.from_html(`<div class="stat-item svelte-lsjtaq"><span class="stat-value svelte-lsjtaq"> </span> <span class="stat-label svelte-lsjtaq">Pattern Matches</span></div>`);
var root_3 = $.from_html(`<div class="record-item missing svelte-lsjtaq"><code class="svelte-lsjtaq"> </code></div>`);
var root_4 = $.from_html(`<div class="records-truncated svelte-lsjtaq"> </div>`);
var root_5 = $.from_html(`<div class="analysis-section svelte-lsjtaq"><div class="section-header svelte-lsjtaq"><h4 class="svelte-lsjtaq"><!> </h4> <button><!> Copy List</button></div> <div class="records-list svelte-lsjtaq"><!> <!></div></div>`);
var root_6 = $.from_html(`<div class="record-item extra svelte-lsjtaq"><code class="svelte-lsjtaq"> </code></div>`);
var root_7 = $.from_html(`<div class="action-item svelte-lsjtaq"><div class="action-header svelte-lsjtaq"><!> <span>Create Missing PTR Records</span> <button><!> Copy Zone Lines</button></div> <div class="action-description svelte-lsjtaq"> </div></div>`);
var root_8 = $.from_html(`<div class="action-item svelte-lsjtaq"><div class="action-header svelte-lsjtaq"><!> <span>Review Extra Records</span></div> <div class="action-description svelte-lsjtaq"> </div></div>`);
var root_9 = $.from_html(`<div class="action-item svelte-lsjtaq"><div class="action-header svelte-lsjtaq"><!> <span>Fix Naming Pattern Violations</span></div> <div class="action-description svelte-lsjtaq"> </div></div>`);
var root_10 = $.from_html(`<div class="action-item success svelte-lsjtaq"><div class="action-header svelte-lsjtaq"><!> <span>Excellent Coverage!</span></div> <div class="action-description svelte-lsjtaq"> </div></div>`);
var root_11 = $.from_html(`<div class="results-header svelte-lsjtaq"><h3 class="svelte-lsjtaq">Coverage Analysis Results</h3> <div class="coverage-meter svelte-lsjtaq"><div class="coverage-bar svelte-lsjtaq"><div></div></div> <div class="coverage-text svelte-lsjtaq"> </div></div></div> <div class="summary-stats svelte-lsjtaq"><div class="stat-item svelte-lsjtaq"><span class="stat-value svelte-lsjtaq"> </span> <span class="stat-label svelte-lsjtaq">Expected PTRs</span></div> <div class="stat-item svelte-lsjtaq"><span class="stat-value svelte-lsjtaq"> </span> <span class="stat-label svelte-lsjtaq">Found PTRs</span></div> <div class="stat-item svelte-lsjtaq"><span class="stat-value svelte-lsjtaq"> </span> <span class="stat-label svelte-lsjtaq">Missing PTRs</span></div> <div class="stat-item svelte-lsjtaq"><span class="stat-value svelte-lsjtaq"> </span> <span class="stat-label svelte-lsjtaq">Extra PTRs</span></div> <!></div> <div class="analysis-sections svelte-lsjtaq"><!> <!> <div class="analysis-section svelte-lsjtaq"><div class="section-header svelte-lsjtaq"><h4 class="svelte-lsjtaq"><!> Recommended Actions</h4></div> <div class="action-items svelte-lsjtaq"><!> <!> <!> <!></div></div></div>`, 1);
var root_12 = $.from_html(`<div class="error-result svelte-lsjtaq"><!> <h4 class="svelte-lsjtaq">Analysis Error</h4> <p class="svelte-lsjtaq"> </p> <div class="error-help svelte-lsjtaq"><strong>Check your input:</strong> <ul class="svelte-lsjtaq"><li class="svelte-lsjtaq">CIDR notation: 192.168.1.0/24, 2001:db8::/64</li> <li class="svelte-lsjtaq">PTR records: One per line, proper format</li> <li class="svelte-lsjtaq">Pattern: Valid JavaScript regex syntax</li></ul></div></div>`);
var root_13 = $.from_html(`<div class="card results-card svelte-lsjtaq"><!></div>`);

var root_14 = $.from_html(`<div class="card"><header class="card-header"><h1>PTR Sweep Planner</h1> <p>Analyze PTR record coverage for network blocks and identify missing or extra records</p></header> <div class="card info-card svelte-lsjtaq"><div class="overview-content svelte-lsjtaq"><div class="overview-item svelte-lsjtaq"><!> <div><strong class="svelte-lsjtaq">Coverage Analysis:</strong> Compare expected PTR records for a CIDR block against actual existing records.</div></div> <div class="overview-item svelte-lsjtaq"><!> <div><strong class="svelte-lsjtaq">Pattern Matching:</strong> Validate existing PTR records against regex naming patterns for compliance.</div></div> <div class="overview-item svelte-lsjtaq"><!> <div><strong class="svelte-lsjtaq">Gap Analysis:</strong> Identify missing PTRs, extra PTRs, and generate remediation plans.</div></div></div></div> <div class="card examples-card svelte-lsjtaq"><details class="examples-details svelte-lsjtaq"><summary class="examples-summary svelte-lsjtaq"><!> <h3 class="svelte-lsjtaq">Quick Examples</h3></summary> <div class="examples-grid svelte-lsjtaq"></div></details></div> <div class="card input-card svelte-lsjtaq"><div class="input-group svelte-lsjtaq"><label for="cidr-input" class="svelte-lsjtaq"><!> CIDR Block to Analyze</label> <input id="cidr-input" type="text" placeholder="192.168.1.0/24 or 2001:db8::/64" spellcheck="false"/></div> <div class="input-group svelte-lsjtaq"><label for="ptrs-input" class="svelte-lsjtaq"><!> Existing PTR Records</label> <textarea id="ptrs-input" placeholder="100.1.168.192.in-addr.arpa
101.1.168.192.in-addr.arpa
..." class="ptrs-input svelte-lsjtaq" rows="8" spellcheck="false"></textarea></div> <div class="input-group svelte-lsjtaq"><label for="pattern-input" class="svelte-lsjtaq"><!> Naming Pattern (Optional)</label> <input id="pattern-input" type="text" placeholder=".*\\.example\\.com\\.$" class="pattern-input svelte-lsjtaq" spellcheck="false"/> <div class="pattern-help svelte-lsjtaq"><h4 class="svelte-lsjtaq">Common Patterns:</h4> <div class="pattern-examples svelte-lsjtaq"></div></div></div></div> <!> <div class="education-card svelte-lsjtaq"><div class="education-grid svelte-lsjtaq"><div class="education-item info-panel svelte-lsjtaq"><h4 class="svelte-lsjtaq">PTR Coverage Planning</h4> <p class="svelte-lsjtaq">PTR coverage analysis helps identify gaps in reverse DNS configuration. Complete coverage ensures all IPs in
          your network blocks have proper reverse DNS entries for troubleshooting and compliance requirements.</p></div> <div class="education-item info-panel svelte-lsjtaq"><h4 class="svelte-lsjtaq">Naming Pattern Validation</h4> <p class="svelte-lsjtaq">Use regex patterns to enforce consistent hostname naming conventions. Patterns like <code class="svelte-lsjtaq">.*\\.corp\\.example\\.com\\.$</code> ensure all PTR records point to properly formatted hostnames within your
          domain structure.</p></div> <div class="education-item info-panel svelte-lsjtaq"><h4 class="svelte-lsjtaq">Common PTR Issues</h4> <p class="svelte-lsjtaq">Missing PTRs can cause mail delivery problems and failed reverse lookups. Extra PTRs may indicate outdated
          records or configuration drift. Regular PTR sweeps help maintain DNS hygiene and network documentation
          accuracy.</p></div> <div class="education-item info-panel svelte-lsjtaq"><h4 class="svelte-lsjtaq">Remediation Best Practices</h4> <p class="svelte-lsjtaq">Create missing PTRs in batches, verify forward/reverse consistency (A/AAAA records), and establish monitoring
          to detect future gaps. Use descriptive hostnames that include network or service information for easier
          troubleshooting.</p></div></div></div></div>`);

export default function PTRSweepPlanner($$anchor, $$props) {
	$.push($$props, true);

	let cidrInput = $.state('192.168.1.0/24');

	let existingPTRsInput = $.state(`100.1.168.192.in-addr.arpa
101.1.168.192.in-addr.arpa
105.1.168.192.in-addr.arpa
200.1.168.192.in-addr.arpa`);

	let namingPattern = $.state('.*\\.example\\.com\\.$');
	let results = $.state(null);
	const clipboard = useClipboard();
	let selectedExample = $.state(null);
	let _userModified = $.state(false);

	const examples = [
		{
			label: 'Partial Coverage',
			cidr: '192.168.1.0/28',
			ptrs: `100.1.168.192.in-addr.arpa
101.1.168.192.in-addr.arpa
105.1.168.192.in-addr.arpa`,
			pattern: '.*\\.example\\.com\\.$',
			description: 'Network with some missing PTRs'
		},

		{
			label: 'Mixed Naming',
			cidr: '10.0.0.0/28',
			ptrs: `1.0.0.10.in-addr.arpa
2.0.0.10.in-addr.arpa
10.0.0.10.in-addr.arpa
15.0.0.10.in-addr.arpa
20.0.0.10.in-addr.arpa`,
			pattern: 'host-.*\\.corp\\.com\\.$',
			description: 'Check pattern compliance'
		},

		{
			label: 'IPv6 Network',
			cidr: '2001:db8:1000::/64',
			ptrs: `0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.1.8.b.d.0.1.0.0.2.ip6.arpa
1.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.1.8.b.d.0.1.0.0.2.ip6.arpa`,
			pattern: '.*\\.ipv6\\.example\\.com\\.$',
			description: 'IPv6 PTR coverage analysis'
		}
	];

	const patternHelp = [
		{
			pattern: '.*\\.example\\.com\\.$',
			description: 'Any hostname ending in .example.com.'
		},

		{
			pattern: 'host-.*\\.corp\\.com\\.$',
			description: 'Hostnames starting with "host-" in corp.com'
		},

		{
			pattern: '^[0-9-]+\\.net\\.example\\.com\\.$',
			description: 'IP-based hostnames in net.example.com'
		},

		{
			pattern: '(server|workstation)-.*',
			description: 'Names starting with "server-" or "workstation-"'
		}
	];

	function loadExample(example) {
		$.set(cidrInput, example.cidr, true);
		$.set(existingPTRsInput, example.ptrs, true);
		$.set(namingPattern, example.pattern, true);
		$.set(selectedExample, example.label, true);
		$.set(_userModified, false);
		analyzeCoverage();
	}

	function analyzeCoverage() {
		if (!$.get(cidrInput).trim()) {
			$.set(results, null);

			return;
		}

		try {
			const trimmedCidr = $.get(cidrInput).trim();
			const existingPTRs = $.get(existingPTRsInput).split('\n').map((ptr) => ptr.trim()).filter((ptr) => ptr.length > 0);
			const analysis = analyzePTRCoverage(trimmedCidr, existingPTRs, $.get(namingPattern).trim() || undefined);

			$.set(results, { success: true, analysis }, true);
		} catch(error) {
			$.set(
				results,
				{
					success: false,
					error: error instanceof Error ? error.message : 'Unknown error occurred',
					analysis: {
						cidr: '',
						totalAddresses: 0,
						expectedPTRs: [],
						missingPTRs: [],
						extraPTRs: [],
						patternMatches: 0,
						coverage: 0
					}
				},
				true
			);
		}
	}

	function handleInputChange() {
		$.set(_userModified, true);
		$.set(selectedExample, null);
		analyzeCoverage();
	}

	function _generateDigCommands(missingPTRs) {
		return missingPTRs.slice(0, 20).map((ptr) => `dig +short -x ${ptr.replace(/(.*\.in-addr\.arpa|.*\.ip6\.arpa)$/, (match, domain) => {
			if (domain.includes('in-addr.arpa')) {
				// Convert IPv4 PTR back to IP
				const parts = domain.replace('.in-addr.arpa', '').split('.');

				return parts.reverse().join('.');
			} else {
				// IPv6 conversion is more complex, skip for now
				return ptr;
			}
		})}`).join('\n');
	}

	function generateCreateCommands(missingPTRs) {
		return missingPTRs.slice(0, 20).map((ptr) => {
			const recordName = ptr.split('.').slice(0, -4).join('.');

			return `${recordName}    IN    PTR    host-${recordName.split('.').reverse().join('-')}.example.com.`;
		}).join('\n');
	}

	// Analyze on component load
	analyzeCoverage();

	var div = root_14();
	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var node = $.child(div_3);

	Icon(node, { name: 'search', size: 'sm' });
	$.next(2);
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_1 = $.child(div_4);

	Icon(node_1, { name: 'target', size: 'sm' });
	$.next(2);
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_2 = $.child(div_5);

	Icon(node_2, { name: 'list-check', size: 'sm' });
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

	$.each(div_7, 23, () => examples, (example, idx) => `${example.label}-${idx}`, ($$anchor, example) => {
		var button = root();
		var div_8 = $.child(button);
		var div_9 = $.child(div_8);
		var text = $.only_child(div_9, true);

		$.reset(div_8);

		var div_10 = $.sibling(div_8, 2);
		var div_11 = $.child(div_10);
		var code = $.sibling($.child(div_11));
		var text_1 = $.only_child(code, true);

		$.reset(div_11);

		var div_12 = $.sibling(div_11, 2);
		var code_1 = $.sibling($.child(div_12));
		var text_2 = $.only_child(code_1, true);

		$.reset(div_12);

		var div_13 = $.sibling(div_12, 2);
		var text_3 = $.only_child(div_13);

		$.reset(div_10);

		var div_14 = $.sibling(div_10, 2);
		var text_4 = $.only_child(div_14, true);

		$.reset(button);

		$.template_effect(
			($0) => {
				$.set_class(button, 1, `example-card ${$.get(selectedExample) === $.get(example).label ? 'active' : ''}`, 'svelte-lsjtaq');
				$.set_text(text, $.get(example).label);
				$.set_text(text_1, $.get(example).cidr);
				$.set_text(text_2, $.get(example).pattern);
				$.set_text(text_3, `PTRs: ${$0 ?? ''} records`);
				$.set_text(text_4, $.get(example).description);
			},
			[() => $.get(example).ptrs.split('\n').length]
		);

		$.delegated('click', button, () => loadExample($.get(example)));
		$.append($$anchor, button);
	});

	$.reset(div_7);
	$.reset(details);
	$.reset(div_6);

	var div_15 = $.sibling(div_6, 2);
	var div_16 = $.child(div_15);
	var label = $.child(div_16);
	var node_4 = $.child(label);

	Icon(node_4, { name: 'network', size: 'sm' });
	$.next();
	$.reset(label);
	$.action(label, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Enter the CIDR block to analyze PTR coverage for');

	var input = $.sibling(label, 2);

	$.remove_input_defaults(input);
	$.reset(div_16);

	var div_17 = $.sibling(div_16, 2);
	var label_1 = $.child(div_17);
	var node_5 = $.child(label_1);

	Icon(node_5, { name: 'list', size: 'sm' });
	$.next();
	$.reset(label_1);
	$.action(label_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Paste existing PTR record names, one per line');

	var textarea = $.sibling(label_1, 2);

	$.remove_textarea_child(textarea);
	$.reset(div_17);

	var div_18 = $.sibling(div_17, 2);
	var label_2 = $.child(div_18);
	var node_6 = $.child(label_2);

	Icon(node_6, { name: 'search', size: 'sm' });
	$.next();
	$.reset(label_2);
	$.action(label_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Optional regex pattern to validate PTR target naming');

	var input_1 = $.sibling(label_2, 2);

	$.remove_input_defaults(input_1);

	var div_19 = $.sibling(input_1, 2);
	var div_20 = $.sibling($.child(div_19), 2);

	$.each(div_20, 23, () => patternHelp, (item, helpIdx) => `${item.pattern}-${helpIdx}`, ($$anchor, item) => {
		var button_1 = root_1();
		var code_2 = $.child(button_1);
		var text_5 = $.only_child(code_2, true);
		var span = $.sibling(code_2, 2);
		var text_6 = $.only_child(span, true);

		$.reset(button_1);

		$.template_effect(() => {
			$.set_text(text_5, $.get(item).pattern);
			$.set_text(text_6, $.get(item).description);
		});

		$.delegated('click', button_1, () => {
			$.set(namingPattern, $.get(item).pattern, true);
			handleInputChange();
		});

		$.append($$anchor, button_1);
	});

	$.reset(div_20);
	$.reset(div_19);
	$.reset(div_18);
	$.reset(div_15);

	var node_7 = $.sibling(div_15, 2);

	{
		var consequent_10 = ($$anchor) => {
			var div_21 = root_13();
			var node_8 = $.child(div_21);

			{
				var consequent_9 = ($$anchor) => {
					var fragment = root_11();
					var div_22 = $.first_child(fragment);
					var div_23 = $.sibling($.child(div_22), 2);
					var div_24 = $.child(div_23);
					var div_25 = $.only_child(div_24);
					var div_26 = $.sibling(div_24, 2);
					var text_7 = $.only_child(div_26);

					$.reset(div_23);
					$.reset(div_22);

					var div_27 = $.sibling(div_22, 2);
					var div_28 = $.child(div_27);
					var span_1 = $.child(div_28);
					var text_8 = $.only_child(span_1, true);

					$.next(2);
					$.reset(div_28);

					var div_29 = $.sibling(div_28, 2);
					var span_2 = $.child(div_29);
					var text_9 = $.only_child(span_2, true);

					$.next(2);
					$.reset(div_29);

					var div_30 = $.sibling(div_29, 2);
					var span_3 = $.child(div_30);
					var text_10 = $.only_child(span_3, true);

					$.next(2);
					$.reset(div_30);

					var div_31 = $.sibling(div_30, 2);
					var span_4 = $.child(div_31);
					var text_11 = $.only_child(span_4, true);

					$.next(2);
					$.reset(div_31);

					var node_9 = $.sibling(div_31, 2);

					{
						var consequent = ($$anchor) => {
							var div_32 = root_2();
							var span_5 = $.child(div_32);
							var text_12 = $.only_child(span_5, true);

							$.next(2);
							$.reset(div_32);
							$.template_effect(() => $.set_text(text_12, $.get(results).analysis.patternMatches));
							$.append($$anchor, div_32);
						};

						var d = $.derived(() => $.get(namingPattern).trim());

						$.if(node_9, ($$render) => {
							if ($.get(d)) $$render(consequent);
						});
					}

					$.reset(div_27);

					var div_33 = $.sibling(div_27, 2);
					var node_10 = $.child(div_33);

					{
						var consequent_2 = ($$anchor) => {
							var div_34 = root_5();
							var div_35 = $.child(div_34);
							var h4 = $.child(div_35);
							var node_11 = $.child(h4);

							Icon(node_11, { name: 'alert-circle', size: 'sm' });

							var text_13 = $.sibling(node_11);

							$.reset(h4);

							var button_2 = $.sibling(h4, 2);
							var node_12 = $.child(button_2);

							{
								let $0 = $.derived(() => clipboard.isCopied('missing-ptrs') ? 'check' : 'copy');

								Icon(node_12, {
									get name() {
										return $.get($0);
									},
									size: 'sm'
								});
							}

							$.next();
							$.reset(button_2);
							$.reset(div_35);

							var div_36 = $.sibling(div_35, 2);
							var node_13 = $.child(div_36);

							$.each(node_13, 19, () => $.get(results).analysis.missingPTRs.slice(0, 20), (ptr, index) => `missing-${ptr}-${index}`, ($$anchor, ptr) => {
								var div_37 = root_3();
								var code_3 = $.child(div_37);
								var text_14 = $.only_child(code_3, true);

								$.reset(div_37);
								$.template_effect(() => $.set_text(text_14, $.get(ptr)));
								$.append($$anchor, div_37);
							});

							var node_14 = $.sibling(node_13, 2);

							{
								var consequent_1 = ($$anchor) => {
									var div_38 = root_4();
									var text_15 = $.only_child(div_38);

									$.template_effect(() => $.set_text(text_15, `... and ${$.get(results).analysis.missingPTRs.length - 20} more missing records`));
									$.append($$anchor, div_38);
								};

								$.if(node_14, ($$render) => {
									if ($.get(results).analysis.missingPTRs.length > 20) $$render(consequent_1);
								});
							}

							$.reset(div_36);
							$.reset(div_34);

							$.template_effect(
								($0) => {
									$.set_text(text_13, ` Missing PTR Records (${$.get(results).analysis.missingPTRs.length ?? ''})`);
									$.set_class(button_2, 1, `copy-button ${$0 ?? ''}`, 'svelte-lsjtaq');
								},
								[() => clipboard.isCopied('missing-ptrs') ? 'copied' : '']
							);

							$.delegated('click', button_2, () => $.get(results) && clipboard.copy($.get(results).analysis.missingPTRs.join('\n'), 'missing-ptrs'));
							$.append($$anchor, div_34);
						};

						$.if(node_10, ($$render) => {
							if ($.get(results).analysis.missingPTRs.length > 0) $$render(consequent_2);
						});
					}

					var node_15 = $.sibling(node_10, 2);

					{
						var consequent_4 = ($$anchor) => {
							var div_39 = root_5();
							var div_40 = $.child(div_39);
							var h4_1 = $.child(div_40);
							var node_16 = $.child(h4_1);

							Icon(node_16, { name: 'plus-circle', size: 'sm' });

							var text_16 = $.sibling(node_16);

							$.reset(h4_1);

							var button_3 = $.sibling(h4_1, 2);
							var node_17 = $.child(button_3);

							{
								let $0 = $.derived(() => clipboard.isCopied('extra-ptrs') ? 'check' : 'copy');

								Icon(node_17, {
									get name() {
										return $.get($0);
									},
									size: 'sm'
								});
							}

							$.next();
							$.reset(button_3);
							$.reset(div_40);

							var div_41 = $.sibling(div_40, 2);
							var node_18 = $.child(div_41);

							$.each(node_18, 19, () => $.get(results).analysis.extraPTRs.slice(0, 10), (ptr, index) => `extra-${ptr}-${index}`, ($$anchor, ptr) => {
								var div_42 = root_6();
								var code_4 = $.child(div_42);
								var text_17 = $.only_child(code_4, true);

								$.reset(div_42);
								$.template_effect(() => $.set_text(text_17, $.get(ptr)));
								$.append($$anchor, div_42);
							});

							var node_19 = $.sibling(node_18, 2);

							{
								var consequent_3 = ($$anchor) => {
									var div_43 = root_4();
									var text_18 = $.only_child(div_43);

									$.template_effect(() => $.set_text(text_18, `... and ${$.get(results).analysis.extraPTRs.length - 10} more extra records`));
									$.append($$anchor, div_43);
								};

								$.if(node_19, ($$render) => {
									if ($.get(results).analysis.extraPTRs.length > 10) $$render(consequent_3);
								});
							}

							$.reset(div_41);
							$.reset(div_39);

							$.template_effect(
								($0) => {
									$.set_text(text_16, ` Extra PTR Records (${$.get(results).analysis.extraPTRs.length ?? ''})`);
									$.set_class(button_3, 1, `copy-button ${$0 ?? ''}`, 'svelte-lsjtaq');
								},
								[() => clipboard.isCopied('extra-ptrs') ? 'copied' : '']
							);

							$.delegated('click', button_3, () => $.get(results) && clipboard.copy($.get(results).analysis.extraPTRs.join('\n'), 'extra-ptrs'));
							$.append($$anchor, div_39);
						};

						$.if(node_15, ($$render) => {
							if ($.get(results).analysis.extraPTRs.length > 0) $$render(consequent_4);
						});
					}

					var div_44 = $.sibling(node_15, 2);
					var div_45 = $.child(div_44);
					var h4_2 = $.child(div_45);
					var node_20 = $.child(h4_2);

					Icon(node_20, { name: 'clipboard-list', size: 'sm' });
					$.next();
					$.reset(h4_2);
					$.reset(div_45);

					var div_46 = $.sibling(div_45, 2);
					var node_21 = $.child(div_46);

					{
						var consequent_5 = ($$anchor) => {
							var div_47 = root_7();
							var div_48 = $.child(div_47);
							var node_22 = $.child(div_48);

							Icon(node_22, { name: 'plus', size: 'sm' });

							var button_4 = $.sibling(node_22, 4);
							var node_23 = $.child(button_4);

							{
								let $0 = $.derived(() => clipboard.isCopied('create-commands') ? 'check' : 'copy');

								Icon(node_23, {
									get name() {
										return $.get($0);
									},
									size: 'sm'
								});
							}

							$.next();
							$.reset(button_4);
							$.reset(div_48);

							var div_49 = $.sibling(div_48, 2);
							var text_19 = $.only_child(div_49);

							$.reset(div_47);

							$.template_effect(
								($0) => {
									$.set_class(button_4, 1, `copy-button ${$0 ?? ''}`, 'svelte-lsjtaq');
									$.set_text(text_19, `Add ${$.get(results).analysis.missingPTRs.length ?? ''} missing PTR records to your reverse zone files.`);
								},
								[() => clipboard.isCopied('create-commands') ? 'copied' : '']
							);

							$.delegated('click', button_4, () => $.get(results) && clipboard.copy(generateCreateCommands($.get(results).analysis.missingPTRs), 'create-commands'));
							$.append($$anchor, div_47);
						};

						$.if(node_21, ($$render) => {
							if ($.get(results).analysis.missingPTRs.length > 0) $$render(consequent_5);
						});
					}

					var node_24 = $.sibling(node_21, 2);

					{
						var consequent_6 = ($$anchor) => {
							var div_50 = root_8();
							var div_51 = $.child(div_50);
							var node_25 = $.child(div_51);

							Icon(node_25, { name: 'trash-2', size: 'sm' });
							$.next(2);
							$.reset(div_51);

							var div_52 = $.sibling(div_51, 2);
							var text_20 = $.only_child(div_52);

							$.reset(div_50);

							$.template_effect(() => $.set_text(text_20, `Review ${$.get(results).analysis.extraPTRs.length ?? ''} extra PTR records that don't correspond to addresses in this
                    CIDR block.`));

							$.append($$anchor, div_50);
						};

						$.if(node_24, ($$render) => {
							if ($.get(results).analysis.extraPTRs.length > 0) $$render(consequent_6);
						});
					}

					var node_26 = $.sibling(node_24, 2);

					{
						var consequent_7 = ($$anchor) => {
							var div_53 = root_9();
							var div_54 = $.child(div_53);
							var node_27 = $.child(div_54);

							Icon(node_27, { name: 'edit', size: 'sm' });
							$.next(2);
							$.reset(div_54);

							var div_55 = $.sibling(div_54, 2);
							var text_21 = $.only_child(div_55);

							$.reset(div_53);
							$.template_effect(() => $.set_text(text_21, `${$.get(results).analysis.totalAddresses - $.get(results).analysis.missingPTRs.length - $.get(results).analysis.patternMatches} existing PTR records don't match the naming pattern.`));
							$.append($$anchor, div_53);
						};

						var d_1 = $.derived(() => $.get(namingPattern).trim() && $.get(results).analysis.patternMatches < $.get(results).analysis.totalAddresses - $.get(results).analysis.missingPTRs.length);

						$.if(node_26, ($$render) => {
							if ($.get(d_1)) $$render(consequent_7);
						});
					}

					var node_28 = $.sibling(node_26, 2);

					{
						var consequent_8 = ($$anchor) => {
							var div_56 = root_10();
							var div_57 = $.child(div_56);
							var node_29 = $.child(div_57);

							Icon(node_29, { name: 'check-circle', size: 'sm' });
							$.next(2);
							$.reset(div_57);

							var div_58 = $.sibling(div_57, 2);
							var text_22 = $.only_child(div_58);

							$.reset(div_56);
							$.template_effect(($0) => $.set_text(text_22, `Your reverse DNS coverage is excellent with ${$0 ?? ''}% completeness.`), [() => $.get(results).analysis.coverage.toFixed(1)]);
							$.append($$anchor, div_56);
						};

						$.if(node_28, ($$render) => {
							if ($.get(results).analysis.coverage >= 95) $$render(consequent_8);
						});
					}

					$.reset(div_46);
					$.reset(div_44);
					$.reset(div_33);

					$.template_effect(
						($0) => {
							$.set_class(
								div_25,
								1,
								`coverage-fill ${$.get(results).analysis.coverage >= 80
									? 'good'
									: $.get(results).analysis.coverage >= 50 ? 'fair' : 'poor'}`,
								'svelte-lsjtaq'
							);

							$.set_style(div_25, `width: ${$.get(results).analysis.coverage ?? ''}%`);
							$.set_text(text_7, `${$0 ?? ''}% Coverage`);
							$.set_text(text_8, $.get(results).analysis.totalAddresses);
							$.set_text(text_9, $.get(results).analysis.totalAddresses - $.get(results).analysis.missingPTRs.length);
							$.set_text(text_10, $.get(results).analysis.missingPTRs.length);
							$.set_text(text_11, $.get(results).analysis.extraPTRs.length);
						},
						[() => $.get(results).analysis.coverage.toFixed(1)]
					);

					$.append($$anchor, fragment);
				};

				var alternate = ($$anchor) => {
					var div_59 = root_12();
					var node_30 = $.child(div_59);

					Icon(node_30, { name: 'alert-triangle', size: 'lg' });

					var p = $.sibling(node_30, 4);
					var text_23 = $.only_child(p, true);

					$.next(2);
					$.reset(div_59);
					$.template_effect(() => $.set_text(text_23, $.get(results).error));
					$.append($$anchor, div_59);
				};

				$.if(node_8, ($$render) => {
					if ($.get(results).success) $$render(consequent_9); else $$render(alternate, -1);
				});
			}

			$.reset(div_21);
			$.append($$anchor, div_21);
		};

		var d_2 = $.derived(() => $.get(results) && $.get(cidrInput).trim());

		$.if(node_7, ($$render) => {
			if ($.get(d_2)) $$render(consequent_10);
		});
	}

	$.next(2);
	$.reset(div);

	$.template_effect(() => $.set_class(
		input,
		1,
		`cidr-input ${$.get(results)?.success === true
			? 'valid'
			: $.get(results)?.success === false ? 'invalid' : ''}`,
		'svelte-lsjtaq'
	));

	$.delegated('input', input, handleInputChange);
	$.bind_value(input, () => $.get(cidrInput), ($$value) => $.set(cidrInput, $$value));
	$.delegated('input', textarea, handleInputChange);
	$.bind_value(textarea, () => $.get(existingPTRsInput), ($$value) => $.set(existingPTRsInput, $$value));
	$.delegated('input', input_1, handleInputChange);
	$.bind_value(input_1, () => $.get(namingPattern), ($$value) => $.set(namingPattern, $$value));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'input']);