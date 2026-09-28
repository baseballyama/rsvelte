import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import '../../../../styles/diagnostics-pages.scss';

var root = $.from_html(`<button><h5> </h5> <p> </p></button>`);
var root_1 = $.from_html(`<!> Checking SPF...`, 1);
var root_2 = $.from_html(`<!> Check SPF Policy`, 1);
var root_3 = $.from_html(`<div class="detail-item error svelte-1ohibvx"><!> <div class="svelte-1ohibvx"><span class="detail-label svelte-1ohibvx">Allows All (+all)</span> <span class="detail-value svelte-1ohibvx">Enabled</span> <span class="detail-description svelte-1ohibvx">WARNING: Any server can send email for this domain</span></div></div>`);
var root_4 = $.from_html(`<div class="deliverability-section svelte-1ohibvx"><div><!> <div class="svelte-1ohibvx"><h4 class="svelte-1ohibvx"> </h4> <p class="svelte-1ohibvx"><!></p></div></div> <div class="deliverability-details svelte-1ohibvx"><div><!> <div class="svelte-1ohibvx"><span class="detail-label svelte-1ohibvx">Hard Fail (-all)</span> <span class="detail-value svelte-1ohibvx"> </span> <span class="detail-description svelte-1ohibvx"> </span></div></div> <div><!> <div class="svelte-1ohibvx"><span class="detail-label svelte-1ohibvx">Soft Fail (~all)</span> <span class="detail-value svelte-1ohibvx"> </span> <span class="detail-description svelte-1ohibvx"> </span></div></div> <!></div></div>`);
var root_5 = $.from_html(`<div class="warning-box svelte-1ohibvx"><!> <div><strong class="svelte-1ohibvx">DNS Lookup Limit Exceeded</strong> <p class="svelte-1ohibvx"> </p></div></div>`);
var root_6 = $.from_html(`<div class="info-box svelte-1ohibvx"><!> <div><strong class="svelte-1ohibvx">High DNS Lookup Count</strong> <p class="svelte-1ohibvx"> </p></div></div>`);
var root_7 = $.from_html(`<div class="mechanism-item svelte-1ohibvx"><code class="svelte-1ohibvx"> </code> <span class="mechanism-description svelte-1ohibvx"><!></span></div>`);
var root_8 = $.from_html(`<div class="mechanisms-section svelte-1ohibvx"><h5 class="svelte-1ohibvx">Direct Mechanisms</h5> <div class="mechanism-list svelte-1ohibvx"></div></div>`);
var root_9 = $.from_html(`<div class="include-record svelte-1ohibvx"><code class="svelte-1ohibvx"> </code></div>`);
var root_10 = $.from_html(`<div class="include-error svelte-1ohibvx"><!> <span> </span></div>`);
var root_11 = $.from_html(`<div class="include-item svelte-1ohibvx"><div class="include-header svelte-1ohibvx"><!> <span class="include-domain svelte-1ohibvx"> </span></div> <!> <!></div>`);
var root_12 = $.from_html(`<div class="includes-section svelte-1ohibvx"><h5 class="svelte-1ohibvx">Included SPF Policies</h5> <div class="include-list svelte-1ohibvx"></div></div>`);
var root_13 = $.from_html(`<div class="analysis-section svelte-1ohibvx"><h4 class="svelte-1ohibvx">SPF Policy Breakdown</h4> <!> <!> <!></div>`);
var root_14 = $.from_html(`<!> <div class="record-section svelte-1ohibvx"><h4 class="svelte-1ohibvx">SPF Record</h4> <div class="record-display svelte-1ohibvx"><div class="record-location svelte-1ohibvx"> </div> <code class="svelte-1ohibvx"> </code></div></div> <!>`, 1);

var root_15 = $.from_html(`<div class="no-record-section svelte-1ohibvx"><div class="no-record-content svelte-1ohibvx"><!> <div><h4 class="svelte-1ohibvx">No SPF Record Found</h4> <p class="svelte-1ohibvx">Domain <code class="svelte-1ohibvx"> </code> does not have an SPF record configured.</p> <p class="risk-warning svelte-1ohibvx">This means anyone can send email claiming to be from this domain, significantly increasing spoofing
                  risk.</p></div></div></div>`);

