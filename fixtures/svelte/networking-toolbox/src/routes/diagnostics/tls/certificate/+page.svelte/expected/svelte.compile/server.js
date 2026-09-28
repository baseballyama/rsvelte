import * as $ from 'svelte/internal/server';
import Icon from '$lib/components/global/Icon.svelte';
import { useDiagnosticState, useClipboard, useExamples } from '$lib/composables';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import ErrorCard from '$lib/components/common/ErrorCard.svelte';
import { tooltip } from '$lib/actions/tooltip.js';
import '../../../../styles/diagnostics-pages.scss';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let host = 'google.com:443';
		let servername = '';
		let useCustomServername = false;
		const diagnosticState = useDiagnosticState();
		const clipboard = useClipboard();

		const examplesList = [
			{
				host: 'google.com:443',
				description: 'Google TLS certificate'
			},

			{
				host: 'github.com:443',
				description: 'GitHub certificate chain'
			},

			{
				host: 'cloudflare.com:443',
				description: 'Cloudflare certificate'
			},

			{
				host: 'wikipedia.org:443',
				description: 'Wikipedia certificate'
			},

			{
				host: 'stackoverflow.com:443',
				description: 'Stack Overflow certificate'
			},

			{
				host: 'microsoft.com:443',
				description: 'Microsoft certificate'
			}
		];

		const examples = useExamples(examplesList);

		// Reactive validation
		const isInputValid = $.derived(() => () => {
			const trimmedHost = host.trim();

			if (!trimmedHost) return false;

			// Basic host:port validation
			return (/^[a-zA-Z0-9.-]+(?::\d+)?$/).test(trimmedHost);
		});

		async function analyzeCertificate() {
			diagnosticState.startOperation();

			try {
				const response = await fetch('/api/internal/diagnostics/tls', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						action: 'certificate',
						host: host.trim(),
						servername: useCustomServername && servername ? servername.trim() : undefined
					})
				});

				if (!response.ok) {
					const errorText = await response.text();

					try {
						const errorData = JSON.parse(errorText);

						throw new Error(errorData.message || `Certificate analysis failed (${response.status})`);
					} catch {
						throw new Error(`Certificate analysis failed (${response.status})`);
					}
				}

				const data = await response.json();

				diagnosticState.setResults(data);
			} catch(err) {
				diagnosticState.setError(err instanceof Error ? err.message : 'Unknown error occurred');
			}
		}

		function loadExample(example, index) {
			host = example.host;
			servername = '';
			useCustomServername = false;
			examples.select(index);
			analyzeCertificate();
		}

		function getExpiryStatus(cert) {
			if (cert.isExpired) {
				return { status: 'Expired', icon: 'x-circle', class: 'error' };
			}

			if (cert.daysUntilExpiry <= 7) {
				return {
					status: `Expires in ${cert.daysUntilExpiry} days`,
					icon: 'alert-triangle',
					class: 'error'
				};
			}

			if (cert.daysUntilExpiry <= 30) {
				return {
					status: `Expires in ${cert.daysUntilExpiry} days`,
					icon: 'alert-triangle',
					class: 'warning'
				};
			}

			return {
				status: `Valid for ${cert.daysUntilExpiry} days`,
				icon: 'check-circle',
				class: 'success'
			};
		}

		async function copyCertificateInfo() {
			if (!diagnosticState.results?.peerCertificate) return;

			const cert = diagnosticState.results.peerCertificate;
			let text = `TLS Certificate Analysis for ${host}\n`;

			text += `Generated at: ${new Date().toISOString()}\n\n`;
			text += `Subject: ${cert.subject.CN}\n`;
			text += `Issuer: ${cert.issuer.CN}\n`;
			text += `Valid From: ${cert.validFrom}\n`;
			text += `Valid To: ${cert.validTo}\n`;
			text += `Days Until Expiry: ${cert.daysUntilExpiry}\n`;
			text += `Serial Number: ${cert.serialNumber}\n`;
			text += `Fingerprint (SHA1): ${cert.fingerprint}\n`;
			text += `Fingerprint (SHA256): ${cert.fingerprint256}\n`;

			if (cert.subjectAltNames.length > 0) {
				text += `\nSubject Alternative Names:\n`;

				cert.subjectAltNames.forEach((san) => {
					text += `  ${san}\n`;
				});
			}

			await clipboard.copy(text);
		}

		$$renderer.push(`<div class="card"><header class="card-header"><h1>TLS Certificate Analyzer</h1> <p>Analyze TLS certificates, view certificate chains, check expiration dates, and examine Subject Alternative Names
      (SANs). Supports custom SNI servername for multi-domain certificates.</p></header> `);

		ExamplesCard($$renderer, {
			examples: examplesList,
			selectedIndex: examples.selectedIndex,
			onSelect: loadExample,
			title: 'Certificate Examples',
			getLabel: (example) => example.host,
			getDescription: (example) => example.description,
			getTooltip: (example) => `Analyze certificate for ${example.host} (${example.description})`
		});

		$$renderer.push(`<!----> <div class="card input-card"><div class="card-header"><h3>Certificate Analysis Configuration</h3></div> <div class="card-content"><div class="form-row"><div class="form-group"><label for="host">Host:Port <input id="host" type="text"${$.attr('value', host)} placeholder="google.com:443"${$.attr_class('', void 0, { 'invalid': host && !isInputValid() })}/> `);

		if (host && !isInputValid()) {
			$$renderer.push(`<!--[0--><span class="error-text svelte-1cw85td">Invalid host:port format</span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></label></div></div> <div class="form-row"><div class="form-group"><label class="checkbox-group"><input type="checkbox"${$.attr('checked', useCustomServername, true)}/> Use custom SNI servername</label> `);

		if (useCustomServername) {
			$$renderer.push(`<!--[0--><input type="text"${$.attr('value', servername)} placeholder="example.com"/>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div> <div class="action-section"><button class="lookup-btn"${$.attr('disabled', diagnosticState.loading || !isInputValid(), true)}>`);

		if (diagnosticState.loading) {
			$$renderer.push('<!--[0-->');
			Icon($$renderer, { name: 'loader-2', size: 'sm', animate: 'spin' });
			$$renderer.push(`<!----> Analyzing Certificate...`);
		} else {
			$$renderer.push('<!--[-1-->');
			Icon($$renderer, { name: 'shield-check', size: 'sm' });
			$$renderer.push(`<!----> Analyze Certificate`);
		}

		$$renderer.push(`<!--]--></button></div></div></div> `);

		if (diagnosticState.results) {
			$$renderer.push(`<!--[0--><div class="card results-card"><div class="card-header row"><h3>Certificate Analysis Results</h3> <button class="copy-btn"${$.attr('disabled', clipboard.isCopied(), true)}>`);
			Icon($$renderer, { name: clipboard.isCopied() ? 'check' : 'copy', size: 'xs' });
			$$renderer.push(`<!----> ${$.escape(clipboard.isCopied() ? 'Copied!' : 'Copy Certificate Info')}</button></div> <div class="card-content">`);

			if (diagnosticState.results.peerCertificate) {
				$$renderer.push('<!--[0-->');

				const cert = diagnosticState.results.peerCertificate;
				const expiryStatus = getExpiryStatus(cert);

				$$renderer.push(`<div class="cert-overview svelte-1cw85td"><div class="status-overview"><div${$.attr_class(`status-item ${$.stringify(expiryStatus.class)}`, 'svelte-1cw85td')}>`);
				Icon($$renderer, { name: expiryStatus.icon, size: 'sm' });
				$$renderer.push(`<!----> <span>${$.escape(expiryStatus.status)}</span></div> <div${$.attr_class(`status-item ${cert.isNotYetValid ? 'warning' : 'success'}`)}>`);
				Icon($$renderer, { name: cert.isNotYetValid ? 'clock' : 'calendar', size: 'sm' });
				$$renderer.push(`<!----> <span>${$.escape(cert.isNotYetValid ? 'Not yet valid' : 'Currently valid')}</span></div></div> <div class="cert-details svelte-1cw85td"><div class="detail-section svelte-1cw85td"><h4 class="svelte-1cw85td">Certificate Information</h4> <div class="detail-grid svelte-1cw85td"><div class="detail-item svelte-1cw85td"><span class="detail-label svelte-1cw85td">Common Name:</span> <span class="detail-value mono svelte-1cw85td">${$.escape(cert.subject.CN)}</span></div> <div class="detail-item svelte-1cw85td"><span class="detail-label svelte-1cw85td">Organization:</span> <span class="detail-value svelte-1cw85td">${$.escape(cert.subject.O || 'N/A')}</span></div> <div class="detail-item svelte-1cw85td"><span class="detail-label svelte-1cw85td">Issuer:</span> <span class="detail-value svelte-1cw85td">${$.escape(cert.issuer.CN)}</span></div> <div class="detail-item svelte-1cw85td"><span class="detail-label svelte-1cw85td">Serial Number:</span> <span class="detail-value mono svelte-1cw85td">${$.escape(cert.serialNumber)}</span></div> <div class="detail-item svelte-1cw85td"><span class="detail-label svelte-1cw85td">Valid From:</span> <span class="detail-value svelte-1cw85td">${$.escape(new Date(cert.validFrom).toLocaleString())}</span></div> <div class="detail-item svelte-1cw85td"><span class="detail-label svelte-1cw85td">Valid To:</span> <span class="detail-value svelte-1cw85td">${$.escape(new Date(cert.validTo).toLocaleString())}</span></div></div></div> `);

				if (cert.subjectAltNames?.length > 0) {
					$$renderer.push(`<!--[0--><div class="detail-section svelte-1cw85td"><h4 class="svelte-1cw85td">Subject Alternative Names</h4> <div class="san-list svelte-1cw85td"><!--[-->`);

					const each_array = $.ensure_array_like(cert.subjectAltNames);

					for (let index = 0, $$length = each_array.length; index < $$length; index++) {
						let san = each_array[index];

						$$renderer.push(`<span class="san-item mono svelte-1cw85td">${$.escape(san)}</span>`);
					}

					$$renderer.push(`<!--]--></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <div class="detail-section svelte-1cw85td"><h4 class="svelte-1cw85td">Fingerprints</h4> <div class="detail-grid svelte-1cw85td"><div class="detail-item svelte-1cw85td"><span class="detail-label svelte-1cw85td">SHA1:</span> <span class="detail-value mono svelte-1cw85td">${$.escape(cert.fingerprint)}</span></div> <div class="detail-item svelte-1cw85td"><span class="detail-label svelte-1cw85td">SHA256:</span> <span class="detail-value mono svelte-1cw85td">${$.escape(cert.fingerprint256)}</span></div></div></div></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (diagnosticState.results.chain?.length > 0) {
				$$renderer.push(`<!--[0--><div class="chain-section svelte-1cw85td"><h4 class="svelte-1cw85td">Certificate Chain (${$.escape(diagnosticState.results.chain.length)} certificates)</h4> <div class="chain-list svelte-1cw85td"><!--[-->`);

				const each_array_1 = $.ensure_array_like(diagnosticState.results.chain);

				for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
					let chainCert = each_array_1[i];

					$$renderer.push(`<div class="chain-item svelte-1cw85td"><div class="chain-header svelte-1cw85td"><span class="chain-level svelte-1cw85td">Level ${$.escape(i)}</span> <span class="chain-cn mono svelte-1cw85td">${$.escape(chainCert.subject.CN)}</span></div> <div class="chain-details svelte-1cw85td"><span>Issuer: ${$.escape(chainCert.issuer.CN)}</span> <span>Expires: ${$.escape(new Date(chainCert.validTo).toLocaleDateString())}</span></div></div>`);
				}

				$$renderer.push(`<!--]--></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (diagnosticState.results.protocol || diagnosticState.results.cipher || diagnosticState.results.alpnProtocol) {
				$$renderer.push(`<!--[0--><div class="connection-section svelte-1cw85td"><h4 class="svelte-1cw85td">Connection Details</h4> <div class="detail-grid svelte-1cw85td">`);

				if (diagnosticState.results.protocol) {
					$$renderer.push(`<!--[0--><div class="detail-item svelte-1cw85td"><span class="detail-label svelte-1cw85td">TLS Version:</span> <span class="detail-value svelte-1cw85td">${$.escape(diagnosticState.results.protocol)}</span></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (diagnosticState.results.cipher) {
					$$renderer.push(`<!--[0--><div class="detail-item svelte-1cw85td"><span class="detail-label svelte-1cw85td">Cipher Suite:</span> <span class="detail-value svelte-1cw85td">${$.escape(diagnosticState.results.cipher.name)}</span></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (diagnosticState.results.alpnProtocol) {
					$$renderer.push(`<!--[0--><div class="detail-item svelte-1cw85td"><span class="detail-label svelte-1cw85td">ALPN Protocol:</span> <span class="detail-value svelte-1cw85td">${$.escape(diagnosticState.results.alpnProtocol)}</span></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		ErrorCard($$renderer, {
			title: 'Certificate Analysis Failed',
			error: diagnosticState.error
		});

		$$renderer.push(`<!----></div>`);
	});
}