import * as $ from 'svelte/internal/server';
import { convertWildcardMasks } from '$lib/utils/wildcard-mask.js';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import '../../../styles/diagnostics-pages.scss';
import { useClipboard } from '$lib/composables';
import { formatNumber } from '$lib/utils/formatters';

export default function WildcardMask($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let inputText = '192.168.1.0/24\n10.0.0.0 255.255.255.0\n172.16.0.0 0.0.255.255';
		let result = null;
		let isLoading = false;
		const clipboard = useClipboard();
		let _selectedExample = null;
		let selectedExampleIndex = null;
		let _userModified = false;

		const examples = [
			{
				label: 'Basic CIDR to Wildcard',
				input: `192.168.1.0/24
10.0.0.0/16
172.16.0.0/20`,
				generateACL: false
			},

			{
				label: 'Subnet Mask Format',
				input: `192.168.1.0 255.255.255.0
10.0.0.0 255.255.0.0
172.16.0.0 255.255.240.0`,
				generateACL: false
			},

			{
				label: 'Wildcard Mask Input',
				input: `192.168.0.0 0.0.255.255
10.0.0.0 0.255.255.255
172.16.0.0 0.0.15.255`,
				generateACL: false
			},

			{
				label: 'Mixed Formats',
				input: `192.168.1.0/24
10.0.0.0 255.255.0.0
172.16.0.0 0.0.255.255`,
				generateACL: false
			},

			{
				label: 'Cisco ACL Generation',
				input: `192.168.1.0/24
10.0.0.0/16`,
				generateACL: true
			},

			{
				label: 'Complex Network ACLs',
				input: `192.168.0.0/22
10.1.0.0/20
172.16.100.0/24`,
				generateACL: true
			}
		];

		// ACL options
		let generateACL = false;

		let aclType = 'permit';
		let protocol = 'ip';
		let destination = 'any';

		function convertMasks() {
			if (!inputText.trim()) {
				result = null;

				return;
			}

			isLoading = true;

			try {
				const inputs = inputText.split('\n').filter((line) => line.trim());

				result = convertWildcardMasks(inputs, {
					type: aclType,
					protocol: protocol || 'ip',
					destination: destination || 'any',
					generateACL
				});
			} catch(error) {
				result = {
					conversions: [],
					aclRules: { cisco: [], juniper: [], generic: [] },
					summary: { totalInputs: 0, validInputs: 0, invalidInputs: 0 },
					errors: [error instanceof Error ? error.message : 'Unknown error']
				};
			} finally {
				isLoading = false;
			}
		}

		function exportResults(format) {
			if (!result) return;

			const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
			let content = '';
			let filename = '';

			if (format === 'csv') {
				const headers = 'Input,Type,CIDR,Subnet Mask,Wildcard Mask,Prefix,Host Bits,Network,Broadcast,Total Hosts,Usable Hosts,Valid,Error';
				const rows = result.conversions.map((conv) => `"${conv.input}","${conv.inputType}","${conv.cidr}","${conv.subnetMask}","${conv.wildcardMask}","${conv.prefixLength}","${conv.hostBits}","${conv.networkAddress}","${conv.broadcastAddress}","${conv.totalHosts}","${conv.usableHosts}","${conv.isValid}","${conv.error || ''}"`);

				content = [headers, ...rows].join('\n');
				filename = `wildcard-masks-${timestamp}.csv`;
			} else {
				content = JSON.stringify(result, null, 2);
				filename = `wildcard-masks-${timestamp}.json`;
			}

			const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'application/json' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');

			a.href = url;
			a.download = filename;
			a.click();
			URL.revokeObjectURL(url);
		}

		function copyACLRules(type) {
			if (!result) return;

			const rules = result.aclRules[type];

			if (rules.length > 0) {
				clipboard.copy(rules.join('\n'), `acl-${type}`);
			}
		}

		function loadExample(example, index) {
			inputText = example.input;
			generateACL = example.generateACL;
			_selectedExample = example.label;
			selectedExampleIndex = index;
			_userModified = false;
		}

		function handleInputChange() {
			_userModified = true;
			_selectedExample = null;
			selectedExampleIndex = null;
		}

		$$renderer.push(`<div class="card"><header class="card-header"><h2>Wildcard Mask Converter</h2> <p>Convert between CIDR notation, subnet masks, and wildcard masks with ACL rule generation</p></header> <div class="card examples-card"><details class="examples-details"><summary class="examples-summary">`);
		Icon($$renderer, { name: 'chevron-right', size: 'xs' });
		$$renderer.push(`<!----> <h4>Quick Examples</h4></summary> <div class="examples-grid"><!--[-->`);

		const each_array = $.ensure_array_like(
			// Auto-convert when inputs or ACL settings change
			// Update ACL when settings change
			examples
		);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let example = each_array[i];

			$$renderer.push(`<button${$.attr_class('example-card', void 0, { 'selected': selectedExampleIndex === i })}><div class="example-label">${$.escape(example.label)}</div> <div class="example-preview">${$.escape(example.generateACL ? 'With ACL' : 'Conversion only')}</div></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div> <div class="input-section svelte-1n66kwe"><div class="inputs-section svelte-1n66kwe"><h3 class="svelte-1n66kwe">Network Inputs</h3> <div class="input-group svelte-1n66kwe"><label for="inputs" class="svelte-1n66kwe">IP Addresses, CIDRs, or Ranges</label> <textarea id="inputs" placeholder="192.168.1.0/24
10.0.0.0 255.255.255.0
172.16.0.0 0.0.255.255" rows="6" class="svelte-1n66kwe">`);

		const $$body = $.escape(inputText);

		if ($$body) {
			$$renderer.push(`${$$body}`);
		} else {}

		$$renderer.push(`</textarea> <div class="input-help svelte-1n66kwe">Enter one per line: CIDR (192.168.1.0/24), network + subnet mask (10.0.0.0 255.255.255.0), or network +
          wildcard mask (172.16.0.0 0.0.255.255)</div></div></div> <div class="acl-section svelte-1n66kwe"><h3 class="svelte-1n66kwe">ACL Options</h3> <div class="checkbox-group svelte-1n66kwe"><label class="checkbox-label svelte-1n66kwe"><input type="checkbox"${$.attr('checked', generateACL, true)} class="svelte-1n66kwe"/> <span class="checkbox-text svelte-1n66kwe">Generate ACL Rules</span></label></div> `);

		if (generateACL) {
			$$renderer.push(`<!--[0--><div class="acl-settings svelte-1n66kwe"><div class="input-group svelte-1n66kwe"><label for="acl-type" class="svelte-1n66kwe">Action</label> `);

			$$renderer.select(
				{
					id: 'acl-type',
					value: aclType,
					onchange: handleInputChange,
					class: ''
				},
				($$renderer) => {
					$$renderer.option({ value: 'permit' }, ($$renderer) => {
						$$renderer.push(`Permit`);
					});

					$$renderer.option({ value: 'deny' }, ($$renderer) => {
						$$renderer.push(`Deny`);
					});
				},
				'svelte-1n66kwe'
			);

			$$renderer.push(`</div> <div class="input-group svelte-1n66kwe"><label for="protocol" class="svelte-1n66kwe">Protocol</label> <input id="protocol" type="text"${$.attr('value', protocol)} placeholder="ip" class="svelte-1n66kwe"/></div> <div class="input-group svelte-1n66kwe"><label for="destination" class="svelte-1n66kwe">Destination</label> <input id="destination" type="text"${$.attr('value', destination)} placeholder="any" class="svelte-1n66kwe"/></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div> `);

		if (isLoading) {
			$$renderer.push(`<!--[0--><div class="loading svelte-1n66kwe">`);
			Icon($$renderer, { name: 'loader' });
			$$renderer.push(`<!----> Converting masks...</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (result) {
			$$renderer.push(`<!--[0--><div class="results svelte-1n66kwe">`);

			if (result.errors.length > 0) {
				$$renderer.push(`<!--[0--><div class="errors svelte-1n66kwe"><h3 class="svelte-1n66kwe">`);
				Icon($$renderer, { name: 'alert-triangle' });
				$$renderer.push(`<!----> Errors</h3> <!--[-->`);

				const each_array_1 = $.ensure_array_like(result.errors);

				for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
					let error = each_array_1[index];

					$$renderer.push(`<div class="error-item svelte-1n66kwe">${$.escape(error)}</div>`);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (result.conversions.length > 0) {
				$$renderer.push(`<!--[0--><div class="summary svelte-1n66kwe"><h3 class="svelte-1n66kwe">Conversion Summary</h3> <div class="summary-stats svelte-1n66kwe"><div class="stat svelte-1n66kwe"><span class="stat-value svelte-1n66kwe">${$.escape(result.summary.totalInputs)}</span> <span class="stat-label svelte-1n66kwe">Total Inputs</span></div> <div class="stat aligned svelte-1n66kwe"><span class="stat-value svelte-1n66kwe">${$.escape(result.summary.validInputs)}</span> <span class="stat-label svelte-1n66kwe">Valid</span></div> <div class="stat misaligned svelte-1n66kwe"><span class="stat-value svelte-1n66kwe">${$.escape(result.summary.invalidInputs)}</span> <span class="stat-label svelte-1n66kwe">Invalid</span></div></div></div> <div class="conversions"><div class="conversions-header svelte-1n66kwe"><h3 class="svelte-1n66kwe">Mask Conversions</h3> <div class="export-buttons svelte-1n66kwe"><button class="svelte-1n66kwe">`);
				Icon($$renderer, { name: 'csv-file' });
				$$renderer.push(`<!----> Export CSV</button> <button class="svelte-1n66kwe">`);
				Icon($$renderer, { name: 'json-file' });
				$$renderer.push(`<!----> Export JSON</button></div></div> <div class="conversions-grid svelte-1n66kwe"><!--[-->`);

				const each_array_2 = $.ensure_array_like(result.conversions);

				for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
					let conversion = each_array_2[index];

					$$renderer.push(`<div${$.attr_class('conversion-card svelte-1n66kwe', void 0, {
						'aligned': conversion.isValid,
						'misaligned': !conversion.isValid
					})}><div class="check-header svelte-1n66kwe"><div class="check-input svelte-1n66kwe"><span class="input-text svelte-1n66kwe">${$.escape(conversion.input)}</span> <span class="input-type svelte-1n66kwe">${$.escape(conversion.inputType.replace('-', ' ').toUpperCase())}</span></div> <div class="check-status svelte-1n66kwe">`);

					if (conversion.isValid) {
						$$renderer.push('<!--[0-->');
						Icon($$renderer, { name: 'check-circle' });
						$$renderer.push(`<!----> Valid`);
					} else {
						$$renderer.push('<!--[-1-->');
						Icon($$renderer, { name: 'x-circle' });
						$$renderer.push(`<!----> Invalid`);
					}

					$$renderer.push(`<!--]--></div></div> `);

					if (conversion.isValid) {
						$$renderer.push(`<!--[0--><div class="conversion-details svelte-1n66kwe"><div class="detail-row svelte-1n66kwe"><span class="label svelte-1n66kwe">CIDR:</span> <div class="code-container svelte-1n66kwe"><code class="svelte-1n66kwe">${$.escape(conversion.cidr)}</code> <button type="button"${$.attr_class('btn btn-icon btn-xs svelte-1n66kwe', void 0, { 'copied': clipboard.isCopied(conversion.cidr) })}>`);

						Icon($$renderer, {
							name: clipboard.isCopied(conversion.cidr) ? 'check' : 'copy',
							size: 'xs'
						});

						$$renderer.push(`<!----></button></div></div> <div class="detail-row svelte-1n66kwe"><span class="label svelte-1n66kwe">Subnet Mask:</span> <div class="code-container svelte-1n66kwe"><code class="svelte-1n66kwe">${$.escape(conversion.subnetMask)}</code> <button type="button"${$.attr_class('btn btn-icon btn-xs svelte-1n66kwe', void 0, { 'copied': clipboard.isCopied(conversion.subnetMask) })}>`);

						Icon($$renderer, {
							name: clipboard.isCopied(conversion.subnetMask) ? 'check' : 'copy',
							size: 'xs'
						});

						$$renderer.push(`<!----></button></div></div> <div class="detail-row svelte-1n66kwe"><span class="label svelte-1n66kwe">Wildcard Mask:</span> <div class="code-container svelte-1n66kwe"><code class="svelte-1n66kwe">${$.escape(conversion.wildcardMask)}</code> <button type="button"${$.attr_class('btn btn-icon btn-xs svelte-1n66kwe', void 0, { 'copied': clipboard.isCopied(conversion.wildcardMask) })}>`);

						Icon($$renderer, {
							name: clipboard.isCopied(conversion.wildcardMask) ? 'check' : 'copy',
							size: 'xs'
						});

						$$renderer.push(`<!----></button></div></div> <div class="network-info svelte-1n66kwe"><div class="info-grid svelte-1n66kwe"><div><span class="info-label svelte-1n66kwe">Network:</span> <span class="info-value svelte-1n66kwe">${$.escape(conversion.networkAddress)}</span></div> <div><span class="info-label svelte-1n66kwe">Broadcast:</span> <span class="info-value svelte-1n66kwe">${$.escape(conversion.broadcastAddress)}</span></div> <div><span class="info-label svelte-1n66kwe">Host Bits:</span> <span class="info-value svelte-1n66kwe">${$.escape(conversion.hostBits)}</span></div> <div><span class="info-label svelte-1n66kwe">Usable Hosts:</span> <span class="info-value svelte-1n66kwe">${$.escape(formatNumber(conversion.usableHosts))}</span></div></div></div></div>`);
					} else {
						$$renderer.push(`<!--[-1--><div class="error-message svelte-1n66kwe">`);
						Icon($$renderer, { name: 'alert-triangle' });
						$$renderer.push(`<!----> ${$.escape(conversion.error)}</div>`);
					}

					$$renderer.push(`<!--]--></div>`);
				}

				$$renderer.push(`<!--]--></div></div> `);

				if (generateACL && (result.aclRules.cisco.length > 0 || result.aclRules.juniper.length > 0 || result.aclRules.generic.length > 0)) {
					$$renderer.push(`<!--[0--><div class="acl-rules-container svelte-1n66kwe"><h3 class="svelte-1n66kwe">Generated ACL Rules</h3> `);

					if (result.aclRules.cisco.length > 0) {
						$$renderer.push(`<!--[0--><div class="acl-section svelte-1n66kwe"><div class="acl-header svelte-1n66kwe"><h4 class="svelte-1n66kwe">Cisco ACL</h4> <button${$.attr_class(`copy-btn ${clipboard.isCopied('acl-cisco') ? 'copied' : ''}`, 'svelte-1n66kwe')}>`);

						Icon($$renderer, {
							name: clipboard.isCopied('acl-cisco') ? 'check' : 'copy',
							size: 'xs'
						});

						$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('acl-cisco') ? 'Copied!' : 'Copy')}</button></div> <div class="acl-code svelte-1n66kwe"><!--[-->`);

						const each_array_3 = $.ensure_array_like(result.aclRules.cisco);

						for (let index = 0, $$length = each_array_3.length; index < $$length; index++) {
							let rule = each_array_3[index];

							$$renderer.push(`<div class="acl-line svelte-1n66kwe">${$.escape(rule)}</div>`);
						}

						$$renderer.push(`<!--]--></div></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (result.aclRules.juniper.length > 0) {
						$$renderer.push(`<!--[0--><div class="acl-section svelte-1n66kwe"><div class="acl-header svelte-1n66kwe"><h4 class="svelte-1n66kwe">Juniper ACL</h4> <button${$.attr_class(`copy-btn ${clipboard.isCopied('acl-juniper') ? 'copied' : ''}`, 'svelte-1n66kwe')}>`);

						Icon($$renderer, {
							name: clipboard.isCopied('acl-juniper') ? 'check' : 'copy',
							size: 'xs'
						});

						$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('acl-juniper') ? 'Copied!' : 'Copy')}</button></div> <div class="acl-code svelte-1n66kwe"><!--[-->`);

						const each_array_4 = $.ensure_array_like(result.aclRules.juniper);

						for (let index = 0, $$length = each_array_4.length; index < $$length; index++) {
							let rule = each_array_4[index];

							$$renderer.push(`<div class="acl-line svelte-1n66kwe">${$.escape(rule)}</div>`);
						}

						$$renderer.push(`<!--]--></div></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (result.aclRules.generic.length > 0) {
						$$renderer.push(`<!--[0--><div class="acl-section svelte-1n66kwe"><div class="acl-header svelte-1n66kwe"><h4 class="svelte-1n66kwe">Generic ACL</h4> <button${$.attr_class(`copy-btn ${clipboard.isCopied('acl-generic') ? 'copied' : ''}`, 'svelte-1n66kwe')}>`);

						Icon($$renderer, {
							name: clipboard.isCopied('acl-generic') ? 'check' : 'copy',
							size: 'xs'
						});

						$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('acl-generic') ? 'Copied!' : 'Copy')}</button></div> <div class="acl-code svelte-1n66kwe"><!--[-->`);

						const each_array_5 = $.ensure_array_like(result.aclRules.generic);

						for (let index = 0, $$length = each_array_5.length; index < $$length; index++) {
							let rule = each_array_5[index];

							$$renderer.push(`<div class="acl-line svelte-1n66kwe">${$.escape(rule)}</div>`);
						}

						$$renderer.push(`<!--]--></div></div>`);
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

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}