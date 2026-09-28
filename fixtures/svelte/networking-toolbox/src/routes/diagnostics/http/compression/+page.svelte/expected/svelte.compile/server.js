import * as $ from 'svelte/internal/server';
import Icon from '$lib/components/global/Icon.svelte';
import { useDiagnosticState, useExamples } from '$lib/composables';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import ErrorCard from '$lib/components/common/ErrorCard.svelte';
import '../../../../styles/diagnostics-pages.scss';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let url = 'https://example.com';
		const diagnosticState = useDiagnosticState();

		const examplesList = [
			{
				url: 'https://httpbin.org/gzip',
				description: 'HTTPBin gzip test'
			},

			{
				url: 'https://www.google.com',
				description: 'Google (likely compressed)'
			},

			{
				url: 'https://github.com',
				description: 'GitHub (modern compression)'
			},

			{
				url: 'https://www.cloudflare.com',
				description: 'Cloudflare (brotli support)'
			}
		];

		const examples = useExamples(examplesList);

		const isInputValid = $.derived(() => () => {
			const trimmedUrl = url.trim();

			if (!trimmedUrl) return false;

			try {
				const parsed = new URL(trimmedUrl);

				return ['http:', 'https:'].includes(parsed.protocol);
			} catch {
				return false;
			}
		});

		async function checkCompression() {
			if (!isInputValid()) {
				diagnosticState.setError('Please enter a valid HTTP/HTTPS URL');

				return;
			}

			diagnosticState.startOperation();

			try {
				const response = await fetch('/api/internal/diagnostics/http', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ action: 'compression', url: url.trim() })
				});

				const data = await response.json();

				if (!response.ok) {
					throw new Error(data.message || 'Failed to check compression');
				}

				diagnosticState.setResults(data);
			} catch(err) {
				diagnosticState.setError(err instanceof Error ? err.message : 'An error occurred');
			}
		}

		function loadExample(example, index) {
			url = example.url;
			examples.select(index);
			checkCompression();
		}

		function formatBytes(bytes) {
			if (bytes === 0) return '0 B';

			const k = 1024;
			const sizes = ['B', 'KB', 'MB', 'GB'];
			const i = Math.floor(Math.log(bytes) / Math.log(k));

			return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
		}

		function getCompressionIcon(encoding) {
			switch (encoding.toLowerCase()) {
				case 'gzip':
					return 'archive';

				case 'br':

				case 'brotli':
					return 'zap';

				case 'deflate':
					return 'compress';

				default:
					return 'file';
			}
		}

		$$renderer.push(`<div class="card"><header class="card-header"><h1>HTTP Compression Check</h1> <p>Test gzip, brotli, and deflate compression support and measure size differences</p></header> `);

		ExamplesCard($$renderer, {
			examples: examplesList,
			selectedIndex: examples.selectedIndex,
			onSelect: loadExample,
			title: 'Compression Examples',
			getLabel: (ex) => ex.url,
			getDescription: (ex) => ex.description,
			getTooltip: (ex) => `Test compression for ${ex.url}`
		});

		$$renderer.push(`<!----> <div class="card input-card"><div class="card-header"><h3>URL to Test</h3></div> <div class="card-content"><div class="form-group"><label for="url">URL</label> <div class="input-flex-container"><input id="url" type="url"${$.attr('value', url)} placeholder="https://example.com"${$.attr('disabled', diagnosticState.loading, true)}/> <button${$.attr('disabled', diagnosticState.loading || !isInputValid(), true)} class="primary">`);

		if (diagnosticState.loading) {
			$$renderer.push('<!--[0-->');
			Icon($$renderer, { name: 'loader', size: 'sm', animate: 'spin' });
			$$renderer.push(`<!----> Testing...`);
		} else {
			$$renderer.push('<!--[-1-->');
			Icon($$renderer, { name: 'search', size: 'sm' });
			$$renderer.push(`<!----> Test Compression`);
		}

		$$renderer.push(`<!--]--></button></div></div></div></div> `);

		ErrorCard($$renderer, {
			title: 'Compression Test Failed',
			error: diagnosticState.error
		});

		$$renderer.push(`<!----> `);

		if (diagnosticState.loading) {
			$$renderer.push(`<!--[0--><div class="card"><div class="card-content"><div class="loading-state">`);
			Icon($$renderer, { name: 'loader', size: 'lg', animate: 'spin' });
			$$renderer.push(`<!----> <div class="loading-text"><h3>Testing Compression</h3> <p>Checking support for gzip, brotli, and deflate compression...</p></div></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (diagnosticState.results) {
			$$renderer.push(`<!--[0--><div class="card results-card svelte-1kta04p"><div class="card-header"><h3>Compression Results</h3></div> <div class="card-content svelte-1kta04p"><div class="card overview-section svelte-1kta04p"><div class="card-header"><h3>Overview</h3></div> <div class="card-content svelte-1kta04p"><div class="stats-grid"><div class="stat-card"><div class="stat-label">Server Compression</div> <div${$.attr_class('stat-value', void 0, { 'success': diagnosticState.results.serverCompression.enabled })}>`);

			Icon($$renderer, {
				name: diagnosticState.results.serverCompression.enabled ? 'check-circle' : 'x-circle',
				size: 'sm'
			});

			$$renderer.push(`<!----> ${$.escape(diagnosticState.results.serverCompression.enabled ? 'Enabled' : 'Disabled')}</div> `);

			if (diagnosticState.results.serverCompression.encoding) {
				$$renderer.push(`<!--[0--><div class="stat-detail">${$.escape(diagnosticState.results.serverCompression.encoding)}</div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> <div class="stat-card"><div class="stat-label">Best Compression</div> <div class="stat-value">`);

			Icon($$renderer, {
				name: getCompressionIcon(diagnosticState.results.bestCompression.encoding),
				size: 'sm'
			});

			$$renderer.push(`<!----> ${$.escape(diagnosticState.results.bestCompression.encoding)}</div> <div class="stat-detail">${$.escape(diagnosticState.results.bestCompression.ratio.toFixed(1))}% reduction</div></div> <div class="stat-card"><div class="stat-label">Uncompressed Size</div> <div class="stat-value">${$.escape(formatBytes(diagnosticState.results.uncompressed.size))}</div></div> <div class="stat-card"><div class="stat-label">Time Taken</div> <div class="stat-value">${$.escape(diagnosticState.results.timings.total)}ms</div></div></div></div></div> <div class="card methods-section svelte-1kta04p"><div class="card-header"><h3>Compression Methods</h3></div> <div class="card-content svelte-1kta04p"><div class="compression-grid svelte-1kta04p"><!--[-->`);

			const each_array = $.ensure_array_like(diagnosticState.results.compressionResults);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let result = each_array[$$index];

				$$renderer.push(`<div${$.attr_class('compression-card svelte-1kta04p', void 0, {
					'best': result.encoding === diagnosticState.results.bestCompression.encoding
				})}><div class="compression-header svelte-1kta04p"><div class="compression-type svelte-1kta04p">`);

				Icon($$renderer, { name: getCompressionIcon(result.encoding), size: 'sm' });
				$$renderer.push(`<!----> <span class="encoding-name svelte-1kta04p">${$.escape(result.encoding)}</span></div> <div${$.attr_class('compression-status svelte-1kta04p', void 0, { 'success': result.supported, 'error': !result.supported })}>`);
				Icon($$renderer, { name: result.supported ? 'check' : 'x', size: 'xs' });
				$$renderer.push(`<!----> ${$.escape(result.supported ? 'Supported' : 'Not Supported')}</div></div> `);

				if (result.supported) {
					$$renderer.push(`<!--[0--><div class="compression-stats svelte-1kta04p"><div class="size-comparison svelte-1kta04p"><div class="size-bar svelte-1kta04p"><div class="original-bar svelte-1kta04p"></div> <div class="compressed-bar svelte-1kta04p"${$.attr_style(`width: ${$.stringify(result.compressedSize / diagnosticState.results.uncompressed.size * 100)}%`)}></div></div> <div class="size-labels svelte-1kta04p"><span class="original-size">${$.escape(formatBytes(diagnosticState.results.uncompressed.size))}</span> <span class="compressed-size">${$.escape(formatBytes(result.compressedSize))}</span></div></div> <div class="compression-metrics svelte-1kta04p"><div class="metric svelte-1kta04p"><span class="metric-label svelte-1kta04p">Reduction:</span> <span class="metric-value svelte-1kta04p">${$.escape(result.ratio.toFixed(1))}%</span></div> <div class="metric svelte-1kta04p"><span class="metric-label svelte-1kta04p">Time:</span> <span class="metric-value svelte-1kta04p">${$.escape(result.responseTime)}ms</span></div></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			}

			$$renderer.push(`<!--]--></div></div></div> <div class="card headers-section svelte-1kta04p"><div class="card-header"><h3>Response Headers</h3></div> <div class="card-content svelte-1kta04p"><div class="headers-grid svelte-1kta04p"><!--[-->`);

			const each_array_1 = $.ensure_array_like(Object.entries(diagnosticState.results.headers));

			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let [key, value] = each_array_1[$$index_1];

				$$renderer.push(`<div class="header-item svelte-1kta04p"><span class="header-key svelte-1kta04p">${$.escape(key)}</span> <span class="header-value svelte-1kta04p">${$.escape(value)}</span></div>`);
			}

			$$renderer.push(`<!--]--></div></div></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}