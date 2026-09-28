import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { convertWildcardMasks } from '$lib/utils/wildcard-mask.js';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import '../../../styles/diagnostics-pages.scss';
import { useClipboard } from '$lib/composables';
import { formatNumber } from '$lib/utils/formatters';

var root = $.from_html(`<button><div class="example-label"> </div> <div class="example-preview"> </div></button>`);
var root_1 = $.from_html(`<div class="acl-settings svelte-1n66kwe"><div class="input-group svelte-1n66kwe"><label for="acl-type" class="svelte-1n66kwe">Action</label> <select id="acl-type" class="svelte-1n66kwe"><option>Permit</option><option>Deny</option></select></div> <div class="input-group svelte-1n66kwe"><label for="protocol" class="svelte-1n66kwe">Protocol</label> <input id="protocol" type="text" placeholder="ip" class="svelte-1n66kwe"/></div> <div class="input-group svelte-1n66kwe"><label for="destination" class="svelte-1n66kwe">Destination</label> <input id="destination" type="text" placeholder="any" class="svelte-1n66kwe"/></div></div>`);
var root_2 = $.from_html(`<div class="loading svelte-1n66kwe"><!> Converting masks...</div>`);
var root_3 = $.from_html(`<div class="error-item svelte-1n66kwe"> </div>`);
var root_4 = $.from_html(`<div class="errors svelte-1n66kwe"><h3 class="svelte-1n66kwe"><!> Errors</h3> <!></div>`);
var root_5 = $.from_html(`<!> Valid`, 1);
var root_6 = $.from_html(`<!> Invalid`, 1);
var root_7 = $.from_html(`<div class="conversion-details svelte-1n66kwe"><div class="detail-row svelte-1n66kwe"><span class="label svelte-1n66kwe">CIDR:</span> <div class="code-container svelte-1n66kwe"><code class="svelte-1n66kwe"> </code> <button type="button"><!></button></div></div> <div class="detail-row svelte-1n66kwe"><span class="label svelte-1n66kwe">Subnet Mask:</span> <div class="code-container svelte-1n66kwe"><code class="svelte-1n66kwe"> </code> <button type="button"><!></button></div></div> <div class="detail-row svelte-1n66kwe"><span class="label svelte-1n66kwe">Wildcard Mask:</span> <div class="code-container svelte-1n66kwe"><code class="svelte-1n66kwe"> </code> <button type="button"><!></button></div></div> <div class="network-info svelte-1n66kwe"><div class="info-grid svelte-1n66kwe"><div><span class="info-label svelte-1n66kwe">Network:</span> <span class="info-value svelte-1n66kwe"> </span></div> <div><span class="info-label svelte-1n66kwe">Broadcast:</span> <span class="info-value svelte-1n66kwe"> </span></div> <div><span class="info-label svelte-1n66kwe">Host Bits:</span> <span class="info-value svelte-1n66kwe"> </span></div> <div><span class="info-label svelte-1n66kwe">Usable Hosts:</span> <span class="info-value svelte-1n66kwe"> </span></div></div></div></div>`);
var root_8 = $.from_html(`<div class="error-message svelte-1n66kwe"><!> </div>`);
var root_9 = $.from_html(`<div><div class="check-header svelte-1n66kwe"><div class="check-input svelte-1n66kwe"><span class="input-text svelte-1n66kwe"> </span> <span class="input-type svelte-1n66kwe"> </span></div> <div class="check-status svelte-1n66kwe"><!></div></div> <!></div>`);
var root_10 = $.from_html(`<div class="acl-line svelte-1n66kwe"> </div>`);
var root_11 = $.from_html(`<div class="acl-section svelte-1n66kwe"><div class="acl-header svelte-1n66kwe"><h4 class="svelte-1n66kwe">Cisco ACL</h4> <button><!> </button></div> <div class="acl-code svelte-1n66kwe"></div></div>`);
var root_12 = $.from_html(`<div class="acl-section svelte-1n66kwe"><div class="acl-header svelte-1n66kwe"><h4 class="svelte-1n66kwe">Juniper ACL</h4> <button><!> </button></div> <div class="acl-code svelte-1n66kwe"></div></div>`);
var root_13 = $.from_html(`<div class="acl-section svelte-1n66kwe"><div class="acl-header svelte-1n66kwe"><h4 class="svelte-1n66kwe">Generic ACL</h4> <button><!> </button></div> <div class="acl-code svelte-1n66kwe"></div></div>`);
var root_14 = $.from_html(`<div class="acl-rules-container svelte-1n66kwe"><h3 class="svelte-1n66kwe">Generated ACL Rules</h3> <!> <!> <!></div>`);
var root_15 = $.from_html(`<div class="summary svelte-1n66kwe"><h3 class="svelte-1n66kwe">Conversion Summary</h3> <div class="summary-stats svelte-1n66kwe"><div class="stat svelte-1n66kwe"><span class="stat-value svelte-1n66kwe"> </span> <span class="stat-label svelte-1n66kwe">Total Inputs</span></div> <div class="stat aligned svelte-1n66kwe"><span class="stat-value svelte-1n66kwe"> </span> <span class="stat-label svelte-1n66kwe">Valid</span></div> <div class="stat misaligned svelte-1n66kwe"><span class="stat-value svelte-1n66kwe"> </span> <span class="stat-label svelte-1n66kwe">Invalid</span></div></div></div> <div class="conversions"><div class="conversions-header svelte-1n66kwe"><h3 class="svelte-1n66kwe">Mask Conversions</h3> <div class="export-buttons svelte-1n66kwe"><button class="svelte-1n66kwe"><!> Export CSV</button> <button class="svelte-1n66kwe"><!> Export JSON</button></div></div> <div class="conversions-grid svelte-1n66kwe"></div></div> <!>`, 1);
var root_16 = $.from_html(`<div class="results svelte-1n66kwe"><!> <!></div>`);

