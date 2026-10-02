import * as $ from 'svelte/internal/server';
import Icon from '$lib/components/global/Icon.svelte';

import {
	parseDNSKEYRecord,
	validateDNSKEY,
	generateCDSRecords,
	generateCDNSKEYRecord,
	formatCDSRecord,
	formatCDNSKEYRecord,
	validateCDSCDNSKEYUsage,
	DNSSEC_ALGORITHMS,
	DS_DIGEST_TYPES
} from '$lib/utils/dnssec';

export default function CDSCDNSKEYBuilder($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let dnskeyInput = 'example.org. 3600 IN DNSKEY 257 3 8 AwEAAcvvJUWJNrPOTMmNhZmJLk85n4Pz+KqvfxJ1X0O+fJ4GJNdqsNvP1mQJJv8A4dNn...';
		let ownerName = 'example.org.';
		let generateCDS = true;
		let generateCDNSKEY = true;
		let isActiveExample = true;

		let results = {
			error: null,
			dnskey: null,
			cdsRecords: [],
			cdnskeyRecord: null,
			warnings: []
		};

		let isGenerating = false;
		let copiedStates = {};

		function calculateResults() {
			if (!dnskeyInput.trim()) {
				results = {
					error: null,
					dnskey: null,
					cdsRecords: [],
					cdnskeyRecord: null,
					warnings: []
				};

				return;
			}

			const validation = validateDNSKEY(dnskeyInput);

			if (!validation.valid) {
				results = {
					error: validation.error || 'Invalid DNSKEY record',
					dnskey: null,
					cdsRecords: [],
					cdnskeyRecord: null,
					warnings: []
				};

				return;
			}

			const dnskey = parseDNSKEYRecord(dnskeyInput);

			if (!dnskey) {
				results = {
					error: 'Failed to parse DNSKEY record',
					dnskey: null,
					cdsRecords: [],
					cdnskeyRecord: null,
					warnings: []
				};

				return;
			}

			const usageValidation = validateCDSCDNSKEYUsage(dnskey);
			const cdnskeyRecord = generateCDNSKEY ? generateCDNSKEYRecord(dnskey) : null;

			results = {
				error: null,
				dnskey,
				cdsRecords: [],
				cdnskeyRecord,
				warnings: usageValidation.warnings
			};

			generateRecordsAsync();
		}

		async function generateRecordsAsync() {
			if (!results.dnskey || !ownerName.trim()) return;

			isGenerating = true;

			try {
				if (generateCDS) {
					const cdsRecords = await generateCDSRecords(results.dnskey, ownerName);

					results.cdsRecords = cdsRecords;
				} else {
					results.cdsRecords = [];
				}
			} catch(err) {
				console.error('Error generating CDS records:', err);
				results.cdsRecords = [];
			} finally {
				isGenerating = false;
			}
		}

		async function copyToClipboard(text, key) {
			try {
				await navigator.clipboard.writeText(text);
				copiedStates[key] = true;

				setTimeout(
					() => {
						copiedStates[key] = false;
					},
					2000
				);
			} catch(err) {
				console.error('Failed to copy:', err);
			}
		}

		function copyAllRecords() {
			const records = [];

			if (generateCDS && results.cdsRecords.length > 0) {
				records.push('# CDS Records');

				results.cdsRecords.forEach((cds) => {
					records.push(formatCDSRecord(cds, ownerName));
				});
			}

			if (generateCDNSKEY && results.cdnskeyRecord) {
				if (records.length > 0) records.push('');

				records.push('# CDNSKEY Record');
				records.push(formatCDNSKEYRecord(results.cdnskeyRecord, ownerName));
			}

			copyToClipboard(records.join('\n'), 'all');
		}

		function handleInputChange() {
			if (isActiveExample && dnskeyInput !== 'example.org. 3600 IN DNSKEY 257 3 8 AwEAAcvvJUWJNrPOTMmNhZmJLk85n4Pz+KqvfxJ1X0O+fJ4GJNdqsNvP1mQJJv8A4dNn...') {
				isActiveExample = false;
			}

			calculateResults();
		}

		// Initialize
		calculateResults();

		$$renderer.push(`<div class="card svelte-1kxph8y"><header class="card-header svelte-1kxph8y"><h1 class="svelte-1kxph8y">CDS/CDNSKEY Builder</h1> <p class="svelte-1kxph8y">Build CDS/CDNSKEY RRs from child DNSKEYs to enable automated DS updates at the parent. These records allow child
      zones to signal DS record changes to parent zones for automated DNSSEC maintenance.</p></header> <div class="card input-card svelte-1kxph8y"><div class="form-group svelte-1kxph8y"><label for="dnskey-input" class="svelte-1kxph8y">`);

		Icon($$renderer, { name: 'key', size: 'sm' });
		$$renderer.push(`<!----> DNSKEY Record</label> <textarea id="dnskey-input" placeholder="example.org. 3600 IN DNSKEY 257 3 8 AwEAAc..." rows="4"${$.attr_class(`dnskey-input ${isActiveExample ? 'example-active' : ''}`, 'svelte-1kxph8y')}>`);

		const $$body = $.escape(dnskeyInput);

		if ($$body) {
			$$renderer.push(`${$$body}`);
		} else {}

		$$renderer.push(`</textarea> `);

		if (isActiveExample) {
			$$renderer.push(`<!--[0--><p class="field-help svelte-1kxph8y">Using example data - modify to see your results</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <div class="form-group svelte-1kxph8y"><label for="owner-name" class="svelte-1kxph8y">`);
		Icon($$renderer, { name: 'dns', size: 'sm' });
		$$renderer.push(`<!----> Owner Name</label> <input id="owner-name"${$.attr('value', ownerName)} placeholder="example.org." class="owner-input svelte-1kxph8y"/></div> <div class="form-group svelte-1kxph8y"><div class="checkbox-group svelte-1kxph8y"><label class="checkbox-label svelte-1kxph8y"><input type="checkbox" class="styled-checkbox svelte-1kxph8y"${$.attr('checked', generateCDS, true)}/> Generate CDS Records</label> <label class="checkbox-label svelte-1kxph8y"><input type="checkbox" class="styled-checkbox svelte-1kxph8y"${$.attr('checked', generateCDNSKEY, true)}/> Generate CDNSKEY Record</label></div></div></div> `);

		if (results.error) {
			$$renderer.push(`<!--[0--><div class="card error-card svelte-1kxph8y"><div class="error-content svelte-1kxph8y">`);
			Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
			$$renderer.push(`<!----> <div class="svelte-1kxph8y"><strong class="svelte-1kxph8y">Error:</strong> ${$.escape(results.error)}</div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (results.warnings.length > 0) {
			$$renderer.push(`<!--[0--><div class="card warning-card svelte-1kxph8y"><div class="warning-content svelte-1kxph8y">`);
			Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
			$$renderer.push(`<!----> <div class="svelte-1kxph8y"><strong class="svelte-1kxph8y">Warnings:</strong> <ul class="warning-list svelte-1kxph8y"><!--[-->`);

			const each_array = $.ensure_array_like(results.warnings);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let warning = each_array[$$index];

				$$renderer.push(`<li class="svelte-1kxph8y">${$.escape(warning)}</li>`);
			}

			$$renderer.push(`<!--]--></ul></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (results.dnskey) {
			$$renderer.push(`<!--[0--><div class="card dnskey-info-card svelte-1kxph8y"><div class="card-section-header svelte-1kxph8y"><h3 class="svelte-1kxph8y">DNSKEY Information</h3></div> <div class="info-grid svelte-1kxph8y"><div class="info-item svelte-1kxph8y"><span class="info-label svelte-1kxph8y">Key Tag</span> <span class="info-value mono svelte-1kxph8y">${$.escape(results.dnskey.keyTag || 'Calculating...')}</span></div> <div class="info-item svelte-1kxph8y"><span class="info-label svelte-1kxph8y">Algorithm</span> <span class="info-value mono svelte-1kxph8y">${$.escape(results.dnskey.algorithm)} (${$.escape(DNSSEC_ALGORITHMS[results.dnskey.algorithm] || 'Unknown')})</span></div> <div class="info-item svelte-1kxph8y"><span class="info-label svelte-1kxph8y">Key Type</span> <span class="info-value mono svelte-1kxph8y">${$.escape(results.dnskey.keyType || 'Unknown')}</span></div> <div class="info-item svelte-1kxph8y"><span class="info-label svelte-1kxph8y">Flags</span> <span class="info-value mono svelte-1kxph8y">${$.escape(results.dnskey.flags)}</span></div> <div class="info-item svelte-1kxph8y"><span class="info-label svelte-1kxph8y">Protocol</span> <span class="info-value mono svelte-1kxph8y">${$.escape(results.dnskey.protocol)}</span></div></div></div> <div class="card status-card svelte-1kxph8y"><div class="status-content svelte-1kxph8y"><div class="status-item svelte-1kxph8y">`);

			if (isGenerating) {
				$$renderer.push(`<!--[0--><div class="loading svelte-1kxph8y"><div class="spinner svelte-1kxph8y"></div> <span class="svelte-1kxph8y">Generating records...</span></div>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="status success svelte-1kxph8y">`);
				Icon($$renderer, { name: 'check-circle', size: 'sm' });
				$$renderer.push(`<!----> <span class="svelte-1kxph8y">Records generated</span></div>`);
			}

			$$renderer.push(`<!--]--></div> <div class="status-summary svelte-1kxph8y"><p class="svelte-1kxph8y">CDS: ${$.escape(generateCDS ? `${results.cdsRecords.length} records` : 'Disabled')}</p> <p class="svelte-1kxph8y">CDNSKEY: ${$.escape(generateCDNSKEY ? '1 record' : 'Disabled')}</p></div></div></div> `);

			if (generateCDS && results.cdsRecords.length > 0 || generateCDNSKEY && results.cdnskeyRecord) {
				$$renderer.push(`<!--[0--><div class="card records-card svelte-1kxph8y"><div class="records-header svelte-1kxph8y"><h3 class="svelte-1kxph8y">Generated Records</h3> <button${$.attr_class(`copy-button ${copiedStates.all ? 'copied' : ''}`, 'svelte-1kxph8y')}>`);
				Icon($$renderer, { name: copiedStates.all ? 'check' : 'copy', size: 'sm' });
				$$renderer.push(`<!----> Copy All</button></div> `);

				if (generateCDS && results.cdsRecords.length > 0) {
					$$renderer.push(`<!--[0--><div class="record-section svelte-1kxph8y"><h4 class="svelte-1kxph8y">CDS Records (for parent zone):</h4> <div class="record-list svelte-1kxph8y"><!--[-->`);

					const each_array_1 = $.ensure_array_like(results.cdsRecords);

					for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
						let cds = each_array_1[i];

						$$renderer.push(`<div class="record-item svelte-1kxph8y"><div class="record-content svelte-1kxph8y"><div class="record-text mono svelte-1kxph8y">${$.escape(formatCDSRecord(cds, ownerName))}</div> <div class="record-meta svelte-1kxph8y">${$.escape(DS_DIGEST_TYPES[cds.digestType])} digest</div></div> <button${$.attr_class(`copy-button-small ${copiedStates[`cds-${i}`] ? 'copied' : ''}`, 'svelte-1kxph8y')}>`);

						Icon($$renderer, {
							name: copiedStates[`cds-${i}`] ? 'check' : 'copy',
							size: 'xs'
						});

						$$renderer.push(`<!----></button></div>`);
					}

					$$renderer.push(`<!--]--></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (generateCDNSKEY && results.cdnskeyRecord) {
					$$renderer.push(`<!--[0--><div class="record-section svelte-1kxph8y"><h4 class="svelte-1kxph8y">CDNSKEY Record (for child zone):</h4> <div class="record-list svelte-1kxph8y"><div class="record-item svelte-1kxph8y"><div class="record-content svelte-1kxph8y"><div class="record-text mono svelte-1kxph8y">${$.escape(formatCDNSKEYRecord(results.cdnskeyRecord, ownerName))}</div> <div class="record-meta svelte-1kxph8y">Copy this to your child zone</div></div> <button${$.attr_class(`copy-button-small ${copiedStates.cdnskey ? 'copied' : ''}`, 'svelte-1kxph8y')}>`);
					Icon($$renderer, { name: copiedStates.cdnskey ? 'check' : 'copy', size: 'xs' });
					$$renderer.push(`<!----></button></div></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="education-card svelte-1kxph8y"><div class="education-grid svelte-1kxph8y"><div class="education-item info-panel svelte-1kxph8y"><h4 class="svelte-1kxph8y">CDS Records</h4> <p class="svelte-1kxph8y">CDS (Child DS) records are placed in the child zone to signal DS record changes to the parent. Parents can
          automatically process these to update DS records in their zone.</p></div> <div class="education-item info-panel svelte-1kxph8y"><h4 class="svelte-1kxph8y">CDNSKEY Records</h4> <p class="svelte-1kxph8y">CDNSKEY (Child DNSKEY) records are copies of DNSKEYs placed in the child zone. Parents can use these to
          generate DS records automatically using their preferred digest algorithm.</p></div> <div class="education-item info-panel svelte-1kxph8y"><h4 class="svelte-1kxph8y">RFC 8078 Automation</h4> <p class="svelte-1kxph8y">These records enable automated DS maintenance as defined in RFC 8078. This reduces manual coordination between
          child and parent zones during key rollover.</p></div> <div class="education-item info-panel svelte-1kxph8y"><h4 class="svelte-1kxph8y">Implementation Notes</h4> <p class="svelte-1kxph8y">Always use KSK (Key Signing Key) records for CDS/CDNSKEY generation. Verify parent support for automated DS
          updates before relying on this mechanism.</p></div></div></div></div>`);
	});
}