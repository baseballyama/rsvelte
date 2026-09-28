import * as $ from 'svelte/internal/server';
import { calculateVLSM, generateSubnetId, validateSubnetRequirement } from '$lib/utils/vlsm-calculations.js';
import { validateIPv4 } from '$lib/utils/ip-validation.js';
import IPInput from './IPInput.svelte';
import Tooltip from '$lib/components/global/Tooltip.svelte';
import Icon from '$lib/components/global/Icon.svelte';
import ToolContentContainer from '$lib/components/global/ToolContentContainer.svelte';
import { useClipboard } from '$lib/composables';
import { tooltip } from '$lib/actions/tooltip.js';
import { SvelteSet } from 'svelte/reactivity';
import { formatNumber } from '$lib/utils/formatters';

export default function VLSMCalculator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let networkIP = '192.168.1.0';
		let cidr = 24;
		let subnets = [];
		let vlsmResult = null;
		const clipboard = useClipboard();
		let expandedSubnets = new SvelteSet();

		// Add initial subnet requirement
		/**
		 * Add a new subnet requirement
		 */
		function addSubnet() {
			subnets.push({
				id: generateSubnetId(),
				name: `Subnet ${subnets.length + 1}`,
				hostsNeeded: 50,
				description: ''
			});
		}

		/**
		 * Remove a subnet requirement
		 */
		function removeSubnet(id) {
			subnets = subnets.filter((subnet) => subnet.id !== id);

			if (subnets.length === 0) {
				vlsmResult = null;
			}
		}

		/**
		 * Update subnet requirement
		 */
		function updateSubnet(id, field, value) {
			const index = subnets.findIndex((s) => s.id === id);

			if (index !== -1) {
				subnets[index] = { ...subnets[index], [field]: value };
			}
		}

		/**
		 * Calculate VLSM subnets
		 */
		function calculateSubnets() {
			const ipValidation = validateIPv4(networkIP);

			if (!ipValidation.valid) {
				vlsmResult = {
					success: false,
					subnets: [],
					error: ipValidation.error,
					originalNetwork: networkIP,
					originalCIDR: cidr,
					totalHostsRequested: 0,
					totalHostsProvided: 0,
					totalWastedHosts: 0,
					remainingAddresses: 0
				};

				return;
			}

			// Validate all subnet requirements
			for (const subnet of subnets) {
				const validation = validateSubnetRequirement(subnet);

				if (!validation.valid) {
					vlsmResult = {
						success: false,
						subnets: [],
						error: `${subnet.name}: ${validation.error}`,
						originalNetwork: networkIP,
						originalCIDR: cidr,
						totalHostsRequested: 0,
						totalHostsProvided: 0,
						totalWastedHosts: 0,
						remainingAddresses: 0
					};

					return;
				}
			}

			vlsmResult = calculateVLSM(networkIP, cidr, subnets);
		}

		/**
		 * Toggle subnet details expansion
		 */
		function toggleSubnetExpansion(subnetId) {
			if (expandedSubnets.has(subnetId)) {
				expandedSubnets.delete(subnetId);
			} else {
				expandedSubnets.add(subnetId);
			}
		}

		/**
		 * Copy text to clipboard
		 */
		/**
		 * Get efficiency color based on waste percentage
		 */
		function getEfficiencyColor(wastedHosts, providedHosts) {
			const wastePercentage = wastedHosts / providedHosts * 100;

			if (wastePercentage < 25) return 'var(--color-success)';
			if (wastePercentage < 50) return 'var(--color-warning)';

			return 'var(--color-danger)';
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			ToolContentContainer($$renderer, {
				title: 'VLSM Calculator',
				description: 'Design efficient subnets with Variable Length Subnet Masking for optimal address space utilization.',
				children: ($$renderer) => {
					$$renderer.push(`<div class="network-config svelte-b2a9wu"><h3>Network Configuration</h3> <div class="grid grid-2"><div class="form-group">`);

					IPInput($$renderer, {
						label: 'Network Address',
						placeholder: '192.168.1.0',
						get value() {
							return networkIP;
						},

						set value($$value) {
							networkIP = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----></div> <div class="form-group"><label for="cidr-input">CIDR Notation</label> <div class="cidr-input svelte-b2a9wu"><span class="cidr-prefix svelte-b2a9wu">/${$.escape(cidr)}</span> <input id="cidr-input" type="range" min="8" max="30"${$.attr('value', cidr)} class="cidr-slider svelte-b2a9wu"/> <input type="number" min="8" max="30"${$.attr('value', cidr)} class="cidr-number svelte-b2a9wu"/></div></div></div></div> <div class="subnet-requirements svelte-b2a9wu"><div class="requirements-header svelte-b2a9wu"><h3>Subnet Requirements</h3> <button type="button" class="btn btn-primary svelte-b2a9wu">`);
					Icon($$renderer, { name: 'plus', size: 'sm' });
					$$renderer.push(`<!----> Add Subnet</button></div> <div class="requirements-list svelte-b2a9wu"><!--[-->`);

					const each_array = $.ensure_array_like(subnets);

					for (let index = 0, $$length = each_array.length; index < $$length; index++) {
						let subnet = each_array[index];

						$$renderer.push(`<div class="requirement-item svelte-b2a9wu"><div class="requirement-header svelte-b2a9wu"><span class="requirement-number svelte-b2a9wu">${$.escape(index + 1)}</span> <div class="requirement-inputs svelte-b2a9wu"><input type="text" placeholder="Subnet name"${$.attr('value', subnet.name)} class="subnet-name-input svelte-b2a9wu"/> <div class="hosts-input svelte-b2a9wu"><label${$.attr('for', `hosts-${$.stringify(index)}`)} class="svelte-b2a9wu">Hosts needed:</label> <input${$.attr('id', `hosts-${$.stringify(index)}`)} type="number" min="1" max="16777214"${$.attr('value', subnet.hostsNeeded)} class="hosts-number-input svelte-b2a9wu"/></div></div> <button type="button" class="btn btn-danger-ghost svelte-b2a9wu"${$.attr('disabled', subnets.length === 1, true)}>`);
						Icon($$renderer, { name: 'trash', size: 'sm' });
						$$renderer.push(`<!----></button></div> <div class="requirement-description svelte-b2a9wu"><input type="text" placeholder="Description (optional)"${$.attr('value', subnet.description)} class="description-input svelte-b2a9wu"/></div></div>`);
					}

					$$renderer.push(`<!--]--></div></div> `);

					if (vlsmResult) {
						$$renderer.push(`<!--[0--><div class="results-section svelte-b2a9wu">`);

						if (vlsmResult.success) {
							$$renderer.push(`<!--[0--><div class="info-panel success"><h3>VLSM Calculation Results</h3> <div class="summary-stats svelte-b2a9wu"><div class="stat-item svelte-b2a9wu"><span class="stat-label svelte-b2a9wu">Total Subnets</span> <span class="stat-value svelte-b2a9wu">${$.escape(vlsmResult.subnets.length)}</span></div> <div class="stat-item svelte-b2a9wu"><span class="stat-label svelte-b2a9wu">Hosts Requested</span> <span class="stat-value svelte-b2a9wu">${$.escape(formatNumber(vlsmResult.totalHostsRequested))}</span></div> <div class="stat-item svelte-b2a9wu"><span class="stat-label svelte-b2a9wu">Hosts Provided</span> <span class="stat-value svelte-b2a9wu">${$.escape(formatNumber(vlsmResult.totalHostsProvided))}</span></div> <div class="stat-item svelte-b2a9wu"><span class="stat-label svelte-b2a9wu">Wasted Hosts</span> <span class="stat-value danger svelte-b2a9wu">${$.escape(formatNumber(vlsmResult.totalWastedHosts))}</span></div> <div class="stat-item svelte-b2a9wu"><span class="stat-label svelte-b2a9wu">Efficiency</span> <span class="stat-value svelte-b2a9wu"${$.attr_style(`color: ${$.stringify(getEfficiencyColor(vlsmResult.totalWastedHosts, vlsmResult.totalHostsProvided))}`)}>${$.escape(((1 - vlsmResult.totalWastedHosts / vlsmResult.totalHostsProvided) * 100).toFixed(1))}%</span></div> <div class="stat-item svelte-b2a9wu"><span class="stat-label svelte-b2a9wu">Remaining Addresses</span> <span class="stat-value svelte-b2a9wu">${$.escape(formatNumber(vlsmResult.remainingAddresses))}</span></div></div></div> <div class="subnets-table-container svelte-b2a9wu"><h3>Calculated Subnets</h3> <div class="subnets-table svelte-b2a9wu"><div class="table-header svelte-b2a9wu"><div class="col-name svelte-b2a9wu">Subnet</div> <div class="col-network svelte-b2a9wu">Network</div> <div class="col-hosts svelte-b2a9wu">Hosts</div> <div class="col-mask svelte-b2a9wu">Mask</div> <div class="col-efficiency svelte-b2a9wu">Efficiency</div> <div class="col-actions svelte-b2a9wu">Actions</div></div> <!--[-->`);

							const each_array_1 = $.ensure_array_like(vlsmResult.subnets);

							for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
								let subnet = each_array_1[$$index_1];

								$$renderer.push(`<div class="table-row svelte-b2a9wu"><div class="col-name svelte-b2a9wu"><div class="subnet-name svelte-b2a9wu">${$.escape(subnet.name)}</div> `);

								if (subnet.description) {
									$$renderer.push(`<!--[0--><div class="subnet-description svelte-b2a9wu">${$.escape(subnet.description)}</div>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--></div> <div class="col-network svelte-b2a9wu"><div class="network-info"><div class="network-address svelte-b2a9wu">${$.escape(subnet.networkAddress)}/${$.escape(subnet.cidr)}</div> <div class="address-range svelte-b2a9wu">${$.escape(subnet.firstUsableHost)} - ${$.escape(subnet.lastUsableHost)}</div></div></div> <div class="col-hosts svelte-b2a9wu"><div class="hosts-info"><div class="hosts-needed svelte-b2a9wu">${$.escape(subnet.hostsNeeded)} needed</div> <div class="hosts-provided svelte-b2a9wu">${$.escape(subnet.hostsProvided)} provided</div> `);

								if (subnet.wastedHosts > 0) {
									$$renderer.push(`<!--[0--><div class="hosts-wasted svelte-b2a9wu">${$.escape(subnet.wastedHosts)} wasted</div>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--></div></div> <div class="col-mask svelte-b2a9wu"><div class="mask-info"><div class="subnet-mask svelte-b2a9wu">${$.escape(subnet.subnetMask)}</div> <div class="wildcard-mask svelte-b2a9wu">${$.escape(subnet.wildcardMask)}</div></div></div> <div class="col-efficiency svelte-b2a9wu"><div class="efficiency-indicator svelte-b2a9wu"${$.attr_style(`color: ${$.stringify(getEfficiencyColor(subnet.wastedHosts, subnet.hostsProvided))}`)}>${$.escape(((1 - subnet.wastedHosts / subnet.hostsProvided) * 100).toFixed(1))}%</div></div> <div class="col-actions svelte-b2a9wu"><button type="button"${$.attr_class(`btn btn-ghost primary-ghost ${expandedSubnets.has(subnet.id) ? 'expanded' : ''}`, 'svelte-b2a9wu')}>`);
								Icon($$renderer, { name: 'chevron-down', size: 'sm' });
								$$renderer.push(`<!----></button> `);

								Tooltip($$renderer, {
									text: 'Copy network info',
									position: 'left',
									children: ($$renderer) => {
										$$renderer.push(`<button type="button"${$.attr_class(`btn btn-ghost ${clipboard.isCopied(`copy-${subnet.id}`) ? 'copied' : ''}`, 'svelte-b2a9wu')}>`);

										Icon($$renderer, {
											name: clipboard.isCopied(`copy-${subnet.id}`) ? 'tick' : 'copy',
											size: 'sm'
										});

										$$renderer.push(`<!----></button>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----></div></div> `);

								if (expandedSubnets.has(subnet.id)) {
									$$renderer.push(`<!--[0--><div class="subnet-details svelte-b2a9wu"><div class="details-grid svelte-b2a9wu"><div class="detail-item svelte-b2a9wu"><span class="detail-label svelte-b2a9wu">Network Address</span> <code class="detail-value svelte-b2a9wu">${$.escape(subnet.networkAddress)}</code></div> <div class="detail-item svelte-b2a9wu"><span class="detail-label svelte-b2a9wu">Broadcast Address</span> <code class="detail-value svelte-b2a9wu">${$.escape(subnet.broadcastAddress)}</code></div> <div class="detail-item svelte-b2a9wu"><span class="detail-label svelte-b2a9wu">First Usable Host</span> <code class="detail-value svelte-b2a9wu">${$.escape(subnet.firstUsableHost)}</code></div> <div class="detail-item svelte-b2a9wu"><span class="detail-label svelte-b2a9wu">Last Usable Host</span> <code class="detail-value svelte-b2a9wu">${$.escape(subnet.lastUsableHost)}</code></div> <div class="detail-item svelte-b2a9wu"><span class="detail-label svelte-b2a9wu">Subnet Mask</span> <code class="detail-value svelte-b2a9wu">${$.escape(subnet.subnetMask)}</code></div> <div class="detail-item svelte-b2a9wu"><span class="detail-label svelte-b2a9wu">Wildcard Mask</span> <code class="detail-value svelte-b2a9wu">${$.escape(subnet.wildcardMask)}</code></div> <div class="detail-item svelte-b2a9wu"><span class="detail-label svelte-b2a9wu">Binary Mask</span> <code class="detail-value binary-mask svelte-b2a9wu">${$.escape(subnet.binaryMask)}</code></div> <div class="detail-item svelte-b2a9wu"><span class="detail-label svelte-b2a9wu">Host Bits</span> <code class="detail-value svelte-b2a9wu">${$.escape(subnet.actualHostBits)} bits</code></div></div></div>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]-->`);
							}

							$$renderer.push(`<!--]--></div></div> `);

							if (vlsmResult.nextAvailableNetwork) {
								$$renderer.push(`<!--[0--><div class="info-panel info"><h4>Next Available Network</h4> <p>The next available network address for additional subnets: <code>${$.escape(vlsmResult.nextAvailableNetwork)}</code></p></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						} else {
							$$renderer.push(`<!--[-1--><div class="info-panel error"><h3>Calculation Error</h3> <p class="error-message svelte-b2a9wu">${$.escape(vlsmResult.error)}</p></div>`);
						}

						$$renderer.push(`<!--]--></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
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