var root_16 = $.from_html(`<div class="card results-card"><div class="card-header row"><h3>SPF Policy Analysis</h3> <button class="copy-btn"><!> </button></div> <div class="card-content"><!></div></div>`);
var root_17 = $.from_html(`<div class="card error-card"><div class="card-content"><div class="error-content"><!> <div><strong>SPF Check Failed</strong> <p> </p></div></div></div></div>`);

var root_18 = $.from_html(`<div class="card"><header class="card-header"><h1>Email SPF Policy Checker</h1> <p>Check SPF (Sender Policy Framework) records for email authentication and deliverability. Analyze which servers are
      authorized to send email for your domain and assess delivery risk.</p></header> <div class="card examples-card"><details class="examples-details"><summary class="examples-summary"><!> <h4>SPF Examples</h4></summary> <div class="examples-grid"></div></details></div> <div class="card input-card"><div class="card-header"><h3>SPF Policy Check</h3></div> <div class="card-content"><div class="form-group"><label for="domain">Domain Name <input id="domain" type="text" placeholder="example.com"/></label></div> <div class="action-section svelte-1ohibvx"><button class="check-btn lookup-btn"><!></button></div></div></div> <!> <!> <div class="card info-card"><div class="card-header"><h3>Understanding SPF for Email</h3></div> <div class="card-content"><div class="info-grid"><div class="info-section"><h4>SPF Mechanisms</h4> <div class="mechanism-explanations svelte-1ohibvx"><div class="mechanism-explanation svelte-1ohibvx"><strong class="svelte-1ohibvx">ip4/ip6:</strong> Authorize specific IP addresses or networks</div> <div class="mechanism-explanation svelte-1ohibvx"><strong class="svelte-1ohibvx">a/mx:</strong> Authorize servers from A or MX records</div> <div class="mechanism-explanation svelte-1ohibvx"><strong class="svelte-1ohibvx">include:</strong> Include another domain's SPF policy</div> <div class="mechanism-explanation svelte-1ohibvx"><strong class="svelte-1ohibvx">all:</strong> Final policy decision (+pass, ~soft fail, -hard fail)</div></div></div> <div class="info-section"><h4>Email Deliverability</h4> <ul><li><strong>Hard Fail (-all):</strong> Best security, blocks unauthorized senders</li> <li><strong>Soft Fail (~all):</strong> Marks suspicious, doesn't block delivery</li> <li><strong>No SPF:</strong> High spoofing risk, may affect deliverability</li> <li><strong>Too many lookups:</strong> Can cause delivery failures</li></ul></div> <div class="info-section"><h4>Best Practices</h4> <ul><li>Use -all for hard fail when possible</li> <li>Keep DNS lookups under 10 (preferably under 5)</li> <li>Test SPF changes before deployment</li> <li>Monitor email delivery after SPF changes</li></ul></div> <div class="info-section"><h4>Common SPF Examples</h4> <div class="spf-examples svelte-1ohibvx"><div class="spf-example svelte-1ohibvx"><code class="svelte-1ohibvx">v=spf1 include:_spf.google.com ~all</code> <span>Use Google Workspace with soft fail</span></div> <div class="spf-example svelte-1ohibvx"><code class="svelte-1ohibvx">v=spf1 ip4:192.168.1.1 -all</code> <span>Only allow specific IP with hard fail</span></div> <div class="spf-example svelte-1ohibvx"><code class="svelte-1ohibvx">v=spf1 a mx -all</code> <span>Allow A and MX record servers with hard fail</span></div></div></div></div></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let domain = $.state('gmail.com');
	let loading = $.state(false);
	let results = $.state(null);
	let error = $.state(null);
	let copiedState = $.state(false);
	let selectedExampleIndex = $.state(null);

	const examples = [
		{ domain: 'gmail.com', description: 'Google Gmail SPF policy' },
		{
			domain: 'outlook.com',
			description: 'Microsoft Outlook SPF setup'
		},

		{
			domain: 'salesforce.com',
			description: 'Salesforce SPF configuration'
		},

		{
			domain: 'mailchimp.com',
			description: 'MailChimp email service SPF'
		},

		{
			domain: 'github.com',
			description: 'GitHub enterprise SPF policy'
		},

		{
			domain: 'sendgrid.com',
			description: 'SendGrid email platform SPF'
		}
	];

	async function checkSPF() {
		$.set(loading, true);
		$.set(error, null);
		$.set(results, null);

		try {
			const response = await fetch('/api/internal/diagnostics/email', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: 'spf-check', domain: $.get(domain).trim() })
			});

			if (!response.ok) {
				throw new Error(`SPF check failed: ${response.status}`);
			}

			$.set(results, await response.json(), true);
		} catch(err) {
			$.set(error, err instanceof Error ? err.message : 'Unknown error occurred', true);
		} finally {
			$.set(loading, false);
		}
	}

	function loadExample(example, index) {
		$.set(domain, example.domain, true);
		$.set(selectedExampleIndex, index, true);
		checkSPF();
	}

	function clearExampleSelection() {
		$.set(selectedExampleIndex, null);
	}

	function getDeliverabilityColor(risk) {
		switch (risk) {
			case 'low':
				return 'success';

			case 'medium':
				return 'warning';

			case 'high':
				return 'error';

			default:
				return 'secondary';
		}
	}

	function getDeliverabilityIcon(risk) {
		switch (risk) {
			case 'low':
				return 'shield-check';

			case 'medium':
				return 'shield-alert';

			case 'high':
				return 'shield-x';

			default:
				return 'shield';
		}
	}

	async function copyResults() {
		if (!$.get(results)) return;

		let text = `SPF Check for ${$.get(domain)}\n`;

		text += `Generated at: ${new Date().toISOString()}\n\n`;

		if ($.get(results).record) {
			text += `SPF Record:\n${$.get(results).record}\n\n`;
		}

		if ($.get(results).emailAnalysis) {
			text += `Email Deliverability Analysis:\n`;
			text += `  Risk Level: ${$.get(results).emailAnalysis.deliverabilityRisk}\n`;
			text += `  Hard Fail (-all): ${$.get(results).emailAnalysis.hasHardFail ? 'Yes' : 'No'}\n`;
			text += `  Soft Fail (~all): ${$.get(results).emailAnalysis.hasSoftFail ? 'Yes' : 'No'}\n`;
			text += `  Allows All (+all): ${$.get(results).emailAnalysis.allowsAll ? 'Yes' : 'No'}\n\n`;
		}

		const expandedResults = $.get(results);

		if (expandedResults.expanded) {
			text += `Expanded SPF Analysis:\n`;
			text += `  Total DNS lookups: ${expandedResults.lookupCount || 0}\n`;
			text += `  Mechanisms: ${expandedResults.expanded.mechanisms.join(', ')}\n`;

			if (expandedResults.expanded.includes.length > 0) {
				text += `  Includes: ${expandedResults.expanded.includes.map((inc) => inc.domain).join(', ')}\n`;
			}
		}

		await navigator.clipboard.writeText(text);
		$.set(copiedState, true);
		setTimeout(() => $.set(copiedState, false), 1500);
	}

	var div = root_18();
	var div_1 = $.sibling($.child(div), 2);
	var details = $.child(div_1);
	var summary = $.child(details);
	var node = $.child(summary);

	Icon(node, { name: 'chevron-right', size: 'xs' });
	$.next(2);
	$.reset(summary);

	var div_2 = $.sibling(summary, 2);

	$.each(div_2, 21, () => examples, $.index, ($$anchor, example, i) => {
		var button = root();
		let classes;
		var h5 = $.child(button);
		var text_1 = $.only_child(h5, true);
		var p = $.sibling(h5, 2);
		var text_2 = $.only_child(p, true);

		$.reset(button);
		$.action(button, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => `Check SPF policy for ${$.get(example).domain}`);

		$.template_effect(() => {
			classes = $.set_class(button, 1, 'example-card', null, classes, { selected: $.get(selectedExampleIndex) === i });
			$.set_text(text_1, $.get(example).domain);
			$.set_text(text_2, $.get(example).description);
		});

		$.delegated('click', button, () => loadExample($.get(example), i));
		$.append($$anchor, button);
	});

	$.reset(div_2);
	$.reset(details);
	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);
	var div_4 = $.sibling($.child(div_3), 2);
	var div_5 = $.child(div_4);
	var label = $.child(div_5);
	var input = $.sibling($.child(label));

	$.remove_input_defaults(input);
	$.reset(label);
	$.action(label, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Enter the domain to check SPF policy for');
	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var button_1 = $.child(div_6);
	var node_1 = $.child(button_1);

	{
		var consequent = ($$anchor) => {
			var fragment = root_1();
			var node_2 = $.first_child(fragment);

			Icon(node_2, { name: 'loader', size: 'sm', animate: 'spin' });
			$.next();
			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = root_2();
			var node_3 = $.first_child(fragment_1);

			Icon(node_3, { name: 'mail-check', size: 'sm' });
			$.next();
			$.append($$anchor, fragment_1);
		};

		$.if(node_1, ($$render) => {
			if ($.get(loading)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(button_1);
	$.reset(div_6);
	$.reset(div_4);
	$.reset(div_3);

	var node_4 = $.sibling(div_3, 2);

	{
		var consequent_25 = ($$anchor) => {
			var div_7 = root_16();
			var div_8 = $.child(div_7);
			var button_2 = $.sibling($.child(div_8), 2);
			var node_5 = $.child(button_2);

			{
				let $0 = $.derived(() => $.get(copiedState) ? 'check' : 'copy');

				Icon(node_5, {
					get name() {
						return $.get($0);
					},
					size: 'xs'
				});
			}

			var text_3 = $.sibling(node_5);

			$.reset(button_2);
			$.reset(div_8);

			var div_9 = $.sibling(div_8, 2);
			var node_6 = $.child(div_9);

			{
				var consequent_24 = ($$anchor) => {
					var fragment_2 = root_14();
					var node_7 = $.first_child(fragment_2);

					{
						var consequent_4 = ($$anchor) => {
							var div_10 = root_4();
							var div_11 = $.child(div_10);
							var node_8 = $.child(div_11);

							{
								let $0 = $.derived(() => getDeliverabilityIcon($.get(results).emailAnalysis.deliverabilityRisk));

								Icon(node_8, {
									get name() {
										return $.get($0);
									},
									size: 'md'
								});
							}

							var div_12 = $.sibling(node_8, 2);
							var h4 = $.child(div_12);
							var text_4 = $.only_child(h4);
							var p_1 = $.sibling(h4, 2);
							var node_9 = $.child(p_1);

							{
								var consequent_1 = ($$anchor) => {
									var text_5 = $.text('Strong SPF policy with hard fail - excellent email security');

									$.append($$anchor, text_5);
								};

								var consequent_2 = ($$anchor) => {
									var text_6 = $.text('Moderate SPF policy with soft fail - good but could be stronger');

									$.append($$anchor, text_6);
								};

								var alternate_1 = ($$anchor) => {
									var text_7 = $.text('Weak or missing SPF policy - high risk of email spoofing');

									$.append($$anchor, text_7);
								};

								$.if(node_9, ($$render) => {
									if ($.get(results).emailAnalysis.deliverabilityRisk === 'low') $$render(consequent_1); else if ($.get(results).emailAnalysis.deliverabilityRisk === 'medium') $$render(consequent_2, 1); else $$render(alternate_1, -1);
								});
							}

							$.reset(p_1);
							$.reset(div_12);
							$.reset(div_11);

							var div_13 = $.sibling(div_11, 2);
							var div_14 = $.child(div_13);
							var node_10 = $.child(div_14);

							{
								let $0 = $.derived(() => $.get(results).emailAnalysis.hasHardFail ? 'check-circle' : 'alert-circle');

								Icon(node_10, {
									get name() {
										return $.get($0);
									},
									size: 'sm'
								});
							}

							var div_15 = $.sibling(node_10, 2);
							var span = $.sibling($.child(div_15), 2);
							var text_8 = $.only_child(span, true);
							var span_1 = $.sibling(span, 2);
							var text_9 = $.only_child(span_1, true);

							$.reset(div_15);
							$.reset(div_14);

							var div_16 = $.sibling(div_14, 2);
							var node_11 = $.child(div_16);

							{
								let $0 = $.derived(() => $.get(results).emailAnalysis.hasSoftFail
									? 'alert-triangle'
									: $.get(results).emailAnalysis.hasHardFail ? 'check-circle' : 'x-circle');

								Icon(node_11, {
									get name() {
										return $.get($0);
									},
									size: 'sm'
								});
							}

							var div_17 = $.sibling(node_11, 2);
							var span_2 = $.sibling($.child(div_17), 2);
							var text_10 = $.only_child(span_2, true);
							var span_3 = $.sibling(span_2, 2);
							var text_11 = $.only_child(span_3, true);

							$.reset(div_17);
							$.reset(div_16);

							var node_12 = $.sibling(div_16, 2);

							{
								var consequent_3 = ($$anchor) => {
									var div_18 = root_3();
									var node_13 = $.child(div_18);

									Icon(node_13, { name: 'alert-triangle', size: 'sm' });
									$.next(2);
									$.reset(div_18);
									$.append($$anchor, div_18);
								};

								$.if(node_12, ($$render) => {
									if ($.get(results).emailAnalysis.allowsAll) $$render(consequent_3);
								});
							}

							$.reset(div_13);
							$.reset(div_10);

							$.template_effect(
								($0, $1) => {
									$.set_class(div_11, 1, `deliverability-overview ${$0 ?? ''}`, 'svelte-1ohibvx');
									$.set_text(text_4, `Email Deliverability Risk: ${$1 ?? ''}`);
									$.set_class(div_14, 1, `detail-item ${$.get(results).emailAnalysis.hasHardFail ? 'success' : 'warning'}`, 'svelte-1ohibvx');
									$.set_text(text_8, $.get(results).emailAnalysis.hasHardFail ? 'Enabled' : 'Disabled');

									$.set_text(text_9, $.get(results).emailAnalysis.hasHardFail
										? 'Unauthorized emails will be rejected'
										: 'Consider upgrading to -all for better security');

									$.set_class(
										div_16,
										1,
										`detail-item ${$.get(results).emailAnalysis.hasSoftFail
											? 'warning'
											: $.get(results).emailAnalysis.hasHardFail ? 'success' : 'error'}`,
										'svelte-1ohibvx'
									);

									$.set_text(text_10, $.get(results).emailAnalysis.hasSoftFail ? 'Enabled' : 'Disabled');

									$.set_text(text_11, $.get(results).emailAnalysis.hasSoftFail
										? 'Unauthorized emails marked as suspicious'
										: $.get(results).emailAnalysis.hasHardFail
											? 'Using stronger hard fail instead'
											: 'No SPF enforcement configured');
								},
								[
									() => getDeliverabilityColor($.get(results).emailAnalysis.deliverabilityRisk),
									() => $.get(results).emailAnalysis.deliverabilityRisk.toUpperCase()
								]
							);

							$.append($$anchor, div_10);
						};

						$.if(node_7, ($$render) => {
							if ($.get(results).emailAnalysis) $$render(consequent_4);
						});
					}

					var div_19 = $.sibling(node_7, 2);
					var div_20 = $.sibling($.child(div_19), 2);
					var div_21 = $.child(div_20);
					var text_12 = $.only_child(div_21);
					var code = $.sibling(div_21, 2);
					var text_13 = $.only_child(code, true);

					$.reset(div_20);
					$.reset(div_19);

					var node_14 = $.sibling(div_19, 2);

					{
						var consequent_23 = ($$anchor) => {
							var div_22 = root_13();
							var node_15 = $.sibling($.child(div_22), 2);

							{
								var consequent_5 = ($$anchor) => {
									var div_23 = root_5();
									var node_16 = $.child(div_23);

									Icon(node_16, { name: 'alert-triangle', size: 'sm' });

									var div_24 = $.sibling(node_16, 2);
									var p_2 = $.sibling($.child(div_24), 2);
									var text_14 = $.only_child(p_2);

									$.reset(div_24);
									$.reset(div_23);

									$.template_effect(() => $.set_text(text_14, `This SPF record requires ${$.get(results).lookupCount ?? ''} DNS lookups, which exceeds the RFC limit of 10. This
                      may cause delivery failures.`));

									$.append($$anchor, div_23);
								};

								var consequent_6 = ($$anchor) => {
									var div_25 = root_6();
									var node_17 = $.child(div_25);

									Icon(node_17, { name: 'info', size: 'sm' });

									var div_26 = $.sibling(node_17, 2);
									var p_3 = $.sibling($.child(div_26), 2);
									var text_15 = $.only_child(p_3);

									$.reset(div_26);
									$.reset(div_25);

									$.template_effect(() => $.set_text(text_15, `This SPF record requires ${$.get(results).lookupCount ?? ''} DNS lookups. Consider optimizing to stay well below
                      the 10-lookup limit.`));

									$.append($$anchor, div_25);
								};

								$.if(node_15, ($$render) => {
									if ($.get(results).lookupCount > 8) $$render(consequent_5); else if ($.get(results).lookupCount > 6) $$render(consequent_6, 1);
								});
							}

							var node_18 = $.sibling(node_15, 2);

							{
								var consequent_19 = ($$anchor) => {
									const spfExpanded = $.derived(() => $.get(results).expanded);
									var div_27 = root_8();
									var div_28 = $.sibling($.child(div_27), 2);

									$.each(div_28, 21, () => $.get(spfExpanded).mechanisms, $.index, ($$anchor, mechanism) => {
										var div_29 = root_7();
										var code_1 = $.child(div_29);
										var text_16 = $.only_child(code_1, true);
										var span_4 = $.sibling(code_1, 2);
										var node_19 = $.child(span_4);

										{
											var consequent_7 = ($$anchor) => {
												var text_17 = $.text('SPF version identifier');

												$.append($$anchor, text_17);
											};

											var d = $.derived(() => $.get(mechanism).startsWith('v=spf1'));

											var consequent_8 = ($$anchor) => {
												var text_18 = $.text();

												$.template_effect(($0) => $.set_text(text_18, `IPv4 address or network: ${$0 ?? ''}`), [() => $.get(mechanism).substring(4)]);
												$.append($$anchor, text_18);
											};

											var d_1 = $.derived(() => $.get(mechanism).startsWith('ip4:'));

											var consequent_9 = ($$anchor) => {
												var text_19 = $.text();

												$.template_effect(($0) => $.set_text(text_19, `IPv6 address or network: ${$0 ?? ''}`), [() => $.get(mechanism).substring(4)]);
												$.append($$anchor, text_19);
											};

											var d_2 = $.derived(() => $.get(mechanism).startsWith('ip6:'));

											var consequent_10 = ($$anchor) => {
												var text_20 = $.text();

												$.template_effect(($0) => $.set_text(text_20, `A record lookup for: ${$0 ?? ''}`), [() => $.get(mechanism).substring(2)]);
												$.append($$anchor, text_20);
											};

											var d_3 = $.derived(() => $.get(mechanism).startsWith('a:'));

											var consequent_11 = ($$anchor) => {
												var text_21 = $.text('A record lookup for domain itself');

												$.append($$anchor, text_21);
											};

											var consequent_12 = ($$anchor) => {
												var text_22 = $.text();

												$.template_effect(($0) => $.set_text(text_22, `MX record lookup for: ${$0 ?? ''}`), [() => $.get(mechanism).substring(3)]);
												$.append($$anchor, text_22);
											};

											var d_4 = $.derived(() => $.get(mechanism).startsWith('mx:'));

											var consequent_13 = ($$anchor) => {
												var text_23 = $.text('MX record lookup for domain itself');

												$.append($$anchor, text_23);
											};

											var consequent_14 = ($$anchor) => {
												var text_24 = $.text();

												$.template_effect(($0) => $.set_text(text_24, `DNS lookup test: ${$0 ?? ''}`), [() => $.get(mechanism).substring(7)]);
												$.append($$anchor, text_24);
											};

											var d_5 = $.derived(() => $.get(mechanism).startsWith('exists:'));

											var consequent_15 = ($$anchor) => {
												var text_25 = $.text('Hard fail - reject unauthorized emails');

												$.append($$anchor, text_25);
											};

											var consequent_16 = ($$anchor) => {
												var text_26 = $.text('Soft fail - mark unauthorized emails as suspicious');

												$.append($$anchor, text_26);
											};

											var consequent_17 = ($$anchor) => {
												var text_27 = $.text('Pass all - allow any server (dangerous)');

												$.append($$anchor, text_27);
											};

											var consequent_18 = ($$anchor) => {
												var text_28 = $.text('Neutral - no policy decision');

												$.append($$anchor, text_28);
											};

											var alternate_2 = ($$anchor) => {
												var text_29 = $.text();

												$.template_effect(() => $.set_text(text_29, $.get(mechanism)));
												$.append($$anchor, text_29);
											};

											$.if(node_19, ($$render) => {
												if ($.get(d)) $$render(consequent_7); else if ($.get(d_1)) $$render(consequent_8, 1); else if ($.get(d_2)) $$render(consequent_9, 2); else if ($.get(d_3)) $$render(consequent_10, 3); else if ($.get(mechanism) === 'a') $$render(consequent_11, 4); else if ($.get(d_4)) $$render(consequent_12, 5); else if ($.get(mechanism) === 'mx') $$render(consequent_13, 6); else if ($.get(d_5)) $$render(consequent_14, 7); else if ($.get(mechanism) === '-all') $$render(consequent_15, 8); else if ($.get(mechanism) === '~all') $$render(consequent_16, 9); else if ($.get(mechanism) === '+all') $$render(consequent_17, 10); else if ($.get(mechanism) === '?all') $$render(consequent_18, 11); else $$render(alternate_2, -1);
											});
										}

										$.reset(span_4);
										$.reset(div_29);
										$.template_effect(() => $.set_text(text_16, $.get(mechanism)));
										$.append($$anchor, div_29);
									});

									$.reset(div_28);
									$.reset(div_27);
									$.append($$anchor, div_27);
								};

								$.if(node_18, ($$render) => {
									if ($.get(results).expanded.mechanisms.length > 0) $$render(consequent_19);
								});
							}

							var node_20 = $.sibling(node_18, 2);

							{
								var consequent_22 = ($$anchor) => {
									const spfIncludes = $.derived(() => $.get(results).expanded);
									var div_30 = root_12();
									var div_31 = $.sibling($.child(div_30), 2);

									$.each(div_31, 21, () => $.get(spfIncludes).includes, $.index, ($$anchor, include) => {
										var div_32 = root_11();
										var div_33 = $.child(div_32);
										var node_21 = $.child(div_33);

										Icon(node_21, { name: 'external-link', size: 'xs' });

										var span_5 = $.sibling(node_21, 2);
										var text_30 = $.only_child(span_5, true);

										$.reset(div_33);

										var node_22 = $.sibling(div_33, 2);

										{
											var consequent_20 = ($$anchor) => {
												var div_34 = root_9();
												var code_2 = $.child(div_34);
												var text_31 = $.only_child(code_2, true);

												$.reset(div_34);
												$.template_effect(() => $.set_text(text_31, $.get(include).result.record));
												$.append($$anchor, div_34);
											};

											$.if(node_22, ($$render) => {
												if ($.get(include).result.record) $$render(consequent_20);
											});
										}

										var node_23 = $.sibling(node_22, 2);

										{
											var consequent_21 = ($$anchor) => {
												var div_35 = root_10();
												var node_24 = $.child(div_35);

												Icon(node_24, { name: 'alert-triangle', size: 'xs' });

												var span_6 = $.sibling(node_24, 2);
												var text_32 = $.only_child(span_6, true);

												$.reset(div_35);
												$.template_effect(() => $.set_text(text_32, $.get(include).result.error));
												$.append($$anchor, div_35);
											};

											$.if(node_23, ($$render) => {
												if ($.get(include).result.error) $$render(consequent_21);
											});
										}

										$.reset(div_32);
										$.template_effect(() => $.set_text(text_30, $.get(include).domain));
										$.append($$anchor, div_32);
									});

									$.reset(div_31);
									$.reset(div_30);
									$.append($$anchor, div_30);
								};

								$.if(node_20, ($$render) => {
									if ($.get(results).expanded.includes.length > 0) $$render(consequent_22);
								});
							}

							$.reset(div_22);
							$.append($$anchor, div_22);
						};

						$.if(node_14, ($$render) => {
							if ($.get(results).expanded) $$render(consequent_23);
						});
					}

					$.template_effect(() => {
						$.set_text(text_12, `TXT record for ${$.get(domain) ?? ''}`);
						$.set_text(text_13, $.get(results).record);
					});

					$.append($$anchor, fragment_2);
				};

				var alternate_3 = ($$anchor) => {
					var div_36 = root_15();
					var div_37 = $.child(div_36);
					var node_25 = $.child(div_37);

					Icon(node_25, { name: 'alert-triangle', size: 'md' });

					var div_38 = $.sibling(node_25, 2);
					var p_4 = $.sibling($.child(div_38), 2);
					var code_3 = $.sibling($.child(p_4));
					var text_33 = $.only_child(code_3, true);

					$.next();
					$.reset(p_4);
					$.next(2);
					$.reset(div_38);
					$.reset(div_37);
					$.reset(div_36);
					$.template_effect(() => $.set_text(text_33, $.get(domain)));
					$.append($$anchor, div_36);
				};

				$.if(node_6, ($$render) => {
					if ($.get(results).record) $$render(consequent_24); else $$render(alternate_3, -1);
				});
			}

			$.reset(div_9);
			$.reset(div_7);

			$.template_effect(() => {
				button_2.disabled = $.get(copiedState);
				$.set_text(text_3, ` ${$.get(copiedState) ? 'Copied!' : 'Copy Results'}`);
			});

			$.delegated('click', button_2, copyResults);
			$.append($$anchor, div_7);
		};

		$.if(node_4, ($$render) => {
			if ($.get(results)) $$render(consequent_25);
		});
	}

	var node_26 = $.sibling(node_4, 2);

	{
		var consequent_26 = ($$anchor) => {
			var div_39 = root_17();
			var div_40 = $.child(div_39);
			var div_41 = $.child(div_40);
			var node_27 = $.child(div_41);

			Icon(node_27, { name: 'alert-triangle', size: 'md' });

			var div_42 = $.sibling(node_27, 2);
			var p_5 = $.sibling($.child(div_42), 2);
			var text_34 = $.only_child(p_5, true);

			$.reset(div_42);
			$.reset(div_41);
			$.reset(div_40);
			$.reset(div_39);
			$.template_effect(() => $.set_text(text_34, $.get(error)));
			$.append($$anchor, div_39);
		};

		$.if(node_26, ($$render) => {
			if ($.get(error)) $$render(consequent_26);
		});
	}

	$.next(2);
	$.reset(div);
	$.template_effect(($0) => button_1.disabled = $0, [() => $.get(loading) || !$.get(domain).trim()]);

	$.delegated('change', input, () => {
		clearExampleSelection();

		if ($.get(domain)) checkSPF();
	});

	$.bind_value(input, () => $.get(domain), ($$value) => $.set(domain, $$value));
	$.delegated('click', button_1, checkSPF);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'change']);