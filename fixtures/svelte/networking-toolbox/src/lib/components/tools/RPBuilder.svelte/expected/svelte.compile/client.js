import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Copy, Download, Check, Mail } from 'lucide-svelte';
import { tooltip } from '$lib/actions/tooltip.js';
import { useClipboard } from '$lib/composables';

var root = $.from_html(`<button class="example-btn svelte-101tphp"><div class="example-name svelte-101tphp"> </div> <div class="example-desc svelte-101tphp"> </div></button>`);
var root_1 = $.from_html(`<div class="email-preview svelte-101tphp"><!> </div>`);
var root_2 = $.from_html(`<pre class="svelte-101tphp"> </pre>`);
var root_3 = $.from_html(`<p class="placeholder-text svelte-101tphp">Fill in the required fields to generate the RP record</p>`);
var root_4 = $.from_html(`<div class="output-group svelte-101tphp"><h3>Suggested TXT Record</h3> <div class="code-output txt-output svelte-101tphp"><pre class="svelte-101tphp"> </pre> <small class="svelte-101tphp">This TXT record should be created at the specified domain</small></div></div>`);
var root_5 = $.from_html(`<li class="svelte-101tphp"> </li>`);
var root_6 = $.from_html(`<div class="alert alert-info svelte-101tphp"><h4 class="svelte-101tphp">Information</h4> <ul class="svelte-101tphp"></ul></div>`);
var root_7 = $.from_html(`<div class="alert alert-warning svelte-101tphp"><h4 class="svelte-101tphp">Configuration Warnings</h4> <ul class="svelte-101tphp"></ul></div>`);
var root_8 = $.from_html(`<!> Copied!`, 1);
var root_9 = $.from_html(`<!> Copy Records`, 1);
var root_10 = $.from_html(`<!> Downloaded!`, 1);
var root_11 = $.from_html(`<!> Download`, 1);
var root_12 = $.from_html(`<div class="button-group svelte-101tphp"><button><!></button> <button><!></button></div>`);

