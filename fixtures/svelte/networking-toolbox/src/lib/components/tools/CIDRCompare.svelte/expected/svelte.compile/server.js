import * as $ from 'svelte/internal/server';
import { tooltip } from '$lib/actions/tooltip.js';
import { useClipboard } from '$lib/composables';
import Icon from '$lib/components/global/Icon.svelte';
import { SvelteSet } from 'svelte/reactivity';
import '../../../styles/diagnostics-pages.scss';

export default function CIDRCompare($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let listA = `192.168.0.0/16
10.0.0.0/8
172.16.0.0/12`;

		let listB = `192.168.0.0/16
10.0.0.0/8
192.168.100.0/24
172.16.5.0/24`;

		let result = null;
		const clipboard = useClipboard();
		let _selectedExample = null;
		let selectedExampleIndex = null;
		let _userModified = false;

		const examples = [
			{
				label: 'Network Addition',
				listA: `192.168.1.0/24
10.0.0.0/16`,

				listB: `192.168.1.0/24
10.0.0.0/16
172.16.0.0/24`,
				description: 'Added 172.16.0.0/24'
			},

			{
				label: 'Network Removal',
				listA: `192.168.0.0/16
10.0.0.0/8
172.16.0.0/12`,

				listB: `192.168.0.0/16
10.0.0.0/8`,
				description: 'Removed 172.16.0.0/12'
			},

			{
				label: 'Mixed Changes',
				listA: `192.168.1.0/24
10.0.0.0/16
172.16.1.0/24`,

				listB: `192.168.1.0/24
10.0.1.0/24
172.16.2.0/24`,
				description: 'Swapped subnets'
			},

			{
				label: 'VLAN Reconfiguration',
				listA: `192.168.10.0/24
192.168.20.0/24
192.168.30.0/24`,

				listB: `192.168.10.0/24
192.168.25.0/24
192.168.35.0/24`,
				description: 'Replaced VLANs 20,30 with 25,35'
			},

			{
				label: 'Network Consolidation',
				listA: `10.1.0.0/24
10.1.1.0/24
10.1.2.0/24
10.1.3.0/24`,
				listB: `10.1.0.0/22`,
				description: 'Merged 4 /24s into 1 /22'
			},

			{
				label: 'Branch Office Migration',
				listA: `172.16.1.0/24
172.16.2.0/24
192.168.100.0/24`,

				listB: `10.10.1.0/24
10.10.2.0/24
192.168.100.0/24`,
				description: 'Migrated 172.16.x.x to 10.10.x.x'
			}
		];

		function loadExample(example, index) {
			listA = example.listA;
			listB = example.listB;
			_selectedExample = example.label;
			selectedExampleIndex = index;
			_userModified = false;
			performComparison();
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

		function normalizeCIDR(cidr) {
			if (!cidr.includes('/')) {
				// Single IP, convert to /32
				return `${cidr}/32`;
			}

			const [ipStr, prefixStr] = cidr.split('/');
			const prefixLength = parseInt(prefixStr);

			if (prefixLength < 0 || prefixLength > 32) {
				throw new Error(`Invalid prefix length: /${prefixLength}`);
			}

			// Calculate network address
			const ip = parseIP(ipStr);

			const mask = 0xffffffff << 32 - prefixLength;
			const networkAddress = ip & mask;

			return `${ipToString(networkAddress)}/${prefixLength}`;
		}

		function parseAndNormalizeList(input) {
			if (!input.trim()) return [];

			const lines = input.trim().split('\n').filter((line) => line.trim());
			const normalized = new SvelteSet();

			for (const line of lines) {
				const trimmed = line.trim();

				if (!trimmed) continue;

				try {
					if (trimmed.includes('-')) {
						// IP range - convert to CIDR blocks
						const [startStr, endStr] = trimmed.split('-').map((s) => s.trim());

						const startIP = parseIP(startStr);
						const endIP = parseIP(endStr);

						if (startIP > endIP) {
							throw new Error(`Invalid range: start IP is greater than end IP in ${trimmed}`);
						}

						// Convert range to CIDR blocks (simplified - assumes aligned blocks)
						let current = startIP;

						while (current <= endIP) {
							// Find the largest CIDR block that fits
							let prefixLength = 32;

							let blockSize = 1;

							// Find largest power of 2 that fits
							for (let p = 0; p <= 32; p++) {
								const size = Math.pow(2, 32 - p);

								if (current % size === 0 && current + size - 1 <= endIP) {
									prefixLength = p;
									blockSize = size;
								} else {
									break;
								}
							}

							normalized.add(`${ipToString(current)}/${prefixLength}`);
							current += blockSize;
						}
					} else if (trimmed.match(/^\d+\.\d+\.\d+\.\d+(\/\d+)?$/)) {
						// CIDR or single IP
						normalized.add(normalizeCIDR(trimmed));
					} else {
						throw new Error(`Invalid format: ${trimmed}`);
					}
				} catch(error) {
					throw new Error(`Error processing "${trimmed}": ${error instanceof Error ? error.message : 'Unknown error'}`);
				}
			}

			// Sort by network address
			return Array.from(normalized).sort((a, b) => {
				const aNetwork = parseIP(a.split('/')[0]);
				const bNetwork = parseIP(b.split('/')[0]);

				if (aNetwork !== bNetwork) {
					return aNetwork - bNetwork;
				}

				// If same network, sort by prefix length (more specific first)
				const aPrefix = parseInt(a.split('/')[1]);

				const bPrefix = parseInt(b.split('/')[1]);

				return bPrefix - aPrefix;
			});
		}

		function performComparison() {
			try {
				const normalizedA = parseAndNormalizeList(listA);
				const normalizedB = parseAndNormalizeList(listB);
				const setA = new Set(normalizedA);
				const setB = new Set(normalizedB);
				const added = normalizedB.filter((item) => !setA.has(item));
				const removed = normalizedA.filter((item) => !setB.has(item));
				const unchanged = normalizedA.filter((item) => setB.has(item));

				result = {
					success: true,
					added,
					removed,
					unchanged,
					normalizedA,
					normalizedB,
					summary: {
						totalA: normalizedA.length,
						totalB: normalizedB.length,
						addedCount: added.length,
						removedCount: removed.length,
						unchangedCount: unchanged.length
					}
				};
			} catch(error) {
				result = {
					success: false,
					error: error instanceof Error ? error.message : 'Unknown error occurred',
					added: [],
					removed: [],
					unchanged: [],
					normalizedA: [],
					normalizedB: [],
					summary: {
						totalA: 0,
						totalB: 0,
						addedCount: 0,
						removedCount: 0,
						unchangedCount: 0
					}
				};
			}
		}

		function handleInputChange() {
			_userModified = true;
			_selectedExample = null;
			selectedExampleIndex = null;
			performComparison();
		}

		async function copyCategory(items, category) {
			if (!items.length) return;

			const text = items.join('\n');

			await clipboard.copy(text, `category-${category}`);
		}

		function swapLists() {
			const temp = listA;

			listA = listB;
			listB = temp;
			_userModified = true;
			_selectedExample = null;
			selectedExampleIndex = null;
			performComparison();
		}

		// Calculate on component load
		performComparison();

		$$renderer.push(`<div class="card"><header class="card-header"><h2>CIDR Compare</h2> <p>Compare two lists of networks to identify changes for auditing</p></header> <div class="card examples-card"><details class="examples-details"><summary class="examples-summary">`);
		Icon($$renderer, { name: 'chevron-right', size: 'xs' });
		$$renderer.push(`<!----> <h4>Quick Examples</h4></summary> <div class="examples-grid"><!--[-->`);

		const each_array = $.ensure_array_like(examples);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let example = each_array[i];

			$$renderer.push(`<button${$.attr_class('example-card', void 0, { 'selected': selectedExampleIndex === i })}><div class="example-label">${$.escape(example.label)}</div> <div class="example-preview">${$.escape(example.description)}</div></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div> <section class="input-section svelte-mi177p"><div class="input-header svelte-mi177p"><h3 class="svelte-mi177p">Network Lists</h3> <button class="swap-button svelte-mi177p">`);
		Icon($$renderer, { name: 'swap', size: 'sm' });
		$$renderer.push(`<!----> Swap</button></div> <div class="input-grid svelte-mi177p"><div class="input-group svelte-mi177p"><label for="list-a" class="svelte-mi177p">`);
		Icon($$renderer, { name: 'list', size: 'sm' });

		$$renderer.push(`<!----> List A (Before)</label> <textarea id="list-a" placeholder="192.168.0.0/16
10.0.0.0/8
172.16.1.0-172.16.1.255" rows="8" class="svelte-mi177p">`);

		const $$body = $.escape(listA);

		if ($$body) {
			$$renderer.push(`${$$body}`);
		} else {}

		$$renderer.push(`</textarea></div> <div class="input-group svelte-mi177p"><label for="list-b" class="svelte-mi177p">`);
		Icon($$renderer, { name: 'list-check', size: 'sm' });

		$$renderer.push(`<!----> List B (After)</label> <textarea id="list-b" placeholder="192.168.0.0/16
10.0.0.0/8
192.168.100.0/24" rows="8" class="svelte-mi177p">`);

		const $$body_1 = $.escape(listB);

		if ($$body_1) {
			$$renderer.push(`${$$body_1}`);
		} else {}

		$$renderer.push(`</textarea></div></div></section> `);

		if (result) {
			$$renderer.push(`<!--[0--><section class="results-section svelte-mi177p">`);

			if (result.success) {
				$$renderer.push(`<!--[0--><div class="comparison-summary svelte-mi177p"><h3 class="svelte-mi177p">Comparison Summary</h3> <div class="summary-grid svelte-mi177p"><div class="summary-card svelte-mi177p"><div class="summary-icon added svelte-mi177p">`);
				Icon($$renderer, { name: 'plus-circle' });
				$$renderer.push(`<!----></div> <div class="summary-content svelte-mi177p"><div class="summary-number svelte-mi177p">${$.escape(result.summary.addedCount)}</div> <div class="summary-label svelte-mi177p">Added</div></div></div> <div class="summary-card svelte-mi177p"><div class="summary-icon removed svelte-mi177p">`);
				Icon($$renderer, { name: 'minus-circle' });
				$$renderer.push(`<!----></div> <div class="summary-content svelte-mi177p"><div class="summary-number svelte-mi177p">${$.escape(result.summary.removedCount)}</div> <div class="summary-label svelte-mi177p">Removed</div></div></div> <div class="summary-card svelte-mi177p"><div class="summary-icon unchanged svelte-mi177p">`);
				Icon($$renderer, { name: 'check-circle' });
				$$renderer.push(`<!----></div> <div class="summary-content svelte-mi177p"><div class="summary-number svelte-mi177p">${$.escape(result.summary.unchangedCount)}</div> <div class="summary-label svelte-mi177p">Unchanged</div></div></div></div> <div class="list-totals svelte-mi177p"><span class="total-item">List A: ${$.escape(result.summary.totalA)} items</span> <span class="total-item">List B: ${$.escape(result.summary.totalB)} items</span></div></div> <div class="changes-grid svelte-mi177p"><div class="change-category added svelte-mi177p"><div class="category-header svelte-mi177p"><h4 class="svelte-mi177p">`);
				Icon($$renderer, { name: 'plus-circle', size: 'sm' });
				$$renderer.push(`<!----> Added Networks (${$.escape(result.added.length)})</h4> `);

				if (result.added.length > 0) {
					$$renderer.push(`<!--[0--><button${$.attr_class(`copy-category ${clipboard.isCopied('category-added') ? 'copied' : ''}`, 'svelte-mi177p')}>`);

					Icon($$renderer, {
						name: clipboard.isCopied('category-added') ? 'check-circle' : 'copy',
						size: 'xs'
					});

					$$renderer.push(`<!----></button>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div> `);

				if (result.added.length > 0) {
					$$renderer.push(`<!--[0--><div class="networks-list svelte-mi177p"><!--[-->`);

					const each_array_1 = $.ensure_array_like(result.added);

					for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
						let network = each_array_1[$$index_1];

						$$renderer.push(`<div class="network-item added svelte-mi177p"><code class="network-cidr svelte-mi177p">${$.escape(network)}</code> <button${$.attr_class(`copy-button ${clipboard.isCopied(`added-${network}`) ? 'copied' : ''}`, 'svelte-mi177p')}>`);

						Icon($$renderer, {
							name: clipboard.isCopied(`added-${network}`) ? 'check-circle' : 'copy',
							size: 'xs'
						});

						$$renderer.push(`<!----></button></div>`);
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push(`<!--[-1--><div class="empty-category svelte-mi177p">`);
					Icon($$renderer, { name: 'check' });
					$$renderer.push(`<!----> <span>No networks added</span></div>`);
				}

				$$renderer.push(`<!--]--></div> <div class="change-category removed svelte-mi177p"><div class="category-header svelte-mi177p"><h4 class="svelte-mi177p">`);
				Icon($$renderer, { name: 'minus-circle', size: 'sm' });
				$$renderer.push(`<!----> Removed Networks (${$.escape(result.removed.length)})</h4> `);

				if (result.removed.length > 0) {
					$$renderer.push(`<!--[0--><button${$.attr_class(`copy-category ${clipboard.isCopied('category-removed') ? 'copied' : ''}`, 'svelte-mi177p')}>`);

					Icon($$renderer, {
						name: clipboard.isCopied('category-removed') ? 'check-circle' : 'copy',
						size: 'xs'
					});

					$$renderer.push(`<!----></button>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div> `);

				if (result.removed.length > 0) {
					$$renderer.push(`<!--[0--><div class="networks-list svelte-mi177p"><!--[-->`);

					const each_array_2 = $.ensure_array_like(result.removed);

					for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
						let network = each_array_2[$$index_2];

						$$renderer.push(`<div class="network-item removed svelte-mi177p"><code class="network-cidr svelte-mi177p">${$.escape(network)}</code> <button${$.attr_class(`copy-button ${clipboard.isCopied(`removed-${network}`) ? 'copied' : ''}`, 'svelte-mi177p')}>`);

						Icon($$renderer, {
							name: clipboard.isCopied(`removed-${network}`) ? 'check-circle' : 'copy',
							size: 'xs'
						});

						$$renderer.push(`<!----></button></div>`);
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push(`<!--[-1--><div class="empty-category svelte-mi177p">`);
					Icon($$renderer, { name: 'check' });
					$$renderer.push(`<!----> <span>No networks removed</span></div>`);
				}

				$$renderer.push(`<!--]--></div> <div class="change-category unchanged svelte-mi177p"><div class="category-header svelte-mi177p"><h4 class="svelte-mi177p">`);
				Icon($$renderer, { name: 'check-circle', size: 'sm' });
				$$renderer.push(`<!----> Unchanged Networks (${$.escape(result.unchanged.length)})</h4> `);

				if (result.unchanged.length > 0) {
					$$renderer.push(`<!--[0--><button${$.attr_class(`copy-category ${clipboard.isCopied('category-unchanged') ? 'copied' : ''}`, 'svelte-mi177p')}>`);

					Icon($$renderer, {
						name: clipboard.isCopied('category-unchanged') ? 'check-circle' : 'copy',
						size: 'xs'
					});

					$$renderer.push(`<!----></button>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div> `);

				if (result.unchanged.length > 0) {
					$$renderer.push(`<!--[0--><div class="networks-list svelte-mi177p"><!--[-->`);

					const each_array_3 = $.ensure_array_like(result.unchanged);

					for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
						let network = each_array_3[$$index_3];

						$$renderer.push(`<div class="network-item unchanged svelte-mi177p"><code class="network-cidr svelte-mi177p">${$.escape(network)}</code> <button${$.attr_class(`copy-button ${clipboard.isCopied(`unchanged-${network}`) ? 'copied' : ''}`, 'svelte-mi177p')}>`);

						Icon($$renderer, {
							name: clipboard.isCopied(`unchanged-${network}`) ? 'check-circle' : 'copy',
							size: 'xs'
						});

						$$renderer.push(`<!----></button></div>`);
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push(`<!--[-1--><div class="empty-category svelte-mi177p">`);
					Icon($$renderer, { name: 'alert-circle' });
					$$renderer.push(`<!----> <span>No networks remained unchanged</span></div>`);
				}

				$$renderer.push(`<!--]--></div></div>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="error-message svelte-mi177p">`);
				Icon($$renderer, { name: 'alert-triangle' });
				$$renderer.push(`<!----> <h4 class="svelte-mi177p">Comparison Error</h4> <p>${$.escape(result.error || 'Unknown error occurred')}</p></div>`);
			}

			$$renderer.push(`<!--]--></section>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}