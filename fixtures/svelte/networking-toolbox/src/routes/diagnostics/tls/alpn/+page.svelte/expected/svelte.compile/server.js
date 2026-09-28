import * as $ from 'svelte/internal/server';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import { useDiagnosticState, useClipboard, useExamples } from '$lib/composables';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import ErrorCard from '$lib/components/common/ErrorCard.svelte';
import '../../../../styles/diagnostics-pages.scss';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let host = 'google.com:443';
		let servername = '';
		let useCustomServername = false;
		let protocols = 'h2,http/1.1';
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
			const trimmedHost = host.trim();

			if (!trimmedHost) return false;

			return (/^[a-zA-Z0-9.-]+(?::\d+)?$/).test(trimmedHost);
		});

		const protocolsArray = $.derived(() => () => {
			return protocols.split(',').map((p) => p.trim()).filter((p) => p);
		});

		async function probeALPN() {
			diagnosticState.startOperation();

			try {
				const response = await fetch('/api/internal/diagnostics/tls', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						action: 'alpn',
						host: host.trim(),
						protocols: protocolsArray(),
						servername: useCustomServername && servername ? servername.trim() : undefined
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
			host = example.host;
			protocols = example.protocols;
			servername = '';
			useCustomServername = false;
			examples.select(index);
			probeALPN();
		}

		function setCommonProtocols(protocolSet) {
			protocols = protocolSet;
			examples.clear();

			if (isInputValid()()) probeALPN();
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

			let text = `ALPN Negotiation Results for ${host}\n`;

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

		$$renderer.push(`<div class="card"><header class="card-header"><h1>TLS ALPN Negotiation</h1> <p>Test Application-Layer Protocol Negotiation (ALPN) to see which protocol a server selects from your offered list.
      Commonly used to negotiate HTTP/2, HTTP/3, or other application protocols during TLS handshake.</p></header> `);

		ExamplesCard($$renderer, {
			examples: examplesList,
			selectedIndex: examples.selectedIndex,
			onSelect: loadExample,
			title: 'ALPN Examples',
			getLabel: (ex) => ex.host,
			getDescription: (ex) => ex.description,
			getTooltip: (ex) => `Test ALPN for ${ex.host} (${ex.description})`
		});

		$$renderer.push(`<!----> <div class="card input-card"><div class="card-header"><h3>ALPN Negotiation Configuration</h3></div> <div class="card-content"><div class="form-row"><div class="form-group"><label for="host">Host:Port <input id="host" type="text"${$.attr('value', host)} placeholder="google.com:443"${$.attr_class('', void 0, { 'invalid': host && !isInputValid() })}/> `);

		if (host && !isInputValid()) {
			$$renderer.push(`<!--[0--><span class="error-text">Invalid host:port format</span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></label></div></div> <div class="form-row"><div class="form-group"><label for="protocols">ALPN Protocols <input id="protocols" type="text"${$.attr('value', protocols)} placeholder="h2,http/1.1"/></label> <div class="protocol-presets svelte-1qp7td"><span class="preset-label svelte-1qp7td">Quick select:</span> <!--[-->`);

		const each_array = $.ensure_array_like(commonProtocols);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let preset = each_array[index];

			$$renderer.push(`<button type="button" class="preset-btn svelte-1qp7td">${$.escape(preset.label)}</button>`);
		}

		$$renderer.push(`<!--]--></div></div></div> <div class="form-row"><div class="form-group"><label class="checkbox-group"><input type="checkbox"${$.attr('checked', useCustomServername, true)}/> Use custom SNI servername</label> `);

		if (useCustomServername) {
			$$renderer.push(`<!--[0--><input type="text"${$.attr('value', servername)} placeholder="example.com"/>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div> <div class="action-section"><button class="lookup-btn"${$.attr('disabled', diagnosticState.loading || !isInputValid(), true)}>`);

		if (diagnosticState.loading) {
			$$renderer.push('<!--[0-->');
			Icon($$renderer, { name: 'loader', size: 'sm', animate: 'spin' });
			$$renderer.push(`<!----> Testing ALPN...`);
		} else {
			$$renderer.push('<!--[-1-->');
			Icon($$renderer, { name: 'shuffle', size: 'sm' });
			$$renderer.push(`<!----> Test ALPN Negotiation`);
		}

		$$renderer.push(`<!--]--></button></div></div></div> `);

		if (diagnosticState.results) {
			$$renderer.push(`<!--[0--><div class="card results-card"><div class="card-header row"><h3>ALPN Negotiation Results</h3> <button class="copy-btn"${$.attr('disabled', clipboard.isCopied(), true)}>`);
			Icon($$renderer, { name: clipboard.isCopied() ? 'check' : 'copy', size: 'xs' });
			$$renderer.push(`<!----> ${$.escape(clipboard.isCopied() ? 'Copied!' : 'Copy Results')}</button></div> <div class="card-content">`);

			if (diagnosticState.results) {
				$$renderer.push('<!--[0-->');

				const status = getNegotiationStatus();

				$$renderer.push(`<div class="status-overview"><div${$.attr_class(`status-item ${$.stringify(status.class)}`, 'svelte-1qp7td')}>`);
				Icon($$renderer, { name: status.icon, size: 'sm' });
				$$renderer.push(`<!----> <div><span class="status-title svelte-1qp7td">Negotiation: ${$.escape(status.status)}</span> <p class="status-desc svelte-1qp7td">${$.escape(status.description)}</p></div></div> `);

				if (diagnosticState.results.tlsVersion) {
					$$renderer.push(`<!--[0--><div class="status-item success">`);
					Icon($$renderer, { name: 'shield-check', size: 'sm' });
					$$renderer.push(`<!----> <div><span class="status-title svelte-1qp7td">TLS Version: ${$.escape(diagnosticState.results.tlsVersion)}</span> <p class="status-desc svelte-1qp7td">Connection established successfully</p></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div class="protocols-section svelte-1qp7td"><h4 class="svelte-1qp7td">Protocol Negotiation Details</h4> <div class="protocol-details svelte-1qp7td"><div class="detail-section svelte-1qp7td"><h5 class="svelte-1qp7td">Requested Protocols</h5> <div class="protocol-list svelte-1qp7td"><!--[-->`);

			const each_array_1 = $.ensure_array_like(diagnosticState.results.requestedProtocols);

			for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
				let protocol = each_array_1[i];
				const protocolInfo = getProtocolInfo(protocol);

				$$renderer.push(`<div class="protocol-item requested svelte-1qp7td"><div class="protocol-header svelte-1qp7td"><span class="protocol-name svelte-1qp7td">${$.escape(protocolInfo.name)}</span> <span class="protocol-id mono svelte-1qp7td">(${$.escape(protocol)})</span> <span class="protocol-priority svelte-1qp7td">Priority ${$.escape(i + 1)}</span></div> <p class="protocol-desc svelte-1qp7td">${$.escape(protocolInfo.description)}</p></div>`);
			}

			$$renderer.push(`<!--]--></div></div> `);

			if (diagnosticState.results.negotiatedProtocol) {
				$$renderer.push('<!--[0-->');

				const selectedProtocol = getProtocolInfo(diagnosticState.results.negotiatedProtocol);

				$$renderer.push(`<div class="detail-section svelte-1qp7td"><h5 class="svelte-1qp7td">Selected Protocol</h5> <div class="selected-protocol svelte-1qp7td"><div class="protocol-item selected svelte-1qp7td"><div class="protocol-header svelte-1qp7td"><span class="success-icon svelte-1qp7td">`);
				Icon($$renderer, { name: 'check-circle', size: 'sm' });
				$$renderer.push(`<!----></span> <span class="protocol-name svelte-1qp7td">${$.escape(selectedProtocol.name)}</span> <span class="protocol-id mono svelte-1qp7td">(${$.escape(diagnosticState.results.negotiatedProtocol)})</span></div> <p class="protocol-desc svelte-1qp7td">${$.escape(selectedProtocol.description)}</p></div></div></div>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="detail-section svelte-1qp7td"><h5 class="svelte-1qp7td">Selected Protocol</h5> <div class="no-selection svelte-1qp7td">`);
				Icon($$renderer, { name: 'x-circle', size: 'sm' });
				$$renderer.push(`<!----> <span>No protocol was selected by the server</span></div></div>`);
			}

			$$renderer.push(`<!--]--></div></div> `);

			if (diagnosticState.results.servername || diagnosticState.results.tlsVersion) {
				$$renderer.push(`<!--[0--><div class="connection-section svelte-1qp7td"><h4 class="svelte-1qp7td">Connection Information</h4> <div class="detail-grid svelte-1qp7td"><div class="detail-item svelte-1qp7td"><span class="detail-label svelte-1qp7td">Server Name:</span> <span class="detail-value mono svelte-1qp7td">${$.escape(diagnosticState.results.servername)}</span></div> `);

				if (diagnosticState.results.tlsVersion) {
					$$renderer.push(`<!--[0--><div class="detail-item svelte-1qp7td"><span class="detail-label svelte-1qp7td">TLS Version:</span> <span class="detail-value svelte-1qp7td">${$.escape(diagnosticState.results.tlsVersion)}</span></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		ErrorCard($$renderer, {
			title: 'ALPN Negotiation Failed',
			error: diagnosticState.error
		});

		$$renderer.push(`<!----> <div class="card info-card"><div class="card-header"><h3>Understanding ALPN</h3></div> <div class="card-content"><div class="info-grid"><div class="info-section"><h4>What is ALPN?</h4> <p>Application-Layer Protocol Negotiation (ALPN) is a TLS extension that allows the client and server to
            negotiate which application protocol to use during the TLS handshake.</p></div> <div class="info-section"><h4>Common Protocols</h4> <ul><li><strong>h2:</strong> HTTP/2 - Binary, multiplexed protocol</li> <li><strong>h3:</strong> HTTP/3 - Latest HTTP over QUIC</li> <li><strong>http/1.1:</strong> Traditional HTTP/1.1</li> <li><strong>spdy/3.1:</strong> Legacy SPDY protocol</li></ul></div> <div class="info-section"><h4>Protocol Priority</h4> <p>Protocols are offered in preference order. The server selects the first protocol from your list that it
            supports. Order matters!</p></div></div></div></div></div>`);
	});
}