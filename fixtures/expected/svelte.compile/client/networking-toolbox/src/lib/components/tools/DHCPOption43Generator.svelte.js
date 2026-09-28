import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { generateOption43, parseIPList, isValidIPv4, VENDOR_INFO } from '$lib/utils/dhcp-option43';
import { useClipboard, useExamples } from '$lib/composables';
import Icon from '$lib/components/global/Icon.svelte';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';

var root = $.from_html(`<option> </option>`);
var root_1 = $.from_html(`<div class="error-message svelte-16rb1ok"><!> </div>`);
var root_2 = $.from_html(`<div class="errors svelte-16rb1ok"></div>`);
var root_3 = $.from_html(`<li class="svelte-16rb1ok"> </li>`);
var root_4 = $.from_html(`<div class="ios-command-section svelte-16rb1ok"><div class="ios-header svelte-16rb1ok"><h4 class="svelte-16rb1ok"><!> </h4> <button type="button"><!> </button></div> <pre class="ios-command svelte-16rb1ok"> </pre> <div class="workings svelte-16rb1ok"><h5 class="svelte-16rb1ok">How this value is calculated:</h5> <ul class="svelte-16rb1ok"></ul></div></div>`);
var root_5 = $.from_html(`<div class="card results svelte-16rb1ok"><h3 class="svelte-16rb1ok">Generated Option 43 Values</h3> <!> <div class="explanation svelte-16rb1ok"><!> <p class="svelte-16rb1ok"> </p></div> <div class="output-formats svelte-16rb1ok"><div class="output-group svelte-16rb1ok"><div class="output-header svelte-16rb1ok"><h4 class="svelte-16rb1ok">Hexadecimal String</h4> <button type="button"><!> </button></div> <code class="output-value svelte-16rb1ok"> </code> <p class="format-hint svelte-16rb1ok">Raw hexadecimal - used in most DHCP server configurations</p></div> <div class="output-group svelte-16rb1ok"><div class="output-header svelte-16rb1ok"><h4 class="svelte-16rb1ok">Colon-Separated Hex</h4> <button type="button"><!> </button></div> <code class="output-value svelte-16rb1ok"> </code> <p class="format-hint svelte-16rb1ok">Used by Infoblox and some network appliances</p></div> <div class="output-group svelte-16rb1ok"><div class="output-header svelte-16rb1ok"><h4 class="svelte-16rb1ok">Windows DHCP Binary</h4> <button type="button"><!> </button></div> <code class="output-value svelte-16rb1ok"> </code> <p class="format-hint svelte-16rb1ok">Enter in Windows DHCP Server's Binary field for Option 43</p></div> <div class="output-group svelte-16rb1ok"><div class="output-header svelte-16rb1ok"><h4 class="svelte-16rb1ok">ISC DHCP Configuration</h4> <button type="button"><!> </button></div> <pre class="output-value code-block svelte-16rb1ok"> </pre> <p class="format-hint svelte-16rb1ok">Add to dhcpd.conf for ISC DHCP server</p></div> <div class="output-group svelte-16rb1ok"><div class="output-header svelte-16rb1ok"><h4 class="svelte-16rb1ok">Mikrotik Configuration</h4> <button type="button"><!> </button></div> <code class="output-value svelte-16rb1ok"> </code> <p class="format-hint svelte-16rb1ok">RouterOS DHCP option configuration command</p></div></div></div> <div class="card info svelte-16rb1ok"><h3 class="svelte-16rb1ok">Important Notes</h3> <ul class="notes-list svelte-16rb1ok"><li class="svelte-16rb1ok"><strong class="svelte-16rb1ok">DHCP Option 43</strong> is vendor-specific and must match the AP manufacturer's expected format</li> <li class="svelte-16rb1ok">Some vendors require <strong class="svelte-16rb1ok">Option 60</strong> (Vendor Class Identifier) to be set in addition to Option 43</li> <li class="svelte-16rb1ok">Ensure controller IPs are reachable from the AP management network</li> <li class="svelte-16rb1ok">For high availability, configure <strong class="svelte-16rb1ok">multiple controller IPs</strong> when supported</li> <li class="svelte-16rb1ok">Changes to DHCP options require AP to renew lease or reboot to take effect</li> <li class="svelte-16rb1ok">Always test in a controlled environment before deploying to production networks</li></ul></div>`, 1);
var root_6 = $.from_html(`<!> <div class="card input-card svelte-16rb1ok"><div class="card-header"><h3 class="svelte-16rb1ok">Generator Configuration</h3></div> <div class="card-content"><section class="inputs svelte-16rb1ok"><div class="input-group svelte-16rb1ok"><label for="vendor" class="svelte-16rb1ok"><!> Wireless Controller Vendor</label> <select id="vendor" class="svelte-16rb1ok"></select> <span class="help-text svelte-16rb1ok"> </span></div> <div class="input-group svelte-16rb1ok"><label for="ip-input" class="svelte-16rb1ok"><!> <span class="label-hint svelte-16rb1ok"> </span></label> <textarea id="ip-input" rows="3" class="svelte-16rb1ok"></textarea> <div class="input-actions svelte-16rb1ok"><button type="button" class="btn-primary svelte-16rb1ok"><!> Generate</button></div></div> <!></section></div></div> <!>`, 1);

