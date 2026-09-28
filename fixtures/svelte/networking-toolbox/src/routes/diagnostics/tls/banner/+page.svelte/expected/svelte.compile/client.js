import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '$lib/components/global/Icon.svelte';
import { useDiagnosticState, useExamples } from '$lib/composables';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import ErrorCard from '$lib/components/common/ErrorCard.svelte';
import '../../../../styles/diagnostics-pages.scss';

var root = $.from_html(`<option> </option>`);
var root_1 = $.from_html(`<!> Connecting...`, 1);
var root_2 = $.from_html(`<!> Grab Banner`, 1);
var root_3 = $.from_html(`<div class="card"><div class="card-content"><div class="loading-state"><!> <div class="loading-text"><h3>Grabbing Banner</h3> <p> </p></div></div></div></div>`);
var root_4 = $.from_html(`<pre class="banner-content svelte-cfs7gq"></pre>`);
var root_5 = $.from_html(`<div class="no-banner svelte-cfs7gq"><!> <p class="svelte-cfs7gq">No banner received from service</p> <small class="svelte-cfs7gq">The service may not send a banner or requires specific protocol handshake</small></div>`);
var root_6 = $.from_html(`<div class="analysis-item svelte-cfs7gq"><!> <div><h4 class="svelte-cfs7gq">Software</h4> <p class="svelte-cfs7gq"> </p></div></div>`);
var root_7 = $.from_html(`<div class="analysis-item svelte-cfs7gq"><!> <div><h4 class="svelte-cfs7gq">Version</h4> <p class="svelte-cfs7gq"> </p></div></div>`);
var root_8 = $.from_html(`<div class="analysis-item svelte-cfs7gq"><!> <div><h4 class="svelte-cfs7gq">Operating System</h4> <p class="svelte-cfs7gq"> </p></div></div>`);
var root_9 = $.from_html(`<li class="svelte-cfs7gq"> </li>`);
var root_10 = $.from_html(`<div class="analysis-item full-width svelte-cfs7gq"><!> <div><h4 class="svelte-cfs7gq">Security Notes</h4> <ul class="svelte-cfs7gq"></ul></div></div>`);
var root_11 = $.from_html(`<div class="card analysis-section svelte-cfs7gq"><div class="card-header"><h3>Service Analysis</h3></div> <div class="card-content svelte-cfs7gq"><div class="analysis-grid svelte-cfs7gq"><!> <!> <!> <!></div></div></div>`);
var root_12 = $.from_html(`<div class="tls-item svelte-cfs7gq"><span class="tls-label svelte-cfs7gq">Certificate CN:</span> <span class="tls-value svelte-cfs7gq"> </span></div>`);
var root_13 = $.from_html(`<div class="card tls-section svelte-cfs7gq"><div class="card-header"><h3>TLS Information</h3></div> <div class="card-content svelte-cfs7gq"><div class="tls-info svelte-cfs7gq"><div class="tls-item svelte-cfs7gq"><span class="tls-label svelte-cfs7gq">Protocol:</span> <span class="tls-value svelte-cfs7gq"> </span></div> <div class="tls-item svelte-cfs7gq"><span class="tls-label svelte-cfs7gq">Cipher:</span> <span class="tls-value svelte-cfs7gq"> </span></div> <!></div></div></div>`);
var root_14 = $.from_html(`<div class="card results-card svelte-cfs7gq"><div class="card-header"><h3>Banner Information</h3></div> <div class="card-content svelte-cfs7gq"><div class="card info-section svelte-cfs7gq"><div class="card-header"><h3>Connection Details</h3></div> <div class="card-content svelte-cfs7gq"><div class="info-grid svelte-cfs7gq"><div class="info-item svelte-cfs7gq"><span class="info-label svelte-cfs7gq">Host:</span> <span class="info-value svelte-cfs7gq"> </span></div> <div class="info-item svelte-cfs7gq"><span class="info-label svelte-cfs7gq">Port:</span> <span class="info-value svelte-cfs7gq"> </span></div> <div class="info-item svelte-cfs7gq"><span class="info-label svelte-cfs7gq">Protocol:</span> <span class="info-value svelte-cfs7gq"><!> </span></div> <div class="info-item svelte-cfs7gq"><span class="info-label svelte-cfs7gq">Response Time:</span> <span class="info-value svelte-cfs7gq"> </span></div></div></div></div> <div class="card banner-section svelte-cfs7gq"><div class="card-header"><h3>Service Banner</h3></div> <div class="card-content svelte-cfs7gq"><!></div></div> <!> <!></div></div>`);
var root_15 = $.from_html(`<div class="card"><header class="card-header"><h1>Service Banner Grabber</h1> <p>Retrieve service banners from SSH, SMTP, HTTP, FTP, and other network services</p></header> <!> <div class="card input-card"><div class="card-header"><h3>Target Service</h3></div> <div class="card-content"><div class="form-row svelte-cfs7gq"><div class="form-group"><label for="service">Service Type</label> <select id="service" class="svelte-cfs7gq"></select></div></div> <div class="form-row svelte-cfs7gq"><div class="form-group flex-2 svelte-cfs7gq"><label for="host">Host / IP Address</label> <input id="host" type="text" placeholder="example.com or 192.168.1.1"/></div> <div class="form-group flex-1 svelte-cfs7gq"><label for="port">Port</label> <input id="port" type="number" min="1" max="65535" placeholder="1-65535"/></div></div> <button class="primary"><!></button></div></div> <!> <!> <!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let host = $.state('');
	let port = $.state(null);
	let service = $.state('custom');
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

	$.user_effect(() => {
		if ($.get(service) && $.get(service) !== 'custom' && services[$.get(service)]) {
			$.set(port, services[$.get(service)].port, true);
		}
	});

	const isInputValid = $.derived(() => () => {
		const trimmedHost = $.get(host).trim();

		if (!trimmedHost) return false;
		if ($.get(port) === null || $.get(port) < 1 || $.get(port) > 65535) return false;

		// Basic hostname/IP validation
		const hostPattern = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$|^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$|^\[?[a-fA-F0-9:]+\]?$/;

		return hostPattern.test(trimmedHost);
	});

	async function grabBanner() {
		if (!$.get(isInputValid)) {
			diagnosticState.setError('Please enter a valid host and port (1-65535)');

			return;
		}

		diagnosticState.startOperation();

		try {
			const response = await fetch('/api/internal/diagnostics/tls', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					action: 'banner',
					host: $.get(host).trim(),
					port: $.get(port)
				})
			});

			const data = await response.json();

			if (!response.ok) {
				const errorMessage = data.message || 'Failed to grab banner';

				if (errorMessage.includes('ENOTFOUND')) {
					throw new Error('Host not found. Please check the hostname and try again.');
				} else if (errorMessage.includes('ECONNREFUSED')) {
					throw new Error(`Connection refused on port ${$.get(port)}. The service may be down or port closed.`);
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
		$.set(host, example.host, true);
		$.set(port, example.port, true);
		$.set(service, example.service, true);
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

	var div = root_15();
	var node = $.sibling($.child(div), 2);

	ExamplesCard(node, {
		get examples() {
			return examplesList;
		},

		get selectedIndex() {
			return examples.selectedIndex;
		},
		onSelect: loadExample,
		title: 'Quick Examples',
		getLabel: (ex) => ex.description,
		getDescription: (ex) => `${ex.host}:${ex.port}`,
		getTooltip: (ex) => `Grab banner from ${ex.host}:${ex.port}`
	});

	var div_1 = $.sibling(node, 2);
	var div_2 = $.sibling($.child(div_1), 2);
	var div_3 = $.child(div_2);
	var div_4 = $.child(div_3);
	var select = $.sibling($.child(div_4), 2);

	$.each(select, 21, () => Object.entries(services), ([key, svc]) => key, ($$anchor, $$item) => {
		var $$array = $.derived(() => $.to_array($.get($$item), 2));
		let key = () => $.get($$array)[0];
		let svc = () => $.get($$array)[1];
		var option = root();
		var text = $.only_child(option);
		var option_value = {};

		$.template_effect(() => {
			$.set_text(text, `${svc().description ?? ''} ${svc().port ? `(${svc().port})` : ''}`);

			if (option_value !== (option_value = key())) {
				option.value = (option.__value = option_value) ?? '';
			}
		});

		$.append($$anchor, option);
	});

	$.reset(select);
	$.init_select(select);
	$.reset(div_4);
	$.reset(div_3);

	var div_5 = $.sibling(div_3, 2);
	var div_6 = $.child(div_5);
	var input = $.sibling($.child(div_6), 2);

	$.remove_input_defaults(input);
	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var input_1 = $.sibling($.child(div_7), 2);

	$.remove_input_defaults(input_1);
	$.reset(div_7);
	$.reset(div_5);

	var button = $.sibling(div_5, 2);
	var node_1 = $.child(button);

	{
		var consequent = ($$anchor) => {
			var fragment = root_1();
			var node_2 = $.first_child(fragment);

			Icon(node_2, { name: 'loader', size: 'sm', animate: 'spin' });
			$.next();
			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = root_2();
			var node_3 = $.first_child(fragment_1);

			Icon(node_3, { name: 'terminal', size: 'sm' });
			$.next();
			$.append($$anchor, fragment_1);
		};

		$.if(node_1, ($$render) => {
			if (diagnosticState.loading) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(button);
	$.reset(div_2);
	$.reset(div_1);

	var node_4 = $.sibling(div_1, 2);

	ErrorCard(node_4, {
		title: 'Connection Failed',
		get error() {
			return diagnosticState.error;
		}
	});

	var node_5 = $.sibling(node_4, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_8 = root_3();
			var div_9 = $.child(div_8);
			var div_10 = $.child(div_9);
			var node_6 = $.child(div_10);

			Icon(node_6, { name: 'loader', size: 'lg', animate: 'spin' });

			var div_11 = $.sibling(node_6, 2);
			var p = $.sibling($.child(div_11), 2);
			var text_1 = $.only_child(p);

			$.reset(div_11);
			$.reset(div_10);
			$.reset(div_9);
			$.reset(div_8);
			$.template_effect(() => $.set_text(text_1, `Connecting to ${$.get(host) ?? ''}:${$.get(port) ?? ''}...`));
			$.append($$anchor, div_8);
		};

		$.if(node_5, ($$render) => {
			if (diagnosticState.loading) $$render(consequent_1);
		});
	}

	var node_7 = $.sibling(node_5, 2);

	{
		var consequent_10 = ($$anchor) => {
			var div_12 = root_14();
			var div_13 = $.sibling($.child(div_12), 2);
			var div_14 = $.child(div_13);
			var div_15 = $.sibling($.child(div_14), 2);
			var div_16 = $.child(div_15);
			var div_17 = $.child(div_16);
			var span = $.sibling($.child(div_17), 2);
			var text_2 = $.only_child(span, true);

			$.reset(div_17);

			var div_18 = $.sibling(div_17, 2);
			var span_1 = $.sibling($.child(div_18), 2);
			var text_3 = $.only_child(span_1, true);

			$.reset(div_18);

			var div_19 = $.sibling(div_18, 2);
			var span_2 = $.sibling($.child(div_19), 2);
			var node_8 = $.child(span_2);

			{
				let $0 = $.derived(() => getProtocolIcon(diagnosticState.results.protocol));

				Icon(node_8, {
					get name() {
						return $.get($0);
					},
					size: 'xs'
				});
			}

			var text_4 = $.sibling(node_8);

			$.reset(span_2);
			$.reset(div_19);

			var div_20 = $.sibling(div_19, 2);
			var span_3 = $.sibling($.child(div_20), 2);
			var text_5 = $.only_child(span_3);

			$.reset(div_20);
			$.reset(div_16);
			$.reset(div_15);
			$.reset(div_14);

			var div_21 = $.sibling(div_14, 2);
			var div_22 = $.sibling($.child(div_21), 2);
			var node_9 = $.child(div_22);

			{
				var consequent_2 = ($$anchor) => {
					var pre = root_4();

					$.html(pre, () => formatBanner(diagnosticState.results.banner), true);
					$.reset(pre);
					$.append($$anchor, pre);
				};

				var alternate_1 = ($$anchor) => {
					var div_23 = root_5();
					var node_10 = $.child(div_23);

					Icon(node_10, { name: 'file-x', size: 'lg' });
					$.next(4);
					$.reset(div_23);
					$.append($$anchor, div_23);
				};

				$.if(node_9, ($$render) => {
					if (diagnosticState.results.banner) $$render(consequent_2); else $$render(alternate_1, -1);
				});
			}

			$.reset(div_22);
			$.reset(div_21);

			var node_11 = $.sibling(div_21, 2);

			{
				var consequent_7 = ($$anchor) => {
					var div_24 = root_11();
					var div_25 = $.sibling($.child(div_24), 2);
					var div_26 = $.child(div_25);
					var node_12 = $.child(div_26);

					{
						var consequent_3 = ($$anchor) => {
							var div_27 = root_6();
							var node_13 = $.child(div_27);

							Icon(node_13, { name: 'package', size: 'sm' });

							var div_28 = $.sibling(node_13, 2);
							var p_1 = $.sibling($.child(div_28), 2);
							var text_6 = $.only_child(p_1, true);

							$.reset(div_28);
							$.reset(div_27);
							$.template_effect(() => $.set_text(text_6, diagnosticState.results.analysis.software));
							$.append($$anchor, div_27);
						};

						$.if(node_12, ($$render) => {
							if (diagnosticState.results.analysis.software) $$render(consequent_3);
						});
					}

					var node_14 = $.sibling(node_12, 2);

					{
						var consequent_4 = ($$anchor) => {
							var div_29 = root_7();
							var node_15 = $.child(div_29);

							Icon(node_15, { name: 'tag', size: 'sm' });

							var div_30 = $.sibling(node_15, 2);
							var p_2 = $.sibling($.child(div_30), 2);
							var text_7 = $.only_child(p_2, true);

							$.reset(div_30);
							$.reset(div_29);
							$.template_effect(() => $.set_text(text_7, diagnosticState.results.analysis.version));
							$.append($$anchor, div_29);
						};

						$.if(node_14, ($$render) => {
							if (diagnosticState.results.analysis.version) $$render(consequent_4);
						});
					}

					var node_16 = $.sibling(node_14, 2);

					{
						var consequent_5 = ($$anchor) => {
							var div_31 = root_8();
							var node_17 = $.child(div_31);

							Icon(node_17, { name: 'monitor', size: 'sm' });

							var div_32 = $.sibling(node_17, 2);
							var p_3 = $.sibling($.child(div_32), 2);
							var text_8 = $.only_child(p_3, true);

							$.reset(div_32);
							$.reset(div_31);
							$.template_effect(() => $.set_text(text_8, diagnosticState.results.analysis.os));
							$.append($$anchor, div_31);
						};

						$.if(node_16, ($$render) => {
							if (diagnosticState.results.analysis.os) $$render(consequent_5);
						});
					}

					var node_18 = $.sibling(node_16, 2);

					{
						var consequent_6 = ($$anchor) => {
							var div_33 = root_10();
							var node_19 = $.child(div_33);

							Icon(node_19, { name: 'shield', size: 'sm' });

							var div_34 = $.sibling(node_19, 2);
							var ul = $.sibling($.child(div_34), 2);

							$.each(ul, 21, () => diagnosticState.results.analysis.security, $.index, ($$anchor, note) => {
								var li = root_9();
								var text_9 = $.only_child(li, true);

								$.template_effect(() => $.set_text(text_9, $.get(note)));
								$.append($$anchor, li);
							});

							$.reset(ul);
							$.reset(div_34);
							$.reset(div_33);
							$.append($$anchor, div_33);
						};

						$.if(node_18, ($$render) => {
							if (diagnosticState.results.analysis.security && diagnosticState.results.analysis.security.length > 0) $$render(consequent_6);
						});
					}

					$.reset(div_26);
					$.reset(div_25);
					$.reset(div_24);
					$.append($$anchor, div_24);
				};

				$.if(node_11, ($$render) => {
					if (diagnosticState.results.analysis && (diagnosticState.results.analysis.software || diagnosticState.results.analysis.version || diagnosticState.results.analysis.os || diagnosticState.results.analysis.security && diagnosticState.results.analysis.security.length > 0)) $$render(consequent_7);
				});
			}

			var node_20 = $.sibling(node_11, 2);

			{
				var consequent_9 = ($$anchor) => {
					var div_35 = root_13();
					var div_36 = $.sibling($.child(div_35), 2);
					var div_37 = $.child(div_36);
					var div_38 = $.child(div_37);
					var span_4 = $.sibling($.child(div_38), 2);
					var text_10 = $.only_child(span_4, true);

					$.reset(div_38);

					var div_39 = $.sibling(div_38, 2);
					var span_5 = $.sibling($.child(div_39), 2);
					var text_11 = $.only_child(span_5, true);

					$.reset(div_39);

					var node_21 = $.sibling(div_39, 2);

					{
						var consequent_8 = ($$anchor) => {
							var div_40 = root_12();
							var span_6 = $.sibling($.child(div_40), 2);
							var text_12 = $.only_child(span_6, true);

							$.reset(div_40);
							$.template_effect(() => $.set_text(text_12, diagnosticState.results.tls.certificate.cn));
							$.append($$anchor, div_40);
						};

						$.if(node_21, ($$render) => {
							if (diagnosticState.results.tls.certificate) $$render(consequent_8);
						});
					}

					$.reset(div_37);
					$.reset(div_36);
					$.reset(div_35);

					$.template_effect(() => {
						$.set_text(text_10, diagnosticState.results.tls.protocol);
						$.set_text(text_11, diagnosticState.results.tls.cipher);
					});

					$.append($$anchor, div_35);
				};

				$.if(node_20, ($$render) => {
					if (diagnosticState.results.tls) $$render(consequent_9);
				});
			}

			$.reset(div_13);
			$.reset(div_12);

			$.template_effect(() => {
				$.set_text(text_2, diagnosticState.results.host);
				$.set_text(text_3, diagnosticState.results.port);
				$.set_text(text_4, ` ${(diagnosticState.results.protocol || 'Unknown') ?? ''}`);
				$.set_text(text_5, `${diagnosticState.results.responseTime ?? ''}ms`);
			});

			$.append($$anchor, div_12);
		};

		$.if(node_7, ($$render) => {
			if (diagnosticState.results) $$render(consequent_10);
		});
	}

	$.reset(div);

	$.template_effect(() => {
		select.disabled = diagnosticState.loading;
		input.disabled = diagnosticState.loading;
		input_1.disabled = diagnosticState.loading;
		button.disabled = diagnosticState.loading || !$.get(isInputValid);
	});

	$.delegated('change', select, () => examples.clear());
	$.bind_select_value(select, () => $.get(service), ($$value) => $.set(service, $$value));
	$.delegated('change', input, () => examples.clear());
	$.delegated('keydown', input, (e) => e.key === 'Enter' && grabBanner());
	$.bind_value(input, () => $.get(host), ($$value) => $.set(host, $$value));
	$.delegated('change', input_1, () => examples.clear());
	$.delegated('keydown', input_1, (e) => e.key === 'Enter' && grabBanner());
	$.bind_value(input_1, () => $.get(port), ($$value) => $.set(port, $$value));
	$.delegated('click', button, grabBanner);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['change', 'keydown', 'click']);