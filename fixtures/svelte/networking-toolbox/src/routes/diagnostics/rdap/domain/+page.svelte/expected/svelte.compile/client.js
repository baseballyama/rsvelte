import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import '../../../../styles/diagnostics-pages.scss';

var root = $.from_html(`<button><h5> </h5> <p> </p></button>`);
var root_1 = $.from_html(`<!> Performing RDAP Lookup...`, 1);
var root_2 = $.from_html(`<!> Lookup Domain`, 1);
var root_3 = $.from_html(`<span class="status-badge"> </span>`);
var root_4 = $.from_html(`<div class="status-list"></div>`);
var root_5 = $.from_html(`<span class="warning-badge">Expires Soon!</span>`);
var root_6 = $.from_html(`<li><code> </code></li>`);
var root_7 = $.from_html(`<div class="result-section"><h4> </h4> <ul class="nameserver-list"></ul></div>`);
var root_8 = $.from_html(`<p><small> </small></p>`);
var root_9 = $.from_html(`<div class="contact-card"><h5><!></h5> <p><strong> </strong></p> <!></div>`);
var root_10 = $.from_html(`<div class="result-section full-width"><h4>Contact Information</h4> <div class="contacts-grid"></div></div>`);
var root_11 = $.from_html(`<div class="card results-card"><div class="card-header row"><h3> </h3> <button class="copy-btn"><span><!></span> </button></div> <div class="card-content"><div class="lookup-info"><div class="info-item"><span class="info-label">Domain:</span> <span class="info-value mono"> </span></div> <div class="info-item"><span class="info-label">RDAP Service:</span> <span class="info-value mono"> </span></div></div> <div class="results-grid"><div class="result-section"><h4>Domain Information</h4> <dl class="definition-list"><dt>Domain Name:</dt> <dd><code> </code></dd> <dt>Status:</dt> <dd><!></dd> <dt>Registrar:</dt> <dd> </dd></dl></div> <div class="result-section"><h4>Important Dates</h4> <dl class="definition-list"><dt>Registration Date:</dt> <dd> </dd> <dt>Last Updated:</dt> <dd> </dd> <dt>Expiration Date:</dt> <dd> <!></dd></dl></div> <!> <!></div></div></div>`);
var root_12 = $.from_html(`<div class="card error-card"><div class="card-content"><div class="error-content"><!> <div><strong>RDAP Lookup Failed</strong> <p> </p> <div class="troubleshooting"><p><strong>Troubleshooting Tips:</strong></p> <ul><li>Ensure the domain name is valid and properly formatted</li> <li>Check if the domain actually exists and is registered</li> <li>Some registries may have rate limiting or access restrictions</li> <li>Try again in a few moments if the service is temporarily unavailable</li></ul></div></div></div></div></div>`);

