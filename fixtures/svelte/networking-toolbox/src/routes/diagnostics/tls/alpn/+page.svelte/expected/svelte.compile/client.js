import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import { useDiagnosticState, useClipboard, useExamples } from '$lib/composables';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import ErrorCard from '$lib/components/common/ErrorCard.svelte';
import '../../../../styles/diagnostics-pages.scss';

var root = $.from_html(`<span class="error-text">Invalid host:port format</span>`);
var root_1 = $.from_html(`<button type="button" class="preset-btn svelte-1qp7td"> </button>`);
var root_2 = $.from_html(`<input type="text" placeholder="example.com"/>`);
var root_3 = $.from_html(`<!> Testing ALPN...`, 1);
var root_4 = $.from_html(`<!> Test ALPN Negotiation`, 1);
var root_5 = $.from_html(`<div class="status-item success"><!> <div><span class="status-title svelte-1qp7td"> </span> <p class="status-desc svelte-1qp7td">Connection established successfully</p></div></div>`);
var root_6 = $.from_html(`<div class="status-overview"><div><!> <div><span class="status-title svelte-1qp7td"> </span> <p class="status-desc svelte-1qp7td"> </p></div></div> <!></div>`);
var root_7 = $.from_html(`<div class="protocol-item requested svelte-1qp7td"><div class="protocol-header svelte-1qp7td"><span class="protocol-name svelte-1qp7td"> </span> <span class="protocol-id mono svelte-1qp7td"> </span> <span class="protocol-priority svelte-1qp7td"></span></div> <p class="protocol-desc svelte-1qp7td"> </p></div>`);
var root_8 = $.from_html(`<div class="detail-section svelte-1qp7td"><h5 class="svelte-1qp7td">Selected Protocol</h5> <div class="selected-protocol svelte-1qp7td"><div class="protocol-item selected svelte-1qp7td"><div class="protocol-header svelte-1qp7td"><span class="success-icon svelte-1qp7td"><!></span> <span class="protocol-name svelte-1qp7td"> </span> <span class="protocol-id mono svelte-1qp7td"> </span></div> <p class="protocol-desc svelte-1qp7td"> </p></div></div></div>`);
var root_9 = $.from_html(`<div class="detail-section svelte-1qp7td"><h5 class="svelte-1qp7td">Selected Protocol</h5> <div class="no-selection svelte-1qp7td"><!> <span>No protocol was selected by the server</span></div></div>`);
var root_10 = $.from_html(`<div class="detail-item svelte-1qp7td"><span class="detail-label svelte-1qp7td">TLS Version:</span> <span class="detail-value svelte-1qp7td"> </span></div>`);
var root_11 = $.from_html(`<div class="connection-section svelte-1qp7td"><h4 class="svelte-1qp7td">Connection Information</h4> <div class="detail-grid svelte-1qp7td"><div class="detail-item svelte-1qp7td"><span class="detail-label svelte-1qp7td">Server Name:</span> <span class="detail-value mono svelte-1qp7td"> </span></div> <!></div></div>`);
var root_12 = $.from_html(`<div class="card results-card"><div class="card-header row"><h3>ALPN Negotiation Results</h3> <button class="copy-btn"><!> </button></div> <div class="card-content"><!> <div class="protocols-section svelte-1qp7td"><h4 class="svelte-1qp7td">Protocol Negotiation Details</h4> <div class="protocol-details svelte-1qp7td"><div class="detail-section svelte-1qp7td"><h5 class="svelte-1qp7td">Requested Protocols</h5> <div class="protocol-list svelte-1qp7td"></div></div> <!></div></div> <!></div></div>`);

