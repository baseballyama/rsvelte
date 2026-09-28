import * as $ from 'svelte/internal/server';
import Icon from '$lib/components/global/Icon.svelte';
import { mailTLSContent as content } from '$lib/content/mail-tls';
import { useDiagnosticState, useExamples } from '$lib/composables';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import ErrorCard from '$lib/components/common/ErrorCard.svelte';
import '../../../../styles/diagnostics-pages.scss';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const examplesList = [
			{ domain: 'gmail.com', port: 587, desc: 'Google Mail STARTTLS' },
			{
				domain: 'outlook.com',
				port: 587,
				desc: 'Microsoft Outlook STARTTLS'
			},

			{
				domain: 'smtp.gmail.com',
				port: 465,
				desc: 'Gmail Direct TLS'
			}
		];

		let domain = '';
		let port = 587;
		const diagnosticState = useDiagnosticState();
		const examples = useExamples(examplesList);

		async function loadExample(example, index) {
			domain = example.domain;
			port = example.port;
			examples.select(index);
			await checkTLS();
		}

		async function checkTLS() {
			if (!domain.trim()) {
				diagnosticState.setError('Please enter a domain name');

				return;
			}

			diagnosticState.startOperation();

			try {
				const response = await fetch('/api/internal/diagnostics/mail-tls', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ domain: domain.trim(), port })
				});

				if (!response.ok) {
					const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));

					throw new Error(errorData.message || 'TLS check failed');
				}

				const data = await response.json();

				diagnosticState.setResults(data);
			} catch(err) {
				diagnosticState.setError(err instanceof Error ? err.message : 'Unknown error occurred');
			}
		}

		$$renderer.push(`<div class="card"><header class="card-header"><h1>${$.escape(content.title)}</h1> <p>${$.escape(content.description)}</p></header> <div class="card input-card"><div class="card-header"><h3>Check Mail Server TLS</h3></div> <div class="card-content"><div class="lookup-form svelte-1k1ysyv"><input type="text"${$.attr('value', domain)} placeholder="mail.example.com"${$.attr('disabled', diagnosticState.loading, true)} class="svelte-1k1ysyv"/> <input type="number"${$.attr('value', port)} min="1" max="65535" placeholder="Port" class="port-input svelte-1k1ysyv"${$.attr('disabled', diagnosticState.loading, true)}/> <button class="lookup-btn svelte-1k1ysyv"${$.attr('disabled', diagnosticState.loading, true)}>`);

		Icon($$renderer, {
			name: diagnosticState.loading ? 'loader' : 'lock',
			size: 'sm',
			animate: diagnosticState.loading ? 'spin' : undefined
		});

		$$renderer.push(`<!----> ${$.escape(diagnosticState.loading ? 'Checking...' : 'Check TLS')}</button></div></div></div> `);

		ExamplesCard($$renderer, {
			examples: examplesList,
			selectedIndex: examples.selectedIndex,
			onSelect: loadExample,
			title: 'Quick Examples',
			getLabel: (ex) => `${ex.domain}:${ex.port}`,
			getDescription: (ex) => ex.desc,
			getTooltip: (ex) => `Check TLS for ${ex.domain} on port ${ex.port}`
		});

		$$renderer.push(`<!----> `);

		if (diagnosticState.loading) {
			$$renderer.push(`<!--[0--><div class="card"><div class="card-content"><div class="loading-state">`);
			Icon($$renderer, { name: 'loader', size: 'lg', animate: 'spin' });
			$$renderer.push(`<!----> <div class="loading-text"><h3>Checking TLS Support</h3> <p>Testing connection to ${$.escape(domain)}:${$.escape(port)}...</p></div></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);
		ErrorCard($$renderer, { error: diagnosticState.error });
		$$renderer.push(`<!----> `);

		if (diagnosticState.results) {
			$$renderer.push(`<!--[0--><div class="card results-card"><div class="card-header"><h3>TLS Check Results for ${$.escape(diagnosticState.results.domain)}:${$.escape(diagnosticState.results.port)}</h3></div> <div class="card-content"><div class="status-overview">`);

			if (diagnosticState.results.supportsSTARTTLS) {
				$$renderer.push(`<!--[0--><div class="status-item success">`);
				Icon($$renderer, { name: 'check-circle', size: 'md' });
				$$renderer.push(`<!----> <div><h4>STARTTLS Supported</h4> <p>Server supports upgrading to TLS</p></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (diagnosticState.results.supportsDirectTLS) {
				$$renderer.push(`<!--[0--><div class="status-item success">`);
				Icon($$renderer, { name: 'lock', size: 'md' });
				$$renderer.push(`<!----> <div><h4>Direct TLS Supported</h4> <p>Server supports implicit TLS</p></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (!diagnosticState.results.supportsSTARTTLS && !diagnosticState.results.supportsDirectTLS) {
				$$renderer.push(`<!--[0--><div class="status-item error">`);
				Icon($$renderer, { name: 'x-circle', size: 'md' });
				$$renderer.push(`<!----> <div><h4>TLS Not Supported</h4> <p>Server does not support TLS encryption</p></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> `);

			if (diagnosticState.results.tlsVersion || diagnosticState.results.cipherSuite) {
				$$renderer.push(`<!--[0--><div class="subsection svelte-1k1ysyv"><h4 class="svelte-1k1ysyv">`);
				Icon($$renderer, { name: 'shield', size: 'sm' });
				$$renderer.push(`<!----> Connection Details</h4> <div class="details-grid svelte-1k1ysyv">`);

				if (diagnosticState.results.tlsVersion) {
					$$renderer.push(`<!--[0--><div class="detail-item svelte-1k1ysyv"><span class="detail-label svelte-1k1ysyv">TLS Version</span> <span class="detail-value svelte-1k1ysyv">${$.escape(diagnosticState.results.tlsVersion)}</span></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (diagnosticState.results.cipherSuite) {
					$$renderer.push(`<!--[0--><div class="detail-item svelte-1k1ysyv"><span class="detail-label svelte-1k1ysyv">Cipher Suite</span> <span class="detail-value mono svelte-1k1ysyv">${$.escape(diagnosticState.results.cipherSuite)}</span></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (diagnosticState.results.certificate) {
				$$renderer.push(`<!--[0--><div class="subsection svelte-1k1ysyv"><h4 class="svelte-1k1ysyv">`);
				Icon($$renderer, { name: 'award', size: 'sm' });
				$$renderer.push(`<!----> Certificate Information</h4> <div class="details-grid svelte-1k1ysyv"><div class="detail-item svelte-1k1ysyv"><span class="detail-label svelte-1k1ysyv">Common Name</span> <span class="detail-value svelte-1k1ysyv">${$.escape(diagnosticState.results.certificate.commonName)}</span></div> <div class="detail-item svelte-1k1ysyv"><span class="detail-label svelte-1k1ysyv">Issuer</span> <span class="detail-value svelte-1k1ysyv">${$.escape(diagnosticState.results.certificate.issuer)}</span></div> <div class="detail-item svelte-1k1ysyv"><span class="detail-label svelte-1k1ysyv">Valid From</span> <span class="detail-value svelte-1k1ysyv">${$.escape(new Date(diagnosticState.results.certificate.validFrom).toLocaleDateString())}</span></div> <div class="detail-item svelte-1k1ysyv"><span class="detail-label svelte-1k1ysyv">Valid To</span> <span${$.attr_class(`detail-value ${diagnosticState.results.certificate.daysUntilExpiry < 30 ? 'warning' : ''}`, 'svelte-1k1ysyv')}>${$.escape(new Date(diagnosticState.results.certificate.validTo).toLocaleDateString())} `);

				if (diagnosticState.results.certificate.daysUntilExpiry < 30) {
					$$renderer.push(`<!--[0--><span class="badge warning svelte-1k1ysyv">Expires in ${$.escape(diagnosticState.results.certificate.daysUntilExpiry)} days</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></span></div> <div class="detail-item full-width svelte-1k1ysyv"><span class="detail-label svelte-1k1ysyv">Serial Number</span> <span class="detail-value mono svelte-1k1ysyv">${$.escape(diagnosticState.results.certificate.serialNumber)}</span></div> <div class="detail-item full-width svelte-1k1ysyv"><span class="detail-label svelte-1k1ysyv">Fingerprint</span> <span class="detail-value mono svelte-1k1ysyv">${$.escape(diagnosticState.results.certificate.fingerprint)}</span></div> `);

				if (diagnosticState.results.certificate.altNames.length > 0) {
					$$renderer.push(`<!--[0--><div class="detail-item full-width svelte-1k1ysyv"><span class="detail-label svelte-1k1ysyv">Alternative Names (${$.escape(diagnosticState.results.certificate.altNames.length)})</span> <div class="alt-names svelte-1k1ysyv"><!--[-->`);

					const each_array = $.ensure_array_like(diagnosticState.results.certificate.altNames);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let altName = each_array[$$index];

						$$renderer.push(`<span class="alt-name-tag svelte-1k1ysyv">${$.escape(altName)}</span>`);
					}

					$$renderer.push(`<!--]--></div></div>`);
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

		$$renderer.push(`<!--]--> <div class="card info-card svelte-1k1ysyv"><div class="card-header"><h3>About SMTP TLS</h3></div> <div class="card-content"><details class="info-accordion svelte-1k1ysyv"><summary class="accordion-summary svelte-1k1ysyv">`);
		Icon($$renderer, { name: 'chevron-right', size: 'sm' });
		$$renderer.push(`<!----> <h4 class="svelte-1k1ysyv">${$.escape(content.sections.whatIsTLS.title)}</h4></summary> <div class="accordion-content svelte-1k1ysyv"><p class="svelte-1k1ysyv">${$.escape(content.sections.whatIsTLS.content)}</p></div></details> <details class="info-accordion svelte-1k1ysyv"><summary class="accordion-summary svelte-1k1ysyv">`);
		Icon($$renderer, { name: 'chevron-right', size: 'sm' });
		$$renderer.push(`<!----> <h4 class="svelte-1k1ysyv">${$.escape(content.sections.portInfo.title)}</h4></summary> <div class="accordion-content svelte-1k1ysyv"><div class="port-list svelte-1k1ysyv"><!--[-->`);

		const each_array_1 = $.ensure_array_like(content.sections.portInfo.ports);

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let portInfo = each_array_1[$$index_1];

			$$renderer.push(`<div class="port-item svelte-1k1ysyv"><div class="port-number svelte-1k1ysyv">${$.escape(portInfo.port)}</div> <div class="port-details svelte-1k1ysyv"><strong class="svelte-1k1ysyv">${$.escape(portInfo.name)}</strong> <p class="svelte-1k1ysyv">${$.escape(portInfo.desc)}</p> <span class="security-badge svelte-1k1ysyv">${$.escape(portInfo.security)}</span></div></div>`);
		}

		$$renderer.push(`<!--]--></div></div></details> <!--[-->`);

		const each_array_2 = $.ensure_array_like([
			{
				title: content.sections.tlsTypes.title,
				items: content.sections.tlsTypes.types,
				keys: ['name', 'desc', 'ports']
			},

			{
				title: content.sections.certificateFields.title,
				items: content.sections.certificateFields.fields,
				keys: ['field', 'desc']
			},

			{
				title: content.sections.security.title,
				items: content.sections.security.points,
				keys: ['point', 'desc']
			},

			{
				title: content.sections.troubleshooting.title,
				items: content.sections.troubleshooting.issues,
				keys: ['issue', 'solution']
			}
		]);

		for (let $$index_3 = 0, $$length = each_array_2.length; $$index_3 < $$length; $$index_3++) {
			let section = each_array_2[$$index_3];

			$$renderer.push(`<details class="info-accordion svelte-1k1ysyv"><summary class="accordion-summary svelte-1k1ysyv">`);
			Icon($$renderer, { name: 'chevron-right', size: 'sm' });
			$$renderer.push(`<!----> <h4 class="svelte-1k1ysyv">${$.escape(section.title)}</h4></summary> <div class="accordion-content svelte-1k1ysyv"><ul class="svelte-1k1ysyv"><!--[-->`);

			const each_array_3 = $.ensure_array_like(section.items);

			for (let $$index_2 = 0, $$length = each_array_3.length; $$index_2 < $$length; $$index_2++) {
				let item = each_array_3[$$index_2];

				$$renderer.push(`<li class="svelte-1k1ysyv"><strong>${$.escape(item[section.keys[0]])}:</strong> ${$.escape(item[section.keys[1]])} `);

				if (section.keys[2] && item[section.keys[2]]) {
					$$renderer.push(`<!--[0--><em class="example-text svelte-1k1ysyv">(${$.escape(item[section.keys[2]])})</em>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></li>`);
			}

			$$renderer.push(`<!--]--></ul></div></details>`);
		}

		$$renderer.push(`<!--]--> <details class="info-accordion svelte-1k1ysyv"><summary class="accordion-summary svelte-1k1ysyv">`);
		Icon($$renderer, { name: 'chevron-right', size: 'sm' });
		$$renderer.push(`<!----> <h4 class="svelte-1k1ysyv">Quick Tips</h4></summary> <div class="accordion-content svelte-1k1ysyv"><ul class="svelte-1k1ysyv"><!--[-->`);

		const each_array_4 = $.ensure_array_like(content.quickTips);

		for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
			let tip = each_array_4[$$index_4];

			$$renderer.push(`<li class="svelte-1k1ysyv">${$.escape(tip)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></div></details></div></div></div>`);
	});
}