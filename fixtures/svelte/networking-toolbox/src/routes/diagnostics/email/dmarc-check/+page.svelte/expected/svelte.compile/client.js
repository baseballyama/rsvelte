import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '$lib/components/global/Icon.svelte';
import { useDiagnosticState, useClipboard, useExamples } from '$lib/composables';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import ErrorCard from '$lib/components/common/ErrorCard.svelte';
import '../../../../styles/diagnostics-pages.scss';

var root = $.from_html(`<!> Checking DMARC...`, 1);
var root_1 = $.from_html(`<!> Check DMARC Policy`, 1);
var root_2 = $.from_html(`<p class="alignment-warning svelte-yzmxcb"> </p>`);
var root_3 = $.from_html(`<div class="recommendation-item svelte-yzmxcb"><!> <span> </span></div>`);
var root_4 = $.from_html(`<div class="recommendations-section svelte-yzmxcb"><h5 class="svelte-yzmxcb">Deliverability Recommendations</h5> <div class="recommendation-list svelte-yzmxcb"></div></div>`);
var root_5 = $.from_html(`<div><div class="policy-header svelte-yzmxcb"><!> <span>Subdomain Policy</span></div> <div class="policy-value svelte-yzmxcb"><span class="policy-text svelte-yzmxcb"> </span></div></div>`);
var root_6 = $.from_html(`<span class="email-address svelte-yzmxcb"> </span> <span class="reporting-description svelte-yzmxcb">Daily summaries of DMARC activity</span>`, 1);
var root_7 = $.from_html(`<span class="not-configured svelte-yzmxcb">Not configured</span> <span class="reporting-description svelte-yzmxcb">Missing aggregate reporting - consider adding rua=</span>`, 1);
var root_8 = $.from_html(`<span class="email-address svelte-yzmxcb"> </span> <span class="reporting-description svelte-yzmxcb">Real-time failure reports with message samples</span>`, 1);
var root_9 = $.from_html(`<span class="not-configured svelte-yzmxcb">Not configured</span> <span class="reporting-description svelte-yzmxcb">Optional - provides detailed failure analysis</span>`, 1);
var root_10 = $.from_html(`<div class="deliverability-section svelte-yzmxcb"><div><!> <div><h4 class="svelte-yzmxcb">Email Deliverability Impact</h4> <p class="policy-impact svelte-yzmxcb"> </p> <!></div></div> <!></div> <div class="record-section svelte-yzmxcb"><h4 class="svelte-yzmxcb">DMARC Record</h4> <div class="record-display svelte-yzmxcb"><div class="record-location svelte-yzmxcb"> </div> <code class="svelte-yzmxcb"> </code></div></div> <div class="policy-section svelte-yzmxcb"><h4 class="svelte-yzmxcb">Policy Configuration</h4> <div class="policy-grid svelte-yzmxcb"><div><div class="policy-header svelte-yzmxcb"><!> <span>Main Policy</span></div> <div class="policy-value svelte-yzmxcb"><span class="policy-text svelte-yzmxcb"> </span> <span class="policy-description svelte-yzmxcb"><!></span></div></div> <!> <div><div class="policy-header svelte-yzmxcb"><!> <span>Coverage</span></div> <div class="policy-value svelte-yzmxcb"><span class="policy-text svelte-yzmxcb"> </span> <span class="policy-description svelte-yzmxcb">of messages affected</span></div></div> <div><div class="policy-header svelte-yzmxcb"><!> <span>DKIM Alignment</span></div> <div class="policy-value svelte-yzmxcb"><span class="policy-text svelte-yzmxcb"> </span> <span class="policy-description svelte-yzmxcb"> </span></div></div> <div><div class="policy-header svelte-yzmxcb"><!> <span>SPF Alignment</span></div> <div class="policy-value svelte-yzmxcb"><span class="policy-text svelte-yzmxcb"> </span> <span class="policy-description svelte-yzmxcb"> </span></div></div> <div class="policy-item secondary svelte-yzmxcb"><div class="policy-header svelte-yzmxcb"><!> <span>Failure Options</span></div> <div class="policy-value svelte-yzmxcb"><span class="policy-text svelte-yzmxcb"> </span> <span class="policy-description svelte-yzmxcb"><!></span></div></div></div></div> <div class="reporting-section svelte-yzmxcb"><h4 class="svelte-yzmxcb">Email Reporting Configuration</h4> <div class="reporting-grid svelte-yzmxcb"><div class="reporting-item svelte-yzmxcb"><div class="reporting-header svelte-yzmxcb"><!> <span>Aggregate Reports (RUA)</span></div> <div class="reporting-value svelte-yzmxcb"><!></div></div> <div class="reporting-item svelte-yzmxcb"><div class="reporting-header svelte-yzmxcb"><!> <span>Forensic Reports (RUF)</span></div> <div class="reporting-value svelte-yzmxcb"><!></div></div></div></div>`, 1);
var root_11 = $.from_html(`<div class="card results-card"><div class="card-header row"><h3>DMARC Policy Analysis</h3> <button class="copy-btn"><!> </button></div> <div class="card-content"><!></div></div>`);
var root_12 = $.from_html(`<div class="card warning-card none-found svelte-yzmxcb"><div class="card-content"><div class="warning-content svelte-yzmxcb"><!> <div><strong class="svelte-yzmxcb">No DMARC Record Found</strong> <p class="svelte-yzmxcb">Domain <code class="svelte-yzmxcb"> </code> does not have a DMARC policy configured at <code class="svelte-yzmxcb"> </code>.</p> <div class="deliverability-impact svelte-yzmxcb"><h5 class="svelte-yzmxcb">Email Deliverability Impact:</h5> <ul class="svelte-yzmxcb"><li class="svelte-yzmxcb">No protection against email spoofing</li> <li class="svelte-yzmxcb">May affect email reputation with major providers</li> <li class="svelte-yzmxcb">Missing visibility into email authentication failures</li> <li class="svelte-yzmxcb">Consider implementing DMARC starting with p=none for monitoring</li></ul></div></div></div></div></div>`);

