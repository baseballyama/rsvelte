import * as $ from 'svelte/internal/server';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import { useDiagnosticState, useClipboard, useExamples } from '$lib/composables';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import ErrorCard from '$lib/components/common/ErrorCard.svelte';
import '../../../../styles/diagnostics-pages.scss';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let targets = 'google.com:443\ngithub.com:443\nstackoverflow.com:443';
		let timeout = 5000;
		const diagnosticState = useDiagnosticState();
		const clipboard = useClipboard();

		const examplesList = [
			{
				targets: 'google.com:443\ngithub.com:443\nstackoverflow.com:443',
				description: 'Common HTTPS ports'
			},

			{
				targets: 'smtp.gmail.com:587\nsmtp.gmail.com:465\nsmtp.gmail.com:25',
				description: 'Gmail SMTP ports'
			},

			{
				targets: 'dns.google:53\n1.1.1.1:53\n8.8.8.8:53',
				description: 'DNS server ports'
			},

			{
				targets: 'reddit.com:80\nreddit.com:443\napi.reddit.com:443',
				description: 'HTTP vs HTTPS ports'
			},

			{
				targets: 'localhost:22\nlocalhost:80\nlocalhost:443\nlocalhost:3306\nlocalhost:5432',
				description: 'Local development ports'
			},

			{
				targets: 'microsoft.com:443\noffice.com:443\noutlook.com:443',
				description: 'Microsoft services'
			}
		];

		const examples = useExamples(examplesList);

		const commonPorts = [
			{ port: '22', service: 'SSH', description: 'Secure Shell' },
			{ port: '80', service: 'HTTP', description: 'Web traffic' },
			{
				port: '443',
				service: 'HTTPS',
				description: 'Secure web traffic'
			},
			{ port: '25', service: 'SMTP', description: 'Email sending' },
			{
				port: '587',
				service: 'SMTP',
				description: 'Email submission'
			},
			{ port: '993', service: 'IMAPS', description: 'Secure IMAP' },
			{ port: '995', service: 'POP3S', description: 'Secure POP3' },
			{ port: '53', service: 'DNS', description: 'Domain resolution' }
		];

		// Reactive validation
		const targetsList = $.derived(() => () => {
			return targets.split('\n').map((t) => t.trim()).filter((t) => t).slice(0, 50); // Limit to 50 targets
		});

		const isInputValid = $.derived(() => () => {
			return targetsList()().length > 0 && targetsList()().every((target) => (/^[a-zA-Z0-9.-]+:\d+$/).test(target));
		});

		async function checkPorts() {
			diagnosticState.startOperation();

			// Calculate targets list at function call time
			const currentTargets = targets.split('\n').map((t) => t.trim()).filter((t) => t).slice(0, 50);

			try {
				const response = await fetch('/api/internal/diagnostics/network', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ action: 'tcp-port-check', targets: currentTargets, timeout })
				});

				if (!response.ok) {
					const errorText = await response.text();

					try {
						const errorData = JSON.parse(errorText);

						throw new Error(errorData.message || `Port check failed (${response.status})`);
					} catch {
						// If JSON parsing fails, use the raw error text or status
						throw new Error(errorText || `Port check failed (${response.status})`);
					}
				}

				const data = await response.json();

				diagnosticState.setResults(data);
			} catch(err) {
				diagnosticState.setError(err.message);
			}
		}

		function loadExample(example, index) {
			targets = example.targets;
			timeout = 5000;
			examples.select(index);
			checkPorts();
		}

		function addCommonPort(port) {
			const currentTargets = targets.trim();
			const newTarget = `example.com:${port}`;

			targets = currentTargets ? `${currentTargets}\n${newTarget}` : newTarget;
			examples.clear();
		}

		function getPortStatus(result) {
			if (result.open) {
				return {
					icon: 'check-circle',
					class: 'success',
					text: `Open (${result.latency}ms)`
				};
			} else {
				return {
					icon: 'x-circle',
					class: 'error',
					text: result.error || 'Closed'
				};
			}
		}

		async function copyResults() {
			if (!diagnosticState.results) return;

			let text = `TCP Port Check Results\n`;

			text += `Generated at: ${new Date().toISOString()}\n\n`;
			text += `Summary:\n`;
			text += `  Total ports: ${diagnosticState.results.summary.total}\n`;
			text += `  Open: ${diagnosticState.results.summary.open}\n`;
			text += `  Closed: ${diagnosticState.results.summary.closed}\n`;

			if (diagnosticState.results.summary.avgLatency) {
				text += `  Average latency: ${diagnosticState.results.summary.avgLatency}ms\n`;
			}

			text += `\nResults:\n`;

			diagnosticState.results.results.forEach((result) => {
				const status = result.open
					? `OPEN (${result.latency}ms)`
					: `CLOSED${result.error ? ` - ${result.error}` : ''}`;

				text += `  ${result.host}:${result.port} - ${status}\n`;
			});

			await clipboard.copy(text);
		}

		$$renderer.push(`<div class="card"><header class="card-header"><h1>TCP Port Checker</h1> <p>Test TCP connectivity to one or more host:port combinations. Attempts direct TCP connections to check if ports are
      open and measures connection latency.</p></header> `);

		ExamplesCard($$renderer, {
			examples: examplesList,
			selectedIndex: examples.selectedIndex,
			onSelect: loadExample,
			title: 'Port Check Examples',
			getLabel: (ex) => ex.description,
			getDescription: (ex) => {
				const targets = ex.targets.split('\n');
				const preview = targets.slice(0, 3).join(', ');

				return targets.length > 3 ? `${preview} (+${targets.length - 3} more)` : preview;
			},
			getTooltip: (ex) => `Test ports: ${ex.targets.split('\n').join(', ')}`
		});

		$$renderer.push(`<!----> <div class="card input-card"><div class="card-header"><h3>Port Check Configuration</h3></div> <div class="card-content"><div class="form-row"><div class="form-group"><label for="targets">Target Hosts &amp; Ports <textarea id="targets" placeholder="google.com:443
github.com:22
example.com:80" rows="6"${$.attr_class('svelte-s5gnjv', void 0, { 'invalid': targets && !isInputValid()() })}>`);

		const $$body = $.escape(targets);

		if ($$body) {
			$$renderer.push(`${$$body}`);
		} else {}

		$$renderer.push(`</textarea> <div class="input-help svelte-s5gnjv"><span class="target-count svelte-s5gnjv">${$.escape(targetsList().length)}/50 targets</span> `);

		if (targets && !isInputValid()) {
			$$renderer.push(`<!--[0--><span class="error-text">Use format: hostname:port (one per line)</span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></label></div></div> <div class="form-row"><div class="form-group"><h3>Common Ports</h3> <div class="port-shortcuts svelte-s5gnjv"><!--[-->`);

		const each_array = $.ensure_array_like(commonPorts);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let port = each_array[index];

			$$renderer.push(`<button type="button" class="port-btn svelte-s5gnjv">${$.escape(port.port)} (${$.escape(port.service)})</button>`);
		}

		$$renderer.push(`<!--]--></div></div></div> <div class="form-row"><div class="form-group"><label for="timeout">Timeout (ms) <input id="timeout" type="number"${$.attr('value', timeout)} min="1000" max="30000" step="1000"/></label></div></div> <div class="action-section"><button class="lookup-btn"${$.attr('disabled', diagnosticState.loading || !isInputValid()(), true)}>`);

		if (diagnosticState.loading) {
			$$renderer.push('<!--[0-->');
			Icon($$renderer, { name: 'loader-2', size: 'sm', animate: 'spin' });
			$$renderer.push(`<!----> Checking Ports...`);
		} else {
			$$renderer.push('<!--[-1-->');
			Icon($$renderer, { name: 'activity', size: 'sm' });
			$$renderer.push(`<!----> Check Ports`);
		}

		$$renderer.push(`<!--]--></button></div></div></div> `);

		if (diagnosticState.results) {
			$$renderer.push(`<!--[0--><div class="card results-card"><div class="card-header row"><h3>Port Check Results</h3> <button class="copy-btn"${$.attr('disabled', clipboard.isCopied(), true)}>`);
			Icon($$renderer, { name: clipboard.isCopied() ? 'check' : 'copy', size: 'xs' });
			$$renderer.push(`<!----> ${$.escape(clipboard.isCopied() ? 'Copied!' : 'Copy Results')}</button></div> <div class="card-content"><div class="status-overview"><div class="status-item success">`);
			Icon($$renderer, { name: 'check-circle', size: 'sm' });
			$$renderer.push(`<!----> <div><span class="status-title svelte-s5gnjv">${$.escape(diagnosticState.results.summary.open)} Open</span> <p class="status-desc svelte-s5gnjv">Ports accepting connections</p></div></div> <div class="status-item error">`);
			Icon($$renderer, { name: 'x-circle', size: 'sm' });
			$$renderer.push(`<!----> <div><span class="status-title svelte-s5gnjv">${$.escape(diagnosticState.results.summary.closed)} Closed</span> <p class="status-desc svelte-s5gnjv">Ports not responding</p></div></div> `);

			if (diagnosticState.results.summary.avgLatency) {
				$$renderer.push(`<!--[0--><div class="status-item">`);
				Icon($$renderer, { name: 'zap', size: 'sm' });
				$$renderer.push(`<!----> <div><span class="status-title svelte-s5gnjv">${$.escape(diagnosticState.results.summary.avgLatency)}ms</span> <p class="status-desc svelte-s5gnjv">Average latency</p></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> <div class="ports-section svelte-s5gnjv"><h4 class="svelte-s5gnjv">Port Status (${$.escape(diagnosticState.results.results.length)} targets)</h4> <div class="ports-list svelte-s5gnjv"><!--[-->`);

			const each_array_1 = $.ensure_array_like(diagnosticState.results.results);

			for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
				let result = each_array_1[index];
				const status = getPortStatus(result);

				$$renderer.push(`<div${$.attr_class(`port-result ${$.stringify(status.class)}`, 'svelte-s5gnjv')}><div class="port-header svelte-s5gnjv"><div class="port-target svelte-s5gnjv">`);
				Icon($$renderer, { name: status.icon, size: 'sm' });
				$$renderer.push(`<!----> <span class="host-port mono svelte-s5gnjv">${$.escape(result.host)}:${$.escape(result.port)}</span></div> <span class="port-status svelte-s5gnjv">${$.escape(status.text)}</span></div> `);

				if (result.error && !result.open) {
					$$renderer.push(`<!--[0--><div class="port-error svelte-s5gnjv"><span class="error-detail svelte-s5gnjv">${$.escape(result.error)}</span></div>`);
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
		ErrorCard($$renderer, { title: 'Port Check Failed', error: diagnosticState.error });
		$$renderer.push(`<!----> <div class="card info-card"><div class="card-header"><h3>Understanding TCP Port Connectivity</h3></div> <div class="card-content"><div class="info-grid"><div class="info-section"><h4>Port States</h4> <ul><li><strong>Open:</strong> Port accepts connections and responds</li> <li><strong>Closed:</strong> Port actively refuses connections</li> <li><strong>Filtered:</strong> Port blocked by firewall (appears as timeout)</li> <li><strong>Timeout:</strong> No response within timeout period</li></ul></div> <div class="info-section"><h4>Common Ports</h4> <ul><li><strong>SSH (22):</strong> Secure remote access</li> <li><strong>HTTP (80):</strong> Web traffic</li> <li><strong>HTTPS (443):</strong> Secure web traffic</li> <li><strong>SMTP (25/587):</strong> Email sending</li></ul></div> <div class="info-section"><h4>Troubleshooting Tips</h4> <ul><li>Timeouts often indicate firewall blocking</li> <li>Connection refused means service is not running</li> <li>Check both client and server firewalls</li> <li>Verify service is listening on expected port</li></ul></div></div></div></div></div>`);
	});
}