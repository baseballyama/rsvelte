import * as $ from 'svelte/internal/server';
import Icon from '$lib/components/global/Icon.svelte';
import { useClipboard } from '$lib/composables';
import { formatNumber } from '$lib/utils/formatters';

export default function IPEnumerate($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// import { tooltip } from '$lib/actions/tooltip.js';
		let input = '192.168.1.0/28';

		let maxDisplayLimit = 1000;
		let includeNetwork = true;
		let includeBroadcast = true;
		let result = null;
		let isGenerating = false;
		const clipboard = useClipboard();
		let selectedExample = null;
		let _userModified = false;

		// Safety limits to prevent browser crashes
		const ABSOLUTE_MAX_DISPLAY = 10000;

		const ABSOLUTE_MAX_GENERATION = 100000;

		const examples = [
			{
				label: 'Small Subnet /28',
				input: '192.168.1.0/28',
				description: '16 addresses'
			},

			{
				label: 'Point-to-Point /30',
				input: '10.0.0.0/30',
				description: '4 addresses'
			},

			{
				label: 'IP Range',
				input: '172.16.1.1-172.16.1.10',
				description: '10 addresses'
			},

			{
				label: 'Medium /24 network',
				input: '192.168.0.0/24',
				description: '256 addresses'
			},

			{
				label: 'IPv6 /126',
				input: '2001:db8::/126',
				description: '4 addresses'
			}
		];

		function loadExample(example) {
			input = example.input;
			selectedExample = example.label;
			_userModified = false;
			enumerateIPs();
		}

		function parseIP(ip) {
			return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
		}

		function ipToString(ip) {
			return [
				ip >>> 24 & 0xff,
				ip >>> 16 & 0xff,
				ip >>> 8 & 0xff,
				ip & 0xff
			].join('.');
		}

		function parseIPv6(ip) {
			// Simplified IPv6 parsing for basic cases
			const parts = ip.split(':');

			let result = 0n;

			for (let i = 0; i < 8; i++) {
				if (i < parts.length && parts[i]) {
					const hexValue = parseInt(parts[i], 16);

					result = (result << 16n) + BigInt(hexValue);
				} else {
					result = result << 16n;
				}
			}

			return result;
		}

		function ipv6ToString(ip) {
			const parts = [];

			for (let i = 0; i < 8; i++) {
				const part = ip >> BigInt((7 - i) * 16) & 0xffffn;

				parts.push(part.toString(16));
			}

			return parts.join(':');
		}

		function parseCIDR(cidr) {
			const [networkStr, prefixStr] = cidr.split('/');
			const prefixLength = parseInt(prefixStr);
			const network = parseIP(networkStr) & 0xffffffff << 32 - prefixLength;
			const size = Math.pow(2, 32 - prefixLength);

			return { network, prefixLength, size };
		}

		function parseIPv6CIDR(cidr) {
			const [networkStr, prefixStr] = cidr.split('/');
			const prefixLength = parseInt(prefixStr);
			const network = parseIPv6(networkStr) & 0xffffffffffffffffffffffffffffffffn << BigInt(128 - prefixLength);
			const size = 2n ** BigInt(128 - prefixLength);

			return { network, prefixLength, size };
		}

		function parseRange(range) {
			const [startStr, endStr] = range.split('-').map((s) => s.trim());
			const start = parseIP(startStr);
			const end = parseIP(endStr);

			return { start, end, count: end - start + 1 };
		}

		function estimateMemoryUsage(count) {
			// Rough estimate: each IP string ~15 bytes + overhead
			const bytesPerIP = 20;

			const totalBytes = count * bytesPerIP;

			if (totalBytes < 1024) return `${totalBytes} B`;
			if (totalBytes < 1024 * 1024) return `${Math.round(totalBytes / 1024)} KB`;

			return `${Math.round(totalBytes / (1024 * 1024))} MB`;
		}

		async function enumerateIPs() {
			if (!input.trim()) {
				result = null;

				return;
			}

			isGenerating = true;

			try {
				const trimmed = input.trim();
				let addresses = [];
				let totalCount = 0;
				let networkInfo = { type: 'single' };

				// Determine input type
				if (trimmed.includes('/')) {
					// CIDR notation
					if (trimmed.includes(':')) {
						// IPv6 CIDR
						const { network, size, prefixLength } = parseIPv6CIDR(trimmed);

						if (size > BigInt(ABSOLUTE_MAX_GENERATION)) {
							throw new Error(`IPv6 /${prefixLength} would generate ${formatNumber(Number(size))} addresses. Maximum allowed: ${formatNumber(ABSOLUTE_MAX_GENERATION)}`);
						}

						totalCount = Number(size);

						networkInfo = {
							type: 'cidr',
							network: ipv6ToString(network),
							totalHosts: totalCount
						};

						// Generate IPv6 addresses
						const displayLimit = Math.min(maxDisplayLimit, ABSOLUTE_MAX_DISPLAY, totalCount);

						for (let i = 0n; i < BigInt(displayLimit); i++) {
							addresses.push(ipv6ToString(network + i));
						}
					} else {
						// IPv4 CIDR
						const { network, size, prefixLength } = parseCIDR(trimmed);

						if (size > ABSOLUTE_MAX_GENERATION) {
							throw new Error(`/${prefixLength} would generate ${formatNumber(size)} addresses. Maximum allowed: ${formatNumber(ABSOLUTE_MAX_GENERATION)}`);
						}

						totalCount = size;

						const broadcast = network + size - 1;

						networkInfo = {
							type: 'cidr',
							network: ipToString(network),
							broadcast: ipToString(broadcast),
							firstUsable: size > 2 ? ipToString(network + 1) : ipToString(network),
							lastUsable: size > 2 ? ipToString(broadcast - 1) : ipToString(broadcast),
							totalHosts: Math.max(0, size - 2)
						};

						// Generate addresses based on inclusion options
						let startAddr = network;

						let endAddr = network + size;

						if (!includeNetwork && size > 1) startAddr += 1;
						if (!includeBroadcast && size > 1) endAddr -= 1;

						const displayLimit = Math.min(maxDisplayLimit, ABSOLUTE_MAX_DISPLAY, endAddr - startAddr);

						for (let i = 0; i < displayLimit; i++) {
							addresses.push(ipToString(startAddr + i));
						}
					}
				} else if (trimmed.includes('-')) {
					// IP range
					const { start, end, count } = parseRange(trimmed);

					if (count > ABSOLUTE_MAX_GENERATION) {
						throw new Error(`Range would generate ${formatNumber(count)} addresses. Maximum allowed: ${formatNumber(ABSOLUTE_MAX_GENERATION)}`);
					}

					totalCount = count;

					networkInfo = {
						type: 'range',
						firstUsable: ipToString(start),
						lastUsable: ipToString(end)
					};

					const displayLimit = Math.min(maxDisplayLimit, ABSOLUTE_MAX_DISPLAY, count);

					for (let i = 0; i < displayLimit; i++) {
						addresses.push(ipToString(start + i));
					}
				} else {
					// Single IP
					addresses = [trimmed];

					totalCount = 1;
					networkInfo = { type: 'single' };
				}

				// Add small delay for UX (shows loading state)
				await new Promise((resolve) => setTimeout(resolve, 100));

				result = {
					success: true,
					addresses,
					totalCount,
					displayCount: addresses.length,
					truncated: addresses.length < totalCount,
					networkInfo
				};
			} catch(error) {
				result = {
					success: false,
					error: error instanceof Error ? error.message : 'Unknown error occurred',
					addresses: [],
					totalCount: 0,
					displayCount: 0,
					truncated: false,
					networkInfo: { type: 'single' }
				};
			} finally {
				isGenerating = false;
			}
		}

		function handleInputChange() {
			_userModified = true;
			selectedExample = null;
			enumerateIPs();
		}

		async function exportToCSV() {
			if (!result?.addresses.length) return;

			// For large datasets, generate on-the-fly to avoid memory issues
			let csvContent = 'ip_address\n';

			if (result.totalCount <= 10000) {
				// Small dataset - include all addresses
				for (const ip of result.addresses) {
					csvContent += `${ip}\n`;
				}
			} else {
				// Large dataset - this would need chunked generation
				// For now, just export what's displayed
				csvContent += '# Note: Only displaying first ' + result.addresses.length + ' addresses\n';

				for (const ip of result.addresses) {
					csvContent += `${ip}\n`;
				}
			}

			const blob = new Blob([csvContent], { type: 'text/csv' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');

			a.href = url;
			a.download = `ip-enumerate-${Date.now()}.csv`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		}

		async function exportToJSON() {
			if (!result?.addresses.length) return;

			const jsonData = {
				input,
				timestamp: new Date().toISOString(),
				totalCount: result.totalCount,
				displayCount: result.displayCount,
				truncated: result.truncated,
				networkInfo: result.networkInfo,
				addresses: result.addresses
			};

			const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');

			a.href = url;
			a.download = `ip-enumerate-${Date.now()}.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		}

		// Generate on component load
		enumerateIPs();

		$$renderer.push(`<div class="container svelte-rxppz9"><div class="card main-input-card svelte-rxppz9"><header class="card-header svelte-rxppz9"><h2 class="svelte-rxppz9">IP Enumerate</h2> <p class="svelte-rxppz9">Safely enumerate all IP addresses in CIDR blocks and ranges</p></header> <input type="text"${$.attr('value', input)} placeholder="192.168.1.0/28 or 10.0.0.1-10.0.0.10" class="network-input svelte-rxppz9"/> <div class="options-row svelte-rxppz9"><div class="limit-control svelte-rxppz9"><label for="max-display" class="svelte-rxppz9">Max Display</label> <input id="max-display" type="number"${$.attr('value', maxDisplayLimit)} min="1"${$.attr('max', ABSOLUTE_MAX_DISPLAY)} class="limit-input svelte-rxppz9"/></div> <div class="checkbox-group svelte-rxppz9"><label class="checkbox-option svelte-rxppz9"><input type="checkbox"${$.attr('checked', includeNetwork, true)} class="svelte-rxppz9"/> <span class="checkmark svelte-rxppz9"></span> Network</label> <label class="checkbox-option svelte-rxppz9"><input type="checkbox"${$.attr('checked', includeBroadcast, true)} class="svelte-rxppz9"/> <span class="checkmark svelte-rxppz9"></span> Broadcast</label></div></div> <div class="examples-section svelte-rxppz9"><details class="examples-details svelte-rxppz9"><summary class="examples-summary svelte-rxppz9">`);
		Icon($$renderer, { name: 'chevron-right', size: 'sm' });
		$$renderer.push(`<!----> <h4 class="svelte-rxppz9">Quick Examples</h4></summary> <div class="examples-list svelte-rxppz9"><!--[-->`);

		const each_array = $.ensure_array_like(examples);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let example = each_array[$$index];

			$$renderer.push(`<button${$.attr_class(`example-item ${selectedExample === example.label ? 'active' : ''}`, 'svelte-rxppz9')}><div class="example-label svelte-rxppz9">${$.escape(example.label)}</div> <code class="example-input svelte-rxppz9">${$.escape(example.input)}</code> <div class="example-desc svelte-rxppz9">${$.escape(example.description)}</div></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div> <div class="safety-warning svelte-rxppz9">`);
		Icon($$renderer, { name: 'alert-triangle', size: 'sm' });

		$$renderer.push(`<!----> <div><strong>Safety:</strong> Max ${$.escape(formatNumber(ABSOLUTE_MAX_DISPLAY))} displayed, ${$.escape(formatNumber(ABSOLUTE_MAX_GENERATION))}
        generated</div></div></div> `);

		if (isGenerating) {
			$$renderer.push(`<!--[0--><div class="card loading-card svelte-rxppz9"><div class="loading-content svelte-rxppz9">`);
			Icon($$renderer, { name: 'loader', size: 'lg' });
			$$renderer.push(`<!----> <span>Generating IP addresses...</span></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (result && !isGenerating) {
			$$renderer.push(`<!--[0--><div class="results-grid svelte-rxppz9">`);

			if (result.success) {
				$$renderer.push(`<!--[0--><div class="card summary-card svelte-rxppz9"><div class="card-header"><h3>`);
				Icon($$renderer, { name: 'list', size: 'sm' });
				$$renderer.push(`<!----> Results</h3></div> <div class="export-actions svelte-rxppz9"><button class="export-btn svelte-rxppz9">`);
				Icon($$renderer, { name: 'json-file', size: 'sm' });
				$$renderer.push(`<!----> JSON</button> <button class="export-btn svelte-rxppz9">`);
				Icon($$renderer, { name: 'csv-file', size: 'sm' });
				$$renderer.push(`<!----> CSV</button> <button${$.attr_class(`copy-btn ${clipboard.isCopied('all-addresses') ? 'copied' : ''}`, 'svelte-rxppz9')}>`);

				Icon($$renderer, {
					name: clipboard.isCopied('all-addresses') ? 'check' : 'copy',
					size: 'sm'
				});

				$$renderer.push(`<!----> Copy All</button></div> <div class="summary-stats svelte-rxppz9"><div class="stat svelte-rxppz9"><span class="stat-value svelte-rxppz9">${$.escape(formatNumber(result.totalCount))}</span> <span class="stat-label svelte-rxppz9">Total</span></div> <div class="stat svelte-rxppz9"><span class="stat-value svelte-rxppz9">${$.escape(formatNumber(result.displayCount))}</span> <span class="stat-label svelte-rxppz9">Shown</span></div> <div class="stat svelte-rxppz9"><span class="stat-value svelte-rxppz9">${$.escape(estimateMemoryUsage(result.displayCount))}</span> <span class="stat-label svelte-rxppz9">Memory</span></div></div> `);

				if (result.networkInfo.network) {
					$$renderer.push(`<!--[0--><div class="network-info svelte-rxppz9"><div class="info-item svelte-rxppz9"><span class="svelte-rxppz9">Network:</span> <code class="svelte-rxppz9">${$.escape(result.networkInfo.network)}</code></div> `);

					if (result.networkInfo.broadcast) {
						$$renderer.push(`<!--[0--><div class="info-item svelte-rxppz9"><span class="svelte-rxppz9">Broadcast:</span> <code class="svelte-rxppz9">${$.escape(result.networkInfo.broadcast)}</code></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div> <div class="card addresses-card svelte-rxppz9"><div class="card-header"><h3>`);
				Icon($$renderer, { name: 'target', size: 'sm' });
				$$renderer.push(`<!----> IP Addresses</h3> `);

				if (result.truncated) {
					$$renderer.push(`<!--[0--><span class="truncated-notice svelte-rxppz9">Showing ${$.escape(formatNumber(result.displayCount))} of ${$.escape(formatNumber(result.totalCount))}</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div> <div class="addresses-list svelte-rxppz9"><!--[-->`);

				const each_array_1 = $.ensure_array_like(result.addresses);

				for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
					let address = each_array_1[index];

					$$renderer.push(`<div class="address-item svelte-rxppz9"><span class="address-index svelte-rxppz9">${$.escape(index + 1)}</span> <code class="address-code svelte-rxppz9">${$.escape(address)}</code> <button${$.attr_class(`copy-btn-small ${clipboard.isCopied(address) ? 'copied' : ''}`, 'svelte-rxppz9')}>`);

					Icon($$renderer, {
						name: clipboard.isCopied(address) ? 'check' : 'copy',
						size: 'xs'
					});

					$$renderer.push(`<!----></button></div>`);
				}

				$$renderer.push(`<!--]--></div></div>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="card error-card svelte-rxppz9"><div class="error-content svelte-rxppz9">`);
				Icon($$renderer, { name: 'alert-triangle', size: 'lg' });
				$$renderer.push(`<!----> <h3 class="svelte-rxppz9">Error</h3> <p>${$.escape(result.error)}</p></div></div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}