var root_13 = $.from_html(`<div class="card"><header class="card-header"><h1>Email DMARC Policy Checker</h1> <p>Check DMARC (Domain-based Message Authentication, Reporting & Conformance) policies with focus on email
      deliverability impact. Understand how DMARC affects your email delivery and reputation.</p></header> <!> <div class="card input-card"><div class="card-header"><h3>DMARC Policy Check</h3></div> <div class="card-content"><div class="form-group"><label for="domain">Domain Name <input id="domain" type="text" placeholder="example.com"/></label></div> <div class="action-section svelte-yzmxcb"><button class="check-btn lookup-btn"><!></button></div></div></div> <!> <!> <!> <div class="card info-card"><div class="card-header"><h3>Understanding DMARC for Email Delivery</h3></div> <div class="card-content"><div class="info-grid"><div class="info-section"><h4>DMARC Policies & Email Impact</h4> <div class="policy-explanations svelte-yzmxcb"><div class="explanation-item svelte-yzmxcb"><strong class="svelte-yzmxcb">none:</strong> Monitor mode - no delivery impact, collect data only</div> <div class="explanation-item svelte-yzmxcb"><strong class="svelte-yzmxcb">quarantine:</strong> Failed messages may go to spam/junk folder</div> <div class="explanation-item svelte-yzmxcb"><strong class="svelte-yzmxcb">reject:</strong> Failed messages rejected outright - strongest protection</div></div></div> <div class="info-section"><h4>Email Delivery Best Practices</h4> <ul><li>Start with p=none to monitor before enforcement</li> <li>Gradually increase to p=quarantine then p=reject</li> <li>Set up aggregate reporting to monitor delivery</li> <li>Test alignment requirements carefully</li> <li>Consider subdomain policy for comprehensive coverage</li></ul></div> <div class="info-section"><h4>Alignment Modes & Delivery</h4> <div class="alignment-explanations svelte-yzmxcb"><div class="explanation-item svelte-yzmxcb"><strong class="svelte-yzmxcb">Relaxed (r):</strong> Allows organizational domain matching (safer for delivery)</div> <div class="explanation-item svelte-yzmxcb"><strong class="svelte-yzmxcb">Strict (s):</strong> Requires exact domain matching (higher security, delivery risk)</div></div></div> <div class="info-section"><h4>Common Delivery Issues</h4> <ul><li>Strict alignment with third-party senders</li> <li>Forwarded emails failing DMARC checks</li> <li>Mailing lists modifying message headers</li> <li>Percentage rollout causing inconsistent delivery</li></ul></div></div></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let domain = $.state('gmail.com');
	const diagnosticState = useDiagnosticState();
	const clipboard = useClipboard();

	const examplesList = [
		{
			domain: 'gmail.com',
			description: 'Google Gmail DMARC policy'
		},

		{
			domain: 'outlook.com',
			description: 'Microsoft Outlook DMARC setup'
		},
		{ domain: 'github.com', description: 'GitHub enterprise DMARC' },
		{
			domain: 'paypal.com',
			description: 'PayPal strict DMARC policy'
		},

		{
			domain: 'amazon.com',
			description: 'Amazon DMARC implementation'
		},

		{
			domain: 'salesforce.com',
			description: 'Salesforce DMARC configuration'
		}
	];

	const examples = useExamples(examplesList);

	async function checkDMARC() {
		diagnosticState.startOperation();

		try {
			const response = await fetch('/api/internal/diagnostics/email', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: 'dmarc-check', domain: $.get(domain).trim() })
			});

			if (!response.ok) {
				throw new Error(`DMARC check failed: ${response.status}`);
			}

			const data = await response.json();

			diagnosticState.setResults(data);
		} catch(err) {
			diagnosticState.setError(err instanceof Error ? err.message : 'Unknown error occurred');
		}
	}

	function loadExample(example, index) {
		$.set(domain, example.domain, true);
		examples.select(index);
		checkDMARC();
	}

	function getPolicyColor(policy) {
		switch (policy) {
			case 'reject':
				return 'success';

			case 'quarantine':
				return 'warning';

			case 'none':
				return 'error';

			default:
				return 'secondary';
		}
	}

	function getPolicyIcon(policy) {
		switch (policy) {
			case 'reject':
				return 'shield-check';

			case 'quarantine':
				return 'shield-alert';

			case 'none':
				return 'shield-x';

			default:
				return 'shield';
		}
	}

	function getAlignmentColor(alignment) {
		switch (alignment) {
			case 's':
				return 'success';

			case 'r':
				return 'warning';

			default:
				return 'secondary';
		}
	}

	async function copyResults() {
		if (!diagnosticState.results) return;

		let text = `DMARC Check for ${$.get(domain)}\n`;

		text += `Generated at: ${new Date().toISOString()}\n\n`;

		if (diagnosticState.results.record) {
			text += `DMARC Record:\n${diagnosticState.results.record}\n\n`;
		}

		if (diagnosticState.results.deliverabilityHints) {
			text += `Email Deliverability Impact:\n`;
			text += `${diagnosticState.results.deliverabilityHints.policyImpact}\n\n`;

			if (diagnosticState.results.deliverabilityHints.recommendations.length > 0) {
				text += `Recommendations:\n`;

				diagnosticState.results.deliverabilityHints.recommendations.forEach((rec) => {
					text += `  • ${rec}\n`;
				});

				text += `\n`;
			}
		}

		if (diagnosticState.results.parsed) {
			const p = diagnosticState.results.parsed;

			text += `Policy Configuration:\n`;
			text += `  Main Policy: ${p.policy}\n`;

			if (p.subdomainPolicy) text += `  Subdomain Policy: ${p.subdomainPolicy}\n`;

			text += `  DKIM Alignment: ${p.alignment.dkim} (${p.alignment.dkim === 's' ? 'strict' : 'relaxed'})\n`;
			text += `  SPF Alignment: ${p.alignment.spf} (${p.alignment.spf === 's' ? 'strict' : 'relaxed'})\n`;
			text += `  Percentage: ${p.percentage}%\n`;

			if (p.reporting.aggregate) text += `  Aggregate Reports: ${p.reporting.aggregate}\n`;
			if (p.reporting.forensic) text += `  Forensic Reports: ${p.reporting.forensic}\n`;
		}

		await clipboard.copy(text);
	}

	var div = root_13();
	var node = $.sibling($.child(div), 2);

	ExamplesCard(node, {
		get examples() {
			return examplesList;
		},

		get selectedIndex() {
			return examples.selectedIndex;
		},
		onSelect: loadExample,
		title: 'DMARC Examples',
		getLabel: (ex) => ex.domain,
		getDescription: (ex) => ex.description,
		getTooltip: (ex) => `Check DMARC policy for ${ex.domain}`
	});

	var div_1 = $.sibling(node, 2);
	var div_2 = $.sibling($.child(div_1), 2);
	var div_3 = $.child(div_2);
	var label = $.child(div_3);
	var input = $.sibling($.child(label));

	$.remove_input_defaults(input);
	$.reset(label);
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var button = $.child(div_4);
	var node_1 = $.child(button);

	{
		var consequent = ($$anchor) => {
			var fragment = root();
			var node_2 = $.first_child(fragment);

			Icon(node_2, { name: 'loader', size: 'sm', animate: 'spin' });
			$.next();
			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = root_1();
			var node_3 = $.first_child(fragment_1);

			Icon(node_3, { name: 'shield-check', size: 'sm' });
			$.next();
			$.append($$anchor, fragment_1);
		};

		$.if(node_1, ($$render) => {
			if (diagnosticState.loading) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(button);
	$.reset(div_4);
	$.reset(div_2);
	$.reset(div_1);

	var node_4 = $.sibling(div_1, 2);

	{
		var consequent_14 = ($$anchor) => {
			var div_5 = root_11();
			var div_6 = $.child(div_5);
			var button_1 = $.sibling($.child(div_6), 2);
			var node_5 = $.child(button_1);

			{
				let $0 = $.derived(() => clipboard.isCopied() ? 'check' : 'copy');

				Icon(node_5, {
					get name() {
						return $.get($0);
					},
					size: 'xs'
				});
			}

			var text_1 = $.sibling(node_5);

			$.reset(button_1);
			$.reset(div_6);

			var div_7 = $.sibling(div_6, 2);
			var node_6 = $.child(div_7);

			{
				var consequent_13 = ($$anchor) => {
					var fragment_2 = root_10();
					var div_8 = $.first_child(fragment_2);
					var div_9 = $.child(div_8);
					var node_7 = $.child(div_9);

					{
						let $0 = $.derived(() => getPolicyIcon(diagnosticState.results.parsed.policy));

						Icon(node_7, {
							get name() {
								return $.get($0);
							},
							size: 'md'
						});
					}

					var div_10 = $.sibling(node_7, 2);
					var p_1 = $.sibling($.child(div_10), 2);
					var text_2 = $.only_child(p_1, true);
					var node_8 = $.sibling(p_1, 2);

					{
						var consequent_1 = ($$anchor) => {
							var p_2 = root_2();
							var text_3 = $.only_child(p_2, true);

							$.template_effect(() => $.set_text(text_3, diagnosticState.results.deliverabilityHints.alignmentComplexity.strict));
							$.append($$anchor, p_2);
						};

						$.if(node_8, ($$render) => {
							if (diagnosticState.results.deliverabilityHints.alignmentComplexity?.strict) $$render(consequent_1);
						});
					}

					$.reset(div_10);
					$.reset(div_9);

					var node_9 = $.sibling(div_9, 2);

					{
						var consequent_2 = ($$anchor) => {
							const hintsData = $.derived(() => diagnosticState.results.deliverabilityHints);
							var div_11 = root_4();
							var div_12 = $.sibling($.child(div_11), 2);

							$.each(div_12, 21, () => $.get(hintsData).recommendations, $.index, ($$anchor, recommendation) => {
								var div_13 = root_3();
								var node_10 = $.child(div_13);

								Icon(node_10, { name: 'lightbulb', size: 'xs' });

								var span = $.sibling(node_10, 2);
								var text_4 = $.only_child(span, true);

								$.reset(div_13);
								$.template_effect(() => $.set_text(text_4, $.get(recommendation)));
								$.append($$anchor, div_13);
							});

							$.reset(div_12);
							$.reset(div_11);
							$.append($$anchor, div_11);
						};

						$.if(node_9, ($$render) => {
							if (diagnosticState.results.deliverabilityHints.recommendations.length > 0) $$render(consequent_2);
						});
					}

					$.reset(div_8);

					var div_14 = $.sibling(div_8, 2);
					var div_15 = $.sibling($.child(div_14), 2);
					var div_16 = $.child(div_15);
					var text_5 = $.only_child(div_16);
					var code = $.sibling(div_16, 2);
					var text_6 = $.only_child(code, true);

					$.reset(div_15);
					$.reset(div_14);

					var div_17 = $.sibling(div_14, 2);
					var div_18 = $.sibling($.child(div_17), 2);
					var div_19 = $.child(div_18);
					var div_20 = $.child(div_19);
					var node_11 = $.child(div_20);

					Icon(node_11, { name: 'shield', size: 'sm' });
					$.next(2);
					$.reset(div_20);

					var div_21 = $.sibling(div_20, 2);
					var span_1 = $.child(div_21);
					var text_7 = $.only_child(span_1, true);
					var span_2 = $.sibling(span_1, 2);
					var node_12 = $.child(span_2);

					{
						var consequent_3 = ($$anchor) => {
							var text_8 = $.text('Reject non-compliant messages');

							$.append($$anchor, text_8);
						};

						var consequent_4 = ($$anchor) => {
							var text_9 = $.text('Quarantine suspicious messages');

							$.append($$anchor, text_9);
						};

						var consequent_5 = ($$anchor) => {
							var text_10 = $.text('Monitor only, no action');

							$.append($$anchor, text_10);
						};

						var alternate_1 = ($$anchor) => {
							var text_11 = $.text('Unknown policy');

							$.append($$anchor, text_11);
						};

						$.if(node_12, ($$render) => {
							if (diagnosticState.results.parsed.policy === 'reject') $$render(consequent_3); else if (diagnosticState.results.parsed.policy === 'quarantine') $$render(consequent_4, 1); else if (diagnosticState.results.parsed.policy === 'none') $$render(consequent_5, 2); else $$render(alternate_1, -1);
						});
					}

					$.reset(span_2);
					$.reset(div_21);
					$.reset(div_19);

					var node_13 = $.sibling(div_19, 2);

					{
						var consequent_6 = ($$anchor) => {
							var div_22 = root_5();
							var div_23 = $.child(div_22);
							var node_14 = $.child(div_23);

							Icon(node_14, { name: 'git-branch', size: 'sm' });
							$.next(2);
							$.reset(div_23);

							var div_24 = $.sibling(div_23, 2);
							var span_3 = $.child(div_24);
							var text_12 = $.only_child(span_3, true);

							$.reset(div_24);
							$.reset(div_22);

							$.template_effect(
								($0) => {
									$.set_class(div_22, 1, `policy-item ${$0 ?? ''}`, 'svelte-yzmxcb');
									$.set_text(text_12, diagnosticState.results.parsed.subdomainPolicy);
								},
								[
									() => getPolicyColor(diagnosticState.results.parsed.subdomainPolicy)
								]
							);

							$.append($$anchor, div_22);
						};

						$.if(node_13, ($$render) => {
							if (diagnosticState.results.parsed.subdomainPolicy) $$render(consequent_6);
						});
					}

					var div_25 = $.sibling(node_13, 2);
					var div_26 = $.child(div_25);
					var node_15 = $.child(div_26);

					Icon(node_15, { name: 'percent', size: 'sm' });
					$.next(2);
					$.reset(div_26);

					var div_27 = $.sibling(div_26, 2);
					var span_4 = $.child(div_27);
					var text_13 = $.only_child(span_4);

					$.next(2);
					$.reset(div_27);
					$.reset(div_25);

					var div_28 = $.sibling(div_25, 2);
					var div_29 = $.child(div_28);
					var node_16 = $.child(div_29);

					Icon(node_16, { name: 'key', size: 'sm' });
					$.next(2);
					$.reset(div_29);

					var div_30 = $.sibling(div_29, 2);
					var span_5 = $.child(div_30);
					var text_14 = $.only_child(span_5, true);
					var span_6 = $.sibling(span_5, 2);
					var text_15 = $.only_child(span_6, true);

					$.reset(div_30);
					$.reset(div_28);

					var div_31 = $.sibling(div_28, 2);
					var div_32 = $.child(div_31);
					var node_17 = $.child(div_32);

					Icon(node_17, { name: 'mail', size: 'sm' });
					$.next(2);
					$.reset(div_32);

					var div_33 = $.sibling(div_32, 2);
					var span_7 = $.child(div_33);
					var text_16 = $.only_child(span_7, true);
					var span_8 = $.sibling(span_7, 2);
					var text_17 = $.only_child(span_8, true);

					$.reset(div_33);
					$.reset(div_31);

					var div_34 = $.sibling(div_31, 2);
					var div_35 = $.child(div_34);
					var node_18 = $.child(div_35);

					Icon(node_18, { name: 'settings', size: 'sm' });
					$.next(2);
					$.reset(div_35);

					var div_36 = $.sibling(div_35, 2);
					var span_9 = $.child(div_36);
					var text_18 = $.only_child(span_9, true);
					var span_10 = $.sibling(span_9, 2);
					var node_19 = $.child(span_10);

					{
						var consequent_7 = ($$anchor) => {
							var text_19 = $.text('DKIM and SPF failure');

							$.append($$anchor, text_19);
						};

						var consequent_8 = ($$anchor) => {
							var text_20 = $.text('Any alignment failure');

							$.append($$anchor, text_20);
						};

						var consequent_9 = ($$anchor) => {
							var text_21 = $.text('DKIM failure only');

							$.append($$anchor, text_21);
						};

						var consequent_10 = ($$anchor) => {
							var text_22 = $.text('SPF failure only');

							$.append($$anchor, text_22);
						};

						var alternate_2 = ($$anchor) => {
							var text_23 = $.text('Custom configuration');

							$.append($$anchor, text_23);
						};

						$.if(node_19, ($$render) => {
							if (diagnosticState.results.parsed.reporting.failureOptions === '0') $$render(consequent_7); else if (diagnosticState.results.parsed.reporting.failureOptions === '1') $$render(consequent_8, 1); else if (diagnosticState.results.parsed.reporting.failureOptions === 'd') $$render(consequent_9, 2); else if (diagnosticState.results.parsed.reporting.failureOptions === 's') $$render(consequent_10, 3); else $$render(alternate_2, -1);
						});
					}

					$.reset(span_10);
					$.reset(div_36);
					$.reset(div_34);
					$.reset(div_18);
					$.reset(div_17);

					var div_37 = $.sibling(div_17, 2);
					var div_38 = $.sibling($.child(div_37), 2);
					var div_39 = $.child(div_38);
					var div_40 = $.child(div_39);
					var node_20 = $.child(div_40);

					Icon(node_20, { name: 'bar-chart', size: 'sm' });
					$.next(2);
					$.reset(div_40);

					var div_41 = $.sibling(div_40, 2);
					var node_21 = $.child(div_41);

					{
						var consequent_11 = ($$anchor) => {
							var fragment_3 = root_6();
							var span_11 = $.first_child(fragment_3);
							var text_24 = $.only_child(span_11, true);

							$.next(2);
							$.template_effect(() => $.set_text(text_24, diagnosticState.results.parsed.reporting.aggregate));
							$.append($$anchor, fragment_3);
						};

						var alternate_3 = ($$anchor) => {
							var fragment_4 = root_7();

							$.next(2);
							$.append($$anchor, fragment_4);
						};

						$.if(node_21, ($$render) => {
							if (diagnosticState.results.parsed.reporting.aggregate) $$render(consequent_11); else $$render(alternate_3, -1);
						});
					}

					$.reset(div_41);
					$.reset(div_39);

					var div_42 = $.sibling(div_39, 2);
					var div_43 = $.child(div_42);
					var node_22 = $.child(div_43);

					Icon(node_22, { name: 'search', size: 'sm' });
					$.next(2);
					$.reset(div_43);

					var div_44 = $.sibling(div_43, 2);
					var node_23 = $.child(div_44);

					{
						var consequent_12 = ($$anchor) => {
							var fragment_5 = root_8();
							var span_12 = $.first_child(fragment_5);
							var text_25 = $.only_child(span_12, true);

							$.next(2);
							$.template_effect(() => $.set_text(text_25, diagnosticState.results.parsed.reporting.forensic));
							$.append($$anchor, fragment_5);
						};

						var alternate_4 = ($$anchor) => {
							var fragment_6 = root_9();

							$.next(2);
							$.append($$anchor, fragment_6);
						};

						$.if(node_23, ($$render) => {
							if (diagnosticState.results.parsed.reporting.forensic) $$render(consequent_12); else $$render(alternate_4, -1);
						});
					}

					$.reset(div_44);
					$.reset(div_42);
					$.reset(div_38);
					$.reset(div_37);

					$.template_effect(
						($0, $1, $2, $3, $4) => {
							$.set_class(div_9, 1, `deliverability-overview ${$0 ?? ''}`, 'svelte-yzmxcb');
							$.set_text(text_2, diagnosticState.results.deliverabilityHints.policyImpact);
							$.set_text(text_5, `_dmarc.${$.get(domain) ?? ''}`);
							$.set_text(text_6, diagnosticState.results.record);
							$.set_class(div_19, 1, `policy-item ${$1 ?? ''}`, 'svelte-yzmxcb');
							$.set_text(text_7, diagnosticState.results.parsed.policy);
							$.set_class(div_25, 1, `policy-item ${$2 ?? ''}`, 'svelte-yzmxcb');
							$.set_text(text_13, `${diagnosticState.results.parsed.percentage ?? ''}%`);
							$.set_class(div_28, 1, `policy-item ${$3 ?? ''}`, 'svelte-yzmxcb');
							$.set_text(text_14, diagnosticState.results.parsed.alignment.dkim === 's' ? 'Strict' : 'Relaxed');

							$.set_text(text_15, diagnosticState.results.parsed.alignment.dkim === 's'
								? 'Exact domain match required'
								: 'Organizational domain match allowed');

							$.set_class(div_31, 1, `policy-item ${$4 ?? ''}`, 'svelte-yzmxcb');
							$.set_text(text_16, diagnosticState.results.parsed.alignment.spf === 's' ? 'Strict' : 'Relaxed');

							$.set_text(text_17, diagnosticState.results.parsed.alignment.spf === 's'
								? 'Exact domain match required'
								: 'Organizational domain match allowed');

							$.set_text(text_18, diagnosticState.results.parsed.reporting.failureOptions);
						},
						[
							() => getPolicyColor(diagnosticState.results.parsed.policy),
							() => getPolicyColor(diagnosticState.results.parsed.policy),
							() => parseInt(diagnosticState.results.parsed.percentage) === 100 ? 'success' : 'warning',
							() => getAlignmentColor(diagnosticState.results.parsed.alignment.dkim),
							() => getAlignmentColor(diagnosticState.results.parsed.alignment.spf)
						]
					);

					$.append($$anchor, fragment_2);
				};

				$.if(node_6, ($$render) => {
					if (diagnosticState.results.parsed && diagnosticState.results.deliverabilityHints) $$render(consequent_13);
				});
			}

			$.reset(div_7);
			$.reset(div_5);

			$.template_effect(
				($0, $1) => {
					button_1.disabled = $0;
					$.set_text(text_1, ` ${$1 ?? ''}`);
				},
				[
					() => clipboard.isCopied(),
					() => clipboard.isCopied() ? 'Copied!' : 'Copy Results'
				]
			);

			$.delegated('click', button_1, copyResults);
			$.append($$anchor, div_5);
		};

		$.if(node_4, ($$render) => {
			if (diagnosticState.results && diagnosticState.results.hasRecord) $$render(consequent_14);
		});
	}

	var node_24 = $.sibling(node_4, 2);

	{
		var consequent_15 = ($$anchor) => {
			var div_45 = root_12();
			var div_46 = $.child(div_45);
			var div_47 = $.child(div_46);
			var node_25 = $.child(div_47);

			Icon(node_25, { name: 'shield-x', size: 'md' });

			var div_48 = $.sibling(node_25, 2);
			var p_3 = $.sibling($.child(div_48), 2);
			var code_1 = $.sibling($.child(p_3));
			var text_26 = $.only_child(code_1, true);
			var code_2 = $.sibling(code_1, 2);
			var text_27 = $.only_child(code_2);

			$.next();
			$.reset(p_3);
			$.next(2);
			$.reset(div_48);
			$.reset(div_47);
			$.reset(div_46);
			$.reset(div_45);

			$.template_effect(() => {
				$.set_text(text_26, $.get(domain));
				$.set_text(text_27, `_dmarc.${$.get(domain) ?? ''}`);
			});

			$.append($$anchor, div_45);
		};

		$.if(node_24, ($$render) => {
			if (diagnosticState.results && diagnosticState.results.hasRecord === false) $$render(consequent_15);
		});
	}

	var node_26 = $.sibling(node_24, 2);

	ErrorCard(node_26, {
		title: 'DMARC Check Failed',
		get error() {
			return diagnosticState.error;
		}
	});

	$.next(2);
	$.reset(div);
	$.template_effect(($0) => button.disabled = $0, [() => diagnosticState.loading || !$.get(domain).trim()]);

	$.delegated('change', input, () => {
		examples.clear();

		if ($.get(domain)) checkDMARC();
	});

	$.bind_value(input, () => $.get(domain), ($$value) => $.set(domain, $$value));
	$.delegated('click', button, checkDMARC);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['change', 'click']);