var root_17 = $.from_html(`<div class="card"><header class="card-header"><h2>Wildcard Mask Converter</h2> <p>Convert between CIDR notation, subnet masks, and wildcard masks with ACL rule generation</p></header> <div class="card examples-card"><details class="examples-details"><summary class="examples-summary"><!> <h4>Quick Examples</h4></summary> <div class="examples-grid"></div></details></div> <div class="input-section svelte-1n66kwe"><div class="inputs-section svelte-1n66kwe"><h3 class="svelte-1n66kwe">Network Inputs</h3> <div class="input-group svelte-1n66kwe"><label for="inputs" class="svelte-1n66kwe">IP Addresses, CIDRs, or Ranges</label> <textarea id="inputs" placeholder="192.168.1.0/24
10.0.0.0 255.255.255.0
172.16.0.0 0.0.255.255" rows="6" class="svelte-1n66kwe"></textarea> <div class="input-help svelte-1n66kwe">Enter one per line: CIDR (192.168.1.0/24), network + subnet mask (10.0.0.0 255.255.255.0), or network +
          wildcard mask (172.16.0.0 0.0.255.255)</div></div></div> <div class="acl-section svelte-1n66kwe"><h3 class="svelte-1n66kwe">ACL Options</h3> <div class="checkbox-group svelte-1n66kwe"><label class="checkbox-label svelte-1n66kwe"><input type="checkbox" class="svelte-1n66kwe"/> <span class="checkbox-text svelte-1n66kwe">Generate ACL Rules</span></label></div> <!></div></div> <!> <!></div>`);

