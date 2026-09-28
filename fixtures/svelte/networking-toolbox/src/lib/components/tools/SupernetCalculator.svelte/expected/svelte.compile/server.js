import * as $ from 'svelte/internal/server';
import { calculateSupernet, generateNetworkId, analyzeAggregation } from '$lib/utils/supernet-calculations.js';
import IPInput from './IPInput.svelte';
import Icon from '$lib/components/global/Icon.svelte';
import ToolContentContainer from '$lib/components/global/ToolContentContainer.svelte';
import { tooltip } from '$lib/actions/tooltip.js';
import { useClipboard } from '$lib/composables';
import { formatNumber } from '$lib/utils/formatters';

export default function SupernetCalculator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let networks = [];
		let supernetResult = null;
		const clipboard = useClipboard();
		let showVisualization = false;
		let selectedExample = null;
		let _userModified = false;

		// Add initial network
		/* Add a new network input */
		function addNetwork() {
			networks.push({
				id: generateNetworkId(),
				network: '',
				cidr: 24,
				description: ''
			});
		}

		/* Remove a network input */
		function removeNetwork(id) {
			networks = networks.filter((net) => net.id !== id);

			if (networks.length === 0) {
				supernetResult = null;
			}
		}

		/* Update network input */
		function _updateNetwork(id, field, value) {
			const index = networks.findIndex((n) => n.id === id);

			if (index !== -1) {
				networks[index] = { ...networks[index], [field]: value };
				_userModified = true;
				selectedExample = null;
			}
		}

		/* Calculate supernet - now handled by reactive effect */
		const examples = [
			{
				label: 'Contiguous Networks',
				type: 'contiguous',
				description: 'Adjacent subnets that aggregate efficiently',
				networks: [
					{
						id: generateNetworkId(),
						network: '192.168.0.0',
						cidr: 25,
						description: 'Sales Department'
					},

					{
						id: generateNetworkId(),
						network: '192.168.0.128',
						cidr: 25,
						description: 'Marketing Department'
					},

					{
						id: generateNetworkId(),
						network: '192.168.1.0',
						cidr: 25,
						description: 'Engineering Department'
					},

					{
						id: generateNetworkId(),
						network: '192.168.1.128',
						cidr: 25,
						description: 'HR Department'
					}
				]
			},

			{
				label: 'Home Network',
				type: 'home',
				description: 'Typical residential setup with multiple VLANs',
				networks: [
					{
						id: generateNetworkId(),
						network: '192.168.1.0',
						cidr: 26,
						description: 'Main LAN'
					},

					{
						id: generateNetworkId(),
						network: '192.168.1.64',
						cidr: 27,
						description: 'Guest Network'
					},

					{
						id: generateNetworkId(),
						network: '192.168.1.96',
						cidr: 28,
						description: 'IoT Devices'
					},

					{
						id: generateNetworkId(),
						network: '192.168.1.112',
						cidr: 28,
						description: 'Security Cameras'
					}
				]
			},

			{
				label: 'Homelab Setup',
				type: 'homelab',
				description: 'Self-hosted services and virtualization lab',
				networks: [
					{
						id: generateNetworkId(),
						network: '10.10.10.0',
						cidr: 26,
						description: 'Proxmox VMs'
					},

					{
						id: generateNetworkId(),
						network: '10.10.10.64',
						cidr: 27,
						description: 'Docker Containers'
					},

					{
						id: generateNetworkId(),
						network: '10.10.10.96',
						cidr: 28,
						description: 'Kubernetes Cluster'
					},

					{
						id: generateNetworkId(),
						network: '10.10.10.112',
						cidr: 28,
						description: 'Storage/NAS'
					}
				]
			},

			{
				label: 'Data Center Networks',
				type: 'datacenter',
				description: 'Well-planned contiguous allocation for servers',
				networks: [
					{
						id: generateNetworkId(),
						network: '10.0.0.0',
						cidr: 26,
						description: 'Web Servers'
					},

					{
						id: generateNetworkId(),
						network: '10.0.0.64',
						cidr: 26,
						description: 'Database Servers'
					},

					{
						id: generateNetworkId(),
						network: '10.0.0.128',
						cidr: 26,
						description: 'Application Servers'
					},

					{
						id: generateNetworkId(),
						network: '10.0.0.192',
						cidr: 26,
						description: 'Management Network'
					}
				]
			},

			{
				label: 'Campus Network',
				type: 'campus',
				description: 'University or enterprise campus subnets',
				networks: [
					{
						id: generateNetworkId(),
						network: '172.16.0.0',
						cidr: 24,
						description: 'Building A - Admin'
					},

					{
						id: generateNetworkId(),
						network: '172.16.1.0',
						cidr: 24,
						description: 'Building B - Students'
					},

					{
						id: generateNetworkId(),
						network: '172.16.2.0',
						cidr: 24,
						description: 'Building C - Faculty'
					},

					{
						id: generateNetworkId(),
						network: '172.16.3.0',
						cidr: 24,
						description: 'Library & Labs'
					}
				]
			},

			{
				label: 'Scattered Networks',
				type: 'scattered',
				description: 'Non-adjacent networks with limited aggregation',
				networks: [
					{
						id: generateNetworkId(),
						network: '10.1.0.0',
						cidr: 24,
						description: 'Branch Office A'
					},

					{
						id: generateNetworkId(),
						network: '10.3.0.0',
						cidr: 24,
						description: 'Branch Office B'
					},

					{
						id: generateNetworkId(),
						network: '10.5.0.0',
						cidr: 24,
						description: 'Branch Office C'
					}
				]
			}
		];

		/* Add preset example networks */
		function loadExample(example) {
			networks = example.networks.map((net) => ({ ...net, id: generateNetworkId() }));
			selectedExample = example.label;
			_userModified = false;
		}

		/* Get efficiency color based on aggregation analysis */
		function getEfficiencyColor(efficiency) {
			if (efficiency >= 75) return 'var(--color-success)';
			if (efficiency >= 50) return 'var(--color-warning)';

			return 'var(--color-error)';
		}

		// Aggregation analysis - reactive
		let aggregationAnalysis = analyzeAggregation([]);

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			ToolContentContainer($$renderer, {
				title: 'Supernet Calculator',
				description: 'Aggregate multiple networks into a single supernet for route summarization and efficient routing table management.',
				contentClass: 'supernet-calc-car',
				children: ($$renderer) => {
					$$renderer.push(`<div class="card examples-card svelte-1cjcuvu"><details class="examples-details svelte-1cjcuvu"><summary class="examples-summary svelte-1cjcuvu">`);
					Icon($$renderer, { name: 'chevron-right', size: 'sm' });
					$$renderer.push(`<!----> <h3 class="svelte-1cjcuvu">Quick Examples</h3></summary> <div class="examples-grid svelte-1cjcuvu"><!--[-->`);

					const each_array = $.ensure_array_like(examples);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let example = each_array[$$index];

						$$renderer.push(`<button${$.attr_class(`example-card ${selectedExample === example.label ? 'active' : ''}`, 'svelte-1cjcuvu')}><div class="example-header svelte-1cjcuvu"><div class="example-label svelte-1cjcuvu">${$.escape(example.label)}</div> <div${$.attr_class(`example-type ${$.stringify(example.type)}`, 'svelte-1cjcuvu')}>${$.escape(example.networks.length)} Networks</div></div> <code class="example-input svelte-1cjcuvu">${$.escape(example.networks[0].network)}/${$.escape(example.networks[0].cidr)} + ${$.escape(example.networks.length - 1)} more</code> <div class="example-description svelte-1cjcuvu">${$.escape(example.description)}</div></button>`);
					}

					$$renderer.push(`<!--]--></div></details></div> <div class="network-inputs svelte-1cjcuvu"><div class="inputs-header svelte-1cjcuvu"><h3 class="svelte-1cjcuvu">Input Networks</h3> <button type="button" class="btn btn-primary svelte-1cjcuvu">`);
					Icon($$renderer, { name: 'plus', size: 'sm' });
					$$renderer.push(`<!----> Add Network</button></div> <div class="inputs-list svelte-1cjcuvu"><!--[-->`);

					const each_array_1 = $.ensure_array_like(networks);

					for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
						let network = each_array_1[index];

						$$renderer.push(`<div class="network-item svelte-1cjcuvu"><div class="network-header svelte-1cjcuvu"><span class="network-number svelte-1cjcuvu">${$.escape(index + 1)}</span> <div class="network-inputs-row svelte-1cjcuvu"><div class="network-input svelte-1cjcuvu">`);

						IPInput($$renderer, {
							placeholder: '192.168.1.0',
							get value() {
								return network.network;
							},

							set value($$value) {
								network.network = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----></div> <div class="cidr-input svelte-1cjcuvu"><label${$.attr('for', `cidr-${$.stringify(index)}`)} class="svelte-1cjcuvu">CIDR</label> <div class="cidr-controls svelte-1cjcuvu"><span class="cidr-display svelte-1cjcuvu">/${$.escape(network.cidr)}</span> <input${$.attr('id', `cidr-${$.stringify(index)}`)} type="range" min="8" max="30"${$.attr('value', network.cidr)} class="cidr-slider svelte-1cjcuvu"/> <input type="number" min="8" max="30"${$.attr('value', network.cidr)} class="cidr-number svelte-1cjcuvu"/></div></div></div> <button type="button" class="btn btn-danger-ghost svelte-1cjcuvu"${$.attr('disabled', networks.length <= 1, true)}>`);
						Icon($$renderer, { name: 'trash', size: 'sm' });
						$$renderer.push(`<!----></button></div> <div class="network-description svelte-1cjcuvu"><input type="text" placeholder="Description (optional)"${$.attr('value', network.description)} class="description-input svelte-1cjcuvu"/></div></div>`);
					}

					$$renderer.push(`<!--]--></div></div> `);

					if (aggregationAnalysis && networks.filter((n) => n.network.trim()).length > 1) {
						$$renderer.push(`<!--[0--><div class="analysis-section svelte-1cjcuvu"><h3 class="svelte-1cjcuvu">Aggregation Analysis</h3> <div class="analysis-card svelte-1cjcuvu"><div class="analysis-header svelte-1cjcuvu"><div class="analysis-stat svelte-1cjcuvu"><span class="stat-label svelte-1cjcuvu">Aggregation Efficiency</span> <span class="stat-value svelte-1cjcuvu"${$.attr_style(`color: ${$.stringify(getEfficiencyColor(aggregationAnalysis.efficiency))}`)}>${$.escape(aggregationAnalysis.efficiency.toFixed(1))}%</span></div> <div${$.attr_class('analysis-status svelte-1cjcuvu', void 0, { 'can-aggregate': aggregationAnalysis.canAggregate })}>`);

						Icon($$renderer, {
							name: aggregationAnalysis.canAggregate ? 'check-circle' : 'alert-triangle',
							size: 'sm'
						});

						$$renderer.push(`<!----> ${$.escape(aggregationAnalysis.canAggregate ? 'Can Aggregate' : 'Limited Aggregation')}</div></div> `);

						if (aggregationAnalysis.recommendations.length > 0) {
							$$renderer.push(`<!--[0--><div class="recommendations svelte-1cjcuvu"><h4 class="svelte-1cjcuvu">Recommendations</h4> <ul class="svelte-1cjcuvu"><!--[-->`);

							const each_array_2 = $.ensure_array_like(aggregationAnalysis.recommendations);

							for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
								let recommendation = each_array_2[index];

								$$renderer.push(`<li class="svelte-1cjcuvu">${$.escape(recommendation)}</li>`);
							}

							$$renderer.push(`<!--]--></ul></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (supernetResult) {
						$$renderer.push(`<!--[0--><div class="results-section svelte-1cjcuvu">`);

						if (supernetResult.success && supernetResult.supernet) {
							$$renderer.push(`<!--[0--><div class="info-panel success svelte-1cjcuvu"><h3 class="svelte-1cjcuvu">Supernet Summary</h3> <div class="summary-grid svelte-1cjcuvu"><div class="summary-item svelte-1cjcuvu"><span class="summary-label svelte-1cjcuvu">Supernet Address</span> <div class="value-copy svelte-1cjcuvu"><span class="ip-value success svelte-1cjcuvu">${$.escape(supernetResult.supernet.network)}/${$.escape(supernetResult.supernet.cidr)}</span> <button${$.attr_class('btn btn-icon copy-btn svelte-1cjcuvu', void 0, { 'copied': clipboard.isCopied('supernet') })}>`);

							Icon($$renderer, {
								name: clipboard.isCopied('supernet') ? 'check' : 'copy',
								size: 'sm'
							});

							$$renderer.push(`<!----></button></div></div> <div class="summary-item svelte-1cjcuvu"><span class="summary-label svelte-1cjcuvu">Total Hosts</span> <span class="summary-value svelte-1cjcuvu">${$.escape(formatNumber(supernetResult.supernet.totalHosts))}</span></div></div></div> `);

							if (supernetResult.savingsAnalysis) {
								$$renderer.push(`<!--[0--><div class="info-panel info svelte-1cjcuvu"><h3 class="svelte-1cjcuvu">Route Aggregation Benefits</h3> <div class="savings-grid svelte-1cjcuvu"><div class="savings-item svelte-1cjcuvu"><span class="savings-label svelte-1cjcuvu">Original Routes</span> <span class="savings-value svelte-1cjcuvu">${$.escape(supernetResult.savingsAnalysis.originalRoutes)}</span></div> <div class="savings-item svelte-1cjcuvu"><span class="savings-label svelte-1cjcuvu">Aggregated Routes</span> <span class="savings-value success svelte-1cjcuvu">${$.escape(supernetResult.savingsAnalysis.aggregatedRoutes)}</span></div> <div class="savings-item svelte-1cjcuvu"><span class="savings-label svelte-1cjcuvu">Routes Saved</span> <span class="savings-value success svelte-1cjcuvu">${$.escape(supernetResult.savingsAnalysis.routeReduction)}</span></div> <div class="savings-item svelte-1cjcuvu"><span class="savings-label svelte-1cjcuvu">Reduction</span> <span class="savings-value success svelte-1cjcuvu">${$.escape(supernetResult.savingsAnalysis.reductionPercentage.toFixed(1))}%</span></div></div></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> <div class="details-section svelte-1cjcuvu"><div class="details-header svelte-1cjcuvu"><h3 class="svelte-1cjcuvu">Supernet Details</h3></div> <div class="details-grid svelte-1cjcuvu"><div class="detail-item svelte-1cjcuvu"><div class="detail-label-wrapper svelte-1cjcuvu"><span class="detail-label svelte-1cjcuvu">Network Address</span></div> <div class="value-copy svelte-1cjcuvu"><code class="detail-value svelte-1cjcuvu">${$.escape(supernetResult.supernet.network)}</code> <button${$.attr_class('btn btn-icon copy-btn svelte-1cjcuvu', void 0, { 'copied': clipboard.isCopied('network') })}>`);

							Icon($$renderer, {
								name: clipboard.isCopied('network') ? 'check' : 'copy',
								size: 'sm'
							});

							$$renderer.push(`<!----></button></div></div> <div class="detail-item svelte-1cjcuvu"><div class="detail-label-wrapper svelte-1cjcuvu"><span class="detail-label svelte-1cjcuvu">Subnet Mask</span></div> <div class="value-copy svelte-1cjcuvu"><code class="detail-value svelte-1cjcuvu">${$.escape(supernetResult.supernet.subnetMask)}</code> <button${$.attr_class('btn btn-icon copy-btn svelte-1cjcuvu', void 0, { 'copied': clipboard.isCopied('mask') })}>`);

							Icon($$renderer, {
								name: clipboard.isCopied('mask') ? 'check' : 'copy',
								size: 'sm'
							});

							$$renderer.push(`<!----></button></div></div> <div class="detail-item svelte-1cjcuvu"><div class="detail-label-wrapper svelte-1cjcuvu"><span class="detail-label svelte-1cjcuvu">Wildcard Mask</span></div> <div class="value-copy svelte-1cjcuvu"><code class="detail-value svelte-1cjcuvu">${$.escape(supernetResult.supernet.wildcardMask)}</code> <button${$.attr_class('btn btn-icon copy-btn svelte-1cjcuvu', void 0, { 'copied': clipboard.isCopied('wildcard') })}>`);

							Icon($$renderer, {
								name: clipboard.isCopied('wildcard') ? 'check' : 'copy',
								size: 'sm'
							});

							$$renderer.push(`<!----></button></div></div> <div class="detail-item svelte-1cjcuvu"><div class="detail-label-wrapper svelte-1cjcuvu"><span class="detail-label svelte-1cjcuvu">Address Range</span></div> <div class="value-copy svelte-1cjcuvu"><code class="detail-value svelte-1cjcuvu">${$.escape(supernetResult.supernet.addressRange.first)} - ${$.escape(supernetResult.supernet.addressRange.last)}</code> <button${$.attr_class('btn btn-icon copy-btn svelte-1cjcuvu', void 0, { 'copied': clipboard.isCopied('range') })}>`);

							Icon($$renderer, {
								name: clipboard.isCopied('range') ? 'check' : 'copy',
								size: 'sm'
							});

							$$renderer.push(`<!----></button></div></div> <div class="detail-item full-width svelte-1cjcuvu"><div class="detail-label-wrapper svelte-1cjcuvu"><span class="detail-label svelte-1cjcuvu">Binary Subnet Mask</span></div> <div class="value-copy svelte-1cjcuvu"><code class="detail-value binary-mask svelte-1cjcuvu">${$.escape(supernetResult.supernet.binaryMask)}</code> <button${$.attr_class('btn btn-icon copy-btn svelte-1cjcuvu', void 0, { 'copied': clipboard.isCopied('binary') })}>`);

							Icon($$renderer, {
								name: clipboard.isCopied('binary') ? 'check' : 'copy',
								size: 'sm'
							});

							$$renderer.push(`<!----></button></div></div></div></div> `);

							if (showVisualization) {
								$$renderer.push(`<!--[0--><div class="visualization-section svelte-1cjcuvu"><h3 class="svelte-1cjcuvu">Network Visualization</h3> <div class="visualization-card svelte-1cjcuvu"><div class="visualization-header svelte-1cjcuvu"><h4 class="svelte-1cjcuvu">Input Networks vs Supernet</h4> <p class="svelte-1cjcuvu">Visual representation of how individual networks are aggregated into a supernet</p></div> <div class="network-diagram svelte-1cjcuvu"><div class="input-networks svelte-1cjcuvu"><h5 class="svelte-1cjcuvu">Input Networks</h5> <!--[-->`);

								const each_array_3 = $.ensure_array_like(supernetResult.inputNetworks);

								for (let index = 0, $$length = each_array_3.length; index < $$length; index++) {
									let network = each_array_3[index];

									$$renderer.push(`<div class="network-visual svelte-1cjcuvu"><div class="network-bar svelte-1cjcuvu"${$.attr_style(`--network-index: ${$.stringify(index)}`)}><span class="network-label svelte-1cjcuvu">${$.escape(network.network)}/${$.escape(network.cidr)}</span> `);

									if (network.description) {
										$$renderer.push(`<!--[0--><span class="network-desc svelte-1cjcuvu">${$.escape(network.description)}</span>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--></div></div>`);
								}

								$$renderer.push(`<!--]--></div> <div class="aggregation-arrow svelte-1cjcuvu">`);
								Icon($$renderer, { name: 'arrow-down', size: 'lg' });
								$$renderer.push(`<!----> <span class="svelte-1cjcuvu">Aggregates to</span></div> <div class="supernet-visual svelte-1cjcuvu"><h5 class="svelte-1cjcuvu">Supernet</h5> <div class="supernet-bar svelte-1cjcuvu"><span class="supernet-label svelte-1cjcuvu">${$.escape(supernetResult.supernet.network)}/${$.escape(supernetResult.supernet.cidr)}</span> <span class="supernet-hosts svelte-1cjcuvu">${$.escape(formatNumber(supernetResult.supernet.totalHosts))} hosts</span></div></div></div></div></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						} else {
							$$renderer.push(`<!--[-1--><div class="info-panel error svelte-1cjcuvu"><h3 class="svelte-1cjcuvu">Calculation Error</h3> <p class="error-message svelte-1cjcuvu">${$.escape(supernetResult.error)}</p></div>`);
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