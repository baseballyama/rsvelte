import * as $ from 'svelte/internal/server';
import Icon from '$lib/components/global/Icon.svelte';
import { useDiagnosticState, useClipboard, useExamples } from '$lib/composables';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import ErrorCard from '$lib/components/common/ErrorCard.svelte';
import { tlsHandshakeContent } from '$lib/content/tls-handshake';
import '../../../../styles/diagnostics-pages.scss';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let hostname = 'google.com';
		let port = 443;
		const diagnosticState = useDiagnosticState();
		const clipboard = useClipboard();

		const examplesList = [
			{ hostname: 'as93.net', port: 443, description: 'Alicia Sykes' },
			{
				hostname: 'apple.com',
				port: 443,
				description: 'Apple (Fast - 28ms)'
			},

			{
				hostname: 'cloudflare.com',
				port: 443,
				description: 'Cloudflare'
			},

			{
				hostname: 'amazon.com',
				port: 443,
				description: 'Amazon (High latency)'
			},

			{
				hostname: 'baidu.com',
				port: 443,
				description: 'Baidu (China - TLS 1.2)'
			},
			{ hostname: 'zoom.us', port: 443, description: 'Zoom' }
		];

		const examples = useExamples(examplesList);

		async function analyzeHandshake() {
			diagnosticState.startOperation();

			try {
				const response = await fetch('/api/internal/diagnostics/tls-handshake', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ hostname: hostname.trim(), port })
				});

				if (!response.ok) {
					const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));

					throw new Error(errorData.message || `Analysis failed: ${response.status}`);
				}

				diagnosticState.setResults(await response.json());
			} catch(err) {
				diagnosticState.setError(err instanceof Error ? err.message : 'Unknown error occurred');
			}
		}

		function loadExample(example, index) {
			hostname = example.hostname;
			port = example.port;
			examples.select(index);
			analyzeHandshake();
		}

		async function copyResults() {
			if (!diagnosticState.results) return;

			let text = `TLS Handshake Analysis for ${diagnosticState.results.hostname}:${diagnosticState.results.port}\n`;

			text += `Generated at: ${diagnosticState.results.timestamp}\n\n`;
			text += `Total Time: ${diagnosticState.results.totalTime}ms\n`;
			text += `TLS Version: ${diagnosticState.results.tlsVersion}\n`;
			text += `Cipher Suite: ${diagnosticState.results.cipherSuite}\n`;

			if (diagnosticState.results.alpnProtocol) text += `ALPN Protocol: ${diagnosticState.results.alpnProtocol}\n`;

			text += `\nHandshake Phases:\n`;

			diagnosticState.results.phases.forEach((phase) => {
				text += `  ${phase.phase}: ${phase.duration}ms (at ${phase.timestamp}ms)\n`;
			});

			if (diagnosticState.results.certificateInfo) {
				text += `\nCertificate:\n`;
				text += `  Subject: ${diagnosticState.results.certificateInfo.subject}\n`;
				text += `  Issuer: ${diagnosticState.results.certificateInfo.issuer}\n`;
				text += `  Valid From: ${diagnosticState.results.certificateInfo.validFrom}\n`;
				text += `  Valid To: ${diagnosticState.results.certificateInfo.validTo}\n`;
			}

			clipboard.copy(text);
		}

		$$renderer.push(`<div class="card"><header class="card-header"><h1>${$.escape(tlsHandshakeContent.title)}</h1> <p>${$.escape(tlsHandshakeContent.description)}</p></header> `);

		ExamplesCard($$renderer, {
			examples: examplesList,
			selectedIndex: examples.selectedIndex,
			onSelect: loadExample,
			title: 'Example Hosts',
			getLabel: (ex) => ex.hostname,
			getDescription: (ex) => ex.description,
			getTooltip: (ex) => `Analyze ${ex.hostname}`
		});

		$$renderer.push(`<!----> <div class="card input-card"><div class="card-header"><h3>Handshake Analysis</h3></div> <div class="card-content"><div class="lookup-form svelte-180351m"><div class="input-row svelte-180351m"><label for="hostname" class="svelte-180351m">Hostname</label> <input id="hostname" type="text"${$.attr('value', hostname)} placeholder="google.com" class="svelte-180351m"/></div> <div class="port-row svelte-180351m"><label for="port" class="svelte-180351m">Port</label> <input id="port" type="number"${$.attr('value', port)} placeholder="443" min="1" max="65535" class="svelte-180351m"/></div> <button class="lookup-btn svelte-180351m"${$.attr('disabled', diagnosticState.loading || !hostname.trim(), true)}>`);

		if (diagnosticState.loading) {
			$$renderer.push('<!--[0-->');
			Icon($$renderer, { name: 'loader', size: 'sm', animate: 'spin' });
			$$renderer.push(`<!----> Analyzing...`);
		} else {
			$$renderer.push('<!--[-1-->');
			Icon($$renderer, { name: 'activity', size: 'sm' });
			$$renderer.push(`<!----> Analyze`);
		}

		$$renderer.push(`<!--]--></button></div></div></div> `);

		if (diagnosticState.results) {
			$$renderer.push(`<!--[0--><div class="card results-card"><div class="card-header row"><h3>Handshake Results for ${$.escape(diagnosticState.results.hostname)}:${$.escape(diagnosticState.results.port)}</h3> <button class="copy-btn"${$.attr('disabled', clipboard.isCopied(), true)}>`);
			Icon($$renderer, { name: clipboard.isCopied() ? 'check' : 'copy', size: 'xs' });
			$$renderer.push(`<!----> ${$.escape(clipboard.isCopied() ? 'Copied!' : 'Copy Results')}</button></div> <div class="card-content"><div class="results-grid svelte-180351m"><div class="result-card svelte-180351m"><h4 class="svelte-180351m">Connection Summary</h4> <div class="info-list svelte-180351m"><div class="info-item svelte-180351m">`);
			Icon($$renderer, { name: 'clock', size: 'sm' });
			$$renderer.push(`<!----> <div class="info-content svelte-180351m"><span class="info-label svelte-180351m">Total Time</span> <span class="info-value highlight svelte-180351m">${$.escape(diagnosticState.results.totalTime)}ms</span></div></div> <div class="info-item svelte-180351m">`);
			Icon($$renderer, { name: 'shield', size: 'sm' });
			$$renderer.push(`<!----> <div class="info-content svelte-180351m"><span class="info-label svelte-180351m">TLS Version</span> <span class="info-value svelte-180351m">${$.escape(diagnosticState.results.tlsVersion)}</span></div></div> <div class="info-item svelte-180351m">`);
			Icon($$renderer, { name: 'key', size: 'sm' });
			$$renderer.push(`<!----> <div class="info-content svelte-180351m"><span class="info-label svelte-180351m">Cipher Suite</span> <span class="info-value cipher svelte-180351m">${$.escape(diagnosticState.results.cipherSuite)}</span></div></div> `);

			if (diagnosticState.results.alpnProtocol) {
				$$renderer.push(`<!--[0--><div class="info-item svelte-180351m">`);
				Icon($$renderer, { name: 'layers', size: 'sm' });
				$$renderer.push(`<!----> <div class="info-content svelte-180351m"><span class="info-label svelte-180351m">ALPN Protocol</span> <span class="info-value svelte-180351m">${$.escape(diagnosticState.results.alpnProtocol)}</span></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div> `);

			if (diagnosticState.results.certificateInfo) {
				$$renderer.push(`<!--[0--><div class="result-card svelte-180351m"><h4 class="svelte-180351m">Certificate Information</h4> <div class="info-list svelte-180351m"><div class="info-item svelte-180351m">`);
				Icon($$renderer, { name: 'file', size: 'sm' });
				$$renderer.push(`<!----> <div class="info-content svelte-180351m"><span class="info-label svelte-180351m">Subject</span> <span class="info-value svelte-180351m">${$.escape(diagnosticState.results.certificateInfo.subject)}</span></div></div> <div class="info-item svelte-180351m">`);
				Icon($$renderer, { name: 'building', size: 'sm' });
				$$renderer.push(`<!----> <div class="info-content svelte-180351m"><span class="info-label svelte-180351m">Issuer</span> <span class="info-value svelte-180351m">${$.escape(diagnosticState.results.certificateInfo.issuer)}</span></div></div> <div class="info-item svelte-180351m">`);
				Icon($$renderer, { name: 'calendar', size: 'sm' });

				$$renderer.push(`<!----> <div class="info-content svelte-180351m"><span class="info-label svelte-180351m">Valid</span> <span class="info-value cert-date svelte-180351m">${$.escape(new Date(diagnosticState.results.certificateInfo.validFrom).toLocaleDateString())} →
                      ${$.escape(new Date(diagnosticState.results.certificateInfo.validTo).toLocaleDateString())}</span></div></div> `);

				if (diagnosticState.results.certificateInfo.san) {
					$$renderer.push(`<!--[0--><div class="info-item svelte-180351m">`);
					Icon($$renderer, { name: 'globe', size: 'sm' });
					$$renderer.push(`<!----> <div class="info-content svelte-180351m"><span class="info-label svelte-180351m">SANs</span> <span class="info-value svelte-180351m">${$.escape(diagnosticState.results.certificateInfo.san.length)} domains</span></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div class="result-card timeline-card svelte-180351m"><h4 class="svelte-180351m">Handshake Timeline</h4> <div class="timeline svelte-180351m"><!--[-->`);

			const each_array = $.ensure_array_like(diagnosticState.results.phases);

			for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
				let phase = each_array[$$index_1];

				$$renderer.push(`<div class="timeline-item svelte-180351m"><div class="timeline-marker svelte-180351m"></div> <div class="timeline-content svelte-180351m"><div class="timeline-header svelte-180351m"><span class="phase-name svelte-180351m">${$.escape(phase.phase)}</span> <span class="phase-duration svelte-180351m">${$.escape(phase.duration)}ms</span></div> <div class="phase-timestamp svelte-180351m">at ${$.escape(phase.timestamp)}ms</div> `);

				if (phase.details && Object.keys(phase.details).length > 0) {
					$$renderer.push(`<!--[0--><div class="phase-details svelte-180351m"><!--[-->`);

					const each_array_1 = $.ensure_array_like(Object.entries(phase.details));

					for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
						let [key, value] = each_array_1[$$index];

						$$renderer.push(`<span class="detail-badge svelte-180351m">${$.escape(key)}: ${$.escape(value)}</span>`);
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div></div>`);
			}

			$$renderer.push(`<!--]--></div></div></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);
		ErrorCard($$renderer, { title: 'Analysis Failed', error: diagnosticState.error });
		$$renderer.push(`<!----> <div class="card info-card svelte-180351m"><div class="card-header"><h3>About TLS Handshakes</h3></div> <div class="card-content"><div class="info-grid"><div class="info-section"><h4>${$.escape(tlsHandshakeContent.sections.whatIsHandshake.title)}</h4> <p>${$.escape(tlsHandshakeContent.sections.whatIsHandshake.content)}</p></div> <div class="info-section"><h4>${$.escape(tlsHandshakeContent.sections.tlsVersions.title)}</h4> <ul><!--[-->`);

		const each_array_2 = $.ensure_array_like(tlsHandshakeContent.sections.tlsVersions.versions);

		for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
			let version = each_array_2[$$index_2];

			$$renderer.push(`<li><strong>${$.escape(version.version)} (${$.escape(version.status)}):</strong> ${$.escape(version.description)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></div> <div class="info-section"><h4>${$.escape(tlsHandshakeContent.sections.performanceFactors.title)}</h4> <ul><!--[-->`);

		const each_array_3 = $.ensure_array_like(tlsHandshakeContent.sections.performanceFactors.factors);

		for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
			let factor = each_array_3[$$index_3];

			$$renderer.push(`<li><strong>${$.escape(factor.factor)}:</strong> ${$.escape(factor.description)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></div> <div class="info-section"><h4>${$.escape(tlsHandshakeContent.sections.optimization.title)}</h4> <ul><!--[-->`);

		const each_array_4 = $.ensure_array_like(tlsHandshakeContent.sections.optimization.techniques.slice(0, 3));

		for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
			let technique = each_array_4[$$index_4];

			$$renderer.push(`<li><strong>${$.escape(technique.technique)}:</strong> ${$.escape(technique.benefit)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></div></div> <div class="quick-tips svelte-180351m"><h4 class="svelte-180351m">Quick Tips</h4> <ul class="svelte-180351m"><!--[-->`);

		const each_array_5 = $.ensure_array_like(tlsHandshakeContent.quickTips);

		for (let idx = 0, $$length = each_array_5.length; idx < $$length; idx++) {
			let tip = each_array_5[idx];

			$$renderer.push(`<li class="svelte-180351m">${$.escape(tip)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></div></div></div></div>`);
	});
}