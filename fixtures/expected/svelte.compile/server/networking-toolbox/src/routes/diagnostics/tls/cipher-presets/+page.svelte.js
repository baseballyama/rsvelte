import * as $ from 'svelte/internal/server';
import Icon from '$lib/components/global/Icon.svelte';
import { useDiagnosticState, useExamples } from '$lib/composables';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import ErrorCard from '$lib/components/common/ErrorCard.svelte';
import '../../../../styles/diagnostics-pages.scss';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let hostname = 'example.com';
		let port = '443';
		const diagnosticState = useDiagnosticState();

		const examplesList = [
			{
				host: 'github.com',
				port: '443',
				description: 'GitHub cipher support'
			},

			{
				host: 'cloudflare.com',
				port: '443',
				description: 'Cloudflare cipher support'
			},

			{
				host: 'google.com',
				port: '443',
				description: 'Google cipher support'
			}
		];

		const examples = useExamples(examplesList);

		async function testCiphers() {
			if (!hostname?.trim()) {
				diagnosticState.setError('Please enter a hostname');

				return;
			}

			diagnosticState.startOperation();

			try {
				const response = await fetch('/api/internal/diagnostics/tls', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						action: 'cipher-presets',
						hostname: hostname.trim().toLowerCase(),
						port: parseInt(port) || 443
					})
				});

				const data = await response.json();

				if (!response.ok) {
					throw new Error(data.message || 'Failed to test cipher presets');
				}

				diagnosticState.setResults(data);
			} catch(err) {
				diagnosticState.setError(err instanceof Error ? err.message : 'An error occurred');
			}
		}

		function loadExample(example, index) {
			hostname = example.host;
			port = example.port;
			examples.select(index);
			testCiphers();
		}

		function getPresetScore(preset) {
			if (!preset.supported) return 0;

			const total = preset.ciphers.length;
			const supported = preset.supportedCiphers.length;

			return Math.round(supported / total * 100);
		}

		function getPresetGrade(preset) {
			const score = getPresetScore(preset);

			if (!preset.supported) return 'F';
			if (preset.level === 'modern' && score >= 80) return 'A+';
			if (preset.level === 'modern' && score >= 60) return 'A';
			if (preset.level === 'intermediate' && score >= 80) return 'B';
			if (preset.level === 'intermediate' && score >= 60) return 'C';
			if (preset.level === 'legacy') return 'D';

			return 'F';
		}

		$$renderer.push(`<div class="card"><header class="card-header"><h1>TLS Cipher Presets</h1> <p>Probe connectivity with preset cipher lists (modern/intermediate/legacy)</p></header> `);

		ExamplesCard($$renderer, {
			examples: examplesList,
			selectedIndex: examples.selectedIndex,
			onSelect: loadExample,
			getLabel: (ex) => `${ex.host}:${ex.port}`,
			getDescription: (ex) => ex.description,
			getTooltip: (ex) => `Test cipher presets for ${ex.host}:${ex.port}`
		});

		$$renderer.push(`<!----> <div class="card input-card"><div class="card-header"><h3>Cipher Presets Configuration</h3></div> <div class="card-content"><div class="form-group"><label for="hostname">Hostname and Port</label> <div class="input-flex-container"><input id="hostname" type="text"${$.attr('value', hostname)} placeholder="example.com"${$.attr('disabled', diagnosticState.loading, true)} class="flex-grow"/> <input id="port" type="text"${$.attr('value', port)} placeholder="443"${$.attr('disabled', diagnosticState.loading, true)} class="port-input"/> <button${$.attr('disabled', diagnosticState.loading, true)} class="primary">`);

		if (diagnosticState.loading) {
			$$renderer.push('<!--[0-->');
			Icon($$renderer, { name: 'loader', size: 'sm', animate: 'spin' });
			$$renderer.push(`<!----> Testing...`);
		} else {
			$$renderer.push('<!--[-1-->');
			Icon($$renderer, { name: 'search', size: 'sm' });
			$$renderer.push(`<!----> Test`);
		}

		$$renderer.push(`<!--]--></button></div></div></div></div> `);
		ErrorCard($$renderer, { title: 'Cipher Test Failed', error: diagnosticState.error });
		$$renderer.push(`<!----> `);

		if (diagnosticState.loading) {
			$$renderer.push(`<!--[0--><div class="card"><div class="card-content"><div class="loading-state">`);
			Icon($$renderer, { name: 'loader', size: 'lg', animate: 'spin' });
			$$renderer.push(`<!----> <div class="loading-text"><h3>Testing Cipher Presets</h3> <p>Testing modern, intermediate, and legacy cipher suites...</p></div></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (diagnosticState.results) {
			$$renderer.push(`<!--[0--><div class="card results-card"><div class="card-header"><h3>Cipher Presets Results</h3></div> <div class="card-content"><div class="results-section"><div class="presets-grid svelte-1wqq1vu"><!--[-->`);

			const each_array = $.ensure_array_like(diagnosticState.results.presets);

			for (let $$index_3 = 0, $$length = each_array.length; $$index_3 < $$length; $$index_3++) {
				let preset = each_array[$$index_3];

				$$renderer.push(`<div${$.attr_class(`preset-card ${$.stringify(preset.level)}`, 'svelte-1wqq1vu', { 'supported': preset.supported })}><div class="preset-header svelte-1wqq1vu"><div class="preset-title svelte-1wqq1vu"><h3 class="svelte-1wqq1vu">${$.escape(preset.name)}</h3> <span class="preset-level svelte-1wqq1vu">${$.escape(preset.level)}</span></div> <div${$.attr_class(`preset-grade grade-${$.stringify(getPresetGrade(preset).toLowerCase())}`, 'svelte-1wqq1vu')}>${$.escape(getPresetGrade(preset))}</div></div> <div class="preset-description svelte-1wqq1vu">${$.escape(preset.description)}</div> <div class="preset-stats svelte-1wqq1vu"><div class="stat svelte-1wqq1vu"><span class="stat-label svelte-1wqq1vu">Supported:</span> <span class="stat-value svelte-1wqq1vu">${$.escape(preset.supportedCiphers.length)}/${$.escape(preset.ciphers.length)}</span></div> <div class="stat svelte-1wqq1vu"><span class="stat-label svelte-1wqq1vu">Coverage:</span> <span class="stat-value svelte-1wqq1vu">${$.escape(getPresetScore(preset))}%</span></div></div> <div class="preset-progress svelte-1wqq1vu"><div class="progress-bar svelte-1wqq1vu"><div class="progress-fill svelte-1wqq1vu"${$.attr_style(`width: ${$.stringify(getPresetScore(preset))}%`)}></div></div></div> `);

				if (preset.protocols) {
					$$renderer.push(`<!--[0--><div class="protocols-section svelte-1wqq1vu"><span class="protocols-label svelte-1wqq1vu">Protocols:</span> <div class="protocols-list svelte-1wqq1vu"><!--[-->`);

					const each_array_1 = $.ensure_array_like(preset.protocols);

					for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
						let protocol = each_array_1[$$index];

						$$renderer.push(`<span${$.attr_class('protocol-badge svelte-1wqq1vu', void 0, { 'supported': protocol.supported })}>${$.escape(protocol.name)}</span>`);
					}

					$$renderer.push(`<!--]--></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (preset.supportedCiphers.length > 0) {
					$$renderer.push(`<!--[0--><details class="ciphers-details svelte-1wqq1vu"><summary class="svelte-1wqq1vu">Supported Ciphers (${$.escape(preset.supportedCiphers.length)})</summary> <div class="cipher-list svelte-1wqq1vu"><!--[-->`);

					const each_array_2 = $.ensure_array_like(preset.supportedCiphers);

					for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
						let cipher = each_array_2[$$index_1];

						$$renderer.push(`<div class="cipher-item supported svelte-1wqq1vu">`);
						Icon($$renderer, { name: 'check-circle' });
						$$renderer.push(`<!----> <span class="cipher-name svelte-1wqq1vu">${$.escape(cipher)}</span></div>`);
					}

					$$renderer.push(`<!--]--></div></details>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (preset.unsupportedCiphers && preset.unsupportedCiphers.length > 0) {
					$$renderer.push(`<!--[0--><details class="ciphers-details svelte-1wqq1vu"><summary class="svelte-1wqq1vu">Unsupported Ciphers (${$.escape(preset.unsupportedCiphers.length)})</summary> <div class="cipher-list svelte-1wqq1vu"><!--[-->`);

					const each_array_3 = $.ensure_array_like(preset.unsupportedCiphers);

					for (let $$index_2 = 0, $$length = each_array_3.length; $$index_2 < $$length; $$index_2++) {
						let cipher = each_array_3[$$index_2];

						$$renderer.push(`<div class="cipher-item unsupported svelte-1wqq1vu">`);
						Icon($$renderer, { name: 'x-circle' });
						$$renderer.push(`<!----> <span class="cipher-name svelte-1wqq1vu">${$.escape(cipher)}</span></div>`);
					}

					$$renderer.push(`<!--]--></div></details>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (preset.recommendation) {
					$$renderer.push(`<!--[0--><div${$.attr_class('recommendation svelte-1wqq1vu', void 0, { 'warning': preset.level === 'legacy' })}>`);
					Icon($$renderer, { name: preset.level === 'legacy' ? 'alert-triangle' : 'info' });
					$$renderer.push(`<!----> ${$.escape(preset.recommendation)}</div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			}

			$$renderer.push(`<!--]--></div> `);

			if (diagnosticState.results.summary) {
				$$renderer.push(`<!--[0--><div class="summary-section svelte-1wqq1vu"><h3 class="svelte-1wqq1vu">Overall Assessment</h3> <div class="summary-content svelte-1wqq1vu"><div class="summary-score svelte-1wqq1vu"><div${$.attr_class(`score-circle grade-${$.stringify(diagnosticState.results.summary.overallGrade.toLowerCase())}`, 'svelte-1wqq1vu')}>${$.escape(diagnosticState.results.summary.overallGrade)}</div> <div class="score-details svelte-1wqq1vu"><h4 class="svelte-1wqq1vu">${$.escape(diagnosticState.results.summary.rating)}</h4> <p class="svelte-1wqq1vu">${$.escape(diagnosticState.results.summary.description)}</p></div></div> `);

				if (diagnosticState.results.summary.recommendations && diagnosticState.results.summary.recommendations.length > 0) {
					$$renderer.push(`<!--[0--><div class="recommendations svelte-1wqq1vu"><h4 class="svelte-1wqq1vu">Recommendations</h4> <ul class="svelte-1wqq1vu"><!--[-->`);

					const each_array_4 = $.ensure_array_like(diagnosticState.results.summary.recommendations);

					for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
						let rec = each_array_4[$$index_4];

						$$renderer.push(`<li class="svelte-1wqq1vu">${$.escape(rec)}</li>`);
					}

					$$renderer.push(`<!--]--></ul></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}