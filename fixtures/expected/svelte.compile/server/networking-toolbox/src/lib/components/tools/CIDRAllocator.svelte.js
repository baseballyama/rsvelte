import * as $ from 'svelte/internal/server';
import { tooltip } from '$lib/actions/tooltip.js';
import { useClipboard } from '$lib/composables';
import Icon from '$lib/components/global/Icon.svelte';
import { formatNumber } from '$lib/utils/formatters';
import '../../../styles/diagnostics-pages.scss';

export default function CIDRAllocator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let pools = `192.168.0.0/16
10.0.0.0/20`;

		let requests = `/24 - Office Network
/25 - Guest WiFi
/26 - Servers
/27 - Management
/28 - DMZ`;

		let algorithm = 'best-fit';
		let result = null;
		const clipboard = useClipboard();
		let _selectedExample = null;
		let selectedExampleIndex = null;
		let _userModified = false;

		const examples = [
			{
				label: 'Office Network Planning',
				pools: '192.168.0.0/16',
				requests: `/24 - Main Office
/25 - Guest Network
/26 - Servers
/27 - Management`,
				algorithm: 'best-fit'
			},

			{
				label: 'Multi-Pool Allocation',
				pools: `10.0.0.0/20
172.16.0.0/24`,

				requests: `/22 - Data Center
/26 - Office A
/27 - Office B
/28 - Point-to-Point`,
				algorithm: 'first-fit'
			},

			{
				label: 'Dense Packing Challenge',
				pools: '192.168.0.0/22',
				requests: `/28 - Subnet A
/28 - Subnet B
/28 - Subnet C
/28 - Subnet D
/28 - Subnet E
/28 - Subnet F`,
				algorithm: 'best-fit'
			},

			{
				label: 'Campus VLAN Allocation',
				pools: `10.0.0.0/16
172.16.0.0/16`,

				requests: `/22 - Student Housing
/23 - Academic Buildings
/24 - Admin Offices
/25 - Library Systems
/26 - Lab Networks
/28 - Printer VLANs`,
				algorithm: 'best-fit'
			},

			{
				label: 'Cloud Infrastructure',
				pools: `10.100.0.0/16
10.200.0.0/16
10.255.0.0/20`,

				requests: `/20 - Production Cluster
/21 - Staging Environment
/22 - Development Pods
/24 - CI/CD Pipeline
/25 - Database Tier
/26 - Load Balancers
/27 - Monitoring Stack`,
				algorithm: 'first-fit'
			},

			{
				label: 'ISP Customer Allocation',
				pools: `203.0.113.0/24
198.51.100.0/24
192.0.2.0/24`,

				requests: `/27 - Enterprise Customer A
/28 - Small Business B
/29 - Home Office C
/30 - Point-to-Point Links
/28 - Enterprise Customer D
/29 - Remote Branch E
/30 - Backup Connections`,
				algorithm: 'best-fit'
			}
		];

		function loadExample(example, index) {
			pools = example.pools;
			requests = example.requests;
			algorithm = example.algorithm;
			_selectedExample = example.label;
			selectedExampleIndex = index;
			_userModified = false;
			performAllocation();
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

		function parseCIDR(cidr) {
			const [networkStr, prefixStr] = cidr.split('/');
			const prefixLength = parseInt(prefixStr);
			const network = parseIP(networkStr) & 0xffffffff << 32 - prefixLength;
			const size = Math.pow(2, 32 - prefixLength);

			return { network, prefixLength, size };
		}

		function parseRequests(input) {
			const lines = input.trim().split('\n').filter((line) => line.trim());
			const requests = [];

			for (const line of lines) {
				const trimmed = line.trim();

				if (!trimmed) continue;

				// Parse format: "/24 - Description" or just "/24"
				const match = trimmed.match(/^\/(\d+)(?:\s*-\s*(.*))?$/);

				if (!match) {
					throw new Error(`Invalid request format: ${trimmed}. Expected format: "/24 - Description" or "/24"`);
				}

				const prefixLength = parseInt(match[1]);
				const description = match[2]?.trim() || `/${prefixLength} subnet`;

				if (prefixLength < 1 || prefixLength > 32) {
					throw new Error(`Invalid prefix length: /${prefixLength}`);
				}

				const size = Math.pow(2, 32 - prefixLength);

				requests.push({ prefixLength, description, size });
			}

			return requests;
		}

		function findFreeBlocks(pool, allocated) {
			if (allocated.length === 0) {
				return [{ start: pool.network, size: pool.size }];
			}

			// Sort allocated blocks by start address
			const sorted = [...allocated].sort((a, b) => a.start - b.start);

			const freeBlocks = [];
			let currentPos = pool.network;
			const poolEnd = pool.network + pool.size;

			for (const block of sorted) {
				// Add gap before this allocation if it exists
				if (currentPos < block.start) {
					freeBlocks.push({ start: currentPos, size: block.start - currentPos });
				}

				currentPos = block.start + block.size;
			}

			// Add gap after the last allocation if it exists
			if (currentPos < poolEnd) {
				freeBlocks.push({ start: currentPos, size: poolEnd - currentPos });
			}

			return freeBlocks;
		}

		function findBestFitBlock(freeBlocks, requiredSize, _prefixLength) {
			// Filter blocks that can fit the required size and are properly aligned
			const viableBlocks = freeBlocks.filter((block) => {
				if (block.size < requiredSize) return false;

				// Check if we can find a properly aligned address within this block
				const alignmentMask = requiredSize - 1;

				const alignedStart = block.start + alignmentMask & ~alignmentMask;

				return alignedStart + requiredSize <= block.start + block.size;
			});

			if (viableBlocks.length === 0) return null;

			if (algorithm === 'best-fit') {
				// Best-fit: smallest block that fits
				return viableBlocks.reduce((best, current) => current.size < best.size ? current : best);
			} else {
				// First-fit: first block that fits
				return viableBlocks[0];
			}
		}

		function performAllocation() {
			try {
				if (!pools.trim() || !requests.trim()) {
					result = null;

					return;
				}

				const poolLines = pools.trim().split('\n').filter((line) => line.trim());
				const requestList = parseRequests(requests);

				// Parse pools
				const parsedPools = poolLines.map((line) => {
					const trimmed = line.trim();

					if (!trimmed.includes('/')) {
						throw new Error(`Invalid pool format: ${trimmed}. Expected CIDR notation.`);
					}

					const { network, prefixLength: _prefixLength, size } = parseCIDR(trimmed);

					return {
						original: trimmed,
						network,
						size,
						allocated: [],
						remaining: [],
						utilization: 0
					};
				});

				// Sort requests by size (largest first for better packing)
				const sortedRequests = [...requestList].sort((a, b) => b.size - a.size);

				const allocations = [];

				// Attempt to allocate each request
				for (const request of sortedRequests) {
					let allocated = false;
					let allocationResult = null;

					// Try each pool in order
					for (const pool of parsedPools) {
						const freeBlocks = findFreeBlocks({ network: pool.network, size: pool.size }, pool.allocated);
						const bestBlock = findBestFitBlock(freeBlocks, request.size, request.prefixLength);

						if (bestBlock) {
							// Find properly aligned address within the block
							const alignmentMask = request.size - 1;

							const alignedStart = bestBlock.start + alignmentMask & ~alignmentMask;

							if (alignedStart + request.size <= bestBlock.start + bestBlock.size) {
								const cidr = `${ipToString(alignedStart)}/${request.prefixLength}`;

								pool.allocated.push({
									cidr,
									start: alignedStart,
									size: request.size,
									description: request.description
								});

								allocationResult = { cidr, pool: pool.original };
								allocated = true;

								break;
							}
						}
					}

					allocations.push({
						request: `/${request.prefixLength}`,
						description: request.description,
						prefixLength: request.prefixLength,
						size: request.size,
						allocated,
						cidr: allocationResult?.cidr,
						pool: allocationResult?.pool,
						reason: allocated
							? undefined
							: 'No suitable block found with proper alignment'
					});
				}

				// Calculate remaining space and utilization for each pool
				for (const pool of parsedPools) {
					const freeBlocks = findFreeBlocks({ network: pool.network, size: pool.size }, pool.allocated);

					pool.remaining = freeBlocks.map((block) => ({
						start: block.start,
						size: block.size,
						cidr: block.size > 0
							? `${ipToString(block.start)}/${32 - Math.log2(block.size)}`
							: ''
					})).filter((block) => block.size > 0);

					const allocatedSize = pool.allocated.reduce((sum, alloc) => sum + alloc.size, 0);

					pool.utilization = allocatedSize / pool.size * 100;
				}

				// Calculate summary statistics
				const totalRequests = allocations.length;

				const successfulAllocations = allocations.filter((a) => a.allocated).length;
				const failedAllocations = totalRequests - successfulAllocations;
				const totalPoolSpace = parsedPools.reduce((sum, pool) => sum + pool.size, 0);
				const allocatedSpace = parsedPools.reduce((sum, pool) => sum + pool.allocated.reduce((poolSum, alloc) => poolSum + alloc.size, 0), 0);

				// Calculate wasted space (internal fragmentation)
				const wastedSpace = parsedPools.reduce(
					(sum, pool) => {
						const freeBlocks = pool.remaining;

						const unusableSpace = freeBlocks.reduce(
							(blockSum, block) => {
								// Space is "wasted" if it's too small for the smallest failed allocation
								const failedRequests = allocations.filter((a) => !a.allocated);

								if (failedRequests.length === 0) return blockSum;

								const smallestFailed = Math.min(...failedRequests.map((a) => a.size));

								return blockSum + (block.size < smallestFailed ? block.size : 0);
							},
							0
						);

						return sum + unusableSpace;
					},
					0
				);

				const efficiency = totalPoolSpace > 0 ? allocatedSpace / totalPoolSpace * 100 : 0;

				result = {
					success: true,
					allocations,
					pools: parsedPools,
					summary: {
						totalRequests,
						successfulAllocations,
						failedAllocations,
						totalPoolSpace,
						allocatedSpace,
						wastedSpace,
						efficiency
					}
				};
			} catch(error) {
				result = {
					success: false,
					error: error instanceof Error ? error.message : 'Unknown error occurred',
					allocations: [],
					pools: [],
					summary: {
						totalRequests: 0,
						successfulAllocations: 0,
						failedAllocations: 0,
						totalPoolSpace: 0,
						allocatedSpace: 0,
						wastedSpace: 0,
						efficiency: 0
					}
				};
			}
		}

		function handleInputChange() {
			_userModified = true;
			_selectedExample = null;
			selectedExampleIndex = null;
			performAllocation();
		}

		async function copyAllAllocations() {
			if (!result?.allocations) return;

			const successful = result.allocations.filter((a) => a.allocated);

			if (successful.length === 0) return;

			const text = successful.map((a) => `${a.cidr} - ${a.description}`).join('\n');

			await clipboard.copy(text, 'all-allocations');
		}

		// Calculate on component load
		performAllocation();

		$$renderer.push(`<div class="card svelte-h9my3f"><header class="card-header svelte-h9my3f"><h2 class="svelte-h9my3f">CIDR Allocator</h2> <p class="svelte-h9my3f">Pack requested subnet sizes into pools using intelligent bin-packing algorithms</p></header> <div class="card examples-card svelte-h9my3f"><details class="examples-details"><summary class="examples-summary">`);
		Icon($$renderer, { name: 'chevron-right', size: 'xs' });
		$$renderer.push(`<!----> <h4>Quick Examples</h4></summary> <div class="examples-grid"><!--[-->`);

		const each_array = $.ensure_array_like(examples);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let example = each_array[i];

			$$renderer.push(`<button${$.attr_class('example-card', void 0, { 'selected': selectedExampleIndex === i })}><div class="example-label">${$.escape(example.label)}</div> <div class="example-preview">Algorithm: ${$.escape(example.algorithm)}</div></button>`);
		}

		$$renderer.push(`<!--]--></div></details></div> <section class="algorithm-section svelte-h9my3f"><h4 class="svelte-h9my3f">Allocation Algorithm</h4> <div class="algorithm-options svelte-h9my3f"><label class="algorithm-option svelte-h9my3f"><input type="radio"${$.attr('checked', algorithm === 'first-fit', true)} value="first-fit" class="svelte-h9my3f"/> <div class="option-content svelte-h9my3f"><div class="option-title svelte-h9my3f">`);
		Icon($$renderer, { name: 'zap', size: 'sm' });
		$$renderer.push(`<!----> First-Fit</div> <div class="option-description svelte-h9my3f">Fast allocation - uses the first available block that fits (good for speed)</div></div></label> <label class="algorithm-option svelte-h9my3f"><input type="radio"${$.attr('checked', algorithm === 'best-fit', true)} value="best-fit" class="svelte-h9my3f"/> <div class="option-content svelte-h9my3f"><div class="option-title svelte-h9my3f">`);
		Icon($$renderer, { name: 'target', size: 'sm' });
		$$renderer.push(`<!----> Best-Fit</div> <div class="option-description svelte-h9my3f">Optimal packing - uses the smallest available block that fits (reduces fragmentation)</div></div></label></div></section> <section class="input-section svelte-h9my3f"><div class="input-grid svelte-h9my3f"><div class="input-group svelte-h9my3f"><label for="pools" class="svelte-h9my3f">`);
		Icon($$renderer, { name: 'database', size: 'sm' });

		$$renderer.push(`<!----> Available Pools</label> <textarea id="pools" placeholder="192.168.0.0/16
10.0.0.0/20" rows="6" required="" class="svelte-h9my3f">`);

		const $$body = $.escape(pools);

		if ($$body) {
			$$renderer.push(`${$$body}`);
		} else {}

		$$renderer.push(`</textarea></div> <div class="input-group svelte-h9my3f"><label for="requests" class="svelte-h9my3f">`);
		Icon($$renderer, { name: 'list-check', size: 'sm' });

		$$renderer.push(`<!----> Subnet Requests</label> <textarea id="requests" placeholder="/24 - Main Office
/26 - Servers
/28 - Management" rows="6" required="" class="svelte-h9my3f">`);

		const $$body_1 = $.escape(requests);

		if ($$body_1) {
			$$renderer.push(`${$$body_1}`);
		} else {}

		$$renderer.push(`</textarea></div></div></section> `);

		if (result) {
			$$renderer.push(`<!--[0--><section class="results-section svelte-h9my3f">`);

			if (result.success) {
				$$renderer.push(`<!--[0--><div class="allocation-summary svelte-h9my3f"><div class="summary-header svelte-h9my3f"><h3 class="svelte-h9my3f">Allocation Results</h3> `);

				if (result.summary.successfulAllocations > 0) {
					$$renderer.push(`<!--[0--><button${$.attr_class(`copy-all-button ${clipboard.isCopied('all-allocations') ? 'copied' : ''}`, 'svelte-h9my3f')}>`);

					Icon($$renderer, {
						name: clipboard.isCopied('all-allocations') ? 'check' : 'copy',
						size: 'sm'
					});

					$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('all-allocations') ? 'Copied!' : 'Copy All')}</button>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div> <div class="summary-grid svelte-h9my3f"><div class="summary-card success svelte-h9my3f"><div class="summary-icon svelte-h9my3f">`);
				Icon($$renderer, { name: 'check-circle' });
				$$renderer.push(`<!----></div> <div class="summary-content svelte-h9my3f"><div class="summary-number svelte-h9my3f">${$.escape(result.summary.successfulAllocations)}</div> <div class="summary-label svelte-h9my3f">Allocated</div></div></div> <div class="summary-card error svelte-h9my3f"><div class="summary-icon svelte-h9my3f">`);

				Icon($$renderer, {
					name: result.summary.failedAllocations > 0 ? 'x-circle' : 'check-circle'
				});

				$$renderer.push(`<!----></div> <div class="summary-content svelte-h9my3f"><div class="summary-number svelte-h9my3f">${$.escape(result.summary.failedAllocations)}</div> <div class="summary-label svelte-h9my3f">Failed</div></div></div> <div class="summary-card info svelte-h9my3f"><div class="summary-icon svelte-h9my3f">`);
				Icon($$renderer, { name: 'pie-chart' });
				$$renderer.push(`<!----></div> <div class="summary-content svelte-h9my3f"><div class="summary-number svelte-h9my3f">${$.escape(result.summary.efficiency.toFixed(1))}%</div> <div class="summary-label svelte-h9my3f">Efficiency</div></div></div></div> <div class="space-breakdown svelte-h9my3f"><div class="breakdown-item svelte-h9my3f"><span class="breakdown-label svelte-h9my3f">Total Pool Space:</span> <span class="breakdown-value svelte-h9my3f">${$.escape(formatNumber(result.summary.totalPoolSpace))} addresses</span></div> <div class="breakdown-item svelte-h9my3f"><span class="breakdown-label svelte-h9my3f">Allocated:</span> <span class="breakdown-value allocated svelte-h9my3f">${$.escape(formatNumber(result.summary.allocatedSpace))} addresses</span></div> <div class="breakdown-item svelte-h9my3f"><span class="breakdown-label svelte-h9my3f">Remaining:</span> <span class="breakdown-value svelte-h9my3f">${$.escape(formatNumber(result.summary.totalPoolSpace - result.summary.allocatedSpace))} addresses</span></div></div></div> <div class="allocations-section svelte-h9my3f"><h4 class="svelte-h9my3f">Subnet Allocations</h4> <div class="allocations-list svelte-h9my3f"><!--[-->`);

				const each_array_1 = $.ensure_array_like(result.allocations);

				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let allocation = each_array_1[$$index_1];

					$$renderer.push(`<div${$.attr_class(`allocation-item ${allocation.allocated ? 'success' : 'failed'}`, 'svelte-h9my3f')}><div class="allocation-header svelte-h9my3f"><div class="allocation-info svelte-h9my3f"><code class="allocation-request svelte-h9my3f">${$.escape(allocation.request)}</code> <span class="allocation-description svelte-h9my3f">${$.escape(allocation.description)}</span></div> <div class="allocation-status svelte-h9my3f">`);

					if (allocation.allocated) {
						$$renderer.push('<!--[0-->');
						Icon($$renderer, { name: 'check-circle', size: 'sm' });
						$$renderer.push(`<!----> <span class="status-text success svelte-h9my3f">Allocated</span>`);
					} else {
						$$renderer.push('<!--[-1-->');
						Icon($$renderer, { name: 'x-circle', size: 'sm' });
						$$renderer.push(`<!----> <span class="status-text failed svelte-h9my3f">Failed</span>`);
					}

					$$renderer.push(`<!--]--></div></div> `);

					if (allocation.allocated && allocation.cidr) {
						$$renderer.push(`<!--[0--><div class="allocation-result svelte-h9my3f"><div class="result-info svelte-h9my3f"><code class="result-cidr svelte-h9my3f">${$.escape(allocation.cidr)}</code> <span class="result-pool svelte-h9my3f">in ${$.escape(allocation.pool)}</span> <span class="result-size svelte-h9my3f">(${$.escape(formatNumber(allocation.size))} addresses)</span></div> <button${$.attr_class(`copy-button ${clipboard.isCopied(`alloc-${allocation.cidr}`) ? 'copied' : ''}`, 'svelte-h9my3f')}>`);

						Icon($$renderer, {
							name: clipboard.isCopied(`alloc-${allocation.cidr}`) ? 'check' : 'copy',
							size: 'xs'
						});

						$$renderer.push(`<!----></button></div>`);
					} else if (allocation.reason) {
						$$renderer.push(`<!--[1--><div class="allocation-reason failed svelte-h9my3f">`);
						Icon($$renderer, { name: 'alert-triangle', size: 'xs' });
						$$renderer.push(`<!----> ${$.escape(allocation.reason)}</div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div>`);
				}

				$$renderer.push(`<!--]--></div></div> <div class="pools-section svelte-h9my3f"><h4 class="svelte-h9my3f">Pool Utilization</h4> <div class="pools-grid svelte-h9my3f"><!--[-->`);

				const each_array_2 = $.ensure_array_like(result.pools);

				for (let $$index_4 = 0, $$length = each_array_2.length; $$index_4 < $$length; $$index_4++) {
					let pool = each_array_2[$$index_4];

					$$renderer.push(`<div class="pool-card svelte-h9my3f"><div class="pool-header svelte-h9my3f"><code class="pool-cidr svelte-h9my3f">${$.escape(pool.original)}</code> <div class="pool-stats"><span${$.attr_class('pool-utilization svelte-h9my3f', void 0, {
						'high': pool.utilization >= 80,
						'medium': pool.utilization >= 50 && pool.utilization < 80,
						'low': pool.utilization < 50
					})}>${$.escape(pool.utilization.toFixed(1))}% used</span></div></div> <div class="utilization-bar svelte-h9my3f"><div class="utilization-fill svelte-h9my3f"${$.attr_style(`width: ${$.stringify(pool.utilization)}%`)}></div></div> `);

					if (pool.allocated.length > 0) {
						$$renderer.push(`<!--[0--><div class="pool-allocations svelte-h9my3f"><h5 class="svelte-h9my3f">Allocated Subnets</h5> <div class="allocated-list svelte-h9my3f"><!--[-->`);

						const each_array_3 = $.ensure_array_like(pool.allocated);

						for (let $$index_2 = 0, $$length = each_array_3.length; $$index_2 < $$length; $$index_2++) {
							let subnet = each_array_3[$$index_2];

							$$renderer.push(`<div class="allocated-subnet svelte-h9my3f"><code class="subnet-cidr svelte-h9my3f">${$.escape(subnet.cidr)}</code> <span class="subnet-desc svelte-h9my3f">${$.escape(subnet.description)}</span></div>`);
						}

						$$renderer.push(`<!--]--></div></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (pool.remaining.length > 0) {
						$$renderer.push(`<!--[0--><div class="pool-remaining svelte-h9my3f"><h5 class="svelte-h9my3f">Available Space</h5> <div class="remaining-list svelte-h9my3f"><!--[-->`);

						const each_array_4 = $.ensure_array_like(pool.remaining.slice(0, 5));

						for (let $$index_3 = 0, $$length = each_array_4.length; $$index_3 < $$length; $$index_3++) {
							let remaining = each_array_4[$$index_3];

							$$renderer.push(`<div class="remaining-block svelte-h9my3f"><code class="remaining-size svelte-h9my3f">${$.escape(formatNumber(remaining.size))} addresses</code> <span class="remaining-range svelte-h9my3f">${$.escape(ipToString(remaining.start))} - ${$.escape(ipToString(remaining.start + remaining.size - 1))}</span></div>`);
						}

						$$renderer.push(`<!--]--> `);

						if (pool.remaining.length > 5) {
							$$renderer.push(`<!--[0--><div class="remaining-more svelte-h9my3f">+${$.escape(pool.remaining.length - 5)} more blocks</div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div>`);
				}

				$$renderer.push(`<!--]--></div></div>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="error-message svelte-h9my3f">`);
				Icon($$renderer, { name: 'alert-triangle' });
				$$renderer.push(`<!----> <h4 class="svelte-h9my3f">Allocation Error</h4> <p>${$.escape(result.error || 'Unknown error occurred')}</p></div>`);
			}

			$$renderer.push(`<!--]--></section>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}