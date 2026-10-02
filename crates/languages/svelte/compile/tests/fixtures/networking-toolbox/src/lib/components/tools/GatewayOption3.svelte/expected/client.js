import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	buildGatewayOption,
	decodeGatewayOption,
	validateGatewayConfig,
	GATEWAY_EXAMPLES
} from '$lib/utils/dhcp-option3-gateway';

import { untrack } from 'svelte';
import ToolContentContainer from '$lib/components/global/ToolContentContainer.svelte';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import { useClipboard } from '$lib/composables/useClipboard.svelte';

var root = $.from_html(`<button class="btn btn-danger btn-sm svelte-uliagc">Remove</button>`);
var root_1 = $.from_html(`<div class="gateway-row svelte-uliagc"><input type="text" placeholder="e.g., 192.168.1.1" class="input svelte-uliagc"/> <!></div>`);
var root_2 = $.from_html(`<li> </li>`);
var root_3 = $.from_html(`<div class="error-card svelte-uliagc"><strong class="svelte-uliagc">Validation Errors:</strong> <ul class="svelte-uliagc"></ul></div>`);
var root_4 = $.from_html(`<span class="gateway-badge svelte-uliagc"> </span>`);
var root_5 = $.from_html(`<div class="card result-card svelte-uliagc"><h3 class="svelte-uliagc">Option 3 - Router</h3> <div class="result-grid svelte-uliagc"><div class="result-item svelte-uliagc"><span class="label svelte-uliagc">Gateways:</span> <div class="gateway-list svelte-uliagc"></div></div> <div class="result-item svelte-uliagc"><span class="label svelte-uliagc">Hex Encoded:</span> <code class="code-value svelte-uliagc"> </code> <button aria-label="Copy hex"> </button></div> <div class="result-item svelte-uliagc"><span class="label svelte-uliagc">Wire Format:</span> <code class="code-value svelte-uliagc"> </code> <button aria-label="Copy wire format"> </button></div> <div class="result-item svelte-uliagc"><span class="label svelte-uliagc">Total Length:</span> <span class="value svelte-uliagc"> </span></div></div> <div class="config-section svelte-uliagc"><h4 class="svelte-uliagc">Configuration Examples</h4> <div class="output-group svelte-uliagc"><div class="output-header svelte-uliagc"><h5 class="svelte-uliagc">ISC DHCPd</h5> <button> </button></div> <pre class="code-block svelte-uliagc"><code class="svelte-uliagc"> </code></pre></div> <div class="output-group svelte-uliagc"><div class="output-header svelte-uliagc"><h5 class="svelte-uliagc">Kea DHCPv4</h5> <button> </button></div> <pre class="code-block svelte-uliagc"><code class="svelte-uliagc"> </code></pre></div> <div class="output-group svelte-uliagc"><div class="output-header svelte-uliagc"><h5 class="svelte-uliagc">dnsmasq</h5> <button> </button></div> <pre class="code-block svelte-uliagc"><code class="svelte-uliagc"> </code></pre></div></div></div>`);
var root_6 = $.from_html(`<!> <div class="card input-card svelte-uliagc"><h3 class="svelte-uliagc">Gateway Configuration</h3> <div class="form-group svelte-uliagc"><label for="subnet" class="svelte-uliagc">Subnet (Optional - for validation)</label> <input id="subnet" type="text" placeholder="e.g., 192.168.1.0/24" class="input svelte-uliagc"/> <span class="hint svelte-uliagc">If provided, gateways will be validated against this subnet</span></div> <div class="form-group svelte-uliagc"><label for="gateway-0" class="svelte-uliagc">Gateway Addresses (in order of preference)</label> <!> <button class="btn btn-secondary btn-sm svelte-uliagc">Add Gateway</button></div> <!></div> <!>`, 1);
var root_7 = $.from_html(`<div class="error-card svelte-uliagc"><strong class="svelte-uliagc">Decode Error:</strong> <p class="svelte-uliagc"> </p></div>`);
var root_8 = $.from_html(`<div class="card result-card svelte-uliagc"><h3 class="svelte-uliagc">Decoded Option 3</h3> <div class="result-grid svelte-uliagc"><div class="result-item svelte-uliagc"><span class="label svelte-uliagc">Gateways:</span> <div class="gateway-list svelte-uliagc"></div></div> <div class="result-item svelte-uliagc"><span class="label svelte-uliagc">Total Length:</span> <span class="value svelte-uliagc"> </span></div> <div class="result-item svelte-uliagc"><span class="label svelte-uliagc">Gateway Count:</span> <span class="value svelte-uliagc"> </span></div></div> <div class="config-section svelte-uliagc"><h4 class="svelte-uliagc">Configuration Examples</h4> <div class="output-group svelte-uliagc"><div class="output-header svelte-uliagc"><h5 class="svelte-uliagc">ISC DHCPd</h5> <button> </button></div> <pre class="code-block svelte-uliagc"><code class="svelte-uliagc"> </code></pre></div> <div class="output-group svelte-uliagc"><div class="output-header svelte-uliagc"><h5 class="svelte-uliagc">Kea DHCPv4</h5> <button> </button></div> <pre class="code-block svelte-uliagc"><code class="svelte-uliagc"> </code></pre></div> <div class="output-group svelte-uliagc"><div class="output-header svelte-uliagc"><h5 class="svelte-uliagc">dnsmasq</h5> <button> </button></div> <pre class="code-block svelte-uliagc"><code class="svelte-uliagc"> </code></pre></div></div></div>`);
var root_9 = $.from_html(`<!> <div class="card input-card svelte-uliagc"><h3 class="svelte-uliagc">Decode Option 3</h3> <div class="form-group svelte-uliagc"><label for="hex-input" class="svelte-uliagc">Hex String</label> <textarea id="hex-input" placeholder="e.g., c0a80101 or c0 a8 01 01" rows="3" class="input svelte-uliagc"></textarea> <span class="hint svelte-uliagc">Enter hex bytes (spaces optional)</span></div> <!></div> <!>`, 1);

