import * as $ from 'svelte/internal/server';

import {
	buildLeaseTimeOption,
	decodeLeaseTimeOption,
	validateLeaseTimeConfig,
	formatTime,
	LEASE_TIME_PRESETS
} from '$lib/utils/dhcp-option51-lease-time';

import { untrack } from 'svelte';
import ToolContentContainer from '$lib/components/global/ToolContentContainer.svelte';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import { useClipboard } from '$lib/composables/useClipboard.svelte';

export default function LeaseTimeOption51($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const clipboard = useClipboard();
		let activeTab = 'build';

		// Build mode state
		let leaseSeconds = 86400;

		let infinite = false;
		let buildResult = null;
		let buildErrors = [];

		// Decode mode state
		let hexInput = '';

		let decodeResult = null;
		let decodeError = '';

		const navOptions = [
			{ value: 'build', label: 'Build Option' },
			{ value: 'decode', label: 'Decode Option' }
		];

		const examples = LEASE_TIME_PRESETS.map((preset) => ({
			...preset,
			description: `${preset.description} • ${preset.infinite ? 'Infinite' : formatTime(preset.seconds)}`
		}));

		const decodeExamples = [
			{
				label: '1 Hour',
				hexValue: '00000e10',
				description: '3,600 seconds (0x00000e10)'
			},

			{
				label: '24 Hours',
				hexValue: '00015180',
				description: '86,400 seconds (0x00015180)'
			},

			{
				label: '7 Days',
				hexValue: '00093a80',
				description: '604,800 seconds (0x00093a80)'
			},

			{
				label: 'Infinite',
				hexValue: 'ffffffff',
				description: 'Infinite lease (0xffffffff)'
			}
		];

		function loadPreset(preset) {
			activeTab = 'build';

			if (preset.infinite) {
				infinite = true;
				leaseSeconds = 0;
			} else {
				infinite = false;
				leaseSeconds = preset.seconds;
			}
		}

		function loadDecodeExample(example) {
			activeTab = 'decode';
			hexInput = example.hexValue;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			ToolContentContainer($$renderer, {
				title: 'DHCP Option 51 - IP Address Lease Time',
				description: 'Option 51 specifies the lease time in seconds for the IP address assignment. T1 (renewal at 50%) and T2 (rebinding at 87.5%) timers are automatically calculated.',
				navOptions,
				get selectedNav() {
					return activeTab;
				},

				set selectedNav($$value) {
					activeTab = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					if (activeTab === 'build') {
						$$renderer.push('<!--[0-->');

						ExamplesCard($$renderer, {
							examples,
							onSelect: loadPreset,
							getLabel: (ex) => ex.label,
							getDescription: (ex) => ex.description
						});

						$$renderer.push(`<!----> <div class="card input-card svelte-bhzrvk"><h3 class="svelte-bhzrvk">Lease Time Configuration</h3> <div class="form-group svelte-bhzrvk"><label class="checkbox-label svelte-bhzrvk"><input type="checkbox"${$.attr('checked', infinite, true)} class="svelte-bhzrvk"/> Infinite Lease (0xFFFFFFFF)</label> <span class="hint svelte-bhzrvk">Permanent IP address assignment (may not be supported by all servers)</span></div> `);

						if (!infinite) {
							$$renderer.push(`<!--[0--><div class="form-group svelte-bhzrvk"><label for="lease-seconds" class="svelte-bhzrvk">Lease Time (seconds)</label> <input id="lease-seconds" type="number"${$.attr('value', leaseSeconds)} min="0" max="4294967294" class="input svelte-bhzrvk"/> `);

							if (leaseSeconds > 0) {
								$$renderer.push(`<!--[0--><span class="hint svelte-bhzrvk">= ${$.escape(formatTime(leaseSeconds))}</span>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div> <div class="quick-values svelte-bhzrvk"><span class="label svelte-bhzrvk">Quick Values:</span> <button class="btn-quick svelte-bhzrvk">1h</button> <button class="btn-quick svelte-bhzrvk">4h</button> <button class="btn-quick svelte-bhzrvk">24h</button> <button class="btn-quick svelte-bhzrvk">3d</button> <button class="btn-quick svelte-bhzrvk">7d</button></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (buildErrors.length > 0) {
							$$renderer.push(`<!--[0--><div${$.attr_class('error-card svelte-bhzrvk', void 0, {
								'warning': buildErrors.every((e) => e.startsWith('Warning:'))
							})}><strong class="svelte-bhzrvk">${$.escape(buildErrors.some((e) => e.startsWith('Warning:')) ? 'Warnings:' : 'Validation Errors:')}</strong> <ul class="svelte-bhzrvk"><!--[-->`);

							const each_array = $.ensure_array_like(buildErrors);

							for (let i = 0, $$length = each_array.length; i < $$length; i++) {
								let error = each_array[i];

								$$renderer.push(`<li>${$.escape(error)}</li>`);
							}

							$$renderer.push(`<!--]--></ul></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div> `);

						if (buildResult) {
							$$renderer.push(`<!--[0--><div class="card result-card svelte-bhzrvk"><h3 class="svelte-bhzrvk">Option 51 - Lease Time</h3> <div class="result-grid svelte-bhzrvk"><div class="result-item svelte-bhzrvk"><span class="label svelte-bhzrvk">Lease Time:</span> <span class="value highlight svelte-bhzrvk">${$.escape(buildResult.humanReadable)}</span></div> <div class="result-item svelte-bhzrvk"><span class="label svelte-bhzrvk">Hex Encoded:</span> <code class="code-value svelte-bhzrvk">${$.escape(buildResult.hexEncoded)}</code> <button${$.attr_class('btn-copy svelte-bhzrvk', void 0, { 'copied': clipboard.isCopied('build-hex') })} aria-label="Copy hex">${$.escape(clipboard.isCopied('build-hex') ? 'Copied' : 'Copy')}</button></div> <div class="result-item svelte-bhzrvk"><span class="label svelte-bhzrvk">Wire Format:</span> <code class="code-value svelte-bhzrvk">${$.escape(buildResult.wireFormat)}</code> <button${$.attr_class('btn-copy svelte-bhzrvk', void 0, { 'copied': clipboard.isCopied('build-wire') })} aria-label="Copy wire format">${$.escape(clipboard.isCopied('build-wire') ? 'Copied' : 'Copy')}</button></div> <div class="result-item svelte-bhzrvk"><span class="label svelte-bhzrvk">Total Length:</span> <span class="value svelte-bhzrvk">${$.escape(buildResult.totalLength)} bytes</span></div> `);

							if (!buildResult.isInfinite) {
								$$renderer.push(`<!--[0--><div class="result-item svelte-bhzrvk"><span class="label svelte-bhzrvk">T1 Renewal:</span> <span class="value svelte-bhzrvk">${$.escape(buildResult.t1RenewalFormatted)} (50% of lease)</span></div> <div class="result-item svelte-bhzrvk"><span class="label svelte-bhzrvk">T2 Rebinding:</span> <span class="value svelte-bhzrvk">${$.escape(buildResult.t2RebindingFormatted)} (87.5% of lease)</span></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div> <div class="config-section svelte-bhzrvk"><h4 class="svelte-bhzrvk">Configuration Examples</h4> <div class="output-group svelte-bhzrvk"><div class="output-header svelte-bhzrvk"><h5 class="svelte-bhzrvk">ISC DHCPd</h5> <button${$.attr_class('btn-copy svelte-bhzrvk', void 0, { 'copied': clipboard.isCopied('build-isc') })}>${$.escape(clipboard.isCopied('build-isc') ? 'Copied' : 'Copy')}</button></div> <pre class="code-block svelte-bhzrvk"><code class="svelte-bhzrvk">${$.escape(buildResult.configExamples.iscDhcpd)}</code></pre></div> <div class="output-group svelte-bhzrvk"><div class="output-header svelte-bhzrvk"><h5 class="svelte-bhzrvk">Kea DHCPv4</h5> <button${$.attr_class('btn-copy svelte-bhzrvk', void 0, { 'copied': clipboard.isCopied('build-kea') })}>${$.escape(clipboard.isCopied('build-kea') ? 'Copied' : 'Copy')}</button></div> <pre class="code-block svelte-bhzrvk"><code class="svelte-bhzrvk">${$.escape(buildResult.configExamples.keaDhcp4)}</code></pre></div> <div class="output-group svelte-bhzrvk"><div class="output-header svelte-bhzrvk"><h5 class="svelte-bhzrvk">dnsmasq</h5> <button${$.attr_class('btn-copy svelte-bhzrvk', void 0, { 'copied': clipboard.isCopied('build-dnsmasq') })}>${$.escape(clipboard.isCopied('build-dnsmasq') ? 'Copied' : 'Copy')}</button></div> <pre class="code-block svelte-bhzrvk"><code class="svelte-bhzrvk">${$.escape(buildResult.configExamples.dnsmasq)}</code></pre></div></div></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					} else {
						$$renderer.push('<!--[-1-->');

						ExamplesCard($$renderer, {
							examples: decodeExamples,
							onSelect: loadDecodeExample,
							getLabel: (ex) => ex.label,
							getDescription: (ex) => ex.description
						});

						$$renderer.push(`<!----> <div class="card input-card svelte-bhzrvk"><h3 class="svelte-bhzrvk">Decode Option 51</h3> <div class="form-group svelte-bhzrvk"><label for="hex-input" class="svelte-bhzrvk">Hex String</label> <input id="hex-input" type="text"${$.attr('value', hexInput)} placeholder="e.g., 00015180 or 00 01 51 80" class="input svelte-bhzrvk"/> <span class="hint svelte-bhzrvk">Enter 8 hex characters (4 bytes, spaces optional)</span></div> `);

						if (decodeError) {
							$$renderer.push(`<!--[0--><div class="error-card svelte-bhzrvk"><strong class="svelte-bhzrvk">Decode Error:</strong> <p class="svelte-bhzrvk">${$.escape(decodeError)}</p></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div> `);

						if (decodeResult) {
							$$renderer.push(`<!--[0--><div class="card result-card svelte-bhzrvk"><h3 class="svelte-bhzrvk">Decoded Option 51</h3> <div class="result-grid svelte-bhzrvk"><div class="result-item svelte-bhzrvk"><span class="label svelte-bhzrvk">Lease Time:</span> <span class="value highlight svelte-bhzrvk">${$.escape(decodeResult.humanReadable)}</span></div> <div class="result-item svelte-bhzrvk"><span class="label svelte-bhzrvk">Seconds:</span> <span class="value svelte-bhzrvk">${$.escape(decodeResult.leaseSeconds.toLocaleString())}</span></div> `);

							if (decodeResult.isInfinite) {
								$$renderer.push(`<!--[0--><div class="result-item infinite-badge svelte-bhzrvk"><span class="badge svelte-bhzrvk">Infinite Lease</span></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

							if (!decodeResult.isInfinite) {
								$$renderer.push(`<!--[0--><div class="result-item svelte-bhzrvk"><span class="label svelte-bhzrvk">T1 Renewal:</span> <span class="value svelte-bhzrvk">${$.escape(decodeResult.t1RenewalFormatted)} (50% of lease)</span></div> <div class="result-item svelte-bhzrvk"><span class="label svelte-bhzrvk">T2 Rebinding:</span> <span class="value svelte-bhzrvk">${$.escape(decodeResult.t2RebindingFormatted)} (87.5% of lease)</span></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div> <div class="config-section svelte-bhzrvk"><h4 class="svelte-bhzrvk">Configuration Examples</h4> <div class="output-group svelte-bhzrvk"><div class="output-header svelte-bhzrvk"><h5 class="svelte-bhzrvk">ISC DHCPd</h5> <button${$.attr_class('btn-copy svelte-bhzrvk', void 0, { 'copied': clipboard.isCopied('decode-isc') })}>${$.escape(clipboard.isCopied('decode-isc') ? 'Copied' : 'Copy')}</button></div> <pre class="code-block svelte-bhzrvk"><code class="svelte-bhzrvk">${$.escape(decodeResult.configExamples.iscDhcpd)}</code></pre></div> <div class="output-group svelte-bhzrvk"><div class="output-header svelte-bhzrvk"><h5 class="svelte-bhzrvk">Kea DHCPv4</h5> <button${$.attr_class('btn-copy svelte-bhzrvk', void 0, { 'copied': clipboard.isCopied('decode-kea') })}>${$.escape(clipboard.isCopied('decode-kea') ? 'Copied' : 'Copy')}</button></div> <pre class="code-block svelte-bhzrvk"><code class="svelte-bhzrvk">${$.escape(decodeResult.configExamples.keaDhcp4)}</code></pre></div> <div class="output-group svelte-bhzrvk"><div class="output-header svelte-bhzrvk"><h5 class="svelte-bhzrvk">dnsmasq</h5> <button${$.attr_class('btn-copy svelte-bhzrvk', void 0, { 'copied': clipboard.isCopied('decode-dnsmasq') })}>${$.escape(clipboard.isCopied('decode-dnsmasq') ? 'Copied' : 'Copy')}</button></div> <pre class="code-block svelte-bhzrvk"><code class="svelte-bhzrvk">${$.escape(decodeResult.configExamples.dnsmasq)}</code></pre></div></div></div>`);
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