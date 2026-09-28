import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { calculateSupernet, generateNetworkId, analyzeAggregation } from '$lib/utils/supernet-calculations.js';
import IPInput from './IPInput.svelte';
import Icon from '$lib/components/global/Icon.svelte';
import ToolContentContainer from '$lib/components/global/ToolContentContainer.svelte';
import { tooltip } from '$lib/actions/tooltip.js';
import { useClipboard } from '$lib/composables';
import { formatNumber } from '$lib/utils/formatters';

var root = $.from_html(`<button><div class="example-header svelte-1cjcuvu"><div class="example-label svelte-1cjcuvu"> </div> <div> </div></div> <code class="example-input svelte-1cjcuvu"> </code> <div class="example-description svelte-1cjcuvu"> </div></button>`);
var root_1 = $.from_html(`<div class="network-item svelte-1cjcuvu"><div class="network-header svelte-1cjcuvu"><span class="network-number svelte-1cjcuvu"> </span> <div class="network-inputs-row svelte-1cjcuvu"><div class="network-input svelte-1cjcuvu"><!></div> <div class="cidr-input svelte-1cjcuvu"><label class="svelte-1cjcuvu">CIDR</label> <div class="cidr-controls svelte-1cjcuvu"><span class="cidr-display svelte-1cjcuvu"> </span> <input type="range" min="8" max="30" class="cidr-slider svelte-1cjcuvu"/> <input type="number" min="8" max="30" class="cidr-number svelte-1cjcuvu"/></div></div></div> <button type="button" class="btn btn-danger-ghost svelte-1cjcuvu"><!></button></div> <div class="network-description svelte-1cjcuvu"><input type="text" placeholder="Description (optional)" class="description-input svelte-1cjcuvu"/></div></div>`);
var root_2 = $.from_html(`<li class="svelte-1cjcuvu"> </li>`);
var root_3 = $.from_html(`<div class="recommendations svelte-1cjcuvu"><h4 class="svelte-1cjcuvu">Recommendations</h4> <ul class="svelte-1cjcuvu"></ul></div>`);
var root_4 = $.from_html(`<div class="analysis-section svelte-1cjcuvu"><h3 class="svelte-1cjcuvu">Aggregation Analysis</h3> <div class="analysis-card svelte-1cjcuvu"><div class="analysis-header svelte-1cjcuvu"><div class="analysis-stat svelte-1cjcuvu"><span class="stat-label svelte-1cjcuvu">Aggregation Efficiency</span> <span class="stat-value svelte-1cjcuvu"> </span></div> <div><!> </div></div> <!></div></div>`);
var root_5 = $.from_html(`<div class="info-panel info svelte-1cjcuvu"><h3 class="svelte-1cjcuvu">Route Aggregation Benefits</h3> <div class="savings-grid svelte-1cjcuvu"><div class="savings-item svelte-1cjcuvu"><span class="savings-label svelte-1cjcuvu">Original Routes</span> <span class="savings-value svelte-1cjcuvu"> </span></div> <div class="savings-item svelte-1cjcuvu"><span class="savings-label svelte-1cjcuvu">Aggregated Routes</span> <span class="savings-value success svelte-1cjcuvu"> </span></div> <div class="savings-item svelte-1cjcuvu"><span class="savings-label svelte-1cjcuvu">Routes Saved</span> <span class="savings-value success svelte-1cjcuvu"> </span></div> <div class="savings-item svelte-1cjcuvu"><span class="savings-label svelte-1cjcuvu">Reduction</span> <span class="savings-value success svelte-1cjcuvu"> </span></div></div></div>`);
var root_6 = $.from_html(`<span class="network-desc svelte-1cjcuvu"> </span>`);
var root_7 = $.from_html(`<div class="network-visual svelte-1cjcuvu"><div class="network-bar svelte-1cjcuvu"><span class="network-label svelte-1cjcuvu"> </span> <!></div></div>`);
var root_8 = $.from_html(`<div class="visualization-section svelte-1cjcuvu"><h3 class="svelte-1cjcuvu">Network Visualization</h3> <div class="visualization-card svelte-1cjcuvu"><div class="visualization-header svelte-1cjcuvu"><h4 class="svelte-1cjcuvu">Input Networks vs Supernet</h4> <p class="svelte-1cjcuvu">Visual representation of how individual networks are aggregated into a supernet</p></div> <div class="network-diagram svelte-1cjcuvu"><div class="input-networks svelte-1cjcuvu"><h5 class="svelte-1cjcuvu">Input Networks</h5> <!></div> <div class="aggregation-arrow svelte-1cjcuvu"><!> <span class="svelte-1cjcuvu">Aggregates to</span></div> <div class="supernet-visual svelte-1cjcuvu"><h5 class="svelte-1cjcuvu">Supernet</h5> <div class="supernet-bar svelte-1cjcuvu"><span class="supernet-label svelte-1cjcuvu"> </span> <span class="supernet-hosts svelte-1cjcuvu"> </span></div></div></div></div></div>`);
var root_9 = $.from_html(`<div class="info-panel success svelte-1cjcuvu"><h3 class="svelte-1cjcuvu">Supernet Summary</h3> <div class="summary-grid svelte-1cjcuvu"><div class="summary-item svelte-1cjcuvu"><span class="summary-label svelte-1cjcuvu">Supernet Address</span> <div class="value-copy svelte-1cjcuvu"><span class="ip-value success svelte-1cjcuvu"> </span> <button><!></button></div></div> <div class="summary-item svelte-1cjcuvu"><span class="summary-label svelte-1cjcuvu">Total Hosts</span> <span class="summary-value svelte-1cjcuvu"> </span></div></div></div> <!> <div class="details-section svelte-1cjcuvu"><div class="details-header svelte-1cjcuvu"><h3 class="svelte-1cjcuvu">Supernet Details</h3></div> <div class="details-grid svelte-1cjcuvu"><div class="detail-item svelte-1cjcuvu"><div class="detail-label-wrapper svelte-1cjcuvu"><span class="detail-label svelte-1cjcuvu">Network Address</span></div> <div class="value-copy svelte-1cjcuvu"><code class="detail-value svelte-1cjcuvu"> </code> <button><!></button></div></div> <div class="detail-item svelte-1cjcuvu"><div class="detail-label-wrapper svelte-1cjcuvu"><span class="detail-label svelte-1cjcuvu">Subnet Mask</span></div> <div class="value-copy svelte-1cjcuvu"><code class="detail-value svelte-1cjcuvu"> </code> <button><!></button></div></div> <div class="detail-item svelte-1cjcuvu"><div class="detail-label-wrapper svelte-1cjcuvu"><span class="detail-label svelte-1cjcuvu">Wildcard Mask</span></div> <div class="value-copy svelte-1cjcuvu"><code class="detail-value svelte-1cjcuvu"> </code> <button><!></button></div></div> <div class="detail-item svelte-1cjcuvu"><div class="detail-label-wrapper svelte-1cjcuvu"><span class="detail-label svelte-1cjcuvu">Address Range</span></div> <div class="value-copy svelte-1cjcuvu"><code class="detail-value svelte-1cjcuvu"> </code> <button><!></button></div></div> <div class="detail-item full-width svelte-1cjcuvu"><div class="detail-label-wrapper svelte-1cjcuvu"><span class="detail-label svelte-1cjcuvu">Binary Subnet Mask</span></div> <div class="value-copy svelte-1cjcuvu"><code class="detail-value binary-mask svelte-1cjcuvu"> </code> <button><!></button></div></div></div></div> <!>`, 1);
var root_10 = $.from_html(`<div class="info-panel error svelte-1cjcuvu"><h3 class="svelte-1cjcuvu">Calculation Error</h3> <p class="error-message svelte-1cjcuvu"> </p></div>`);
var root_11 = $.from_html(`<div class="results-section svelte-1cjcuvu"><!></div>`);
var root_12 = $.from_html(`<div class="card examples-card svelte-1cjcuvu"><details class="examples-details svelte-1cjcuvu"><summary class="examples-summary svelte-1cjcuvu"><!> <h3 class="svelte-1cjcuvu">Quick Examples</h3></summary> <div class="examples-grid svelte-1cjcuvu"></div></details></div> <div class="network-inputs svelte-1cjcuvu"><div class="inputs-header svelte-1cjcuvu"><h3 class="svelte-1cjcuvu">Input Networks</h3> <button type="button" class="btn btn-primary svelte-1cjcuvu"><!> Add Network</button></div> <div class="inputs-list svelte-1cjcuvu"></div></div> <!> <!>`, 1);

