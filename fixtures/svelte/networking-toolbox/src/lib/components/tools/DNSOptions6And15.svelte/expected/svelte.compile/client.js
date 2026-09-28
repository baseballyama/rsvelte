import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	buildDNSOptions,
	decodeDNSServersOption,
	decodeDomainNameOption,
	validateDNSConfig,
	DNS_EXAMPLES
} from '$lib/utils/dhcp-options6-15-dns';

import { untrack } from 'svelte';
import ToolContentContainer from '$lib/components/global/ToolContentContainer.svelte';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import { useClipboard } from '$lib/composables/useClipboard.svelte';
import { tooltip } from '$lib/actions/tooltip';

var root = $.from_html(`<button class="btn btn-danger btn-sm svelte-18fg3vi">Remove</button>`);
var root_1 = $.from_html(`<div class="server-row svelte-18fg3vi"><input type="text" placeholder="e.g., 8.8.8.8" class="input svelte-18fg3vi"/> <!></div>`);
var root_2 = $.from_html(`<li> </li>`);
var root_3 = $.from_html(`<div class="error-card svelte-18fg3vi"><strong class="svelte-18fg3vi">Validation Errors:</strong> <ul class="svelte-18fg3vi"></ul></div>`);
var root_4 = $.from_html(`<span class="server-badge svelte-18fg3vi"> </span>`);
var root_5 = $.from_html(`<div class="option-section svelte-18fg3vi"><h4 class="svelte-18fg3vi">Option 6 - DNS Servers</h4> <div class="result-grid svelte-18fg3vi"><div class="result-item svelte-18fg3vi"><span class="label svelte-18fg3vi">DNS Servers:</span> <div class="servers-list svelte-18fg3vi"></div></div> <div class="result-item svelte-18fg3vi"><span class="label svelte-18fg3vi">Hex Encoded:</span> <code class="code-value svelte-18fg3vi"> </code> <button aria-label="Copy hex"> </button></div> <div class="result-item svelte-18fg3vi"><span class="label svelte-18fg3vi">Wire Format:</span> <code class="code-value svelte-18fg3vi"> </code> <button aria-label="Copy wire format"> </button></div> <div class="result-item svelte-18fg3vi"><span class="label svelte-18fg3vi">Total Length:</span> <span class="value svelte-18fg3vi"> </span></div></div></div>`);
var root_6 = $.from_html(`<div class="option-section svelte-18fg3vi"><h4 class="svelte-18fg3vi">Option 15 - Domain Name</h4> <div class="result-grid svelte-18fg3vi"><div class="result-item svelte-18fg3vi"><span class="label svelte-18fg3vi">Domain:</span> <span class="value svelte-18fg3vi"> </span></div> <div class="result-item svelte-18fg3vi"><span class="label svelte-18fg3vi">Hex Encoded:</span> <code class="code-value svelte-18fg3vi"> </code> <button aria-label="Copy hex"> </button></div> <div class="result-item svelte-18fg3vi"><span class="label svelte-18fg3vi">Wire Format:</span> <code class="code-value svelte-18fg3vi"> </code> <button aria-label="Copy wire format"> </button></div> <div class="result-item svelte-18fg3vi"><span class="label svelte-18fg3vi">Total Length:</span> <span class="value svelte-18fg3vi"> </span></div></div></div>`);
var root_7 = $.from_html(`<div class="card result-card svelte-18fg3vi"><h3 class="svelte-18fg3vi">DHCP DNS Options</h3> <!> <!> <div class="config-section svelte-18fg3vi"><h4 class="svelte-18fg3vi">Configuration Examples</h4> <div class="output-group svelte-18fg3vi"><div class="output-header svelte-18fg3vi"><h5 class="svelte-18fg3vi">ISC DHCPd</h5> <button> </button></div> <pre class="code-block svelte-18fg3vi"><code class="svelte-18fg3vi"> </code></pre></div> <div class="output-group svelte-18fg3vi"><div class="output-header svelte-18fg3vi"><h5 class="svelte-18fg3vi">Kea DHCPv4</h5> <button> </button></div> <pre class="code-block svelte-18fg3vi"><code class="svelte-18fg3vi"> </code></pre></div> <div class="output-group svelte-18fg3vi"><div class="output-header svelte-18fg3vi"><h5 class="svelte-18fg3vi">dnsmasq</h5> <button> </button></div> <pre class="code-block svelte-18fg3vi"><code class="svelte-18fg3vi"> </code></pre></div></div></div>`);
var root_8 = $.from_html(`<!> <div class="card input-card svelte-18fg3vi"><h3 class="svelte-18fg3vi">DNS Configuration</h3> <fieldset class="form-group svelte-18fg3vi"><legend class="svelte-18fg3vi">DNS Servers (Option 6)</legend> <!> <button class="btn btn-secondary btn-sm svelte-18fg3vi">Add DNS Server</button></fieldset> <div class="form-group svelte-18fg3vi"><label for="domain-name" class="svelte-18fg3vi">Domain Name (Option 15)</label> <input id="domain-name" type="text" placeholder="e.g., example.com" class="input svelte-18fg3vi"/> <span class="hint svelte-18fg3vi">Domain name for client hostname resolution</span></div> <!></div> <!>`, 1);
var root_9 = $.from_html(`<div class="error-card svelte-18fg3vi"><strong class="svelte-18fg3vi">Decode Error:</strong> <p class="svelte-18fg3vi"> </p></div>`);
var root_10 = $.from_html(`<div class="result-grid svelte-18fg3vi"><div class="result-item svelte-18fg3vi"><span class="label svelte-18fg3vi">DNS Servers:</span> <div class="servers-list svelte-18fg3vi"></div></div> <div class="result-item svelte-18fg3vi"><span class="label svelte-18fg3vi">Server Count:</span> <span class="value svelte-18fg3vi"> </span></div> <div class="result-item svelte-18fg3vi"><span class="label svelte-18fg3vi">Total Length:</span> <span class="value svelte-18fg3vi"> </span></div></div>`);
var root_11 = $.from_html(`<div class="result-grid svelte-18fg3vi"><div class="result-item svelte-18fg3vi"><span class="label svelte-18fg3vi">Domain Name:</span> <span class="value svelte-18fg3vi"> </span></div> <div class="result-item svelte-18fg3vi"><span class="label svelte-18fg3vi">Total Length:</span> <span class="value svelte-18fg3vi"> </span></div></div>`);
var root_12 = $.from_html(`<div class="card result-card svelte-18fg3vi"><h3 class="svelte-18fg3vi"> </h3> <!></div>`);
var root_13 = $.from_html(`<!> <div class="card input-card svelte-18fg3vi"><h3 class="svelte-18fg3vi">Decode DNS Options</h3> <fieldset class="form-group svelte-18fg3vi"><legend class="svelte-18fg3vi">Option to Decode</legend> <div class="option-select svelte-18fg3vi"><label><input type="radio" class="svelte-18fg3vi"/> <span class="radio-text svelte-18fg3vi">Option 6 - DNS Servers</span></label> <label><input type="radio" class="svelte-18fg3vi"/> <span class="radio-text svelte-18fg3vi">Option 15 - Domain Name</span></label></div></fieldset> <div class="form-group svelte-18fg3vi"><label for="hex-input" class="svelte-18fg3vi">Hex String</label> <textarea id="hex-input" rows="3" class="input svelte-18fg3vi"></textarea> <span class="hint svelte-18fg3vi">Enter hex bytes (spaces optional)</span></div> <!></div> <!>`, 1);