export default function DHCPOption43Generator($$anchor, $$props) {
	$.push($$props, true);

	let vendorType = $.state('cisco-catalyst');
	let ipInput = $.state('');
	let result = $.state(null);
	let errors = $.state($.proxy([]));
	const clipboard = useClipboard();
	const vendorInfo = $.derived(() => VENDOR_INFO[$.get(vendorType)]);

	const examplesList = [
		{
			vendor: 'cisco-catalyst',
			ips: '192.168.1.10\n192.168.1.11',
			description: 'Cisco Catalyst with dual controllers'
		},

		{
			vendor: 'cisco-meraki',
			ips: '192.168.10.5',
			description: 'Single Meraki cloud controller'
		},

		{
			vendor: 'ruckus-smartzone',
			ips: '10.0.0.100',
			description: 'Ruckus SmartZone controller'
		},

		{
			vendor: 'aruba',
			ips: '172.16.1.50',
			description: 'Aruba wireless controller'
		},

		{
			vendor: 'unifi',
			ips: '192.168.1.20',
			description: 'UniFi Network Controller'
		},

		{
			vendor: 'ruckus-zonedirector',
			ips: '10.50.100.200',
			description: 'Ruckus ZoneDirector (legacy)'
		}
	];

	const examples = useExamples(examplesList);

	function generate() {
		$.set(errors, [], true);
		$.set(result, null);

		const ips = parseIPList($.get(ipInput));

		if (ips.length === 0) {
			$.set(errors, ['Please enter at least one IP address'], true);

			return;
		}

		// Validate each IP
		const invalidIPs = ips.filter((ip) => !isValidIPv4(ip));

		if (invalidIPs.length > 0) {
			$.set(errors, [`Invalid IP address format: ${invalidIPs.join(', ')}`], true);

			return;
		}

		// Check max IPs for vendor
		if (ips.length > $.get(vendorInfo).maxIPs) {
			$.set(
				errors,
				[
					`${$.get(vendorInfo).name} supports maximum ${$.get(vendorInfo).maxIPs} controller${$.get(vendorInfo).maxIPs > 1 ? 's' : ''}. You entered ${ips.length}.`
				],
				true
			);

			return;
		}

		try {
			$.set(result, generateOption43($.get(vendorType), ips), true);
		} catch(error) {
			$.set(
				errors,
				[
					error instanceof Error ? error.message : 'Unknown error occurred'
				],
				true
			);
		}
	}

	function loadExample(example, index) {
		$.set(vendorType, example.vendor, true);
		$.set(ipInput, example.ips, true);
		examples.select(index);
		generate();
	}

	var fragment = root_6();
	var node = $.first_child(fragment);

	ExamplesCard(node, {
		get examples() {
			return examplesList;
		},

		get selectedIndex() {
			return examples.selectedIndex;
		},
		onSelect: loadExample,
		getLabel: (ex) => VENDOR_INFO[ex.vendor].name,
		getDescription: (ex) => ex.description,
		getTooltip: (ex) => `Generate Option 43 for ${VENDOR_INFO[ex.vendor].name}`
	});

	var div = $.sibling(node, 2);
	var div_1 = $.sibling($.child(div), 2);
	var section = $.child(div_1);
	var div_2 = $.child(section);
	var label = $.child(div_2);
	var node_1 = $.child(label);

	Icon(node_1, { name: 'wifi', size: 'sm' });
	$.next();
	$.reset(label);

	var select = $.sibling(label, 2);

	$.each(select, 21, () => Object.entries(VENDOR_INFO), ([value, info]) => value, ($$anchor, $$item) => {
		var $$array = $.derived(() => $.to_array($.get($$item), 2));
		let value = () => $.get($$array)[0];
		let info = () => $.get($$array)[1];
		var option = root();
		var text = $.only_child(option, true);
		var option_value = {};

		$.template_effect(() => {
			$.set_text(text, info().name);

			if (option_value !== (option_value = value())) {
				option.value = (option.__value = option_value) ?? '';
			}
		});

		$.append($$anchor, option);
	});

	$.reset(select);
	$.init_select(select);

	var span = $.sibling(select, 2);
	var text_1 = $.only_child(span, true);

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var label_1 = $.child(div_3);
	var node_2 = $.child(label_1);

	Icon(node_2, { name: 'network', size: 'sm' });

	var text_2 = $.sibling(node_2);
	var span_1 = $.sibling(text_2);
	var text_3 = $.only_child(span_1);

	$.reset(label_1);

	var textarea = $.sibling(label_1, 2);

	$.remove_textarea_child(textarea);

	var div_4 = $.sibling(textarea, 2);
	var button = $.child(div_4);
	var node_3 = $.child(button);

	Icon(node_3, { name: 'zap', size: 'sm' });
	$.next();
	$.reset(button);
	$.reset(div_4);
	$.reset(div_3);

	var node_4 = $.sibling(div_3, 2);

	{
		var consequent = ($$anchor) => {
			var div_5 = root_2();

			$.each(div_5, 21, () => $.get(errors), $.index, ($$anchor, error) => {
				var div_6 = root_1();
				var node_5 = $.child(div_6);

				Icon(node_5, { name: 'alert-triangle', size: 'sm' });

				var text_4 = $.sibling(node_5);

				$.reset(div_6);
				$.template_effect(() => $.set_text(text_4, ` ${$.get(error) ?? ''}`));
				$.append($$anchor, div_6);
			});

			$.reset(div_5);
			$.append($$anchor, div_5);
		};

		$.if(node_4, ($$render) => {
			if ($.get(errors).length > 0) $$render(consequent);
		});
	}

	$.reset(section);
	$.reset(div_1);
	$.reset(div);

	var node_6 = $.sibling(div, 2);

	{
		var consequent_2 = ($$anchor) => {
			var fragment_1 = root_5();
			var div_7 = $.first_child(fragment_1);
			var node_7 = $.sibling($.child(div_7), 2);

			{
				var consequent_1 = ($$anchor) => {
					var div_8 = root_4();
					var div_9 = $.child(div_8);
					var h4 = $.child(div_9);
					var node_8 = $.child(h4);

					Icon(node_8, { name: 'terminal', size: 'sm' });

					var text_5 = $.sibling(node_8);

					$.reset(h4);

					var button_1 = $.sibling(h4, 2);
					let classes;
					var node_9 = $.child(button_1);

					{
						let $0 = $.derived(() => clipboard.isCopied('ios') ? 'check' : 'copy');

						Icon(node_9, {
							get name() {
								return $.get($0);
							},
							size: 'xs'
						});
					}

					var text_6 = $.sibling(node_9);

					$.reset(button_1);
					$.reset(div_9);

					var pre = $.sibling(div_9, 2);
					var text_7 = $.only_child(pre, true);
					var div_10 = $.sibling(pre, 2);
					var ul = $.sibling($.child(div_10), 2);

					$.each(ul, 21, () => $.get(result).workings, $.index, ($$anchor, working) => {
						var li = root_3();
						var text_8 = $.only_child(li, true);

						$.template_effect(() => $.set_text(text_8, $.get(working)));
						$.append($$anchor, li);
					});

					$.reset(ul);
					$.reset(div_10);
					$.reset(div_8);

					$.template_effect(
						($0, $1) => {
							$.set_text(text_5, ` ${($.get(result).commandLabel || 'DHCP Server Command') ?? ''}`);
							classes = $.set_class(button_1, 1, 'copy-btn svelte-16rb1ok', null, classes, { copied: $0 });
							$.set_text(text_6, ` ${$1 ?? ''}`);
							$.set_text(text_7, $.get(result).iosCommand);
						},
						[
							() => clipboard.isCopied('ios'),
							() => clipboard.isCopied('ios') ? 'Copied' : 'Copy'
						]
					);

					$.delegated('click', button_1, () => clipboard.copy($.get(result).iosCommand, 'ios'));
					$.append($$anchor, div_8);
				};

				$.if(node_7, ($$render) => {
					if ($.get(result).iosCommand && $.get(result).workings) $$render(consequent_1);
				});
			}

			var div_11 = $.sibling(node_7, 2);
			var node_10 = $.child(div_11);

			Icon(node_10, { name: 'info', size: 'sm' });

			var p = $.sibling(node_10, 2);
			var text_9 = $.only_child(p, true);

			$.reset(div_11);

			var div_12 = $.sibling(div_11, 2);
			var div_13 = $.child(div_12);
			var div_14 = $.child(div_13);
			var button_2 = $.sibling($.child(div_14), 2);
			let classes_1;
			var node_11 = $.child(button_2);

			{
				let $0 = $.derived(() => clipboard.isCopied('hex') ? 'check' : 'copy');

				Icon(node_11, {
					get name() {
						return $.get($0);
					},
					size: 'xs'
				});
			}

			var text_10 = $.sibling(node_11);

			$.reset(button_2);
			$.reset(div_14);

			var code = $.sibling(div_14, 2);
			var text_11 = $.only_child(code, true);

			$.next(2);
			$.reset(div_13);

			var div_15 = $.sibling(div_13, 2);
			var div_16 = $.child(div_15);
			var button_3 = $.sibling($.child(div_16), 2);
			let classes_2;
			var node_12 = $.child(button_3);

			{
				let $0 = $.derived(() => clipboard.isCopied('colonHex') ? 'check' : 'copy');

				Icon(node_12, {
					get name() {
						return $.get($0);
					},
					size: 'xs'
				});
			}

			var text_12 = $.sibling(node_12);

			$.reset(button_3);
			$.reset(div_16);

			var code_1 = $.sibling(div_16, 2);
			var text_13 = $.only_child(code_1, true);

			$.next(2);
			$.reset(div_15);

			var div_17 = $.sibling(div_15, 2);
			var div_18 = $.child(div_17);
			var button_4 = $.sibling($.child(div_18), 2);
			let classes_3;
			var node_13 = $.child(button_4);

			{
				let $0 = $.derived(() => clipboard.isCopied('windows') ? 'check' : 'copy');

				Icon(node_13, {
					get name() {
						return $.get($0);
					},
					size: 'xs'
				});
			}

			var text_14 = $.sibling(node_13);

			$.reset(button_4);
			$.reset(div_18);

			var code_2 = $.sibling(div_18, 2);
			var text_15 = $.only_child(code_2, true);

			$.next(2);
			$.reset(div_17);

			var div_19 = $.sibling(div_17, 2);
			var div_20 = $.child(div_19);
			var button_5 = $.sibling($.child(div_20), 2);
			let classes_4;
			var node_14 = $.child(button_5);

			{
				let $0 = $.derived(() => clipboard.isCopied('isc') ? 'check' : 'copy');

				Icon(node_14, {
					get name() {
						return $.get($0);
					},
					size: 'xs'
				});
			}

			var text_16 = $.sibling(node_14);

			$.reset(button_5);
			$.reset(div_20);

			var pre_1 = $.sibling(div_20, 2);
			var text_17 = $.only_child(pre_1, true);

			$.next(2);
			$.reset(div_19);

			var div_21 = $.sibling(div_19, 2);
			var div_22 = $.child(div_21);
			var button_6 = $.sibling($.child(div_22), 2);
			let classes_5;
			var node_15 = $.child(button_6);

			{
				let $0 = $.derived(() => clipboard.isCopied('mikrotik') ? 'check' : 'copy');

				Icon(node_15, {
					get name() {
						return $.get($0);
					},
					size: 'xs'
				});
			}

			var text_18 = $.sibling(node_15);

			$.reset(button_6);
			$.reset(div_22);

			var code_3 = $.sibling(div_22, 2);
			var text_19 = $.only_child(code_3, true);

			$.next(2);
			$.reset(div_21);
			$.reset(div_12);
			$.reset(div_7);
			$.next(2);

			$.template_effect(
				($0, $1, $2, $3, $4, $5, $6, $7, $8, $9) => {
					$.set_text(text_9, $.get(result).explanation);
					classes_1 = $.set_class(button_2, 1, 'copy-btn svelte-16rb1ok', null, classes_1, { copied: $0 });
					$.set_text(text_10, ` ${$1 ?? ''}`);
					$.set_text(text_11, $.get(result).hex);
					classes_2 = $.set_class(button_3, 1, 'copy-btn svelte-16rb1ok', null, classes_2, { copied: $2 });
					$.set_text(text_12, ` ${$3 ?? ''}`);
					$.set_text(text_13, $.get(result).colonHex);
					classes_3 = $.set_class(button_4, 1, 'copy-btn svelte-16rb1ok', null, classes_3, { copied: $4 });
					$.set_text(text_14, ` ${$5 ?? ''}`);
					$.set_text(text_15, $.get(result).windowsBinary);
					classes_4 = $.set_class(button_5, 1, 'copy-btn svelte-16rb1ok', null, classes_4, { copied: $6 });
					$.set_text(text_16, ` ${$7 ?? ''}`);
					$.set_text(text_17, $.get(result).iscDhcp);
					classes_5 = $.set_class(button_6, 1, 'copy-btn svelte-16rb1ok', null, classes_5, { copied: $8 });
					$.set_text(text_18, ` ${$9 ?? ''}`);
					$.set_text(text_19, $.get(result).mikrotik);
				},
				[
					() => clipboard.isCopied('hex'),
					() => clipboard.isCopied('hex') ? 'Copied' : 'Copy',
					() => clipboard.isCopied('colonHex'),
					() => clipboard.isCopied('colonHex') ? 'Copied' : 'Copy',
					() => clipboard.isCopied('windows'),
					() => clipboard.isCopied('windows') ? 'Copied' : 'Copy',
					() => clipboard.isCopied('isc'),
					() => clipboard.isCopied('isc') ? 'Copied' : 'Copy',
					() => clipboard.isCopied('mikrotik'),
					() => clipboard.isCopied('mikrotik') ? 'Copied' : 'Copy'
				]
			);

			$.delegated('click', button_2, () => clipboard.copy($.get(result).hex, 'hex'));
			$.delegated('click', button_3, () => clipboard.copy($.get(result).colonHex, 'colonHex'));
			$.delegated('click', button_4, () => clipboard.copy($.get(result).windowsBinary, 'windows'));
			$.delegated('click', button_5, () => clipboard.copy($.get(result).iscDhcp, 'isc'));
			$.delegated('click', button_6, () => clipboard.copy($.get(result).mikrotik, 'mikrotik'));
			$.append($$anchor, fragment_1);
		};

		$.if(node_6, ($$render) => {
			if ($.get(result)) $$render(consequent_2);
		});
	}

	$.template_effect(() => {
		$.set_text(text_1, $.get(vendorInfo).description);
		$.set_text(text_2, ` Controller IP Address${$.get(vendorInfo).maxIPs > 1 ? 'es' : ''} `);
		$.set_text(text_3, `(max ${$.get(vendorInfo).maxIPs ?? ''})`);
		$.set_attribute(textarea, 'placeholder', `Enter IP address${$.get(vendorInfo).maxIPs > 1 ? 'es' : ''} (one per line or comma-separated)\ne.g., 192.168.1.10, 192.168.1.11`);
	});

	$.delegated('change', select, () => {
		$.set(result, null);
		examples.clear();
	});

	$.bind_select_value(select, () => $.get(vendorType), ($$value) => $.set(vendorType, $$value));
	$.delegated('change', textarea, () => examples.clear());
	$.bind_value(textarea, () => $.get(ipInput), ($$value) => $.set(ipInput, $$value));
	$.delegated('click', button, generate);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['change', 'click']);