var root_13 = $.from_html(`<div class="rp-builder"><div class="card svelte-101tphp"><div class="card-header svelte-101tphp"><h1 class="svelte-101tphp">RP Record Builder</h1> <p class="svelte-101tphp">Create RP (Responsible Person) records to specify administrative contacts for your domains</p></div> <div class="card-content"><details class="examples-section svelte-101tphp"><summary class="svelte-101tphp"><span>Common Role Examples</span> <svg class="chevron svelte-101tphp" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="6,9 12,15 18,9"></polyline></svg></summary> <div class="examples-grid svelte-101tphp"></div></details> <div class="form-grid svelte-101tphp"><div class="input-section svelte-101tphp"><div class="field-group svelte-101tphp"><label for="domain" class="svelte-101tphp">Domain Name *</label> <input id="domain" type="text" placeholder="example.com" class="svelte-101tphp"/> <small class="svelte-101tphp">The domain name for this RP record</small></div> <div class="converter-section svelte-101tphp"><h4 class="svelte-101tphp">Email to Domain Name Converter</h4> <div class="converter-input svelte-101tphp"><input type="email" placeholder="admin@example.com" class="svelte-101tphp"/> <button class="btn-success svelte-101tphp">Convert</button></div> <small class="svelte-101tphp">Enter an email to automatically convert to domain name format</small></div> <div class="field-group svelte-101tphp"><label for="mailbox" class="svelte-101tphp">Mailbox Domain Name *</label> <input id="mailbox" type="text" placeholder="admin.example.com." class="mono-input svelte-101tphp"/> <small class="svelte-101tphp">Domain name encoding the email address (use "." for no contact)</small> <!></div> <div class="field-group svelte-101tphp"><label for="txt" class="svelte-101tphp">TXT Domain Name</label> <input id="txt" type="text" placeholder="admin-info.example.com." class="mono-input svelte-101tphp"/> <small class="svelte-101tphp">Domain name where TXT record with contact info can be found (use "." for none)</small></div></div> <div class="output-section svelte-101tphp"><div class="output-group svelte-101tphp"><h3>Generated RP Record</h3> <div class="code-output svelte-101tphp"><!></div></div> <!> <!> <!> <!></div></div> <div class="info-section svelte-101tphp"><div class="card info-card svelte-101tphp"><h4 class="svelte-101tphp">About RP Records</h4> <p class="svelte-101tphp">RP (Responsible Person) records identify the responsible person for a domain or host. They specify both a
            mailbox (encoded as a domain name) and optionally point to a TXT record with additional contact information.
            This allows automated discovery of administrative contacts.</p></div> <div class="info-grid svelte-101tphp"><div class="card svelte-101tphp"><h4 class="svelte-101tphp">Email Encoding</h4> <div class="encoding-examples svelte-101tphp"><p class="svelte-101tphp">Email addresses are encoded as domain names:</p> <div class="code-example svelte-101tphp"><div class="svelte-101tphp"><strong>Email:</strong> admin@example.com</div> <div class="svelte-101tphp"><strong>Encoded:</strong> admin.example.com.</div></div> <div class="code-example svelte-101tphp"><div class="svelte-101tphp"><strong>Email:</strong> user.name@example.com</div> <div class="svelte-101tphp"><strong>Encoded:</strong> user\\.name.example.com.</div></div> <small class="svelte-101tphp">Dots in the local part are escaped with backslashes</small></div></div> <div class="card svelte-101tphp"><h4 class="svelte-101tphp">Common Use Cases</h4> <ul class="use-cases svelte-101tphp"><li class="svelte-101tphp">Zone administrator contact</li> <li class="svelte-101tphp">Server administrator contact</li> <li class="svelte-101tphp">Security incident response</li> <li class="svelte-101tphp">Automated contact discovery</li> <li class="svelte-101tphp">Compliance requirements</li></ul></div></div> <div class="card best-practices-card svelte-101tphp"><h4 class="svelte-101tphp">Best Practices</h4> <ul class="best-practices svelte-101tphp"><li class="svelte-101tphp">Always use fully qualified domain names ending with a dot</li> <li class="svelte-101tphp">Create corresponding TXT records with detailed contact information</li> <li class="svelte-101tphp">Keep contact information up to date and monitored</li> <li class="svelte-101tphp">Consider creating role-based contacts rather than personal ones</li></ul></div></div></div></div></div>`);

