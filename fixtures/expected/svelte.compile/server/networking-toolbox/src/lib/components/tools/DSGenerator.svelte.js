import * as $ from 'svelte/internal/server';

import {
	parseDNSKEYRecord,
	generateDSRecord,
	validateDNSKEY,
	formatDSRecord,
	DNSSEC_ALGORITHMS,
	DS_DIGEST_TYPES
} from '$lib/utils/dnssec';

import { useClipboard } from '$lib/composables';
import Icon from '$lib/components/global/Icon.svelte';

export default function DSGenerator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let dnskeyInput = '';
		let ownerName = 'example.com.';
		let selectedDigestTypes = [2]; // SHA-256 by default
		let activeExampleIndex = -1;

		const examples = [
			{
				title: 'KSK for Root Zone',
				dnskey: '. IN DNSKEY 257 3 8 AwEAAag/8pPvt1p1YKzY7mD5oCwrTDQeF3jhFV9h4n9JfCuPt1p1YKzY7mD5oCwrTDQeF3jhFV9h4n9JfCuPt1p1YKzY7mD5oCwrTDQeF3jhFV9h4n9JfCuP',
				owner: '.'
			},

			{
				title: 'Example.com KSK',
				dnskey: 'example.com. IN DNSKEY 257 3 13 kC1gJ+0qtVgdl0VAO/6t9vRaB15v4PclEV9h4n9JfCuPt1p1YKzY7mD5oCwrTDQeF3jhFV9h4n9JfCuP',
				owner: 'example.com.'
			},

			{
				title: 'Subdomain KSK',
				dnskey: 'secure.example.org. IN DNSKEY 257 3 8 AwEAAag/8pPvt1p1YKzY7mD5oCwrTDQeF3jhFV9h4n9JfCuPt1p1YKzY7mD5oCwrTDQeF3jhFV9h4n9JfCuPt1p1YKzY7mD5oCwrTDQeF3jhFV9h4n9JfCuP',
				owner: 'secure.example.org.'
			}
		];

		const digestTypeOptions = [
			{ value: 1, label: 'SHA-1', recommended: false },
			{ value: 2, label: 'SHA-256', recommended: true },
			{ value: 4, label: 'SHA-384', recommended: true }
		];

		let generatingDS = false;
		let dsRecords = [];
		let error = null;
		const clipboard = useClipboard();

		async function generateDS() {
			error = null;
			dsRecords = [];
			generatingDS = true;

			try {
				const validation = validateDNSKEY(dnskeyInput);

				if (!validation.valid) {
					error = validation.error || 'Invalid DNSKEY';

					return;
				}

				const dnskey = parseDNSKEYRecord(dnskeyInput);

				if (!dnskey) {
					error = 'Failed to parse DNSKEY record';

					return;
				}

				const normalizedOwner = ownerName.trim() || 'example.com.';
				const records = [];

				for (const digestType of selectedDigestTypes) {
					const ds = await generateDSRecord(dnskey, normalizedOwner, digestType);

					if (ds) {
						records.push(ds);
					}
				}

				dsRecords = records;
			} catch(err) {
				error = err instanceof Error ? err.message : 'Failed to generate DS records';
			} finally {
				generatingDS = false;
			}
		}

		const isValid = $.derived(() => () => {
			return dnskeyInput.trim() && ownerName.trim() && selectedDigestTypes.length > 0;
		});

		function loadExample(index) {
			const example = examples[index];

			dnskeyInput = example.dnskey;
			ownerName = example.owner;
			activeExampleIndex = index;
			generateDS();
		}

		function handleInput() {
			activeExampleIndex = -1;
			error = null;
			dsRecords = [];

			if (isValid()()) {
				generateDS();
			}
		}

		function toggleDigestType(type) {
			if (selectedDigestTypes.includes(type)) {
				selectedDigestTypes = selectedDigestTypes.filter((t) => t !== type);
			} else {
				selectedDigestTypes = [...selectedDigestTypes, type];
			}

			if (isValid()()) {
				generateDS();
			}
		}

		function copyDS(ds) {
			const formatted = formatDSRecord(ds, ownerName);
			const key = `ds-${ds.keyTag}-${ds.digestType}`;

			clipboard.copy(formatted, key);
		}

		function copyAllDS() {
			const formatted = dsRecords.map((ds) => formatDSRecord(ds, ownerName)).join('\n');

			clipboard.copy(formatted, 'all');
		}

		$$renderer.push(`<div class="card"><header class="card-header"><h1>DS Record Generator</h1> <p>Generate DS records (SHA-1/256/384) from a DNSKEY or public key, with copyable output for parent zone submission.</p></header> <div class="card examples-card svelte-t5ue2i"><details class="examples-details svelte-t5ue2i"><summary class="examples-summary svelte-t5ue2i">`);
		Icon($$renderer, { name: 'chevron-right', size: 'xs' });
		$$renderer.push(`<!----> <h4 class="svelte-t5ue2i">DNSKEY Examples</h4></summary> <div class="examples-grid svelte-t5ue2i"><!--[-->`);

		const each_array = $.ensure_array_like(examples);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let example = each_array[i];

			$$renderer.push(`<button${$.attr_class('example-card svelte-t5ue2i', void 0, { 'active': activeExampleIndex === i })}><div class="example-title svelte-t5ue2i">${$.escape(example.title)}</div> <div class="example-owner svelte-t5ue2i">Owner: <code>${$.escape(example.owner)}</code></div> <div class="example-dnskey svelte-t5ue2i"><code class="svelte-t5ue2i">${$.escape(example.dnskey)}</code></div></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div> <div class="card input-card svelte-t5ue2i"><div class="input-form-layout svelte-t5ue2i"><div class="inputs-section svelte-t5ue2i"><div class="input-group svelte-t5ue2i"><label for="owner-input" class="svelte-t5ue2i">`);
		Icon($$renderer, { name: 'globe', size: 'sm' });
		$$renderer.push(`<!----> Owner Name (FQDN)</label> <input id="owner-input" type="text"${$.attr('value', ownerName)} placeholder="example.com." class="svelte-t5ue2i"/></div> <div class="input-group svelte-t5ue2i"><label for="dnskey-input" class="svelte-t5ue2i">`);
		Icon($$renderer, { name: 'key', size: 'sm' });
		$$renderer.push(`<!----> DNSKEY Record</label> <textarea id="dnskey-input" placeholder="example.com. IN DNSKEY 257 3 8 AwEAAag/8pPvt1p1YKzY7mD5oCwr..." rows="3" class="svelte-t5ue2i">`);

		const $$body = $.escape(dnskeyInput);

		if ($$body) {
			$$renderer.push(`${$$body}`);
		} else {}

		$$renderer.push(`</textarea></div></div> <div class="digest-section svelte-t5ue2i"><div class="digest-header svelte-t5ue2i">`);
		Icon($$renderer, { name: 'hash', size: 'sm' });
		$$renderer.push(`<!----> <span>Digest Types</span></div> <div class="digest-options svelte-t5ue2i"><!--[-->`);

		const each_array_1 = $.ensure_array_like(digestTypeOptions);

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let option = each_array_1[$$index_1];

			$$renderer.push(`<label${$.attr_class('digest-option svelte-t5ue2i', void 0, { 'recommended': option.recommended })}><input type="checkbox"${$.attr('checked', selectedDigestTypes.includes(option.value), true)} class="svelte-t5ue2i"/> <span class="checkmark svelte-t5ue2i"></span> <div class="option-info svelte-t5ue2i"><span class="digest-name svelte-t5ue2i">${$.escape(option.label)}</span> `);

			if (option.recommended) {
				$$renderer.push(`<!--[0--><span class="recommended-badge svelte-t5ue2i">Recommended</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></label>`);
		}

		$$renderer.push(`<!--]--></div></div></div> <button${$.attr_class('generate-btn svelte-t5ue2i', void 0, { 'loading': generatingDS })}${$.attr('disabled', !isValid() || generatingDS, true)}>`);

		if (generatingDS) {
			$$renderer.push('<!--[0-->');
			Icon($$renderer, { name: 'loader', size: 'sm' });
			$$renderer.push(`<!----> <span>Generating DS Records...</span>`);
		} else {
			$$renderer.push('<!--[-1-->');
			Icon($$renderer, { name: 'shield', size: 'sm' });
			$$renderer.push(`<!----> <span>Generate DS Records</span>`);
		}

		$$renderer.push(`<!--]--></button></div> `);

		if (error) {
			$$renderer.push(`<!--[0--><div class="card error svelte-t5ue2i"><div class="card-header svelte-t5ue2i">`);
			Icon($$renderer, { name: 'alert-triangle' });
			$$renderer.push(`<!----> <h3 class="svelte-t5ue2i">Generation Error</h3></div> <p>${$.escape(error)}</p></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (dsRecords.length > 0) {
			$$renderer.push(`<!--[0--><div class="results"><div class="card success svelte-t5ue2i"><div class="card-header svelte-t5ue2i"><div class="header-content svelte-t5ue2i">`);
			Icon($$renderer, { name: 'shield' });
			$$renderer.push(`<!----> <h3 class="svelte-t5ue2i">Generated DS Records</h3></div> <button${$.attr_class('copy-btn svelte-t5ue2i', void 0, { 'copied': clipboard.isCopied('all') })} title="Copy all DS records">`);
			Icon($$renderer, { name: clipboard.isCopied('all') ? 'check' : 'copy' });
			$$renderer.push(`<!----> Copy All</button></div> <div class="ds-records svelte-t5ue2i"><!--[-->`);

			const each_array_2 = $.ensure_array_like(dsRecords);

			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let ds = each_array_2[$$index_2];

				$$renderer.push(`<div class="ds-record svelte-t5ue2i"><div class="ds-header svelte-t5ue2i"><div class="digest-info svelte-t5ue2i"><span class="digest-type svelte-t5ue2i">${$.escape(DS_DIGEST_TYPES[ds.digestType])}</span> <span class="key-tag svelte-t5ue2i">Key Tag: ${$.escape(ds.keyTag)}</span></div> <button${$.attr_class('copy-btn small svelte-t5ue2i', void 0, {
					'copied': clipboard.isCopied(`ds-${ds.keyTag}-${ds.digestType}`)
				})} title="Copy this DS record">`);

				Icon($$renderer, {
					name: clipboard.isCopied(`ds-${ds.keyTag}-${ds.digestType}`) ? 'check' : 'copy'
				});

				$$renderer.push(`<!----></button></div> <div class="ds-content svelte-t5ue2i"><code class="svelte-t5ue2i">${$.escape(formatDSRecord(ds, ownerName))}</code></div> <div class="ds-details svelte-t5ue2i"><div class="detail-item svelte-t5ue2i"><span class="label svelte-t5ue2i">Algorithm:</span> <span class="value svelte-t5ue2i">${$.escape(ds.algorithm)} (${$.escape(DNSSEC_ALGORITHMS[ds.algorithm] || 'Unknown')})</span></div> <div class="detail-item svelte-t5ue2i"><span class="label svelte-t5ue2i">Digest Type:</span> <span class="value svelte-t5ue2i">${$.escape(ds.digestType)} (${$.escape(DS_DIGEST_TYPES[ds.digestType])})</span></div> <div class="detail-item svelte-t5ue2i"><span class="label svelte-t5ue2i">Digest:</span> <span class="value digest svelte-t5ue2i">${$.escape(ds.digest)}</span></div></div></div>`);
			}

			$$renderer.push(`<!--]--></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="info-cards svelte-t5ue2i"><div class="card info svelte-t5ue2i"><div class="card-header svelte-t5ue2i"><h4 class="svelte-t5ue2i">DS Record Purpose</h4></div> <p class="svelte-t5ue2i">DS (Delegation Signer) records are published in the parent zone to establish a secure delegation to the child
        zone. They contain a hash of the child's KSK (Key Signing Key) and enable DNSSEC validators to verify the
        authenticity of the child zone's DNSKEY records.</p></div> <div class="card warning svelte-t5ue2i"><div class="card-header svelte-t5ue2i"><h4 class="svelte-t5ue2i">Digest Algorithm Recommendations</h4></div> <p class="svelte-t5ue2i"><strong>SHA-256 and SHA-384</strong> are recommended for new deployments. <strong>SHA-1</strong> is deprecated but
        may still be required for compatibility with older systems. Most registrars accept multiple DS records with different
        digest types for redundancy.</p></div> <div class="card info svelte-t5ue2i"><div class="card-header svelte-t5ue2i"><h4 class="svelte-t5ue2i">Parent Zone Submission</h4></div> <p class="svelte-t5ue2i">Submit the generated DS records to your parent zone operator (registrar for TLDs, hosting provider for
        subdomains). The DS records must be published in the parent zone before enabling DNSSEC signing in the child
        zone to maintain the chain of trust.</p></div></div></div>`);
	});
}