export default function WildcardMask($$anchor, $$props) {
	$.push($$props, true);

	let inputText = $.state('192.168.1.0/24\n10.0.0.0 255.255.255.0\n172.16.0.0 0.0.255.255');
	let result = $.state(null);
	let isLoading = $.state(false);
	const clipboard = useClipboard();
	let _selectedExample = $.state(null);
	let selectedExampleIndex = $.state(null);
	let _userModified = $.state(false);

	const examples = [
		{
			label: 'Basic CIDR to Wildcard',
			input: `192.168.1.0/24
10.0.0.0/16
172.16.0.0/20`,
			generateACL: false
		},

		{
			label: 'Subnet Mask Format',
			input: `192.168.1.0 255.255.255.0
10.0.0.0 255.255.0.0
172.16.0.0 255.255.240.0`,
			generateACL: false
		},

		{
			label: 'Wildcard Mask Input',
			input: `192.168.0.0 0.0.255.255
10.0.0.0 0.255.255.255
172.16.0.0 0.0.15.255`,
			generateACL: false
		},

		{
			label: 'Mixed Formats',
			input: `192.168.1.0/24
10.0.0.0 255.255.0.0
172.16.0.0 0.0.255.255`,
			generateACL: false
		},

		{
			label: 'Cisco ACL Generation',
			input: `192.168.1.0/24
10.0.0.0/16`,
			generateACL: true
		},

		{
			label: 'Complex Network ACLs',
			input: `192.168.0.0/22
10.1.0.0/20
172.16.100.0/24`,
			generateACL: true
		}
	];

	// ACL options
	let generateACL = $.state(false);

	let aclType = $.state('permit');
	let protocol = $.state('ip');
	let destination = $.state('any');

	function convertMasks() {
		if (!$.get(inputText).trim()) {
			$.set(result, null);

			return;
		}

		$.set(isLoading, true);

		try {
			const inputs = $.get(inputText).split('\n').filter((line) => line.trim());

			$.set(
				result,
				convertWildcardMasks(inputs, {
					type: $.get(aclType),
					protocol: $.get(protocol) || 'ip',
					destination: $.get(destination) || 'any',
					generateACL: $.get(generateACL)
				}),
				true
			);
		} catch(error) {
			$.set(
				result,
				{
					conversions: [],
					aclRules: { cisco: [], juniper: [], generic: [] },
					summary: { totalInputs: 0, validInputs: 0, invalidInputs: 0 },
					errors: [error instanceof Error ? error.message : 'Unknown error']
				},
				true
			);
		} finally {
			$.set(isLoading, false);
		}
	}

	function exportResults(format) {
		if (!$.get(result)) return;

		const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
		let content = '';
		let filename = '';

		if (format === 'csv') {
			const headers = 'Input,Type,CIDR,Subnet Mask,Wildcard Mask,Prefix,Host Bits,Network,Broadcast,Total Hosts,Usable Hosts,Valid,Error';
			const rows = $.get(result).conversions.map((conv) => `"${conv.input}","${conv.inputType}","${conv.cidr}","${conv.subnetMask}","${conv.wildcardMask}","${conv.prefixLength}","${conv.hostBits}","${conv.networkAddress}","${conv.broadcastAddress}","${conv.totalHosts}","${conv.usableHosts}","${conv.isValid}","${conv.error || ''}"`);

			content = [headers, ...rows].join('\n');
			filename = `wildcard-masks-${timestamp}.csv`;
		} else {
			content = JSON.stringify($.get(result), null, 2);
			filename = `wildcard-masks-${timestamp}.json`;
		}

		const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');

		a.href = url;
		a.download = filename;
		a.click();
		URL.revokeObjectURL(url);
	}

	function copyACLRules(type) {
		if (!$.get(result)) return;

		const rules = $.get(result).aclRules[type];

		if (rules.length > 0) {
			clipboard.copy(rules.join('\n'), `acl-${type}`);
		}
	}

	function loadExample(example, index) {
		$.set(inputText, example.input, true);
		$.set(generateACL, example.generateACL, true);
		$.set(_selectedExample, example.label, true);
		$.set(selectedExampleIndex, index, true);
		$.set(_userModified, false);
	}

	function handleInputChange() {
		$.set(_userModified, true);
		$.set(_selectedExample, null);
		$.set(selectedExampleIndex, null);
	}

	// Auto-convert when inputs or ACL settings change
	$.user_effect(() => {
		if ($.get(inputText).trim()) {
			const timeoutId = setTimeout(convertMasks, 300);

			return () => clearTimeout(timeoutId);
		}
	});

	// Update ACL when settings change
	$.user_effect(() => {
		if ($.get(result) && $.get(generateACL)) {
			const timeoutId = setTimeout(convertMasks, 100);

			return () => clearTimeout(timeoutId);
		}
	});

	var div = root_17();
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
		var text = $.only_child(div_3, true);
		var div_4 = $.sibling(div_3, 2);
		var text_1 = $.only_child(div_4, true);

		$.reset(button);

		$.template_effect(() => {
			classes = $.set_class(button, 1, 'example-card', null, classes, { selected: $.get(selectedExampleIndex) === $.get(i) });
			$.set_text(text, $.get(example).label);
			$.set_text(text_1, $.get(example).generateACL ? 'With ACL' : 'Conversion only');
		});

		$.delegated('click', button, () => loadExample($.get(example), $.get(i)));
		$.append($$anchor, button);
	});

	$.reset(div_2);
	$.reset(details);
	$.reset(div_1);

	var div_5 = $.sibling(div_1, 2);
	var div_6 = $.child(div_5);
	var h3 = $.child(div_6);

	$.action(h3, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Enter networks in various formats for wildcard mask conversion');

	var div_7 = $.sibling(h3, 2);
	var label = $.child(div_7);

	$.action(label, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Enter networks in CIDR, subnet mask, or wildcard mask format');

	var textarea = $.sibling(label, 2);

	$.remove_textarea_child(textarea);
	$.next(2);
	$.reset(div_7);
	$.reset(div_6);

	var div_8 = $.sibling(div_6, 2);
	var h3_1 = $.child(div_8);

	$.action(h3_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Configure access control list rule generation for network devices');

	var div_9 = $.sibling(h3_1, 2);
	var label_1 = $.child(div_9);
	var input = $.child(label_1);

	$.remove_input_defaults(input);
	$.next(2);
	$.reset(label_1);
	$.action(label_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Generate access control list rules for network devices');
	$.reset(div_9);

	var node_1 = $.sibling(div_9, 2);

	{
		var consequent = ($$anchor) => {
			var div_10 = root_1();
			var div_11 = $.child(div_10);
			var label_2 = $.child(div_11);

			$.action(label_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Whether to permit or deny traffic matching this rule');

			var select = $.sibling(label_2, 2);
			var option = $.child(select);

			option.value = option.__value = 'permit';

			var option_1 = $.sibling(option);

			option_1.value = option_1.__value = 'deny';
			$.reset(select);
			$.init_select(select);
			$.reset(div_11);

			var div_12 = $.sibling(div_11, 2);
			var label_3 = $.child(div_12);

			$.action(label_3, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Network protocol (ip, tcp, udp, icmp, etc.)');

			var input_1 = $.sibling(label_3, 2);

			$.remove_input_defaults(input_1);
			$.reset(div_12);

			var div_13 = $.sibling(div_12, 2);
			var label_4 = $.child(div_13);

			$.action(label_4, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => "Destination network or 'any' for all destinations");

			var input_2 = $.sibling(label_4, 2);

			$.remove_input_defaults(input_2);
			$.reset(div_13);
			$.reset(div_10);
			$.delegated('change', select, handleInputChange);
			$.bind_select_value(select, () => $.get(aclType), ($$value) => $.set(aclType, $$value));
			$.delegated('input', input_1, handleInputChange);
			$.bind_value(input_1, () => $.get(protocol), ($$value) => $.set(protocol, $$value));
			$.delegated('input', input_2, handleInputChange);
			$.bind_value(input_2, () => $.get(destination), ($$value) => $.set(destination, $$value));
			$.append($$anchor, div_10);
		};

		$.if(node_1, ($$render) => {
			if ($.get(generateACL)) $$render(consequent);
		});
	}

	$.reset(div_8);
	$.reset(div_5);

	var node_2 = $.sibling(div_5, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_14 = root_2();
			var node_3 = $.child(div_14);

			Icon(node_3, { name: 'loader' });
			$.next();
			$.reset(div_14);
			$.append($$anchor, div_14);
		};

		$.if(node_2, ($$render) => {
			if ($.get(isLoading)) $$render(consequent_1);
		});
	}

	var node_4 = $.sibling(node_2, 2);

	{
		var consequent_10 = ($$anchor) => {
			var div_15 = root_16();
			var node_5 = $.child(div_15);

			{
				var consequent_2 = ($$anchor) => {
					var div_16 = root_4();
					var h3_2 = $.child(div_16);
					var node_6 = $.child(h3_2);

					Icon(node_6, { name: 'alert-triangle' });
					$.next();
					$.reset(h3_2);

					var node_7 = $.sibling(h3_2, 2);

					$.each(node_7, 17, () => $.get(result).errors, $.index, ($$anchor, error) => {
						var div_17 = root_3();
						var text_2 = $.only_child(div_17, true);

						$.template_effect(() => $.set_text(text_2, $.get(error)));
						$.append($$anchor, div_17);
					});

					$.reset(div_16);
					$.append($$anchor, div_16);
				};

				$.if(node_5, ($$render) => {
					if ($.get(result).errors.length > 0) $$render(consequent_2);
				});
			}

			var node_8 = $.sibling(node_5, 2);

			{
				var consequent_9 = ($$anchor) => {
					var fragment = root_15();
					var div_18 = $.first_child(fragment);
					var h3_3 = $.child(div_18);

					$.action(h3_3, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Overview of wildcard mask conversion results');

					var div_19 = $.sibling(h3_3, 2);
					var div_20 = $.child(div_19);
					var span = $.child(div_20);
					var text_3 = $.only_child(span, true);
					var span_1 = $.sibling(span, 2);

					$.action(span_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Total number of network inputs processed');
					$.reset(div_20);

					var div_21 = $.sibling(div_20, 2);
					var span_2 = $.child(div_21);
					var text_4 = $.only_child(span_2, true);
					var span_3 = $.sibling(span_2, 2);

					$.action(span_3, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Successfully converted network inputs');
					$.reset(div_21);

					var div_22 = $.sibling(div_21, 2);
					var span_4 = $.child(div_22);
					var text_5 = $.only_child(span_4, true);
					var span_5 = $.sibling(span_4, 2);

					$.action(span_5, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Network inputs that could not be converted');
					$.reset(div_22);
					$.reset(div_19);
					$.reset(div_18);

					var div_23 = $.sibling(div_18, 2);
					var div_24 = $.child(div_23);
					var h3_4 = $.child(div_24);

					$.action(h3_4, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Detailed conversion results for each network input');

					var div_25 = $.sibling(h3_4, 2);
					var button_1 = $.child(div_25);
					var node_9 = $.child(button_1);

					Icon(node_9, { name: 'csv-file' });
					$.next();
					$.reset(button_1);

					var button_2 = $.sibling(button_1, 2);
					var node_10 = $.child(button_2);

					Icon(node_10, { name: 'json-file' });
					$.next();
					$.reset(button_2);
					$.reset(div_25);
					$.reset(div_24);

					var div_26 = $.sibling(div_24, 2);

					$.each(div_26, 21, () => $.get(result).conversions, $.index, ($$anchor, conversion) => {
						var div_27 = root_9();
						let classes_1;
						var div_28 = $.child(div_27);
						var div_29 = $.child(div_28);
						var span_6 = $.child(div_29);
						var text_6 = $.only_child(span_6, true);
						var span_7 = $.sibling(span_6, 2);
						var text_7 = $.only_child(span_7, true);

						$.reset(div_29);

						var div_30 = $.sibling(div_29, 2);
						var node_11 = $.child(div_30);

						{
							var consequent_3 = ($$anchor) => {
								var fragment_1 = root_5();
								var node_12 = $.first_child(fragment_1);

								Icon(node_12, { name: 'check-circle' });
								$.next();
								$.append($$anchor, fragment_1);
							};

							var alternate = ($$anchor) => {
								var fragment_2 = root_6();
								var node_13 = $.first_child(fragment_2);

								Icon(node_13, { name: 'x-circle' });
								$.next();
								$.append($$anchor, fragment_2);
							};

							$.if(node_11, ($$render) => {
								if ($.get(conversion).isValid) $$render(consequent_3); else $$render(alternate, -1);
							});
						}

						$.reset(div_30);
						$.reset(div_28);

						var node_14 = $.sibling(div_28, 2);

						{
							var consequent_4 = ($$anchor) => {
								var div_31 = root_7();
								var div_32 = $.child(div_31);
								var span_8 = $.child(div_32);

								$.action(span_8, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Classless Inter-Domain Routing notation');

								var div_33 = $.sibling(span_8, 2);
								var code = $.child(div_33);
								var text_8 = $.only_child(code, true);
								var button_3 = $.sibling(code, 2);
								let classes_2;
								var node_15 = $.child(button_3);

								{
									let $0 = $.derived(() => clipboard.isCopied($.get(conversion).cidr) ? 'check' : 'copy');

									Icon(node_15, {
										get name() {
											return $.get($0);
										},
										size: 'xs'
									});
								}

								$.reset(button_3);
								$.action(button_3, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => ({ text: 'Copy to clipboard', position: 'top' }));
								$.reset(div_33);
								$.reset(div_32);

								var div_34 = $.sibling(div_32, 2);
								var span_9 = $.child(div_34);

								$.action(span_9, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Standard subnet mask in dotted decimal notation');

								var div_35 = $.sibling(span_9, 2);
								var code_1 = $.child(div_35);
								var text_9 = $.only_child(code_1, true);
								var button_4 = $.sibling(code_1, 2);
								let classes_3;
								var node_16 = $.child(button_4);

								{
									let $0 = $.derived(() => clipboard.isCopied($.get(conversion).subnetMask) ? 'check' : 'copy');

									Icon(node_16, {
										get name() {
											return $.get($0);
										},
										size: 'xs'
									});
								}

								$.reset(button_4);
								$.action(button_4, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => ({ text: 'Copy to clipboard', position: 'top' }));
								$.reset(div_35);
								$.reset(div_34);

								var div_36 = $.sibling(div_34, 2);
								var span_10 = $.child(div_36);

								$.action(span_10, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Inverse subnet mask used in Cisco ACLs and OSPF');

								var div_37 = $.sibling(span_10, 2);
								var code_2 = $.child(div_37);
								var text_10 = $.only_child(code_2, true);
								var button_5 = $.sibling(code_2, 2);
								let classes_4;
								var node_17 = $.child(button_5);

								{
									let $0 = $.derived(() => clipboard.isCopied($.get(conversion).wildcardMask) ? 'check' : 'copy');

									Icon(node_17, {
										get name() {
											return $.get($0);
										},
										size: 'xs'
									});
								}

								$.reset(button_5);
								$.action(button_5, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => ({ text: 'Copy to clipboard', position: 'top' }));
								$.reset(div_37);
								$.reset(div_36);

								var div_38 = $.sibling(div_36, 2);
								var div_39 = $.child(div_38);
								var div_40 = $.child(div_39);
								var span_11 = $.child(div_40);

								$.action(span_11, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'First address in the network range');

								var span_12 = $.sibling(span_11, 2);
								var text_11 = $.only_child(span_12, true);

								$.reset(div_40);

								var div_41 = $.sibling(div_40, 2);
								var span_13 = $.child(div_41);

								$.action(span_13, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Last address in the network range');

								var span_14 = $.sibling(span_13, 2);
								var text_12 = $.only_child(span_14, true);

								$.reset(div_41);

								var div_42 = $.sibling(div_41, 2);
								var span_15 = $.child(div_42);

								$.action(span_15, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Number of bits available for host addresses');

								var span_16 = $.sibling(span_15, 2);
								var text_13 = $.only_child(span_16, true);

								$.reset(div_42);

								var div_43 = $.sibling(div_42, 2);
								var span_17 = $.child(div_43);

								$.action(span_17, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Total assignable host addresses (excluding network and broadcast)');

								var span_18 = $.sibling(span_17, 2);
								var text_14 = $.only_child(span_18, true);

								$.reset(div_43);
								$.reset(div_39);
								$.reset(div_38);
								$.reset(div_31);

								$.template_effect(
									($0, $1, $2, $3) => {
										$.set_text(text_8, $.get(conversion).cidr);
										classes_2 = $.set_class(button_3, 1, 'btn btn-icon btn-xs svelte-1n66kwe', null, classes_2, { copied: $0 });
										$.set_text(text_9, $.get(conversion).subnetMask);
										classes_3 = $.set_class(button_4, 1, 'btn btn-icon btn-xs svelte-1n66kwe', null, classes_3, { copied: $1 });
										$.set_text(text_10, $.get(conversion).wildcardMask);
										classes_4 = $.set_class(button_5, 1, 'btn btn-icon btn-xs svelte-1n66kwe', null, classes_4, { copied: $2 });
										$.set_text(text_11, $.get(conversion).networkAddress);
										$.set_text(text_12, $.get(conversion).broadcastAddress);
										$.set_text(text_13, $.get(conversion).hostBits);
										$.set_text(text_14, $3);
									},
									[
										() => clipboard.isCopied($.get(conversion).cidr),
										() => clipboard.isCopied($.get(conversion).subnetMask),
										() => clipboard.isCopied($.get(conversion).wildcardMask),
										() => formatNumber($.get(conversion).usableHosts)
									]
								);

								$.delegated('click', button_3, () => clipboard.copy($.get(conversion).cidr, $.get(conversion).cidr));
								$.delegated('click', button_4, () => clipboard.copy($.get(conversion).subnetMask, $.get(conversion).subnetMask));
								$.delegated('click', button_5, () => clipboard.copy($.get(conversion).wildcardMask, $.get(conversion).wildcardMask));
								$.append($$anchor, div_31);
							};

							var alternate_1 = ($$anchor) => {
								var div_44 = root_8();
								var node_18 = $.child(div_44);

								Icon(node_18, { name: 'alert-triangle' });

								var text_15 = $.sibling(node_18);

								$.reset(div_44);
								$.template_effect(() => $.set_text(text_15, ` ${$.get(conversion).error ?? ''}`));
								$.append($$anchor, div_44);
							};

							$.if(node_14, ($$render) => {
								if ($.get(conversion).isValid) $$render(consequent_4); else $$render(alternate_1, -1);
							});
						}

						$.reset(div_27);

						$.template_effect(
							($0) => {
								classes_1 = $.set_class(div_27, 1, 'conversion-card svelte-1n66kwe', null, classes_1, {
									aligned: $.get(conversion).isValid,
									misaligned: !$.get(conversion).isValid
								});

								$.set_text(text_6, $.get(conversion).input);
								$.set_text(text_7, $0);
							},
							[
								() => $.get(conversion).inputType.replace('-', ' ').toUpperCase()
							]
						);

						$.append($$anchor, div_27);
					});

					$.reset(div_26);
					$.reset(div_23);

					var node_19 = $.sibling(div_23, 2);

					{
						var consequent_8 = ($$anchor) => {
							var div_45 = root_14();
							var h3_5 = $.child(div_45);

							$.action(h3_5, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Access control list rules generated for network devices');

							var node_20 = $.sibling(h3_5, 2);

							{
								var consequent_5 = ($$anchor) => {
									var div_46 = root_11();
									var div_47 = $.child(div_46);
									var h4 = $.child(div_47);

									$.action(h4, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Cisco IOS access control list format');

									var button_6 = $.sibling(h4, 2);
									var node_21 = $.child(button_6);

									{
										let $0 = $.derived(() => clipboard.isCopied('acl-cisco') ? 'check' : 'copy');

										Icon(node_21, {
											get name() {
												return $.get($0);
											},
											size: 'xs'
										});
									}

									var text_16 = $.sibling(node_21);

									$.reset(button_6);
									$.action(button_6, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Copy all Cisco ACL rules to clipboard');
									$.reset(div_47);

									var div_48 = $.sibling(div_47, 2);

									$.each(div_48, 21, () => $.get(result).aclRules.cisco, $.index, ($$anchor, rule) => {
										var div_49 = root_10();
										var text_17 = $.only_child(div_49, true);

										$.template_effect(() => $.set_text(text_17, $.get(rule)));
										$.append($$anchor, div_49);
									});

									$.reset(div_48);
									$.reset(div_46);

									$.template_effect(
										($0, $1) => {
											$.set_class(button_6, 1, `copy-btn ${$0 ?? ''}`, 'svelte-1n66kwe');
											$.set_text(text_16, ` ${$1 ?? ''}`);
										},
										[
											() => clipboard.isCopied('acl-cisco') ? 'copied' : '',
											() => clipboard.isCopied('acl-cisco') ? 'Copied!' : 'Copy'
										]
									);

									$.delegated('click', button_6, () => copyACLRules('cisco'));
									$.append($$anchor, div_46);
								};

								$.if(node_20, ($$render) => {
									if ($.get(result).aclRules.cisco.length > 0) $$render(consequent_5);
								});
							}

							var node_22 = $.sibling(node_20, 2);

							{
								var consequent_6 = ($$anchor) => {
									var div_50 = root_12();
									var div_51 = $.child(div_50);
									var h4_1 = $.child(div_51);

									$.action(h4_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Juniper JunOS firewall filter format');

									var button_7 = $.sibling(h4_1, 2);
									var node_23 = $.child(button_7);

									{
										let $0 = $.derived(() => clipboard.isCopied('acl-juniper') ? 'check' : 'copy');

										Icon(node_23, {
											get name() {
												return $.get($0);
											},
											size: 'xs'
										});
									}

									var text_18 = $.sibling(node_23);

									$.reset(button_7);
									$.action(button_7, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Copy all Juniper ACL rules to clipboard');
									$.reset(div_51);

									var div_52 = $.sibling(div_51, 2);

									$.each(div_52, 21, () => $.get(result).aclRules.juniper, $.index, ($$anchor, rule) => {
										var div_53 = root_10();
										var text_19 = $.only_child(div_53, true);

										$.template_effect(() => $.set_text(text_19, $.get(rule)));
										$.append($$anchor, div_53);
									});

									$.reset(div_52);
									$.reset(div_50);

									$.template_effect(
										($0, $1) => {
											$.set_class(button_7, 1, `copy-btn ${$0 ?? ''}`, 'svelte-1n66kwe');
											$.set_text(text_18, ` ${$1 ?? ''}`);
										},
										[
											() => clipboard.isCopied('acl-juniper') ? 'copied' : '',
											() => clipboard.isCopied('acl-juniper') ? 'Copied!' : 'Copy'
										]
									);

									$.delegated('click', button_7, () => copyACLRules('juniper'));
									$.append($$anchor, div_50);
								};

								$.if(node_22, ($$render) => {
									if ($.get(result).aclRules.juniper.length > 0) $$render(consequent_6);
								});
							}

							var node_24 = $.sibling(node_22, 2);

							{
								var consequent_7 = ($$anchor) => {
									var div_54 = root_13();
									var div_55 = $.child(div_54);
									var h4_2 = $.child(div_55);

									$.action(h4_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Generic access control list format');

									var button_8 = $.sibling(h4_2, 2);
									var node_25 = $.child(button_8);

									{
										let $0 = $.derived(() => clipboard.isCopied('acl-generic') ? 'check' : 'copy');

										Icon(node_25, {
											get name() {
												return $.get($0);
											},
											size: 'xs'
										});
									}

									var text_20 = $.sibling(node_25);

									$.reset(button_8);
									$.action(button_8, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Copy all generic ACL rules to clipboard');
									$.reset(div_55);

									var div_56 = $.sibling(div_55, 2);

									$.each(div_56, 21, () => $.get(result).aclRules.generic, $.index, ($$anchor, rule) => {
										var div_57 = root_10();
										var text_21 = $.only_child(div_57, true);

										$.template_effect(() => $.set_text(text_21, $.get(rule)));
										$.append($$anchor, div_57);
									});

									$.reset(div_56);
									$.reset(div_54);

									$.template_effect(
										($0, $1) => {
											$.set_class(button_8, 1, `copy-btn ${$0 ?? ''}`, 'svelte-1n66kwe');
											$.set_text(text_20, ` ${$1 ?? ''}`);
										},
										[
											() => clipboard.isCopied('acl-generic') ? 'copied' : '',
											() => clipboard.isCopied('acl-generic') ? 'Copied!' : 'Copy'
										]
									);

									$.delegated('click', button_8, () => copyACLRules('generic'));
									$.append($$anchor, div_54);
								};

								$.if(node_24, ($$render) => {
									if ($.get(result).aclRules.generic.length > 0) $$render(consequent_7);
								});
							}

							$.reset(div_45);
							$.append($$anchor, div_45);
						};

						$.if(node_19, ($$render) => {
							if ($.get(generateACL) && ($.get(result).aclRules.cisco.length > 0 || $.get(result).aclRules.juniper.length > 0 || $.get(result).aclRules.generic.length > 0)) $$render(consequent_8);
						});
					}

					$.template_effect(() => {
						$.set_text(text_3, $.get(result).summary.totalInputs);
						$.set_text(text_4, $.get(result).summary.validInputs);
						$.set_text(text_5, $.get(result).summary.invalidInputs);
					});

					$.delegated('click', button_1, () => exportResults('csv'));
					$.delegated('click', button_2, () => exportResults('json'));
					$.append($$anchor, fragment);
				};

				$.if(node_8, ($$render) => {
					if ($.get(result).conversions.length > 0) $$render(consequent_9);
				});
			}

			$.reset(div_15);
			$.append($$anchor, div_15);
		};

		$.if(node_4, ($$render) => {
			if ($.get(result)) $$render(consequent_10);
		});
	}

	$.reset(div);
	$.delegated('input', textarea, handleInputChange);
	$.bind_value(textarea, () => $.get(inputText), ($$value) => $.set(inputText, $$value));
	$.delegated('change', input, handleInputChange);
	$.bind_checked(input, () => $.get(generateACL), ($$value) => $.set(generateACL, $$value));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'input', 'change']);