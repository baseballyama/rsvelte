import * as $ from 'svelte/internal/server';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import { useDiagnosticState, useClipboard, useExamples } from '$lib/composables';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import ErrorCard from '$lib/components/common/ErrorCard.svelte';
import '../../../../styles/diagnostics-pages.scss';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let url = 'https://google.com';
		let method = 'HEAD';
		let count = 5;
		let timeout = 10000;
		const diagnosticState = useDiagnosticState();
		const clipboard = useClipboard();

		const examplesList = [
			{
				url: 'https://google.com',
				method: 'HEAD',
				description: 'Google homepage'
			},

			{
				url: 'https://github.com',
				method: 'HEAD',
				description: 'GitHub homepage'
			},

			{
				url: 'https://api.github.com',
				method: 'GET',
				description: 'GitHub API'
			},

			{
				url: 'https://httpbin.org/delay/1',
				method: 'GET',
				description: 'Simulated 1s delay'
			},

			{
				url: 'https://www.cloudflare.com',
				method: 'HEAD',
				description: 'Cloudflare CDN'
			},

			{
				url: 'https://stackoverflow.com',
				method: 'HEAD',
				description: 'Stack Overflow'
			}
		];

		const examples = useExamples(examplesList);

		const httpMethods = [
			{
				value: 'HEAD',
				label: 'HEAD',
				description: 'Headers only, fastest'
			},

			{
				value: 'GET',
				label: 'GET',
				description: 'Full response, more realistic'
			},

			{
				value: 'OPTIONS',
				label: 'OPTIONS',
				description: 'Preflight requests'
			}
		];

		// Reactive validation
		const isUrlValid = $.derived(() => () => {
			try {
				const parsed = new URL(url);

				return parsed.protocol === 'http:' || parsed.protocol === 'https:';
			} catch {
				return false;
			}
		});

		const isInputValid = $.derived(() => () => {
			return isUrlValid()() && count >= 1 && count <= 20;
		});

		async function httpPing() {
			diagnosticState.startOperation();

			try {
				const response = await fetch('/api/internal/diagnostics/network', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ action: 'http-ping', url: url.trim(), method, count, timeout })
				});

				if (!response.ok) {
					const errorText = await response.text();

					try {
						const errorData = JSON.parse(errorText);

						throw new Error(errorData.message || `HTTP ping failed (${response.status})`);
					} catch {
						throw new Error(`HTTP ping failed (${response.status})`);
					}
				}

				const data = await response.json();

				diagnosticState.setResults(data);
			} catch(err) {
				diagnosticState.setError(err.message);
			}
		}

		function loadExample(example, index) {
			url = example.url;
			method = example.method;
			count = 5;
			timeout = 10000;
			examples.select(index);
			httpPing();
		}

		function setMethod(newMethod) {
			method = newMethod;
			examples.clear();

			if (isInputValid()()) httpPing();
		}

		function getLatencyClass(latency) {
			if (latency < 100) return 'excellent';
			if (latency < 300) return 'good';
			if (latency < 1000) return 'fair';

			return 'poor';
		}

		function getLatencyDescription(latency) {
			if (latency < 100) return 'Excellent';
			if (latency < 300) return 'Good';
			if (latency < 1000) return 'Fair';

			return 'Poor';
		}

		async function copyResults() {
			if (!diagnosticState.results) return;

			let text = `HTTP Ping Results for ${diagnosticState.results.url}\n`;

			text += `Generated at: ${new Date().toISOString()}\n\n`;
			text += `Configuration:\n`;
			text += `  Method: ${diagnosticState.results.method}\n`;
			text += `  Count: ${diagnosticState.results.count}\n`;
			text += `  Timeout: ${timeout}ms\n\n`;
			text += `Summary:\n`;
			text += `  Successful: ${diagnosticState.results.successful}\n`;
			text += `  Failed: ${diagnosticState.results.failed}\n`;
			text += `  Success Rate: ${(diagnosticState.results.successful / diagnosticState.results.count * 100).toFixed(1)}%\n\n`;

			if (diagnosticState.results.statistics && diagnosticState.results.successful > 0) {
				text += `Latency Statistics:\n`;
				text += `  Min: ${diagnosticState.results.statistics.min}ms\n`;
				text += `  Max: ${diagnosticState.results.statistics.max}ms\n`;
				text += `  Average: ${diagnosticState.results.statistics.avg}ms\n`;
				text += `  Median: ${diagnosticState.results.statistics.median}ms\n`;
				text += `  95th Percentile: ${diagnosticState.results.statistics.p95}ms\n\n`;
			}

			if (diagnosticState.results.latencies?.length > 0) {
				text += `Individual Results:\n`;

				diagnosticState.results.latencies.forEach((latency, i) => {
					text += `  Request ${i + 1}: ${latency}ms\n`;
				});
			}

			if (diagnosticState.results.errors?.length > 0) {
				text += `\nErrors:\n`;

				diagnosticState.results.errors.forEach((err, i) => {
					text += `  ${i + 1}: ${err}\n`;
				});
			}

			await clipboard.copy(text);
		}

		$$renderer.push(`<div class="card"><header class="card-header"><h1>HTTP Ping</h1> <p>Measure HTTP/HTTPS response latency by sending repeated requests and analyzing timing statistics. Alternative to
      ICMP ping for web services and APIs.</p></header> `);

		ExamplesCard($$renderer, {
			examples: examplesList,
			selectedIndex: examples.selectedIndex,
			onSelect: loadExample,
			title: 'HTTP Ping Examples',
			getLabel: (ex) => ex.description,
			getDescription: (ex) => `${ex.url} (${ex.method})`,
			getTooltip: (ex) => `Ping ${ex.url} using ${ex.method} method`
		});

		$$renderer.push(`<!----> <div class="card input-card"><div class="card-header"><h3>HTTP Ping Configuration</h3></div> <div class="card-content"><div class="form-row"><div class="form-group"><label for="url">Target URL <input id="url" type="url"${$.attr('value', url)} placeholder="https://example.com"${$.attr_class('', void 0, { 'invalid': url && !isUrlValid()() })}/> `);

		if (url && !isUrlValid()()) {
			$$renderer.push(`<!--[0--><span class="error-text">Must be a valid HTTP or HTTPS URL</span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></label></div></div> <div class="form-row"><div class="form-group"><h3>HTTP Method</h3> <div class="method-options svelte-agdf2"><!--[-->`);

		const each_array = $.ensure_array_like(httpMethods);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let methodOption = each_array[index];

			$$renderer.push(`<button type="button"${$.attr_class('method-btn svelte-agdf2', void 0, { 'active': method === methodOption.value })}>${$.escape(methodOption.label)}</button>`);
		}

		$$renderer.push(`<!--]--></div></div></div> <div class="form-row two-columns"><div class="form-group"><label for="count">Request Count <input id="count" type="number"${$.attr('value', count)} min="1" max="20"/></label></div> <div class="form-group"><label for="timeout">Timeout (ms) <input id="timeout" type="number"${$.attr('value', timeout)} min="1000" max="30000" step="1000"/></label></div></div> <div class="action-section"><button class="lookup-btn"${$.attr('disabled', diagnosticState.loading || !isInputValid()(), true)}>`);

		if (diagnosticState.loading) {
			$$renderer.push('<!--[0-->');
			Icon($$renderer, { name: 'loader-2', size: 'sm', animate: 'spin' });
			$$renderer.push(`<!----> Pinging...`);
		} else {
			$$renderer.push('<!--[-1-->');
			Icon($$renderer, { name: 'activity', size: 'sm' });
			$$renderer.push(`<!----> Start HTTP Ping`);
		}

		$$renderer.push(`<!--]--></button></div></div></div> `);

		if (diagnosticState.results) {
			$$renderer.push(`<!--[0--><div class="card results-card"><div class="card-header row"><h3>HTTP Ping Results</h3> <button class="copy-btn"${$.attr('disabled', clipboard.isCopied(), true)}>`);
			Icon($$renderer, { name: clipboard.isCopied() ? 'check' : 'copy', size: 'xs' });
			$$renderer.push(`<!----> ${$.escape(clipboard.isCopied() ? 'Copied!' : 'Copy Results')}</button></div> <div class="card-content"><div class="status-overview"><div class="status-item success">`);
			Icon($$renderer, { name: 'check-circle', size: 'sm' });
			$$renderer.push(`<!----> <div><span class="status-title svelte-agdf2">${$.escape(diagnosticState.results.successful)}/${$.escape(diagnosticState.results.count)}</span> <p class="status-desc svelte-agdf2">Successful requests</p></div></div> `);

			if (diagnosticState.results.statistics?.avg) {
				$$renderer.push(`<!--[0--><div${$.attr_class(`status-item ${$.stringify(getLatencyClass(diagnosticState.results.statistics.avg))}`, 'svelte-agdf2')}>`);
				Icon($$renderer, { name: 'zap', size: 'sm' });
				$$renderer.push(`<!----> <div><span class="status-title svelte-agdf2">${$.escape(diagnosticState.results.statistics.avg)}ms</span> <p class="status-desc svelte-agdf2">Average latency (${$.escape(getLatencyDescription(diagnosticState.results.statistics.avg))})</p></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (diagnosticState.results.failed > 0) {
				$$renderer.push(`<!--[0--><div class="status-item error">`);
				Icon($$renderer, { name: 'x-circle', size: 'sm' });
				$$renderer.push(`<!----> <div><span class="status-title svelte-agdf2">${$.escape(diagnosticState.results.failed)}</span> <p class="status-desc svelte-agdf2">Failed requests</p></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> `);

			if (diagnosticState.results.statistics && diagnosticState.results.successful > 0) {
				$$renderer.push(`<!--[0--><div class="stats-section svelte-agdf2"><h4 class="svelte-agdf2">Latency Statistics</h4> <div class="stats-grid svelte-agdf2"><div class="stat-item svelte-agdf2"><span class="stat-label svelte-agdf2">Minimum:</span> <span class="stat-value svelte-agdf2">${$.escape(diagnosticState.results.statistics.min)}ms</span></div> <div class="stat-item svelte-agdf2"><span class="stat-label svelte-agdf2">Maximum:</span> <span class="stat-value svelte-agdf2">${$.escape(diagnosticState.results.statistics.max)}ms</span></div> <div class="stat-item svelte-agdf2"><span class="stat-label svelte-agdf2">Average:</span> <span class="stat-value svelte-agdf2">${$.escape(diagnosticState.results.statistics.avg)}ms</span></div> <div class="stat-item svelte-agdf2"><span class="stat-label svelte-agdf2">Median:</span> <span class="stat-value svelte-agdf2">${$.escape(diagnosticState.results.statistics.median)}ms</span></div> <div class="stat-item svelte-agdf2"><span class="stat-label svelte-agdf2">95th Percentile:</span> <span class="stat-value svelte-agdf2">${$.escape(diagnosticState.results.statistics.p95)}ms</span></div> <div class="stat-item svelte-agdf2"><span class="stat-label svelte-agdf2">Range:</span> <span class="stat-value svelte-agdf2">${$.escape(diagnosticState.results.statistics.max - diagnosticState.results.statistics.min)}ms</span></div></div></div> `);

				if (diagnosticState.results.latencies?.length > 0) {
					$$renderer.push(`<!--[0--><div class="results-section svelte-agdf2"><h4 class="svelte-agdf2">Individual Request Results</h4> <div class="requests-list svelte-agdf2"><!--[-->`);

					const each_array_1 = $.ensure_array_like(diagnosticState.results.latencies);

					for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
						let latency = each_array_1[i];

						$$renderer.push(`<div${$.attr_class(`request-item ${$.stringify(getLatencyClass(latency))}`, 'svelte-agdf2')}><span class="request-number svelte-agdf2">#${$.escape(i + 1)}</span> <span class="request-latency svelte-agdf2">${$.escape(latency)}ms</span> <span class="request-status svelte-agdf2">${$.escape(getLatencyDescription(latency))}</span></div>`);
					}

					$$renderer.push(`<!--]--></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (diagnosticState.results.errors?.length > 0) {
				$$renderer.push(`<!--[0--><div class="errors-section svelte-agdf2"><h4 class="svelte-agdf2">Request Errors (${$.escape(diagnosticState.results.errors.length)})</h4> <div class="errors-list svelte-agdf2"><!--[-->`);

				const each_array_2 = $.ensure_array_like(diagnosticState.results.errors);

				for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
					let error = each_array_2[i];

					$$renderer.push(`<div class="error-item svelte-agdf2"><span class="error-number svelte-agdf2">#${$.escape(i + diagnosticState.results.successful + 1)}</span> <span class="error-message svelte-agdf2">${$.escape(error)}</span></div>`);
				}

				$$renderer.push(`<!--]--></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div class="info-section svelte-agdf2"><h4 class="svelte-agdf2">Request Information</h4> <div class="detail-grid svelte-agdf2"><div class="detail-item svelte-agdf2"><span class="detail-label svelte-agdf2">URL:</span> <span class="detail-value mono svelte-agdf2">${$.escape(diagnosticState.results.url)}</span></div> <div class="detail-item svelte-agdf2"><span class="detail-label svelte-agdf2">Method:</span> <span class="detail-value svelte-agdf2">${$.escape(diagnosticState.results.method)}</span></div> <div class="detail-item svelte-agdf2"><span class="detail-label svelte-agdf2">Success Rate:</span> <span class="detail-value svelte-agdf2">${$.escape((diagnosticState.results.successful / diagnosticState.results.count * 100).toFixed(1))}%</span></div></div></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);
		ErrorCard($$renderer, { title: 'HTTP Ping Failed', error: diagnosticState.error });
		$$renderer.push(`<!----> <div class="card info-card"><div class="card-header"><h3>Understanding HTTP Ping</h3></div> <div class="card-content"><div class="info-grid"><div class="info-section svelte-agdf2"><h4 class="svelte-agdf2">HTTP vs ICMP Ping</h4> <ul><li><strong>HTTP:</strong> Tests application layer connectivity</li> <li><strong>ICMP:</strong> Tests network layer connectivity</li> <li>HTTP ping better reflects real user experience</li> <li>Works through firewalls that block ICMP</li></ul></div> <div class="info-section svelte-agdf2"><h4 class="svelte-agdf2">Request Methods</h4> <ul><li><strong>HEAD:</strong> Headers only, fastest and most efficient</li> <li><strong>GET:</strong> Full response, more realistic timing</li> <li><strong>OPTIONS:</strong> Check allowed methods and CORS</li></ul></div> <div class="info-section svelte-agdf2"><h4 class="svelte-agdf2">Latency Guidelines</h4> <ul><li><strong>&lt; 100ms:</strong> Excellent response time</li> <li><strong>100-300ms:</strong> Good for most applications</li> <li><strong>300-1000ms:</strong> Acceptable but noticeable</li> <li><strong>> 1000ms:</strong> Poor, may impact user experience</li></ul></div></div></div></div></div>`);
	});
}