import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div class="requirement-item svelte-b2a9wu"><div class="requirement-header svelte-b2a9wu"><span class="requirement-number svelte-b2a9wu"> </span> <div class="requirement-inputs svelte-b2a9wu"><input type="text" placeholder="Subnet name" class="subnet-name-input svelte-b2a9wu"/> <div class="hosts-input svelte-b2a9wu"><label class="svelte-b2a9wu">Hosts needed:</label> <input type="number" min="1" max="16777214" class="hosts-number-input svelte-b2a9wu"/></div></div> <button type="button" class="btn btn-danger-ghost svelte-b2a9wu"><!></button></div> <div class="requirement-description svelte-b2a9wu"><input type="text" placeholder="Description (optional)" class="description-input svelte-b2a9wu"/></div></div>`);
var root_1 = $.from_html(`<div class="subnet-description svelte-b2a9wu"> </div>`);
var root_2 = $.from_html(`<div class="hosts-wasted svelte-b2a9wu"> </div>`);
var root_3 = $.from_html(`<button type="button"><!></button>`);
var root_4 = $.from_html(`<div class="subnet-details svelte-b2a9wu"><div class="details-grid svelte-b2a9wu"><div class="detail-item svelte-b2a9wu"><span class="detail-label svelte-b2a9wu">Network Address</span> <code class="detail-value svelte-b2a9wu"> </code></div> <div class="detail-item svelte-b2a9wu"><span class="detail-label svelte-b2a9wu">Broadcast Address</span> <code class="detail-value svelte-b2a9wu"> </code></div> <div class="detail-item svelte-b2a9wu"><span class="detail-label svelte-b2a9wu">First Usable Host</span> <code class="detail-value svelte-b2a9wu"> </code></div> <div class="detail-item svelte-b2a9wu"><span class="detail-label svelte-b2a9wu">Last Usable Host</span> <code class="detail-value svelte-b2a9wu"> </code></div> <div class="detail-item svelte-b2a9wu"><span class="detail-label svelte-b2a9wu">Subnet Mask</span> <code class="detail-value svelte-b2a9wu"> </code></div> <div class="detail-item svelte-b2a9wu"><span class="detail-label svelte-b2a9wu">Wildcard Mask</span> <code class="detail-value svelte-b2a9wu"> </code></div> <div class="detail-item svelte-b2a9wu"><span class="detail-label svelte-b2a9wu">Binary Mask</span> <code class="detail-value binary-mask svelte-b2a9wu"> </code></div> <div class="detail-item svelte-b2a9wu"><span class="detail-label svelte-b2a9wu">Host Bits</span> <code class="detail-value svelte-b2a9wu"> </code></div></div></div>`);
var root_5 = $.from_html(`<div class="table-row svelte-b2a9wu"><div class="col-name svelte-b2a9wu"><div class="subnet-name svelte-b2a9wu"> </div> <!></div> <div class="col-network svelte-b2a9wu"><div class="network-info"><div class="network-address svelte-b2a9wu"> </div> <div class="address-range svelte-b2a9wu"> </div></div></div> <div class="col-hosts svelte-b2a9wu"><div class="hosts-info"><div class="hosts-needed svelte-b2a9wu"> </div> <div class="hosts-provided svelte-b2a9wu"> </div> <!></div></div> <div class="col-mask svelte-b2a9wu"><div class="mask-info"><div class="subnet-mask svelte-b2a9wu"> </div> <div class="wildcard-mask svelte-b2a9wu"> </div></div></div> <div class="col-efficiency svelte-b2a9wu"><div class="efficiency-indicator svelte-b2a9wu"> </div></div> <div class="col-actions svelte-b2a9wu"><button type="button"><!></button> <!></div></div> <!>`, 1);
var root_6 = $.from_html(`<div class="info-panel info"><h4>Next Available Network</h4> <p>The next available network address for additional subnets: <code> </code></p></div>`);
var root_7 = $.from_html(`<div class="info-panel success"><h3>VLSM Calculation Results</h3> <div class="summary-stats svelte-b2a9wu"><div class="stat-item svelte-b2a9wu"><span class="stat-label svelte-b2a9wu">Total Subnets</span> <span class="stat-value svelte-b2a9wu"> </span></div> <div class="stat-item svelte-b2a9wu"><span class="stat-label svelte-b2a9wu">Hosts Requested</span> <span class="stat-value svelte-b2a9wu"> </span></div> <div class="stat-item svelte-b2a9wu"><span class="stat-label svelte-b2a9wu">Hosts Provided</span> <span class="stat-value svelte-b2a9wu"> </span></div> <div class="stat-item svelte-b2a9wu"><span class="stat-label svelte-b2a9wu">Wasted Hosts</span> <span class="stat-value danger svelte-b2a9wu"> </span></div> <div class="stat-item svelte-b2a9wu"><span class="stat-label svelte-b2a9wu">Efficiency</span> <span class="stat-value svelte-b2a9wu"> </span></div> <div class="stat-item svelte-b2a9wu"><span class="stat-label svelte-b2a9wu">Remaining Addresses</span> <span class="stat-value svelte-b2a9wu"> </span></div></div></div> <div class="subnets-table-container svelte-b2a9wu"><h3>Calculated Subnets</h3> <div class="subnets-table svelte-b2a9wu"><div class="table-header svelte-b2a9wu"><div class="col-name svelte-b2a9wu">Subnet</div> <div class="col-network svelte-b2a9wu">Network</div> <div class="col-hosts svelte-b2a9wu">Hosts</div> <div class="col-mask svelte-b2a9wu">Mask</div> <div class="col-efficiency svelte-b2a9wu">Efficiency</div> <div class="col-actions svelte-b2a9wu">Actions</div></div> <!></div></div> <!>`, 1);
var root_8 = $.from_html(`<div class="info-panel error"><h3>Calculation Error</h3> <p class="error-message svelte-b2a9wu"> </p></div>`);
var root_9 = $.from_html(`<div class="results-section svelte-b2a9wu"><!></div>`);
var root_10 = $.from_html(`<div class="network-config svelte-b2a9wu"><h3>Network Configuration</h3> <div class="grid grid-2"><div class="form-group"><!></div> <div class="form-group"><label for="cidr-input">CIDR Notation</label> <div class="cidr-input svelte-b2a9wu"><span class="cidr-prefix svelte-b2a9wu"> </span> <input id="cidr-input" type="range" min="8" max="30" class="cidr-slider svelte-b2a9wu"/> <input type="number" min="8" max="30" class="cidr-number svelte-b2a9wu"/></div></div></div></div> <div class="subnet-requirements svelte-b2a9wu"><div class="requirements-header svelte-b2a9wu"><h3>Subnet Requirements</h3> <button type="button" class="btn btn-primary svelte-b2a9wu"><!> Add Subnet</button></div> <div class="requirements-list svelte-b2a9wu"></div></div> <!>`, 1);

export default function VLSMCalculator($$anchor, $$props) {
	$.push($$props, true);

	let networkIP = $.state('192.168.1.0');
	let cidr = $.state(24);
	let subnets = $.state($.proxy([]));
	let vlsmResult = $.state(null);
	const clipboard = useClipboard();
	let expandedSubnets = new SvelteSet();

	// Add initial subnet requirement
	$.user_effect(() => {
		if ($.get(subnets).length === 0) {
			addSubnet();
		}
	});

	/**
	 * Add a new subnet requirement
	 */
	function addSubnet() {
		$.get(subnets).push({
			id: generateSubnetId(),
			name: `Subnet ${$.get(subnets).length + 1}`,
			hostsNeeded: 50,
			description: ''
		});
	}

	/**
	 * Remove a subnet requirement
	 */
	function removeSubnet(id) {
		$.set(subnets, $.get(subnets).filter((subnet) => subnet.id !== id), true);

		if ($.get(subnets).length === 0) {
			$.set(vlsmResult, null);
		}
	}

	/**
	 * Update subnet requirement
	 */
	function updateSubnet(id, field, value) {
		const index = $.get(subnets).findIndex((s) => s.id === id);

		if (index !== -1) {
			$.get(subnets)[index] = { ...$.get(subnets)[index], [field]: value };
		}
	}

	/**
	 * Calculate VLSM subnets
	 */
	function calculateSubnets() {
		const ipValidation = validateIPv4($.get(networkIP));

		if (!ipValidation.valid) {
			$.set(
				vlsmResult,
				{
					success: false,
					subnets: [],
					error: ipValidation.error,
					originalNetwork: $.get(networkIP),
					originalCIDR: $.get(cidr),
					totalHostsRequested: 0,
					totalHostsProvided: 0,
					totalWastedHosts: 0,
					remainingAddresses: 0
				},
				true
			);

			return;
		}

		// Validate all subnet requirements
		for (const subnet of $.get(subnets)) {
			const validation = validateSubnetRequirement(subnet);

			if (!validation.valid) {
				$.set(
					vlsmResult,
					{
						success: false,
						subnets: [],
						error: `${subnet.name}: ${validation.error}`,
						originalNetwork: $.get(networkIP),
						originalCIDR: $.get(cidr),
						totalHostsRequested: 0,
						totalHostsProvided: 0,
						totalWastedHosts: 0,
						remainingAddresses: 0
					},
					true
				);

				return;
			}
		}

		$.set(vlsmResult, calculateVLSM($.get(networkIP), $.get(cidr), $.get(subnets)), true);
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

	// Reactive calculations
	$.user_effect(() => {
		if ($.get(networkIP) && $.get(cidr) && $.get(subnets).length > 0) {
			calculateSubnets();
		}
	});

	ToolContentContainer($$anchor, {
		title: 'VLSM Calculator',
		description: 'Design efficient subnets with Variable Length Subnet Masking for optimal address space utilization.',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_10();
			var div = $.first_child(fragment_1);
			var div_1 = $.sibling($.child(div), 2);
			var div_2 = $.child(div_1);
			var node = $.child(div_2);

			IPInput(node, {
				label: 'Network Address',
				placeholder: '192.168.1.0',
				get value() {
					return $.get(networkIP);
				},

				set value($$value) {
					$.set(networkIP, $$value, true);
				}
			});

			$.reset(div_2);

			var div_3 = $.sibling(div_2, 2);
			var div_4 = $.sibling($.child(div_3), 2);
			var span = $.child(div_4);
			var text = $.only_child(span);
			var input = $.sibling(span, 2);

			$.remove_input_defaults(input);

			var input_1 = $.sibling(input, 2);

			$.remove_input_defaults(input_1);
			$.reset(div_4);
			$.reset(div_3);
			$.reset(div_1);
			$.reset(div);

			var div_5 = $.sibling(div, 2);
			var div_6 = $.child(div_5);
			var button = $.sibling($.child(div_6), 2);
			var node_1 = $.child(button);

			Icon(node_1, { name: 'plus', size: 'sm' });
			$.next();
			$.reset(button);
			$.reset(div_6);

			var div_7 = $.sibling(div_6, 2);

			$.each(div_7, 23, () => $.get(subnets), (subnet) => subnet.id, ($$anchor, subnet, index) => {
				var div_8 = root();
				var div_9 = $.child(div_8);
				var span_1 = $.child(div_9);
				var text_1 = $.only_child(span_1, true);
				var div_10 = $.sibling(span_1, 2);
				var input_2 = $.child(div_10);

				$.remove_input_defaults(input_2);

				var div_11 = $.sibling(input_2, 2);
				var label = $.child(div_11);
				var input_3 = $.sibling(label, 2);

				$.remove_input_defaults(input_3);
				$.reset(div_11);
				$.reset(div_10);

				var button_1 = $.sibling(div_10, 2);
				var node_2 = $.child(button_1);

				Icon(node_2, { name: 'trash', size: 'sm' });
				$.reset(button_1);
				$.reset(div_9);

				var div_12 = $.sibling(div_9, 2);
				var input_4 = $.child(div_12);

				$.remove_input_defaults(input_4);
				$.reset(div_12);
				$.reset(div_8);

				$.template_effect(() => {
					$.set_text(text_1, $.get(index) + 1);
					$.set_attribute(label, 'for', `hosts-${$.get(index) ?? ''}`);
					$.set_attribute(input_3, 'id', `hosts-${$.get(index) ?? ''}`);
					button_1.disabled = $.get(subnets).length === 1;
				});

				$.delegated('input', input_2, (e) => updateSubnet($.get(subnet).id, 'name', e.target?.value));
				$.bind_value(input_2, () => $.get(subnet).name, ($$value) => ($.get(subnet).name = $$value));
				$.delegated('input', input_3, (e) => updateSubnet($.get(subnet).id, 'hostsNeeded', parseInt(e.target?.value || '1')));
				$.bind_value(input_3, () => $.get(subnet).hostsNeeded, ($$value) => ($.get(subnet).hostsNeeded = $$value));
				$.delegated('click', button_1, () => removeSubnet($.get(subnet).id));
				$.delegated('input', input_4, (e) => updateSubnet($.get(subnet).id, 'description', e.target?.value));
				$.bind_value(input_4, () => $.get(subnet).description, ($$value) => ($.get(subnet).description = $$value));
				$.append($$anchor, div_8);
			});

			$.reset(div_7);
			$.reset(div_5);

			var node_3 = $.sibling(div_5, 2);

			{
				var consequent_5 = ($$anchor) => {
					var div_13 = root_9();
					var node_4 = $.child(div_13);

					{
						var consequent_4 = ($$anchor) => {
							var fragment_2 = root_7();
							var div_14 = $.first_child(fragment_2);
							var div_15 = $.sibling($.child(div_14), 2);
							var div_16 = $.child(div_15);
							var span_2 = $.sibling($.child(div_16), 2);
							var text_2 = $.only_child(span_2, true);

							$.reset(div_16);

							var div_17 = $.sibling(div_16, 2);
							var span_3 = $.sibling($.child(div_17), 2);
							var text_3 = $.only_child(span_3, true);

							$.reset(div_17);

							var div_18 = $.sibling(div_17, 2);
							var span_4 = $.sibling($.child(div_18), 2);
							var text_4 = $.only_child(span_4, true);

							$.reset(div_18);

							var div_19 = $.sibling(div_18, 2);
							var span_5 = $.sibling($.child(div_19), 2);
							var text_5 = $.only_child(span_5, true);

							$.reset(div_19);

							var div_20 = $.sibling(div_19, 2);
							var span_6 = $.sibling($.child(div_20), 2);
							var text_6 = $.only_child(span_6);

							$.reset(div_20);

							var div_21 = $.sibling(div_20, 2);
							var span_7 = $.sibling($.child(div_21), 2);
							var text_7 = $.only_child(span_7, true);

							$.reset(div_21);
							$.reset(div_15);
							$.reset(div_14);

							var div_22 = $.sibling(div_14, 2);
							var div_23 = $.sibling($.child(div_22), 2);
							var node_5 = $.sibling($.child(div_23), 2);

							$.each(node_5, 17, () => $.get(vlsmResult).subnets, (subnet) => subnet.id, ($$anchor, subnet) => {
								var fragment_3 = root_5();
								var div_24 = $.first_child(fragment_3);
								var div_25 = $.child(div_24);
								var div_26 = $.child(div_25);
								var text_8 = $.only_child(div_26, true);
								var node_6 = $.sibling(div_26, 2);

								{
									var consequent = ($$anchor) => {
										var div_27 = root_1();
										var text_9 = $.only_child(div_27, true);

										$.template_effect(() => $.set_text(text_9, $.get(subnet).description));
										$.append($$anchor, div_27);
									};

									$.if(node_6, ($$render) => {
										if ($.get(subnet).description) $$render(consequent);
									});
								}

								$.reset(div_25);

								var div_28 = $.sibling(div_25, 2);
								var div_29 = $.child(div_28);
								var div_30 = $.child(div_29);
								var text_10 = $.only_child(div_30);
								var div_31 = $.sibling(div_30, 2);
								var text_11 = $.only_child(div_31);

								$.reset(div_29);
								$.reset(div_28);

								var div_32 = $.sibling(div_28, 2);
								var div_33 = $.child(div_32);
								var div_34 = $.child(div_33);
								var text_12 = $.only_child(div_34);
								var div_35 = $.sibling(div_34, 2);
								var text_13 = $.only_child(div_35);
								var node_7 = $.sibling(div_35, 2);

								{
									var consequent_1 = ($$anchor) => {
										var div_36 = root_2();
										var text_14 = $.only_child(div_36);

										$.template_effect(() => $.set_text(text_14, `${$.get(subnet).wastedHosts ?? ''} wasted`));
										$.append($$anchor, div_36);
									};

									$.if(node_7, ($$render) => {
										if ($.get(subnet).wastedHosts > 0) $$render(consequent_1);
									});
								}

								$.reset(div_33);
								$.reset(div_32);

								var div_37 = $.sibling(div_32, 2);
								var div_38 = $.child(div_37);
								var div_39 = $.child(div_38);
								var text_15 = $.only_child(div_39, true);
								var div_40 = $.sibling(div_39, 2);
								var text_16 = $.only_child(div_40, true);

								$.reset(div_38);
								$.reset(div_37);

								var div_41 = $.sibling(div_37, 2);
								var div_42 = $.child(div_41);
								var text_17 = $.only_child(div_42);

								$.reset(div_41);

								var div_43 = $.sibling(div_41, 2);
								var button_2 = $.child(div_43);
								var node_8 = $.child(button_2);

								Icon(node_8, { name: 'chevron-down', size: 'sm' });
								$.reset(button_2);

								var node_9 = $.sibling(button_2, 2);

								Tooltip(node_9, {
									text: 'Copy network info',
									position: 'left',
									children: ($$anchor, $$slotProps) => {
										var button_3 = root_3();
										var node_10 = $.child(button_3);

										{
											let $0 = $.derived(() => clipboard.isCopied(`copy-${$.get(subnet).id}`) ? 'tick' : 'copy');

											Icon(node_10, {
												get name() {
													return $.get($0);
												},
												size: 'sm'
											});
										}

										$.reset(button_3);

										$.template_effect(($0) => $.set_class(button_3, 1, `btn btn-ghost ${$0 ?? ''}`, 'svelte-b2a9wu'), [
											() => clipboard.isCopied(`copy-${$.get(subnet).id}`) ? 'copied' : ''
										]);

										$.delegated('click', button_3, () => clipboard.copy(`${$.get(subnet).networkAddress}/${$.get(subnet).cidr}`, `copy-${$.get(subnet).id}`));
										$.append($$anchor, button_3);
									},
									$$slots: { default: true }
								});

								$.reset(div_43);
								$.reset(div_24);

								var node_11 = $.sibling(div_24, 2);

								{
									var consequent_2 = ($$anchor) => {
										var div_44 = root_4();
										var div_45 = $.child(div_44);
										var div_46 = $.child(div_45);
										var span_8 = $.child(div_46);

										$.action(span_8, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'First IP address in the subnet - identifies the network');

										var code = $.sibling(span_8, 2);
										var text_18 = $.only_child(code, true);

										$.reset(div_46);

										var div_47 = $.sibling(div_46, 2);
										var span_9 = $.child(div_47);

										$.action(span_9, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Last IP address in the subnet - sends to all hosts');

										var code_1 = $.sibling(span_9, 2);
										var text_19 = $.only_child(code_1, true);

										$.reset(div_47);

										var div_48 = $.sibling(div_47, 2);
										var span_10 = $.child(div_48);

										$.action(span_10, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'First IP address available for host assignment');

										var code_2 = $.sibling(span_10, 2);
										var text_20 = $.only_child(code_2, true);

										$.reset(div_48);

										var div_49 = $.sibling(div_48, 2);
										var span_11 = $.child(div_49);

										$.action(span_11, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Last IP address available for host assignment');

										var code_3 = $.sibling(span_11, 2);
										var text_21 = $.only_child(code_3, true);

										$.reset(div_49);

										var div_50 = $.sibling(div_49, 2);
										var span_12 = $.child(div_50);

										$.action(span_12, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Defines which portion of IP represents network vs host');

										var code_4 = $.sibling(span_12, 2);
										var text_22 = $.only_child(code_4, true);

										$.reset(div_50);

										var div_51 = $.sibling(div_50, 2);
										var span_13 = $.child(div_51);

										$.action(span_13, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Inverse of subnet mask - used in access control lists');

										var code_5 = $.sibling(span_13, 2);
										var text_23 = $.only_child(code_5, true);

										$.reset(div_51);

										var div_52 = $.sibling(div_51, 2);
										var span_14 = $.child(div_52);

										$.action(span_14, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Binary representation of the subnet mask');

										var code_6 = $.sibling(span_14, 2);
										var text_24 = $.only_child(code_6, true);

										$.reset(div_52);

										var div_53 = $.sibling(div_52, 2);
										var span_15 = $.child(div_53);

										$.action(span_15, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Number of bits available for host addressing');

										var code_7 = $.sibling(span_15, 2);
										var text_25 = $.only_child(code_7);

										$.reset(div_53);
										$.reset(div_45);
										$.reset(div_44);

										$.template_effect(() => {
											$.set_text(text_18, $.get(subnet).networkAddress);
											$.set_text(text_19, $.get(subnet).broadcastAddress);
											$.set_text(text_20, $.get(subnet).firstUsableHost);
											$.set_text(text_21, $.get(subnet).lastUsableHost);
											$.set_text(text_22, $.get(subnet).subnetMask);
											$.set_text(text_23, $.get(subnet).wildcardMask);
											$.set_text(text_24, $.get(subnet).binaryMask);
											$.set_text(text_25, `${$.get(subnet).actualHostBits ?? ''} bits`);
										});

										$.append($$anchor, div_44);
									};

									var d = $.derived(() => expandedSubnets.has($.get(subnet).id));

									$.if(node_11, ($$render) => {
										if ($.get(d)) $$render(consequent_2);
									});
								}

								$.template_effect(
									($0, $1, $2) => {
										$.set_text(text_8, $.get(subnet).name);
										$.set_text(text_10, `${$.get(subnet).networkAddress ?? ''}/${$.get(subnet).cidr ?? ''}`);
										$.set_text(text_11, `${$.get(subnet).firstUsableHost ?? ''} - ${$.get(subnet).lastUsableHost ?? ''}`);
										$.set_text(text_12, `${$.get(subnet).hostsNeeded ?? ''} needed`);
										$.set_text(text_13, `${$.get(subnet).hostsProvided ?? ''} provided`);
										$.set_text(text_15, $.get(subnet).subnetMask);
										$.set_text(text_16, $.get(subnet).wildcardMask);
										$.set_style(div_42, `color: ${$0 ?? ''}`);
										$.set_text(text_17, `${$1 ?? ''}%`);
										$.set_class(button_2, 1, `btn btn-ghost primary-ghost ${$2 ?? ''}`, 'svelte-b2a9wu');
									},
									[
										() => getEfficiencyColor($.get(subnet).wastedHosts, $.get(subnet).hostsProvided),
										() => ((1 - $.get(subnet).wastedHosts / $.get(subnet).hostsProvided) * 100).toFixed(1),
										() => expandedSubnets.has($.get(subnet).id) ? 'expanded' : ''
									]
								);

								$.delegated('click', button_2, () => toggleSubnetExpansion($.get(subnet).id));
								$.append($$anchor, fragment_3);
							});

							$.reset(div_23);
							$.reset(div_22);

							var node_12 = $.sibling(div_22, 2);

							{
								var consequent_3 = ($$anchor) => {
									var div_54 = root_6();
									var p = $.sibling($.child(div_54), 2);
									var code_8 = $.sibling($.child(p));
									var text_26 = $.only_child(code_8, true);

									$.reset(p);
									$.reset(div_54);
									$.template_effect(() => $.set_text(text_26, $.get(vlsmResult).nextAvailableNetwork));
									$.append($$anchor, div_54);
								};

								$.if(node_12, ($$render) => {
									if ($.get(vlsmResult).nextAvailableNetwork) $$render(consequent_3);
								});
							}

							$.template_effect(
								($0, $1, $2, $3, $4, $5) => {
									$.set_text(text_2, $.get(vlsmResult).subnets.length);
									$.set_text(text_3, $0);
									$.set_text(text_4, $1);
									$.set_text(text_5, $2);
									$.set_style(span_6, `color: ${$3 ?? ''}`);
									$.set_text(text_6, `${$4 ?? ''}%`);
									$.set_text(text_7, $5);
								},
								[
									() => formatNumber($.get(vlsmResult).totalHostsRequested),
									() => formatNumber($.get(vlsmResult).totalHostsProvided),
									() => formatNumber($.get(vlsmResult).totalWastedHosts),
									() => getEfficiencyColor($.get(vlsmResult).totalWastedHosts, $.get(vlsmResult).totalHostsProvided),
									() => ((1 - $.get(vlsmResult).totalWastedHosts / $.get(vlsmResult).totalHostsProvided) * 100).toFixed(1),
									() => formatNumber($.get(vlsmResult).remainingAddresses)
								]
							);

							$.append($$anchor, fragment_2);
						};

						var alternate = ($$anchor) => {
							var div_55 = root_8();
							var p_1 = $.sibling($.child(div_55), 2);
							var text_27 = $.only_child(p_1, true);

							$.reset(div_55);
							$.template_effect(() => $.set_text(text_27, $.get(vlsmResult).error));
							$.append($$anchor, div_55);
						};

						$.if(node_4, ($$render) => {
							if ($.get(vlsmResult).success) $$render(consequent_4); else $$render(alternate, -1);
						});
					}

					$.reset(div_13);
					$.append($$anchor, div_13);
				};

				$.if(node_3, ($$render) => {
					if ($.get(vlsmResult)) $$render(consequent_5);
				});
			}

			$.template_effect(() => $.set_text(text, `/${$.get(cidr) ?? ''}`));
			$.bind_value(input, () => $.get(cidr), ($$value) => $.set(cidr, $$value));
			$.bind_value(input_1, () => $.get(cidr), ($$value) => $.set(cidr, $$value));
			$.delegated('click', button, addSubnet);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}

$.delegate(['click', 'input']);