export default function GatewayOption3($$anchor, $$props) {
	$.push($$props, true);

	const clipboard = useClipboard();
	let activeTab = $.state('build');

	// Build mode state
	let gateways = $.state($.proxy(['']));

	let subnet = $.state('');
	let buildResult = $.state(null);
	let buildErrors = $.state($.proxy([]));

	// Decode mode state
	let hexInput = $.state('');

	let decodeResult = $.state(null);
	let decodeError = $.state('');

	const navOptions = [
		{ value: 'build', label: 'Build Option' },
		{ value: 'decode', label: 'Decode Option' }
	];

	const decodeExamples = [
		{
			label: 'Single Gateway',
			hexValue: 'c0a80101',
			description: '192.168.1.1'
		},

		{
			label: 'Dual Gateways',
			hexValue: 'c0a80101c0a80102',
			description: '192.168.1.1, 192.168.1.2'
		},

		{
			label: 'Google DNS Primary',
			hexValue: '08080808',
			description: '8.8.8.8'
		},

		{
			label: 'Common Home Router',
			hexValue: 'c0a8000a',
			description: '192.168.0.10'
		}
	];

	function loadExample(example) {
		$.set(activeTab, 'build');
		$.set(gateways, [...example.gateways], true);
		$.set(subnet, example.subnet || '', true);
	}

	function loadDecodeExample(example) {
		$.set(activeTab, 'decode');
		$.set(hexInput, example.hexValue, true);
	}

	function addGateway() {
		$.set(gateways, [...$.get(gateways), ''], true);
	}

	function removeGateway(index) {
		$.set(gateways, $.get(gateways).filter((_, i) => i !== index), true);

		if ($.get(gateways).length === 0) {
			$.set(gateways, [''], true);
		}
	}

	// Build mode effect
	$.user_effect(() => {
		if ($.get(activeTab) !== 'build') return;

		const currentGateways = $.get(gateways);
		const currentSubnet = $.get(subnet);

		untrack(() => {
			const hasInput = currentGateways.some((g) => g.trim());

			if (!hasInput) {
				$.set(buildResult, null);
				$.set(buildErrors, [], true);

				return;
			}

			const config = {
				gateways: currentGateways,
				subnet: currentSubnet || undefined
			};

			$.set(buildErrors, validateGatewayConfig(config), true);

			if ($.get(buildErrors).length === 0) {
				try {
					$.set(buildResult, buildGatewayOption(config), true);
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

		untrack(() => {
			if (!currentHex.trim()) {
				$.set(decodeResult, null);
				$.set(decodeError, '');

				return;
			}

			try {
				$.set(decodeResult, decodeGatewayOption(currentHex), true);
				$.set(decodeError, '');
			} catch(err) {
				$.set(decodeError, err instanceof Error ? err.message : 'Unknown error', true);
				$.set(decodeResult, null);
			}
		});
	});

	ToolContentContainer($$anchor, {
		title: 'DHCP Option 3 - Router/Default Gateway',
		description: 'Build and decode default gateway configuration. Multiple gateways can be specified for redundancy or load balancing, listed in order of preference.',
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
				var consequent_3 = ($$anchor) => {
					var fragment_2 = root_6();
					var node_1 = $.first_child(fragment_2);

					ExamplesCard(node_1, {
						get examples() {
							return GATEWAY_EXAMPLES;
						},
						onSelect: loadExample,
						getLabel: (ex) => ex.label,
						getDescription: (ex) => ex.description
					});

					var div = $.sibling(node_1, 2);
					var div_1 = $.sibling($.child(div), 2);
					var input = $.sibling($.child(div_1), 2);

					$.remove_input_defaults(input);
					$.next(2);
					$.reset(div_1);

					var div_2 = $.sibling(div_1, 2);
					var node_2 = $.sibling($.child(div_2), 2);

					$.each(node_2, 17, () => $.get(gateways), $.index, ($$anchor, _gateway, i) => {
						var div_3 = root_1();
						var input_1 = $.child(div_3);

						$.remove_input_defaults(input_1);
						$.set_attribute(input_1, 'id', i === 0 ? 'gateway-0' : undefined);
						$.set_attribute(input_1, 'aria-label', i > 0 ? `Gateway ${i + 1}` : undefined);

						var node_3 = $.sibling(input_1, 2);

						{
							var consequent = ($$anchor) => {
								var button = root();

								$.delegated('click', button, () => removeGateway(i));
								$.append($$anchor, button);
							};

							$.if(node_3, ($$render) => {
								if ($.get(gateways).length > 1) $$render(consequent);
							});
						}

						$.reset(div_3);
						$.bind_value(input_1, () => $.get(gateways)[i], ($$value) => $.get(gateways)[i] = $$value);
						$.append($$anchor, div_3);
					});

					var button_1 = $.sibling(node_2, 2);

					$.reset(div_2);

					var node_4 = $.sibling(div_2, 2);

					{
						var consequent_1 = ($$anchor) => {
							var div_4 = root_3();
							var ul = $.sibling($.child(div_4), 2);

							$.each(ul, 21, () => $.get(buildErrors), $.index, ($$anchor, error) => {
								var li = root_2();
								var text = $.only_child(li, true);

								$.template_effect(() => $.set_text(text, $.get(error)));
								$.append($$anchor, li);
							});

							$.reset(ul);
							$.reset(div_4);
							$.append($$anchor, div_4);
						};

						$.if(node_4, ($$render) => {
							if ($.get(buildErrors).length > 0) $$render(consequent_1);
						});
					}

					$.reset(div);

					var node_5 = $.sibling(div, 2);

					{
						var consequent_2 = ($$anchor) => {
							var div_5 = root_5();
							var div_6 = $.sibling($.child(div_5), 2);
							var div_7 = $.child(div_6);
							var div_8 = $.sibling($.child(div_7), 2);

							$.each(div_8, 21, () => $.get(buildResult).gateways, $.index, ($$anchor, gw, i) => {
								var span = root_4();
								var text_1 = $.only_child(span);

								$.template_effect(() => $.set_text(text_1, `${i + 1}. ${$.get(gw) ?? ''}`));
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

							var div_12 = $.sibling(div_6, 2);
							var div_13 = $.sibling($.child(div_12), 2);
							var div_14 = $.child(div_13);
							var button_4 = $.sibling($.child(div_14), 2);
							let classes_2;
							var text_7 = $.only_child(button_4, true);

							$.reset(div_14);

							var pre = $.sibling(div_14, 2);
							var code_2 = $.child(pre);
							var text_8 = $.only_child(code_2, true);

							$.reset(pre);
							$.reset(div_13);

							var div_15 = $.sibling(div_13, 2);
							var div_16 = $.child(div_15);
							var button_5 = $.sibling($.child(div_16), 2);
							let classes_3;
							var text_9 = $.only_child(button_5, true);

							$.reset(div_16);

							var pre_1 = $.sibling(div_16, 2);
							var code_3 = $.child(pre_1);
							var text_10 = $.only_child(code_3, true);

							$.reset(pre_1);
							$.reset(div_15);

							var div_17 = $.sibling(div_15, 2);
							var div_18 = $.child(div_17);
							var button_6 = $.sibling($.child(div_18), 2);
							let classes_4;
							var text_11 = $.only_child(button_6, true);

							$.reset(div_18);

							var pre_2 = $.sibling(div_18, 2);
							var code_4 = $.child(pre_2);
							var text_12 = $.only_child(code_4, true);

							$.reset(pre_2);
							$.reset(div_17);
							$.reset(div_12);
							$.reset(div_5);

							$.template_effect(
								($0, $1, $2, $3, $4, $5, $6, $7, $8, $9) => {
									$.set_text(text_2, $.get(buildResult).hexEncoded);
									classes = $.set_class(button_2, 1, 'btn-copy svelte-uliagc', null, classes, { copied: $0 });
									$.set_text(text_3, $1);
									$.set_text(text_4, $.get(buildResult).wireFormat);
									classes_1 = $.set_class(button_3, 1, 'btn-copy svelte-uliagc', null, classes_1, { copied: $2 });
									$.set_text(text_5, $3);
									$.set_text(text_6, `${$.get(buildResult).totalLength ?? ''} bytes`);
									classes_2 = $.set_class(button_4, 1, 'btn-copy svelte-uliagc', null, classes_2, { copied: $4 });
									$.set_text(text_7, $5);
									$.set_text(text_8, $.get(buildResult).configExamples.iscDhcpd);
									classes_3 = $.set_class(button_5, 1, 'btn-copy svelte-uliagc', null, classes_3, { copied: $6 });
									$.set_text(text_9, $7);
									$.set_text(text_10, $.get(buildResult).configExamples.keaDhcp4);
									classes_4 = $.set_class(button_6, 1, 'btn-copy svelte-uliagc', null, classes_4, { copied: $8 });
									$.set_text(text_11, $9);
									$.set_text(text_12, $.get(buildResult).configExamples.dnsmasq);
								},
								[
									() => clipboard.isCopied('hex'),
									() => clipboard.isCopied('hex') ? 'Copied' : 'Copy',
									() => clipboard.isCopied('wire'),
									() => clipboard.isCopied('wire') ? 'Copied' : 'Copy',
									() => clipboard.isCopied('isc'),
									() => clipboard.isCopied('isc') ? 'Copied' : 'Copy',
									() => clipboard.isCopied('kea'),
									() => clipboard.isCopied('kea') ? 'Copied' : 'Copy',
									() => clipboard.isCopied('dnsmasq'),
									() => clipboard.isCopied('dnsmasq') ? 'Copied' : 'Copy'
								]
							);

							$.delegated('click', button_2, () => clipboard.copy($.get(buildResult).hexEncoded, 'hex'));
							$.delegated('click', button_3, () => clipboard.copy($.get(buildResult).wireFormat, 'wire'));
							$.delegated('click', button_4, () => clipboard.copy($.get(buildResult).configExamples.iscDhcpd, 'isc'));
							$.delegated('click', button_5, () => clipboard.copy($.get(buildResult).configExamples.keaDhcp4, 'kea'));
							$.delegated('click', button_6, () => clipboard.copy($.get(buildResult).configExamples.dnsmasq, 'dnsmasq'));
							$.append($$anchor, div_5);
						};

						$.if(node_5, ($$render) => {
							if ($.get(buildResult)) $$render(consequent_2);
						});
					}

					$.bind_value(input, () => $.get(subnet), ($$value) => $.set(subnet, $$value));
					$.delegated('click', button_1, addGateway);
					$.append($$anchor, fragment_2);
				};

				var alternate = ($$anchor) => {
					var fragment_3 = root_9();
					var node_6 = $.first_child(fragment_3);

					ExamplesCard(node_6, {
						get examples() {
							return decodeExamples;
						},
						onSelect: loadDecodeExample,
						getLabel: (ex) => ex.label,
						getDescription: (ex) => ex.description
					});

					var div_19 = $.sibling(node_6, 2);
					var div_20 = $.sibling($.child(div_19), 2);
					var textarea = $.sibling($.child(div_20), 2);

					$.remove_textarea_child(textarea);
					$.next(2);
					$.reset(div_20);

					var node_7 = $.sibling(div_20, 2);

					{
						var consequent_4 = ($$anchor) => {
							var div_21 = root_7();
							var p = $.sibling($.child(div_21), 2);
							var text_13 = $.only_child(p, true);

							$.reset(div_21);
							$.template_effect(() => $.set_text(text_13, $.get(decodeError)));
							$.append($$anchor, div_21);
						};

						$.if(node_7, ($$render) => {
							if ($.get(decodeError)) $$render(consequent_4);
						});
					}

					$.reset(div_19);

					var node_8 = $.sibling(div_19, 2);

					{
						var consequent_5 = ($$anchor) => {
							var div_22 = root_8();
							var div_23 = $.sibling($.child(div_22), 2);
							var div_24 = $.child(div_23);
							var div_25 = $.sibling($.child(div_24), 2);

							$.each(div_25, 21, () => $.get(decodeResult).gateways, $.index, ($$anchor, gw, i) => {
								var span_2 = root_4();
								var text_14 = $.only_child(span_2);

								$.template_effect(() => $.set_text(text_14, `${i + 1}. ${$.get(gw) ?? ''}`));
								$.append($$anchor, span_2);
							});

							$.reset(div_25);
							$.reset(div_24);

							var div_26 = $.sibling(div_24, 2);
							var span_3 = $.sibling($.child(div_26), 2);
							var text_15 = $.only_child(span_3);

							$.reset(div_26);

							var div_27 = $.sibling(div_26, 2);
							var span_4 = $.sibling($.child(div_27), 2);
							var text_16 = $.only_child(span_4, true);

							$.reset(div_27);
							$.reset(div_23);

							var div_28 = $.sibling(div_23, 2);
							var div_29 = $.sibling($.child(div_28), 2);
							var div_30 = $.child(div_29);
							var button_7 = $.sibling($.child(div_30), 2);
							let classes_5;
							var text_17 = $.only_child(button_7, true);

							$.reset(div_30);

							var pre_3 = $.sibling(div_30, 2);
							var code_5 = $.child(pre_3);
							var text_18 = $.only_child(code_5, true);

							$.reset(pre_3);
							$.reset(div_29);

							var div_31 = $.sibling(div_29, 2);
							var div_32 = $.child(div_31);
							var button_8 = $.sibling($.child(div_32), 2);
							let classes_6;
							var text_19 = $.only_child(button_8, true);

							$.reset(div_32);

							var pre_4 = $.sibling(div_32, 2);
							var code_6 = $.child(pre_4);
							var text_20 = $.only_child(code_6, true);

							$.reset(pre_4);
							$.reset(div_31);

							var div_33 = $.sibling(div_31, 2);
							var div_34 = $.child(div_33);
							var button_9 = $.sibling($.child(div_34), 2);
							let classes_7;
							var text_21 = $.only_child(button_9, true);

							$.reset(div_34);

							var pre_5 = $.sibling(div_34, 2);
							var code_7 = $.child(pre_5);
							var text_22 = $.only_child(code_7, true);

							$.reset(pre_5);
							$.reset(div_33);
							$.reset(div_28);
							$.reset(div_22);

							$.template_effect(
								($0, $1, $2, $3, $4, $5) => {
									$.set_text(text_15, `${$.get(decodeResult).totalLength ?? ''} bytes`);
									$.set_text(text_16, $.get(decodeResult).gateways.length);
									classes_5 = $.set_class(button_7, 1, 'btn-copy svelte-uliagc', null, classes_5, { copied: $0 });
									$.set_text(text_17, $1);
									$.set_text(text_18, $.get(decodeResult).configExamples.iscDhcpd);
									classes_6 = $.set_class(button_8, 1, 'btn-copy svelte-uliagc', null, classes_6, { copied: $2 });
									$.set_text(text_19, $3);
									$.set_text(text_20, $.get(decodeResult).configExamples.keaDhcp4);
									classes_7 = $.set_class(button_9, 1, 'btn-copy svelte-uliagc', null, classes_7, { copied: $4 });
									$.set_text(text_21, $5);
									$.set_text(text_22, $.get(decodeResult).configExamples.dnsmasq);
								},
								[
									() => clipboard.isCopied('decode-isc'),
									() => clipboard.isCopied('decode-isc') ? 'Copied' : 'Copy',
									() => clipboard.isCopied('decode-kea'),
									() => clipboard.isCopied('decode-kea') ? 'Copied' : 'Copy',
									() => clipboard.isCopied('decode-dnsmasq'),
									() => clipboard.isCopied('decode-dnsmasq') ? 'Copied' : 'Copy'
								]
							);

							$.delegated('click', button_7, () => clipboard.copy($.get(decodeResult).configExamples.iscDhcpd, 'decode-isc'));
							$.delegated('click', button_8, () => clipboard.copy($.get(decodeResult).configExamples.keaDhcp4, 'decode-kea'));
							$.delegated('click', button_9, () => clipboard.copy($.get(decodeResult).configExamples.dnsmasq, 'decode-dnsmasq'));
							$.append($$anchor, div_22);
						};

						$.if(node_8, ($$render) => {
							if ($.get(decodeResult)) $$render(consequent_5);
						});
					}

					$.bind_value(textarea, () => $.get(hexInput), ($$value) => $.set(hexInput, $$value));
					$.append($$anchor, fragment_3);
				};

				$.if(node, ($$render) => {
					if ($.get(activeTab) === 'build') $$render(consequent_3); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}

$.delegate(['click']);