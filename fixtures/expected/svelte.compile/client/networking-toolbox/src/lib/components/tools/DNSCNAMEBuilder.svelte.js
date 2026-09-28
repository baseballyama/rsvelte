import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tooltip } from '$lib/actions/tooltip';
import Icon from '$lib/components/global/Icon.svelte';
import { SvelteSet } from 'svelte/reactivity';

var root = $.from_html(
	`<div class="input-group"><label for="aliases"><!> Alias Names</label> <textarea id="aliases" placeholder="www
blog
mail
ftp" rows="6" class="svelte-xbg2dq"></textarea></div> <div class="input-group"><label for="targets"><!> Target FQDNs</label> <textarea id="targets" placeholder="server1.example.com.
server2.example.com.
mailserver.example.com.
ftpserver.example.com." rows="6" class="svelte-xbg2dq"></textarea></div>`,
	1
);

var root_1 = $.from_html(`<div class="input-group"><label for="alias"><!> Alias Name</label> <input type="text" id="alias" placeholder="www" class="svelte-xbg2dq"/></div> <div class="input-group"><label for="target"><!> Target FQDN</label> <input type="text" id="target" placeholder="server1.example.com." class="svelte-xbg2dq"/></div>`, 1);
var root_2 = $.from_html(`<button class="example-card svelte-xbg2dq"><h4 class="svelte-xbg2dq"> </h4> <p class="svelte-xbg2dq"> </p></button>`);
var root_3 = $.from_html(`<div><div class="alias svelte-xbg2dq"> </div> <div class="ttl svelte-xbg2dq"> </div> <div class="type svelte-xbg2dq"><span class="record-type svelte-xbg2dq">CNAME</span></div> <div class="target svelte-xbg2dq"> </div> <div class="status svelte-xbg2dq"><span><!> </span></div></div>`);
var root_4 = $.from_html(`<li><strong> </strong> <!> <!> <!></li>`);
var root_5 = $.from_html(`<div class="validation-warnings svelte-xbg2dq"><h3 class="svelte-xbg2dq"><!> Validation Issues</h3> <ul class="svelte-xbg2dq"></ul></div>`);
var root_6 = $.from_html(`<div class="results-section svelte-xbg2dq"><div class="results-header svelte-xbg2dq"><h2 class="svelte-xbg2dq">Generated CNAME Records</h2> <div class="export-buttons svelte-xbg2dq"><button class="svelte-xbg2dq"><!> Copy Records</button></div></div> <div class="records-table svelte-xbg2dq"><div class="table-header svelte-xbg2dq"><div class="svelte-xbg2dq">Alias</div> <div class="svelte-xbg2dq">TTL</div> <div class="svelte-xbg2dq">Type</div> <div class="svelte-xbg2dq">Target</div> <div class="svelte-xbg2dq">Status</div></div> <!></div> <!></div>`);
var root_7 = $.from_html(`<div class="card"><div class="card-header svelte-xbg2dq"><h1>CNAME Builder</h1> <p class="card-subtitle svelte-xbg2dq">Build valid CNAME records with loop detection, self-target checks, and FQDN validation.</p></div> <div class="grid-layout svelte-xbg2dq"><div class="input-section svelte-xbg2dq"><div class="mode-selector svelte-xbg2dq"><label class="checkbox-option svelte-xbg2dq"><input type="checkbox" class="svelte-xbg2dq"/> <span class="checkmark svelte-xbg2dq"></span> Bulk mode (multiple records)</label></div> <!> <div class="controls-row svelte-xbg2dq"><div class="input-group"><label for="ttl"><!> TTL (seconds)</label> <input type="number" id="ttl" min="60" max="86400" class="svelte-xbg2dq"/></div></div></div> <div class="examples-section svelte-xbg2dq"><details class="examples-toggle svelte-xbg2dq"><summary class="svelte-xbg2dq"><!> Quick Examples</summary> <div class="examples-grid svelte-xbg2dq"></div></details> <div class="info-panel svelte-xbg2dq"><h4 class="svelte-xbg2dq">CNAME Best Practices</h4> <ul class="svelte-xbg2dq"><li class="svelte-xbg2dq">Target must be a Fully Qualified Domain Name (FQDN) ending with a dot</li> <li class="svelte-xbg2dq">CNAME records cannot coexist with other record types</li> <li class="svelte-xbg2dq">Avoid CNAME chains longer than 3-4 hops</li> <li class="svelte-xbg2dq">Never point a CNAME to another CNAME if possible</li></ul></div></div></div> <!></div>`);

