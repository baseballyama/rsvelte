import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tooltip } from '$lib/actions/tooltip.js';
import { useClipboard } from '$lib/composables';
import Icon from '$lib/components/global/Icon.svelte';
import { formatNumber } from '$lib/utils/formatters';
import '../../../styles/diagnostics-pages.scss';

var root = $.from_html(`<button><div class="example-label"> </div> <div class="example-preview"> </div></button>`);
var root_1 = $.from_html(`<button><!> </button>`);
var root_2 = $.from_html(`<!> <span class="status-text success svelte-h9my3f">Allocated</span>`, 1);
var root_3 = $.from_html(`<!> <span class="status-text failed svelte-h9my3f">Failed</span>`, 1);
var root_4 = $.from_html(`<div class="allocation-result svelte-h9my3f"><div class="result-info svelte-h9my3f"><code class="result-cidr svelte-h9my3f"> </code> <span class="result-pool svelte-h9my3f"> </span> <span class="result-size svelte-h9my3f"> </span></div> <button><!></button></div>`);
var root_5 = $.from_html(`<div class="allocation-reason failed svelte-h9my3f"><!> </div>`);
var root_6 = $.from_html(`<div><div class="allocation-header svelte-h9my3f"><div class="allocation-info svelte-h9my3f"><code class="allocation-request svelte-h9my3f"> </code> <span class="allocation-description svelte-h9my3f"> </span></div> <div class="allocation-status svelte-h9my3f"><!></div></div> <!></div>`);
var root_7 = $.from_html(`<div class="allocated-subnet svelte-h9my3f"><code class="subnet-cidr svelte-h9my3f"> </code> <span class="subnet-desc svelte-h9my3f"> </span></div>`);
var root_8 = $.from_html(`<div class="pool-allocations svelte-h9my3f"><h5 class="svelte-h9my3f">Allocated Subnets</h5> <div class="allocated-list svelte-h9my3f"></div></div>`);
var root_9 = $.from_html(`<div class="remaining-block svelte-h9my3f"><code class="remaining-size svelte-h9my3f"> </code> <span class="remaining-range svelte-h9my3f"> </span></div>`);
var root_10 = $.from_html(`<div class="remaining-more svelte-h9my3f"> </div>`);
var root_11 = $.from_html(`<div class="pool-remaining svelte-h9my3f"><h5 class="svelte-h9my3f">Available Space</h5> <div class="remaining-list svelte-h9my3f"><!> <!></div></div>`);
var root_12 = $.from_html(`<div class="pool-card svelte-h9my3f"><div class="pool-header svelte-h9my3f"><code class="pool-cidr svelte-h9my3f"> </code> <div class="pool-stats"><span> </span></div></div> <div class="utilization-bar svelte-h9my3f"><div class="utilization-fill svelte-h9my3f"></div></div> <!> <!></div>`);
var root_13 = $.from_html(`<div class="allocation-summary svelte-h9my3f"><div class="summary-header svelte-h9my3f"><h3 class="svelte-h9my3f">Allocation Results</h3> <!></div> <div class="summary-grid svelte-h9my3f"><div class="summary-card success svelte-h9my3f"><div class="summary-icon svelte-h9my3f"><!></div> <div class="summary-content svelte-h9my3f"><div class="summary-number svelte-h9my3f"> </div> <div class="summary-label svelte-h9my3f">Allocated</div></div></div> <div class="summary-card error svelte-h9my3f"><div class="summary-icon svelte-h9my3f"><!></div> <div class="summary-content svelte-h9my3f"><div class="summary-number svelte-h9my3f"> </div> <div class="summary-label svelte-h9my3f">Failed</div></div></div> <div class="summary-card info svelte-h9my3f"><div class="summary-icon svelte-h9my3f"><!></div> <div class="summary-content svelte-h9my3f"><div class="summary-number svelte-h9my3f"> </div> <div class="summary-label svelte-h9my3f">Efficiency</div></div></div></div> <div class="space-breakdown svelte-h9my3f"><div class="breakdown-item svelte-h9my3f"><span class="breakdown-label svelte-h9my3f">Total Pool Space:</span> <span class="breakdown-value svelte-h9my3f"> </span></div> <div class="breakdown-item svelte-h9my3f"><span class="breakdown-label svelte-h9my3f">Allocated:</span> <span class="breakdown-value allocated svelte-h9my3f"> </span></div> <div class="breakdown-item svelte-h9my3f"><span class="breakdown-label svelte-h9my3f">Remaining:</span> <span class="breakdown-value svelte-h9my3f"> </span></div></div></div> <div class="allocations-section svelte-h9my3f"><h4 class="svelte-h9my3f">Subnet Allocations</h4> <div class="allocations-list svelte-h9my3f"></div></div> <div class="pools-section svelte-h9my3f"><h4 class="svelte-h9my3f">Pool Utilization</h4> <div class="pools-grid svelte-h9my3f"></div></div>`, 1);
var root_14 = $.from_html(`<div class="error-message svelte-h9my3f"><!> <h4 class="svelte-h9my3f">Allocation Error</h4> <p> </p></div>`);
var root_15 = $.from_html(`<section class="results-section svelte-h9my3f"><!></section>`);

