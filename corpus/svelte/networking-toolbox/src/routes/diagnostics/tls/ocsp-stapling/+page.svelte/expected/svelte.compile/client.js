import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '$lib/components/global/Icon.svelte';
import { useDiagnosticState, useExamples } from '$lib/composables';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import ErrorCard from '$lib/components/common/ErrorCard.svelte';
import '../../../../styles/diagnostics-pages.scss';

var root = $.from_html(`<!> Checking...`, 1);
var root_1 = $.from_html(`<!> Check`, 1);
var root_2 = $.from_html(`<div class="card"><div class="card-content"><div class="loading-state"><!> <div class="loading-text"><h3>Checking OCSP Stapling</h3> <p>Connecting to server and analyzing OCSP response stapling...</p></div></div></div></div>`);
var root_3 = $.from_html(`<div class="status-card enabled svelte-1w6539c"><!> <div class="status-content svelte-1w6539c"><h4 class="svelte-1w6539c">OCSP Stapling Enabled</h4> <p class="svelte-1w6539c">This server provides OCSP responses with the TLS handshake</p></div></div>`);
var root_4 = $.from_html(`<div class="status-card disabled svelte-1w6539c"><!> <div class="status-content svelte-1w6539c"><h4 class="svelte-1w6539c">OCSP Stapling Not Enabled</h4> <p class="svelte-1w6539c">This server does not staple OCSP responses</p></div></div>`);
var root_5 = $.from_html(`<div class="stat-card svelte-1w6539c"><div class="stat-label">This Update</div> <div class="stat-value mono svelte-1w6539c"> </div></div>`);
var root_6 = $.from_html(`<div class="stat-card svelte-1w6539c"><div class="stat-label">Next Update</div> <div class="stat-value mono svelte-1w6539c"> </div></div>`);
var root_7 = $.from_html(`<div class="stat-card svelte-1w6539c"><div class="stat-label">Produced At</div> <div class="stat-value mono svelte-1w6539c"> </div></div>`);
var root_8 = $.from_html(`<div class="stat-card full-width svelte-1w6539c"><div class="stat-label">Responder URL</div> <div class="stat-value mono svelte-1w6539c"> </div></div>`);
var root_9 = $.from_html(`<div class="stat-card svelte-1w6539c"><div class="stat-label">Expires In</div> <div><!> </div></div>`);
var root_10 = $.from_html(`<div class="validity-progress svelte-1w6539c"><div class="progress-header svelte-1w6539c"><span class="progress-label svelte-1w6539c">Validity Period Progress</span> <span class="progress-percentage svelte-1w6539c"> </span></div> <div class="progress-bar svelte-1w6539c"><div class="progress-fill svelte-1w6539c"></div></div></div>`);
var root_11 = $.from_html(`<div class="card validity-section svelte-1w6539c"><div class="card-header"><h3>Response Validity</h3></div> <div class="card-content"><div class="validity-info"><div class="validity-stats svelte-1w6539c"><div class="stat-card svelte-1w6539c"><div class="stat-label">Valid For</div> <div class="stat-value svelte-1w6539c"> </div></div> <!></div> <!></div></div></div>`);
var root_12 = $.from_html(`<div class="card response-section svelte-1w6539c"><div class="card-header"><h3>OCSP Response Details</h3></div> <div class="card-content"><div class="stats-grid svelte-1w6539c"><div class="stat-card svelte-1w6539c"><div class="stat-label">Certificate Status</div> <div><!> </div></div> <div class="stat-card svelte-1w6539c"><div class="stat-label">Response Status</div> <div class="stat-value svelte-1w6539c"><!> </div></div> <!> <!> <!> <!></div></div></div> <!>`, 1);
var root_13 = $.from_html(`<div class="cert-url mono svelte-1w6539c"> </div>`);
var root_14 = $.from_html(`<div class="cert-item svelte-1w6539c"><div class="cert-label svelte-1w6539c">OCSP URLs</div> <div class="cert-urls svelte-1w6539c"></div></div>`);
var root_15 = $.from_html(`<div class="card certificate-section svelte-1w6539c"><div class="card-header"><h3>Certificate Information</h3></div> <div class="card-content"><div class="cert-details svelte-1w6539c"><div class="cert-item svelte-1w6539c"><div class="cert-label svelte-1w6539c">Subject</div> <div class="cert-value mono svelte-1w6539c"> </div></div> <div class="cert-item svelte-1w6539c"><div class="cert-label svelte-1w6539c">Issuer</div> <div class="cert-value mono svelte-1w6539c"> </div></div> <!></div></div></div>`);
var root_16 = $.from_html(`<div class="recommendation-item svelte-1w6539c"><!> <span class="svelte-1w6539c"> </span></div>`);
var root_17 = $.from_html(`<div class="card recommendations-section svelte-1w6539c"><div class="card-header"><h3>Recommendations</h3></div> <div class="card-content"><div class="recommendations-list svelte-1w6539c"></div></div></div>`);
var root_18 = $.from_html(`<div class="card results-card"><div class="card-header"><h3>OCSP Stapling Results</h3></div> <div class="card-content"><div class="results-section svelte-1w6539c"><div class="card status-section svelte-1w6539c"><div class="card-header"><h3>OCSP Stapling Status</h3></div> <div class="card-content"><!></div></div> <!> <!> <!></div></div></div>`);