var root_13 = $.from_html(`<div class="card"><header class="card-header"><h1>TLS ALPN Negotiation</h1> <p>Test Application-Layer Protocol Negotiation (ALPN) to see which protocol a server selects from your offered list.
      Commonly used to negotiate HTTP/2, HTTP/3, or other application protocols during TLS handshake.</p></header> <!> <div class="card input-card"><div class="card-header"><h3>ALPN Negotiation Configuration</h3></div> <div class="card-content"><div class="form-row"><div class="form-group"><label for="host">Host:Port <input id="host" type="text" placeholder="google.com:443"/> <!></label></div></div> <div class="form-row"><div class="form-group"><label for="protocols">ALPN Protocols <input id="protocols" type="text" placeholder="h2,http/1.1"/></label> <div class="protocol-presets svelte-1qp7td"><span class="preset-label svelte-1qp7td">Quick select:</span> <!></div></div></div> <div class="form-row"><div class="form-group"><label class="checkbox-group"><input type="checkbox"/> Use custom SNI servername</label> <!></div></div> <div class="action-section"><button class="lookup-btn"><!></button></div></div></div> <!> <!> <div class="card info-card"><div class="card-header"><h3>Understanding ALPN</h3></div> <div class="card-content"><div class="info-grid"><div class="info-section"><h4>What is ALPN?</h4> <p>Application-Layer Protocol Negotiation (ALPN) is a TLS extension that allows the client and server to
            negotiate which application protocol to use during the TLS handshake.</p></div> <div class="info-section"><h4>Common Protocols</h4> <ul><li><strong>h2:</strong> HTTP/2 - Binary, multiplexed protocol</li> <li><strong>h3:</strong> HTTP/3 - Latest HTTP over QUIC</li> <li><strong>http/1.1:</strong> Traditional HTTP/1.1</li> <li><strong>spdy/3.1:</strong> Legacy SPDY protocol</li></ul></div> <div class="info-section"><h4>Protocol Priority</h4> <p>Protocols are offered in preference order. The server selects the first protocol from your list that it
            supports. Order matters!</p></div></div></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let host = $.state('google.com:443');
	let servername = $.state('');
	let useCustomServername = $.state(false);
	let protocols = $.state('h2,http/1.1');
	const diagnosticState = useDiagnosticState();
	const clipboard = useClipboard();

	const examplesList = [
		{
			host: 'google.com:443',
			protocols: 'h2,http/1.1',
			description: 'Google HTTP/2 support'
		},

		{
			host: 'github.com:443',
			protocols: 'h2,http/1.1',
			description: 'GitHub ALPN negotiation'
		},

		{
			host: 'cloudflare.com:443',
			protocols: 'h2,http/1.1,h3',
			description: 'Cloudflare HTTP/3 support'
		},

		{
			host: 'wikipedia.org:443',
			protocols: 'h2,http/1.1',
			description: 'Wikipedia HTTP/2 support'
		},

		{
			host: 'cdn.jsdelivr.net:443',
			protocols: 'h2,http/1.1',
			description: 'CDN ALPN support'
		},

		{
			host: 'api.github.com:443',
			protocols: 'h2,http/1.1',
			description: 'API server ALPN'
		}
	];

	const examples = useExamples(examplesList);

	const commonProtocols = [
		{
			value: 'h2,http/1.1',
			label: 'HTTP/2 + HTTP/1.1',
			description: 'Standard web protocols'
		},

		{
			value: 'h3,h2,http/1.1',
			label: 'HTTP/3 + HTTP/2 + HTTP/1.1',
			description: 'Including experimental HTTP/3'
		},

		{
			value: 'h2',
			label: 'HTTP/2 only',
			description: 'Test HTTP/2 exclusively'
		},

		{
			value: 'http/1.1',
			label: 'HTTP/1.1 only',
			description: 'Fallback protocol only'
		}
	];

	// Reactive validation
	const isInputValid = $.derived(() => () => {
		const trimmedHost = $.get(host).trim();

		if (!trimmedHost) return false;

		return (/^[a-zA-Z0-9.-]+(?::\d+)?$/).test(trimmedHost);
	});

	const protocolsArray = $.derived(() => () => {
		return $.get(protocols).split(',').map((p) => p.trim()).filter((p) => p);
	});

	async function probeALPN() {
		diagnosticState.startOperation();

		try {
			const response = await fetch('/api/internal/diagnostics/tls', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					action: 'alpn',
					host: $.get(host).trim(),
					protocols: $.get(protocolsArray),
					servername: $.get(useCustomServername) && $.get(servername) ? $.get(servername).trim() : undefined
				})
			});

			if (!response.ok) {
				const errorText = await response.text();

				try {
					const errorData = JSON.parse(errorText);

					throw new Error(errorData.message || `ALPN probe failed (${response.status})`);
				} catch {
					throw new Error(`ALPN probe failed (${response.status})`);
				}
			}

			const data = await response.json();

			diagnosticState.setResults(data);
		} catch(err) {
			diagnosticState.setError(err instanceof Error ? err.message : 'Unknown error occurred');
		}
	}

	function loadExample(example, index) {
		$.set(host, example.host, true);
		$.set(protocols, example.protocols, true);
		$.set(servername, '');
		$.set(useCustomServername, false);
		examples.select(index);
		probeALPN();
	}

	function setCommonProtocols(protocolSet) {
		$.set(protocols, protocolSet, true);
		examples.clear();

		if ($.get(isInputValid)()) probeALPN();
	}

	function getProtocolInfo(protocol) {
		switch (protocol) {
			case 'h3':
				return {
					name: 'HTTP/3',
					description: 'Latest HTTP version over QUIC',
					version: 'HTTP/3'
				};

			case 'h2':
				return {
					name: 'HTTP/2',
					description: 'Binary, multiplexed HTTP protocol',
					version: 'HTTP/2'
				};

			case 'http/1.1':
				return {
					name: 'HTTP/1.1',
					description: 'Traditional HTTP protocol',
					version: 'HTTP/1.1'
				};

			case 'http/1.0':
				return {
					name: 'HTTP/1.0',
					description: 'Legacy HTTP protocol',
					version: 'HTTP/1.0'
				};

			default:
				return {
					name: protocol,
					description: 'Custom or unknown protocol',
					version: protocol
				};
		}
	}

	function getNegotiationStatus() {
		if (!diagnosticState.results) return {
			status: 'Unknown',
			icon: 'help-circle',
			class: 'secondary',
			description: 'No results available'
		};

		if (diagnosticState.results.success && diagnosticState.results.negotiatedProtocol) {
			const protocol = getProtocolInfo(diagnosticState.results.negotiatedProtocol);

			return {
				status: 'Successful',
				icon: 'check-circle',
				class: 'success',
				description: `Server selected ${protocol.name}`
			};
		} else if (!diagnosticState.results.success) {
			return {
				status: 'Failed',
				icon: 'x-circle',
				class: 'error',
				description: 'No protocol was negotiated'
			};
		} else {
			return {
				status: 'No Selection',
				icon: 'minus-circle',
				class: 'warning',
				description: 'Server did not select any protocol'
			};
		}
	}

	async function copyALPNInfo() {
		if (!diagnosticState.results) return;

		let text = `ALPN Negotiation Results for ${$.get(host)}\n`;

		text += `Generated at: ${new Date().toISOString()}\n\n`;
		text += `Requested Protocols: ${diagnosticState.results.requestedProtocols.join(', ')}\n`;
		text += `Negotiated Protocol: ${diagnosticState.results.negotiatedProtocol || 'None'}\n`;
		text += `TLS Version: ${diagnosticState.results.tlsVersion || 'Unknown'}\n`;
		text += `Success: ${diagnosticState.results.success ? 'Yes' : 'No'}\n`;

		const status = getNegotiationStatus();

		text += `\nNegotiation Status: ${status.status}\n`;
		text += `Description: ${status.description}\n`;

		if (diagnosticState.results.negotiatedProtocol) {
			const protocolInfo = getProtocolInfo(diagnosticState.results.negotiatedProtocol);

			text += `\nSelected Protocol Info:\n`;
			text += `  Name: ${protocolInfo.name}\n`;
			text += `  Description: ${protocolInfo.description}\n`;
		}

		await clipboard.copy(text);
	}

	var div = root_13();
	var node = $.sibling($.child(div), 2);

	ExamplesCard(node, {
		get examples() {
			return examplesList;
		},

		get selectedIndex() {
			return examples.selectedIndex;
		},
		onSelect: loadExample,
		title: 'ALPN Examples',
		getLabel: (ex) => ex.host,
		getDescription: (ex) => ex.description,
		getTooltip: (ex) => `Test ALPN for ${ex.host} (${ex.description})`
	});

	var div_1 = $.sibling(node, 2);
	var div_2 = $.sibling($.child(div_1), 2);
	var div_3 = $.child(div_2);
	var div_4 = $.child(div_3);
	var label = $.child(div_4);
	var input = $.sibling($.child(label));

	$.remove_input_defaults(input);

	let classes;
	var node_1 = $.sibling(input, 2);

	{
		var consequent = ($$anchor) => {
			var span = root();

			$.append($$anchor, span);
		};

		$.if(node_1, ($$render) => {
			if ($.get(host) && !$.get(isInputValid)) $$render(consequent);
		});
	}

	$.reset(label);
	$.action(label, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Enter hostname:port (e.g., google.com:443)');
	$.reset(div_4);
	$.reset(div_3);

	var div_5 = $.sibling(div_3, 2);
	var div_6 = $.child(div_5);
	var label_1 = $.child(div_6);
	var input_1 = $.sibling($.child(label_1));

	$.remove_input_defaults(input_1);
	$.reset(label_1);
	$.action(label_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Comma-separated list of protocols to offer (e.g., h2,http/1.1)');

	var div_7 = $.sibling(label_1, 2);
	var node_2 = $.sibling($.child(div_7), 2);

	$.each(node_2, 17, () => commonProtocols, $.index, ($$anchor, preset) => {
		var button = root_1();
		var text_1 = $.only_child(button, true);

		$.action(button, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => $.get(preset).description);
		$.template_effect(() => $.set_text(text_1, $.get(preset).label));
		$.delegated('click', button, () => setCommonProtocols($.get(preset).value));
		$.append($$anchor, button);
	});

	$.reset(div_7);
	$.reset(div_6);
	$.reset(div_5);

	var div_8 = $.sibling(div_5, 2);
	var div_9 = $.child(div_8);
	var label_2 = $.child(div_9);
	var input_2 = $.child(label_2);

	$.remove_input_defaults(input_2);
	$.next();
	$.reset(label_2);

	var node_3 = $.sibling(label_2, 2);

	{
		var consequent_1 = ($$anchor) => {
			var input_3 = root_2();

			$.remove_input_defaults(input_3);
			$.effect(() => $.bind_value(input_3, () => $.get(servername), ($$value) => $.set(servername, $$value)));
			$.action(input_3, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Custom servername for SNI (Server Name Indication)');

			$.delegated('change', input_3, () => {
				examples.clear();

				if ($.get(isInputValid)()) probeALPN();
			});

			$.append($$anchor, input_3);
		};

		$.if(node_3, ($$render) => {
			if ($.get(useCustomServername)) $$render(consequent_1);
		});
	}

	$.reset(div_9);
	$.reset(div_8);

	var div_10 = $.sibling(div_8, 2);
	var button_1 = $.child(div_10);
	var node_4 = $.child(button_1);

	{
		var consequent_2 = ($$anchor) => {
			var fragment = root_3();
			var node_5 = $.first_child(fragment);

			Icon(node_5, { name: 'loader', size: 'sm', animate: 'spin' });
			$.next();
			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = root_4();
			var node_6 = $.first_child(fragment_1);

			Icon(node_6, { name: 'shuffle', size: 'sm' });
			$.next();
			$.append($$anchor, fragment_1);
		};

		$.if(node_4, ($$render) => {
			if (diagnosticState.loading) $$render(consequent_2); else $$render(alternate, -1);
		});
	}

	$.reset(button_1);
	$.reset(div_10);
	$.reset(div_2);
	$.reset(div_1);

	var node_7 = $.sibling(div_1, 2);

	{
		var consequent_8 = ($$anchor) => {
			var div_11 = root_12();
			var div_12 = $.child(div_11);
			var button_2 = $.sibling($.child(div_12), 2);
			var node_8 = $.child(button_2);

			{
				let $0 = $.derived(() => clipboard.isCopied() ? 'check' : 'copy');

				Icon(node_8, {
					get name() {
						return $.get($0);
					},
					size: 'xs'
				});
			}

			var text_2 = $.sibling(node_8);

			$.reset(button_2);
			$.reset(div_12);

			var div_13 = $.sibling(div_12, 2);
			var node_9 = $.child(div_13);

			{
				var consequent_4 = ($$anchor) => {
					const status = $.derived(getNegotiationStatus);
					var div_14 = root_6();
					var div_15 = $.child(div_14);
					var node_10 = $.child(div_15);

					Icon(node_10, {
						get name() {
							return $.get(status).icon;
						},
						size: 'sm'
					});

					var div_16 = $.sibling(node_10, 2);
					var span_1 = $.child(div_16);
					var text_3 = $.only_child(span_1);
					var p_1 = $.sibling(span_1, 2);
					var text_4 = $.only_child(p_1, true);

					$.reset(div_16);
					$.reset(div_15);

					var node_11 = $.sibling(div_15, 2);

					{
						var consequent_3 = ($$anchor) => {
							var div_17 = root_5();
							var node_12 = $.child(div_17);

							Icon(node_12, { name: 'shield-check', size: 'sm' });

							var div_18 = $.sibling(node_12, 2);
							var span_2 = $.child(div_18);
							var text_5 = $.only_child(span_2);

							$.next(2);
							$.reset(div_18);
							$.reset(div_17);
							$.template_effect(() => $.set_text(text_5, `TLS Version: ${diagnosticState.results.tlsVersion ?? ''}`));
							$.append($$anchor, div_17);
						};

						$.if(node_11, ($$render) => {
							if (diagnosticState.results.tlsVersion) $$render(consequent_3);
						});
					}

					$.reset(div_14);

					$.template_effect(() => {
						$.set_class(div_15, 1, `status-item ${$.get(status).class ?? ''}`, 'svelte-1qp7td');
						$.set_text(text_3, `Negotiation: ${$.get(status).status ?? ''}`);
						$.set_text(text_4, $.get(status).description);
					});

					$.append($$anchor, div_14);
				};

				$.if(node_9, ($$render) => {
					if (diagnosticState.results) $$render(consequent_4);
				});
			}

			var div_19 = $.sibling(node_9, 2);
			var div_20 = $.sibling($.child(div_19), 2);
			var div_21 = $.child(div_20);
			var div_22 = $.sibling($.child(div_21), 2);

			$.each(div_22, 21, () => diagnosticState.results.requestedProtocols, $.index, ($$anchor, protocol, i) => {
				const protocolInfo = $.derived(() => getProtocolInfo($.get(protocol)));
				var div_23 = root_7();
				var div_24 = $.child(div_23);
				var span_3 = $.child(div_24);
				var text_6 = $.only_child(span_3, true);
				var span_4 = $.sibling(span_3, 2);
				var text_7 = $.only_child(span_4);
				var span_5 = $.sibling(span_4, 2);

				span_5.textContent = `Priority ${i + 1}`;
				$.reset(div_24);

				var p_2 = $.sibling(div_24, 2);
				var text_8 = $.only_child(p_2, true);

				$.reset(div_23);

				$.template_effect(() => {
					$.set_text(text_6, $.get(protocolInfo).name);
					$.set_text(text_7, `(${$.get(protocol) ?? ''})`);
					$.set_text(text_8, $.get(protocolInfo).description);
				});

				$.append($$anchor, div_23);
			});

			$.reset(div_22);
			$.reset(div_21);

			var node_13 = $.sibling(div_21, 2);

			{
				var consequent_5 = ($$anchor) => {
					const selectedProtocol = $.derived(() => getProtocolInfo(diagnosticState.results.negotiatedProtocol));
					var div_25 = root_8();
					var div_26 = $.sibling($.child(div_25), 2);
					var div_27 = $.child(div_26);
					var div_28 = $.child(div_27);
					var span_6 = $.child(div_28);
					var node_14 = $.child(span_6);

					Icon(node_14, { name: 'check-circle', size: 'sm' });
					$.reset(span_6);

					var span_7 = $.sibling(span_6, 2);
					var text_9 = $.only_child(span_7, true);
					var span_8 = $.sibling(span_7, 2);
					var text_10 = $.only_child(span_8);

					$.reset(div_28);

					var p_3 = $.sibling(div_28, 2);
					var text_11 = $.only_child(p_3, true);

					$.reset(div_27);
					$.reset(div_26);
					$.reset(div_25);

					$.template_effect(() => {
						$.set_text(text_9, $.get(selectedProtocol).name);
						$.set_text(text_10, `(${diagnosticState.results.negotiatedProtocol ?? ''})`);
						$.set_text(text_11, $.get(selectedProtocol).description);
					});

					$.append($$anchor, div_25);
				};

				var alternate_1 = ($$anchor) => {
					var div_29 = root_9();
					var div_30 = $.sibling($.child(div_29), 2);
					var node_15 = $.child(div_30);

					Icon(node_15, { name: 'x-circle', size: 'sm' });
					$.next(2);
					$.reset(div_30);
					$.reset(div_29);
					$.append($$anchor, div_29);
				};

				$.if(node_13, ($$render) => {
					if (diagnosticState.results.negotiatedProtocol) $$render(consequent_5); else $$render(alternate_1, -1);
				});
			}

			$.reset(div_20);
			$.reset(div_19);

			var node_16 = $.sibling(div_19, 2);

			{
				var consequent_7 = ($$anchor) => {
					var div_31 = root_11();
					var div_32 = $.sibling($.child(div_31), 2);
					var div_33 = $.child(div_32);
					var span_9 = $.sibling($.child(div_33), 2);
					var text_12 = $.only_child(span_9, true);

					$.reset(div_33);

					var node_17 = $.sibling(div_33, 2);

					{
						var consequent_6 = ($$anchor) => {
							var div_34 = root_10();
							var span_10 = $.sibling($.child(div_34), 2);
							var text_13 = $.only_child(span_10, true);

							$.reset(div_34);
							$.template_effect(() => $.set_text(text_13, diagnosticState.results.tlsVersion));
							$.append($$anchor, div_34);
						};

						$.if(node_17, ($$render) => {
							if (diagnosticState.results.tlsVersion) $$render(consequent_6);
						});
					}

					$.reset(div_32);
					$.reset(div_31);
					$.template_effect(() => $.set_text(text_12, diagnosticState.results.servername));
					$.append($$anchor, div_31);
				};

				$.if(node_16, ($$render) => {
					if (diagnosticState.results.servername || diagnosticState.results.tlsVersion) $$render(consequent_7);
				});
			}

			$.reset(div_13);
			$.reset(div_11);

			$.template_effect(
				($0, $1) => {
					button_2.disabled = $0;
					$.set_text(text_2, ` ${$1 ?? ''}`);
				},
				[
					() => clipboard.isCopied(),
					() => clipboard.isCopied() ? 'Copied!' : 'Copy Results'
				]
			);

			$.delegated('click', button_2, copyALPNInfo);
			$.append($$anchor, div_11);
		};

		$.if(node_7, ($$render) => {
			if (diagnosticState.results) $$render(consequent_8);
		});
	}

	var node_18 = $.sibling(node_7, 2);

	ErrorCard(node_18, {
		title: 'ALPN Negotiation Failed',
		get error() {
			return diagnosticState.error;
		}
	});

	$.next(2);
	$.reset(div);

	$.template_effect(() => {
		classes = $.set_class(input, 1, '', null, classes, { invalid: $.get(host) && !$.get(isInputValid) });
		button_1.disabled = diagnosticState.loading || !$.get(isInputValid);
	});

	$.delegated('change', input, () => {
		examples.clear();

		if ($.get(isInputValid)()) probeALPN();
	});

	$.bind_value(input, () => $.get(host), ($$value) => $.set(host, $$value));

	$.delegated('change', input_1, () => {
		examples.clear();

		if ($.get(isInputValid)()) probeALPN();
	});

	$.bind_value(input_1, () => $.get(protocols), ($$value) => $.set(protocols, $$value));

	$.delegated('change', input_2, () => {
		examples.clear();

		if ($.get(isInputValid)()) probeALPN();
	});

	$.bind_checked(input_2, () => $.get(useCustomServername), ($$value) => $.set(useCustomServername, $$value));
	$.delegated('click', button_1, probeALPN);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['change', 'click']);