var root_16 = $.from_html(`<div class="card svelte-h9my3f"><header class="card-header svelte-h9my3f"><h2 class="svelte-h9my3f">CIDR Allocator</h2> <p class="svelte-h9my3f">Pack requested subnet sizes into pools using intelligent bin-packing algorithms</p></header> <div class="card examples-card svelte-h9my3f"><details class="examples-details"><summary class="examples-summary"><!> <h4>Quick Examples</h4></summary> <div class="examples-grid"></div></details></div> <section class="algorithm-section svelte-h9my3f"><h4 class="svelte-h9my3f">Allocation Algorithm</h4> <div class="algorithm-options svelte-h9my3f"><label class="algorithm-option svelte-h9my3f"><input type="radio" class="svelte-h9my3f"/> <div class="option-content svelte-h9my3f"><div class="option-title svelte-h9my3f"><!> First-Fit</div> <div class="option-description svelte-h9my3f">Fast allocation - uses the first available block that fits (good for speed)</div></div></label> <label class="algorithm-option svelte-h9my3f"><input type="radio" class="svelte-h9my3f"/> <div class="option-content svelte-h9my3f"><div class="option-title svelte-h9my3f"><!> Best-Fit</div> <div class="option-description svelte-h9my3f">Optimal packing - uses the smallest available block that fits (reduces fragmentation)</div></div></label></div></section> <section class="input-section svelte-h9my3f"><div class="input-grid svelte-h9my3f"><div class="input-group svelte-h9my3f"><label for="pools" class="svelte-h9my3f"><!> Available Pools</label> <textarea id="pools" placeholder="192.168.0.0/16
10.0.0.0/20" rows="6" required="" class="svelte-h9my3f"></textarea></div> <div class="input-group svelte-h9my3f"><label for="requests" class="svelte-h9my3f"><!> Subnet Requests</label> <textarea id="requests" placeholder="/24 - Main Office
/26 - Servers
/28 - Management" rows="6" required="" class="svelte-h9my3f"></textarea></div></div></section> <!></div>`);