var root_19 = $.from_html(`<div class="card"><header class="card-header"><h1>OCSP Stapling Check</h1> <p>Report if server staples OCSP and basic status info</p></header> <!> <div class="card input-card"><div class="card-header"><h3>OCSP Stapling Configuration</h3></div> <div class="card-content"><div class="form-group"><label for="hostname">Hostname and Port</label> <div class="input-flex-container"><input id="hostname" type="text" placeholder="example.com" class="flex-grow"/> <input id="port" type="text" placeholder="443" class="port-input"/> <button class="primary"><!></button></div></div></div></div> <!> <!> <!> <div class="card info-card"><div class="card-header"><h3>Understanding OCSP Stapling</h3></div> <div class="card-content"><div class="info-grid"><div class="info-section"><h4>What is OCSP Stapling?</h4> <p>OCSP Stapling is a security feature where the server includes a certificate status response during the TLS
            handshake. This eliminates the need for clients to contact the Certificate Authority directly to check if a
            certificate has been revoked.</p></div> <div class="info-section"><h4>Why is it Important?</h4> <ul><li><strong>Privacy:</strong> Prevents CA from tracking user browsing</li> <li><strong>Performance:</strong> Faster connections, no extra DNS lookups</li> <li><strong>Reliability:</strong> Works even if OCSP responder is down</li> <li><strong>Security:</strong> Real-time certificate validation</li></ul></div> <div class="info-section"><h4>How It Works</h4> <p>The server periodically queries the OCSP responder and caches the response. During TLS handshake, the server
            "staples" this cached response to the certificate, proving its validity without requiring the client to make
            additional network requests.</p></div> <div class="info-section"><h4>Checking Status</h4> <p>This tool connects to servers with OCSP stapling enabled and analyzes the stapled response. It checks
            certificate status, response validity, timing information, and provides recommendations for servers without
            stapling enabled.</p></div></div></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let hostname = $.state('example.com');
	let port = $.state('443');
	const diagnosticState = useDiagnosticState();

	const examplesList = [
		{
			host: 'cloudflare.com',
			port: '443',
			description: 'Cloudflare - OCSP stapling enabled'
		},

		{
			host: 'www.digicert.com',
			port: '443',
			description: 'DigiCert - OCSP stapling enabled'
		},

		{
			host: 'github.com',
			port: '443',
			description: 'GitHub - OCSP stapling disabled'
		}
	];

	const examples = useExamples(examplesList);

	async function checkOCSP() {
		if (!$.get(hostname)?.trim()) {
			diagnosticState.setError('Please enter a hostname');

			return;
		}

		diagnosticState.startOperation();

		try {
			const response = await fetch('/api/internal/diagnostics/tls', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					action: 'ocsp-stapling',
					hostname: $.get(hostname).trim().toLowerCase(),
					port: parseInt($.get(port)) || 443
				})
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Failed to check OCSP stapling');
			}

			diagnosticState.setResults(data);
		} catch(err) {
			diagnosticState.setError(err instanceof Error ? err.message : 'An error occurred');
		}
	}

	function loadExample(example, index) {
		$.set(hostname, example.host, true);
		$.set(port, example.port, true);
		examples.select(index);
		checkOCSP();
	}

	function formatDate(dateStr) {
		const date = new Date(dateStr);

		return date.toLocaleString();
	}

	var div = root_19();
	var node = $.sibling($.child(div), 2);

	ExamplesCard(node, {
		get examples() {
			return examplesList;
		},

		get selectedIndex() {
			return examples.selectedIndex;
		},
		onSelect: loadExample,
		getLabel: (ex) => `${ex.host}:${ex.port}`,
		getDescription: (ex) => ex.description,
		getTooltip: (ex) => `Check OCSP stapling for ${ex.host}:${ex.port}`
	});

	var div_1 = $.sibling(node, 2);
	var div_2 = $.sibling($.child(div_1), 2);
	var div_3 = $.child(div_2);
	var div_4 = $.sibling($.child(div_3), 2);
	var input = $.child(div_4);

	$.remove_input_defaults(input);

	var input_1 = $.sibling(input, 2);

	$.remove_input_defaults(input_1);

	var button = $.sibling(input_1, 2);
	var node_1 = $.child(button);

	{
		var consequent = ($$anchor) => {
			var fragment = root();
			var node_2 = $.first_child(fragment);

			Icon(node_2, { name: 'loader', size: 'sm', animate: 'spin' });
			$.next();
			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = root_1();
			var node_3 = $.first_child(fragment_1);

			Icon(node_3, { name: 'search', size: 'sm' });
			$.next();
			$.append($$anchor, fragment_1);
		};

		$.if(node_1, ($$render) => {
			if (diagnosticState.loading) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(button);
	$.reset(div_4);
	$.reset(div_3);
	$.reset(div_2);
	$.reset(div_1);

	var node_4 = $.sibling(div_1, 2);

	ErrorCard(node_4, {
		title: 'OCSP Check Failed',
		get error() {
			return diagnosticState.error;
		}
	});

	var node_5 = $.sibling(node_4, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_5 = root_2();
			var div_6 = $.child(div_5);
			var div_7 = $.child(div_6);
			var node_6 = $.child(div_7);

			Icon(node_6, { name: 'loader', size: 'lg', animate: 'spin' });
			$.next(2);
			$.reset(div_7);
			$.reset(div_6);
			$.reset(div_5);
			$.append($$anchor, div_5);
		};

		$.if(node_5, ($$render) => {
			if (diagnosticState.loading) $$render(consequent_1);
		});
	}

	var node_7 = $.sibling(node_5, 2);

	{
		var consequent_14 = ($$anchor) => {
			var div_8 = root_18();
			var div_9 = $.sibling($.child(div_8), 2);
			var div_10 = $.child(div_9);
			var div_11 = $.child(div_10);
			var div_12 = $.sibling($.child(div_11), 2);
			var node_8 = $.child(div_12);

			{
				var consequent_2 = ($$anchor) => {
					var div_13 = root_3();
					var node_9 = $.child(div_13);

					Icon(node_9, { name: 'check-circle', size: 'lg' });
					$.next(2);
					$.reset(div_13);
					$.append($$anchor, div_13);
				};

				var alternate_1 = ($$anchor) => {
					var div_14 = root_4();
					var node_10 = $.child(div_14);

					Icon(node_10, { name: 'x-circle', size: 'lg' });
					$.next(2);
					$.reset(div_14);
					$.append($$anchor, div_14);
				};

				$.if(node_8, ($$render) => {
					if (diagnosticState.results.staplingEnabled) $$render(consequent_2); else $$render(alternate_1, -1);
				});
			}

			$.reset(div_12);
			$.reset(div_11);

			var node_11 = $.sibling(div_11, 2);

			{
				var consequent_10 = ($$anchor) => {
					var fragment_2 = root_12();
					var div_15 = $.first_child(fragment_2);
					var div_16 = $.sibling($.child(div_15), 2);
					var div_17 = $.child(div_16);
					var div_18 = $.child(div_17);
					var div_19 = $.sibling($.child(div_18), 2);
					var node_12 = $.child(div_19);

					{
						let $0 = $.derived(() => diagnosticState.results.ocspResponse.certStatus.toLowerCase() === 'good' ? 'check-circle' : 'alert-circle');

						Icon(node_12, {
							get name() {
								return $.get($0);
							},
							size: 'sm'
						});
					}

					var text = $.sibling(node_12);

					$.reset(div_19);
					$.reset(div_18);

					var div_20 = $.sibling(div_18, 2);
					var div_21 = $.sibling($.child(div_20), 2);
					var node_13 = $.child(div_21);

					Icon(node_13, { name: 'check-circle', size: 'sm' });

					var text_1 = $.sibling(node_13);

					$.reset(div_21);
					$.reset(div_20);

					var node_14 = $.sibling(div_20, 2);

					{
						var consequent_3 = ($$anchor) => {
							var div_22 = root_5();
							var div_23 = $.sibling($.child(div_22), 2);
							var text_2 = $.only_child(div_23, true);

							$.reset(div_22);

							$.template_effect(($0) => $.set_text(text_2, $0), [
								() => formatDate(diagnosticState.results.ocspResponse.thisUpdate)
							]);

							$.append($$anchor, div_22);
						};

						$.if(node_14, ($$render) => {
							if (diagnosticState.results.ocspResponse.thisUpdate) $$render(consequent_3);
						});
					}

					var node_15 = $.sibling(node_14, 2);

					{
						var consequent_4 = ($$anchor) => {
							var div_24 = root_6();
							var div_25 = $.sibling($.child(div_24), 2);
							var text_3 = $.only_child(div_25, true);

							$.reset(div_24);

							$.template_effect(($0) => $.set_text(text_3, $0), [
								() => formatDate(diagnosticState.results.ocspResponse.nextUpdate)
							]);

							$.append($$anchor, div_24);
						};

						$.if(node_15, ($$render) => {
							if (diagnosticState.results.ocspResponse.nextUpdate) $$render(consequent_4);
						});
					}

					var node_16 = $.sibling(node_15, 2);

					{
						var consequent_5 = ($$anchor) => {
							var div_26 = root_7();
							var div_27 = $.sibling($.child(div_26), 2);
							var text_4 = $.only_child(div_27, true);

							$.reset(div_26);

							$.template_effect(($0) => $.set_text(text_4, $0), [
								() => formatDate(diagnosticState.results.ocspResponse.producedAt)
							]);

							$.append($$anchor, div_26);
						};

						$.if(node_16, ($$render) => {
							if (diagnosticState.results.ocspResponse.producedAt) $$render(consequent_5);
						});
					}

					var node_17 = $.sibling(node_16, 2);

					{
						var consequent_6 = ($$anchor) => {
							var div_28 = root_8();
							var div_29 = $.sibling($.child(div_28), 2);
							var text_5 = $.only_child(div_29, true);

							$.reset(div_28);
							$.template_effect(() => $.set_text(text_5, diagnosticState.results.ocspResponse.responderUrl));
							$.append($$anchor, div_28);
						};

						$.if(node_17, ($$render) => {
							if (diagnosticState.results.ocspResponse.responderUrl) $$render(consequent_6);
						});
					}

					$.reset(div_17);
					$.reset(div_16);
					$.reset(div_15);

					var node_18 = $.sibling(div_15, 2);

					{
						var consequent_9 = ($$anchor) => {
							var div_30 = root_11();
							var div_31 = $.sibling($.child(div_30), 2);
							var div_32 = $.child(div_31);
							var div_33 = $.child(div_32);
							var div_34 = $.child(div_33);
							var div_35 = $.sibling($.child(div_34), 2);
							var text_6 = $.only_child(div_35, true);

							$.reset(div_34);

							var node_19 = $.sibling(div_34, 2);

							{
								var consequent_7 = ($$anchor) => {
									var div_36 = root_9();
									var div_37 = $.sibling($.child(div_36), 2);
									let classes;
									var node_20 = $.child(div_37);

									{
										let $0 = $.derived(() => diagnosticState.results.ocspResponse.validity.expiringSoon ? 'alert-triangle' : 'check-circle');

										Icon(node_20, {
											get name() {
												return $.get($0);
											},
											size: 'sm'
										});
									}

									var text_7 = $.sibling(node_20);

									$.reset(div_37);
									$.reset(div_36);

									$.template_effect(() => {
										classes = $.set_class(div_37, 1, 'stat-value svelte-1w6539c', null, classes, {
											expiring: diagnosticState.results.ocspResponse.validity.expiringSoon
										});

										$.set_text(text_7, ` ${diagnosticState.results.ocspResponse.validity.expiresIn ?? ''}`);
									});

									$.append($$anchor, div_36);
								};

								$.if(node_19, ($$render) => {
									if (diagnosticState.results.ocspResponse.validity.expiresIn) $$render(consequent_7);
								});
							}

							$.reset(div_33);

							var node_21 = $.sibling(div_33, 2);

							{
								var consequent_8 = ($$anchor) => {
									var div_38 = root_10();
									var div_39 = $.child(div_38);
									var span = $.sibling($.child(div_39), 2);
									var text_8 = $.only_child(span);

									$.reset(div_39);

									var div_40 = $.sibling(div_39, 2);
									var div_41 = $.only_child(div_40);

									$.reset(div_38);

									$.template_effect(() => {
										$.set_text(text_8, `${diagnosticState.results.ocspResponse.validity.percentage ?? ''}%`);
										$.set_style(div_41, `width: ${diagnosticState.results.ocspResponse.validity.percentage ?? ''}%`);
									});

									$.append($$anchor, div_38);
								};

								$.if(node_21, ($$render) => {
									if (diagnosticState.results.ocspResponse.validity.percentage !== undefined) $$render(consequent_8);
								});
							}

							$.reset(div_32);
							$.reset(div_31);
							$.reset(div_30);
							$.template_effect(() => $.set_text(text_6, diagnosticState.results.ocspResponse.validity.validFor));
							$.append($$anchor, div_30);
						};

						$.if(node_18, ($$render) => {
							if (diagnosticState.results.ocspResponse.validity) $$render(consequent_9);
						});
					}

					$.template_effect(
						($0) => {
							$.set_class(div_19, 1, `stat-value status-${$0 ?? ''}`, 'svelte-1w6539c');
							$.set_text(text, ` ${diagnosticState.results.ocspResponse.certStatus ?? ''}`);
							$.set_text(text_1, ` ${diagnosticState.results.ocspResponse.responseStatus ?? ''}`);
						},
						[
							() => diagnosticState.results.ocspResponse.certStatus.toLowerCase()
						]
					);

					$.append($$anchor, fragment_2);
				};

				$.if(node_11, ($$render) => {
					if (diagnosticState.results.staplingEnabled && diagnosticState.results.ocspResponse) $$render(consequent_10);
				});
			}

			var node_22 = $.sibling(node_11, 2);

			{
				var consequent_12 = ($$anchor) => {
					var div_42 = root_15();
					var div_43 = $.sibling($.child(div_42), 2);
					var div_44 = $.child(div_43);
					var div_45 = $.child(div_44);
					var div_46 = $.sibling($.child(div_45), 2);
					var text_9 = $.only_child(div_46, true);

					$.reset(div_45);

					var div_47 = $.sibling(div_45, 2);
					var div_48 = $.sibling($.child(div_47), 2);
					var text_10 = $.only_child(div_48, true);

					$.reset(div_47);

					var node_23 = $.sibling(div_47, 2);

					{
						var consequent_11 = ($$anchor) => {
							var div_49 = root_14();
							var div_50 = $.sibling($.child(div_49), 2);

							$.each(div_50, 20, () => diagnosticState.results.certificate.ocspUrls, (url) => url, ($$anchor, url) => {
								var div_51 = root_13();
								var text_11 = $.only_child(div_51, true);

								$.template_effect(() => $.set_text(text_11, url));
								$.append($$anchor, div_51);
							});

							$.reset(div_50);
							$.reset(div_49);
							$.append($$anchor, div_49);
						};

						$.if(node_23, ($$render) => {
							if (diagnosticState.results.certificate.ocspUrls && diagnosticState.results.certificate.ocspUrls.length > 0) $$render(consequent_11);
						});
					}

					$.reset(div_44);
					$.reset(div_43);
					$.reset(div_42);

					$.template_effect(() => {
						$.set_text(text_9, diagnosticState.results.certificate.subject);
						$.set_text(text_10, diagnosticState.results.certificate.issuer);
					});

					$.append($$anchor, div_42);
				};

				$.if(node_22, ($$render) => {
					if (diagnosticState.results.certificate) $$render(consequent_12);
				});
			}

			var node_24 = $.sibling(node_22, 2);

			{
				var consequent_13 = ($$anchor) => {
					var div_52 = root_17();
					var div_53 = $.sibling($.child(div_52), 2);
					var div_54 = $.child(div_53);

					$.each(div_54, 20, () => diagnosticState.results.recommendations, (rec) => rec, ($$anchor, rec) => {
						var div_55 = root_16();
						var node_25 = $.child(div_55);

						Icon(node_25, { name: 'alert-triangle', size: 'sm' });

						var span_1 = $.sibling(node_25, 2);
						var text_12 = $.only_child(span_1, true);

						$.reset(div_55);
						$.template_effect(() => $.set_text(text_12, rec));
						$.append($$anchor, div_55);
					});

					$.reset(div_54);
					$.reset(div_53);
					$.reset(div_52);
					$.append($$anchor, div_52);
				};

				$.if(node_24, ($$render) => {
					if (diagnosticState.results.recommendations && diagnosticState.results.recommendations.length > 0) $$render(consequent_13);
				});
			}

			$.reset(div_10);
			$.reset(div_9);
			$.reset(div_8);
			$.append($$anchor, div_8);
		};

		$.if(node_7, ($$render) => {
			if (diagnosticState.results) $$render(consequent_14);
		});
	}

	$.next(2);
	$.reset(div);

	$.template_effect(() => {
		input.disabled = diagnosticState.loading;
		input_1.disabled = diagnosticState.loading;
		button.disabled = diagnosticState.loading;
	});

	$.delegated('change', input, () => examples.clear());
	$.delegated('keydown', input, (e) => e.key === 'Enter' && checkOCSP());
	$.bind_value(input, () => $.get(hostname), ($$value) => $.set(hostname, $$value));
	$.delegated('change', input_1, () => examples.clear());
	$.delegated('keydown', input_1, (e) => e.key === 'Enter' && checkOCSP());
	$.bind_value(input_1, () => $.get(port), ($$value) => $.set(port, $$value));
	$.delegated('click', button, checkOCSP);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['change', 'keydown', 'click']);