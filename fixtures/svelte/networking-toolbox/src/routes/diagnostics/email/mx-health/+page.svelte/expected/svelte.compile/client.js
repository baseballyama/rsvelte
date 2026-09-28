import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '$lib/components/global/Icon.svelte';
import { useDiagnosticState, useClipboard, useExamples } from '$lib/composables';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import ErrorCard from '$lib/components/common/ErrorCard.svelte';
import '../../../../styles/diagnostics-pages.scss';

var root = $.from_html(`<!> Checking MX Health...`, 1);
var root_1 = $.from_html(`<!> Check MX Health`, 1);
var root_2 = $.from_html(`<div class="stat-item svelte-1carq1l"><!> <div><span class="stat-label svelte-1carq1l">Reachable</span> <span> </span></div></div>`);
var root_3 = $.from_html(`<div class="mx-error svelte-1carq1l"><!> <span> </span></div>`);
var root_4 = $.from_html(`<code class="ip-address svelte-1carq1l"> </code>`);
var root_5 = $.from_html(`<span class="no-addresses svelte-1carq1l">None</span>`);
var root_6 = $.from_html(`<span class="port-latency svelte-1carq1l"> </span>`);
var root_7 = $.from_html(`<div><div class="port-info svelte-1carq1l"><span class="port-number svelte-1carq1l"> </span> <span class="port-description svelte-1carq1l"> </span></div> <div class="port-result svelte-1carq1l"><!> <span class="port-status svelte-1carq1l"> </span> <!></div></div>`);
var root_8 = $.from_html(`<div class="ports-section svelte-1carq1l"><div class="ports-header svelte-1carq1l"><!> <span>SMTP Port Connectivity</span></div> <div class="port-checks svelte-1carq1l"></div></div>`);
var root_9 = $.from_html(`<div class="mx-details svelte-1carq1l"><div class="addresses-section svelte-1carq1l"><div class="address-group svelte-1carq1l"><div class="address-header svelte-1carq1l"><!> <span>IPv4 Addresses</span></div> <div class="address-list svelte-1carq1l"><!></div></div> <div class="address-group svelte-1carq1l"><div class="address-header svelte-1carq1l"><!> <span>IPv6 Addresses</span></div> <div class="address-list svelte-1carq1l"><!></div></div></div> <!></div>`);
var root_10 = $.from_html(`<div><div class="mx-header svelte-1carq1l"><div class="mx-info svelte-1carq1l"><div class="mx-exchange svelte-1carq1l"><!> <span class="exchange-name svelte-1carq1l"> </span> <span class="priority-badge svelte-1carq1l"> </span></div> <!></div> <div class="mx-status"><span><!></span></div></div> <!></div>`);
var root_11 = $.from_html(`<div class="card results-card"><div class="card-header row"><h3>MX Health Results</h3> <button class="copy-btn"><!> </button></div> <div class="card-content"><div class="summary-section svelte-1carq1l"><div><!> <div><h4 class="svelte-1carq1l"><!></h4> <p class="svelte-1carq1l"> <!></p></div></div> <div class="summary-stats svelte-1carq1l"><div class="stat-item svelte-1carq1l"><!> <div><span class="stat-label svelte-1carq1l">MX Records</span> <span class="stat-value svelte-1carq1l"> </span></div></div> <div class="stat-item svelte-1carq1l"><!> <div><span class="stat-label svelte-1carq1l">Healthy</span> <span> </span></div></div> <!> <div class="stat-item svelte-1carq1l"><!> <div><span class="stat-label svelte-1carq1l">Redundancy</span> <span> </span></div></div></div></div> <div class="mx-section svelte-1carq1l"><h4 class="svelte-1carq1l">MX Records (by priority)</h4> <div class="mx-list svelte-1carq1l"></div></div></div></div>`);

