import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import '../../../../styles/diagnostics-pages.scss';

var root = $.from_html(`<button><h5> </h5> <p> </p> <small class="svelte-2918zk"> </small></button>`);
var root_1 = $.from_html(`<!> Performing RDAP Lookup...`, 1);
var root_2 = $.from_html(`<!> Lookup ASN`, 1);
var root_3 = $.from_html(`<span class="country-code"> </span>`);
var root_4 = $.from_html(`<span class="status-badge"> </span>`);
var root_5 = $.from_html(`<div class="status-list"></div>`);
var root_6 = $.from_html(`<p><small> </small></p>`);
var root_7 = $.from_html(`<span class="role-badge"> </span>`);
var root_8 = $.from_html(`<div class="roles-list"></div>`);
var root_9 = $.from_html(`<div class="contact-card"><h5><!></h5> <p><strong> </strong></p> <!> <!></div>`);
var root_10 = $.from_html(`<div class="result-section full-width"><h4>Contact Information</h4> <div class="contacts-grid"></div></div>`);
var root_11 = $.from_html(`<div class="card results-card"><div class="card-header row"><h3> </h3> <button class="copy-btn"><span><!></span> </button></div> <div class="card-content"><div class="lookup-info"><div class="info-item"><span class="info-label">ASN:</span> <span class="info-value"><span class="asn-number"> </span></span></div> <div class="info-item"><span class="info-label">RDAP Service:</span> <span class="info-value mono"> </span></div></div> <div class="results-grid"><div class="result-section"><h4>ASN Information</h4> <dl class="definition-list"><dt>Organization Name:</dt> <dd> </dd> <dt>Type:</dt> <dd> </dd> <dt>Country:</dt> <dd><!></dd> <dt>Registry:</dt> <dd> </dd></dl></div> <div class="result-section"><h4>Allocation Details</h4> <dl class="definition-list"><dt>Status:</dt> <dd><!></dd> <dt>Allocation Date:</dt> <dd> </dd> <dt>Last Changed:</dt> <dd> </dd></dl></div> <!></div></div></div>`);
var root_12 = $.from_html(`<div class="card error-card"><div class="card-content"><div class="error-content"><!> <div><strong>RDAP Lookup Failed</strong> <p> </p> <div class="troubleshooting"><p><strong>Troubleshooting Tips:</strong></p> <ul><li>Ensure the ASN format is valid (e.g., AS15169 or just 15169)</li> <li>Check if the ASN exists and is currently allocated</li> <li>Private ASNs (64512-65534, 4200000000-4294967294) may not have public RDAP data</li> <li>Some RIRs may have rate limiting or access restrictions</li> <li>Try again in a few moments if the service is temporarily unavailable</li></ul></div></div></div></div></div>`);

