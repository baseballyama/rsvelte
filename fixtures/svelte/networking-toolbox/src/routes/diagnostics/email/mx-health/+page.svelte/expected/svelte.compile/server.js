import * as $ from 'svelte/internal/server';
import Icon from '$lib/components/global/Icon.svelte';
import { useDiagnosticState, useClipboard, useExamples } from '$lib/composables';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import ErrorCard from '$lib/components/common/ErrorCard.svelte';
import '../../../../styles/diagnostics-pages.scss';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let domain = 'gmail.com';
		let checkPorts = false;
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
					body: JSON.stringify({ action: 'mx-health', domain: domain.trim(), checkPorts })
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
			domain = example.domain;
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

			let text = `MX Health Check for ${domain}\n`;

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

		$$renderer.push(`<div class="card"><header class="card-header"><h1>Email MX Health Checker</h1> <p>Check mail server (MX) health including DNS resolution and optional SMTP port connectivity testing. Verify your
      email infrastructure is properly configured and reachable.</p></header> `);

		ExamplesCard($$renderer, {
			examples: examplesList,
			selectedIndex: examples.selectedIndex,
			onSelect: loadExample,
			title: 'MX Health Examples',
			getLabel: (ex) => ex.domain,
			getDescription: (ex) => ex.description,
			getTooltip: (ex) => `Check MX health for ${ex.domain}`
		});

		$$renderer.push(`<!----> <div class="card input-card"><div class="card-header"><h3>MX Health Check</h3></div> <div class="card-content"><div class="form-group"><label for="domain">Domain Name <input id="domain" type="text"${$.attr('value', domain)} placeholder="example.com"/></label></div> <div class="form-group checkbox-group svelte-1carq1l"><label class="checkbox-label svelte-1carq1l"><input type="checkbox"${$.attr('checked', checkPorts, true)} class="svelte-1carq1l"/> <span class="checkbox-text svelte-1carq1l">Check SMTP port connectivity (25, 587, 465)</span></label></div> <div class="action-section svelte-1carq1l"><button class="check-btn lookup-btn"${$.attr('disabled', diagnosticState.loading || !domain.trim(), true)}>`);

		if (diagnosticState.loading) {
			$$renderer.push('<!--[0-->');
			Icon($$renderer, { name: 'loader', size: 'sm', animate: 'spin' });
			$$renderer.push(`<!----> Checking MX Health...`);
		} else {
			$$renderer.push('<!--[-1-->');
			Icon($$renderer, { name: 'mail-check', size: 'sm' });
			$$renderer.push(`<!----> Check MX Health`);
		}

		$$renderer.push(`<!--]--></button></div></div></div> `);

		if (diagnosticState.results) {
			$$renderer.push(`<!--[0--><div class="card results-card"><div class="card-header row"><h3>MX Health Results</h3> <button class="copy-btn"${$.attr('disabled', clipboard.isCopied(), true)}>`);
			Icon($$renderer, { name: clipboard.isCopied() ? 'check' : 'copy', size: 'xs' });
			$$renderer.push(`<!----> ${$.escape(clipboard.isCopied() ? 'Copied!' : 'Copy Results')}</button></div> <div class="card-content"><div class="summary-section svelte-1carq1l"><div${$.attr_class(`health-overview ${$.stringify(getHealthColor(diagnosticState.results.summary.healthy))}`, 'svelte-1carq1l')}>`);

			Icon($$renderer, {
				name: diagnosticState.results.summary.healthy ? 'check-circle' : 'alert-circle',
				size: 'md'
			});

			$$renderer.push(`<!----> <div><h4 class="svelte-1carq1l">`);

			if (diagnosticState.results.summary.healthy) {
				$$renderer.push(`<!--[0-->Mail Infrastructure Healthy`);
			} else {
				$$renderer.push(`<!--[-1-->Mail Infrastructure Issues`);
			}

			$$renderer.push(`<!--]--></h4> <p class="svelte-1carq1l">${$.escape(diagnosticState.results.summary.healthyMX)} of ${$.escape(diagnosticState.results.summary.totalMX)} MX records resolved
                successfully `);

			if (checkPorts && diagnosticState.results.summary.reachableMX !== null) {
				$$renderer.push(`<!--[0-->• ${$.escape(diagnosticState.results.summary.reachableMX)} reachable via SMTP`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></p></div></div> <div class="summary-stats svelte-1carq1l"><div class="stat-item svelte-1carq1l">`);
			Icon($$renderer, { name: 'server', size: 'sm' });
			$$renderer.push(`<!----> <div><span class="stat-label svelte-1carq1l">MX Records</span> <span class="stat-value svelte-1carq1l">${$.escape(diagnosticState.results.summary.totalMX)}</span></div></div> <div class="stat-item svelte-1carq1l">`);
			Icon($$renderer, { name: 'shield-check', size: 'sm' });
			$$renderer.push(`<!----> <div><span class="stat-label svelte-1carq1l">Healthy</span> <span${$.attr_class(`stat-value ${$.stringify(getHealthColor(diagnosticState.results.summary.healthy))}`, 'svelte-1carq1l')}>${$.escape(diagnosticState.results.summary.healthyMX)}</span></div></div> `);

			if (checkPorts && diagnosticState.results.summary.reachableMX !== null) {
				$$renderer.push(`<!--[0--><div class="stat-item svelte-1carq1l">`);
				Icon($$renderer, { name: 'wifi', size: 'sm' });
				$$renderer.push(`<!----> <div><span class="stat-label svelte-1carq1l">Reachable</span> <span${$.attr_class(`stat-value ${$.stringify(getHealthColor(diagnosticState.results.summary.reachableMX > 0))}`, 'svelte-1carq1l')}>${$.escape(diagnosticState.results.summary.reachableMX)}</span></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div class="stat-item svelte-1carq1l">`);
			Icon($$renderer, { name: 'copy', size: 'sm' });
			$$renderer.push(`<!----> <div><span class="stat-label svelte-1carq1l">Redundancy</span> <span${$.attr_class(`stat-value ${$.stringify(getHealthColor(diagnosticState.results.summary.hasRedundancy))}`, 'svelte-1carq1l')}>${$.escape(diagnosticState.results.summary.hasRedundancy ? 'Yes' : 'No')}</span></div></div></div></div> <div class="mx-section svelte-1carq1l"><h4 class="svelte-1carq1l">MX Records (by priority)</h4> <div class="mx-list svelte-1carq1l"><!--[-->`);

			const each_array = $.ensure_array_like(diagnosticState.results.mxRecords);

			for (let _index = 0, $$length = each_array.length; _index < $$length; _index++) {
				let mx = each_array[_index];

				$$renderer.push(`<div${$.attr_class(`mx-record ${mx.error ? 'error' : 'success'}`, 'svelte-1carq1l')}><div class="mx-header svelte-1carq1l"><div class="mx-info svelte-1carq1l"><div class="mx-exchange svelte-1carq1l">`);
				Icon($$renderer, { name: 'server', size: 'sm' });
				$$renderer.push(`<!----> <span class="exchange-name svelte-1carq1l">${$.escape(mx.exchange)}</span> <span class="priority-badge svelte-1carq1l">Priority ${$.escape(mx.priority)}</span></div> `);

				if (mx.error) {
					$$renderer.push(`<!--[0--><div class="mx-error svelte-1carq1l">`);
					Icon($$renderer, { name: 'alert-triangle', size: 'xs' });
					$$renderer.push(`<!----> <span>${$.escape(mx.error)}</span></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div> <div class="mx-status"><span${$.attr_class($.clsx(mx.error ? 'text-error' : 'text-success'), 'svelte-1carq1l')}>`);
				Icon($$renderer, { name: mx.error ? 'x-circle' : 'check-circle', size: 'sm' });
				$$renderer.push(`<!----></span></div></div> `);

				if (mx.addresses && !mx.error) {
					$$renderer.push(`<!--[0--><div class="mx-details svelte-1carq1l"><div class="addresses-section svelte-1carq1l"><div class="address-group svelte-1carq1l"><div class="address-header svelte-1carq1l">`);
					Icon($$renderer, { name: 'globe', size: 'xs' });
					$$renderer.push(`<!----> <span>IPv4 Addresses</span></div> <div class="address-list svelte-1carq1l">`);

					if (mx.addresses.ipv4.length > 0) {
						$$renderer.push(`<!--[0--><!--[-->`);

						const each_array_1 = $.ensure_array_like(mx.addresses.ipv4);

						for (let ipIndex = 0, $$length = each_array_1.length; ipIndex < $$length; ipIndex++) {
							let ip = each_array_1[ipIndex];

							$$renderer.push(`<code class="ip-address svelte-1carq1l">${$.escape(ip)}</code>`);
						}

						$$renderer.push(`<!--]-->`);
					} else {
						$$renderer.push(`<!--[-1--><span class="no-addresses svelte-1carq1l">None</span>`);
					}

					$$renderer.push(`<!--]--></div></div> <div class="address-group svelte-1carq1l"><div class="address-header svelte-1carq1l">`);
					Icon($$renderer, { name: 'globe', size: 'xs' });
					$$renderer.push(`<!----> <span>IPv6 Addresses</span></div> <div class="address-list svelte-1carq1l">`);

					if (mx.addresses.ipv6.length > 0) {
						$$renderer.push(`<!--[0--><!--[-->`);

						const each_array_2 = $.ensure_array_like(mx.addresses.ipv6);

						for (let ipIndex = 0, $$length = each_array_2.length; ipIndex < $$length; ipIndex++) {
							let ip = each_array_2[ipIndex];

							$$renderer.push(`<code class="ip-address svelte-1carq1l">${$.escape(ip)}</code>`);
						}

						$$renderer.push(`<!--]-->`);
					} else {
						$$renderer.push(`<!--[-1--><span class="no-addresses svelte-1carq1l">None</span>`);
					}

					$$renderer.push(`<!--]--></div></div></div> `);

					if (mx.portChecks && checkPorts) {
						$$renderer.push(`<!--[0--><div class="ports-section svelte-1carq1l"><div class="ports-header svelte-1carq1l">`);
						Icon($$renderer, { name: 'wifi', size: 'xs' });
						$$renderer.push(`<!----> <span>SMTP Port Connectivity</span></div> <div class="port-checks svelte-1carq1l"><!--[-->`);

						const each_array_3 = $.ensure_array_like(mx.portChecks || []);

						for (let portIndex = 0, $$length = each_array_3.length; portIndex < $$length; portIndex++) {
							let portCheck = each_array_3[portIndex];

							$$renderer.push(`<div${$.attr_class(`port-check ${$.stringify(getPortStatus(portCheck))}`, 'svelte-1carq1l')}><div class="port-info svelte-1carq1l"><span class="port-number svelte-1carq1l">${$.escape(portCheck.port)}</span> <span class="port-description svelte-1carq1l">${$.escape(getPortDescription(portCheck.port))}</span></div> <div class="port-result svelte-1carq1l">`);
							Icon($$renderer, { name: portCheck.open ? 'check' : 'x', size: 'xs' });
							$$renderer.push(`<!----> <span class="port-status svelte-1carq1l">${$.escape(portCheck.open ? 'Open' : 'Closed')}</span> `);

							if (portCheck.latency) {
								$$renderer.push(`<!--[0--><span class="port-latency svelte-1carq1l">(${$.escape(portCheck.latency)}ms)</span>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div></div>`);
						}

						$$renderer.push(`<!--]--></div></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			}

			$$renderer.push(`<!--]--></div></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		ErrorCard($$renderer, {
			title: 'MX Health Check Failed',
			error: diagnosticState.error
		});

		$$renderer.push(`<!----> <div class="card info-card"><div class="card-header"><h3>Understanding MX Records</h3></div> <div class="card-content"><div class="info-grid"><div class="info-section"><h4>MX Record Basics</h4> <ul><li><strong>Priority:</strong> Lower numbers have higher priority</li> <li><strong>Exchange:</strong> The mail server hostname</li> <li><strong>Redundancy:</strong> Multiple MX records provide failover</li> <li><strong>Load balancing:</strong> Equal priorities distribute load</li></ul></div> <div class="info-section"><h4>SMTP Ports</h4> <div class="port-explanations svelte-1carq1l"><div class="port-explanation svelte-1carq1l"><strong class="svelte-1carq1l">Port 25:</strong> Standard SMTP (server-to-server)</div> <div class="port-explanation svelte-1carq1l"><strong class="svelte-1carq1l">Port 587:</strong> Mail submission (client-to-server, TLS)</div> <div class="port-explanation svelte-1carq1l"><strong class="svelte-1carq1l">Port 465:</strong> SMTPS (deprecated but still used)</div></div></div> <div class="info-section"><h4>Health Indicators</h4> <ul><li>All MX records should resolve to IP addresses</li> <li>At least one SMTP port should be reachable</li> <li>Multiple MX records provide redundancy</li> <li>Lower priority servers should be reachable</li></ul></div> <div class="info-section"><h4>Common Issues</h4> <ul><li>MX pointing to non-existent hosts</li> <li>All SMTP ports blocked by firewall</li> <li>Single point of failure (one MX record)</li> <li>Incorrect priority configuration</li></ul></div></div></div></div></div>`);
	});
}