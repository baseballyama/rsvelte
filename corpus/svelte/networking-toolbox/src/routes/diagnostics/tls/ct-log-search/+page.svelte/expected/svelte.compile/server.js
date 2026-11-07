import * as $ from 'svelte/internal/server';
import Icon from '$lib/components/global/Icon.svelte';
import { useDiagnosticState, useClipboard, useExamples } from '$lib/composables';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import ErrorCard from '$lib/components/common/ErrorCard.svelte';
import { ctLogContent as content } from '$lib/content/ct-log-search';
import '../../../../styles/diagnostics-pages.scss';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const examplesList = [
			{ domain: 'as93.net', desc: 'Domain hosting multiple apps' },
			{
				domain: 'github.com',
				desc: 'Popular tech platform with modern certificate infrastructure'
			},

			{
				domain: 'google.com',
				desc: 'Shows historic DigiNotar breach certificate from 2011'
			},

			{
				domain: 'reddit.com',
				desc: 'Demonstrates subdomain discovery capabilities'
			},

			{
				domain: 'wikipedia.org',
				desc: 'Example of wildcard certificate usage'
			},

			{
				domain: 'twitter.com',
				desc: 'Shows certificate lifecycle and expiration tracking'
			}
		];

		const examples = useExamples(examplesList);

		const statsConfig = [
			{
				icon: 'check-circle',
				label: 'Valid Certificates',
				key: 'validCertificates',
				valueClass: 'success',
				desc: 'Currently valid'
			},

			{
				icon: 'alert-triangle',
				label: 'Expiring Soon',
				key: 'expiringSoon',
				valueClass: 'warning',
				desc: 'Within 30 days'
			},

			{
				icon: 'asterisk',
				label: 'Wildcard Certs',
				key: 'wildcardCertificates',
				valueClass: '',
				desc: 'Covering subdomains'
			},

			{
				icon: 'globe',
				label: 'Discovered Hosts',
				key: 'discoveredHostnames',
				valueClass: '',
				desc: 'Unique hostnames',
				isArray: true
			}
		];

		const certDetailFields = [
			{
				icon: 'calendar',
				label: 'Valid Period',
				key: 'validPeriod',
				formatter: (cert) => `${new Date(cert.notBefore).toLocaleDateString()} - ${new Date(cert.notAfter).toLocaleDateString()}`
			},
			{ icon: 'building', label: 'Issuer', key: 'issuer' },
			{
				icon: 'hash',
				label: 'Serial Number',
				key: 'serialNumber',
				mono: true
			},
			{ icon: 'globe', label: 'SANs', key: 'sans', isSans: true },
			{
				icon: 'external-link',
				label: 'View Details',
				key: 'ctLogUrl',
				isLink: true
			}
		];

		let domain = '';
		const diagnosticState = useDiagnosticState();
		const clipboard = useClipboard();
		let expandedCert = null;

		async function loadExample(example, index) {
			domain = example.domain;
			examples.select(index);
			await searchCTLogs();
		}

		async function searchCTLogs() {
			if (!domain.trim()) {
				diagnosticState.setError('Please enter a domain name');

				return;
			}

			diagnosticState.startOperation();

			try {
				const response = await fetch('/api/internal/diagnostics/ct-log-search', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ domain: domain.trim() })
				});

				if (!response.ok) {
					const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));

					throw new Error(errorData.message || 'Search failed');
				}

				diagnosticState.setResults(await response.json());
			} catch(err) {
				diagnosticState.setError(err instanceof Error ? err.message : 'Unknown error occurred');
			}
		}

		async function copyResults() {
			if (!diagnosticState.results) return;

			let text = `Certificate Transparency Log Search\nDomain: ${diagnosticState.results.domain}\nGenerated at: ${diagnosticState.results.timestamp}\n\n`;

			text += `Total Certificates: ${diagnosticState.results.totalCertificates}\n`;
			text += `Valid Certificates: ${diagnosticState.results.validCertificates}\n`;
			text += `Expiring Soon (30 days): ${diagnosticState.results.expiringSoon}\n`;
			text += `Wildcard Certificates: ${diagnosticState.results.wildcardCertificates}\n\n`;
			text += `Discovered Hostnames (${diagnosticState.results.discoveredHostnames.length}):\n`;
			diagnosticState.results.discoveredHostnames.forEach((h) => text += `  - ${h}\n`);
			text += `\nTop Issuers:\n`;
			diagnosticState.results.issuers.forEach((i) => text += `  - ${i.name}: ${i.count} certificates\n`);
			clipboard.copy(text);
		}

		function toggleCert(id) {
			expandedCert = expandedCert === id ? null : id;
		}

		function getCertBadges(cert) {
			const badges = [];

			if (cert.isValid) {
				badges.push({ text: 'Valid', class: 'success' });

				if (cert.daysUntilExpiry <= 30) {
					badges.push({
						text: `Expires in ${cert.daysUntilExpiry}d`,
						class: 'warning'
					});
				}
			} else if (cert.daysUntilExpiry > 0) {
				badges.push({ text: 'Expired', class: 'warning' });
			} else {
				badges.push({ text: 'Not Yet Valid', class: 'muted' });
			}

			return badges;
		}

		$$renderer.push(`<div class="card"><header class="card-header"><h1>${$.escape(content.title)}</h1> <p>${$.escape(content.description)}</p></header> <div class="card input-card"><div class="card-header"><h3>Search CT Logs</h3></div> <div class="card-content svelte-ly52b1"><div class="lookup-form svelte-ly52b1"><input type="text"${$.attr('value', domain)} placeholder="example.com"${$.attr('disabled', diagnosticState.loading, true)} class="svelte-ly52b1"/> <button class="lookup-btn"${$.attr('disabled', diagnosticState.loading, true)}>`);

		Icon($$renderer, {
			name: diagnosticState.loading ? 'loader' : 'search',
			size: 'sm',
			animate: diagnosticState.loading ? 'spin' : undefined
		});

		$$renderer.push(`<!----> ${$.escape(diagnosticState.loading ? 'Searching...' : 'Search CT Logs')}</button></div></div></div> `);

		ExamplesCard($$renderer, {
			examples: examplesList,
			selectedIndex: examples.selectedIndex,
			onSelect: loadExample,
			getLabel: (ex) => ex.domain,
			getDescription: (ex) => ex.desc
		});

		$$renderer.push(`<!----> `);

		if (diagnosticState.loading) {
			$$renderer.push(`<!--[0--><div class="card"><div class="card-content svelte-ly52b1"><div class="loading-state">`);
			Icon($$renderer, { name: 'loader', size: 'lg', animate: 'spin' });
			$$renderer.push(`<!----> <div class="loading-text"><h3>Searching Certificate Transparency Logs</h3> <p>Querying CT logs for ${$.escape(domain)}...</p></div></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);
		ErrorCard($$renderer, { title: 'CT Log Search Failed', error: diagnosticState.error });
		$$renderer.push(`<!----> `);

		if (diagnosticState.results) {
			$$renderer.push(`<!--[0--><div class="card results-card"><div class="card-header row"><h3>CT Log Results for ${$.escape(diagnosticState.results.domain)}</h3> <button class="copy-btn"${$.attr('disabled', clipboard.isCopied(), true)}>`);
			Icon($$renderer, { name: clipboard.isCopied() ? 'check' : 'copy', size: 'xs' });
			$$renderer.push(`<!----> ${$.escape(clipboard.isCopied() ? 'Copied!' : 'Copy Results')}</button></div> <div class="card-content svelte-ly52b1"><div class="status-overview"><div class="status-item info svelte-ly52b1">`);
			Icon($$renderer, { name: 'file', size: 'md' });
			$$renderer.push(`<!----> <div><h4>${$.escape(diagnosticState.results.totalCertificates)} Total Certificates</h4> <p>Found in Certificate Transparency logs</p></div></div></div> <div class="results-grid svelte-ly52b1"><!--[-->`);

			const each_array = $.ensure_array_like(statsConfig);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let stat = each_array[$$index];

				$$renderer.push(`<div class="result-card svelte-ly52b1"><h4 class="svelte-ly52b1">`);
				Icon($$renderer, { name: stat.icon, size: 'sm' });

				$$renderer.push(`<!----> ${$.escape(stat.label)}</h4> <div${$.attr_class(`stat-value ${$.stringify(stat.valueClass)}`, 'svelte-ly52b1')}>${$.escape(stat.isArray
					? diagnosticState.results[stat.key].length
					: diagnosticState.results[stat.key])}</div> <p class="stat-label svelte-ly52b1">${$.escape(stat.desc)}</p></div>`);
			}

			$$renderer.push(`<!--]--></div> `);

			if (diagnosticState.results.discoveredHostnames.length > 0) {
				$$renderer.push(`<!--[0--><div class="subsection svelte-ly52b1"><h4 class="svelte-ly52b1">`);
				Icon($$renderer, { name: 'list', size: 'sm' });
				$$renderer.push(`<!----> Discovered Hostnames (${$.escape(diagnosticState.results.discoveredHostnames.length)})</h4> <div class="hostname-list svelte-ly52b1"><!--[-->`);

				const each_array_1 = $.ensure_array_like(diagnosticState.results.discoveredHostnames.slice(0, 50));

				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let hostname = each_array_1[$$index_1];

					$$renderer.push(`<span${$.attr_class(`hostname-tag ${hostname.startsWith('*') ? 'wildcard' : ''}`, 'svelte-ly52b1')}>`);

					if (hostname.startsWith('*')) {
						$$renderer.push('<!--[0-->');
						Icon($$renderer, { name: 'asterisk', size: 'xs' });
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> ${$.escape(hostname)}</span>`);
				}

				$$renderer.push(`<!--]--> `);

				if (diagnosticState.results.discoveredHostnames.length > 50) {
					$$renderer.push(`<!--[0--><span class="hostname-tag muted svelte-ly52b1">+${$.escape(diagnosticState.results.discoveredHostnames.length - 50)} more</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (diagnosticState.results.issuers.length > 0) {
				$$renderer.push(`<!--[0--><div class="subsection svelte-ly52b1"><h4 class="svelte-ly52b1">`);
				Icon($$renderer, { name: 'building', size: 'sm' });
				$$renderer.push(`<!----> Certificate Issuers (${$.escape(diagnosticState.results.issuers.length)})</h4> <div class="issuer-list svelte-ly52b1"><!--[-->`);

				const each_array_2 = $.ensure_array_like(diagnosticState.results.issuers.slice(0, 10));

				for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
					let issuer = each_array_2[$$index_2];

					$$renderer.push(`<div class="issuer-item svelte-ly52b1"><span class="issuer-name svelte-ly52b1">${$.escape(issuer.name)}</span> <span class="issuer-count svelte-ly52b1">${$.escape(issuer.count)}</span></div>`);
				}

				$$renderer.push(`<!--]--></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div class="subsection svelte-ly52b1"><h4 class="svelte-ly52b1">`);
			Icon($$renderer, { name: 'file', size: 'sm' });
			$$renderer.push(`<!----> Certificates (${$.escape(diagnosticState.results.certificates.length)})</h4> <div class="cert-list svelte-ly52b1"><!--[-->`);

			const each_array_3 = $.ensure_array_like(diagnosticState.results.certificates.slice(0, 20));

			for (let $$index_6 = 0, $$length = each_array_3.length; $$index_6 < $$length; $$index_6++) {
				let cert = each_array_3[$$index_6];

				$$renderer.push(`<div class="cert-item svelte-ly52b1"><div class="cert-header svelte-ly52b1" role="button" tabindex="0"><div class="cert-title svelte-ly52b1">`);

				if (cert.isWildcard) {
					$$renderer.push('<!--[0-->');
					Icon($$renderer, { name: 'asterisk', size: 'xs' });
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <strong>${$.escape(cert.commonName)}</strong> <!--[-->`);

				const each_array_4 = $.ensure_array_like(getCertBadges(cert));

				for (let $$index_3 = 0, $$length = each_array_4.length; $$index_3 < $$length; $$index_3++) {
					let badge = each_array_4[$$index_3];

					$$renderer.push(`<span${$.attr_class(`badge ${$.stringify(badge.class)}`, 'svelte-ly52b1')}>${$.escape(badge.text)}</span>`);
				}

				$$renderer.push(`<!--]--></div> `);

				Icon($$renderer, {
					name: expandedCert === cert.id ? 'chevron-up' : 'chevron-down',
					size: 'sm'
				});

				$$renderer.push(`<!----></div> `);

				if (expandedCert === cert.id) {
					$$renderer.push(`<!--[0--><div class="cert-details svelte-ly52b1"><div class="info-list svelte-ly52b1"><!--[-->`);

					const each_array_5 = $.ensure_array_like(certDetailFields);

					for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
						let field = each_array_5[$$index_5];

						$$renderer.push(`<div class="info-item svelte-ly52b1">`);
						Icon($$renderer, { name: field.icon, size: 'sm' });
						$$renderer.push(`<!----> <div class="info-content svelte-ly52b1"><span class="info-label svelte-ly52b1">${$.escape(field.label)}${$.escape(field.isSans ? ` (${cert.sans.length})` : '')}</span> `);

						if (field.isSans) {
							$$renderer.push(`<!--[0--><div class="sans-list svelte-ly52b1"><!--[-->`);

							const each_array_6 = $.ensure_array_like(cert.sans.slice(0, 10));

							for (let $$index_4 = 0, $$length = each_array_6.length; $$index_4 < $$length; $$index_4++) {
								let san = each_array_6[$$index_4];

								$$renderer.push(`<span class="san-tag svelte-ly52b1">${$.escape(san)}</span>`);
							}

							$$renderer.push(`<!--]--> `);

							if (cert.sans.length > 10) {
								$$renderer.push(`<!--[0--><span class="san-tag muted svelte-ly52b1">+${$.escape(cert.sans.length - 10)} more</span>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div>`);
						} else if (field.isLink) {
							$$renderer.push(`<!--[1--><a${$.attr('href', cert.ctLogUrl)} target="_blank" rel="noopener noreferrer" class="svelte-ly52b1">crt.sh #${$.escape(cert.id)}</a>`);
						} else if (field.formatter) {
							$$renderer.push(`<!--[2--><span${$.attr_class(`info-value ${field.mono ? 'mono' : ''}`, 'svelte-ly52b1')}>${$.escape(field.formatter(cert))}</span>`);
						} else {
							$$renderer.push(`<!--[-1--><span${$.attr_class(`info-value ${field.mono ? 'mono' : ''}`, 'svelte-ly52b1')}>${$.escape(cert[field.key])}</span>`);
						}

						$$renderer.push(`<!--]--></div></div>`);
					}

					$$renderer.push(`<!--]--></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			}

			$$renderer.push(`<!--]--> `);

			if (diagnosticState.results.certificates.length > 20) {
				$$renderer.push(`<!--[0--><div class="cert-item muted-text svelte-ly52b1">Showing first 20 of ${$.escape(diagnosticState.results.certificates.length)} certificates</div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="card info-card svelte-ly52b1"><div class="card-header"><h3>About Certificate Transparency</h3></div> <div class="card-content svelte-ly52b1"><details class="info-accordion svelte-ly52b1"><summary class="accordion-summary svelte-ly52b1">`);
		Icon($$renderer, { name: 'chevron-right', size: 'sm' });
		$$renderer.push(`<!----> <h4 class="svelte-ly52b1">${$.escape(content.sections.whatIsCT.title)}</h4></summary> <div class="accordion-content svelte-ly52b1"><p class="svelte-ly52b1">${$.escape(content.sections.whatIsCT.content)}</p></div></details> <!--[-->`);

		const each_array_7 = $.ensure_array_like([
			{
				title: content.sections.benefits.title,
				items: content.sections.benefits.benefits,
				keys: ['benefit', 'description']
			},

			{
				title: content.sections.useCases.title,
				items: content.sections.useCases.cases,
				keys: ['useCase', 'description', 'example']
			},

			{
				title: content.sections.certificateFields.title,
				items: content.sections.certificateFields.fields,
				keys: ['field', 'description']
			},

			{
				title: content.sections.security.title,
				items: content.sections.security.points,
				keys: ['point', 'description']
			},

			{
				title: content.sections.bestPractices.title,
				items: content.sections.bestPractices.practices,
				keys: ['practice', 'description']
			}
		]);

		for (let $$index_8 = 0, $$length = each_array_7.length; $$index_8 < $$length; $$index_8++) {
			let section = each_array_7[$$index_8];

			$$renderer.push(`<details class="info-accordion svelte-ly52b1"><summary class="accordion-summary svelte-ly52b1">`);
			Icon($$renderer, { name: 'chevron-right', size: 'sm' });
			$$renderer.push(`<!----> <h4 class="svelte-ly52b1">${$.escape(section.title)}</h4></summary> <div class="accordion-content svelte-ly52b1"><ul class="svelte-ly52b1"><!--[-->`);

			const each_array_8 = $.ensure_array_like(section.items);

			for (let $$index_7 = 0, $$length = each_array_8.length; $$index_7 < $$length; $$index_7++) {
				let item = each_array_8[$$index_7];

				$$renderer.push(`<li class="svelte-ly52b1"><strong>${$.escape(item[section.keys[0]])}:</strong> ${$.escape(item[section.keys[1]])} `);

				if (section.keys[2] && item[section.keys[2]]) {
					$$renderer.push(`<!--[0--><em class="example-text svelte-ly52b1">(${$.escape(item[section.keys[2]])})</em>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></li>`);
			}

			$$renderer.push(`<!--]--></ul></div></details>`);
		}

		$$renderer.push(`<!--]--> <details class="info-accordion svelte-ly52b1"><summary class="accordion-summary svelte-ly52b1">`);
		Icon($$renderer, { name: 'chevron-right', size: 'sm' });
		$$renderer.push(`<!----> <h4 class="svelte-ly52b1">Quick Tips</h4></summary> <div class="accordion-content svelte-ly52b1"><ul class="svelte-ly52b1"><!--[-->`);

		const each_array_9 = $.ensure_array_like(content.quickTips);

		for (let $$index_9 = 0, $$length = each_array_9.length; $$index_9 < $$length; $$index_9++) {
			let tip = each_array_9[$$index_9];

			$$renderer.push(`<li class="svelte-ly52b1">${$.escape(tip)}</li>`);
		}

		$$renderer.push(`<!--]--></ul></div></details></div></div></div>`);
	});
}