export default function RPBuilder($$anchor, $$props) {
	$.push($$props, true);

	let domain = $.state('');
	let mailboxDname = $.state('admin.example.com.');
	let txtDname = $.state('admin-info.example.com.');
	let showExamples = $.state(false);
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
		if (!$.get(domain).trim()) return '';

		const cleanDomain = $.get(domain).trim().replace(/\.$/, '');
		const mbox = $.get(mailboxDname).trim() || '.';
		const txt = $.get(txtDname).trim() || '.';

		return `${cleanDomain}. IN RP ${mbox} ${txt}`;
	});

	let txtRecord = $.derived(() => {
		if (!$.get(txtDname).trim() || $.get(txtDname) === '.') return '';

		const txt = $.get(txtDname).trim().replace(/\.$/, '');

		return `${txt}. IN TXT "Administrative contact for ${$.get(domain).trim().replace(/\.$/, '') || 'this domain'}. Please use the mailbox specified in the RP record for contact."`;
	});

	let isValid = $.derived(() => {
		return $.get(domain).trim() !== '' && $.get(mailboxDname).trim() !== '';
	});

	let warnings = $.derived(() => {
		const warns = [];

		if ($.get(mailboxDname) && !$.get(mailboxDname).includes('.')) {
			warns.push('Mailbox domain name should be a fully qualified domain name');
		}

		if ($.get(txtDname) && $.get(txtDname) !== '.' && !$.get(txtDname).includes('.')) {
			warns.push('TXT domain name should be a fully qualified domain name or "."');
		}

		if ($.get(mailboxDname) && $.get(mailboxDname).endsWith('.')) {
			// This is correct
		} else if ($.get(mailboxDname) && $.get(mailboxDname) !== '.') {
			warns.push('Domain names in RP records should end with a dot (.) for absolute names');
		}

		if ($.get(txtDname) && $.get(txtDname).endsWith('.')) {
			// This is correct
		} else if ($.get(txtDname) && $.get(txtDname) !== '.') {
			warns.push('TXT domain name should end with a dot (.) for absolute names');
		}

		return warns;
	});

	let info = $.derived(() => {
		const infos = [];

		if ($.get(mailboxDname) === '.') {
			infos.push('Using "." for mailbox means no mailbox is specified');
		}

		if ($.get(txtDname) === '.') {
			infos.push('Using "." for TXT means no additional text information is provided');
		}

		if ($.get(txtDname) && $.get(txtDname) !== '.') {
			infos.push(`Remember to create the TXT record at ${$.get(txtDname)} with contact information`);
		}

		return infos;
	});

	function copyToClipboard() {
		let content = $.get(rpRecord);

		if ($.get(txtRecord)) {
			content += '\n\n; Suggested TXT record:\n' + $.get(txtRecord);
		}

		clipboard.copy(content, 'copy');
	}

	function downloadRecord() {
		let content = $.get(rpRecord);

		if ($.get(txtRecord)) {
			content += '\n\n; Suggested TXT record:\n' + $.get(txtRecord);
		}

		content += '\n\n; RP Record Format:\n; domain IN RP mailbox-dname txt-dname\n; mailbox-dname: domain name that encodes the email address\n; txt-dname: domain name where TXT record with contact info can be found';

		const blob = new Blob([content], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');

		a.href = url;
		a.download = `${$.get(domain).replace(/\.$/, '') || 'rp'}-record.txt`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		clipboard.copy('downloaded', 'download');
	}

	function loadRoleExample(role) {
		$.set(mailboxDname, role.mbox, true);
		$.set(txtDname, role.txt, true);

		if (!$.get(domain)) $.set(domain, 'example.com');
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

	let emailInput = $.state('');

	function convertEmailToDname() {
		if ($.get(emailInput).trim()) {
			$.set(mailboxDname, emailToDname($.get(emailInput).trim()), true);
			$.set(emailInput, '');
		}
	}

	var div = root_13();
	var div_1 = $.child(div);
	var div_2 = $.sibling($.child(div_1), 2);
	var details = $.child(div_2);
	var div_3 = $.sibling($.child(details), 2);

	$.each(div_3, 21, () => roleExamples, (role) => role.name, ($$anchor, role) => {
		var button = root();
		var div_4 = $.child(button);
		var text = $.only_child(div_4, true);
		var div_5 = $.sibling(div_4, 2);
		var text_1 = $.only_child(div_5, true);

		$.reset(button);

		$.template_effect(() => {
			$.set_text(text, $.get(role).name);
			$.set_text(text_1, $.get(role).description);
		});

		$.delegated('click', button, () => loadRoleExample($.get(role)));
		$.append($$anchor, button);
	});

	$.reset(div_3);
	$.reset(details);

	var div_6 = $.sibling(details, 2);
	var div_7 = $.child(div_6);
	var div_8 = $.child(div_7);
	var label = $.child(div_8);

	$.action(label, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'The domain name for which this RP record will be created');

	var input = $.sibling(label, 2);

	$.remove_input_defaults(input);
	$.next(2);
	$.reset(div_8);

	var div_9 = $.sibling(div_8, 2);
	var div_10 = $.sibling($.child(div_9), 2);
	var input_1 = $.child(div_10);

	$.remove_input_defaults(input_1);

	var button_1 = $.sibling(input_1, 2);

	$.reset(div_10);
	$.next(2);
	$.reset(div_9);

	var div_11 = $.sibling(div_9, 2);
	var label_1 = $.child(div_11);

	$.action(label_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => "Domain name encoding the email address. Use '.' for no contact specified.");

	var input_2 = $.sibling(label_1, 2);

	$.remove_input_defaults(input_2);

	var node = $.sibling(input_2, 4);

	{
		var consequent = ($$anchor) => {
			var div_12 = root_1();
			var node_1 = $.child(div_12);

			Mail(node_1, { size: '12' });

			var text_2 = $.sibling(node_1);

			$.reset(div_12);
			$.template_effect(($0) => $.set_text(text_2, ` Email: ${$0 ?? ''}`), [() => dnameToEmail($.get(mailboxDname)) || 'Invalid format']);
			$.append($$anchor, div_12);
		};

		$.if(node, ($$render) => {
			if ($.get(mailboxDname) && $.get(mailboxDname) !== '.') $$render(consequent);
		});
	}

	$.reset(div_11);

	var div_13 = $.sibling(div_11, 2);
	var label_2 = $.child(div_13);

	$.action(label_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => "Domain name where TXT record with additional contact information can be found. Use '.' for no additional info.");

	var input_3 = $.sibling(label_2, 2);

	$.remove_input_defaults(input_3);
	$.next(2);
	$.reset(div_13);
	$.reset(div_7);

	var div_14 = $.sibling(div_7, 2);
	var div_15 = $.child(div_14);
	var div_16 = $.sibling($.child(div_15), 2);
	var node_2 = $.child(div_16);

	{
		var consequent_1 = ($$anchor) => {
			var pre = root_2();
			var text_3 = $.only_child(pre, true);

			$.template_effect(() => $.set_text(text_3, $.get(rpRecord)));
			$.append($$anchor, pre);
		};

		var alternate = ($$anchor) => {
			var p = root_3();

			$.append($$anchor, p);
		};

		$.if(node_2, ($$render) => {
			if ($.get(isValid)) $$render(consequent_1); else $$render(alternate, -1);
		});
	}

	$.reset(div_16);
	$.reset(div_15);

	var node_3 = $.sibling(div_15, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_17 = root_4();
			var div_18 = $.sibling($.child(div_17), 2);
			var pre_1 = $.child(div_18);
			var text_4 = $.only_child(pre_1, true);

			$.next(2);
			$.reset(div_18);
			$.reset(div_17);
			$.template_effect(() => $.set_text(text_4, $.get(txtRecord)));
			$.append($$anchor, div_17);
		};

		$.if(node_3, ($$render) => {
			if ($.get(txtRecord)) $$render(consequent_2);
		});
	}

	var node_4 = $.sibling(node_3, 2);

	{
		var consequent_3 = ($$anchor) => {
			var div_19 = root_6();
			var ul = $.sibling($.child(div_19), 2);

			$.each(ul, 21, () => $.get(info), $.index, ($$anchor, infoItem) => {
				var li = root_5();
				var text_5 = $.only_child(li, true);

				$.template_effect(() => $.set_text(text_5, $.get(infoItem)));
				$.append($$anchor, li);
			});

			$.reset(ul);
			$.reset(div_19);
			$.append($$anchor, div_19);
		};

		$.if(node_4, ($$render) => {
			if ($.get(info).length > 0) $$render(consequent_3);
		});
	}

	var node_5 = $.sibling(node_4, 2);

	{
		var consequent_4 = ($$anchor) => {
			var div_20 = root_7();
			var ul_1 = $.sibling($.child(div_20), 2);

			$.each(ul_1, 21, () => $.get(warnings), $.index, ($$anchor, warning) => {
				var li_1 = root_5();
				var text_6 = $.only_child(li_1, true);

				$.template_effect(() => $.set_text(text_6, $.get(warning)));
				$.append($$anchor, li_1);
			});

			$.reset(ul_1);
			$.reset(div_20);
			$.append($$anchor, div_20);
		};

		$.if(node_5, ($$render) => {
			if ($.get(warnings).length > 0) $$render(consequent_4);
		});
	}

	var node_6 = $.sibling(node_5, 2);

	{
		var consequent_7 = ($$anchor) => {
			var div_21 = root_12();
			var button_2 = $.child(div_21);
			let classes;
			var node_7 = $.child(button_2);

			{
				var consequent_5 = ($$anchor) => {
					var fragment = root_8();
					var node_8 = $.first_child(fragment);

					Check(node_8, { size: '16' });
					$.next();
					$.append($$anchor, fragment);
				};

				var d = $.derived(() => clipboard.isCopied('copy'));

				var alternate_1 = ($$anchor) => {
					var fragment_1 = root_9();
					var node_9 = $.first_child(fragment_1);

					Copy(node_9, { size: '16' });
					$.next();
					$.append($$anchor, fragment_1);
				};

				$.if(node_7, ($$render) => {
					if ($.get(d)) $$render(consequent_5); else $$render(alternate_1, -1);
				});
			}

			$.reset(button_2);

			var button_3 = $.sibling(button_2, 2);
			let classes_1;
			var node_10 = $.child(button_3);

			{
				var consequent_6 = ($$anchor) => {
					var fragment_2 = root_10();
					var node_11 = $.first_child(fragment_2);

					Check(node_11, { size: '16' });
					$.next();
					$.append($$anchor, fragment_2);
				};

				var d_1 = $.derived(() => clipboard.isCopied('download'));

				var alternate_2 = ($$anchor) => {
					var fragment_3 = root_11();
					var node_12 = $.first_child(fragment_3);

					Download(node_12, { size: '16' });
					$.next();
					$.append($$anchor, fragment_3);
				};

				$.if(node_10, ($$render) => {
					if ($.get(d_1)) $$render(consequent_6); else $$render(alternate_2, -1);
				});
			}

			$.reset(button_3);
			$.reset(div_21);

			$.template_effect(
				($0, $1, $2, $3) => {
					classes = $.set_class(button_2, 1, 'btn-secondary svelte-101tphp', null, classes, { success: $0 });
					$.set_style(button_2, `transform: ${$1 ?? ''}`);
					classes_1 = $.set_class(button_3, 1, 'btn-primary svelte-101tphp', null, classes_1, { success: $2 });
					$.set_style(button_3, `transform: ${$3 ?? ''}`);
				},
				[
					() => clipboard.isCopied('copy'),
					() => clipboard.isCopied('copy') ? 'scale(1.05)' : 'scale(1)',
					() => clipboard.isCopied('download'),
					() => clipboard.isCopied('download') ? 'scale(1.05)' : 'scale(1)'
				]
			);

			$.delegated('click', button_2, copyToClipboard);
			$.delegated('click', button_3, downloadRecord);
			$.append($$anchor, div_21);
		};

		$.if(node_6, ($$render) => {
			if ($.get(isValid)) $$render(consequent_7);
		});
	}

	$.reset(div_14);
	$.reset(div_6);
	$.next(2);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.template_effect(($0) => button_1.disabled = $0, [() => !$.get(emailInput).trim()]);
	$.bind_property('open', 'toggle', details, ($$value) => $.set(showExamples, $$value), () => $.get(showExamples));
	$.bind_value(input, () => $.get(domain), ($$value) => $.set(domain, $$value));
	$.bind_value(input_1, () => $.get(emailInput), ($$value) => $.set(emailInput, $$value));
	$.delegated('click', button_1, convertEmailToDname);
	$.bind_value(input_2, () => $.get(mailboxDname), ($$value) => $.set(mailboxDname, $$value));
	$.bind_value(input_3, () => $.get(txtDname), ($$value) => $.set(txtDname, $$value));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);