export default function DNSCNAMEBuilder($$anchor, $$props) {
	$.push($$props, true);

	let aliasInput = $.state('');
	let targetInput = $.state('');
	let ttl = $.state(3600);
	let generateMultiple = $.state(false);
	let results = $.state($.proxy([]));
	let showExamples = $.state(false);

	const examples = [
		{
			label: 'Web Aliases',
			aliases: 'www\nblog\nshop\napi',
			targets: 'server1.example.com.\nwordpress.hosting.com.\necommerce.platform.com.\napi-gateway.example.com.'
		},

		{
			label: 'Service Redirects',
			aliases: 'mail\nftp\nvpn',
			targets: 'mailserver.example.com.\nftpserver.example.com.\nvpngateway.example.com.'
		},

		{
			label: 'CDN Configuration',
			aliases: 'cdn\nstatic\nassets\nimages',
			targets: 'cdn.cloudflare.com.\nstatic.fastly.com.\nassets.cloudfront.net.\nimg.amazonaws.com.'
		}
	];

	function isValidHostname(hostname) {
		if (!hostname || hostname.length > 253) return false;

		// Remove trailing dot for validation
		const host = hostname.endsWith('.') ? hostname.slice(0, -1) : hostname;

		// Check each label
		const labels = host.split('.');

		if (labels.length < 1) return false;

		return labels.every((label) => {
			if (label.length === 0 || label.length > 63) return false;
			if (label.startsWith('-') || label.endsWith('-')) return false;

			return (/^[a-zA-Z0-9-]+$/).test(label);
		});
	}

	function validateCNAME(alias, target, allRecords) {
		// Check format validity
		if (!isValidHostname(alias) || !isValidHostname(target)) {
			return 'invalid-format';
		}

		// Ensure target ends with dot (FQDN)
		if (!target.endsWith('.')) {
			return 'missing-dot';
		}

		// Check for self-targeting
		const aliasNormalized = alias.endsWith('.') ? alias : alias + '.';

		if (aliasNormalized === target) {
			return 'self-target';
		}

		// Check for loops
		const visited = new SvelteSet();

		let current = target;

		while (current) {
			if (visited.has(current)) {
				return 'loop';
			}

			visited.add(current);

			// Find if current target is also an alias in our records
			const nextRecord = allRecords.find((r) => {
				const recordAlias = r.alias.endsWith('.') ? r.alias : r.alias + '.';

				return recordAlias === current;
			});

			if (nextRecord) {
				current = nextRecord.target;
			} else {
				break;
			}
		}

		return 'valid';
	}

	function generateRecords() {
		if ($.get(generateMultiple)) {
			const aliases = $.get(aliasInput).split('\n').map((a) => a.trim()).filter((a) => a);
			const targets = $.get(targetInput).split('\n').map((t) => t.trim()).filter((t) => t);

			if (aliases.length === 0 || targets.length === 0) {
				$.set(results, [], true);

				return;
			}

			const newResults = [];
			const maxLength = Math.max(aliases.length, targets.length);

			for (let i = 0; i < maxLength; i++) {
				const alias = aliases[i % aliases.length];
				const target = targets[i % targets.length];

				if (alias && target) {
					newResults.push({
						alias,
						target,
						ttl: $.get(ttl),
						status: 'valid' // Will be validated after all records are created
					});
				}
			}

			// Validate all records for loops
			newResults.forEach((record) => {
				record.status = validateCNAME(record.alias, record.target, newResults);
			});

			$.set(results, newResults, true);
		} else {
			// Single record mode
			if ($.get(aliasInput).trim() && $.get(targetInput).trim()) {
				const singleResult = [
					{
						alias: $.get(aliasInput).trim(),
						target: $.get(targetInput).trim(),
						ttl: $.get(ttl),
						status: validateCNAME($.get(aliasInput).trim(), $.get(targetInput).trim(), [])
					}
				];

				$.set(results, singleResult, true);
			} else {
				$.set(results, [], true);
			}
		}
	}

	function loadExample(example) {
		$.set(aliasInput, example.aliases, true);
		$.set(targetInput, example.targets, true);
		$.set(generateMultiple, true);
		generateRecords();
	}

	function copyToClipboard(text) {
		navigator.clipboard.writeText(text);
	}

	function getStatusInfo(status) {
		switch (status) {
			case 'valid':
				return { icon: 'check-circle', class: 'success', text: 'Valid' };

			case 'loop':
				return {
					icon: 'alert-triangle',
					class: 'error',
					text: 'Loop Detected'
				};

			case 'self-target':
				return { icon: 'alert-triangle', class: 'error', text: 'Self Target' };

			case 'invalid-format':
				return { icon: 'x-circle', class: 'error', text: 'Invalid Format' };

			case 'missing-dot':
				return { icon: 'info', class: 'warning', text: 'Missing FQDN Dot' };

			default:
				return { icon: 'help-circle', class: 'info', text: 'Unknown' };
		}
	}

	$.user_effect(() => {
		generateRecords();
	});

	var div = root_7();
	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var label_1 = $.child(div_3);
	var input = $.child(label_1);

	$.remove_input_defaults(input);
	$.next(3);
	$.reset(label_1);
	$.reset(div_3);

	var node = $.sibling(div_3, 2);

	{
		var consequent = ($$anchor) => {
			var fragment = root();
			var div_4 = $.first_child(fragment);
			var label_2 = $.child(div_4);
			var node_1 = $.child(label_2);

			Icon(node_1, { name: 'alias', size: 'sm' });
			$.next();
			$.reset(label_2);
			$.action(label_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Enter alias names, one per line');

			var textarea = $.sibling(label_2, 2);

			$.remove_textarea_child(textarea);
			$.reset(div_4);

			var div_5 = $.sibling(div_4, 2);
			var label_3 = $.child(div_5);
			var node_2 = $.child(label_3);

			Icon(node_2, { name: 'target', size: 'sm' });
			$.next();
			$.reset(label_3);
			$.action(label_3, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Enter target FQDNs, one per line. Must end with dot (.).');

			var textarea_1 = $.sibling(label_3, 2);

			$.remove_textarea_child(textarea_1);
			$.reset(div_5);
			$.bind_value(textarea, () => $.get(aliasInput), ($$value) => $.set(aliasInput, $$value));
			$.bind_value(textarea_1, () => $.get(targetInput), ($$value) => $.set(targetInput, $$value));
			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = root_1();
			var div_6 = $.first_child(fragment_1);
			var label_4 = $.child(div_6);
			var node_3 = $.child(label_4);

			Icon(node_3, { name: 'alias', size: 'sm' });
			$.next();
			$.reset(label_4);
			$.action(label_4, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Enter the alias name (left side of CNAME)');

			var input_1 = $.sibling(label_4, 2);

			$.remove_input_defaults(input_1);
			$.reset(div_6);

			var div_7 = $.sibling(div_6, 2);
			var label_5 = $.child(div_7);
			var node_4 = $.child(label_5);

			Icon(node_4, { name: 'target', size: 'sm' });
			$.next();
			$.reset(label_5);
			$.action(label_5, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Enter the target FQDN (right side of CNAME). Must end with dot (.).');

			var input_2 = $.sibling(label_5, 2);

			$.remove_input_defaults(input_2);
			$.reset(div_7);
			$.bind_value(input_1, () => $.get(aliasInput), ($$value) => $.set(aliasInput, $$value));
			$.bind_value(input_2, () => $.get(targetInput), ($$value) => $.set(targetInput, $$value));
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(generateMultiple)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	var div_8 = $.sibling(node, 2);
	var div_9 = $.child(div_8);
	var label_6 = $.child(div_9);
	var node_5 = $.child(label_6);

	Icon(node_5, { name: 'clock', size: 'sm' });
	$.next();
	$.reset(label_6);
	$.action(label_6, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Time To Live in seconds');

	var input_3 = $.sibling(label_6, 2);

	$.remove_input_defaults(input_3);
	$.reset(div_9);
	$.reset(div_8);
	$.reset(div_2);

	var div_10 = $.sibling(div_2, 2);
	var details = $.child(div_10);
	var summary = $.child(details);
	var node_6 = $.child(summary);

	Icon(node_6, { name: 'lightbulb', size: 'sm' });
	$.next();
	$.reset(summary);

	var div_11 = $.sibling(summary, 2);

	$.each(div_11, 21, () => examples, (example) => example.label, ($$anchor, example) => {
		var button = root_2();
		var h4 = $.child(button);
		var text_1 = $.only_child(h4, true);
		var p = $.sibling(h4, 2);
		var text_2 = $.only_child(p);

		$.reset(button);

		$.template_effect(
			($0) => {
				$.set_text(text_1, $.get(example).label);
				$.set_text(text_2, `${$0 ?? ''} records`);
			},
			[() => $.get(example).aliases.split('\n').length]
		);

		$.delegated('click', button, () => loadExample($.get(example)));
		$.append($$anchor, button);
	});

	$.reset(div_11);
	$.reset(details);
	$.next(2);
	$.reset(div_10);
	$.reset(div_1);

	var node_7 = $.sibling(div_1, 2);

	{
		var consequent_5 = ($$anchor) => {
			var div_12 = root_6();
			var div_13 = $.child(div_12);
			var div_14 = $.sibling($.child(div_13), 2);
			var button_1 = $.child(div_14);
			var node_8 = $.child(button_1);

			Icon(node_8, { name: 'copy', size: 'sm' });
			$.next();
			$.reset(button_1);
			$.reset(div_14);
			$.reset(div_13);

			var div_15 = $.sibling(div_13, 2);
			var node_9 = $.sibling($.child(div_15), 2);

			$.each(node_9, 17, () => $.get(results), $.index, ($$anchor, record) => {
				const statusInfo = $.derived(() => getStatusInfo($.get(record).status));
				var div_16 = root_3();
				let classes;
				var div_17 = $.child(div_16);
				var text_3 = $.only_child(div_17, true);
				var div_18 = $.sibling(div_17, 2);
				var text_4 = $.only_child(div_18, true);
				var div_19 = $.sibling(div_18, 4);
				var text_5 = $.only_child(div_19, true);
				var div_20 = $.sibling(div_19, 2);
				var span = $.child(div_20);
				var node_10 = $.child(span);

				Icon(node_10, {
					get name() {
						return $.get(statusInfo).icon;
					},
					size: 'xs'
				});

				var text_6 = $.sibling(node_10);

				$.reset(span);
				$.reset(div_20);
				$.reset(div_16);

				$.template_effect(() => {
					classes = $.set_class(div_16, 1, 'table-row svelte-xbg2dq', null, classes, { error: $.get(record).status !== 'valid' });
					$.set_text(text_3, $.get(record).alias);
					$.set_text(text_4, $.get(record).ttl);
					$.set_text(text_5, $.get(record).target);
					$.set_class(span, 1, `status-badge ${$.get(statusInfo).class ?? ''}`, 'svelte-xbg2dq');
					$.set_text(text_6, ` ${$.get(statusInfo).text ?? ''}`);
				});

				$.append($$anchor, div_16);
			});

			$.reset(div_15);

			var node_11 = $.sibling(div_15, 2);

			{
				var consequent_4 = ($$anchor) => {
					var div_21 = root_5();
					var h3 = $.child(div_21);
					var node_12 = $.child(h3);

					Icon(node_12, { name: 'alert-triangle', size: 'sm' });
					$.next();
					$.reset(h3);

					var ul = $.sibling(h3, 2);

					$.each(ul, 21, () => $.get(results).filter((r) => r.status !== 'valid'), $.index, ($$anchor, record) => {
						const statusInfo = $.derived(() => getStatusInfo($.get(record).status));
						var li = root_4();
						var strong = $.child(li);
						var text_7 = $.only_child(strong, true);
						var text_8 = $.sibling(strong);
						var node_13 = $.sibling(text_8);

						{
							var consequent_1 = ($$anchor) => {
								var text_9 = $.text('- Target should end with \'.\' to be a proper FQDN');

								$.append($$anchor, text_9);
							};

							$.if(node_13, ($$render) => {
								if ($.get(record).status === 'missing-dot') $$render(consequent_1);
							});
						}

						var node_14 = $.sibling(node_13, 2);

						{
							var consequent_2 = ($$anchor) => {
								var text_10 = $.text('- Creates a circular reference that will cause DNS resolution to fail');

								$.append($$anchor, text_10);
							};

							$.if(node_14, ($$render) => {
								if ($.get(record).status === 'loop') $$render(consequent_2);
							});
						}

						var node_15 = $.sibling(node_14, 2);

						{
							var consequent_3 = ($$anchor) => {
								var text_11 = $.text('- Points to itself, which is not allowed');

								$.append($$anchor, text_11);
							};

							$.if(node_15, ($$render) => {
								if ($.get(record).status === 'self-target') $$render(consequent_3);
							});
						}

						$.reset(li);

						$.template_effect(() => {
							$.set_class(li, 1, `warning-item ${$.get(statusInfo).class ?? ''}`, 'svelte-xbg2dq');
							$.set_text(text_7, $.get(record).alias);
							$.set_text(text_8, `: ${$.get(statusInfo).text ?? ''} `);
						});

						$.append($$anchor, li);
					});

					$.reset(ul);
					$.reset(div_21);
					$.append($$anchor, div_21);
				};

				var d = $.derived(() => $.get(results).some((r) => r.status !== 'valid'));

				$.if(node_11, ($$render) => {
					if ($.get(d)) $$render(consequent_4);
				});
			}

			$.reset(div_12);
			$.delegated('click', button_1, () => copyToClipboard($.get(results).map((r) => `${r.alias} ${r.ttl} IN CNAME ${r.target}`).join('\n')));
			$.append($$anchor, div_12);
		};

		$.if(node_7, ($$render) => {
			if ($.get(results).length > 0) $$render(consequent_5);
		});
	}

	$.reset(div);
	$.bind_checked(input, () => $.get(generateMultiple), ($$value) => $.set(generateMultiple, $$value));
	$.bind_value(input_3, () => $.get(ttl), ($$value) => $.set(ttl, $$value));
	$.bind_property('open', 'toggle', details, ($$value) => $.set(showExamples, $$value), () => $.get(showExamples));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);