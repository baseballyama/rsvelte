import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tooltip } from '$lib/actions/tooltip';
import Icon from '$lib/components/global/Icon.svelte';

var root = $.from_html(`<div class="input-group"><label for="zoneName"><!> Zone Name</label> <input type="text" id="zoneName" placeholder="example.com"/></div>`);
var root_1 = $.from_html(`<button class="example-card svelte-vodz6u"><h4 class="svelte-vodz6u"> </h4> <p class="svelte-vodz6u"> </p></button>`);
var root_2 = $.from_html(`<button class="svelte-vodz6u"><!> Download Zone</button>`);
var root_3 = $.from_html(`<div><div class="name svelte-vodz6u"> </div> <div class="ttl svelte-vodz6u"> </div> <div class="type svelte-vodz6u"><span> </span></div> <div class="value svelte-vodz6u"> </div></div>`);
var root_4 = $.from_html(`<div class="zone-file-section svelte-vodz6u"><div class="zone-file-header svelte-vodz6u"><h3 class="svelte-vodz6u">Zone File Preview</h3> <button class="svelte-vodz6u"><!> Copy Zone File</button></div> <pre class="zone-file-content svelte-vodz6u"> </pre></div>`);
var root_5 = $.from_html(`<div class="results-section svelte-vodz6u"><div class="results-header svelte-vodz6u"><h2 class="svelte-vodz6u">Generated Records</h2> <div class="export-buttons svelte-vodz6u"><button class="svelte-vodz6u"><!> Copy Records</button> <!></div></div> <div class="records-table svelte-vodz6u"><div class="table-header svelte-vodz6u"><div class="svelte-vodz6u">Name</div> <div class="svelte-vodz6u">TTL</div> <div class="svelte-vodz6u">Type</div> <div class="svelte-vodz6u">Value</div></div> <!></div> <!></div>`);

var root_6 = $.from_html(`<div class="card"><div class="card-header svelte-vodz6u"><h1>A/AAAA Bulk Generator</h1> <p class="card-subtitle svelte-vodz6u">Bulk create A and AAAA record sets from hostname and IP lists with TTL controls and zone file generation.</p></div> <div class="grid-layout svelte-vodz6u"><div class="input-section svelte-vodz6u"><div class="input-group"><label for="hostnames"><!> Hostnames</label> <textarea id="hostnames" placeholder="www
api
mail
ftp" rows="8" class="svelte-vodz6u"></textarea></div> <div class="input-group"><label for="ips"><!> IP Addresses</label> <textarea id="ips" placeholder="192.168.1.10
192.168.1.11
2001:db8::1
2001:db8::2" rows="8" class="svelte-vodz6u"></textarea></div> <div class="controls-row svelte-vodz6u"><div class="input-group"><label for="ttl"><!> TTL (seconds)</label> <input type="number" id="ttl" min="60" max="86400"/></div> <label class="checkbox-option svelte-vodz6u"><input type="checkbox" class="svelte-vodz6u"/> <span class="checkmark svelte-vodz6u"></span> Generate zone file</label></div> <!></div> <div class="examples-section svelte-vodz6u"><details class="examples-toggle svelte-vodz6u"><summary class="svelte-vodz6u"><!> Quick Examples</summary> <div class="examples-grid svelte-vodz6u"></div></details></div></div> <!></div>`);

