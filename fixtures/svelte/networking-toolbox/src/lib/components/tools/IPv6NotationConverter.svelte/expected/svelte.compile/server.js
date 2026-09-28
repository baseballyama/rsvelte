import * as $ from 'svelte/internal/server';
import { expandIPv6, compressIPv6, validateIPv6Address } from '$lib/utils/ipv6-subnet-calculations.js';
import Tooltip from '$lib/components/global/Tooltip.svelte';
import Icon from '$lib/components/global/Icon.svelte';
import { useClipboard } from '$lib/composables';

export default function IPv6NotationConverter($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { mode } = $$props;
		let inputAddress = '2001:db8::1';
		let outputAddress = '';
		let conversionError = '';
		const clipboard = useClipboard();
		let selectedExampleIndex = null;

		/* Common IPv6 example addresses for testing */
		const exampleAddresses = [
			{
				label: 'Documentation Prefix',
				compressed: '2001:db8::',
				expanded: '2001:0db8:0000:0000:0000:0000:0000:0000'
			},

			{
				label: 'Loopback Address',
				compressed: '::1',
				expanded: '0000:0000:0000:0000:0000:0000:0000:0001'
			},

			{
				label: 'Link-Local Address',
				compressed: 'fe80::1',
				expanded: 'fe80:0000:0000:0000:0000:0000:0000:0001'
			},

			{
				label: 'Global Unicast',
				compressed: '2001:db8:85a3::8a2e:370:7334',
				expanded: '2001:0db8:85a3:0000:0000:8a2e:0370:7334'
			},

			{
				label: 'IPv4-mapped IPv6',
				compressed: '::ffff:192.0.2.1',
				expanded: '0000:0000:0000:0000:0000:ffff:c000:0201'
			},

			{
				label: 'Multicast Address',
				compressed: 'ff02::1',
				expanded: 'ff02:0000:0000:0000:0000:0000:0000:0001'
			}
		];

		/* Set example address */
		function setExample(address, index) {
			inputAddress = address;
			selectedExampleIndex = index;
			performConversion();
		}

		/* Clear example selection when input changes */
		function clearExampleSelection() {
			selectedExampleIndex = null;
		}

		/* Handle input change */
		function handleInput() {
			clearExampleSelection();
			performConversion();
		}

		/* Perform the conversion based on mode */
		function performConversion() {
			conversionError = '';
			outputAddress = '';

			if (!inputAddress.trim()) {
				conversionError = 'Please enter an IPv6 address';

				return;
			}

			const validation = validateIPv6Address(inputAddress);

			if (!validation.valid) {
				conversionError = validation.error || 'Invalid IPv6 address format';

				return;
			}

			try {
				if (mode === 'expand') {
					outputAddress = expandIPv6(inputAddress);
				} else {
					outputAddress = compressIPv6(inputAddress);
				}
			} catch(error) {
				conversionError = error instanceof Error ? error.message : 'Conversion failed';
			}
		}

		/* Clear input and output */
		function clearAll() {
			inputAddress = '';
			outputAddress = '';
			conversionError = '';
		}

		$$renderer.push(`<div class="converter-section svelte-o87kl5"><h3 class="svelte-o87kl5">Input IPv6 Address</h3> <div class="input-group svelte-o87kl5"><div class="form-group svelte-o87kl5"><label for="ipv6-input" class="svelte-o87kl5">IPv6 Address `);

		Tooltip($$renderer, {
			text: // Reactive conversion
			mode === 'expand'
				? 'Enter compressed IPv6 address to expand'
				: 'Enter expanded IPv6 address to compress',

			children: ($$renderer) => {
				Icon($$renderer, { name: 'help', size: 'sm' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></label> <div class="input-wrapper svelte-o87kl5"><input id="ipv6-input" type="text"${$.attr('value', inputAddress)}${$.attr('placeholder', mode === 'expand'
			? '2001:db8::1'
			: '2001:0db8:0000:0000:0000:0000:0000:0001')} class="ipv6-input svelte-o87kl5"/> <button type="button" class="btn btn-secondary btn-md svelte-o87kl5">`);

		Icon($$renderer, { name: 'trash', size: 'md' });
		$$renderer.push(`<!----></button></div> `);

		if (conversionError) {
			$$renderer.push(`<!--[0--><p class="error-message svelte-o87kl5">${$.escape(conversionError)}</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div></div> <div class="examples-section svelte-o87kl5"><details class="examples-details svelte-o87kl5"><summary class="examples-summary svelte-o87kl5">`);
		Icon($$renderer, { name: 'chevron-right', size: 'xs' });
		$$renderer.push(`<!----> <h3 class="svelte-o87kl5">Common Examples</h3></summary> <div class="examples-grid svelte-o87kl5"><!--[-->`);

		const each_array = $.ensure_array_like(exampleAddresses);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let example = each_array[index];

			$$renderer.push(`<button type="button"${$.attr_class('example-btn svelte-o87kl5', void 0, { 'selected': selectedExampleIndex === index })}><div class="example-label svelte-o87kl5">${$.escape(example.label)}</div> <code class="example-address svelte-o87kl5">${$.escape(mode === 'expand' ? example.compressed : example.expanded)}</code></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div> `);

		if (outputAddress && !conversionError) {
			$$renderer.push(`<!--[0--><div class="output-section svelte-o87kl5"><h3 class="svelte-o87kl5">Converted Address</h3> <div class="conversion-result svelte-o87kl5"><div class="result-card success svelte-o87kl5"><div class="result-header svelte-o87kl5"><h4 class="svelte-o87kl5">`);

			Icon($$renderer, {
				name: mode === 'expand' ? 'maximize' : 'minimize',
				size: 'sm'
			});

			$$renderer.push(`<!----> ${$.escape(mode === 'expand' ? 'Expanded Format' : 'Compressed Format')}</h4></div> <div class="result-content svelte-o87kl5"><div class="address-display svelte-o87kl5"><div class="address-wrapper svelte-o87kl5"><code class="converted-address svelte-o87kl5">${$.escape(outputAddress)}</code> <button type="button"${$.attr_class('btn btn-icon copy-btn svelte-o87kl5', void 0, { 'copied': clipboard.isCopied('output') })}>`);

			Icon($$renderer, {
				name: clipboard.isCopied('output') ? 'check' : 'copy',
				size: 'sm'
			});

			$$renderer.push(`<!----></button></div></div> <div class="comparison-view svelte-o87kl5"><div class="comparison-item svelte-o87kl5"><span class="comparison-label svelte-o87kl5">Input (${$.escape(mode === 'expand' ? 'Compressed' : 'Expanded')}):</span> <code class="comparison-address input svelte-o87kl5">${$.escape(inputAddress)}</code></div> <div class="comparison-item svelte-o87kl5"><span class="comparison-label svelte-o87kl5">Output (${$.escape(mode === 'expand' ? 'Expanded' : 'Compressed')}):</span> <code class="comparison-address output svelte-o87kl5">${$.escape(outputAddress)}</code></div></div> <div class="stats-grid svelte-o87kl5"><div class="stat-item svelte-o87kl5"><span class="stat-label svelte-o87kl5">Input Length</span> <span class="stat-value svelte-o87kl5">${$.escape(inputAddress.length)} characters</span></div> <div class="stat-item svelte-o87kl5"><span class="stat-label svelte-o87kl5">Output Length</span> <span class="stat-value svelte-o87kl5">${$.escape(outputAddress.length)} characters</span></div> <div class="stat-item svelte-o87kl5"><span class="stat-label svelte-o87kl5">Difference</span> <span${$.attr_class(`stat-value ${outputAddress.length > inputAddress.length ? 'expanded' : 'compressed'}`, 'svelte-o87kl5')}>${$.escape(outputAddress.length > inputAddress.length ? '+' : '')}${$.escape(outputAddress.length - inputAddress.length)} characters</span></div></div></div></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}