export default function CIDRAllocator($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];

	let pools = $.state(`192.168.0.0/16
10.0.0.0/20`);

	let requests = $.state(`/24 - Office Network
/25 - Guest WiFi
/26 - Servers
/27 - Management
/28 - DMZ`);

	let algorithm = $.state('best-fit');
	let result = $.state(null);
	const clipboard = useClipboard();
	let _selectedExample = $.state(null);
	let selectedExampleIndex = $.state(null);
	let _userModified = $.state(false);

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
		$.set(pools, example.pools, true);
		$.set(requests, example.requests, true);
		$.set(algorithm, example.algorithm, true);
		$.set(_selectedExample, example.label, true);
		$.set(selectedExampleIndex, index, true);
		$.set(_userModified, false);
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

		if ($.get(algorithm) === 'best-fit') {
			// Best-fit: smallest block that fits
			return viableBlocks.reduce((best, current) => current.size < best.size ? current : best);
		} else {
			// First-fit: first block that fits
			return viableBlocks[0];
		}
	}

	function performAllocation() {
		try {
			if (!$.get(pools).trim() || !$.get(requests).trim()) {
				$.set(result, null);

				return;
			}

			const poolLines = $.get(pools).trim().split('\n').filter((line) => line.trim());
			const requestList = parseRequests($.get(requests));

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

			$.set(
				result,
				{
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
				},
				true
			);
		} catch(error) {
			$.set(
				result,
				{
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
				},
				true
			);
		}
	}

	function handleInputChange() {
		$.set(_userModified, true);
		$.set(_selectedExample, null);
		$.set(selectedExampleIndex, null);
		performAllocation();
	}

	async function copyAllAllocations() {
		if (!$.get(result)?.allocations) return;

		const successful = $.get(result).allocations.filter((a) => a.allocated);

		if (successful.length === 0) return;

		const text = successful.map((a) => `${a.cidr} - ${a.description}`).join('\n');

		await clipboard.copy(text, 'all-allocations');
	}

	// Calculate on component load
	performAllocation();

	var div = root_16();
	var div_1 = $.sibling($.child(div), 2);
	var details = $.child(div_1);
	var summary = $.child(details);
	var node = $.child(summary);

	Icon(node, { name: 'chevron-right', size: 'xs' });
	$.next(2);
	$.reset(summary);

	var div_2 = $.sibling(summary, 2);

	$.each(div_2, 23, () => examples, (example) => example.label, ($$anchor, example, i) => {
		var button = root();
		let classes;
		var div_3 = $.child(button);
		var text_1 = $.only_child(div_3, true);
		var div_4 = $.sibling(div_3, 2);
		var text_2 = $.only_child(div_4);

		$.reset(button);

		$.template_effect(() => {
			classes = $.set_class(button, 1, 'example-card', null, classes, { selected: $.get(selectedExampleIndex) === $.get(i) });
			$.set_text(text_1, $.get(example).label);
			$.set_text(text_2, `Algorithm: ${$.get(example).algorithm ?? ''}`);
		});

		$.delegated('click', button, () => loadExample($.get(example), $.get(i)));
		$.append($$anchor, button);
	});

	$.reset(div_2);
	$.reset(details);
	$.reset(div_1);

	var section = $.sibling(div_1, 2);
	var h4 = $.child(section);

	$.action(h4, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Choose between first-fit (faster) and best-fit (more efficient packing) algorithms');

	var div_5 = $.sibling(h4, 2);
	var label = $.child(div_5);
	var input_1 = $.child(label);

	$.remove_input_defaults(input_1);
	input_1.value = input_1.__value = 'first-fit';

	var div_6 = $.sibling(input_1, 2);
	var div_7 = $.child(div_6);
	var node_1 = $.child(div_7);

	Icon(node_1, { name: 'zap', size: 'sm' });
	$.next();
	$.reset(div_7);
	$.next(2);
	$.reset(div_6);
	$.reset(label);

	var label_1 = $.sibling(label, 2);
	var input_2 = $.child(label_1);

	$.remove_input_defaults(input_2);
	input_2.value = input_2.__value = 'best-fit';

	var div_8 = $.sibling(input_2, 2);
	var div_9 = $.child(div_8);
	var node_2 = $.child(div_9);

	Icon(node_2, { name: 'target', size: 'sm' });
	$.next();
	$.reset(div_9);
	$.next(2);
	$.reset(div_8);
	$.reset(label_1);
	$.reset(div_5);
	$.reset(section);

	var section_1 = $.sibling(section, 2);
	var div_10 = $.child(section_1);
	var div_11 = $.child(div_10);
	var label_2 = $.child(div_11);
	var node_3 = $.child(label_2);

	Icon(node_3, { name: 'database', size: 'sm' });
	$.next();
	$.reset(label_2);
	$.action(label_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Available network pools - one CIDR block per line');

	var textarea = $.sibling(label_2, 2);

	$.remove_textarea_child(textarea);
	$.reset(div_11);

	var div_12 = $.sibling(div_11, 2);
	var label_3 = $.child(div_12);
	var node_4 = $.child(label_3);

	Icon(node_4, { name: 'list-check', size: 'sm' });
	$.next();
	$.reset(label_3);
	$.action(label_3, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => "Subnet requests in format '/24 - Description' - one per line");

	var textarea_1 = $.sibling(label_3, 2);

	$.remove_textarea_child(textarea_1);
	$.reset(div_12);
	$.reset(div_10);
	$.reset(section_1);

	var node_5 = $.sibling(section_1, 2);

	{
		var consequent_8 = ($$anchor) => {
			var section_2 = root_15();
			var node_6 = $.child(section_2);

			{
				var consequent_7 = ($$anchor) => {
					var fragment = root_13();
					var div_13 = $.first_child(fragment);
					var div_14 = $.child(div_13);
					var h3 = $.child(div_14);

					$.action(h3, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Summary of subnet allocation requests and pool utilization');

					var node_7 = $.sibling(h3, 2);

					{
						var consequent = ($$anchor) => {
							var button_1 = root_1();
							var node_8 = $.child(button_1);

							{
								let $0 = $.derived(() => clipboard.isCopied('all-allocations') ? 'check' : 'copy');

								Icon(node_8, {
									get name() {
										return $.get($0);
									},
									size: 'sm'
								});
							}

							var text_3 = $.sibling(node_8);

							$.reset(button_1);

							$.template_effect(
								($0, $1) => {
									$.set_class(button_1, 1, `copy-all-button ${$0 ?? ''}`, 'svelte-h9my3f');
									$.set_text(text_3, ` ${$1 ?? ''}`);
								},
								[
									() => clipboard.isCopied('all-allocations') ? 'copied' : '',
									() => clipboard.isCopied('all-allocations') ? 'Copied!' : 'Copy All'
								]
							);

							$.delegated('click', button_1, copyAllAllocations);
							$.append($$anchor, button_1);
						};

						$.if(node_7, ($$render) => {
							if ($.get(result).summary.successfulAllocations > 0) $$render(consequent);
						});
					}

					$.reset(div_14);

					var div_15 = $.sibling(div_14, 2);
					var div_16 = $.child(div_15);
					var div_17 = $.child(div_16);
					var node_9 = $.child(div_17);

					Icon(node_9, { name: 'check-circle' });
					$.reset(div_17);

					var div_18 = $.sibling(div_17, 2);
					var div_19 = $.child(div_18);
					var text_4 = $.only_child(div_19, true);

					$.next(2);
					$.reset(div_18);
					$.reset(div_16);

					var div_20 = $.sibling(div_16, 2);
					var div_21 = $.child(div_20);
					var node_10 = $.child(div_21);

					{
						let $0 = $.derived(() => $.get(result).summary.failedAllocations > 0 ? 'x-circle' : 'check-circle');

						Icon(node_10, {
							get name() {
								return $.get($0);
							}
						});
					}

					$.reset(div_21);

					var div_22 = $.sibling(div_21, 2);
					var div_23 = $.child(div_22);
					var text_5 = $.only_child(div_23, true);

					$.next(2);
					$.reset(div_22);
					$.reset(div_20);

					var div_24 = $.sibling(div_20, 2);
					var div_25 = $.child(div_24);
					var node_11 = $.child(div_25);

					Icon(node_11, { name: 'pie-chart' });
					$.reset(div_25);

					var div_26 = $.sibling(div_25, 2);
					var div_27 = $.child(div_26);
					var text_6 = $.only_child(div_27);

					$.next(2);
					$.reset(div_26);
					$.reset(div_24);
					$.reset(div_15);

					var div_28 = $.sibling(div_15, 2);
					var div_29 = $.child(div_28);
					var span = $.sibling($.child(div_29), 2);
					var text_7 = $.only_child(span);

					$.reset(div_29);

					var div_30 = $.sibling(div_29, 2);
					var span_1 = $.sibling($.child(div_30), 2);
					var text_8 = $.only_child(span_1);

					$.reset(div_30);

					var div_31 = $.sibling(div_30, 2);
					var span_2 = $.sibling($.child(div_31), 2);
					var text_9 = $.only_child(span_2);

					$.reset(div_31);
					$.reset(div_28);
					$.reset(div_13);

					var div_32 = $.sibling(div_13, 2);
					var h4_1 = $.child(div_32);

					$.action(h4_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Individual subnet allocation results with assigned CIDR blocks');

					var div_33 = $.sibling(h4_1, 2);

					$.each(div_33, 21, () => $.get(result).allocations, (allocation) => allocation.request, ($$anchor, allocation) => {
						var div_34 = root_6();
						var div_35 = $.child(div_34);
						var div_36 = $.child(div_35);
						var code = $.child(div_36);
						var text_10 = $.only_child(code, true);
						var span_3 = $.sibling(code, 2);
						var text_11 = $.only_child(span_3, true);

						$.reset(div_36);

						var div_37 = $.sibling(div_36, 2);
						var node_12 = $.child(div_37);

						{
							var consequent_1 = ($$anchor) => {
								var fragment_1 = root_2();
								var node_13 = $.first_child(fragment_1);

								Icon(node_13, { name: 'check-circle', size: 'sm' });
								$.next(2);
								$.append($$anchor, fragment_1);
							};

							var alternate = ($$anchor) => {
								var fragment_2 = root_3();
								var node_14 = $.first_child(fragment_2);

								Icon(node_14, { name: 'x-circle', size: 'sm' });
								$.next(2);
								$.append($$anchor, fragment_2);
							};

							$.if(node_12, ($$render) => {
								if ($.get(allocation).allocated) $$render(consequent_1); else $$render(alternate, -1);
							});
						}

						$.reset(div_37);
						$.reset(div_35);

						var node_15 = $.sibling(div_35, 2);

						{
							var consequent_2 = ($$anchor) => {
								var div_38 = root_4();
								var div_39 = $.child(div_38);
								var code_1 = $.child(div_39);
								var text_12 = $.only_child(code_1, true);
								var span_4 = $.sibling(code_1, 2);
								var text_13 = $.only_child(span_4);
								var span_5 = $.sibling(span_4, 2);
								var text_14 = $.only_child(span_5);

								$.reset(div_39);

								var button_2 = $.sibling(div_39, 2);
								var node_16 = $.child(button_2);

								{
									let $0 = $.derived(() => clipboard.isCopied(`alloc-${$.get(allocation).cidr}`) ? 'check' : 'copy');

									Icon(node_16, {
										get name() {
											return $.get($0);
										},
										size: 'xs'
									});
								}

								$.reset(button_2);
								$.reset(div_38);

								$.template_effect(
									($0, $1) => {
										$.set_text(text_12, $.get(allocation).cidr);
										$.set_text(text_13, `in ${$.get(allocation).pool ?? ''}`);
										$.set_text(text_14, `(${$0 ?? ''} addresses)`);
										$.set_class(button_2, 1, `copy-button ${$1 ?? ''}`, 'svelte-h9my3f');
									},
									[
										() => formatNumber($.get(allocation).size),
										() => clipboard.isCopied(`alloc-${$.get(allocation).cidr}`) ? 'copied' : ''
									]
								);

								$.delegated('click', button_2, () => clipboard.copy($.get(allocation).cidr || '', `alloc-${$.get(allocation).cidr}`));
								$.append($$anchor, div_38);
							};

							var consequent_3 = ($$anchor) => {
								var div_40 = root_5();
								var node_17 = $.child(div_40);

								Icon(node_17, { name: 'alert-triangle', size: 'xs' });

								var text_15 = $.sibling(node_17);

								$.reset(div_40);
								$.template_effect(() => $.set_text(text_15, ` ${$.get(allocation).reason ?? ''}`));
								$.append($$anchor, div_40);
							};

							$.if(node_15, ($$render) => {
								if ($.get(allocation).allocated && $.get(allocation).cidr) $$render(consequent_2); else if ($.get(allocation).reason) $$render(consequent_3, 1);
							});
						}

						$.reset(div_34);

						$.template_effect(() => {
							$.set_class(div_34, 1, `allocation-item ${$.get(allocation).allocated ? 'success' : 'failed'}`, 'svelte-h9my3f');
							$.set_text(text_10, $.get(allocation).request);
							$.set_text(text_11, $.get(allocation).description);
						});

						$.append($$anchor, div_34);
					});

					$.reset(div_33);
					$.reset(div_32);

					var div_41 = $.sibling(div_32, 2);
					var h4_2 = $.child(div_41);

					$.action(h4_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Detailed breakdown of how address space was used in each pool');

					var div_42 = $.sibling(h4_2, 2);

					$.each(div_42, 21, () => $.get(result).pools, (pool) => pool.original, ($$anchor, pool) => {
						var div_43 = root_12();
						var div_44 = $.child(div_43);
						var code_2 = $.child(div_44);
						var text_16 = $.only_child(code_2, true);
						var div_45 = $.sibling(code_2, 2);
						var span_6 = $.child(div_45);
						let classes_1;
						var text_17 = $.only_child(span_6);

						$.reset(div_45);
						$.reset(div_44);

						var div_46 = $.sibling(div_44, 2);
						var div_47 = $.only_child(div_46);
						var node_18 = $.sibling(div_46, 2);

						{
							var consequent_4 = ($$anchor) => {
								var div_48 = root_8();
								var div_49 = $.sibling($.child(div_48), 2);

								$.each(div_49, 21, () => $.get(pool).allocated, (subnet) => subnet.cidr, ($$anchor, subnet) => {
									var div_50 = root_7();
									var code_3 = $.child(div_50);
									var text_18 = $.only_child(code_3, true);
									var span_7 = $.sibling(code_3, 2);
									var text_19 = $.only_child(span_7, true);

									$.reset(div_50);

									$.template_effect(() => {
										$.set_text(text_18, $.get(subnet).cidr);
										$.set_text(text_19, $.get(subnet).description);
									});

									$.append($$anchor, div_50);
								});

								$.reset(div_49);
								$.reset(div_48);
								$.append($$anchor, div_48);
							};

							$.if(node_18, ($$render) => {
								if ($.get(pool).allocated.length > 0) $$render(consequent_4);
							});
						}

						var node_19 = $.sibling(node_18, 2);

						{
							var consequent_6 = ($$anchor) => {
								var div_51 = root_11();
								var div_52 = $.sibling($.child(div_51), 2);
								var node_20 = $.child(div_52);

								$.each(node_20, 17, () => $.get(pool).remaining.slice(0, 5), (remaining) => remaining.cidr, ($$anchor, remaining) => {
									var div_53 = root_9();
									var code_4 = $.child(div_53);
									var text_20 = $.only_child(code_4);
									var span_8 = $.sibling(code_4, 2);
									var text_21 = $.only_child(span_8);

									$.reset(div_53);

									$.template_effect(
										($0, $1, $2) => {
											$.set_text(text_20, `${$0 ?? ''} addresses`);
											$.set_text(text_21, `${$1 ?? ''} - ${$2 ?? ''}`);
										},
										[
											() => formatNumber($.get(remaining).size),
											() => ipToString($.get(remaining).start),
											() => ipToString($.get(remaining).start + $.get(remaining).size - 1)
										]
									);

									$.append($$anchor, div_53);
								});

								var node_21 = $.sibling(node_20, 2);

								{
									var consequent_5 = ($$anchor) => {
										var div_54 = root_10();
										var text_22 = $.only_child(div_54);

										$.template_effect(() => $.set_text(text_22, `+${$.get(pool).remaining.length - 5} more blocks`));
										$.append($$anchor, div_54);
									};

									$.if(node_21, ($$render) => {
										if ($.get(pool).remaining.length > 5) $$render(consequent_5);
									});
								}

								$.reset(div_52);
								$.reset(div_51);
								$.append($$anchor, div_51);
							};

							$.if(node_19, ($$render) => {
								if ($.get(pool).remaining.length > 0) $$render(consequent_6);
							});
						}

						$.reset(div_43);

						$.template_effect(
							($0) => {
								$.set_text(text_16, $.get(pool).original);

								classes_1 = $.set_class(span_6, 1, 'pool-utilization svelte-h9my3f', null, classes_1, {
									high: $.get(pool).utilization >= 80,
									medium: $.get(pool).utilization >= 50 && $.get(pool).utilization < 80,
									low: $.get(pool).utilization < 50
								});

								$.set_text(text_17, `${$0 ?? ''}% used`);
								$.set_style(div_47, `width: ${$.get(pool).utilization ?? ''}%`);
							},
							[() => $.get(pool).utilization.toFixed(1)]
						);

						$.append($$anchor, div_43);
					});

					$.reset(div_42);
					$.reset(div_41);

					$.template_effect(
						($0, $1, $2, $3) => {
							$.set_text(text_4, $.get(result).summary.successfulAllocations);
							$.set_text(text_5, $.get(result).summary.failedAllocations);
							$.set_text(text_6, `${$0 ?? ''}%`);
							$.set_text(text_7, `${$1 ?? ''} addresses`);
							$.set_text(text_8, `${$2 ?? ''} addresses`);
							$.set_text(text_9, `${$3 ?? ''} addresses`);
						},
						[
							() => $.get(result).summary.efficiency.toFixed(1),
							() => formatNumber($.get(result).summary.totalPoolSpace),
							() => formatNumber($.get(result).summary.allocatedSpace),
							() => formatNumber($.get(result).summary.totalPoolSpace - $.get(result).summary.allocatedSpace)
						]
					);

					$.append($$anchor, fragment);
				};

				var alternate_1 = ($$anchor) => {
					var div_55 = root_14();
					var node_22 = $.child(div_55);

					Icon(node_22, { name: 'alert-triangle' });

					var p = $.sibling(node_22, 4);
					var text_23 = $.only_child(p, true);

					$.reset(div_55);
					$.template_effect(() => $.set_text(text_23, $.get(result).error || 'Unknown error occurred'));
					$.append($$anchor, div_55);
				};

				$.if(node_6, ($$render) => {
					if ($.get(result).success) $$render(consequent_7); else $$render(alternate_1, -1);
				});
			}

			$.reset(section_2);
			$.append($$anchor, section_2);
		};

		$.if(node_5, ($$render) => {
			if ($.get(result)) $$render(consequent_8);
		});
	}

	$.reset(div);
	$.delegated('change', input_1, handleInputChange);
	$.bind_group(binding_group, [], input_1, () => $.get(algorithm), ($$value) => $.set(algorithm, $$value));
	$.delegated('change', input_2, handleInputChange);
	$.bind_group(binding_group, [], input_2, () => $.get(algorithm), ($$value) => $.set(algorithm, $$value));
	$.delegated('input', textarea, handleInputChange);
	$.bind_value(textarea, () => $.get(pools), ($$value) => $.set(pools, $$value));
	$.delegated('input', textarea_1, handleInputChange);
	$.bind_value(textarea_1, () => $.get(requests), ($$value) => $.set(requests, $$value));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'change', 'input']);