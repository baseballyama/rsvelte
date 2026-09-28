import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '$lib/components/global/Icon.svelte';
import { useDiagnosticState, useClipboard, useExamples } from '$lib/composables';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import ErrorCard from '$lib/components/common/ErrorCard.svelte';
import { tooltip } from '$lib/actions/tooltip.js';
import '../../../../styles/diagnostics-pages.scss';

var root = $.from_html(`<span class="error-text svelte-1cw85td">Invalid host:port format</span>`);
var root_1 = $.from_html(`<input type="text" placeholder="example.com"/>`);
var root_2 = $.from_html(`<!> Analyzing Certificate...`, 1);
var root_3 = $.from_html(`<!> Analyze Certificate`, 1);
var root_4 = $.from_html(`<span class="san-item mono svelte-1cw85td"> </span>`);
var root_5 = $.from_html(`<div class="detail-section svelte-1cw85td"><h4 class="svelte-1cw85td">Subject Alternative Names</h4> <div class="san-list svelte-1cw85td"></div></div>`);
var root_6 = $.from_html(`<div class="cert-overview svelte-1cw85td"><div class="status-overview"><div><!> <span> </span></div> <div><!> <span> </span></div></div> <div class="cert-details svelte-1cw85td"><div class="detail-section svelte-1cw85td"><h4 class="svelte-1cw85td">Certificate Information</h4> <div class="detail-grid svelte-1cw85td"><div class="detail-item svelte-1cw85td"><span class="detail-label svelte-1cw85td">Common Name:</span> <span class="detail-value mono svelte-1cw85td"> </span></div> <div class="detail-item svelte-1cw85td"><span class="detail-label svelte-1cw85td">Organization:</span> <span class="detail-value svelte-1cw85td"> </span></div> <div class="detail-item svelte-1cw85td"><span class="detail-label svelte-1cw85td">Issuer:</span> <span class="detail-value svelte-1cw85td"> </span></div> <div class="detail-item svelte-1cw85td"><span class="detail-label svelte-1cw85td">Serial Number:</span> <span class="detail-value mono svelte-1cw85td"> </span></div> <div class="detail-item svelte-1cw85td"><span class="detail-label svelte-1cw85td">Valid From:</span> <span class="detail-value svelte-1cw85td"> </span></div> <div class="detail-item svelte-1cw85td"><span class="detail-label svelte-1cw85td">Valid To:</span> <span class="detail-value svelte-1cw85td"> </span></div></div></div> <!> <div class="detail-section svelte-1cw85td"><h4 class="svelte-1cw85td">Fingerprints</h4> <div class="detail-grid svelte-1cw85td"><div class="detail-item svelte-1cw85td"><span class="detail-label svelte-1cw85td">SHA1:</span> <span class="detail-value mono svelte-1cw85td"> </span></div> <div class="detail-item svelte-1cw85td"><span class="detail-label svelte-1cw85td">SHA256:</span> <span class="detail-value mono svelte-1cw85td"> </span></div></div></div></div></div>`);
var root_7 = $.from_html(`<div class="chain-item svelte-1cw85td"><div class="chain-header svelte-1cw85td"><span class="chain-level svelte-1cw85td"></span> <span class="chain-cn mono svelte-1cw85td"> </span></div> <div class="chain-details svelte-1cw85td"><span> </span> <span> </span></div></div>`);
var root_8 = $.from_html(`<div class="chain-section svelte-1cw85td"><h4 class="svelte-1cw85td"> </h4> <div class="chain-list svelte-1cw85td"></div></div>`);
var root_9 = $.from_html(`<div class="detail-item svelte-1cw85td"><span class="detail-label svelte-1cw85td">TLS Version:</span> <span class="detail-value svelte-1cw85td"> </span></div>`);
var root_10 = $.from_html(`<div class="detail-item svelte-1cw85td"><span class="detail-label svelte-1cw85td">Cipher Suite:</span> <span class="detail-value svelte-1cw85td"> </span></div>`);
var root_11 = $.from_html(`<div class="detail-item svelte-1cw85td"><span class="detail-label svelte-1cw85td">ALPN Protocol:</span> <span class="detail-value svelte-1cw85td"> </span></div>`);
var root_12 = $.from_html(`<div class="connection-section svelte-1cw85td"><h4 class="svelte-1cw85td">Connection Details</h4> <div class="detail-grid svelte-1cw85td"><!> <!> <!></div></div>`);
var root_13 = $.from_html(`<div class="card results-card"><div class="card-header row"><h3>Certificate Analysis Results</h3> <button class="copy-btn"><!> </button></div> <div class="card-content"><!> <!> <!></div></div>`);