var root_13 = $.from_html(`<div class="card"><header class="card-header"><h1>Domain RDAP Lookup</h1> <p>Query domain registration data using RDAP (Registration Data Access Protocol). RDAP is the modern successor to
      WHOIS, providing structured JSON responses through IANA bootstrap registry routing.</p></header> <div class="card examples-card"><details class="examples-details"><summary class="examples-summary"><!> <h4>Common Domain Examples</h4></summary> <div class="examples-grid"></div></details></div> <div class="card input-card"><div class="card-header"><h3>RDAP Lookup Configuration</h3></div> <div class="card-content"><div class="form-grid svelte-1clo6a0"><div class="form-group svelte-1clo6a0"><label for="domain" class="svelte-1clo6a0">Domain Name <input id="domain" type="text" placeholder="example.com"/></label></div></div> <div class="action-section"><button class="lookup-btn"><!></button></div></div></div> <!> <!> <div class="card info-card"><div class="card-header"><h3>About RDAP Domain Lookups</h3></div> <div class="card-content"><div class="info-grid"><div class="info-section"><h4>What is RDAP?</h4> <p>RDAP (Registration Data Access Protocol) is the modern successor to WHOIS, providing structured JSON
            responses for domain registration information through IANA bootstrap registry routing.</p></div> <div class="info-section"><h4>What You'll Get</h4> <ul><li>Registration status and dates</li> <li>Nameserver information</li> <li>Registrar details</li> <li>Contact information (if available)</li></ul></div> <div class="info-section"><h4>RDAP vs WHOIS</h4> <ul><li>Structured JSON instead of free text</li> <li>Unicode support for internationalized domains</li> <li>Built-in rate limiting and privacy controls</li> <li>RESTful API with standard HTTP methods</li></ul></div></div></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let domain = $.state('example.com');
	let loading = $.state(false);
	let results = $.state(null);
	let error = $.state(null);
	let copiedState = $.state(false);
	let selectedExampleIndex = $.state(null);

	const examples = [
		{
			domain: 'example.com',
			description: 'Example domain for testing'
		},

		{
			domain: 'google.com',
			description: 'Popular domain with comprehensive records'
		},
		{ domain: 'github.com', description: 'Tech company domain' },
		{
			domain: 'stackoverflow.com',
			description: 'Community platform domain'
		},
		{ domain: 'cloudflare.com', description: 'CDN provider domain' },
		{ domain: 'iana.org', description: 'Internet registry domain' }
	];

	async function lookupDomain() {
		$.set(loading, true);
		$.set(error, null);
		$.set(results, null);

		try {
			const response = await fetch('/api/internal/diagnostics/rdap', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					action: 'domain-lookup',
					domain: $.get(domain).trim().toLowerCase()
				})
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));

				throw new Error(errorData.message || `Domain RDAP lookup failed: ${response.status}`);
			}

			$.set(results, await response.json(), true);
		} catch(err) {
			$.set(error, err instanceof Error ? err.message : 'Unknown error occurred', true);
		} finally {
			$.set(loading, false);
		}
	}

	function loadExample(example, index) {
		$.set(domain, example.domain, true);
		$.set(selectedExampleIndex, index, true);
		lookupDomain();
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

		$.reset(button);
		$.action(button, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => `Perform RDAP lookup for ${$.get(example).domain} (${$.get(example).description})`);

		$.template_effect(() => {
			classes = $.set_class(button, 1, 'example-card', null, classes, { selected: $.get(selectedExampleIndex) === i });
			$.set_text(text, $.get(example).domain);
			$.set_text(text_1, $.get(example).description);
		});

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
	$.reset(label);
	$.action(label, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Enter a domain name to query registration data via RDAP');
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
		var consequent_9 = ($$anchor) => {
			var div_8 = root_11();
			var div_9 = $.child(div_8);
			var h3 = $.child(div_9);
			var text_2 = $.only_child(h3);
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

			var text_3 = $.sibling(span);

			$.reset(button_2);
			$.reset(div_9);

			var div_10 = $.sibling(div_9, 2);
			var div_11 = $.child(div_10);
			var div_12 = $.child(div_11);
			var span_1 = $.child(div_12);

			$.action(span_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'The domain name that was queried');

			var span_2 = $.sibling(span_1, 2);
			var text_4 = $.only_child(span_2, true);

			$.reset(div_12);

			var div_13 = $.sibling(div_12, 2);
			var span_3 = $.child(div_13);

			$.action(span_3, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'RDAP service used for the query');

			var span_4 = $.sibling(span_3, 2);
			var text_5 = $.only_child(span_4, true);

			$.reset(div_13);
			$.reset(div_11);

			var div_14 = $.sibling(div_11, 2);
			var div_15 = $.child(div_14);
			var dl = $.sibling($.child(div_15), 2);
			var dd = $.sibling($.child(dl), 2);
			var code = $.child(dd);
			var text_6 = $.only_child(code, true);

			$.reset(dd);

			var dd_1 = $.sibling(dd, 4);
			var node_6 = $.child(dd_1);

			{
				var consequent_1 = ($$anchor) => {
					var div_16 = root_4();

					$.each(div_16, 21, () => $.get(results).data.status, $.index, ($$anchor, status) => {
						var span_5 = root_3();
						var text_7 = $.only_child(span_5, true);

						$.template_effect(() => $.set_text(text_7, $.get(status)));
						$.append($$anchor, span_5);
					});

					$.reset(div_16);
					$.append($$anchor, div_16);
				};

				var alternate_1 = ($$anchor) => {
					var text_8 = $.text('Not available');

					$.append($$anchor, text_8);
				};

				$.if(node_6, ($$render) => {
					if ($.get(results).data.status?.length) $$render(consequent_1); else $$render(alternate_1, -1);
				});
			}

			$.reset(dd_1);

			var dd_2 = $.sibling(dd_1, 4);
			var text_9 = $.only_child(dd_2, true);

			$.reset(dl);
			$.reset(div_15);

			var div_17 = $.sibling(div_15, 2);
			var dl_1 = $.sibling($.child(div_17), 2);
			var dd_3 = $.sibling($.child(dl_1), 2);
			var text_10 = $.only_child(dd_3, true);
			var dd_4 = $.sibling(dd_3, 4);
			var text_11 = $.only_child(dd_4, true);
			var dd_5 = $.sibling(dd_4, 4);
			let classes_1;
			var text_12 = $.child(dd_5);
			var node_7 = $.sibling(text_12);

			{
				var consequent_2 = ($$anchor) => {
					var span_6 = root_5();

					$.append($$anchor, span_6);
				};

				var d = $.derived(() => $.get(results).data.expires && new Date($.get(results).data.expires) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

				$.if(node_7, ($$render) => {
					if ($.get(d)) $$render(consequent_2);
				});
			}

			$.reset(dd_5);
			$.reset(dl_1);
			$.reset(div_17);

			var node_8 = $.sibling(div_17, 2);

			{
				var consequent_3 = ($$anchor) => {
					var div_18 = root_7();
					var h4 = $.child(div_18);
					var text_13 = $.only_child(h4);
					var ul = $.sibling(h4, 2);

					$.each(ul, 21, () => $.get(results).data.nameservers, $.index, ($$anchor, ns) => {
						var li = root_6();
						var code_1 = $.child(li);
						var text_14 = $.only_child(code_1, true);

						$.reset(li);
						$.template_effect(() => $.set_text(text_14, $.get(ns)));
						$.append($$anchor, li);
					});

					$.reset(ul);
					$.reset(div_18);
					$.template_effect(() => $.set_text(text_13, `Nameservers (${$.get(results).data.nameservers.length ?? ''})`));
					$.append($$anchor, div_18);
				};

				$.if(node_8, ($$render) => {
					if ($.get(results).data.nameservers?.length) $$render(consequent_3);
				});
			}

			var node_9 = $.sibling(node_8, 2);

			{
				var consequent_8 = ($$anchor) => {
					var div_19 = root_10();
					var div_20 = $.sibling($.child(div_19), 2);

					$.each(div_20, 21, () => $.get(results).data.contacts, $.index, ($$anchor, contact) => {
						var div_21 = root_9();
						var h5_1 = $.child(div_21);
						var node_10 = $.child(h5_1);

						{
							var consequent_4 = ($$anchor) => {
								var text_15 = $.text('Registrant');

								$.append($$anchor, text_15);
							};

							var d_1 = $.derived(() => $.get(contact).roles?.includes('registrant'));

							var consequent_5 = ($$anchor) => {
								var text_16 = $.text('Administrative');

								$.append($$anchor, text_16);
							};

							var d_2 = $.derived(() => $.get(contact).roles?.includes('administrative'));

							var consequent_6 = ($$anchor) => {
								var text_17 = $.text('Technical');

								$.append($$anchor, text_17);
							};

							var d_3 = $.derived(() => $.get(contact).roles?.includes('technical'));

							var alternate_2 = ($$anchor) => {
								var text_18 = $.text('Contact');

								$.append($$anchor, text_18);
							};

							$.if(node_10, ($$render) => {
								if ($.get(d_1)) $$render(consequent_4); else if ($.get(d_2)) $$render(consequent_5, 1); else if ($.get(d_3)) $$render(consequent_6, 2); else $$render(alternate_2, -1);
							});
						}

						$.reset(h5_1);

						var p_2 = $.sibling(h5_1, 2);
						var strong = $.child(p_2);
						var text_19 = $.only_child(strong, true);

						$.reset(p_2);

						var node_11 = $.sibling(p_2, 2);

						{
							var consequent_7 = ($$anchor) => {
								var p_3 = root_8();
								var small = $.child(p_3);
								var text_20 = $.only_child(small);

								$.reset(p_3);
								$.template_effect(() => $.set_text(text_20, `Handle: ${$.get(contact).handle ?? ''}`));
								$.append($$anchor, p_3);
							};

							$.if(node_11, ($$render) => {
								if ($.get(contact).handle) $$render(consequent_7);
							});
						}

						$.reset(div_21);
						$.template_effect(($0) => $.set_text(text_19, $0), [() => formatContact($.get(contact))]);
						$.append($$anchor, div_21);
					});

					$.reset(div_20);
					$.reset(div_19);
					$.append($$anchor, div_19);
				};

				$.if(node_9, ($$render) => {
					if ($.get(results).data.contacts?.length) $$render(consequent_8);
				});
			}

			$.reset(div_14);
			$.reset(div_10);
			$.reset(div_8);

			$.template_effect(
				($0, $1, $2, $3) => {
					$.set_text(text_2, `RDAP Data for ${$.get(results).domain ?? ''}`);
					button_2.disabled = $.get(copiedState);
					$.set_class(span, 1, $.clsx($.get(copiedState) ? 'text-green-500' : ''));
					$.set_text(text_3, ` ${$.get(copiedState) ? 'Copied!' : 'Copy Raw JSON'}`);
					$.set_text(text_4, $.get(results).data.domain || $.get(results).domain);
					$.set_text(text_5, $.get(results).serviceUrl);
					$.set_text(text_6, $.get(results).data.domain || $.get(results).domain);
					$.set_text(text_9, $.get(results).data.registrar || 'Not available');
					$.set_text(text_10, $0);
					$.set_text(text_11, $1);
					classes_1 = $.set_class(dd_5, 1, '', null, classes_1, { 'expires-soon': $2 });
					$.set_text(text_12, `${$3 ?? ''} `);
				},
				[
					() => formatDate($.get(results).data.created),
					() => formatDate($.get(results).data.updated),
					() => $.get(results).data.expires && new Date($.get(results).data.expires) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
					() => formatDate($.get(results).data.expires)
				]
			);

			$.delegated('click', button_2, copyResults);
			$.append($$anchor, div_8);
		};

		$.if(node_4, ($$render) => {
			if ($.get(results)) $$render(consequent_9);
		});
	}

	var node_12 = $.sibling(node_4, 2);

	{
		var consequent_10 = ($$anchor) => {
			var div_22 = root_12();
			var div_23 = $.child(div_22);
			var div_24 = $.child(div_23);
			var node_13 = $.child(div_24);

			Icon(node_13, { name: 'alert-triangle', size: 'md' });

			var div_25 = $.sibling(node_13, 2);
			var p_4 = $.sibling($.child(div_25), 2);
			var text_21 = $.only_child(p_4, true);

			$.next(2);
			$.reset(div_25);
			$.reset(div_24);
			$.reset(div_23);
			$.reset(div_22);
			$.template_effect(() => $.set_text(text_21, $.get(error)));
			$.append($$anchor, div_22);
		};

		$.if(node_12, ($$render) => {
			if ($.get(error)) $$render(consequent_10);
		});
	}

	$.next(2);
	$.reset(div);
	$.template_effect(($0) => button_1.disabled = $0, [() => $.get(loading) || !$.get(domain).trim()]);

	$.delegated('change', input, () => {
		clearExampleSelection();

		if ($.get(domain).trim()) lookupDomain();
	});

	$.bind_value(input, () => $.get(domain), ($$value) => $.set(domain, $$value));
	$.delegated('click', button_1, lookupDomain);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'change']);