export default function SupernetCalculator($$anchor, $$props) {
	$.push($$props, true);

	let networks = $.state($.proxy([]));
	let supernetResult = $.state(null);
	const clipboard = useClipboard();
	let showVisualization = $.state(false);
	let selectedExample = $.state(null);
	let _userModified = $.state(false);

	// Add initial network
	$.user_effect(() => {
		if ($.get(networks).length === 0) {
			addNetwork();
			addNetwork();
		}
	});

	/* Add a new network input */
	function addNetwork() {
		$.get(networks).push({
			id: generateNetworkId(),
			network: '',
			cidr: 24,
			description: ''
		});
	}

	/* Remove a network input */
	function removeNetwork(id) {
		$.set(networks, $.get(networks).filter((net) => net.id !== id), true);

		if ($.get(networks).length === 0) {
			$.set(supernetResult, null);
		}
	}

	/* Update network input */
	function _updateNetwork(id, field, value) {
		const index = $.get(networks).findIndex((n) => n.id === id);

		if (index !== -1) {
			$.get(networks)[index] = { ...$.get(networks)[index], [field]: value };
			$.set(_userModified, true);
			$.set(selectedExample, null);
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
		$.set(networks, example.networks.map((net) => ({ ...net, id: generateNetworkId() })), true);
		$.set(selectedExample, example.label, true);
		$.set(_userModified, false);
	}

	/* Get efficiency color based on aggregation analysis */
	function getEfficiencyColor(efficiency) {
		if (efficiency >= 75) return 'var(--color-success)';
		if (efficiency >= 50) return 'var(--color-warning)';

		return 'var(--color-error)';
	}

	// Aggregation analysis - reactive
	let aggregationAnalysis = $.state($.proxy(analyzeAggregation([])));

	// Single reactive effect for all calculations
	$.user_effect(() => {
		const validNetworks = $.get(networks).filter((net) => net.network.trim() !== '');

		// Update aggregation analysis
		$.set(aggregationAnalysis, analyzeAggregation(validNetworks), true);

		// Calculate supernet if we have networks
		if (validNetworks.length > 0) {
			const result = calculateSupernet(validNetworks);

			$.set(supernetResult, result, true);

			if (result.success) {
				$.set(showVisualization, true);
			}
		} else {
			$.set(supernetResult, null);
			$.set(showVisualization, false);
		}
	});

	ToolContentContainer($$anchor, {
		title: 'Supernet Calculator',
		description: 'Aggregate multiple networks into a single supernet for route summarization and efficient routing table management.',
		contentClass: 'supernet-calc-car',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_12();
			var div = $.first_child(fragment_1);
			var details = $.child(div);
			var summary = $.child(details);
			var node = $.child(summary);

			Icon(node, { name: 'chevron-right', size: 'sm' });
			$.next(2);
			$.reset(summary);

			var div_1 = $.sibling(summary, 2);

			$.each(div_1, 21, () => examples, (example) => example.label, ($$anchor, example) => {
				var button = root();
				var div_2 = $.child(button);
				var div_3 = $.child(div_2);
				var text = $.only_child(div_3, true);
				var div_4 = $.sibling(div_3, 2);
				var text_1 = $.only_child(div_4);

				$.reset(div_2);

				var code = $.sibling(div_2, 2);
				var text_2 = $.only_child(code);
				var div_5 = $.sibling(code, 2);
				var text_3 = $.only_child(div_5, true);

				$.reset(button);

				$.template_effect(() => {
					$.set_class(button, 1, `example-card ${$.get(selectedExample) === $.get(example).label ? 'active' : ''}`, 'svelte-1cjcuvu');
					$.set_text(text, $.get(example).label);
					$.set_class(div_4, 1, `example-type ${$.get(example).type ?? ''}`, 'svelte-1cjcuvu');
					$.set_text(text_1, `${$.get(example).networks.length ?? ''} Networks`);
					$.set_text(text_2, `${$.get(example).networks[0].network ?? ''}/${$.get(example).networks[0].cidr ?? ''} + ${$.get(example).networks.length - 1} more`);
					$.set_text(text_3, $.get(example).description);
				});

				$.delegated('click', button, () => loadExample($.get(example)));
				$.append($$anchor, button);
			});

			$.reset(div_1);
			$.reset(details);
			$.reset(div);

			var div_6 = $.sibling(div, 2);
			var div_7 = $.child(div_6);
			var button_1 = $.sibling($.child(div_7), 2);
			var node_1 = $.child(button_1);

			Icon(node_1, { name: 'plus', size: 'sm' });
			$.next();
			$.reset(button_1);
			$.reset(div_7);

			var div_8 = $.sibling(div_7, 2);

			$.each(div_8, 23, () => $.get(networks), (network) => network.id, ($$anchor, network, index) => {
				var div_9 = root_1();
				var div_10 = $.child(div_9);
				var span = $.child(div_10);
				var text_4 = $.only_child(span, true);
				var div_11 = $.sibling(span, 2);
				var div_12 = $.child(div_11);
				var node_2 = $.child(div_12);

				IPInput(node_2, {
					placeholder: '192.168.1.0',
					get value() {
						return $.get(network).network;
					},

					set value($$value) {
						($.get(network).network = $$value);
					}
				});

				$.reset(div_12);

				var div_13 = $.sibling(div_12, 2);
				var label = $.child(div_13);
				var div_14 = $.sibling(label, 2);
				var span_1 = $.child(div_14);
				var text_5 = $.only_child(span_1);
				var input = $.sibling(span_1, 2);

				$.remove_input_defaults(input);

				var input_1 = $.sibling(input, 2);

				$.remove_input_defaults(input_1);
				$.reset(div_14);
				$.reset(div_13);
				$.reset(div_11);

				var button_2 = $.sibling(div_11, 2);
				var node_3 = $.child(button_2);

				Icon(node_3, { name: 'trash', size: 'sm' });
				$.reset(button_2);
				$.reset(div_10);

				var div_15 = $.sibling(div_10, 2);
				var input_2 = $.child(div_15);

				$.remove_input_defaults(input_2);
				$.reset(div_15);
				$.reset(div_9);

				$.template_effect(() => {
					$.set_text(text_4, $.get(index) + 1);
					$.set_attribute(label, 'for', `cidr-${$.get(index) ?? ''}`);
					$.set_text(text_5, `/${$.get(network).cidr ?? ''}`);
					$.set_attribute(input, 'id', `cidr-${$.get(index) ?? ''}`);
					button_2.disabled = $.get(networks).length <= 1;
				});

				$.bind_value(input, () => $.get(network).cidr, ($$value) => ($.get(network).cidr = $$value));
				$.bind_value(input_1, () => $.get(network).cidr, ($$value) => ($.get(network).cidr = $$value));
				$.delegated('click', button_2, () => removeNetwork($.get(network).id));
				$.bind_value(input_2, () => $.get(network).description, ($$value) => ($.get(network).description = $$value));
				$.append($$anchor, div_9);
			});

			$.reset(div_8);
			$.reset(div_6);

			var node_4 = $.sibling(div_6, 2);

			{
				var consequent_1 = ($$anchor) => {
					var div_16 = root_4();
					var div_17 = $.sibling($.child(div_16), 2);
					var div_18 = $.child(div_17);
					var div_19 = $.child(div_18);
					var span_2 = $.child(div_19);

					$.action(span_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'How efficiently the networks can be aggregated - higher is better');

					var span_3 = $.sibling(span_2, 2);
					var text_6 = $.only_child(span_3);

					$.reset(div_19);

					var div_20 = $.sibling(div_19, 2);
					let classes;
					var node_5 = $.child(div_20);

					{
						let $0 = $.derived(() => $.get(aggregationAnalysis).canAggregate ? 'check-circle' : 'alert-triangle');

						Icon(node_5, {
							get name() {
								return $.get($0);
							},
							size: 'sm'
						});
					}

					var text_7 = $.sibling(node_5);

					$.reset(div_20);
					$.reset(div_18);

					var node_6 = $.sibling(div_18, 2);

					{
						var consequent = ($$anchor) => {
							var div_21 = root_3();
							var ul = $.sibling($.child(div_21), 2);

							$.each(ul, 21, () => $.get(aggregationAnalysis).recommendations, $.index, ($$anchor, recommendation) => {
								var li = root_2();
								var text_8 = $.only_child(li, true);

								$.template_effect(() => $.set_text(text_8, $.get(recommendation)));
								$.append($$anchor, li);
							});

							$.reset(ul);
							$.reset(div_21);
							$.append($$anchor, div_21);
						};

						$.if(node_6, ($$render) => {
							if ($.get(aggregationAnalysis).recommendations.length > 0) $$render(consequent);
						});
					}

					$.reset(div_17);
					$.reset(div_16);

					$.template_effect(
						($0, $1) => {
							$.set_style(span_3, `color: ${$0 ?? ''}`);
							$.set_text(text_6, `${$1 ?? ''}%`);
							classes = $.set_class(div_20, 1, 'analysis-status svelte-1cjcuvu', null, classes, { 'can-aggregate': $.get(aggregationAnalysis).canAggregate });
							$.set_text(text_7, ` ${$.get(aggregationAnalysis).canAggregate ? 'Can Aggregate' : 'Limited Aggregation'}`);
						},
						[
							() => getEfficiencyColor($.get(aggregationAnalysis).efficiency),
							() => $.get(aggregationAnalysis).efficiency.toFixed(1)
						]
					);

					$.append($$anchor, div_16);
				};

				var d = $.derived(() => $.get(aggregationAnalysis) && $.get(networks).filter((n) => n.network.trim()).length > 1);

				$.if(node_4, ($$render) => {
					if ($.get(d)) $$render(consequent_1);
				});
			}

			var node_7 = $.sibling(node_4, 2);

			{
				var consequent_6 = ($$anchor) => {
					var div_22 = root_11();
					var node_8 = $.child(div_22);

					{
						var consequent_5 = ($$anchor) => {
							var fragment_2 = root_9();
							var div_23 = $.first_child(fragment_2);
							var div_24 = $.sibling($.child(div_23), 2);
							var div_25 = $.child(div_24);
							var span_4 = $.child(div_25);

							$.action(span_4, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'The aggregated network address that encompasses all input networks');

							var div_26 = $.sibling(span_4, 2);
							var span_5 = $.child(div_26);
							var text_9 = $.only_child(span_5);
							var button_3 = $.sibling(span_5, 2);
							let classes_1;
							var node_9 = $.child(button_3);

							{
								let $0 = $.derived(() => clipboard.isCopied('supernet') ? 'check' : 'copy');

								Icon(node_9, {
									get name() {
										return $.get($0);
									},
									size: 'sm'
								});
							}

							$.reset(button_3);
							$.reset(div_26);
							$.reset(div_25);

							var div_27 = $.sibling(div_25, 2);
							var span_6 = $.child(div_27);

							$.action(span_6, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Total number of host addresses available in the supernet');

							var span_7 = $.sibling(span_6, 2);
							var text_10 = $.only_child(span_7, true);

							$.reset(div_27);
							$.reset(div_24);
							$.reset(div_23);

							var node_10 = $.sibling(div_23, 2);

							{
								var consequent_2 = ($$anchor) => {
									var div_28 = root_5();
									var div_29 = $.sibling($.child(div_28), 2);
									var div_30 = $.child(div_29);
									var span_8 = $.child(div_30);

									$.action(span_8, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Number of individual routes before aggregation');

									var span_9 = $.sibling(span_8, 2);
									var text_11 = $.only_child(span_9, true);

									$.reset(div_30);

									var div_31 = $.sibling(div_30, 2);
									var span_10 = $.child(div_31);

									$.action(span_10, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Number of routes after supernet aggregation');

									var span_11 = $.sibling(span_10, 2);
									var text_12 = $.only_child(span_11, true);

									$.reset(div_31);

									var div_32 = $.sibling(div_31, 2);
									var span_12 = $.child(div_32);

									$.action(span_12, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Number of routes eliminated through aggregation');

									var span_13 = $.sibling(span_12, 2);
									var text_13 = $.only_child(span_13, true);

									$.reset(div_32);

									var div_33 = $.sibling(div_32, 2);
									var span_14 = $.child(div_33);

									$.action(span_14, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Percentage reduction in routing table size');

									var span_15 = $.sibling(span_14, 2);
									var text_14 = $.only_child(span_15);

									$.reset(div_33);
									$.reset(div_29);
									$.reset(div_28);

									$.template_effect(
										($0) => {
											$.set_text(text_11, $.get(supernetResult).savingsAnalysis.originalRoutes);
											$.set_text(text_12, $.get(supernetResult).savingsAnalysis.aggregatedRoutes);
											$.set_text(text_13, $.get(supernetResult).savingsAnalysis.routeReduction);
											$.set_text(text_14, `${$0 ?? ''}%`);
										},
										[
											() => $.get(supernetResult).savingsAnalysis.reductionPercentage.toFixed(1)
										]
									);

									$.append($$anchor, div_28);
								};

								$.if(node_10, ($$render) => {
									if ($.get(supernetResult).savingsAnalysis) $$render(consequent_2);
								});
							}

							var div_34 = $.sibling(node_10, 2);
							var div_35 = $.sibling($.child(div_34), 2);
							var div_36 = $.child(div_35);
							var div_37 = $.child(div_36);
							var span_16 = $.child(div_37);

							$.action(span_16, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'The first IP address in the supernet that identifies the network itself');
							$.reset(div_37);

							var div_38 = $.sibling(div_37, 2);
							var code_1 = $.child(div_38);
							var text_15 = $.only_child(code_1, true);
							var button_4 = $.sibling(code_1, 2);
							let classes_2;
							var node_11 = $.child(button_4);

							{
								let $0 = $.derived(() => clipboard.isCopied('network') ? 'check' : 'copy');

								Icon(node_11, {
									get name() {
										return $.get($0);
									},
									size: 'sm'
								});
							}

							$.reset(button_4);
							$.reset(div_38);
							$.reset(div_36);

							var div_39 = $.sibling(div_36, 2);
							var div_40 = $.child(div_39);
							var span_17 = $.child(div_40);

							$.action(span_17, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Defines which portion of the IP address represents the network vs host bits');
							$.reset(div_40);

							var div_41 = $.sibling(div_40, 2);
							var code_2 = $.child(div_41);
							var text_16 = $.only_child(code_2, true);
							var button_5 = $.sibling(code_2, 2);
							let classes_3;
							var node_12 = $.child(button_5);

							{
								let $0 = $.derived(() => clipboard.isCopied('mask') ? 'check' : 'copy');

								Icon(node_12, {
									get name() {
										return $.get($0);
									},
									size: 'sm'
								});
							}

							$.reset(button_5);
							$.reset(div_41);
							$.reset(div_39);

							var div_42 = $.sibling(div_39, 2);
							var div_43 = $.child(div_42);
							var span_18 = $.child(div_43);

							$.action(span_18, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Inverse of subnet mask, used in access control lists and routing protocols');
							$.reset(div_43);

							var div_44 = $.sibling(div_43, 2);
							var code_3 = $.child(div_44);
							var text_17 = $.only_child(code_3, true);
							var button_6 = $.sibling(code_3, 2);
							let classes_4;
							var node_13 = $.child(button_6);

							{
								let $0 = $.derived(() => clipboard.isCopied('wildcard') ? 'check' : 'copy');

								Icon(node_13, {
									get name() {
										return $.get($0);
									},
									size: 'sm'
								});
							}

							$.reset(button_6);
							$.reset(div_44);
							$.reset(div_42);

							var div_45 = $.sibling(div_42, 2);
							var div_46 = $.child(div_45);
							var span_19 = $.child(div_46);

							$.action(span_19, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'First and last usable IP addresses in the supernet (excluding network and broadcast)');
							$.reset(div_46);

							var div_47 = $.sibling(div_46, 2);
							var code_4 = $.child(div_47);
							var text_18 = $.only_child(code_4);
							var button_7 = $.sibling(code_4, 2);
							let classes_5;
							var node_14 = $.child(button_7);

							{
								let $0 = $.derived(() => clipboard.isCopied('range') ? 'check' : 'copy');

								Icon(node_14, {
									get name() {
										return $.get($0);
									},
									size: 'sm'
								});
							}

							$.reset(button_7);
							$.reset(div_47);
							$.reset(div_45);

							var div_48 = $.sibling(div_45, 2);
							var div_49 = $.child(div_48);
							var span_20 = $.child(div_49);

							$.action(span_20, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Binary representation of the subnet mask showing network (1) and host (0) bits');
							$.reset(div_49);

							var div_50 = $.sibling(div_49, 2);
							var code_5 = $.child(div_50);
							var text_19 = $.only_child(code_5, true);
							var button_8 = $.sibling(code_5, 2);
							let classes_6;
							var node_15 = $.child(button_8);

							{
								let $0 = $.derived(() => clipboard.isCopied('binary') ? 'check' : 'copy');

								Icon(node_15, {
									get name() {
										return $.get($0);
									},
									size: 'sm'
								});
							}

							$.reset(button_8);
							$.reset(div_50);
							$.reset(div_48);
							$.reset(div_35);
							$.reset(div_34);

							var node_16 = $.sibling(div_34, 2);

							{
								var consequent_4 = ($$anchor) => {
									var div_51 = root_8();
									var div_52 = $.sibling($.child(div_51), 2);
									var div_53 = $.sibling($.child(div_52), 2);
									var div_54 = $.child(div_53);
									var node_17 = $.sibling($.child(div_54), 2);

									$.each(node_17, 19, () => $.get(supernetResult).inputNetworks, (network) => network.id, ($$anchor, network, index) => {
										var div_55 = root_7();
										var div_56 = $.child(div_55);
										var span_21 = $.child(div_56);
										var text_20 = $.only_child(span_21);
										var node_18 = $.sibling(span_21, 2);

										{
											var consequent_3 = ($$anchor) => {
												var span_22 = root_6();
												var text_21 = $.only_child(span_22, true);

												$.template_effect(() => $.set_text(text_21, $.get(network).description));
												$.append($$anchor, span_22);
											};

											$.if(node_18, ($$render) => {
												if ($.get(network).description) $$render(consequent_3);
											});
										}

										$.reset(div_56);
										$.reset(div_55);

										$.template_effect(() => {
											$.set_style(div_56, `--network-index: ${$.get(index) ?? ''}`);
											$.set_text(text_20, `${$.get(network).network ?? ''}/${$.get(network).cidr ?? ''}`);
										});

										$.append($$anchor, div_55);
									});

									$.reset(div_54);

									var div_57 = $.sibling(div_54, 2);
									var node_19 = $.child(div_57);

									Icon(node_19, { name: 'arrow-down', size: 'lg' });
									$.next(2);
									$.reset(div_57);

									var div_58 = $.sibling(div_57, 2);
									var div_59 = $.sibling($.child(div_58), 2);
									var span_23 = $.child(div_59);
									var text_22 = $.only_child(span_23);
									var span_24 = $.sibling(span_23, 2);
									var text_23 = $.only_child(span_24);

									$.reset(div_59);
									$.reset(div_58);
									$.reset(div_53);
									$.reset(div_52);
									$.reset(div_51);

									$.template_effect(
										($0) => {
											$.set_text(text_22, `${$.get(supernetResult).supernet.network ?? ''}/${$.get(supernetResult).supernet.cidr ?? ''}`);
											$.set_text(text_23, `${$0 ?? ''} hosts`);
										},
										[
											() => formatNumber($.get(supernetResult).supernet.totalHosts)
										]
									);

									$.append($$anchor, div_51);
								};

								$.if(node_16, ($$render) => {
									if ($.get(showVisualization)) $$render(consequent_4);
								});
							}

							$.template_effect(
								($0, $1, $2, $3, $4, $5, $6) => {
									$.set_text(text_9, `${$.get(supernetResult).supernet.network ?? ''}/${$.get(supernetResult).supernet.cidr ?? ''}`);
									classes_1 = $.set_class(button_3, 1, 'btn btn-icon copy-btn svelte-1cjcuvu', null, classes_1, { copied: $0 });
									$.set_text(text_10, $1);
									$.set_text(text_15, $.get(supernetResult).supernet.network);
									classes_2 = $.set_class(button_4, 1, 'btn btn-icon copy-btn svelte-1cjcuvu', null, classes_2, { copied: $2 });
									$.set_text(text_16, $.get(supernetResult).supernet.subnetMask);
									classes_3 = $.set_class(button_5, 1, 'btn btn-icon copy-btn svelte-1cjcuvu', null, classes_3, { copied: $3 });
									$.set_text(text_17, $.get(supernetResult).supernet.wildcardMask);
									classes_4 = $.set_class(button_6, 1, 'btn btn-icon copy-btn svelte-1cjcuvu', null, classes_4, { copied: $4 });
									$.set_text(text_18, `${$.get(supernetResult).supernet.addressRange.first ?? ''} - ${$.get(supernetResult).supernet.addressRange.last ?? ''}`);
									classes_5 = $.set_class(button_7, 1, 'btn btn-icon copy-btn svelte-1cjcuvu', null, classes_5, { copied: $5 });
									$.set_text(text_19, $.get(supernetResult).supernet.binaryMask);
									classes_6 = $.set_class(button_8, 1, 'btn btn-icon copy-btn svelte-1cjcuvu', null, classes_6, { copied: $6 });
								},
								[
									() => clipboard.isCopied('supernet'),
									() => formatNumber($.get(supernetResult).supernet.totalHosts),
									() => clipboard.isCopied('network'),
									() => clipboard.isCopied('mask'),
									() => clipboard.isCopied('wildcard'),
									() => clipboard.isCopied('range'),
									() => clipboard.isCopied('binary')
								]
							);

							$.delegated('click', button_3, () => $.get(supernetResult)?.supernet && clipboard.copy(`${$.get(supernetResult).supernet.network}/${$.get(supernetResult).supernet.cidr}`, 'supernet'));
							$.delegated('click', button_4, () => $.get(supernetResult)?.supernet && clipboard.copy($.get(supernetResult).supernet.network, 'network'));
							$.delegated('click', button_5, () => $.get(supernetResult)?.supernet && clipboard.copy($.get(supernetResult).supernet.subnetMask, 'mask'));
							$.delegated('click', button_6, () => $.get(supernetResult)?.supernet && clipboard.copy($.get(supernetResult).supernet.wildcardMask, 'wildcard'));
							$.delegated('click', button_7, () => $.get(supernetResult)?.supernet && clipboard.copy(`${$.get(supernetResult).supernet.addressRange.first} - ${$.get(supernetResult).supernet.addressRange.last}`, 'range'));
							$.delegated('click', button_8, () => $.get(supernetResult)?.supernet && clipboard.copy($.get(supernetResult).supernet.binaryMask, 'binary'));
							$.append($$anchor, fragment_2);
						};

						var alternate = ($$anchor) => {
							var div_60 = root_10();
							var p = $.sibling($.child(div_60), 2);
							var text_24 = $.only_child(p, true);

							$.reset(div_60);
							$.template_effect(() => $.set_text(text_24, $.get(supernetResult).error));
							$.append($$anchor, div_60);
						};

						$.if(node_8, ($$render) => {
							if ($.get(supernetResult).success && $.get(supernetResult).supernet) $$render(consequent_5); else $$render(alternate, -1);
						});
					}

					$.reset(div_22);
					$.append($$anchor, div_22);
				};

				$.if(node_7, ($$render) => {
					if ($.get(supernetResult)) $$render(consequent_6);
				});
			}

			$.delegated('click', button_1, addNetwork);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}

$.delegate(['click']);