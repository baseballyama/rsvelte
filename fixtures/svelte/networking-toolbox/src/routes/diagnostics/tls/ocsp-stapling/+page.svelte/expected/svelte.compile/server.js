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
				host: 'cloudflare.com',
				port: '443',
				description: 'Cloudflare - OCSP stapling enabled'
			},

			{
				host: 'www.digicert.com',
				port: '443',
				description: 'DigiCert - OCSP stapling enabled'
			},

			{
				host: 'github.com',
				port: '443',
				description: 'GitHub - OCSP stapling disabled'
			}
		];

		const examples = useExamples(examplesList);

		async function checkOCSP() {
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
						action: 'ocsp-stapling',
						hostname: hostname.trim().toLowerCase(),
						port: parseInt(port) || 443
					})
				});

				const data = await response.json();

				if (!response.ok) {
					throw new Error(data.message || 'Failed to check OCSP stapling');
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
			checkOCSP();
		}

		function formatDate(dateStr) {
			const date = new Date(dateStr);

			return date.toLocaleString();
		}

		$$renderer.push(`<div class="card"><header class="card-header"><h1>OCSP Stapling Check</h1> <p>Report if server staples OCSP and basic status info</p></header> `);

		ExamplesCard($$renderer, {
			examples: examplesList,
			selectedIndex: examples.selectedIndex,
			onSelect: loadExample,
			getLabel: (ex) => `${ex.host}:${ex.port}`,
			getDescription: (ex) => ex.description,
			getTooltip: (ex) => `Check OCSP stapling for ${ex.host}:${ex.port}`
		});

		$$renderer.push(`<!----> <div class="card input-card"><div class="card-header"><h3>OCSP Stapling Configuration</h3></div> <div class="card-content"><div class="form-group"><label for="hostname">Hostname and Port</label> <div class="input-flex-container"><input id="hostname" type="text"${$.attr('value', hostname)} placeholder="example.com"${$.attr('disabled', diagnosticState.loading, true)} class="flex-grow"/> <input id="port" type="text"${$.attr('value', port)} placeholder="443"${$.attr('disabled', diagnosticState.loading, true)} class="port-input"/> <button${$.attr('disabled', diagnosticState.loading, true)} class="primary">`);

		if (diagnosticState.loading) {
			$$renderer.push('<!--[0-->');
			Icon($$renderer, { name: 'loader', size: 'sm', animate: 'spin' });
			$$renderer.push(`<!----> Checking...`);
		} else {
			$$renderer.push('<!--[-1-->');
			Icon($$renderer, { name: 'search', size: 'sm' });
			$$renderer.push(`<!----> Check`);
		}

		$$renderer.push(`<!--]--></button></div></div></div></div> `);
		ErrorCard($$renderer, { title: 'OCSP Check Failed', error: diagnosticState.error });
		$$renderer.push(`<!----> `);

		if (diagnosticState.loading) {
			$$renderer.push(`<!--[0--><div class="card"><div class="card-content"><div class="loading-state">`);
			Icon($$renderer, { name: 'loader', size: 'lg', animate: 'spin' });
			$$renderer.push(`<!----> <div class="loading-text"><h3>Checking OCSP Stapling</h3> <p>Connecting to server and analyzing OCSP response stapling...</p></div></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (diagnosticState.results) {
			$$renderer.push(`<!--[0--><div class="card results-card"><div class="card-header"><h3>OCSP Stapling Results</h3></div> <div class="card-content"><div class="results-section svelte-1w6539c"><div class="card status-section svelte-1w6539c"><div class="card-header"><h3>OCSP Stapling Status</h3></div> <div class="card-content">`);

			if (diagnosticState.results.staplingEnabled) {
				$$renderer.push(`<!--[0--><div class="status-card enabled svelte-1w6539c">`);
				Icon($$renderer, { name: 'check-circle', size: 'lg' });
				$$renderer.push(`<!----> <div class="status-content svelte-1w6539c"><h4 class="svelte-1w6539c">OCSP Stapling Enabled</h4> <p class="svelte-1w6539c">This server provides OCSP responses with the TLS handshake</p></div></div>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="status-card disabled svelte-1w6539c">`);
				Icon($$renderer, { name: 'x-circle', size: 'lg' });
				$$renderer.push(`<!----> <div class="status-content svelte-1w6539c"><h4 class="svelte-1w6539c">OCSP Stapling Not Enabled</h4> <p class="svelte-1w6539c">This server does not staple OCSP responses</p></div></div>`);
			}

			$$renderer.push(`<!--]--></div></div> `);

			if (diagnosticState.results.staplingEnabled && diagnosticState.results.ocspResponse) {
				$$renderer.push(`<!--[0--><div class="card response-section svelte-1w6539c"><div class="card-header"><h3>OCSP Response Details</h3></div> <div class="card-content"><div class="stats-grid svelte-1w6539c"><div class="stat-card svelte-1w6539c"><div class="stat-label">Certificate Status</div> <div${$.attr_class(`stat-value status-${$.stringify(diagnosticState.results.ocspResponse.certStatus.toLowerCase())}`, 'svelte-1w6539c')}>`);

				Icon($$renderer, {
					name: diagnosticState.results.ocspResponse.certStatus.toLowerCase() === 'good' ? 'check-circle' : 'alert-circle',
					size: 'sm'
				});

				$$renderer.push(`<!----> ${$.escape(diagnosticState.results.ocspResponse.certStatus)}</div></div> <div class="stat-card svelte-1w6539c"><div class="stat-label">Response Status</div> <div class="stat-value svelte-1w6539c">`);
				Icon($$renderer, { name: 'check-circle', size: 'sm' });
				$$renderer.push(`<!----> ${$.escape(diagnosticState.results.ocspResponse.responseStatus)}</div></div> `);

				if (diagnosticState.results.ocspResponse.thisUpdate) {
					$$renderer.push(`<!--[0--><div class="stat-card svelte-1w6539c"><div class="stat-label">This Update</div> <div class="stat-value mono svelte-1w6539c">${$.escape(formatDate(diagnosticState.results.ocspResponse.thisUpdate))}</div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (diagnosticState.results.ocspResponse.nextUpdate) {
					$$renderer.push(`<!--[0--><div class="stat-card svelte-1w6539c"><div class="stat-label">Next Update</div> <div class="stat-value mono svelte-1w6539c">${$.escape(formatDate(diagnosticState.results.ocspResponse.nextUpdate))}</div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (diagnosticState.results.ocspResponse.producedAt) {
					$$renderer.push(`<!--[0--><div class="stat-card svelte-1w6539c"><div class="stat-label">Produced At</div> <div class="stat-value mono svelte-1w6539c">${$.escape(formatDate(diagnosticState.results.ocspResponse.producedAt))}</div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (diagnosticState.results.ocspResponse.responderUrl) {
					$$renderer.push(`<!--[0--><div class="stat-card full-width svelte-1w6539c"><div class="stat-label">Responder URL</div> <div class="stat-value mono svelte-1w6539c">${$.escape(diagnosticState.results.ocspResponse.responderUrl)}</div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div></div></div> `);

				if (diagnosticState.results.ocspResponse.validity) {
					$$renderer.push(`<!--[0--><div class="card validity-section svelte-1w6539c"><div class="card-header"><h3>Response Validity</h3></div> <div class="card-content"><div class="validity-info"><div class="validity-stats svelte-1w6539c"><div class="stat-card svelte-1w6539c"><div class="stat-label">Valid For</div> <div class="stat-value svelte-1w6539c">${$.escape(diagnosticState.results.ocspResponse.validity.validFor)}</div></div> `);

					if (diagnosticState.results.ocspResponse.validity.expiresIn) {
						$$renderer.push(`<!--[0--><div class="stat-card svelte-1w6539c"><div class="stat-label">Expires In</div> <div${$.attr_class('stat-value svelte-1w6539c', void 0, {
							'expiring': diagnosticState.results.ocspResponse.validity.expiringSoon
						})}>`);

						Icon($$renderer, {
							name: diagnosticState.results.ocspResponse.validity.expiringSoon ? 'alert-triangle' : 'check-circle',
							size: 'sm'
						});

						$$renderer.push(`<!----> ${$.escape(diagnosticState.results.ocspResponse.validity.expiresIn)}</div></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div> `);

					if (diagnosticState.results.ocspResponse.validity.percentage !== undefined) {
						$$renderer.push(`<!--[0--><div class="validity-progress svelte-1w6539c"><div class="progress-header svelte-1w6539c"><span class="progress-label svelte-1w6539c">Validity Period Progress</span> <span class="progress-percentage svelte-1w6539c">${$.escape(diagnosticState.results.ocspResponse.validity.percentage)}%</span></div> <div class="progress-bar svelte-1w6539c"><div class="progress-fill svelte-1w6539c"${$.attr_style(`width: ${$.stringify(diagnosticState.results.ocspResponse.validity.percentage)}%`)}></div></div></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (diagnosticState.results.certificate) {
				$$renderer.push(`<!--[0--><div class="card certificate-section svelte-1w6539c"><div class="card-header"><h3>Certificate Information</h3></div> <div class="card-content"><div class="cert-details svelte-1w6539c"><div class="cert-item svelte-1w6539c"><div class="cert-label svelte-1w6539c">Subject</div> <div class="cert-value mono svelte-1w6539c">${$.escape(diagnosticState.results.certificate.subject)}</div></div> <div class="cert-item svelte-1w6539c"><div class="cert-label svelte-1w6539c">Issuer</div> <div class="cert-value mono svelte-1w6539c">${$.escape(diagnosticState.results.certificate.issuer)}</div></div> `);

				if (diagnosticState.results.certificate.ocspUrls && diagnosticState.results.certificate.ocspUrls.length > 0) {
					$$renderer.push(`<!--[0--><div class="cert-item svelte-1w6539c"><div class="cert-label svelte-1w6539c">OCSP URLs</div> <div class="cert-urls svelte-1w6539c"><!--[-->`);

					const each_array = $.ensure_array_like(diagnosticState.results.certificate.ocspUrls);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let url = each_array[$$index];

						$$renderer.push(`<div class="cert-url mono svelte-1w6539c">${$.escape(url)}</div>`);
					}

					$$renderer.push(`<!--]--></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (diagnosticState.results.recommendations && diagnosticState.results.recommendations.length > 0) {
				$$renderer.push(`<!--[0--><div class="card recommendations-section svelte-1w6539c"><div class="card-header"><h3>Recommendations</h3></div> <div class="card-content"><div class="recommendations-list svelte-1w6539c"><!--[-->`);

				const each_array_1 = $.ensure_array_like(diagnosticState.results.recommendations);

				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let rec = each_array_1[$$index_1];

					$$renderer.push(`<div class="recommendation-item svelte-1w6539c">`);
					Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
					$$renderer.push(`<!----> <span class="svelte-1w6539c">${$.escape(rec)}</span></div>`);
				}

				$$renderer.push(`<!--]--></div></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="card info-card"><div class="card-header"><h3>Understanding OCSP Stapling</h3></div> <div class="card-content"><div class="info-grid"><div class="info-section"><h4>What is OCSP Stapling?</h4> <p>OCSP Stapling is a security feature where the server includes a certificate status response during the TLS
            handshake. This eliminates the need for clients to contact the Certificate Authority directly to check if a
            certificate has been revoked.</p></div> <div class="info-section"><h4>Why is it Important?</h4> <ul><li><strong>Privacy:</strong> Prevents CA from tracking user browsing</li> <li><strong>Performance:</strong> Faster connections, no extra DNS lookups</li> <li><strong>Reliability:</strong> Works even if OCSP responder is down</li> <li><strong>Security:</strong> Real-time certificate validation</li></ul></div> <div class="info-section"><h4>How It Works</h4> <p>The server periodically queries the OCSP responder and caches the response. During TLS handshake, the server
            "staples" this cached response to the certificate, proving its validity without requiring the client to make
            additional network requests.</p></div> <div class="info-section"><h4>Checking Status</h4> <p>This tool connects to servers with OCSP stapling enabled and analyzes the stapled response. It checks
            certificate status, response validity, timing information, and provides recommendations for servers without
            stapling enabled.</p></div></div></div></div></div>`);
	});
}