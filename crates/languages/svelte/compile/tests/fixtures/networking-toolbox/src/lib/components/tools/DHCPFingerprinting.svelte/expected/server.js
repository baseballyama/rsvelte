import * as $ from 'svelte/internal/server';

import {
	parseParameterList,
	searchFingerprints,
	searchByDevice,
	analyzeOptions,
	formatParameterListToHex,
	formatParameterListDisplay,
	exportAsJSON,
	exportAsCSV,
	DHCP_OPTION_NAMES,
	FINGERPRINT_DATABASE
} from '$lib/utils/dhcp-fingerprinting';

import { untrack } from 'svelte';
import ToolContentContainer from '$lib/components/global/ToolContentContainer.svelte';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import { useClipboard } from '$lib/composables/useClipboard.svelte';

export default function DHCPFingerprinting($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const clipboard = useClipboard(1800);
		let activeTab = 'lookup';
		let parameterInput = '';
		let vendorClass = '';
		let matches = [];
		let parsedParams = [];
		let error = '';
		let analysis = null;
		let reverseQuery = '';
		let reverseResults = [];

		const examples = [
			{
				label: 'Windows 10/11',
				description: 'Modern Windows desktop',
				params: '1,3,6,15,31,33,43,44,46,47,119,121,249,252',
				vendor: ''
			},

			{
				label: 'macOS/iOS',
				description: 'Apple device',
				params: '1,3,6,15,119,252',
				vendor: ''
			},

			{
				label: 'Android',
				description: 'Android smartphone',
				params: '1,3,6,15,26,28,51,58,59,43',
				vendor: 'dhcpcd'
			},

			{
				label: 'Linux (dhclient)',
				description: 'Linux with ISC dhclient',
				params: '1,3,6,15,26,28,42',
				vendor: ''
			},

			{
				label: 'Cisco IP Phone',
				description: 'Cisco VoIP device',
				params: '1,3,6,12,15,28,42,66,67,120,150',
				vendor: 'Cisco'
			},

			{
				label: 'Raspberry Pi',
				description: 'Raspberry Pi OS (Debian)',
				params: '1,3,6,12,15,28,40,41,42',
				vendor: ''
			},

			{
				label: 'Samsung Smart TV',
				description: 'Smart TV device',
				params: '1,3,6,12,15,28,40,41,42,119',
				vendor: 'SAMSUNG'
			}
		];

		const navOptions = [
			{
				value: 'lookup',
				label: 'Fingerprint Lookup',
				icon: 'fingerprint'
			},
			{ value: 'reverse', label: 'Device Search', icon: 'monitor' }
		];

		function loadExample(ex) {
			activeTab = 'lookup';
			parameterInput = ex.params;
			vendorClass = ex.vendor;
		}

		function downloadFile(content, filename, type) {
			const blob = new Blob([content], { type });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');

			a.href = url;
			a.download = filename;
			a.click();
			URL.revokeObjectURL(url);
		}

		function handleExportJSON() {
			if (!analysis || matches.length === 0) return;

			const json = exportAsJSON(parsedParams, matches, analysis, vendorClass || undefined);

			downloadFile(json, 'dhcp-fingerprint.json', 'application/json');
		}

		function handleExportCSV() {
			if (matches.length === 0) return;

			const csv = exportAsCSV(matches);

			downloadFile(csv, 'dhcp-fingerprint.csv', 'text/csv');
		}

		// Search effect for fingerprint lookup
		// Search effect for reverse lookup
		const categoryColors = {
			desktop: 'var(--color-primary)',
			mobile: 'var(--color-info)',
			iot: 'var(--color-warning)',
			server: 'var(--color-success)',
			network: 'var(--color-purple)',
			gaming: 'var(--color-primary)',
			other: 'var(--text-tertiary)'
		};

		const confidenceBadges = { high: '🟢', medium: '🟡', low: '🔴' };
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			ToolContentContainer($$renderer, {
				title: 'DHCP Fingerprinting Database',
				description: `Identify devices based on their DHCP fingerprints using Parameter Request List (Option 55) and Vendor Class Identifier (Option 60). Database contains ${$.stringify(FINGERPRINT_DATABASE.length)} known fingerprints from common devices, operating systems, and IoT equipment.`,
				navOptions,
				get selectedNav() {
					return activeTab;
				},

				set selectedNav($$value) {
					activeTab = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					if (activeTab === 'lookup') {
						$$renderer.push('<!--[0-->');

						ExamplesCard($$renderer, {
							examples,
							onSelect: loadExample,
							getLabel: (ex) => ex.label,
							getDescription: (ex) => ex.description
						});

						$$renderer.push(`<!----> <div class="card input-card svelte-1rwntcp"><h3 class="svelte-1rwntcp">Device Fingerprint Lookup</h3> <div class="form-group svelte-1rwntcp"><label for="param-list" class="svelte-1rwntcp">Parameter Request List (Option 55)</label> <input id="param-list" type="text"${$.attr('value', parameterInput)} placeholder="e.g., 1,3,6,15 or 0103060f or 1 3 6 15" class="input svelte-1rwntcp"/> <span class="hint svelte-1rwntcp">Enter as comma-separated, hex, or space-separated numbers</span></div> <div class="form-group svelte-1rwntcp"><label for="vendor-class" class="svelte-1rwntcp">Vendor Class Identifier (Option 60) - Optional</label> <input id="vendor-class" type="text"${$.attr('value', vendorClass)} placeholder="e.g., MSFT, dhcpcd, Cisco" class="input svelte-1rwntcp"/> <span class="hint svelte-1rwntcp">Helps improve match accuracy</span></div> `);

						if (error) {
							$$renderer.push(`<!--[0--><div class="error-card svelte-1rwntcp"><strong class="svelte-1rwntcp">Error:</strong> <p class="svelte-1rwntcp">${$.escape(error)}</p></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div> `);

						if (parsedParams.length > 0) {
							$$renderer.push(`<!--[0--><div class="card result-card svelte-1rwntcp"><h3 class="svelte-1rwntcp">Requested DHCP Options</h3> <div class="result-item svelte-1rwntcp"><span class="label svelte-1rwntcp">Parameter List:</span> <code class="code-value svelte-1rwntcp">${$.escape(formatParameterListDisplay(parsedParams))}</code> <button${$.attr_class('btn-copy svelte-1rwntcp', void 0, { 'copied': clipboard.isCopied('param-list') })} aria-label="Copy">${$.escape(clipboard.isCopied('param-list') ? 'Copied' : 'Copy')}</button></div> <div class="result-item svelte-1rwntcp"><span class="label svelte-1rwntcp">Hex Encoded:</span> <code class="code-value svelte-1rwntcp">${$.escape(formatParameterListToHex(parsedParams))}</code> <button${$.attr_class('btn-copy svelte-1rwntcp', void 0, { 'copied': clipboard.isCopied('param-hex') })} aria-label="Copy hex">${$.escape(clipboard.isCopied('param-hex') ? 'Copied' : 'Copy')}</button></div> <div class="options-grid svelte-1rwntcp"><!--[-->`);

							const each_array = $.ensure_array_like(parsedParams);

							for (let i = 0, $$length = each_array.length; i < $$length; i++) {
								let param = each_array[i];

								$$renderer.push(`<div class="option-badge svelte-1rwntcp"><span class="option-num svelte-1rwntcp">${$.escape(param)}</span> <span class="option-name svelte-1rwntcp">${$.escape(DHCP_OPTION_NAMES[param] || 'Unknown')}</span></div>`);
							}

							$$renderer.push(`<!--]--></div> `);

							if (analysis && analysis.warnings.length > 0) {
								$$renderer.push(`<!--[0--><div class="card warning-card svelte-1rwntcp"><h3 class="svelte-1rwntcp">Security Warnings</h3> <!--[-->`);

								const each_array_1 = $.ensure_array_like(analysis.warnings);

								for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
									let warning = each_array_1[i];

									$$renderer.push(`<div class="warning-item svelte-1rwntcp">⚠️ ${$.escape(warning)}</div>`);
								}

								$$renderer.push(`<!--]--></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

							if (analysis && (analysis.unusual.length > 0 || analysis.missing.length > 0 && matches.length > 0)) {
								$$renderer.push(`<!--[0--><div class="card analysis-card svelte-1rwntcp"><h3 class="svelte-1rwntcp">Option Analysis</h3> `);

								if (analysis.unusual.length > 0) {
									$$renderer.push(`<!--[0--><div class="info-section svelte-1rwntcp"><h4 class="svelte-1rwntcp">Unusual Options Detected</h4> <p class="svelte-1rwntcp">These options may indicate vendor-specific configurations:</p> <code class="code-value svelte-1rwntcp">${$.escape(analysis.unusual.map((o) => `${o} (${DHCP_OPTION_NAMES[o] || 'Unknown'})`).join(', '))}</code></div>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--> `);

								if (analysis.missing.length > 0 && matches.length > 0) {
									$$renderer.push(`<!--[0--><div class="info-section svelte-1rwntcp"><h4 class="svelte-1rwntcp">Missing Options (vs. Best Match)</h4> <p class="svelte-1rwntcp">Options present in the best match but not in your fingerprint:</p> <code class="code-value svelte-1rwntcp">${$.escape(analysis.missing.map((o) => `${o} (${DHCP_OPTION_NAMES[o] || 'Unknown'})`).join(', '))}</code></div>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (matches.length > 0) {
							$$renderer.push(`<!--[0--><div class="card matches-card svelte-1rwntcp"><div class="matches-header svelte-1rwntcp"><h3 class="svelte-1rwntcp">Matching Devices (${$.escape(matches.length)})</h3> <div class="export-buttons svelte-1rwntcp"><button class="btn btn-secondary btn-sm svelte-1rwntcp">Export JSON</button> <button class="btn btn-secondary btn-sm svelte-1rwntcp">Export CSV</button></div></div> <div class="matches-list"><!--[-->`);

							const each_array_2 = $.ensure_array_like(matches);

							for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
								let match = each_array_2[i];

								$$renderer.push(`<div class="match-item svelte-1rwntcp"><div class="match-header svelte-1rwntcp"><div class="match-title svelte-1rwntcp"><span class="category-badge svelte-1rwntcp"${$.attr_style(`background: ${$.stringify(categoryColors[match.fingerprint.category] || categoryColors.other)}`)}>${$.escape(match.fingerprint.category)}</span> <h4 class="svelte-1rwntcp">${$.escape(match.fingerprint.device)}</h4> <span class="confidence svelte-1rwntcp">${$.escape(confidenceBadges[match.fingerprint.confidence] || '')}
                    ${$.escape(match.fingerprint.confidence)} confidence</span></div> <div class="match-score svelte-1rwntcp"><span class="score-value svelte-1rwntcp">${$.escape(match.matchScore.toFixed(0))}%</span> <span class="score-label svelte-1rwntcp">Match</span></div></div> <div class="match-details"><div class="detail-row svelte-1rwntcp"><span class="detail-label svelte-1rwntcp">OS:</span> <span>${$.escape(match.fingerprint.os)}</span></div> <div class="detail-row svelte-1rwntcp"><span class="detail-label svelte-1rwntcp">Matched On:</span> <span>${$.escape(match.matchedOn.join(', '))}</span></div> `);

								if (match.fingerprint.description) {
									$$renderer.push(`<!--[0--><div class="detail-row svelte-1rwntcp"><span class="detail-label svelte-1rwntcp">Description:</span> <span>${$.escape(match.fingerprint.description)}</span></div>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--> <div class="detail-row svelte-1rwntcp"><span class="detail-label svelte-1rwntcp">Known Parameters:</span> <code class="code-small svelte-1rwntcp">${$.escape(formatParameterListDisplay(match.fingerprint.parameterRequestList))}</code></div></div></div>`);
							}

							$$renderer.push(`<!--]--></div></div>`);
						} else if (parsedParams.length > 0 && !error) {
							$$renderer.push(`<!--[1--><div class="card no-match-card svelte-1rwntcp"><h3 class="svelte-1rwntcp">No Matches Found</h3> <p class="svelte-1rwntcp">The provided fingerprint doesn't match any known devices in the database. This could be:</p> <ul class="svelte-1rwntcp"><li>A custom DHCP client configuration</li> <li>An uncommon device or operating system</li> <li>A device with a modified DHCP request list</li></ul> <p class="hint svelte-1rwntcp">Try adding the Vendor Class Identifier if available.</p></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					} else {
						$$renderer.push(`<!--[-1--><div class="card input-card svelte-1rwntcp"><h3 class="svelte-1rwntcp">Search by Device or OS</h3> <div class="form-group svelte-1rwntcp"><label for="reverse-query" class="svelte-1rwntcp">Search for Device/OS/Vendor</label> <input id="reverse-query" type="text"${$.attr('value', reverseQuery)} placeholder="e.g., iPhone, Windows, Cisco, Printer..." class="input svelte-1rwntcp"/> <span class="hint svelte-1rwntcp">Search the database by device name, OS, or vendor</span></div></div> `);

						if (reverseResults.length > 0) {
							$$renderer.push(`<!--[0--><div class="card result-card svelte-1rwntcp"><h3 class="svelte-1rwntcp">Found ${$.escape(reverseResults.length)} Device${$.escape(reverseResults.length > 1 ? 's' : '')}</h3> <!--[-->`);

							const each_array_3 = $.ensure_array_like(reverseResults);

							for (let i = 0, $$length = each_array_3.length; i < $$length; i++) {
								let device = each_array_3[i];

								$$renderer.push(`<div class="reverse-item svelte-1rwntcp"><div class="reverse-header svelte-1rwntcp"><span class="category-badge svelte-1rwntcp"${$.attr_style(`background: ${$.stringify(categoryColors[device.category] || categoryColors.other)}`)}>${$.escape(device.category)}</span> <h4 class="svelte-1rwntcp">${$.escape(device.device)}</h4> <span class="confidence">${$.escape(confidenceBadges[device.confidence] || '')}
                ${$.escape(device.confidence)} confidence</span></div> <div class="reverse-details svelte-1rwntcp"><div class="detail-row svelte-1rwntcp"><span class="detail-label svelte-1rwntcp">OS:</span> <span>${$.escape(device.os)}</span></div> `);

								if (device.description) {
									$$renderer.push(`<!--[0--><div class="detail-row svelte-1rwntcp"><span class="detail-label svelte-1rwntcp">Description:</span> <span>${$.escape(device.description)}</span></div>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--> <div class="detail-row svelte-1rwntcp"><span class="detail-label svelte-1rwntcp">Parameter Request List:</span> <code class="code-small svelte-1rwntcp">${$.escape(formatParameterListDisplay(device.parameterRequestList))}</code> <button${$.attr_class('btn-copy svelte-1rwntcp', void 0, { 'copied': clipboard.isCopied(`reverse-${i}`) })} aria-label="Copy parameter list">${$.escape(clipboard.isCopied(`reverse-${i}`) ? 'Copied' : 'Copy')}</button></div> `);

								if (device.vendorClassPattern) {
									$$renderer.push(`<!--[0--><div class="detail-row svelte-1rwntcp"><span class="detail-label svelte-1rwntcp">Vendor Class Pattern:</span> <code class="code-small svelte-1rwntcp">${$.escape(device.vendorClassPattern)}</code></div>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--></div></div>`);
							}

							$$renderer.push(`<!--]--></div>`);
						} else if (reverseQuery.trim()) {
							$$renderer.push(`<!--[1--><div class="card no-match-card svelte-1rwntcp"><h3 class="svelte-1rwntcp">No Devices Found</h3> <p class="svelte-1rwntcp">No devices matched "${$.escape(reverseQuery)}". Try a different search term.</p></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}