var root_12 = $.from_html(`<div class="card"><header class="card-header"><h1>Email MX Health Checker</h1> <p>Check mail server (MX) health including DNS resolution and optional SMTP port connectivity testing. Verify your
      email infrastructure is properly configured and reachable.</p></header> <!> <div class="card input-card"><div class="card-header"><h3>MX Health Check</h3></div> <div class="card-content"><div class="form-group"><label for="domain">Domain Name <input id="domain" type="text" placeholder="example.com"/></label></div> <div class="form-group checkbox-group svelte-1carq1l"><label class="checkbox-label svelte-1carq1l"><input type="checkbox" class="svelte-1carq1l"/> <span class="checkbox-text svelte-1carq1l">Check SMTP port connectivity (25, 587, 465)</span></label></div> <div class="action-section svelte-1carq1l"><button class="check-btn lookup-btn"><!></button></div></div></div> <!> <!> <div class="card info-card"><div class="card-header"><h3>Understanding MX Records</h3></div> <div class="card-content"><div class="info-grid"><div class="info-section"><h4>MX Record Basics</h4> <ul><li><strong>Priority:</strong> Lower numbers have higher priority</li> <li><strong>Exchange:</strong> The mail server hostname</li> <li><strong>Redundancy:</strong> Multiple MX records provide failover</li> <li><strong>Load balancing:</strong> Equal priorities distribute load</li></ul></div> <div class="info-section"><h4>SMTP Ports</h4> <div class="port-explanations svelte-1carq1l"><div class="port-explanation svelte-1carq1l"><strong class="svelte-1carq1l">Port 25:</strong> Standard SMTP (server-to-server)</div> <div class="port-explanation svelte-1carq1l"><strong class="svelte-1carq1l">Port 587:</strong> Mail submission (client-to-server, TLS)</div> <div class="port-explanation svelte-1carq1l"><strong class="svelte-1carq1l">Port 465:</strong> SMTPS (deprecated but still used)</div></div></div> <div class="info-section"><h4>Health Indicators</h4> <ul><li>All MX records should resolve to IP addresses</li> <li>At least one SMTP port should be reachable</li> <li>Multiple MX records provide redundancy</li> <li>Lower priority servers should be reachable</li></ul></div> <div class="info-section"><h4>Common Issues</h4> <ul><li>MX pointing to non-existent hosts</li> <li>All SMTP ports blocked by firewall</li> <li>Single point of failure (one MX record)</li> <li>Incorrect priority configuration</li></ul></div></div></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let domain = $.state('gmail.com');
	let checkPorts = $.state(false);
	const diagnosticState = useDiagnosticState();
	const clipboard = useClipboard();

	const examplesList = [
		{
			domain: 'gmail.com',
			description: 'Google Gmail MX infrastructure'
		},

		{
			domain: 'outlook.com',
			description: 'Microsoft Outlook mail servers'
		},

		{
			domain: 'yahoo.com',
			description: 'Yahoo Mail MX configuration'
		},

		{
			domain: 'protonmail.com',
			description: 'ProtonMail secure email setup'
		},

		{
			domain: 'fastmail.com',
			description: 'FastMail professional hosting'
		},

		{
			domain: 'github.com',
			description: 'GitHub enterprise email setup'
		}
	];

	const examples = useExamples(examplesList);

	async function checkMXHealth() {
		diagnosticState.startOperation();

		try {
			const response = await fetch('/api/internal/diagnostics/email', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					action: 'mx-health',
					domain: $.get(domain).trim(),
					checkPorts: $.get(checkPorts)
				})
			});

			if (!response.ok) {
				throw new Error(`MX health check failed: ${response.status}`);
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
		checkMXHealth();
	}

	function getHealthColor(isHealthy) {
		return isHealthy ? 'success' : 'error';
	}

	function getPortStatus(portCheck) {
		const check = portCheck;

		return check.open ? 'success' : 'error';
	}

	function getPortDescription(port) {
		switch (port) {
			case 25:
				return 'SMTP (Standard)';

			case 587:
				return 'Submission (TLS)';

			case 465:
				return 'SMTPS (SSL)';

			default:
				return `Port ${port}`;
		}
	}

	async function copyResults() {
		if (!diagnosticState.results) return;

		let text = `MX Health Check for ${$.get(domain)}\n`;

		text += `Generated at: ${new Date().toISOString()}\n\n`;
		text += `Summary:\n`;
		text += `  Total MX records: ${diagnosticState.results.summary.totalMX}\n`;
		text += `  Healthy MX records: ${diagnosticState.results.summary.healthyMX}\n`;

		if (diagnosticState.results.summary.reachableMX !== null) {
			text += `  Reachable MX records: ${diagnosticState.results.summary.reachableMX}\n`;
		}

		text += `  Overall health: ${diagnosticState.results.summary.healthy ? 'Healthy' : 'Issues detected'}\n`;
		text += `  Redundancy: ${diagnosticState.results.summary.hasRedundancy ? 'Yes' : 'No'}\n\n`;
		text += `MX Records (by priority):\n`;

		const mxRecords = diagnosticState.results.mxRecords;

		mxRecords.forEach((mx, _index) => {
			text += `${_index + 1}. ${mx.exchange} (Priority: ${mx.priority})\n`;

			if (mx.error) {
				text += `   Error: ${mx.error}\n`;
			} else if (mx.addresses) {
				text += `   IPv4: ${mx.addresses.ipv4.join(', ') || 'None'}\n`;
				text += `   IPv6: ${mx.addresses.ipv6.join(', ') || 'None'}\n`;

				if (mx.portChecks) {
					text += `   Port checks:\n`;

					mx.portChecks.forEach((port) => {
						text += `     ${port.port}: ${port.open ? 'Open' : 'Closed'}`;

						if (port.latency) text += ` (${port.latency}ms)`;

						text += `\n`;
					});
				}
			}

			text += `\n`;
		});

		await clipboard.copy(text);
	}

	var div = root_12();
	var node = $.sibling($.child(div), 2);

	ExamplesCard(node, {
		get examples() {
			return examplesList;
		},

		get selectedIndex() {
			return examples.selectedIndex;
		},
		onSelect: loadExample,
		title: 'MX Health Examples',
		getLabel: (ex) => ex.domain,
		getDescription: (ex) => ex.description,
		getTooltip: (ex) => `Check MX health for ${ex.domain}`
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
	var label_1 = $.child(div_4);
	var input_1 = $.child(label_1);

	$.remove_input_defaults(input_1);
	$.next(2);
	$.reset(label_1);
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var button = $.child(div_5);
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

			Icon(node_3, { name: 'mail-check', size: 'sm' });
			$.next();
			$.append($$anchor, fragment_1);
		};

		$.if(node_1, ($$render) => {
			if (diagnosticState.loading) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(button);
	$.reset(div_5);
	$.reset(div_2);
	$.reset(div_1);

	var node_4 = $.sibling(div_1, 2);

	{
		var consequent_10 = ($$anchor) => {
			var div_6 = root_11();
			var div_7 = $.child(div_6);
			var button_1 = $.sibling($.child(div_7), 2);
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
			$.reset(div_7);

			var div_8 = $.sibling(div_7, 2);
			var div_9 = $.child(div_8);
			var div_10 = $.child(div_9);
			var node_6 = $.child(div_10);

			{
				let $0 = $.derived(() => diagnosticState.results.summary.healthy ? 'check-circle' : 'alert-circle');

				Icon(node_6, {
					get name() {
						return $.get($0);
					},
					size: 'md'
				});
			}

			var div_11 = $.sibling(node_6, 2);
			var h4 = $.child(div_11);
			var node_7 = $.child(h4);

			{
				var consequent_1 = ($$anchor) => {
					var text_2 = $.text('Mail Infrastructure Healthy');

					$.append($$anchor, text_2);
				};

				var alternate_1 = ($$anchor) => {
					var text_3 = $.text('Mail Infrastructure Issues');

					$.append($$anchor, text_3);
				};

				$.if(node_7, ($$render) => {
					if (diagnosticState.results.summary.healthy) $$render(consequent_1); else $$render(alternate_1, -1);
				});
			}

			$.reset(h4);

			var p = $.sibling(h4, 2);
			var text_4 = $.child(p);
			var node_8 = $.sibling(text_4);

			{
				var consequent_2 = ($$anchor) => {
					var text_5 = $.text();

					$.template_effect(() => $.set_text(text_5, `• ${diagnosticState.results.summary.reachableMX ?? ''} reachable via SMTP`));
					$.append($$anchor, text_5);
				};

				$.if(node_8, ($$render) => {
					if ($.get(checkPorts) && diagnosticState.results.summary.reachableMX !== null) $$render(consequent_2);
				});
			}

			$.reset(p);
			$.reset(div_11);
			$.reset(div_10);

			var div_12 = $.sibling(div_10, 2);
			var div_13 = $.child(div_12);
			var node_9 = $.child(div_13);

			Icon(node_9, { name: 'server', size: 'sm' });

			var div_14 = $.sibling(node_9, 2);
			var span = $.sibling($.child(div_14), 2);
			var text_6 = $.only_child(span, true);

			$.reset(div_14);
			$.reset(div_13);

			var div_15 = $.sibling(div_13, 2);
			var node_10 = $.child(div_15);

			Icon(node_10, { name: 'shield-check', size: 'sm' });

			var div_16 = $.sibling(node_10, 2);
			var span_1 = $.sibling($.child(div_16), 2);
			var text_7 = $.only_child(span_1, true);

			$.reset(div_16);
			$.reset(div_15);

			var node_11 = $.sibling(div_15, 2);

			{
				var consequent_3 = ($$anchor) => {
					var div_17 = root_2();
					var node_12 = $.child(div_17);

					Icon(node_12, { name: 'wifi', size: 'sm' });

					var div_18 = $.sibling(node_12, 2);
					var span_2 = $.sibling($.child(div_18), 2);
					var text_8 = $.only_child(span_2, true);

					$.reset(div_18);
					$.reset(div_17);

					$.template_effect(
						($0) => {
							$.set_class(span_2, 1, `stat-value ${$0 ?? ''}`, 'svelte-1carq1l');
							$.set_text(text_8, diagnosticState.results.summary.reachableMX);
						},
						[
							() => getHealthColor(diagnosticState.results.summary.reachableMX > 0)
						]
					);

					$.append($$anchor, div_17);
				};

				$.if(node_11, ($$render) => {
					if ($.get(checkPorts) && diagnosticState.results.summary.reachableMX !== null) $$render(consequent_3);
				});
			}

			var div_19 = $.sibling(node_11, 2);
			var node_13 = $.child(div_19);

			Icon(node_13, { name: 'copy', size: 'sm' });

			var div_20 = $.sibling(node_13, 2);
			var span_3 = $.sibling($.child(div_20), 2);
			var text_9 = $.only_child(span_3, true);

			$.reset(div_20);
			$.reset(div_19);
			$.reset(div_12);
			$.reset(div_9);

			var div_21 = $.sibling(div_9, 2);
			var div_22 = $.sibling($.child(div_21), 2);

			$.each(div_22, 21, () => diagnosticState.results.mxRecords, $.index, ($$anchor, mx) => {
				var div_23 = root_10();
				var div_24 = $.child(div_23);
				var div_25 = $.child(div_24);
				var div_26 = $.child(div_25);
				var node_14 = $.child(div_26);

				Icon(node_14, { name: 'server', size: 'sm' });

				var span_4 = $.sibling(node_14, 2);
				var text_10 = $.only_child(span_4, true);
				var span_5 = $.sibling(span_4, 2);
				var text_11 = $.only_child(span_5);

				$.reset(div_26);

				var node_15 = $.sibling(div_26, 2);

				{
					var consequent_4 = ($$anchor) => {
						var div_27 = root_3();
						var node_16 = $.child(div_27);

						Icon(node_16, { name: 'alert-triangle', size: 'xs' });

						var span_6 = $.sibling(node_16, 2);
						var text_12 = $.only_child(span_6, true);

						$.reset(div_27);
						$.template_effect(() => $.set_text(text_12, $.get(mx).error));
						$.append($$anchor, div_27);
					};

					$.if(node_15, ($$render) => {
						if ($.get(mx).error) $$render(consequent_4);
					});
				}

				$.reset(div_25);

				var div_28 = $.sibling(div_25, 2);
				var span_7 = $.child(div_28);
				var node_17 = $.child(span_7);

				{
					let $0 = $.derived(() => $.get(mx).error ? 'x-circle' : 'check-circle');

					Icon(node_17, {
						get name() {
							return $.get($0);
						},
						size: 'sm'
					});
				}

				$.reset(span_7);
				$.reset(div_28);
				$.reset(div_24);

				var node_18 = $.sibling(div_24, 2);

				{
					var consequent_9 = ($$anchor) => {
						var div_29 = root_9();
						var div_30 = $.child(div_29);
						var div_31 = $.child(div_30);
						var div_32 = $.child(div_31);
						var node_19 = $.child(div_32);

						Icon(node_19, { name: 'globe', size: 'xs' });
						$.next(2);
						$.reset(div_32);

						var div_33 = $.sibling(div_32, 2);
						var node_20 = $.child(div_33);

						{
							var consequent_5 = ($$anchor) => {
								var fragment_3 = $.comment();
								var node_21 = $.first_child(fragment_3);

								$.each(node_21, 17, () => $.get(mx).addresses.ipv4, $.index, ($$anchor, ip) => {
									var code = root_4();
									var text_13 = $.only_child(code, true);

									$.template_effect(() => $.set_text(text_13, $.get(ip)));
									$.append($$anchor, code);
								});

								$.append($$anchor, fragment_3);
							};

							var alternate_2 = ($$anchor) => {
								var span_8 = root_5();

								$.append($$anchor, span_8);
							};

							$.if(node_20, ($$render) => {
								if ($.get(mx).addresses.ipv4.length > 0) $$render(consequent_5); else $$render(alternate_2, -1);
							});
						}

						$.reset(div_33);
						$.reset(div_31);

						var div_34 = $.sibling(div_31, 2);
						var div_35 = $.child(div_34);
						var node_22 = $.child(div_35);

						Icon(node_22, { name: 'globe', size: 'xs' });
						$.next(2);
						$.reset(div_35);

						var div_36 = $.sibling(div_35, 2);
						var node_23 = $.child(div_36);

						{
							var consequent_6 = ($$anchor) => {
								var fragment_4 = $.comment();
								var node_24 = $.first_child(fragment_4);

								$.each(node_24, 17, () => $.get(mx).addresses.ipv6, $.index, ($$anchor, ip) => {
									var code_1 = root_4();
									var text_14 = $.only_child(code_1, true);

									$.template_effect(() => $.set_text(text_14, $.get(ip)));
									$.append($$anchor, code_1);
								});

								$.append($$anchor, fragment_4);
							};

							var alternate_3 = ($$anchor) => {
								var span_9 = root_5();

								$.append($$anchor, span_9);
							};

							$.if(node_23, ($$render) => {
								if ($.get(mx).addresses.ipv6.length > 0) $$render(consequent_6); else $$render(alternate_3, -1);
							});
						}

						$.reset(div_36);
						$.reset(div_34);
						$.reset(div_30);

						var node_25 = $.sibling(div_30, 2);

						{
							var consequent_8 = ($$anchor) => {
								var div_37 = root_8();
								var div_38 = $.child(div_37);
								var node_26 = $.child(div_38);

								Icon(node_26, { name: 'wifi', size: 'xs' });
								$.next(2);
								$.reset(div_38);

								var div_39 = $.sibling(div_38, 2);

								$.each(div_39, 21, () => $.get(mx).portChecks || [], $.index, ($$anchor, portCheck) => {
									var div_40 = root_7();
									var div_41 = $.child(div_40);
									var span_10 = $.child(div_41);
									var text_15 = $.only_child(span_10, true);
									var span_11 = $.sibling(span_10, 2);
									var text_16 = $.only_child(span_11, true);

									$.reset(div_41);

									var div_42 = $.sibling(div_41, 2);
									var node_27 = $.child(div_42);

									{
										let $0 = $.derived(() => $.get(portCheck).open ? 'check' : 'x');

										Icon(node_27, {
											get name() {
												return $.get($0);
											},
											size: 'xs'
										});
									}

									var span_12 = $.sibling(node_27, 2);
									var text_17 = $.only_child(span_12, true);
									var node_28 = $.sibling(span_12, 2);

									{
										var consequent_7 = ($$anchor) => {
											var span_13 = root_6();
											var text_18 = $.only_child(span_13);

											$.template_effect(() => $.set_text(text_18, `(${$.get(portCheck).latency ?? ''}ms)`));
											$.append($$anchor, span_13);
										};

										$.if(node_28, ($$render) => {
											if ($.get(portCheck).latency) $$render(consequent_7);
										});
									}

									$.reset(div_42);
									$.reset(div_40);

									$.template_effect(
										($0, $1) => {
											$.set_class(div_40, 1, `port-check ${$0 ?? ''}`, 'svelte-1carq1l');
											$.set_text(text_15, $.get(portCheck).port);
											$.set_text(text_16, $1);
											$.set_text(text_17, $.get(portCheck).open ? 'Open' : 'Closed');
										},
										[
											() => getPortStatus($.get(portCheck)),
											() => getPortDescription($.get(portCheck).port)
										]
									);

									$.append($$anchor, div_40);
								});

								$.reset(div_39);
								$.reset(div_37);
								$.append($$anchor, div_37);
							};

							$.if(node_25, ($$render) => {
								if ($.get(mx).portChecks && $.get(checkPorts)) $$render(consequent_8);
							});
						}

						$.reset(div_29);
						$.append($$anchor, div_29);
					};

					$.if(node_18, ($$render) => {
						if ($.get(mx).addresses && !$.get(mx).error) $$render(consequent_9);
					});
				}

				$.reset(div_23);

				$.template_effect(() => {
					$.set_class(div_23, 1, `mx-record ${$.get(mx).error ? 'error' : 'success'}`, 'svelte-1carq1l');
					$.set_text(text_10, $.get(mx).exchange);
					$.set_text(text_11, `Priority ${$.get(mx).priority ?? ''}`);
					$.set_class(span_7, 1, $.clsx($.get(mx).error ? 'text-error' : 'text-success'), 'svelte-1carq1l');
				});

				$.append($$anchor, div_23);
			});

			$.reset(div_22);
			$.reset(div_21);
			$.reset(div_8);
			$.reset(div_6);

			$.template_effect(
				($0, $1, $2, $3, $4) => {
					button_1.disabled = $0;
					$.set_text(text_1, ` ${$1 ?? ''}`);
					$.set_class(div_10, 1, `health-overview ${$2 ?? ''}`, 'svelte-1carq1l');

					$.set_text(text_4, `${diagnosticState.results.summary.healthyMX ?? ''} of ${diagnosticState.results.summary.totalMX ?? ''} MX records resolved
                successfully `);

					$.set_text(text_6, diagnosticState.results.summary.totalMX);
					$.set_class(span_1, 1, `stat-value ${$3 ?? ''}`, 'svelte-1carq1l');
					$.set_text(text_7, diagnosticState.results.summary.healthyMX);
					$.set_class(span_3, 1, `stat-value ${$4 ?? ''}`, 'svelte-1carq1l');
					$.set_text(text_9, diagnosticState.results.summary.hasRedundancy ? 'Yes' : 'No');
				},
				[
					() => clipboard.isCopied(),
					() => clipboard.isCopied() ? 'Copied!' : 'Copy Results',
					() => getHealthColor(diagnosticState.results.summary.healthy),
					() => getHealthColor(diagnosticState.results.summary.healthy),
					() => getHealthColor(diagnosticState.results.summary.hasRedundancy)
				]
			);

			$.delegated('click', button_1, copyResults);
			$.append($$anchor, div_6);
		};

		$.if(node_4, ($$render) => {
			if (diagnosticState.results) $$render(consequent_10);
		});
	}

	var node_29 = $.sibling(node_4, 2);

	ErrorCard(node_29, {
		title: 'MX Health Check Failed',
		get error() {
			return diagnosticState.error;
		}
	});

	$.next(2);
	$.reset(div);
	$.template_effect(($0) => button.disabled = $0, [() => diagnosticState.loading || !$.get(domain).trim()]);

	$.delegated('change', input, () => {
		examples.clear();

		if ($.get(domain)) checkMXHealth();
	});

	$.bind_value(input, () => $.get(domain), ($$value) => $.set(domain, $$value));
	$.bind_checked(input_1, () => $.get(checkPorts), ($$value) => $.set(checkPorts, $$value));
	$.delegated('click', button, checkMXHealth);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['change', 'click']);