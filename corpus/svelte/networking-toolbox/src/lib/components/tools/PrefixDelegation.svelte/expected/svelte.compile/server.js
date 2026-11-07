import * as $ from 'svelte/internal/server';

import {
	buildPrefixDelegation,
	validatePrefixDelegationConfig,
	PREFIX_DELEGATION_EXAMPLES,
	formatTime
} from '$lib/utils/dhcpv6-prefix-delegation';

import { untrack } from 'svelte';
import ToolContentContainer from '$lib/components/global/ToolContentContainer.svelte';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import { useClipboard } from '$lib/composables/useClipboard.svelte';

export default function PrefixDelegation($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const clipboard = useClipboard();

		// State
		let iaid = 1;

		let t1 = 302400;
		let t2 = 483840;

		let prefixes = [
			{
				prefix: '2001:db8::/56',
				preferredLifetime: 604800,
				validLifetime: 2592000
			}
		];

		let result = null;
		let errors = [];

		function loadExample(example) {
			iaid = example.config.iaid;
			t1 = example.config.t1;
			t2 = example.config.t2;
			prefixes = example.config.prefixes.map((p) => ({ ...p }));
		}

		function addPrefix() {
			prefixes = [
				...prefixes,
				{
					prefix: '2001:db8::/56',
					preferredLifetime: 604800,
					validLifetime: 2592000
				}
			];
		}

		function removePrefix(index) {
			prefixes = prefixes.filter((_, i) => i !== index);

			if (prefixes.length === 0) {
				addPrefix();
			}
		}

		ToolContentContainer($$renderer, {
			title: 'DHCPv6 Prefix Delegation (IA_PD)',
			description: 'Build DHCPv6 IA_PD options for delegating IPv6 prefixes to requesting routers. Configure Identity Association for Prefix Delegation (Option 25) with IA Prefix options (Option 26) per RFC 8415.',
			children: ($$renderer) => {
				ExamplesCard($$renderer, {
					examples: PREFIX_DELEGATION_EXAMPLES,
					onSelect: (ex) => loadExample(ex),
					getLabel: (ex) => ex.label,
					getDescription: (ex) => ex.description
				});

				$$renderer.push(`<!----> <div class="card input-card svelte-xkyzkm"><h3 class="svelte-xkyzkm">Prefix Delegation Configuration</h3> <div class="form-row svelte-xkyzkm"><div class="form-group svelte-xkyzkm"><label for="iaid" class="svelte-xkyzkm">IAID (Identity Association ID)</label> <input id="iaid" type="number"${$.attr('value', iaid)} min="0" max="4294967295" class="input svelte-xkyzkm"/> <span class="hint svelte-xkyzkm">Unique identifier for this IA_PD (0-4294967295)</span></div> <div class="form-group svelte-xkyzkm"><label for="t1" class="svelte-xkyzkm">T1 Renewal Time (seconds)</label> <input id="t1" type="number"${$.attr('value', t1)} min="0" max="4294967295" placeholder="Optional" class="input svelte-xkyzkm"/> `);

				if (t1) {
					$$renderer.push(`<!--[0--><span class="hint svelte-xkyzkm">= ${$.escape(formatTime(t1))}</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div> <div class="form-group svelte-xkyzkm"><label for="t2" class="svelte-xkyzkm">T2 Rebinding Time (seconds)</label> <input id="t2" type="number"${$.attr('value', t2)} min="0" max="4294967295" placeholder="Optional" class="input svelte-xkyzkm"/> `);

				if (t2) {
					$$renderer.push(`<!--[0--><span class="hint svelte-xkyzkm">= ${$.escape(formatTime(t2))}</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div></div> <div class="form-group svelte-xkyzkm"><label for="prefix-0" class="svelte-xkyzkm">Delegated Prefixes</label> <!--[-->`);

				const each_array = $.ensure_array_like(prefixes);

				for (let i = 0, $$length = each_array.length; i < $$length; i++) {
					let prefix = each_array[i];

					$$renderer.push(`<div class="prefix-row svelte-xkyzkm"><div class="prefix-inputs svelte-xkyzkm"><input${$.attr('id', i === 0 ? 'prefix-0' : undefined)} type="text"${$.attr('value', prefix.prefix)} placeholder="e.g., 2001:db8::/56" class="input svelte-xkyzkm"${$.attr('aria-label', i > 0 ? `Prefix ${i + 1}` : undefined)}/> <input type="number"${$.attr('value', prefix.preferredLifetime)} min="0" max="4294967295" placeholder="Preferred (s)" class="input input-sm svelte-xkyzkm" aria-label="Preferred lifetime"/> <input type="number"${$.attr('value', prefix.validLifetime)} min="0" max="4294967295" placeholder="Valid (s)" class="input input-sm svelte-xkyzkm" aria-label="Valid lifetime"/></div> `);

					if (prefixes.length > 1) {
						$$renderer.push(`<!--[0--><button class="btn btn-danger btn-sm svelte-xkyzkm">Remove</button>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div>`);
				}

				$$renderer.push(`<!--]--> <button class="btn btn-secondary btn-sm svelte-xkyzkm">Add Prefix</button></div> `);

				if (errors.length > 0) {
					$$renderer.push(`<!--[0--><div class="error-card svelte-xkyzkm"><strong class="svelte-xkyzkm">Validation Errors:</strong> <ul class="svelte-xkyzkm"><!--[-->`);

					const each_array_1 = $.ensure_array_like(errors);

					for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
						let error = each_array_1[i];

						$$renderer.push(`<li>${$.escape(error)}</li>`);
					}

					$$renderer.push(`<!--]--></ul></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div> `);

				if (result) {
					$$renderer.push(`<!--[0--><div class="card result-card svelte-xkyzkm"><h3 class="svelte-xkyzkm">Option 25 - IA_PD</h3> <div class="result-grid svelte-xkyzkm"><div class="result-item svelte-xkyzkm"><span class="label svelte-xkyzkm">IAID:</span> <code class="code-value svelte-xkyzkm">${$.escape(result.iaid)} (0x${$.escape(result.iaidHex)})</code></div> <div class="result-item svelte-xkyzkm"><span class="label svelte-xkyzkm">T1 Renewal:</span> <span class="value svelte-xkyzkm">${$.escape(result.t1Formatted)} (${$.escape(result.t1)}s)</span></div> <div class="result-item svelte-xkyzkm"><span class="label svelte-xkyzkm">T2 Rebinding:</span> <span class="value svelte-xkyzkm">${$.escape(result.t2Formatted)} (${$.escape(result.t2)}s)</span></div> <div class="result-item svelte-xkyzkm"><span class="label svelte-xkyzkm">Full Hex:</span> <code class="code-value svelte-xkyzkm">${$.escape(result.fullHex)}</code> <button${$.attr_class('btn-copy svelte-xkyzkm', void 0, { 'copied': clipboard.isCopied('full-hex') })} aria-label="Copy hex">${$.escape(clipboard.isCopied('full-hex') ? 'Copied' : 'Copy')}</button></div> <div class="result-item svelte-xkyzkm"><span class="label svelte-xkyzkm">Wire Format:</span> <code class="code-value svelte-xkyzkm">${$.escape(result.fullWireFormat)}</code> <button${$.attr_class('btn-copy svelte-xkyzkm', void 0, { 'copied': clipboard.isCopied('full-wire') })} aria-label="Copy wire format">${$.escape(clipboard.isCopied('full-wire') ? 'Copied' : 'Copy')}</button></div> <div class="result-item svelte-xkyzkm"><span class="label svelte-xkyzkm">Total Length:</span> <span class="value svelte-xkyzkm">${$.escape(result.totalLength)} bytes</span></div></div> <div class="prefixes-section svelte-xkyzkm"><h4 class="svelte-xkyzkm">Delegated Prefixes (Option 26)</h4> <!--[-->`);

					const each_array_2 = $.ensure_array_like(result.prefixes);

					for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
						let prefix = each_array_2[i];

						$$renderer.push(`<div class="prefix-card svelte-xkyzkm"><div class="prefix-header svelte-xkyzkm"><span class="prefix-number svelte-xkyzkm">${$.escape(i + 1)}</span> <code class="prefix-value svelte-xkyzkm">${$.escape(prefix.prefix)}</code></div> <div class="prefix-details svelte-xkyzkm"><div class="detail-item svelte-xkyzkm"><span class="detail-label svelte-xkyzkm">Preferred Lifetime:</span> <span>${$.escape(prefix.preferredLifetimeFormatted)} (${$.escape(prefix.preferredLifetime)}s)</span></div> <div class="detail-item svelte-xkyzkm"><span class="detail-label svelte-xkyzkm">Valid Lifetime:</span> <span>${$.escape(prefix.validLifetimeFormatted)} (${$.escape(prefix.validLifetime)}s)</span></div> <div class="detail-item svelte-xkyzkm"><span class="detail-label svelte-xkyzkm">Wire Format:</span> <code class="code-small svelte-xkyzkm">${$.escape(prefix.wireFormat)}</code> <button${$.attr_class('btn-copy btn-copy-sm svelte-xkyzkm', void 0, { 'copied': clipboard.isCopied(`prefix-wire-${i}`) })} aria-label="Copy prefix wire format">${$.escape(clipboard.isCopied(`prefix-wire-${i}`) ? 'Copied' : 'Copy')}</button></div></div></div>`);
					}

					$$renderer.push(`<!--]--></div> <div class="config-section svelte-xkyzkm"><h4 class="svelte-xkyzkm">Configuration Example</h4> <div class="output-group svelte-xkyzkm"><div class="output-header svelte-xkyzkm"><h5 class="svelte-xkyzkm">Kea DHCPv6</h5> <button${$.attr_class('btn-copy svelte-xkyzkm', void 0, { 'copied': clipboard.isCopied('kea-config') })}>${$.escape(clipboard.isCopied('kea-config') ? 'Copied' : 'Copy')}</button></div> <pre class="code-block svelte-xkyzkm"><code class="svelte-xkyzkm">${$.escape(result.examples.keaDhcp6)}</code></pre></div></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});
	});
}