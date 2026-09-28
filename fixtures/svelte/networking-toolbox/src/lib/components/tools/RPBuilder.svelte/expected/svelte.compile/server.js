import * as $ from 'svelte/internal/server';
import { Copy, Download, Check, Mail } from 'lucide-svelte';
import { tooltip } from '$lib/actions/tooltip.js';
import { useClipboard } from '$lib/composables';

export default function RPBuilder($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let domain = '';
		let mailboxDname = 'admin.example.com.';
		let txtDname = 'admin-info.example.com.';
		let showExamples = false;
		const clipboard = useClipboard();

		const roleExamples = [
			{
				name: 'System Administrator',
				mbox: 'admin.example.com.',
				txt: 'admin-info.example.com.',
				description: 'Primary system administrator contact'
			},

			{
				name: 'Webmaster',
				mbox: 'webmaster.example.com.',
				txt: 'webmaster-info.example.com.',
				description: 'Website administrator contact'
			},

			{
				name: 'Security Contact',
				mbox: 'security.example.com.',
				txt: 'security-info.example.com.',
				description: 'Security incident response contact'
			},

			{
				name: 'DNS Administrator',
				mbox: 'dns-admin.example.com.',
				txt: 'dns-admin-info.example.com.',
				description: 'DNS zone administrator'
			}
		];

		let rpRecord = $.derived(() => {
			if (!domain.trim()) return '';

			const cleanDomain = domain.trim().replace(/\.$/, '');
			const mbox = mailboxDname.trim() || '.';
			const txt = txtDname.trim() || '.';

			return `${cleanDomain}. IN RP ${mbox} ${txt}`;
		});

		let txtRecord = $.derived(() => {
			if (!txtDname.trim() || txtDname === '.') return '';

			const txt = txtDname.trim().replace(/\.$/, '');

			return `${txt}. IN TXT "Administrative contact for ${domain.trim().replace(/\.$/, '') || 'this domain'}. Please use the mailbox specified in the RP record for contact."`;
		});

		let isValid = $.derived(() => {
			return domain.trim() !== '' && mailboxDname.trim() !== '';
		});

		let warnings = $.derived(() => {
			const warns = [];

			if (mailboxDname && !mailboxDname.includes('.')) {
				warns.push('Mailbox domain name should be a fully qualified domain name');
			}

			if (txtDname && txtDname !== '.' && !txtDname.includes('.')) {
				warns.push('TXT domain name should be a fully qualified domain name or "."');
			}

			if (mailboxDname && mailboxDname.endsWith('.')) {
				// This is correct
			} else if (mailboxDname && mailboxDname !== '.') {
				warns.push('Domain names in RP records should end with a dot (.) for absolute names');
			}

			if (txtDname && txtDname.endsWith('.')) {
				// This is correct
			} else if (txtDname && txtDname !== '.') {
				warns.push('TXT domain name should end with a dot (.) for absolute names');
			}

			return warns;
		});

		let info = $.derived(() => {
			const infos = [];

			if (mailboxDname === '.') {
				infos.push('Using "." for mailbox means no mailbox is specified');
			}

			if (txtDname === '.') {
				infos.push('Using "." for TXT means no additional text information is provided');
			}

			if (txtDname && txtDname !== '.') {
				infos.push(`Remember to create the TXT record at ${txtDname} with contact information`);
			}

			return infos;
		});

		function copyToClipboard() {
			let content = rpRecord();

			if (txtRecord()) {
				content += '\n\n; Suggested TXT record:\n' + txtRecord();
			}

			clipboard.copy(content, 'copy');
		}

		function downloadRecord() {
			let content = rpRecord();

			if (txtRecord()) {
				content += '\n\n; Suggested TXT record:\n' + txtRecord();
			}

			content += '\n\n; RP Record Format:\n; domain IN RP mailbox-dname txt-dname\n; mailbox-dname: domain name that encodes the email address\n; txt-dname: domain name where TXT record with contact info can be found';

			const blob = new Blob([content], { type: 'text/plain' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');

			a.href = url;
			a.download = `${domain.replace(/\.$/, '') || 'rp'}-record.txt`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			clipboard.copy('downloaded', 'download');
		}

		function loadRoleExample(role) {
			mailboxDname = role.mbox;
			txtDname = role.txt;

			if (!domain) domain = 'example.com';
		}

		function emailToDname(email) {
			if (!email.includes('@')) return email;

			const [local, domain] = email.split('@');

			return `${local.replace(/\./g, '\\.')}.${domain}.`;
		}

		function dnameToEmail(dname) {
			if (!dname.includes('.') || dname === '.') return '';

			const parts = dname.replace(/\.$/, '').split('.');

			if (parts.length < 2) return '';

			const domain = parts.slice(-2).join('.');
			const local = parts.slice(0, -2).join('.').replace(/\\\./g, '.');

			return `${local}@${domain}`;
		}

		let emailInput = '';

		function convertEmailToDname() {
			if (emailInput.trim()) {
				mailboxDname = emailToDname(emailInput.trim());
				emailInput = '';
			}
		}

		$$renderer.push(`<div class="rp-builder"><div class="card svelte-101tphp"><div class="card-header svelte-101tphp"><h1 class="svelte-101tphp">RP Record Builder</h1> <p class="svelte-101tphp">Create RP (Responsible Person) records to specify administrative contacts for your domains</p></div> <div class="card-content"><details${$.attr('open', showExamples, true)} class="examples-section svelte-101tphp"><summary class="svelte-101tphp"><span>Common Role Examples</span> <svg class="chevron svelte-101tphp" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="6,9 12,15 18,9"></polyline></svg></summary> <div class="examples-grid svelte-101tphp"><!--[-->`);

		const each_array = $.ensure_array_like(roleExamples);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let role = each_array[$$index];

			$$renderer.push(`<button class="example-btn svelte-101tphp"><div class="example-name svelte-101tphp">${$.escape(role.name)}</div> <div class="example-desc svelte-101tphp">${$.escape(role.description)}</div></button>`);
		}

		$$renderer.push(`<!--]--></div></details> <div class="form-grid svelte-101tphp"><div class="input-section svelte-101tphp"><div class="field-group svelte-101tphp"><label for="domain" class="svelte-101tphp">Domain Name *</label> <input id="domain" type="text"${$.attr('value', domain)} placeholder="example.com" class="svelte-101tphp"/> <small class="svelte-101tphp">The domain name for this RP record</small></div> <div class="converter-section svelte-101tphp"><h4 class="svelte-101tphp">Email to Domain Name Converter</h4> <div class="converter-input svelte-101tphp"><input type="email"${$.attr('value', emailInput)} placeholder="admin@example.com" class="svelte-101tphp"/> <button class="btn-success svelte-101tphp"${$.attr('disabled', !emailInput.trim(), true)}>Convert</button></div> <small class="svelte-101tphp">Enter an email to automatically convert to domain name format</small></div> <div class="field-group svelte-101tphp"><label for="mailbox" class="svelte-101tphp">Mailbox Domain Name *</label> <input id="mailbox" type="text"${$.attr('value', mailboxDname)} placeholder="admin.example.com." class="mono-input svelte-101tphp"/> <small class="svelte-101tphp">Domain name encoding the email address (use "." for no contact)</small> `);

		if (mailboxDname && mailboxDname !== '.') {
			$$renderer.push(`<!--[0--><div class="email-preview svelte-101tphp">`);
			Mail($$renderer, { size: '12' });
			$$renderer.push(`<!----> Email: ${$.escape(dnameToEmail(mailboxDname) || 'Invalid format')}</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <div class="field-group svelte-101tphp"><label for="txt" class="svelte-101tphp">TXT Domain Name</label> <input id="txt" type="text"${$.attr('value', txtDname)} placeholder="admin-info.example.com." class="mono-input svelte-101tphp"/> <small class="svelte-101tphp">Domain name where TXT record with contact info can be found (use "." for none)</small></div></div> <div class="output-section svelte-101tphp"><div class="output-group svelte-101tphp"><h3>Generated RP Record</h3> <div class="code-output svelte-101tphp">`);

		if (isValid()) {
			$$renderer.push(`<!--[0--><pre class="svelte-101tphp">${$.escape(rpRecord())}</pre>`);
		} else {
			$$renderer.push(`<!--[-1--><p class="placeholder-text svelte-101tphp">Fill in the required fields to generate the RP record</p>`);
		}

		$$renderer.push(`<!--]--></div></div> `);

		if (txtRecord()) {
			$$renderer.push(`<!--[0--><div class="output-group svelte-101tphp"><h3>Suggested TXT Record</h3> <div class="code-output txt-output svelte-101tphp"><pre class="svelte-101tphp">${$.escape(txtRecord())}</pre> <small class="svelte-101tphp">This TXT record should be created at the specified domain</small></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (info().length > 0) {
			$$renderer.push(`<!--[0--><div class="alert alert-info svelte-101tphp"><h4 class="svelte-101tphp">Information</h4> <ul class="svelte-101tphp"><!--[-->`);

			const each_array_1 = $.ensure_array_like(info());

			for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
				let infoItem = each_array_1[index];

				$$renderer.push(`<li class="svelte-101tphp">${$.escape(infoItem)}</li>`);
			}

			$$renderer.push(`<!--]--></ul></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (warnings().length > 0) {
			$$renderer.push(`<!--[0--><div class="alert alert-warning svelte-101tphp"><h4 class="svelte-101tphp">Configuration Warnings</h4> <ul class="svelte-101tphp"><!--[-->`);

			const each_array_2 = $.ensure_array_like(warnings());

			for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
				let warning = each_array_2[index];

				$$renderer.push(`<li class="svelte-101tphp">${$.escape(warning)}</li>`);
			}

			$$renderer.push(`<!--]--></ul></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (isValid()) {
			$$renderer.push(`<!--[0--><div class="button-group svelte-101tphp"><button${$.attr_class('btn-secondary svelte-101tphp', void 0, { 'success': clipboard.isCopied('copy') })}${$.attr_style(`transform: ${clipboard.isCopied('copy') ? 'scale(1.05)' : 'scale(1)'}`)}>`);

			if (clipboard.isCopied('copy')) {
				$$renderer.push('<!--[0-->');
				Check($$renderer, { size: '16' });
				$$renderer.push(`<!----> Copied!`);
			} else {
				$$renderer.push('<!--[-1-->');
				Copy($$renderer, { size: '16' });
				$$renderer.push(`<!----> Copy Records`);
			}

			$$renderer.push(`<!--]--></button> <button${$.attr_class('btn-primary svelte-101tphp', void 0, { 'success': clipboard.isCopied('download') })}${$.attr_style(`transform: ${clipboard.isCopied('download') ? 'scale(1.05)' : 'scale(1)'}`)}>`);

			if (clipboard.isCopied('download')) {
				$$renderer.push('<!--[0-->');
				Check($$renderer, { size: '16' });
				$$renderer.push(`<!----> Downloaded!`);
			} else {
				$$renderer.push('<!--[-1-->');
				Download($$renderer, { size: '16' });
				$$renderer.push(`<!----> Download`);
			}

			$$renderer.push(`<!--]--></button></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div> <div class="info-section svelte-101tphp"><div class="card info-card svelte-101tphp"><h4 class="svelte-101tphp">About RP Records</h4> <p class="svelte-101tphp">RP (Responsible Person) records identify the responsible person for a domain or host. They specify both a
            mailbox (encoded as a domain name) and optionally point to a TXT record with additional contact information.
            This allows automated discovery of administrative contacts.</p></div> <div class="info-grid svelte-101tphp"><div class="card svelte-101tphp"><h4 class="svelte-101tphp">Email Encoding</h4> <div class="encoding-examples svelte-101tphp"><p class="svelte-101tphp">Email addresses are encoded as domain names:</p> <div class="code-example svelte-101tphp"><div class="svelte-101tphp"><strong>Email:</strong> admin@example.com</div> <div class="svelte-101tphp"><strong>Encoded:</strong> admin.example.com.</div></div> <div class="code-example svelte-101tphp"><div class="svelte-101tphp"><strong>Email:</strong> user.name@example.com</div> <div class="svelte-101tphp"><strong>Encoded:</strong> user\\.name.example.com.</div></div> <small class="svelte-101tphp">Dots in the local part are escaped with backslashes</small></div></div> <div class="card svelte-101tphp"><h4 class="svelte-101tphp">Common Use Cases</h4> <ul class="use-cases svelte-101tphp"><li class="svelte-101tphp">Zone administrator contact</li> <li class="svelte-101tphp">Server administrator contact</li> <li class="svelte-101tphp">Security incident response</li> <li class="svelte-101tphp">Automated contact discovery</li> <li class="svelte-101tphp">Compliance requirements</li></ul></div></div> <div class="card best-practices-card svelte-101tphp"><h4 class="svelte-101tphp">Best Practices</h4> <ul class="best-practices svelte-101tphp"><li class="svelte-101tphp">Always use fully qualified domain names ending with a dot</li> <li class="svelte-101tphp">Create corresponding TXT records with detailed contact information</li> <li class="svelte-101tphp">Keep contact information up to date and monitored</li> <li class="svelte-101tphp">Consider creating role-based contacts rather than personal ones</li></ul></div></div></div></div></div>`);
	});
}