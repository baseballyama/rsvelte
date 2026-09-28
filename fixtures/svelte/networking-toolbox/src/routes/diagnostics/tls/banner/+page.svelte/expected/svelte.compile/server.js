import * as $ from 'svelte/internal/server';
import Icon from '$lib/components/global/Icon.svelte';
import { useDiagnosticState, useExamples } from '$lib/composables';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import ErrorCard from '$lib/components/common/ErrorCard.svelte';
import '../../../../styles/diagnostics-pages.scss';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let host = '';
		let port = null;
		let service = 'custom';
		const diagnosticState = useDiagnosticState();

		const services = {
			custom: { port: null, description: 'Custom port' },
			ssh: { port: 22, description: 'SSH Server' },
			smtp: { port: 25, description: 'SMTP Mail Server' },
			whois: { port: 43, description: 'WHOIS Service' },
			http: { port: 80, description: 'HTTP Web Server' },
			https: { port: 443, description: 'HTTPS Web Server' },
			ftp: { port: 21, description: 'FTP Server' },
			telnet: { port: 23, description: 'Telnet Server' },
			pop3: { port: 110, description: 'POP3 Mail Server' },
			imap: { port: 143, description: 'IMAP Mail Server' },
			smtps: { port: 465, description: 'SMTP over TLS' },
			submission: { port: 587, description: 'Mail Submission' },
			imaps: { port: 993, description: 'IMAP over TLS' },
			pop3s: { port: 995, description: 'POP3 over TLS' },
			mysql: { port: 3306, description: 'MySQL Database' },
			postgresql: { port: 5432, description: 'PostgreSQL Database' },
			redis: { port: 6379, description: 'Redis Database' },
			mongodb: { port: 27017, description: 'MongoDB Database' },
			rdp: { port: 3389, description: 'Remote Desktop' },
			vnc: { port: 5900, description: 'VNC Remote Desktop' }
		};

		const examplesList = [
			{
				host: 'scanme.nmap.org',
				port: 22,
				service: 'ssh',
				description: 'Nmap SSH Test'
			},

			{
				host: 'test.rebex.net',
				port: 21,
				service: 'ftp',
				description: 'Rebex FTP Test'
			},

			{
				host: 'example.com',
				port: 80,
				service: 'http',
				description: 'Example.com HTTP'
			},

			{
				host: 'www.google.com',
				port: 80,
				service: 'http',
				description: 'Google HTTP'
			},

			{
				host: 'aspmx.l.google.com',
				port: 25,
				service: 'smtp',
				description: 'Google MX Server'
			},

			{
				host: 'whois.iana.org',
				port: 43,
				service: 'whois',
				description: 'IANA WHOIS'
			},

			{
				host: 'ftp.freebsd.org',
				port: 21,
				service: 'ftp',
				description: 'FreeBSD FTP'
			},

			{
				host: 'httpbin.org',
				port: 80,
				service: 'http',
				description: 'HTTPBin API'
			},

			{
				host: 'whois.verisign-grs.com',
				port: 43,
				service: 'whois',
				description: 'Verisign WHOIS'
			}
		];

		const examples = useExamples(examplesList);

		const isInputValid = $.derived(() => () => {
			const trimmedHost = host.trim();

			if (!trimmedHost) return false;
			if (port === null || port < 1 || port > 65535) return false;

			// Basic hostname/IP validation
			const hostPattern = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$|^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$|^\[?[a-fA-F0-9:]+\]?$/;

			return hostPattern.test(trimmedHost);
		});

		async function grabBanner() {
			if (!isInputValid()) {
				diagnosticState.setError('Please enter a valid host and port (1-65535)');

				return;
			}

			diagnosticState.startOperation();

			try {
				const response = await fetch('/api/internal/diagnostics/tls', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ action: 'banner', host: host.trim(), port })
				});

				const data = await response.json();

				if (!response.ok) {
					const errorMessage = data.message || 'Failed to grab banner';

					if (errorMessage.includes('ENOTFOUND')) {
						throw new Error('Host not found. Please check the hostname and try again.');
					} else if (errorMessage.includes('ECONNREFUSED')) {
						throw new Error(`Connection refused on port ${port}. The service may be down or port closed.`);
					} else if (errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT')) {
						throw new Error('Connection timed out. The host may be unreachable or port filtered.');
					}

					throw new Error(errorMessage);
				}

				diagnosticState.setResults(data);
			} catch(err) {
				diagnosticState.setError(err instanceof Error ? err.message : 'An unexpected error occurred');
			}
		}

		function loadExample(example, index) {
			host = example.host;
			port = example.port;
			service = example.service;
			examples.select(index);
			grabBanner();
		}

		function getProtocolIcon(protocol) {
			switch (protocol?.toLowerCase()) {
				case 'ssh':
					return 'terminal';

				case 'http':

				case 'https':
					return 'globe';

				case 'smtp':

				case 'smtps':

				case 'submission':
					return 'mail';

				case 'ftp':
					return 'folder';

				case 'tls':

				case 'ssl':
					return 'lock';

				default:
					return 'server';
			}
		}

		function formatBanner(banner) {
			// Escape HTML and preserve formatting
			return banner.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>').replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
		}

		$$renderer.push(`<div class="card"><header class="card-header"><h1>Service Banner Grabber</h1> <p>Retrieve service banners from SSH, SMTP, HTTP, FTP, and other network services</p></header> `);

		ExamplesCard($$renderer, {
			examples: examplesList,
			selectedIndex: examples.selectedIndex,
			onSelect: loadExample,
			title: 'Quick Examples',
			getLabel: (ex) => ex.description,
			getDescription: (ex) => `${ex.host}:${ex.port}`,
			getTooltip: (ex) => `Grab banner from ${ex.host}:${ex.port}`
		});

		$$renderer.push(`<!----> <div class="card input-card"><div class="card-header"><h3>Target Service</h3></div> <div class="card-content"><div class="form-row svelte-cfs7gq"><div class="form-group"><label for="service">Service Type</label> `);

		$$renderer.select(
			{
				id: 'service',
				value: service,
				disabled: diagnosticState.loading,
				onchange: () => examples.clear(),
				class: ''
			},
			($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(Object.entries(services));

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let [key, svc] = each_array[$$index];

					$$renderer.option({ value: key }, ($$renderer) => {
						$$renderer.push(`${$.escape(svc.description)} ${$.escape(svc.port ? `(${svc.port})` : '')}`);
					});
				}

				$$renderer.push(`<!--]-->`);
			},
			'svelte-cfs7gq'
		);

		$$renderer.push(`</div></div> <div class="form-row svelte-cfs7gq"><div class="form-group flex-2 svelte-cfs7gq"><label for="host">Host / IP Address</label> <input id="host" type="text"${$.attr('value', host)} placeholder="example.com or 192.168.1.1"${$.attr('disabled', diagnosticState.loading, true)}/></div> <div class="form-group flex-1 svelte-cfs7gq"><label for="port">Port</label> <input id="port" type="number"${$.attr('value', port)} min="1" max="65535" placeholder="1-65535"${$.attr('disabled', diagnosticState.loading, true)}/></div></div> <button${$.attr('disabled', diagnosticState.loading || !isInputValid(), true)} class="primary">`);

		if (diagnosticState.loading) {
			$$renderer.push('<!--[0-->');
			Icon($$renderer, { name: 'loader', size: 'sm', animate: 'spin' });
			$$renderer.push(`<!----> Connecting...`);
		} else {
			$$renderer.push('<!--[-1-->');
			Icon($$renderer, { name: 'terminal', size: 'sm' });
			$$renderer.push(`<!----> Grab Banner`);
		}

		$$renderer.push(`<!--]--></button></div></div> `);
		ErrorCard($$renderer, { title: 'Connection Failed', error: diagnosticState.error });
		$$renderer.push(`<!----> `);

		if (diagnosticState.loading) {
			$$renderer.push(`<!--[0--><div class="card"><div class="card-content"><div class="loading-state">`);
			Icon($$renderer, { name: 'loader', size: 'lg', animate: 'spin' });
			$$renderer.push(`<!----> <div class="loading-text"><h3>Grabbing Banner</h3> <p>Connecting to ${$.escape(host)}:${$.escape(port)}...</p></div></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (diagnosticState.results) {
			$$renderer.push(`<!--[0--><div class="card results-card svelte-cfs7gq"><div class="card-header"><h3>Banner Information</h3></div> <div class="card-content svelte-cfs7gq"><div class="card info-section svelte-cfs7gq"><div class="card-header"><h3>Connection Details</h3></div> <div class="card-content svelte-cfs7gq"><div class="info-grid svelte-cfs7gq"><div class="info-item svelte-cfs7gq"><span class="info-label svelte-cfs7gq">Host:</span> <span class="info-value svelte-cfs7gq">${$.escape(diagnosticState.results.host)}</span></div> <div class="info-item svelte-cfs7gq"><span class="info-label svelte-cfs7gq">Port:</span> <span class="info-value svelte-cfs7gq">${$.escape(diagnosticState.results.port)}</span></div> <div class="info-item svelte-cfs7gq"><span class="info-label svelte-cfs7gq">Protocol:</span> <span class="info-value svelte-cfs7gq">`);

			Icon($$renderer, {
				name: getProtocolIcon(diagnosticState.results.protocol),
				size: 'xs'
			});

			$$renderer.push(`<!----> ${$.escape(diagnosticState.results.protocol || 'Unknown')}</span></div> <div class="info-item svelte-cfs7gq"><span class="info-label svelte-cfs7gq">Response Time:</span> <span class="info-value svelte-cfs7gq">${$.escape(diagnosticState.results.responseTime)}ms</span></div></div></div></div> <div class="card banner-section svelte-cfs7gq"><div class="card-header"><h3>Service Banner</h3></div> <div class="card-content svelte-cfs7gq">`);

			if (diagnosticState.results.banner) {
				$$renderer.push(`<!--[0--><pre class="banner-content svelte-cfs7gq">${$.html(formatBanner(diagnosticState.results.banner))}</pre>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="no-banner svelte-cfs7gq">`);
				Icon($$renderer, { name: 'file-x', size: 'lg' });
				$$renderer.push(`<!----> <p class="svelte-cfs7gq">No banner received from service</p> <small class="svelte-cfs7gq">The service may not send a banner or requires specific protocol handshake</small></div>`);
			}

			$$renderer.push(`<!--]--></div></div> `);

			if (diagnosticState.results.analysis && (diagnosticState.results.analysis.software || diagnosticState.results.analysis.version || diagnosticState.results.analysis.os || diagnosticState.results.analysis.security && diagnosticState.results.analysis.security.length > 0)) {
				$$renderer.push(`<!--[0--><div class="card analysis-section svelte-cfs7gq"><div class="card-header"><h3>Service Analysis</h3></div> <div class="card-content svelte-cfs7gq"><div class="analysis-grid svelte-cfs7gq">`);

				if (diagnosticState.results.analysis.software) {
					$$renderer.push(`<!--[0--><div class="analysis-item svelte-cfs7gq">`);
					Icon($$renderer, { name: 'package', size: 'sm' });
					$$renderer.push(`<!----> <div><h4 class="svelte-cfs7gq">Software</h4> <p class="svelte-cfs7gq">${$.escape(diagnosticState.results.analysis.software)}</p></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (diagnosticState.results.analysis.version) {
					$$renderer.push(`<!--[0--><div class="analysis-item svelte-cfs7gq">`);
					Icon($$renderer, { name: 'tag', size: 'sm' });
					$$renderer.push(`<!----> <div><h4 class="svelte-cfs7gq">Version</h4> <p class="svelte-cfs7gq">${$.escape(diagnosticState.results.analysis.version)}</p></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (diagnosticState.results.analysis.os) {
					$$renderer.push(`<!--[0--><div class="analysis-item svelte-cfs7gq">`);
					Icon($$renderer, { name: 'monitor', size: 'sm' });
					$$renderer.push(`<!----> <div><h4 class="svelte-cfs7gq">Operating System</h4> <p class="svelte-cfs7gq">${$.escape(diagnosticState.results.analysis.os)}</p></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (diagnosticState.results.analysis.security && diagnosticState.results.analysis.security.length > 0) {
					$$renderer.push(`<!--[0--><div class="analysis-item full-width svelte-cfs7gq">`);
					Icon($$renderer, { name: 'shield', size: 'sm' });
					$$renderer.push(`<!----> <div><h4 class="svelte-cfs7gq">Security Notes</h4> <ul class="svelte-cfs7gq"><!--[-->`);

					const each_array_1 = $.ensure_array_like(diagnosticState.results.analysis.security);

					for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
						let note = each_array_1[i];

						$$renderer.push(`<li class="svelte-cfs7gq">${$.escape(note)}</li>`);
					}

					$$renderer.push(`<!--]--></ul></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (diagnosticState.results.tls) {
				$$renderer.push(`<!--[0--><div class="card tls-section svelte-cfs7gq"><div class="card-header"><h3>TLS Information</h3></div> <div class="card-content svelte-cfs7gq"><div class="tls-info svelte-cfs7gq"><div class="tls-item svelte-cfs7gq"><span class="tls-label svelte-cfs7gq">Protocol:</span> <span class="tls-value svelte-cfs7gq">${$.escape(diagnosticState.results.tls.protocol)}</span></div> <div class="tls-item svelte-cfs7gq"><span class="tls-label svelte-cfs7gq">Cipher:</span> <span class="tls-value svelte-cfs7gq">${$.escape(diagnosticState.results.tls.cipher)}</span></div> `);

				if (diagnosticState.results.tls.certificate) {
					$$renderer.push(`<!--[0--><div class="tls-item svelte-cfs7gq"><span class="tls-label svelte-cfs7gq">Certificate CN:</span> <span class="tls-value svelte-cfs7gq">${$.escape(diagnosticState.results.tls.certificate.cn)}</span></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}