var root_13 = $.from_html(`<div class="card"><header class="card-header"><h1>ASN RDAP Lookup</h1> <p>Query Autonomous System Number allocation and registration data using RDAP through Regional Internet Registries.
      ASNs identify networks on the global Internet routing table and are essential for BGP routing operations.</p></header> <div class="card examples-card"><details class="examples-details"><summary class="examples-summary"><!> <h4>Common ASN Examples</h4></summary> <div class="examples-grid"></div></details></div> <div class="card input-card"><div class="card-header"><h3>RDAP Lookup Configuration</h3></div> <div class="card-content"><div class="form-grid svelte-2918zk"><div class="form-group svelte-2918zk"><label for="asn" class="svelte-2918zk">Autonomous System Number <input id="asn" type="text" placeholder="AS15169 or 15169"/> <small class="svelte-2918zk">Supports both formats: AS15169 or 15169 (AS prefix is optional)</small></label></div></div> <div class="action-section"><button class="lookup-btn"><!></button></div></div></div> <!> <!> <div class="card info-card"><div class="card-header"><h3>About ASN RDAP Lookups</h3></div> <div class="card-content"><div class="info-grid"><div class="info-section"><h4>What is an ASN?</h4> <p>Autonomous System Numbers identify networks on the global Internet routing table and are essential for BGP
            routing operations. Each ASN represents a collection of IP address blocks under unified administrative
            control.</p></div> <div class="info-section"><h4>ASN Ranges by Registry</h4> <ul><li><strong>ARIN:</strong> AS1 - AS23551, AS393216 - AS394239</li> <li><strong>RIPE NCC:</strong> AS24576 - AS25599, AS34816 - AS35839</li> <li><strong>APNIC:</strong> AS23552 - AS24575, AS37888 - AS38911</li> <li><strong>LACNIC:</strong> AS26592 - AS27647, AS61440 - AS61951</li> <li><strong>AFRINIC:</strong> AS36864 - AS37887, AS327680 - AS328703</li></ul></div> <div class="info-section"><h4>What You'll Get</h4> <ul><li>Organization name and type</li> <li>Country of registration</li> <li>Allocation date and status</li> <li>Contact information (admin, technical, abuse)</li></ul></div></div></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let asn = $.state('AS15169');
	let loading = $.state(false);
	let results = $.state(null);
	let error = $.state(null);
	let copiedState = $.state(false);
	let selectedExampleIndex = $.state(null);

	const examples = [
		{
			asn: 'AS15169',
			description: 'Google LLC - Major cloud provider'
		},

		{
			asn: 'AS13335',
			description: 'Cloudflare - CDN and security services'
		},

		{
			asn: 'AS16509',
			description: 'Amazon.com - AWS cloud infrastructure'
		},

		{
			asn: 'AS8075',
			description: 'Microsoft Corporation - Azure cloud'
		},

		{
			asn: 'AS32934',
			description: 'Meta Platforms - Facebook services'
		},

		{
			asn: 'AS396982',
			description: 'Google Cloud Platform - Additional ranges'
		}
	];

	async function lookupASN() {
		$.set(loading, true);
		$.set(error, null);
		$.set(results, null);

		try {
			const response = await fetch('/api/internal/diagnostics/rdap', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: 'asn-lookup', asn: $.get(asn).trim().toUpperCase() })
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));

				throw new Error(errorData.message || `ASN RDAP lookup failed: ${response.status}`);
			}

			$.set(results, await response.json(), true);
		} catch(err) {
			$.set(error, err.message, true);
		} finally {
			$.set(loading, false);
		}
	}

	function loadExample(example, index) {
		$.set(asn, example.asn, true);
		$.set(selectedExampleIndex, index, true);
		lookupASN();
	}

	function clearExampleSelection() {
		$.set(selectedExampleIndex, null);
	}

	async function copyResults() {
		if (!$.get(results)?.raw) return;

		try {
			await navigator.clipboard.writeText(JSON.stringify($.get(results).raw, null, 2));
			$.set(copiedState, true);
			setTimeout(() => $.set(copiedState, false), 1500);
		} catch(err) {
			console.error('Failed to copy:', err);
		}
	}

	function formatDate(dateString) {
		if (!dateString) return 'Not available';

		try {
			return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
		} catch {
			return dateString;
		}
	}

	function formatContact(contact) {
		const vcard = contact.vcardArray;

		if (!vcard || !vcard[1]) return contact.handle || 'Unknown';

		const properties = vcard[1];
		const name = properties.find((p) => p[0] === 'fn')?.[3] || contact.handle;
		const org = properties.find((p) => p[0] === 'org')?.[3]?.[0];

		return org ? `${name} (${org})` : name;
	}

	function formatASN(asnString) {
		return asnString.startsWith('AS') ? asnString : `AS${asnString}`;
	}

	var div = root_13();
	var div_1 = $.sibling($.child(div), 2);
	var details = $.child(div_1);
	var summary = $.child(details);
	var node = $.child(summary);

	Icon(node, { name: 'chevron-right', size: 'xs' });
	$.next(2);
	$.reset(summary);

	var div_2 = $.sibling(summary, 2);

	$.each(div_2, 21, () => examples, $.index, ($$anchor, example, i) => {
		var button = root();
		let classes;
		var h5 = $.child(button);
		var text = $.only_child(h5, true);
		var p_1 = $.sibling(h5, 2);
		var text_1 = $.only_child(p_1, true);
		var small = $.sibling(p_1, 2);
		var text_2 = $.only_child(small, true);

		$.reset(button);
		$.action(button, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => `Perform RDAP lookup for ${$.get(example).asn} (${$.get(example).description})`);

		$.template_effect(
			($0) => {
				classes = $.set_class(button, 1, 'example-card svelte-2918zk', null, classes, { selected: $.get(selectedExampleIndex) === i });
				$.set_text(text, $.get(example).asn);
				$.set_text(text_1, $.get(example).description);
				$.set_text(text_2, $0);
			},
			[() => $.get(example).asn.replace('AS', '')]
		);

		$.delegated('click', button, () => loadExample($.get(example), i));
		$.append($$anchor, button);
	});

	$.reset(div_2);
	$.reset(details);
	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);
	var div_4 = $.sibling($.child(div_3), 2);
	var div_5 = $.child(div_4);
	var div_6 = $.child(div_5);
	var label = $.child(div_6);
	var input = $.sibling($.child(label));

	$.remove_input_defaults(input);
	$.next(2);
	$.reset(label);
	$.action(label, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Enter an Autonomous System Number to query allocation data via RDAP');
	$.reset(div_6);
	$.reset(div_5);

	var div_7 = $.sibling(div_5, 2);
	var button_1 = $.child(div_7);
	var node_1 = $.child(button_1);

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

			Icon(node_3, { name: 'search', size: 'sm' });
			$.next();
			$.append($$anchor, fragment_1);
		};

		$.if(node_1, ($$render) => {
			if ($.get(loading)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(button_1);
	$.reset(div_7);
	$.reset(div_4);
	$.reset(div_3);

	var node_4 = $.sibling(div_3, 2);

	{
		var consequent_10 = ($$anchor) => {
			var div_8 = root_11();
			var div_9 = $.child(div_8);
			var h3 = $.child(div_9);
			var text_3 = $.only_child(h3);
			var button_2 = $.sibling(h3, 2);
			var span = $.child(button_2);
			var node_5 = $.child(span);

			{
				let $0 = $.derived(() => $.get(copiedState) ? 'check' : 'copy');

				Icon(node_5, {
					get name() {
						return $.get($0);
					},
					size: 'xs'
				});
			}

			$.reset(span);

			var text_4 = $.sibling(span);

			$.reset(button_2);
			$.reset(div_9);

			var div_10 = $.sibling(div_9, 2);
			var div_11 = $.child(div_10);
			var div_12 = $.child(div_11);
			var span_1 = $.child(div_12);

			$.action(span_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'The ASN that was queried');

			var span_2 = $.sibling(span_1, 2);
			var span_3 = $.child(span_2);
			var text_5 = $.only_child(span_3, true);

			$.reset(span_2);
			$.reset(div_12);

			var div_13 = $.sibling(div_12, 2);
			var span_4 = $.child(div_13);

			$.action(span_4, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'RDAP service used for the query');

			var span_5 = $.sibling(span_4, 2);
			var text_6 = $.only_child(span_5, true);

			$.reset(div_13);
			$.reset(div_11);

			var div_14 = $.sibling(div_11, 2);
			var div_15 = $.child(div_14);
			var dl = $.sibling($.child(div_15), 2);
			var dd = $.sibling($.child(dl), 2);
			var text_7 = $.only_child(dd, true);
			var dd_1 = $.sibling(dd, 4);
			var text_8 = $.only_child(dd_1, true);
			var dd_2 = $.sibling(dd_1, 4);
			var node_6 = $.child(dd_2);

			{
				var consequent_1 = ($$anchor) => {
					var span_6 = root_3();
					var text_9 = $.only_child(span_6, true);

					$.template_effect(() => $.set_text(text_9, $.get(results).data.country));
					$.append($$anchor, span_6);
				};

				var alternate_1 = ($$anchor) => {
					var text_10 = $.text('Not available');

					$.append($$anchor, text_10);
				};

				$.if(node_6, ($$render) => {
					if ($.get(results).data.country) $$render(consequent_1); else $$render(alternate_1, -1);
				});
			}

			$.reset(dd_2);

			var dd_3 = $.sibling(dd_2, 4);
			var text_11 = $.only_child(dd_3, true);

			$.reset(dl);
			$.reset(div_15);

			var div_16 = $.sibling(div_15, 2);
			var dl_1 = $.sibling($.child(div_16), 2);
			var dd_4 = $.sibling($.child(dl_1), 2);
			var node_7 = $.child(dd_4);

			{
				var consequent_2 = ($$anchor) => {
					var div_17 = root_5();

					$.each(div_17, 21, () => $.get(results).data.status, $.index, ($$anchor, status) => {
						var span_7 = root_4();
						var text_12 = $.only_child(span_7, true);

						$.template_effect(() => $.set_text(text_12, $.get(status)));
						$.append($$anchor, span_7);
					});

					$.reset(div_17);
					$.append($$anchor, div_17);
				};

				var alternate_2 = ($$anchor) => {
					var text_13 = $.text('Not available');

					$.append($$anchor, text_13);
				};

				$.if(node_7, ($$render) => {
					if ($.get(results).data.status?.length) $$render(consequent_2); else $$render(alternate_2, -1);
				});
			}

			$.reset(dd_4);

			var dd_5 = $.sibling(dd_4, 4);
			var text_14 = $.only_child(dd_5, true);
			var dd_6 = $.sibling(dd_5, 4);
			var text_15 = $.only_child(dd_6, true);

			$.reset(dl_1);
			$.reset(div_16);

			var node_8 = $.sibling(div_16, 2);

			{
				var consequent_9 = ($$anchor) => {
					var div_18 = root_10();
					var div_19 = $.sibling($.child(div_18), 2);

					$.each(div_19, 21, () => $.get(results).data.contacts, $.index, ($$anchor, contact) => {
						var div_20 = root_9();
						var h5_1 = $.child(div_20);
						var node_9 = $.child(h5_1);

						{
							var consequent_3 = ($$anchor) => {
								var text_16 = $.text('Registrant');

								$.append($$anchor, text_16);
							};

							var d = $.derived(() => $.get(contact).roles?.includes('registrant'));

							var consequent_4 = ($$anchor) => {
								var text_17 = $.text('Administrative');

								$.append($$anchor, text_17);
							};

							var d_1 = $.derived(() => $.get(contact).roles?.includes('administrative'));

							var consequent_5 = ($$anchor) => {
								var text_18 = $.text('Technical');

								$.append($$anchor, text_18);
							};

							var d_2 = $.derived(() => $.get(contact).roles?.includes('technical'));

							var consequent_6 = ($$anchor) => {
								var text_19 = $.text('Abuse');

								$.append($$anchor, text_19);
							};

							var d_3 = $.derived(() => $.get(contact).roles?.includes('abuse'));

							var alternate_3 = ($$anchor) => {
								var text_20 = $.text('Contact');

								$.append($$anchor, text_20);
							};

							$.if(node_9, ($$render) => {
								if ($.get(d)) $$render(consequent_3); else if ($.get(d_1)) $$render(consequent_4, 1); else if ($.get(d_2)) $$render(consequent_5, 2); else if ($.get(d_3)) $$render(consequent_6, 3); else $$render(alternate_3, -1);
							});
						}

						$.reset(h5_1);

						var p_2 = $.sibling(h5_1, 2);
						var strong = $.child(p_2);
						var text_21 = $.only_child(strong, true);

						$.reset(p_2);

						var node_10 = $.sibling(p_2, 2);

						{
							var consequent_7 = ($$anchor) => {
								var p_3 = root_6();
								var small_1 = $.child(p_3);
								var text_22 = $.only_child(small_1);

								$.reset(p_3);
								$.template_effect(() => $.set_text(text_22, `Handle: ${$.get(contact).handle ?? ''}`));
								$.append($$anchor, p_3);
							};

							$.if(node_10, ($$render) => {
								if ($.get(contact).handle) $$render(consequent_7);
							});
						}

						var node_11 = $.sibling(node_10, 2);

						{
							var consequent_8 = ($$anchor) => {
								var div_21 = root_8();

								$.each(div_21, 21, () => $.get(contact).roles, $.index, ($$anchor, role, index, $$array) => {
									var span_8 = root_7();
									var text_23 = $.only_child(span_8, true);

									$.template_effect(() => $.set_text(text_23, $.get(role)));
									$.append($$anchor, span_8);
								});

								$.reset(div_21);
								$.append($$anchor, div_21);
							};

							$.if(node_11, ($$render) => {
								if ($.get(contact).roles) $$render(consequent_8);
							});
						}

						$.reset(div_20);
						$.template_effect(($0) => $.set_text(text_21, $0), [() => formatContact($.get(contact))]);
						$.append($$anchor, div_20);
					});

					$.reset(div_19);
					$.reset(div_18);
					$.append($$anchor, div_18);
				};

				$.if(node_8, ($$render) => {
					if ($.get(results).data.contacts?.length) $$render(consequent_9);
				});
			}

			$.reset(div_14);
			$.reset(div_10);
			$.reset(div_8);

			$.template_effect(
				($0, $1, $2, $3) => {
					$.set_text(text_3, `RDAP Data for ${$0 ?? ''}`);
					button_2.disabled = $.get(copiedState);
					$.set_class(span, 1, $.clsx($.get(copiedState) ? 'text-green-500' : ''));
					$.set_text(text_4, ` ${$.get(copiedState) ? 'Copied!' : 'Copy Raw JSON'}`);
					$.set_text(text_5, $1);
					$.set_text(text_6, $.get(results).serviceUrl);
					$.set_text(text_7, $.get(results).data.name || 'Not available');
					$.set_text(text_8, $.get(results).data.type || 'Not available');
					$.set_text(text_11, $.get(results).data.registry || 'Not available');
					$.set_text(text_14, $2);
					$.set_text(text_15, $3);
				},
				[
					() => formatASN($.get(results).asn),
					() => formatASN($.get(results).asn),
					() => formatDate($.get(results).data.allocation),
					() => formatDate($.get(results).data.lastChanged)
				]
			);

			$.delegated('click', button_2, copyResults);
			$.append($$anchor, div_8);
		};

		$.if(node_4, ($$render) => {
			if ($.get(results)) $$render(consequent_10);
		});
	}

	var node_12 = $.sibling(node_4, 2);

	{
		var consequent_11 = ($$anchor) => {
			var div_22 = root_12();
			var div_23 = $.child(div_22);
			var div_24 = $.child(div_23);
			var node_13 = $.child(div_24);

			Icon(node_13, { name: 'alert-triangle', size: 'md' });

			var div_25 = $.sibling(node_13, 2);
			var p_4 = $.sibling($.child(div_25), 2);
			var text_24 = $.only_child(p_4, true);

			$.next(2);
			$.reset(div_25);
			$.reset(div_24);
			$.reset(div_23);
			$.reset(div_22);
			$.template_effect(() => $.set_text(text_24, $.get(error)));
			$.append($$anchor, div_22);
		};

		$.if(node_12, ($$render) => {
			if ($.get(error)) $$render(consequent_11);
		});
	}

	$.next(2);
	$.reset(div);
	$.template_effect(($0) => button_1.disabled = $0, [() => $.get(loading) || !$.get(asn).trim()]);

	$.delegated('change', input, () => {
		clearExampleSelection();

		if ($.get(asn).trim()) lookupASN();
	});

	$.bind_value(input, () => $.get(asn), ($$value) => $.set(asn, $$value));
	$.delegated('click', button_1, lookupASN);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'change']);