var root_14 = $.from_html(`<div class="card"><header class="card-header"><h1>TLS Certificate Analyzer</h1> <p>Analyze TLS certificates, view certificate chains, check expiration dates, and examine Subject Alternative Names
      (SANs). Supports custom SNI servername for multi-domain certificates.</p></header> <!> <div class="card input-card"><div class="card-header"><h3>Certificate Analysis Configuration</h3></div> <div class="card-content"><div class="form-row"><div class="form-group"><label for="host">Host:Port <input id="host" type="text" placeholder="google.com:443"/> <!></label></div></div> <div class="form-row"><div class="form-group"><label class="checkbox-group"><input type="checkbox"/> Use custom SNI servername</label> <!></div></div> <div class="action-section"><button class="lookup-btn"><!></button></div></div></div> <!> <!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let host = $.state('google.com:443');
	let servername = $.state('');
	let useCustomServername = $.state(false);
	const diagnosticState = useDiagnosticState();
	const clipboard = useClipboard();

	const examplesList = [
		{
			host: 'google.com:443',
			description: 'Google TLS certificate'
		},

		{
			host: 'github.com:443',
			description: 'GitHub certificate chain'
		},

		{
			host: 'cloudflare.com:443',
			description: 'Cloudflare certificate'
		},

		{
			host: 'wikipedia.org:443',
			description: 'Wikipedia certificate'
		},

		{
			host: 'stackoverflow.com:443',
			description: 'Stack Overflow certificate'
		},

		{
			host: 'microsoft.com:443',
			description: 'Microsoft certificate'
		}
	];

	const examples = useExamples(examplesList);

	// Reactive validation
	const isInputValid = $.derived(() => () => {
		const trimmedHost = $.get(host).trim();

		if (!trimmedHost) return false;

		// Basic host:port validation
		return (/^[a-zA-Z0-9.-]+(?::\d+)?$/).test(trimmedHost);
	});

	async function analyzeCertificate() {
		diagnosticState.startOperation();

		try {
			const response = await fetch('/api/internal/diagnostics/tls', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					action: 'certificate',
					host: $.get(host).trim(),
					servername: $.get(useCustomServername) && $.get(servername) ? $.get(servername).trim() : undefined
				})
			});

			if (!response.ok) {
				const errorText = await response.text();

				try {
					const errorData = JSON.parse(errorText);

					throw new Error(errorData.message || `Certificate analysis failed (${response.status})`);
				} catch {
					throw new Error(`Certificate analysis failed (${response.status})`);
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
		$.set(servername, '');
		$.set(useCustomServername, false);
		examples.select(index);
		analyzeCertificate();
	}

	function getExpiryStatus(cert) {
		if (cert.isExpired) {
			return { status: 'Expired', icon: 'x-circle', class: 'error' };
		}

		if (cert.daysUntilExpiry <= 7) {
			return {
				status: `Expires in ${cert.daysUntilExpiry} days`,
				icon: 'alert-triangle',
				class: 'error'
			};
		}

		if (cert.daysUntilExpiry <= 30) {
			return {
				status: `Expires in ${cert.daysUntilExpiry} days`,
				icon: 'alert-triangle',
				class: 'warning'
			};
		}

		return {
			status: `Valid for ${cert.daysUntilExpiry} days`,
			icon: 'check-circle',
			class: 'success'
		};
	}

	async function copyCertificateInfo() {
		if (!diagnosticState.results?.peerCertificate) return;

		const cert = diagnosticState.results.peerCertificate;
		let text = `TLS Certificate Analysis for ${$.get(host)}\n`;

		text += `Generated at: ${new Date().toISOString()}\n\n`;
		text += `Subject: ${cert.subject.CN}\n`;
		text += `Issuer: ${cert.issuer.CN}\n`;
		text += `Valid From: ${cert.validFrom}\n`;
		text += `Valid To: ${cert.validTo}\n`;
		text += `Days Until Expiry: ${cert.daysUntilExpiry}\n`;
		text += `Serial Number: ${cert.serialNumber}\n`;
		text += `Fingerprint (SHA1): ${cert.fingerprint}\n`;
		text += `Fingerprint (SHA256): ${cert.fingerprint256}\n`;

		if (cert.subjectAltNames.length > 0) {
			text += `\nSubject Alternative Names:\n`;

			cert.subjectAltNames.forEach((san) => {
				text += `  ${san}\n`;
			});
		}

		await clipboard.copy(text);
	}

	var div = root_14();
	var node = $.sibling($.child(div), 2);

	ExamplesCard(node, {
		get examples() {
			return examplesList;
		},

		get selectedIndex() {
			return examples.selectedIndex;
		},
		onSelect: loadExample,
		title: 'Certificate Examples',
		getLabel: (example) => example.host,
		getDescription: (example) => example.description,
		getTooltip: (example) => `Analyze certificate for ${example.host} (${example.description})`
	});

	var div_1 = $.sibling(node, 2);
	var div_2 = $.sibling($.child(div_1), 2);
	var div_3 = $.child(div_2);
	var div_4 = $.child(div_3);
	var label = $.child(div_4);
	var input = $.sibling($.child(label));

	$.remove_input_defaults(input);

	let classes;

	$.effect(() => $.bind_value(input, () => $.get(host), ($$value) => $.set(host, $$value)));
	$.action(input, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Enter hostname:port (e.g., google.com:443)');

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
	$.reset(div_4);
	$.reset(div_3);

	var div_5 = $.sibling(div_3, 2);
	var div_6 = $.child(div_5);
	var label_1 = $.child(div_6);
	var input_1 = $.child(label_1);

	$.remove_input_defaults(input_1);
	$.next();
	$.reset(label_1);

	var node_2 = $.sibling(label_1, 2);

	{
		var consequent_1 = ($$anchor) => {
			var input_2 = root_1();

			$.remove_input_defaults(input_2);
			$.effect(() => $.bind_value(input_2, () => $.get(servername), ($$value) => $.set(servername, $$value)));
			$.action(input_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Custom servername for SNI (Server Name Indication)');

			$.delegated('change', input_2, () => {
				examples.clear();

				if ($.get(isInputValid)()) analyzeCertificate();
			});

			$.append($$anchor, input_2);
		};

		$.if(node_2, ($$render) => {
			if ($.get(useCustomServername)) $$render(consequent_1);
		});
	}

	$.reset(div_6);
	$.reset(div_5);

	var div_7 = $.sibling(div_5, 2);
	var button = $.child(div_7);
	var node_3 = $.child(button);

	{
		var consequent_2 = ($$anchor) => {
			var fragment = root_2();
			var node_4 = $.first_child(fragment);

			Icon(node_4, { name: 'loader-2', size: 'sm', animate: 'spin' });
			$.next();
			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = root_3();
			var node_5 = $.first_child(fragment_1);

			Icon(node_5, { name: 'shield-check', size: 'sm' });
			$.next();
			$.append($$anchor, fragment_1);
		};

		$.if(node_3, ($$render) => {
			if (diagnosticState.loading) $$render(consequent_2); else $$render(alternate, -1);
		});
	}

	$.reset(button);
	$.reset(div_7);
	$.reset(div_2);
	$.reset(div_1);

	var node_6 = $.sibling(div_1, 2);

	{
		var consequent_10 = ($$anchor) => {
			var div_8 = root_13();
			var div_9 = $.child(div_8);
			var button_1 = $.sibling($.child(div_9), 2);
			var node_7 = $.child(button_1);

			{
				let $0 = $.derived(() => clipboard.isCopied() ? 'check' : 'copy');

				Icon(node_7, {
					get name() {
						return $.get($0);
					},
					size: 'xs'
				});
			}

			var text_1 = $.sibling(node_7);

			$.reset(button_1);
			$.reset(div_9);

			var div_10 = $.sibling(div_9, 2);
			var node_8 = $.child(div_10);

			{
				var consequent_4 = ($$anchor) => {
					const cert = $.derived(() => diagnosticState.results.peerCertificate);
					const expiryStatus = $.derived(() => getExpiryStatus($.get(cert)));
					var div_11 = root_6();
					var div_12 = $.child(div_11);
					var div_13 = $.child(div_12);
					var node_9 = $.child(div_13);

					Icon(node_9, {
						get name() {
							return $.get(expiryStatus).icon;
						},
						size: 'sm'
					});

					var span_1 = $.sibling(node_9, 2);
					var text_2 = $.only_child(span_1, true);

					$.reset(div_13);

					var div_14 = $.sibling(div_13, 2);
					var node_10 = $.child(div_14);

					{
						let $0 = $.derived(() => $.get(cert).isNotYetValid ? 'clock' : 'calendar');

						Icon(node_10, {
							get name() {
								return $.get($0);
							},
							size: 'sm'
						});
					}

					var span_2 = $.sibling(node_10, 2);
					var text_3 = $.only_child(span_2, true);

					$.reset(div_14);
					$.reset(div_12);

					var div_15 = $.sibling(div_12, 2);
					var div_16 = $.child(div_15);
					var div_17 = $.sibling($.child(div_16), 2);
					var div_18 = $.child(div_17);
					var span_3 = $.sibling($.child(div_18), 2);
					var text_4 = $.only_child(span_3, true);

					$.reset(div_18);

					var div_19 = $.sibling(div_18, 2);
					var span_4 = $.sibling($.child(div_19), 2);
					var text_5 = $.only_child(span_4, true);

					$.reset(div_19);

					var div_20 = $.sibling(div_19, 2);
					var span_5 = $.sibling($.child(div_20), 2);
					var text_6 = $.only_child(span_5, true);

					$.reset(div_20);

					var div_21 = $.sibling(div_20, 2);
					var span_6 = $.sibling($.child(div_21), 2);
					var text_7 = $.only_child(span_6, true);

					$.reset(div_21);

					var div_22 = $.sibling(div_21, 2);
					var span_7 = $.sibling($.child(div_22), 2);
					var text_8 = $.only_child(span_7, true);

					$.reset(div_22);

					var div_23 = $.sibling(div_22, 2);
					var span_8 = $.sibling($.child(div_23), 2);
					var text_9 = $.only_child(span_8, true);

					$.reset(div_23);
					$.reset(div_17);
					$.reset(div_16);

					var node_11 = $.sibling(div_16, 2);

					{
						var consequent_3 = ($$anchor) => {
							var div_24 = root_5();
							var div_25 = $.sibling($.child(div_24), 2);

							$.each(div_25, 21, () => $.get(cert).subjectAltNames, $.index, ($$anchor, san) => {
								var span_9 = root_4();
								var text_10 = $.only_child(span_9, true);

								$.template_effect(() => $.set_text(text_10, $.get(san)));
								$.append($$anchor, span_9);
							});

							$.reset(div_25);
							$.reset(div_24);
							$.append($$anchor, div_24);
						};

						$.if(node_11, ($$render) => {
							if ($.get(cert).subjectAltNames?.length > 0) $$render(consequent_3);
						});
					}

					var div_26 = $.sibling(node_11, 2);
					var div_27 = $.sibling($.child(div_26), 2);
					var div_28 = $.child(div_27);
					var span_10 = $.sibling($.child(div_28), 2);
					var text_11 = $.only_child(span_10, true);

					$.reset(div_28);

					var div_29 = $.sibling(div_28, 2);
					var span_11 = $.sibling($.child(div_29), 2);
					var text_12 = $.only_child(span_11, true);

					$.reset(div_29);
					$.reset(div_27);
					$.reset(div_26);
					$.reset(div_15);
					$.reset(div_11);

					$.template_effect(
						($0, $1) => {
							$.set_class(div_13, 1, `status-item ${$.get(expiryStatus).class ?? ''}`, 'svelte-1cw85td');
							$.set_text(text_2, $.get(expiryStatus).status);
							$.set_class(div_14, 1, `status-item ${$.get(cert).isNotYetValid ? 'warning' : 'success'}`);
							$.set_text(text_3, $.get(cert).isNotYetValid ? 'Not yet valid' : 'Currently valid');
							$.set_text(text_4, $.get(cert).subject.CN);
							$.set_text(text_5, $.get(cert).subject.O || 'N/A');
							$.set_text(text_6, $.get(cert).issuer.CN);
							$.set_text(text_7, $.get(cert).serialNumber);
							$.set_text(text_8, $0);
							$.set_text(text_9, $1);
							$.set_text(text_11, $.get(cert).fingerprint);
							$.set_text(text_12, $.get(cert).fingerprint256);
						},
						[
							() => new Date($.get(cert).validFrom).toLocaleString(),
							() => new Date($.get(cert).validTo).toLocaleString()
						]
					);

					$.append($$anchor, div_11);
				};

				$.if(node_8, ($$render) => {
					if (diagnosticState.results.peerCertificate) $$render(consequent_4);
				});
			}

			var node_12 = $.sibling(node_8, 2);

			{
				var consequent_5 = ($$anchor) => {
					var div_30 = root_8();
					var h4 = $.child(div_30);
					var text_13 = $.only_child(h4);
					var div_31 = $.sibling(h4, 2);

					$.each(div_31, 21, () => diagnosticState.results.chain, $.index, ($$anchor, chainCert, i) => {
						var div_32 = root_7();
						var div_33 = $.child(div_32);
						var span_12 = $.child(div_33);

						span_12.textContent = `Level ${i}`;

						var span_13 = $.sibling(span_12, 2);
						var text_14 = $.only_child(span_13, true);

						$.reset(div_33);

						var div_34 = $.sibling(div_33, 2);
						var span_14 = $.child(div_34);
						var text_15 = $.only_child(span_14);
						var span_15 = $.sibling(span_14, 2);
						var text_16 = $.only_child(span_15);

						$.reset(div_34);
						$.reset(div_32);

						$.template_effect(
							($0) => {
								$.set_text(text_14, $.get(chainCert).subject.CN);
								$.set_text(text_15, `Issuer: ${$.get(chainCert).issuer.CN ?? ''}`);
								$.set_text(text_16, `Expires: ${$0 ?? ''}`);
							},
							[
								() => new Date($.get(chainCert).validTo).toLocaleDateString()
							]
						);

						$.append($$anchor, div_32);
					});

					$.reset(div_31);
					$.reset(div_30);
					$.template_effect(() => $.set_text(text_13, `Certificate Chain (${diagnosticState.results.chain.length ?? ''} certificates)`));
					$.append($$anchor, div_30);
				};

				$.if(node_12, ($$render) => {
					if (diagnosticState.results.chain?.length > 0) $$render(consequent_5);
				});
			}

			var node_13 = $.sibling(node_12, 2);

			{
				var consequent_9 = ($$anchor) => {
					var div_35 = root_12();
					var div_36 = $.sibling($.child(div_35), 2);
					var node_14 = $.child(div_36);

					{
						var consequent_6 = ($$anchor) => {
							var div_37 = root_9();
							var span_16 = $.sibling($.child(div_37), 2);
							var text_17 = $.only_child(span_16, true);

							$.reset(div_37);
							$.template_effect(() => $.set_text(text_17, diagnosticState.results.protocol));
							$.append($$anchor, div_37);
						};

						$.if(node_14, ($$render) => {
							if (diagnosticState.results.protocol) $$render(consequent_6);
						});
					}

					var node_15 = $.sibling(node_14, 2);

					{
						var consequent_7 = ($$anchor) => {
							var div_38 = root_10();
							var span_17 = $.sibling($.child(div_38), 2);
							var text_18 = $.only_child(span_17, true);

							$.reset(div_38);
							$.template_effect(() => $.set_text(text_18, diagnosticState.results.cipher.name));
							$.append($$anchor, div_38);
						};

						$.if(node_15, ($$render) => {
							if (diagnosticState.results.cipher) $$render(consequent_7);
						});
					}

					var node_16 = $.sibling(node_15, 2);

					{
						var consequent_8 = ($$anchor) => {
							var div_39 = root_11();
							var span_18 = $.sibling($.child(div_39), 2);
							var text_19 = $.only_child(span_18, true);

							$.reset(div_39);
							$.template_effect(() => $.set_text(text_19, diagnosticState.results.alpnProtocol));
							$.append($$anchor, div_39);
						};

						$.if(node_16, ($$render) => {
							if (diagnosticState.results.alpnProtocol) $$render(consequent_8);
						});
					}

					$.reset(div_36);
					$.reset(div_35);
					$.append($$anchor, div_35);
				};

				$.if(node_13, ($$render) => {
					if (diagnosticState.results.protocol || diagnosticState.results.cipher || diagnosticState.results.alpnProtocol) $$render(consequent_9);
				});
			}

			$.reset(div_10);
			$.reset(div_8);

			$.template_effect(
				($0, $1) => {
					button_1.disabled = $0;
					$.set_text(text_1, ` ${$1 ?? ''}`);
				},
				[
					() => clipboard.isCopied(),
					() => clipboard.isCopied() ? 'Copied!' : 'Copy Certificate Info'
				]
			);

			$.delegated('click', button_1, copyCertificateInfo);
			$.append($$anchor, div_8);
		};

		$.if(node_6, ($$render) => {
			if (diagnosticState.results) $$render(consequent_10);
		});
	}

	var node_17 = $.sibling(node_6, 2);

	ErrorCard(node_17, {
		title: 'Certificate Analysis Failed',
		get error() {
			return diagnosticState.error;
		}
	});

	$.reset(div);

	$.template_effect(() => {
		classes = $.set_class(input, 1, '', null, classes, { invalid: $.get(host) && !$.get(isInputValid) });
		button.disabled = diagnosticState.loading || !$.get(isInputValid);
	});

	$.delegated('change', input, () => {
		examples.clear();

		if ($.get(isInputValid)()) analyzeCertificate();
	});

	$.delegated('change', input_1, () => {
		examples.clear();

		if ($.get(isInputValid)()) analyzeCertificate();
	});

	$.bind_checked(input_1, () => $.get(useCustomServername), ($$value) => $.set(useCustomServername, $$value));
	$.delegated('click', button, analyzeCertificate);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['change', 'click']);