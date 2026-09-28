import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '$lib/components/global/Icon.svelte';
import { useDiagnosticState, useClipboard, useExamples } from '$lib/composables';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import ErrorCard from '$lib/components/common/ErrorCard.svelte';
import { ctLogContent as content } from '$lib/content/ct-log-search';
import '../../../../styles/diagnostics-pages.scss';

var root = $.from_html(`<div class="card"><div class="card-content svelte-ly52b1"><div class="loading-state"><!> <div class="loading-text"><h3>Searching Certificate Transparency Logs</h3> <p> </p></div></div></div></div>`);
var root_1 = $.from_html(`<div class="result-card svelte-ly52b1"><h4 class="svelte-ly52b1"><!> </h4> <div> </div> <p class="stat-label svelte-ly52b1"> </p></div>`);
var root_2 = $.from_html(`<span><!> </span>`);
var root_3 = $.from_html(`<span class="hostname-tag muted svelte-ly52b1"> </span>`);
var root_4 = $.from_html(`<div class="subsection svelte-ly52b1"><h4 class="svelte-ly52b1"><!> </h4> <div class="hostname-list svelte-ly52b1"><!> <!></div></div>`);
var root_5 = $.from_html(`<div class="issuer-item svelte-ly52b1"><span class="issuer-name svelte-ly52b1"> </span> <span class="issuer-count svelte-ly52b1"> </span></div>`);
var root_6 = $.from_html(`<div class="subsection svelte-ly52b1"><h4 class="svelte-ly52b1"><!> </h4> <div class="issuer-list svelte-ly52b1"></div></div>`);
var root_7 = $.from_html(`<span> </span>`);
var root_8 = $.from_html(`<span class="san-tag svelte-ly52b1"> </span>`);
var root_9 = $.from_html(`<span class="san-tag muted svelte-ly52b1"> </span>`);
var root_10 = $.from_html(`<div class="sans-list svelte-ly52b1"><!> <!></div>`);
var root_11 = $.from_html(`<a target="_blank" rel="noopener noreferrer" class="svelte-ly52b1"> </a>`);
var root_12 = $.from_html(`<div class="info-item svelte-ly52b1"><!> <div class="info-content svelte-ly52b1"><span class="info-label svelte-ly52b1"> </span> <!></div></div>`);
var root_13 = $.from_html(`<div class="cert-details svelte-ly52b1"><div class="info-list svelte-ly52b1"></div></div>`);
var root_14 = $.from_html(`<div class="cert-item svelte-ly52b1"><div class="cert-header svelte-ly52b1" role="button" tabindex="0"><div class="cert-title svelte-ly52b1"><!> <strong> </strong> <!></div> <!></div> <!></div>`);
var root_15 = $.from_html(`<div class="cert-item muted-text svelte-ly52b1"> </div>`);
var root_16 = $.from_html(`<div class="card results-card"><div class="card-header row"><h3> </h3> <button class="copy-btn"><!> </button></div> <div class="card-content svelte-ly52b1"><div class="status-overview"><div class="status-item info svelte-ly52b1"><!> <div><h4> </h4> <p>Found in Certificate Transparency logs</p></div></div></div> <div class="results-grid svelte-ly52b1"></div> <!> <!> <div class="subsection svelte-ly52b1"><h4 class="svelte-ly52b1"><!> </h4> <div class="cert-list svelte-ly52b1"><!> <!></div></div></div></div>`);
var root_17 = $.from_html(`<em class="example-text svelte-ly52b1"> </em>`);
var root_18 = $.from_html(`<li class="svelte-ly52b1"><strong> </strong> <!></li>`);
var root_19 = $.from_html(`<details class="info-accordion svelte-ly52b1"><summary class="accordion-summary svelte-ly52b1"><!> <h4 class="svelte-ly52b1"> </h4></summary> <div class="accordion-content svelte-ly52b1"><ul class="svelte-ly52b1"></ul></div></details>`);
var root_20 = $.from_html(`<li class="svelte-ly52b1"> </li>`);
var root_21 = $.from_html(`<div class="card"><header class="card-header"><h1> </h1> <p> </p></header> <div class="card input-card"><div class="card-header"><h3>Search CT Logs</h3></div> <div class="card-content svelte-ly52b1"><div class="lookup-form svelte-ly52b1"><input type="text" placeholder="example.com" class="svelte-ly52b1"/> <button class="lookup-btn"><!> </button></div></div></div> <!> <!> <!> <!> <div class="card info-card svelte-ly52b1"><div class="card-header"><h3>About Certificate Transparency</h3></div> <div class="card-content svelte-ly52b1"><details class="info-accordion svelte-ly52b1"><summary class="accordion-summary svelte-ly52b1"><!> <h4 class="svelte-ly52b1"> </h4></summary> <div class="accordion-content svelte-ly52b1"><p class="svelte-ly52b1"> </p></div></details> <!> <details class="info-accordion svelte-ly52b1"><summary class="accordion-summary svelte-ly52b1"><!> <h4 class="svelte-ly52b1">Quick Tips</h4></summary> <div class="accordion-content svelte-ly52b1"><ul class="svelte-ly52b1"></ul></div></details></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const examplesList = [
		{ domain: 'as93.net', desc: 'Domain hosting multiple apps' },
		{
			domain: 'github.com',
			desc: 'Popular tech platform with modern certificate infrastructure'
		},

		{
			domain: 'google.com',
			desc: 'Shows historic DigiNotar breach certificate from 2011'
		},

		{
			domain: 'reddit.com',
			desc: 'Demonstrates subdomain discovery capabilities'
		},

		{
			domain: 'wikipedia.org',
			desc: 'Example of wildcard certificate usage'
		},

		{
			domain: 'twitter.com',
			desc: 'Shows certificate lifecycle and expiration tracking'
		}
	];

	const examples = useExamples(examplesList);

	const statsConfig = [
		{
			icon: 'check-circle',
			label: 'Valid Certificates',
			key: 'validCertificates',
			valueClass: 'success',
			desc: 'Currently valid'
		},

		{
			icon: 'alert-triangle',
			label: 'Expiring Soon',
			key: 'expiringSoon',
			valueClass: 'warning',
			desc: 'Within 30 days'
		},

		{
			icon: 'asterisk',
			label: 'Wildcard Certs',
			key: 'wildcardCertificates',
			valueClass: '',
			desc: 'Covering subdomains'
		},

		{
			icon: 'globe',
			label: 'Discovered Hosts',
			key: 'discoveredHostnames',
			valueClass: '',
			desc: 'Unique hostnames',
			isArray: true
		}
	];

	const certDetailFields = [
		{
			icon: 'calendar',
			label: 'Valid Period',
			key: 'validPeriod',
			formatter: (cert) => `${new Date(cert.notBefore).toLocaleDateString()} - ${new Date(cert.notAfter).toLocaleDateString()}`
		},
		{ icon: 'building', label: 'Issuer', key: 'issuer' },
		{
			icon: 'hash',
			label: 'Serial Number',
			key: 'serialNumber',
			mono: true
		},
		{ icon: 'globe', label: 'SANs', key: 'sans', isSans: true },
		{
			icon: 'external-link',
			label: 'View Details',
			key: 'ctLogUrl',
			isLink: true
		}
	];

	let domain = $.state('');
	const diagnosticState = useDiagnosticState();
	const clipboard = useClipboard();
	let expandedCert = $.state(null);

	async function loadExample(example, index) {
		$.set(domain, example.domain, true);
		examples.select(index);
		await searchCTLogs();
	}

	async function searchCTLogs() {
		if (!$.get(domain).trim()) {
			diagnosticState.setError('Please enter a domain name');

			return;
		}

		diagnosticState.startOperation();

		try {
			const response = await fetch('/api/internal/diagnostics/ct-log-search', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ domain: $.get(domain).trim() })
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));

				throw new Error(errorData.message || 'Search failed');
			}

			diagnosticState.setResults(await response.json());
		} catch(err) {
			diagnosticState.setError(err instanceof Error ? err.message : 'Unknown error occurred');
		}
	}

	async function copyResults() {
		if (!diagnosticState.results) return;

		let text = `Certificate Transparency Log Search\nDomain: ${diagnosticState.results.domain}\nGenerated at: ${diagnosticState.results.timestamp}\n\n`;

		text += `Total Certificates: ${diagnosticState.results.totalCertificates}\n`;
		text += `Valid Certificates: ${diagnosticState.results.validCertificates}\n`;
		text += `Expiring Soon (30 days): ${diagnosticState.results.expiringSoon}\n`;
		text += `Wildcard Certificates: ${diagnosticState.results.wildcardCertificates}\n\n`;
		text += `Discovered Hostnames (${diagnosticState.results.discoveredHostnames.length}):\n`;
		diagnosticState.results.discoveredHostnames.forEach((h) => text += `  - ${h}\n`);
		text += `\nTop Issuers:\n`;
		diagnosticState.results.issuers.forEach((i) => text += `  - ${i.name}: ${i.count} certificates\n`);
		clipboard.copy(text);
	}

	function toggleCert(id) {
		$.set(expandedCert, $.get(expandedCert) === id ? null : id, true);
	}

	function getCertBadges(cert) {
		const badges = [];

		if (cert.isValid) {
			badges.push({ text: 'Valid', class: 'success' });

			if (cert.daysUntilExpiry <= 30) {
				badges.push({
					text: `Expires in ${cert.daysUntilExpiry}d`,
					class: 'warning'
				});
			}
		} else if (cert.daysUntilExpiry > 0) {
			badges.push({ text: 'Expired', class: 'warning' });
		} else {
			badges.push({ text: 'Not Yet Valid', class: 'muted' });
		}

		return badges;
	}

	var div = root_21();
	var header = $.child(div);
	var h1 = $.child(header);
	var text_1 = $.only_child(h1, true);
	var p = $.sibling(h1, 2);
	var text_2 = $.only_child(p, true);

	$.reset(header);

	var div_1 = $.sibling(header, 2);
	var div_2 = $.sibling($.child(div_1), 2);
	var div_3 = $.child(div_2);
	var input = $.child(div_3);

	$.remove_input_defaults(input);

	var button = $.sibling(input, 2);
	var node = $.child(button);

	{
		let $0 = $.derived(() => diagnosticState.loading ? 'loader' : 'search');
		let $1 = $.derived(() => diagnosticState.loading ? 'spin' : undefined);

		Icon(node, {
			get name() {
				return $.get($0);
			},
			size: 'sm',
			get animate() {
				return $.get($1);
			}
		});
	}

	var text_3 = $.sibling(node);

	$.reset(button);
	$.reset(div_3);
	$.reset(div_2);
	$.reset(div_1);

	var node_1 = $.sibling(div_1, 2);

	ExamplesCard(node_1, {
		get examples() {
			return examplesList;
		},

		get selectedIndex() {
			return examples.selectedIndex;
		},
		onSelect: loadExample,
		getLabel: (ex) => ex.domain,
		getDescription: (ex) => ex.desc
	});

	var node_2 = $.sibling(node_1, 2);

	{
		var consequent = ($$anchor) => {
			var div_4 = root();
			var div_5 = $.child(div_4);
			var div_6 = $.child(div_5);
			var node_3 = $.child(div_6);

			Icon(node_3, { name: 'loader', size: 'lg', animate: 'spin' });

			var div_7 = $.sibling(node_3, 2);
			var p_1 = $.sibling($.child(div_7), 2);
			var text_4 = $.only_child(p_1);

			$.reset(div_7);
			$.reset(div_6);
			$.reset(div_5);
			$.reset(div_4);
			$.template_effect(() => $.set_text(text_4, `Querying CT logs for ${$.get(domain) ?? ''}...`));
			$.append($$anchor, div_4);
		};

		$.if(node_2, ($$render) => {
			if (diagnosticState.loading) $$render(consequent);
		});
	}

	var node_4 = $.sibling(node_2, 2);

	ErrorCard(node_4, {
		title: 'CT Log Search Failed',
		get error() {
			return diagnosticState.error;
		}
	});

	var node_5 = $.sibling(node_4, 2);

	{
		var consequent_12 = ($$anchor) => {
			var div_8 = root_16();
			var div_9 = $.child(div_8);
			var h3 = $.child(div_9);
			var text_5 = $.only_child(h3);
			var button_1 = $.sibling(h3, 2);
			var node_6 = $.child(button_1);

			{
				let $0 = $.derived(() => clipboard.isCopied() ? 'check' : 'copy');

				Icon(node_6, {
					get name() {
						return $.get($0);
					},
					size: 'xs'
				});
			}

			var text_6 = $.sibling(node_6);

			$.reset(button_1);
			$.reset(div_9);

			var div_10 = $.sibling(div_9, 2);
			var div_11 = $.child(div_10);
			var div_12 = $.child(div_11);
			var node_7 = $.child(div_12);

			Icon(node_7, { name: 'file', size: 'md' });

			var div_13 = $.sibling(node_7, 2);
			var h4 = $.child(div_13);
			var text_7 = $.only_child(h4);

			$.next(2);
			$.reset(div_13);
			$.reset(div_12);
			$.reset(div_11);

			var div_14 = $.sibling(div_11, 2);

			$.each(div_14, 21, () => statsConfig, (stat) => stat.key, ($$anchor, stat) => {
				var div_15 = root_1();
				var h4_1 = $.child(div_15);
				var node_8 = $.child(h4_1);

				Icon(node_8, {
					get name() {
						return $.get(stat).icon;
					},
					size: 'sm'
				});

				var text_8 = $.sibling(node_8);

				$.reset(h4_1);

				var div_16 = $.sibling(h4_1, 2);
				var text_9 = $.only_child(div_16, true);
				var p_2 = $.sibling(div_16, 2);
				var text_10 = $.only_child(p_2, true);

				$.reset(div_15);

				$.template_effect(() => {
					$.set_text(text_8, ` ${$.get(stat).label ?? ''}`);
					$.set_class(div_16, 1, `stat-value ${$.get(stat).valueClass ?? ''}`, 'svelte-ly52b1');

					$.set_text(text_9, $.get(stat).isArray
						? diagnosticState.results[$.get(stat).key].length
						: diagnosticState.results[$.get(stat).key]);

					$.set_text(text_10, $.get(stat).desc);
				});

				$.append($$anchor, div_15);
			});

			$.reset(div_14);

			var node_9 = $.sibling(div_14, 2);

			{
				var consequent_3 = ($$anchor) => {
					var div_17 = root_4();
					var h4_2 = $.child(div_17);
					var node_10 = $.child(h4_2);

					Icon(node_10, { name: 'list', size: 'sm' });

					var text_11 = $.sibling(node_10);

					$.reset(h4_2);

					var div_18 = $.sibling(h4_2, 2);
					var node_11 = $.child(div_18);

					$.each(node_11, 16, () => diagnosticState.results.discoveredHostnames.slice(0, 50), (hostname) => hostname, ($$anchor, hostname) => {
						var span = root_2();
						var node_12 = $.child(span);

						{
							var consequent_1 = ($$anchor) => {
								Icon($$anchor, { name: 'asterisk', size: 'xs' });
							};

							var d = $.derived(() => hostname.startsWith('*'));

							$.if(node_12, ($$render) => {
								if ($.get(d)) $$render(consequent_1);
							});
						}

						var text_12 = $.sibling(node_12);

						$.reset(span);

						$.template_effect(
							($0) => {
								$.set_class(span, 1, `hostname-tag ${$0 ?? ''}`, 'svelte-ly52b1');
								$.set_text(text_12, ` ${hostname ?? ''}`);
							},
							[() => hostname.startsWith('*') ? 'wildcard' : '']
						);

						$.append($$anchor, span);
					});

					var node_13 = $.sibling(node_11, 2);

					{
						var consequent_2 = ($$anchor) => {
							var span_1 = root_3();
							var text_13 = $.only_child(span_1);

							$.template_effect(() => $.set_text(text_13, `+${diagnosticState.results.discoveredHostnames.length - 50} more`));
							$.append($$anchor, span_1);
						};

						$.if(node_13, ($$render) => {
							if (diagnosticState.results.discoveredHostnames.length > 50) $$render(consequent_2);
						});
					}

					$.reset(div_18);
					$.reset(div_17);
					$.template_effect(() => $.set_text(text_11, ` Discovered Hostnames (${diagnosticState.results.discoveredHostnames.length ?? ''})`));
					$.append($$anchor, div_17);
				};

				$.if(node_9, ($$render) => {
					if (diagnosticState.results.discoveredHostnames.length > 0) $$render(consequent_3);
				});
			}

			var node_14 = $.sibling(node_9, 2);

			{
				var consequent_4 = ($$anchor) => {
					var div_19 = root_6();
					var h4_3 = $.child(div_19);
					var node_15 = $.child(h4_3);

					Icon(node_15, { name: 'building', size: 'sm' });

					var text_14 = $.sibling(node_15);

					$.reset(h4_3);

					var div_20 = $.sibling(h4_3, 2);

					$.each(div_20, 21, () => diagnosticState.results.issuers.slice(0, 10), (issuer) => issuer.name, ($$anchor, issuer) => {
						var div_21 = root_5();
						var span_2 = $.child(div_21);
						var text_15 = $.only_child(span_2, true);
						var span_3 = $.sibling(span_2, 2);
						var text_16 = $.only_child(span_3, true);

						$.reset(div_21);

						$.template_effect(() => {
							$.set_text(text_15, $.get(issuer).name);
							$.set_text(text_16, $.get(issuer).count);
						});

						$.append($$anchor, div_21);
					});

					$.reset(div_20);
					$.reset(div_19);
					$.template_effect(() => $.set_text(text_14, ` Certificate Issuers (${diagnosticState.results.issuers.length ?? ''})`));
					$.append($$anchor, div_19);
				};

				$.if(node_14, ($$render) => {
					if (diagnosticState.results.issuers.length > 0) $$render(consequent_4);
				});
			}

			var div_22 = $.sibling(node_14, 2);
			var h4_4 = $.child(div_22);
			var node_16 = $.child(h4_4);

			Icon(node_16, { name: 'file', size: 'sm' });

			var text_17 = $.sibling(node_16);

			$.reset(h4_4);

			var div_23 = $.sibling(h4_4, 2);
			var node_17 = $.child(div_23);

			$.each(node_17, 17, () => diagnosticState.results.certificates.slice(0, 20), (cert) => cert.id, ($$anchor, cert) => {
				var div_24 = root_14();
				var div_25 = $.child(div_24);
				var div_26 = $.child(div_25);
				var node_18 = $.child(div_26);

				{
					var consequent_5 = ($$anchor) => {
						Icon($$anchor, { name: 'asterisk', size: 'xs' });
					};

					$.if(node_18, ($$render) => {
						if ($.get(cert).isWildcard) $$render(consequent_5);
					});
				}

				var strong = $.sibling(node_18, 2);
				var text_18 = $.only_child(strong, true);
				var node_19 = $.sibling(strong, 2);

				$.each(node_19, 17, () => getCertBadges($.get(cert)), (badge) => badge.text, ($$anchor, badge) => {
					var span_4 = root_7();
					var text_19 = $.only_child(span_4, true);

					$.template_effect(() => {
						$.set_class(span_4, 1, `badge ${$.get(badge).class ?? ''}`, 'svelte-ly52b1');
						$.set_text(text_19, $.get(badge).text);
					});

					$.append($$anchor, span_4);
				});

				$.reset(div_26);

				var node_20 = $.sibling(div_26, 2);

				{
					let $0 = $.derived(() => $.get(expandedCert) === $.get(cert).id ? 'chevron-up' : 'chevron-down');

					Icon(node_20, {
						get name() {
							return $.get($0);
						},
						size: 'sm'
					});
				}

				$.reset(div_25);

				var node_21 = $.sibling(div_25, 2);

				{
					var consequent_10 = ($$anchor) => {
						var div_27 = root_13();
						var div_28 = $.child(div_27);

						$.each(div_28, 21, () => certDetailFields, (field) => field.key, ($$anchor, field) => {
							var div_29 = root_12();
							var node_22 = $.child(div_29);

							Icon(node_22, {
								get name() {
									return $.get(field).icon;
								},
								size: 'sm'
							});

							var div_30 = $.sibling(node_22, 2);
							var span_5 = $.child(div_30);
							var text_20 = $.only_child(span_5);
							var node_23 = $.sibling(span_5, 2);

							{
								var consequent_7 = ($$anchor) => {
									var div_31 = root_10();
									var node_24 = $.child(div_31);

									$.each(node_24, 16, () => $.get(cert).sans.slice(0, 10), (san) => san, ($$anchor, san) => {
										var span_6 = root_8();
										var text_21 = $.only_child(span_6, true);

										$.template_effect(() => $.set_text(text_21, san));
										$.append($$anchor, span_6);
									});

									var node_25 = $.sibling(node_24, 2);

									{
										var consequent_6 = ($$anchor) => {
											var span_7 = root_9();
											var text_22 = $.only_child(span_7);

											$.template_effect(() => $.set_text(text_22, `+${$.get(cert).sans.length - 10} more`));
											$.append($$anchor, span_7);
										};

										$.if(node_25, ($$render) => {
											if ($.get(cert).sans.length > 10) $$render(consequent_6);
										});
									}

									$.reset(div_31);
									$.append($$anchor, div_31);
								};

								var consequent_8 = ($$anchor) => {
									var a = root_11();
									var text_23 = $.only_child(a);

									$.template_effect(() => {
										$.set_attribute(a, 'href', $.get(cert).ctLogUrl);
										$.set_text(text_23, `crt.sh #${$.get(cert).id ?? ''}`);
									});

									$.append($$anchor, a);
								};

								var consequent_9 = ($$anchor) => {
									var span_8 = root_7();
									var text_24 = $.only_child(span_8, true);

									$.template_effect(
										($0) => {
											$.set_class(span_8, 1, `info-value ${$.get(field).mono ? 'mono' : ''}`, 'svelte-ly52b1');
											$.set_text(text_24, $0);
										},
										[() => $.get(field).formatter($.get(cert))]
									);

									$.append($$anchor, span_8);
								};

								var alternate = ($$anchor) => {
									var span_9 = root_7();
									var text_25 = $.only_child(span_9, true);

									$.template_effect(() => {
										$.set_class(span_9, 1, `info-value ${$.get(field).mono ? 'mono' : ''}`, 'svelte-ly52b1');
										$.set_text(text_25, $.get(cert)[$.get(field).key]);
									});

									$.append($$anchor, span_9);
								};

								$.if(node_23, ($$render) => {
									if ($.get(field).isSans) $$render(consequent_7); else if ($.get(field).isLink) $$render(consequent_8, 1); else if ($.get(field).formatter) $$render(consequent_9, 2); else $$render(alternate, -1);
								});
							}

							$.reset(div_30);
							$.reset(div_29);
							$.template_effect(() => $.set_text(text_20, `${$.get(field).label ?? ''}${$.get(field).isSans ? ` (${$.get(cert).sans.length})` : ''}`));
							$.append($$anchor, div_29);
						});

						$.reset(div_28);
						$.reset(div_27);
						$.append($$anchor, div_27);
					};

					$.if(node_21, ($$render) => {
						if ($.get(expandedCert) === $.get(cert).id) $$render(consequent_10);
					});
				}

				$.reset(div_24);
				$.template_effect(() => $.set_text(text_18, $.get(cert).commonName));
				$.delegated('click', div_25, () => toggleCert($.get(cert).id));
				$.delegated('keydown', div_25, (e) => e.key === 'Enter' && toggleCert($.get(cert).id));
				$.append($$anchor, div_24);
			});

			var node_26 = $.sibling(node_17, 2);

			{
				var consequent_11 = ($$anchor) => {
					var div_32 = root_15();
					var text_26 = $.only_child(div_32);

					$.template_effect(() => $.set_text(text_26, `Showing first 20 of ${diagnosticState.results.certificates.length ?? ''} certificates`));
					$.append($$anchor, div_32);
				};

				$.if(node_26, ($$render) => {
					if (diagnosticState.results.certificates.length > 20) $$render(consequent_11);
				});
			}

			$.reset(div_23);
			$.reset(div_22);
			$.reset(div_10);
			$.reset(div_8);

			$.template_effect(
				($0, $1) => {
					$.set_text(text_5, `CT Log Results for ${diagnosticState.results.domain ?? ''}`);
					button_1.disabled = $0;
					$.set_text(text_6, ` ${$1 ?? ''}`);
					$.set_text(text_7, `${diagnosticState.results.totalCertificates ?? ''} Total Certificates`);
					$.set_text(text_17, ` Certificates (${diagnosticState.results.certificates.length ?? ''})`);
				},
				[
					() => clipboard.isCopied(),
					() => clipboard.isCopied() ? 'Copied!' : 'Copy Results'
				]
			);

			$.delegated('click', button_1, copyResults);
			$.append($$anchor, div_8);
		};

		$.if(node_5, ($$render) => {
			if (diagnosticState.results) $$render(consequent_12);
		});
	}

	var div_33 = $.sibling(node_5, 2);
	var div_34 = $.sibling($.child(div_33), 2);
	var details = $.child(div_34);
	var summary = $.child(details);
	var node_27 = $.child(summary);

	Icon(node_27, { name: 'chevron-right', size: 'sm' });

	var h4_5 = $.sibling(node_27, 2);
	var text_27 = $.only_child(h4_5, true);

	$.reset(summary);

	var div_35 = $.sibling(summary, 2);
	var p_3 = $.child(div_35);
	var text_28 = $.only_child(p_3, true);

	$.reset(div_35);
	$.reset(details);

	var node_28 = $.sibling(details, 2);

	$.each(
		node_28,
		17,
		() => [
			{
				title: content.sections.benefits.title,
				items: content.sections.benefits.benefits,
				keys: ['benefit', 'description']
			},

			{
				title: content.sections.useCases.title,
				items: content.sections.useCases.cases,
				keys: ['useCase', 'description', 'example']
			},

			{
				title: content.sections.certificateFields.title,
				items: content.sections.certificateFields.fields,
				keys: ['field', 'description']
			},

			{
				title: content.sections.security.title,
				items: content.sections.security.points,
				keys: ['point', 'description']
			},

			{
				title: content.sections.bestPractices.title,
				items: content.sections.bestPractices.practices,
				keys: ['practice', 'description']
			}
		],
		(section) => section.title,
		($$anchor, section) => {
			var details_1 = root_19();
			var summary_1 = $.child(details_1);
			var node_29 = $.child(summary_1);

			Icon(node_29, { name: 'chevron-right', size: 'sm' });

			var h4_6 = $.sibling(node_29, 2);
			var text_29 = $.only_child(h4_6, true);

			$.reset(summary_1);

			var div_36 = $.sibling(summary_1, 2);
			var ul = $.child(div_36);

			$.each(ul, 21, () => $.get(section).items, (item) => item[$.get(section).keys[0]], ($$anchor, item) => {
				var li = root_18();
				var strong_1 = $.child(li);
				var text_30 = $.only_child(strong_1);
				var text_31 = $.sibling(strong_1);
				var node_30 = $.sibling(text_31);

				{
					var consequent_13 = ($$anchor) => {
						var em = root_17();
						var text_32 = $.only_child(em);

						$.template_effect(() => $.set_text(text_32, `(${$.get(item)[$.get(section).keys[2]] ?? ''})`));
						$.append($$anchor, em);
					};

					$.if(node_30, ($$render) => {
						if ($.get(section).keys[2] && $.get(item)[$.get(section).keys[2]]) $$render(consequent_13);
					});
				}

				$.reset(li);

				$.template_effect(() => {
					$.set_text(text_30, `${$.get(item)[$.get(section).keys[0]] ?? ''}:`);
					$.set_text(text_31, ` ${$.get(item)[$.get(section).keys[1]] ?? ''} `);
				});

				$.append($$anchor, li);
			});

			$.reset(ul);
			$.reset(div_36);
			$.reset(details_1);
			$.template_effect(() => $.set_text(text_29, $.get(section).title));
			$.append($$anchor, details_1);
		}
	);

	var details_2 = $.sibling(node_28, 2);
	var summary_2 = $.child(details_2);
	var node_31 = $.child(summary_2);

	Icon(node_31, { name: 'chevron-right', size: 'sm' });
	$.next(2);
	$.reset(summary_2);

	var div_37 = $.sibling(summary_2, 2);
	var ul_1 = $.child(div_37);

	$.each(ul_1, 20, () => content.quickTips, (tip) => tip, ($$anchor, tip) => {
		var li_1 = root_20();
		var text_33 = $.only_child(li_1, true);

		$.template_effect(() => $.set_text(text_33, tip));
		$.append($$anchor, li_1);
	});

	$.reset(ul_1);
	$.reset(div_37);
	$.reset(details_2);
	$.reset(div_34);
	$.reset(div_33);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text_1, content.title);
		$.set_text(text_2, content.description);
		input.disabled = diagnosticState.loading;
		button.disabled = diagnosticState.loading;
		$.set_text(text_3, ` ${diagnosticState.loading ? 'Searching...' : 'Search CT Logs'}`);
		$.set_text(text_27, content.sections.whatIsCT.title);
		$.set_text(text_28, content.sections.whatIsCT.content);
	});

	$.delegated('keydown', input, (e) => e.key === 'Enter' && searchCTLogs());
	$.bind_value(input, () => $.get(domain), ($$value) => $.set(domain, $$value));
	$.delegated('click', button, searchCTLogs);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['keydown', 'click']);