export default function DNSAAAAABulk($$anchor, $$props) {
	$.push($$props, true);

	let hostnameInput = $.state('');
	let ipInput = $.state('');
	let ttl = $.state(3600);
	let generateZoneFile = $.state(false);
	let zoneName = $.state('example.com');
	let results = $.state($.proxy([]));
	let zoneFileContent = $.state('');
	let showExamples = $.state(false);

	const examples = [
		{
			label: 'Web Servers',
			hostnames: 'www\napi\ncdn\nstatic',
			ips: '192.168.1.10\n192.168.1.11\n192.168.1.12\n192.168.1.13'
		},

		{
			label: 'Mail Servers',
			hostnames: 'mail\nimap\nsmtp\npop3',
			ips: '10.0.1.20\n10.0.1.21\n10.0.1.22\n10.0.1.23'
		},

		{
			label: 'IPv6 Services',
			hostnames: 'web6\napi6\nmail6',
			ips: '2001:db8::1\n2001:db8::2\n2001:db8::3'
		}
	];

	function isIPv4(ip) {
		const parts = ip.split('.');

		return parts.length === 4 && parts.every((part) => {
			const num = parseInt(part, 10);

			return !isNaN(num) && num >= 0 && num <= 255 && part === num.toString();
		});
	}

	function isIPv6(ip) {
		const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:){1,7}:$|^([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}$|^([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}$|^([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}$|^([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}$|^[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})$|^:((:[0-9a-fA-F]{1,4}){1,7}|:)$|^::$/;

		return ipv6Regex.test(ip) || (/^::$/).test(ip) || (/^::1$/).test(ip);
	}

	function generateRecords() {
		const hostnames = $.get(hostnameInput).split('\n').map((h) => h.trim()).filter((h) => h);
		const ips = $.get(ipInput).split('\n').map((i) => i.trim()).filter((i) => i);

		if (hostnames.length === 0 || ips.length === 0) {
			$.set(results, [], true);

			return;
		}

		const newResults = [];
		const maxLength = Math.max(hostnames.length, ips.length);

		for (let i = 0; i < maxLength; i++) {
			const hostname = hostnames[i % hostnames.length];
			const ip = ips[i % ips.length];

			if (hostname && ip) {
				const recordType = isIPv4(ip) ? 'A' : isIPv6(ip) ? 'AAAA' : 'INVALID';

				newResults.push({ type: recordType, name: hostname, ttl: $.get(ttl), value: ip });
			}
		}

		$.set(results, newResults, true);
	}

	function generateZoneFileContent() {
		if ($.get(results).length === 0) return;

		// Generate serial number from current date
		const today = new Date();

		const serial = today.getFullYear().toString() + (today.getMonth() + 1).toString().padStart(2, '0') + today.getDate().toString().padStart(2, '0') + '01';

		const zoneHeader = `; Zone file for ${$.get(zoneName)}
; Generated by ${window.location.host}
$TTL ${$.get(ttl)}
$ORIGIN ${$.get(zoneName)}.

@ IN SOA ns1.${$.get(zoneName)}. admin.${$.get(zoneName)}. (
    ${serial}        ; Serial
    3600              ; Refresh
    1800              ; Retry
    604800            ; Expire
    86400             ; Minimum TTL
)

; Name servers
@ IN NS ns1.${$.get(zoneName)}.
@ IN NS ns2.${$.get(zoneName)}.

; A and AAAA Records
`;

		const records = $.get(results).map((record) => {
			const name = record.name === '@' ? '@' : record.name;

			return `${name.padEnd(20)} IN ${record.type.padEnd(6)} ${record.value}`;
		}).join('\n');

		$.set(zoneFileContent, zoneHeader + records);
	}

	function loadExample(example) {
		$.set(hostnameInput, example.hostnames, true);
		$.set(ipInput, example.ips, true);
		generateRecords();
	}

	function downloadZoneFile() {
		const blob = new Blob([$.get(zoneFileContent)], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');

		a.href = url;
		a.download = `${$.get(zoneName)}.zone`;
		a.click();
		URL.revokeObjectURL(url);
	}

	function copyToClipboard(text) {
		navigator.clipboard.writeText(text);
	}

	// Generate records when input changes
	$.user_effect(() => {
		generateRecords();
	});

	// Generate zone file when flag changes and records exist
	$.user_effect(() => {
		if ($.get(generateZoneFile) && $.get(results).length > 0) {
			generateZoneFileContent();
		} else {
			$.set(zoneFileContent, '');
		}
	});

	var div = root_6();
	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var label = $.child(div_3);
	var node = $.child(label);

	Icon(node, { name: 'server', size: 'sm' });
	$.next();
	$.reset(label);
	$.action(label, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Enter hostnames, one per line');

	var textarea = $.sibling(label, 2);

	$.remove_textarea_child(textarea);
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var label_1 = $.child(div_4);
	var node_1 = $.child(label_1);

	Icon(node_1, { name: 'networking', size: 'sm' });
	$.next();
	$.reset(label_1);
	$.action(label_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Enter IP addresses (IPv4 or IPv6), one per line');

	var textarea_1 = $.sibling(label_1, 2);

	$.remove_textarea_child(textarea_1);
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var div_6 = $.child(div_5);
	var label_2 = $.child(div_6);
	var node_2 = $.child(label_2);

	Icon(node_2, { name: 'clock', size: 'sm' });
	$.next();
	$.reset(label_2);
	$.action(label_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Time To Live in seconds');

	var input = $.sibling(label_2, 2);

	$.remove_input_defaults(input);
	$.reset(div_6);

	var label_3 = $.sibling(div_6, 2);
	var input_1 = $.child(label_3);

	$.remove_input_defaults(input_1);
	$.next(3);
	$.reset(label_3);
	$.reset(div_5);

	var node_3 = $.sibling(div_5, 2);

	{
		var consequent = ($$anchor) => {
			var div_7 = root();
			var label_4 = $.child(div_7);
			var node_4 = $.child(label_4);

			Icon(node_4, { name: 'globe', size: 'sm' });
			$.next();
			$.reset(label_4);
			$.action(label_4, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Domain name for the zone file');

			var input_2 = $.sibling(label_4, 2);

			$.remove_input_defaults(input_2);
			$.reset(div_7);
			$.bind_value(input_2, () => $.get(zoneName), ($$value) => $.set(zoneName, $$value));
			$.append($$anchor, div_7);
		};

		$.if(node_3, ($$render) => {
			if ($.get(generateZoneFile)) $$render(consequent);
		});
	}

	$.reset(div_2);

	var div_8 = $.sibling(div_2, 2);
	var details = $.child(div_8);
	var summary = $.child(details);
	var node_5 = $.child(summary);

	Icon(node_5, { name: 'lightbulb', size: 'sm' });
	$.next();
	$.reset(summary);

	var div_9 = $.sibling(summary, 2);

	$.each(div_9, 21, () => examples, (example) => example.label, ($$anchor, example) => {
		var button = root_1();
		var h4 = $.child(button);
		var text_1 = $.only_child(h4, true);
		var p = $.sibling(h4, 2);
		var text_2 = $.only_child(p);

		$.reset(button);

		$.template_effect(
			($0) => {
				$.set_text(text_1, $.get(example).label);
				$.set_text(text_2, `${$0 ?? ''} hosts`);
			},
			[() => $.get(example).hostnames.split('\n').length]
		);

		$.delegated('click', button, () => loadExample($.get(example)));
		$.append($$anchor, button);
	});

	$.reset(div_9);
	$.reset(details);
	$.reset(div_8);
	$.reset(div_1);

	var node_6 = $.sibling(div_1, 2);

	{
		var consequent_3 = ($$anchor) => {
			var div_10 = root_5();
			var div_11 = $.child(div_10);
			var div_12 = $.sibling($.child(div_11), 2);
			var button_1 = $.child(div_12);
			var node_7 = $.child(button_1);

			Icon(node_7, { name: 'copy', size: 'sm' });
			$.next();
			$.reset(button_1);

			var node_8 = $.sibling(button_1, 2);

			{
				var consequent_1 = ($$anchor) => {
					var button_2 = root_2();
					var node_9 = $.child(button_2);

					Icon(node_9, { name: 'download', size: 'sm' });
					$.next();
					$.reset(button_2);
					$.delegated('click', button_2, downloadZoneFile);
					$.append($$anchor, button_2);
				};

				$.if(node_8, ($$render) => {
					if ($.get(generateZoneFile) && $.get(zoneFileContent)) $$render(consequent_1);
				});
			}

			$.reset(div_12);
			$.reset(div_11);

			var div_13 = $.sibling(div_11, 2);
			var node_10 = $.sibling($.child(div_13), 2);

			$.each(node_10, 17, () => $.get(results), $.index, ($$anchor, record) => {
				var div_14 = root_3();
				let classes;
				var div_15 = $.child(div_14);
				var text_3 = $.only_child(div_15, true);
				var div_16 = $.sibling(div_15, 2);
				var text_4 = $.only_child(div_16, true);
				var div_17 = $.sibling(div_16, 2);
				var span = $.child(div_17);
				let classes_1;
				var text_5 = $.only_child(span, true);

				$.reset(div_17);

				var div_18 = $.sibling(div_17, 2);
				var text_6 = $.only_child(div_18, true);

				$.reset(div_14);

				$.template_effect(() => {
					classes = $.set_class(div_14, 1, 'table-row svelte-vodz6u', null, classes, { invalid: $.get(record).type === 'INVALID' });
					$.set_text(text_3, $.get(record).name);
					$.set_text(text_4, $.get(record).ttl);

					classes_1 = $.set_class(span, 1, 'record-type svelte-vodz6u', null, classes_1, {
						a: $.get(record).type === 'A',
						aaaa: $.get(record).type === 'AAAA',
						error: $.get(record).type === 'INVALID'
					});

					$.set_text(text_5, $.get(record).type);
					$.set_text(text_6, $.get(record).value);
				});

				$.append($$anchor, div_14);
			});

			$.reset(div_13);

			var node_11 = $.sibling(div_13, 2);

			{
				var consequent_2 = ($$anchor) => {
					var div_19 = root_4();
					var div_20 = $.child(div_19);
					var button_3 = $.sibling($.child(div_20), 2);
					var node_12 = $.child(button_3);

					Icon(node_12, { name: 'copy', size: 'sm' });
					$.next();
					$.reset(button_3);
					$.reset(div_20);

					var pre = $.sibling(div_20, 2);
					var text_7 = $.only_child(pre, true);

					$.reset(div_19);
					$.template_effect(() => $.set_text(text_7, $.get(zoneFileContent)));
					$.delegated('click', button_3, () => copyToClipboard($.get(zoneFileContent)));
					$.append($$anchor, div_19);
				};

				$.if(node_11, ($$render) => {
					if ($.get(generateZoneFile) && $.get(zoneFileContent)) $$render(consequent_2);
				});
			}

			$.reset(div_10);
			$.delegated('click', button_1, () => copyToClipboard($.get(results).map((r) => `${r.name} ${r.ttl} IN ${r.type} ${r.value}`).join('\n')));
			$.append($$anchor, div_10);
		};

		$.if(node_6, ($$render) => {
			if ($.get(results).length > 0) $$render(consequent_3);
		});
	}

	$.reset(div);
	$.bind_value(textarea, () => $.get(hostnameInput), ($$value) => $.set(hostnameInput, $$value));
	$.bind_value(textarea_1, () => $.get(ipInput), ($$value) => $.set(ipInput, $$value));
	$.bind_value(input, () => $.get(ttl), ($$value) => $.set(ttl, $$value));
	$.bind_checked(input_1, () => $.get(generateZoneFile), ($$value) => $.set(generateZoneFile, $$value));
	$.bind_property('open', 'toggle', details, ($$value) => $.set(showExamples, $$value), () => $.get(showExamples));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);