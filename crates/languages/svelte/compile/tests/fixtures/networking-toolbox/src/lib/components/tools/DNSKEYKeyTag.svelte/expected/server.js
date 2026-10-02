import * as $ from 'svelte/internal/server';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';

import {
	parseDNSKEYRecord,
	calculateKeyTag,
	validateDNSKEY,
	DNSSEC_ALGORITHMS
} from '$lib/utils/dnssec';

import { useClipboard } from '$lib/composables';

export default function DNSKEYKeyTag($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let dnskeyInput = 'example.org. 3600 IN DNSKEY 257 3 8 AwEAAag';
		let activeExampleIndex = null;
		let isActiveExample = true;
		const clipboard = useClipboard();

		const examples = [
			{
				title: 'KSK Example (Algorithm 8 - RSASHA256)',
				dnskey: 'example.org. 3600 IN DNSKEY 257 3 8 AwEAAag/8pPvt1p1YKzY7mD5oCwrTDQeF3jhFV9h4n9JfCuPt1p1YKzY7mD5oCwrTDQeF3jhFV9h4n9JfCuPt1p1YKzY7mD5oCwrTDQeF3jhFV9h4n9JfCuP',
				description: 'Key Signing Key with SEP flag set'
			},

			{
				title: 'ZSK Example (Algorithm 13 - ECDSAP256SHA256)',
				dnskey: 'example.org. 3600 IN DNSKEY 256 3 13 kC1gJ+0qtVgdl0VAO/6t9vRaB15v4PclEV9h4n9JfCuPt1p1YKzY7mD5oCwrTDQeF3jhFV9h4n9JfCuP',
				description: 'Zone Signing Key for data signing'
			},

			{
				title: 'RDATA Only Format',
				dnskey: '257 3 8 AwEAAag/8pPvt1p1YKzY7mD5oCwrTDQeF3jhFV9h4n9JfCuPt1p1YKzY7mD5oCwrTDQeF3jhFV9h4n9JfCuPt1p1YKzY7mD5oCwrTDQeF3jhFV9h4n9JfCuP',
				description: 'DNSKEY record data without owner name'
			}
		];

		const result = $.derived(() => {
			if (!dnskeyInput.trim()) return null;

			const validation = validateDNSKEY(dnskeyInput);

			if (!validation.valid) {
				return { error: validation.error };
			}

			const dnskey = parseDNSKEYRecord(dnskeyInput);

			if (!dnskey) {
				return { error: 'Failed to parse DNSKEY record' };
			}

			const keyTag = calculateKeyTag(dnskey);

			return { dnskey: { ...dnskey, keyTag }, keyTag };
		});

		function loadExample(index) {
			dnskeyInput = examples[index].dnskey;
			activeExampleIndex = index;
			isActiveExample = false;
		}

		function handleInputChange() {
			if (isActiveExample && dnskeyInput !== 'example.org. 3600 IN DNSKEY 257 3 8 AwEAAcvvJUWJNrPOTMmNhZmJLk85n4Pz+KqvfxJ1X0O+fJ4GJNdqsNvP1mQJJv8A4dNn...') {
				isActiveExample = false;
			}

			activeExampleIndex = null;
		}

		$$renderer.push(`<div class="card"><header class="card-header"><h1>DNSKEY Key Tag Calculator</h1> <p>Compute the DNSKEY key tag from a DNSKEY RR (RFC 4034 algorithm) and display it alongside key metadata for DNSSEC
      validation purposes.</p></header> <div class="card examples-card svelte-fm58b9"><details class="examples-details svelte-fm58b9"><summary class="examples-summary svelte-fm58b9">`);

		Icon($$renderer, { name: 'chevron-right', size: 'xs' });
		$$renderer.push(`<!----> <h4 class="svelte-fm58b9">DNSKEY Examples</h4></summary> <div class="examples-grid svelte-fm58b9"><!--[-->`);

		const each_array = $.ensure_array_like(examples);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let example = each_array[index];

			$$renderer.push(`<button${$.attr_class(`example-card ${activeExampleIndex === index ? 'active' : ''}`, 'svelte-fm58b9')}><div class="example-title svelte-fm58b9">${$.escape(example.title)}</div> <div class="example-dnskey svelte-fm58b9">${$.escape(example.dnskey)}</div> <div class="example-description svelte-fm58b9">${$.escape(example.description)}</div></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div> <div class="card input-card svelte-fm58b9"><div class="form-group svelte-fm58b9"><label for="dnskey-input" class="svelte-fm58b9">`);
		Icon($$renderer, { name: 'key', size: 'sm' });
		$$renderer.push(`<!----> DNSKEY Record</label> <textarea id="dnskey-input" placeholder="example.org. 3600 IN DNSKEY 257 3 8 AwEAAc..." rows="4"${$.attr_class(`dnskey-input ${isActiveExample ? 'example-active' : ''}`, 'svelte-fm58b9')}>`);

		const $$body = $.escape(dnskeyInput);

		if ($$body) {
			$$renderer.push(`${$$body}`);
		} else {}

		$$renderer.push(`</textarea> `);

		if (isActiveExample) {
			$$renderer.push(`<!--[0--><p class="field-help svelte-fm58b9">Using example data - modify to see your results</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div> `);

		if (result()) {
			$$renderer.push('<!--[0-->');

			if (result().error) {
				$$renderer.push(`<!--[0--><div class="card error-card svelte-fm58b9"><div class="error-content svelte-fm58b9">`);
				Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
				$$renderer.push(`<!----> <div><strong class="svelte-fm58b9">Validation Error:</strong> ${$.escape(result().error)}</div></div></div>`);
			} else if (result().dnskey) {
				$$renderer.push(`<!--[1--><div class="card results-card svelte-fm58b9"><div class="results-header svelte-fm58b9"><h3 class="svelte-fm58b9">Key Tag Calculation</h3> <button${$.attr_class(`copy-button ${clipboard.isCopied() ? 'copied' : ''}`, 'svelte-fm58b9')}>`);
				Icon($$renderer, { name: clipboard.isCopied() ? 'check' : 'copy', size: 'sm' });
				$$renderer.push(`<!----> Copy Key Tag</button></div> <div class="key-tag-display svelte-fm58b9"><div class="key-tag-label svelte-fm58b9">Key Tag</div> <div class="key-tag-value svelte-fm58b9">${$.escape(result().keyTag)}</div></div> <div class="metadata-section svelte-fm58b9"><h4 class="svelte-fm58b9">DNSKEY Metadata</h4> <div class="metadata-grid svelte-fm58b9"><div class="metadata-item svelte-fm58b9"><span class="metadata-label svelte-fm58b9">Key Type</span> <span${$.attr_class(`metadata-value key-type-${$.stringify(result().dnskey.keyType?.toLowerCase())}`, 'svelte-fm58b9')}>${$.escape(result().dnskey.keyType || 'Unknown')}</span></div> <div class="metadata-item svelte-fm58b9"><span class="metadata-label svelte-fm58b9">Flags</span> <span class="metadata-value mono svelte-fm58b9">${$.escape(result().dnskey.flags)}</span></div> <div class="metadata-item svelte-fm58b9"><span class="metadata-label svelte-fm58b9">Protocol</span> <span class="metadata-value mono svelte-fm58b9">${$.escape(result().dnskey.protocol)}</span></div> <div class="metadata-item svelte-fm58b9"><span class="metadata-label svelte-fm58b9">Algorithm</span> <span class="metadata-value mono svelte-fm58b9">${$.escape(result().dnskey.algorithm)} (${$.escape(DNSSEC_ALGORITHMS[result().dnskey.algorithm] || 'Unknown')})</span></div></div> <div class="public-key-section svelte-fm58b9"><h5 class="svelte-fm58b9">Public Key (Base64)</h5> <div class="public-key svelte-fm58b9">${$.escape(result().dnskey.publicKey)}</div></div></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="education-card svelte-fm58b9"><div class="education-grid svelte-fm58b9"><div class="education-item info-panel svelte-fm58b9"><h4 class="svelte-fm58b9">Key Tag Purpose</h4> <p class="svelte-fm58b9">The key tag is a short identifier used to quickly identify which DNSKEY was used to generate a signature. It's
          calculated using a checksum algorithm defined in RFC 4034 and helps optimize DNSSEC validation by avoiding the
          need to test every key.</p></div> <div class="education-item info-panel svelte-fm58b9"><h4 class="svelte-fm58b9">Key Types</h4> <p class="svelte-fm58b9"><strong>KSK (Key Signing Key):</strong> Used to sign other keys (ZSKs). Has the SEP flag set (bit 15). <strong>ZSK (Zone Signing Key):</strong> Used to sign zone data. Does not have the SEP flag set.</p></div> <div class="education-item info-panel svelte-fm58b9"><h4 class="svelte-fm58b9">Algorithm Support</h4> <p class="svelte-fm58b9">Supports all modern DNSSEC algorithms including RSASHA256 (8), RSASHA512 (10), ECDSA P-256 (13), ECDSA P-384
          (14), and Ed25519 (15). Legacy algorithms like RSAMD5 are deprecated and should not be used.</p></div> <div class="education-item info-panel svelte-fm58b9"><h4 class="svelte-fm58b9">Validation Process</h4> <p class="svelte-fm58b9">The tool validates DNSKEY format, checks protocol compliance (must be 3), verifies algorithm support, and
          ensures proper base64 encoding of the public key before calculating the key tag.</p></div></div></div></div>`);
	});
}