export default function DNSOptions6And15($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];
	const clipboard = useClipboard();
	let activeTab = $.state('build');

	// Build mode state
	let dnsServers = $.state($.proxy(['']));

	let domainName = $.state('');
	let buildResult = $.state(null);
	let buildErrors = $.state($.proxy([]));

	// Decode mode state
	let decodeOption = $.state('option6');

	let hexInput = $.state('');
	let decodeResult = $.state(null);
	let decodeError = $.state('');

	const navOptions = [
		{ value: 'build', label: 'Build Options' },
		{ value: 'decode', label: 'Decode Options' }
	];

	const decodeExamples = [
		{
			label: 'Google DNS (Option 6)',
			hexValue: '08080808 08080404',
			description: '8.8.8.8, 8.8.4.4',
			option: 'option6'
		},

		{
			label: 'Cloudflare DNS (Option 6)',
			hexValue: '01010101 01000001',
			description: '1.1.1.1, 1.0.0.1',
			option: 'option6'
		},

		{
			label: 'example.com (Option 15)',
			hexValue: '6578616d706c6503636f6d00',
			description: 'example.com domain',
			option: 'option15'
		},

		{
			label: 'local.domain (Option 15)',
			hexValue: '056c6f63616c06646f6d61696e00',
			description: 'local.domain',
			option: 'option15'
		}
	];

	function loadExample(example) {
		$.set(activeTab, 'build');
		$.set(dnsServers, [...example.dnsServers], true);
		$.set(domainName, example.domainName, true);
	}

	function loadDecodeExample(example) {
		$.set(activeTab, 'decode');
		$.set(decodeOption, example.option, true);
		$.set(hexInput, example.hexValue, true);
	}

	function addDNSServer() {
		$.set(dnsServers, [...$.get(dnsServers), ''], true);
	}

	function removeDNSServer(index) {
		$.set(dnsServers, $.get(dnsServers).filter((_, i) => i !== index), true);

		if ($.get(dnsServers).length === 0) {
			$.set(dnsServers, [''], true);
		}
	}

	// Build mode effect
	$.user_effect(() => {
		if ($.get(activeTab) !== 'build') return;

		const currentServers = $.get(dnsServers);
		const currentDomain = $.get(domainName);

		untrack(() => {
			const hasInput = currentServers.some((s) => s.trim()) || currentDomain.trim();

			if (!hasInput) {
				$.set(buildResult, null);
				$.set(buildErrors, [], true);

				return;
			}

			const config = {
				dnsServers: currentServers,
				domainName: currentDomain || undefined
			};

			$.set(buildErrors, validateDNSConfig(config), true);

			if ($.get(buildErrors).length === 0) {
				try {
					$.set(buildResult, buildDNSOptions(config), true);
				} catch(err) {
					$.set(buildErrors, [err instanceof Error ? err.message : 'Unknown error'], true);
					$.set(buildResult, null);
				}
			} else {
				$.set(buildResult, null);
			}
		});
	});

	// Decode mode effect
	$.user_effect(() => {
		if ($.get(activeTab) !== 'decode') return;

		const currentHex = $.get(hexInput);
		const currentOption = $.get(decodeOption);

		untrack(() => {
			if (!currentHex.trim()) {
				$.set(decodeResult, null);
				$.set(decodeError, '');

				return;
			}

			try {
				if (currentOption === 'option6') {
					$.set(decodeResult, decodeDNSServersOption(currentHex), true);
				} else {
					$.set(decodeResult, decodeDomainNameOption(currentHex), true);
				}

				$.set(decodeError, '');
			} catch(err) {
				$.set(decodeError, err instanceof Error ? err.message : 'Unknown error', true);
				$.set(decodeResult, null);
			}
		});
	});

	ToolContentContainer($$anchor, {
		title: 'DHCP Options 6 & 15 - DNS Servers and Domain',
		description: 'Option 6 specifies DNS servers for name resolution, while Option 15 provides the domain name for client hostname resolution. These options work together for complete DNS configuration.',
		get navOptions() {
			return navOptions;
		},

		get selectedNav() {
			return $.get(activeTab);
		},

		set selectedNav($$value) {
			$.set(activeTab, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				var consequent_5 = ($$anchor) => {
					var fragment_2 = root_8();
					var node_1 = $.first_child(fragment_2);

					ExamplesCard(node_1, {
						get examples() {
							return DNS_EXAMPLES;
						},
						onSelect: loadExample,
						getLabel: (ex) => ex.label,
						getDescription: (ex) => ex.description
					});

					var div = $.sibling(node_1, 2);
					var fieldset = $.sibling($.child(div), 2);
					var node_2 = $.sibling($.child(fieldset), 2);

					$.each(node_2, 17, () => $.get(dnsServers), $.index, ($$anchor, _server, i) => {
						var div_1 = root_1();
						var input = $.child(div_1);

						$.remove_input_defaults(input);

						var node_3 = $.sibling(input, 2);

						{
							var consequent = ($$anchor) => {
								var button = root();

								$.delegated('click', button, () => removeDNSServer(i));
								$.append($$anchor, button);
							};

							$.if(node_3, ($$render) => {
								if ($.get(dnsServers).length > 1) $$render(consequent);
							});
						}

						$.reset(div_1);
						$.bind_value(input, () => $.get(dnsServers)[i], ($$value) => $.get(dnsServers)[i] = $$value);
						$.append($$anchor, div_1);
					});

					var button_1 = $.sibling(node_2, 2);

					$.reset(fieldset);

					var div_2 = $.sibling(fieldset, 2);
					var input_1 = $.sibling($.child(div_2), 2);

					$.remove_input_defaults(input_1);
					$.next(2);
					$.reset(div_2);

					var node_4 = $.sibling(div_2, 2);

					{
						var consequent_1 = ($$anchor) => {
							var div_3 = root_3();
							var ul = $.sibling($.child(div_3), 2);

							$.each(ul, 21, () => $.get(buildErrors), $.index, ($$anchor, error) => {
								var li = root_2();
								var text = $.only_child(li, true);

								$.template_effect(() => $.set_text(text, $.get(error)));
								$.append($$anchor, li);
							});

							$.reset(ul);
							$.reset(div_3);
							$.append($$anchor, div_3);
						};

						$.if(node_4, ($$render) => {
							if ($.get(buildErrors).length > 0) $$render(consequent_1);
						});
					}

					$.reset(div);

					var node_5 = $.sibling(div, 2);

					{
						var consequent_4 = ($$anchor) => {
							var div_4 = root_7();
							var node_6 = $.sibling($.child(div_4), 2);

							{
								var consequent_2 = ($$anchor) => {
									var div_5 = root_5();
									var div_6 = $.sibling($.child(div_5), 2);
									var div_7 = $.child(div_6);
									var div_8 = $.sibling($.child(div_7), 2);

									$.each(div_8, 21, () => $.get(buildResult).option6.servers, $.index, ($$anchor, srv) => {
										var span = root_4();
										var text_1 = $.only_child(span, true);

										$.template_effect(() => $.set_text(text_1, $.get(srv)));
										$.append($$anchor, span);
									});

									$.reset(div_8);
									$.reset(div_7);

									var div_9 = $.sibling(div_7, 2);
									var code = $.sibling($.child(div_9), 2);
									var text_2 = $.only_child(code, true);
									var button_2 = $.sibling(code, 2);
									let classes;
									var text_3 = $.only_child(button_2, true);

									$.reset(div_9);

									var div_10 = $.sibling(div_9, 2);
									var code_1 = $.sibling($.child(div_10), 2);
									var text_4 = $.only_child(code_1, true);
									var button_3 = $.sibling(code_1, 2);
									let classes_1;
									var text_5 = $.only_child(button_3, true);

									$.reset(div_10);

									var div_11 = $.sibling(div_10, 2);
									var span_1 = $.sibling($.child(div_11), 2);
									var text_6 = $.only_child(span_1);

									$.reset(div_11);
									$.reset(div_6);
									$.reset(div_5);

									$.template_effect(
										($0, $1, $2, $3) => {
											$.set_text(text_2, $.get(buildResult).option6.hexEncoded);
											classes = $.set_class(button_2, 1, 'btn-copy svelte-18fg3vi', null, classes, { copied: $0 });
											$.set_text(text_3, $1);
											$.set_text(text_4, $.get(buildResult).option6.wireFormat);
											classes_1 = $.set_class(button_3, 1, 'btn-copy svelte-18fg3vi', null, classes_1, { copied: $2 });
											$.set_text(text_5, $3);
											$.set_text(text_6, `${$.get(buildResult).option6.totalLength ?? ''} bytes`);
										},
										[
											() => clipboard.isCopied('option6-hex'),
											() => clipboard.isCopied('option6-hex') ? 'Copied' : 'Copy',
											() => clipboard.isCopied('option6-wire'),
											() => clipboard.isCopied('option6-wire') ? 'Copied' : 'Copy'
										]
									);

									$.delegated('click', button_2, () => clipboard.copy($.get(buildResult).option6.hexEncoded, 'option6-hex'));
									$.delegated('click', button_3, () => clipboard.copy($.get(buildResult).option6.wireFormat, 'option6-wire'));
									$.append($$anchor, div_5);
								};

								$.if(node_6, ($$render) => {
									if ($.get(buildResult).option6) $$render(consequent_2);
								});
							}

							var node_7 = $.sibling(node_6, 2);

							{
								var consequent_3 = ($$anchor) => {
									var div_12 = root_6();
									var div_13 = $.sibling($.child(div_12), 2);
									var div_14 = $.child(div_13);
									var span_2 = $.sibling($.child(div_14), 2);
									var text_7 = $.only_child(span_2, true);

									$.reset(div_14);

									var div_15 = $.sibling(div_14, 2);
									var code_2 = $.sibling($.child(div_15), 2);
									var text_8 = $.only_child(code_2, true);
									var button_4 = $.sibling(code_2, 2);
									let classes_2;
									var text_9 = $.only_child(button_4, true);

									$.reset(div_15);

									var div_16 = $.sibling(div_15, 2);
									var code_3 = $.sibling($.child(div_16), 2);
									var text_10 = $.only_child(code_3, true);
									var button_5 = $.sibling(code_3, 2);
									let classes_3;
									var text_11 = $.only_child(button_5, true);

									$.reset(div_16);

									var div_17 = $.sibling(div_16, 2);
									var span_3 = $.sibling($.child(div_17), 2);
									var text_12 = $.only_child(span_3);

									$.reset(div_17);
									$.reset(div_13);
									$.reset(div_12);

									$.template_effect(
										($0, $1, $2, $3) => {
											$.set_text(text_7, $.get(buildResult).option15.domain);
											$.set_text(text_8, $.get(buildResult).option15.hexEncoded);
											classes_2 = $.set_class(button_4, 1, 'btn-copy svelte-18fg3vi', null, classes_2, { copied: $0 });
											$.set_text(text_9, $1);
											$.set_text(text_10, $.get(buildResult).option15.wireFormat);
											classes_3 = $.set_class(button_5, 1, 'btn-copy svelte-18fg3vi', null, classes_3, { copied: $2 });
											$.set_text(text_11, $3);
											$.set_text(text_12, `${$.get(buildResult).option15.totalLength ?? ''} bytes`);
										},
										[
											() => clipboard.isCopied('option15-hex'),
											() => clipboard.isCopied('option15-hex') ? 'Copied' : 'Copy',
											() => clipboard.isCopied('option15-wire'),
											() => clipboard.isCopied('option15-wire') ? 'Copied' : 'Copy'
										]
									);

									$.delegated('click', button_4, () => clipboard.copy($.get(buildResult).option15.hexEncoded, 'option15-hex'));
									$.delegated('click', button_5, () => clipboard.copy($.get(buildResult).option15.wireFormat, 'option15-wire'));
									$.append($$anchor, div_12);
								};

								$.if(node_7, ($$render) => {
									if ($.get(buildResult).option15) $$render(consequent_3);
								});
							}

							var div_18 = $.sibling(node_7, 2);
							var div_19 = $.sibling($.child(div_18), 2);
							var div_20 = $.child(div_19);
							var button_6 = $.sibling($.child(div_20), 2);
							let classes_4;
							var text_13 = $.only_child(button_6, true);

							$.reset(div_20);

							var pre = $.sibling(div_20, 2);
							var code_4 = $.child(pre);
							var text_14 = $.only_child(code_4, true);

							$.reset(pre);
							$.reset(div_19);

							var div_21 = $.sibling(div_19, 2);
							var div_22 = $.child(div_21);
							var button_7 = $.sibling($.child(div_22), 2);
							let classes_5;
							var text_15 = $.only_child(button_7, true);

							$.reset(div_22);

							var pre_1 = $.sibling(div_22, 2);
							var code_5 = $.child(pre_1);
							var text_16 = $.only_child(code_5, true);

							$.reset(pre_1);
							$.reset(div_21);

							var div_23 = $.sibling(div_21, 2);
							var div_24 = $.child(div_23);
							var button_8 = $.sibling($.child(div_24), 2);
							let classes_6;
							var text_17 = $.only_child(button_8, true);

							$.reset(div_24);

							var pre_2 = $.sibling(div_24, 2);
							var code_6 = $.child(pre_2);
							var text_18 = $.only_child(code_6, true);

							$.reset(pre_2);
							$.reset(div_23);
							$.reset(div_18);
							$.reset(div_4);

							$.template_effect(
								($0, $1, $2, $3, $4, $5) => {
									classes_4 = $.set_class(button_6, 1, 'btn-copy svelte-18fg3vi', null, classes_4, { copied: $0 });
									$.set_text(text_13, $1);
									$.set_text(text_14, $.get(buildResult).configExamples.iscDhcpd);
									classes_5 = $.set_class(button_7, 1, 'btn-copy svelte-18fg3vi', null, classes_5, { copied: $2 });
									$.set_text(text_15, $3);
									$.set_text(text_16, $.get(buildResult).configExamples.keaDhcp4);
									classes_6 = $.set_class(button_8, 1, 'btn-copy svelte-18fg3vi', null, classes_6, { copied: $4 });
									$.set_text(text_17, $5);
									$.set_text(text_18, $.get(buildResult).configExamples.dnsmasq);
								},
								[
									() => clipboard.isCopied('isc'),
									() => clipboard.isCopied('isc') ? 'Copied' : 'Copy',
									() => clipboard.isCopied('kea'),
									() => clipboard.isCopied('kea') ? 'Copied' : 'Copy',
									() => clipboard.isCopied('dnsmasq'),
									() => clipboard.isCopied('dnsmasq') ? 'Copied' : 'Copy'
								]
							);

							$.delegated('click', button_6, () => clipboard.copy($.get(buildResult).configExamples.iscDhcpd, 'isc'));
							$.delegated('click', button_7, () => clipboard.copy($.get(buildResult).configExamples.keaDhcp4, 'kea'));
							$.delegated('click', button_8, () => clipboard.copy($.get(buildResult).configExamples.dnsmasq, 'dnsmasq'));
							$.append($$anchor, div_4);
						};

						$.if(node_5, ($$render) => {
							if ($.get(buildResult)) $$render(consequent_4);
						});
					}

					$.delegated('click', button_1, addDNSServer);
					$.bind_value(input_1, () => $.get(domainName), ($$value) => $.set(domainName, $$value));
					$.append($$anchor, fragment_2);
				};

				var alternate_1 = ($$anchor) => {
					var fragment_3 = root_13();
					var node_8 = $.first_child(fragment_3);

					ExamplesCard(node_8, {
						get examples() {
							return decodeExamples;
						},
						onSelect: loadDecodeExample,
						getLabel: (ex) => ex.label,
						getDescription: (ex) => ex.description
					});

					var div_25 = $.sibling(node_8, 2);
					var fieldset_1 = $.sibling($.child(div_25), 2);
					var div_26 = $.sibling($.child(fieldset_1), 2);
					var label = $.child(div_26);
					let classes_7;
					var input_2 = $.child(label);

					$.remove_input_defaults(input_2);
					input_2.value = input_2.__value = 'option6';
					$.next(2);
					$.reset(label);

					$.action(label, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => ({
						text: 'Decode Option 6 to extract DNS server addresses from hex'
					}));

					var label_1 = $.sibling(label, 2);
					let classes_8;
					var input_3 = $.child(label_1);

					$.remove_input_defaults(input_3);
					input_3.value = input_3.__value = 'option15';
					$.next(2);
					$.reset(label_1);
					$.action(label_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => ({ text: 'Decode Option 15 to extract domain name from hex' }));
					$.reset(div_26);
					$.reset(fieldset_1);

					var div_27 = $.sibling(fieldset_1, 2);
					var textarea = $.sibling($.child(div_27), 2);

					$.remove_textarea_child(textarea);
					$.next(2);
					$.reset(div_27);

					var node_9 = $.sibling(div_27, 2);

					{
						var consequent_6 = ($$anchor) => {
							var div_28 = root_9();
							var p = $.sibling($.child(div_28), 2);
							var text_19 = $.only_child(p, true);

							$.reset(div_28);
							$.template_effect(() => $.set_text(text_19, $.get(decodeError)));
							$.append($$anchor, div_28);
						};

						$.if(node_9, ($$render) => {
							if ($.get(decodeError)) $$render(consequent_6);
						});
					}

					$.reset(div_25);

					var node_10 = $.sibling(div_25, 2);

					{
						var consequent_8 = ($$anchor) => {
							var div_29 = root_12();
							var h3 = $.child(div_29);
							var text_20 = $.only_child(h3);
							var node_11 = $.sibling(h3, 2);

							{
								var consequent_7 = ($$anchor) => {
									var div_30 = root_10();
									var div_31 = $.child(div_30);
									var div_32 = $.sibling($.child(div_31), 2);

									$.each(div_32, 21, () => $.get(decodeResult).servers, $.index, ($$anchor, srv) => {
										var span_4 = root_4();
										var text_21 = $.only_child(span_4, true);

										$.template_effect(() => $.set_text(text_21, $.get(srv)));
										$.append($$anchor, span_4);
									});

									$.reset(div_32);
									$.reset(div_31);

									var div_33 = $.sibling(div_31, 2);
									var span_5 = $.sibling($.child(div_33), 2);
									var text_22 = $.only_child(span_5, true);

									$.reset(div_33);

									var div_34 = $.sibling(div_33, 2);
									var span_6 = $.sibling($.child(div_34), 2);
									var text_23 = $.only_child(span_6);

									$.reset(div_34);
									$.reset(div_30);

									$.template_effect(() => {
										$.set_text(text_22, $.get(decodeResult).servers.length);
										$.set_text(text_23, `${$.get(decodeResult).totalLength ?? ''} bytes`);
									});

									$.append($$anchor, div_30);
								};

								var alternate = ($$anchor) => {
									var div_35 = root_11();
									var div_36 = $.child(div_35);
									var span_7 = $.sibling($.child(div_36), 2);
									var text_24 = $.only_child(span_7, true);

									$.reset(div_36);

									var div_37 = $.sibling(div_36, 2);
									var span_8 = $.sibling($.child(div_37), 2);
									var text_25 = $.only_child(span_8);

									$.reset(div_37);
									$.reset(div_35);

									$.template_effect(() => {
										$.set_text(text_24, $.get(decodeResult).domain);
										$.set_text(text_25, `${$.get(decodeResult).totalLength ?? ''} bytes`);
									});

									$.append($$anchor, div_35);
								};

								$.if(node_11, ($$render) => {
									if ($.get(decodeOption) === 'option6') $$render(consequent_7); else $$render(alternate, -1);
								});
							}

							$.reset(div_29);
							$.template_effect(() => $.set_text(text_20, `Decoded ${$.get(decodeOption) === 'option6' ? 'Option 6' : 'Option 15'}`));
							$.append($$anchor, div_29);
						};

						$.if(node_10, ($$render) => {
							if ($.get(decodeResult)) $$render(consequent_8);
						});
					}

					$.template_effect(() => {
						classes_7 = $.set_class(label, 1, 'radio-label svelte-18fg3vi', null, classes_7, { selected: $.get(decodeOption) === 'option6' });
						classes_8 = $.set_class(label_1, 1, 'radio-label svelte-18fg3vi', null, classes_8, { selected: $.get(decodeOption) === 'option15' });

						$.set_attribute(textarea, 'placeholder', $.get(decodeOption) === 'option6'
							? 'e.g., 08080808 or 08 08 08 08 08 08 04 04'
							: 'e.g., 6578616d706c6503636f6d');
					});

					$.bind_group(binding_group, [], input_2, () => $.get(decodeOption), ($$value) => $.set(decodeOption, $$value));
					$.bind_group(binding_group, [], input_3, () => $.get(decodeOption), ($$value) => $.set(decodeOption, $$value));
					$.bind_value(textarea, () => $.get(hexInput), ($$value) => $.set(hexInput, $$value));
					$.append($$anchor, fragment_3);
				};

				$.if(node, ($$render) => {
					if ($.get(activeTab) === 'build') $$render(consequent_5); else $$render(alternate_1, -1);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}

$.delegate(['click']);