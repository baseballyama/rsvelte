import * as $ from 'svelte/internal/server';
import Icon from '$lib/components/global/Icon.svelte';
import { tooltip } from '$lib/actions/tooltip';
import { useClipboard } from '$lib/composables';

export default function NAPTRBuilder($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let domain = '';
		let order = '100';
		let preference = '10';
		let flags = 'U';
		let service = 'E2U+sip';
		let regexp = '!^.*$!sip:info@example.com!';
		let replacement = '.';
		const clipboard = useClipboard();
		let showExamples = false;

		const flagOptions = [
			{
				value: 'U',
				label: 'U - Terminal rule (URI)',
				description: 'The Rule is terminal and the result is a URI'
			},

			{
				value: 'S',
				label: 'S - Terminal rule (SRV)',
				description: 'The Rule is terminal and the result is for SRV lookup'
			},

			{
				value: 'A',
				label: 'A - Terminal rule (Address)',
				description: 'The Rule is terminal and the result is an address record'
			},

			{
				value: 'P',
				label: 'P - Protocol specific',
				description: 'Protocol-specific flags'
			},

			{
				value: '',
				label: 'Empty - Non-terminal',
				description: 'The Rule is not terminal (continue processing)'
			}
		];

		const serviceExamples = [
			{
				value: 'E2U+sip',
				label: 'SIP Service',
				description: 'Session Initiation Protocol'
			},

			{
				value: 'E2U+email',
				label: 'Email Service',
				description: 'Electronic mail service'
			},

			{
				value: 'E2U+web+http',
				label: 'HTTP Web Service',
				description: 'Web service over HTTP'
			},

			{
				value: 'E2U+web+https',
				label: 'HTTPS Web Service',
				description: 'Secure web service over HTTPS'
			},

			{
				value: 'E2U+tel',
				label: 'Telephone Service',
				description: 'Telephone number mapping'
			},

			{
				value: 'E2U+fax',
				label: 'Fax Service',
				description: 'Facsimile service'
			},

			{
				value: 'E2U+h323',
				label: 'H.323 Service',
				description: 'H.323 multimedia protocol'
			},

			{
				value: 'E2U+im',
				label: 'Instant Messaging',
				description: 'Instant messaging service'
			}
		];

		let naptrRecord = $.derived(() => {
			if (!domain.trim()) return '';

			const cleanDomain = domain.trim().replace(/\.$/, '');

			return `${cleanDomain}. IN NAPTR ${order} ${preference} "${flags}" "${service}" "${regexp}" ${replacement}`;
		});

		let isValid = $.derived(() => {
			return domain.trim() !== '' && order !== '' && preference !== '' && parseInt(order) >= 0 && parseInt(order) <= 65535 && parseInt(preference) >= 0 && parseInt(preference) <= 65535;
		});

		let warnings = $.derived(() => {
			const warns = [];

			if (flags === 'U' && !regexp.includes('!')) {
				warns.push('URI flag requires a valid substitution expression with delimiters');
			}

			if (flags === 'S' && replacement === '.') {
				warns.push('SRV flag typically requires a replacement domain, not "."');
			}

			if (flags === '' && replacement === '.') {
				warns.push('Non-terminal rules should have a replacement domain for continued processing');
			}

			if (regexp && !regexp.match(/^!.*!.*!$/)) {
				warns.push('Regular expressions should follow the format: !pattern!replacement!');
			}

			if (parseInt(order) === parseInt(preference)) {
				warns.push('Order and Preference should typically be different values');
			}

			return warns;
		});

		function copyToClipboard() {
			clipboard.copy(naptrRecord(), 'copy');
		}

		function downloadRecord() {
			const blob = new Blob([naptrRecord()], { type: 'text/plain' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');

			a.href = url;
			a.download = `${domain.replace(/\.$/, '') || 'naptr'}-record.txt`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			clipboard.copy('', 'download');
		}

		function loadExample(exampleType) {
			switch (exampleType) {
				case 'sip':
					domain = 'example.com';
					order = '100';
					preference = '10';
					flags = 'U';
					service = 'E2U+sip';
					regexp = '!^.*$!sip:info@example.com!';
					replacement = '.';
					break;

				case 'email':
					domain = 'example.com';
					order = '100';
					preference = '10';
					flags = 'U';
					service = 'E2U+email';
					regexp = '!^.*$!mailto:admin@example.com!';
					replacement = '.';
					break;

				case 'web':
					domain = 'example.com';
					order = '100';
					preference = '10';
					flags = 'U';
					service = 'E2U+web+https';
					regexp = '!^.*$!https://www.example.com/!';
					replacement = '.';
					break;

				case 'srv':
					domain = 'example.com';
					order = '100';
					preference = '10';
					flags = 'S';
					service = 'SIP+D2T';
					regexp = '';
					replacement = '_sip._tcp.example.com.';
					break;
			}
		}

		$$renderer.push(`<div class="container svelte-dvsla4"><div class="card svelte-dvsla4"><div class="card-header svelte-dvsla4"><h1 class="svelte-dvsla4">NAPTR Record Builder</h1> <p class="svelte-dvsla4">Construct NAPTR (Naming Authority Pointer) records for dynamic delegation and service mapping</p></div> <div class="content svelte-dvsla4"><div class="card examples-card svelte-dvsla4"><details${$.attr('open', showExamples, true)} class="svelte-dvsla4"><summary class="examples-summary svelte-dvsla4">`);
		Icon($$renderer, { name: 'lightbulb', size: 'sm' });
		$$renderer.push(`<!----> Quick Examples <span class="chevron svelte-dvsla4">`);
		Icon($$renderer, { name: 'chevron-down', size: 'sm' });
		$$renderer.push(`<!----></span></summary> <div class="examples-grid svelte-dvsla4"><button class="example-btn svelte-dvsla4">SIP Service</button> <button class="example-btn svelte-dvsla4">Email Service</button> <button class="example-btn svelte-dvsla4">Web Service</button> <button class="example-btn svelte-dvsla4">SRV Delegation</button></div></details></div> <div class="main-grid svelte-dvsla4"><div class="input-section svelte-dvsla4"><div class="input-group svelte-dvsla4"><label for="domain" class="svelte-dvsla4">Domain Name *</label> <input id="domain" type="text"${$.attr('value', domain)} placeholder="example.com" class="svelte-dvsla4"/> <p class="description svelte-dvsla4">The domain name for this NAPTR record</p></div> <div class="order-grid svelte-dvsla4"><div class="input-group svelte-dvsla4"><label for="order" class="svelte-dvsla4">Order *</label> <input id="order" type="number"${$.attr('value', order)} min="0" max="65535" class="svelte-dvsla4"/> <p class="description svelte-dvsla4">Processing order (0-65535)</p></div> <div class="input-group svelte-dvsla4"><label for="preference" class="svelte-dvsla4">Preference *</label> <input id="preference" type="number"${$.attr('value', preference)} min="0" max="65535" class="svelte-dvsla4"/> <p class="description svelte-dvsla4">Preference within order (0-65535)</p></div></div> <div class="input-group svelte-dvsla4"><label for="flags" class="svelte-dvsla4">Flags</label> `);

		$$renderer.select(
			{ id: 'flags', value: flags, class: '' },
			($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(flagOptions);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let option = each_array[$$index];

					$$renderer.option({ value: option.value }, ($$renderer) => {
						$$renderer.push(`${$.escape(option.label)}`);
					});
				}

				$$renderer.push(`<!--]-->`);
			},
			'svelte-dvsla4'
		);

		$$renderer.push(` <p class="description svelte-dvsla4">${$.escape(flagOptions.find((opt) => opt.value === flags)?.description || 'Select flag type')}</p></div> <div class="input-group svelte-dvsla4"><label for="service" class="svelte-dvsla4">Service</label> <input id="service" type="text"${$.attr('value', service)} placeholder="E2U+sip" class="svelte-dvsla4"/> <details class="service-examples svelte-dvsla4"><summary class="svelte-dvsla4">Show service examples</summary> <div class="service-list svelte-dvsla4"><!--[-->`);

		const each_array_1 = $.ensure_array_like(serviceExamples);

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let example = each_array_1[$$index_1];

			$$renderer.push(`<button class="service-item svelte-dvsla4"><strong class="svelte-dvsla4">${$.escape(example.value)}</strong> - ${$.escape(example.description)}</button>`);
		}

		$$renderer.push(`<!--]--></div></details></div> <div class="input-group svelte-dvsla4"><label for="regexp" class="svelte-dvsla4">Regular Expression</label> <input id="regexp" type="text"${$.attr('value', regexp)} placeholder="!^.*$!sip:info@example.com!" class="mono svelte-dvsla4"/> <p class="description svelte-dvsla4">Substitution expression (format: !pattern!replacement!)</p></div> <div class="input-group svelte-dvsla4"><label for="replacement" class="svelte-dvsla4">Replacement</label> <input id="replacement" type="text"${$.attr('value', replacement)} placeholder="." class="svelte-dvsla4"/> <p class="description svelte-dvsla4">Domain name for next lookup, or "." for terminal rules</p></div></div> <div class="output-section svelte-dvsla4"><div class="card svelte-dvsla4"><h3 class="section-title svelte-dvsla4">Generated NAPTR Record</h3> <div class="code-block svelte-dvsla4">`);

		if (isValid()) {
			$$renderer.push(`<!--[0--><code class="svelte-dvsla4">${$.escape(naptrRecord())}</code>`);
		} else {
			$$renderer.push(`<!--[-1--><p class="placeholder svelte-dvsla4">Fill in the required fields to generate the NAPTR record</p>`);
		}

		$$renderer.push(`<!--]--></div></div> `);

		if (warnings().length > 0) {
			$$renderer.push(`<!--[0--><div class="message warning svelte-dvsla4">`);
			Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
			$$renderer.push(`<!----> <div><h4 class="svelte-dvsla4">Configuration Warnings</h4> <ul class="svelte-dvsla4"><!--[-->`);

			const each_array_2 = $.ensure_array_like(warnings());

			for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
				let warning = each_array_2[index];

				$$renderer.push(`<li class="svelte-dvsla4">${$.escape(warning)}</li>`);
			}

			$$renderer.push(`<!--]--></ul></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (isValid()) {
			$$renderer.push(`<!--[0--><div class="actions svelte-dvsla4"><button${$.attr_class('btn btn-primary svelte-dvsla4', void 0, { 'success': clipboard.isCopied('copy') })}>`);

			Icon($$renderer, {
				name: clipboard.isCopied('copy') ? 'check' : 'copy',
				size: 'sm'
			});

			$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('copy') ? 'Copied!' : 'Copy Record')}</button> <button${$.attr_class('btn btn-success svelte-dvsla4', void 0, { 'success': clipboard.isCopied('download') })}>`);

			Icon($$renderer, {
				name: clipboard.isCopied('download') ? 'check' : 'download',
				size: 'sm'
			});

			$$renderer.push(`<!----> ${$.escape(clipboard.isCopied('download') ? 'Downloaded!' : 'Download')}</button></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div> <div class="info-section svelte-dvsla4"><div class="card info-card svelte-dvsla4"><h3 class="section-title svelte-dvsla4">About NAPTR Records</h3> <p class="svelte-dvsla4">NAPTR (Naming Authority Pointer) records provide a way to map domain names to URIs or other domain names
            through regular expression-based rewriting. They're commonly used in telecommunications for ENUM (E.164
            Number Mapping) and SIP services, allowing dynamic delegation and service discovery.</p></div> <div class="info-grid svelte-dvsla4"><div class="card info-card svelte-dvsla4"><h4 class="svelte-dvsla4">Field Descriptions</h4> <dl class="field-list svelte-dvsla4"><dt class="svelte-dvsla4">Order:</dt> <dd class="svelte-dvsla4">Processing order (lower values first)</dd> <dt class="svelte-dvsla4">Preference:</dt> <dd class="svelte-dvsla4">Preference within same order</dd> <dt class="svelte-dvsla4">Flags:</dt> <dd class="svelte-dvsla4">Control processing behavior</dd> <dt class="svelte-dvsla4">Service:</dt> <dd class="svelte-dvsla4">Service identifier or protocol</dd> <dt class="svelte-dvsla4">RegExp:</dt> <dd class="svelte-dvsla4">Pattern matching and substitution</dd> <dt class="svelte-dvsla4">Replacement:</dt> <dd class="svelte-dvsla4">Next domain to query</dd></dl></div> <div class="card info-card svelte-dvsla4"><h4 class="svelte-dvsla4">Common Use Cases</h4> <ul class="use-case-list svelte-dvsla4"><li class="svelte-dvsla4">ENUM telephone number mapping</li> <li class="svelte-dvsla4">SIP service discovery</li> <li class="svelte-dvsla4">Dynamic delegation</li> <li class="svelte-dvsla4">Protocol mapping</li> <li class="svelte-dvsla4">Service location</li></ul></div></div></div></div></div></div>`);
	});
}