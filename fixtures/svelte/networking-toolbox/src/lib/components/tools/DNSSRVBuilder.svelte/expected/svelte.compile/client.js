import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tooltip } from '$lib/actions/tooltip';
import Icon from '$lib/components/global/Icon.svelte';

var root = $.from_html(`<option> </option>`);
var root_1 = $.from_html(`<input type="text" placeholder="_myservice" class="custom-service-input svelte-rfxrrf"/>`);
var root_2 = $.from_html(`<div class="error-message svelte-rfxrrf"><!> </div>`);
var root_3 = $.from_html(`<div class="validation-errors svelte-rfxrrf"></div>`);
var root_4 = $.from_html(`<div><div class="record-fields svelte-rfxrrf"><div class="service-protocol-row svelte-rfxrrf"><div class="service-input"><label class="svelte-rfxrrf">Service</label> <div class="service-select-wrapper svelte-rfxrrf"><select class="svelte-rfxrrf"><!><option>Custom</option></select> <!></div></div> <div class="protocol-input"><label class="svelte-rfxrrf">Protocol</label> <select class="svelte-rfxrrf"><option>TCP</option><option>UDP</option><option>TLS</option><option>SCTP</option></select></div> <div class="name-input"><label class="svelte-rfxrrf">Domain</label> <input type="text" placeholder="example.com" class="svelte-rfxrrf"/></div></div> <div class="priority-weight-row svelte-rfxrrf"><div class="priority-input"><label class="svelte-rfxrrf">Priority</label> <input type="number" min="0" max="65535" class="svelte-rfxrrf"/></div> <div class="weight-input"><label class="svelte-rfxrrf">Weight</label> <input type="number" min="0" max="65535" class="svelte-rfxrrf"/></div> <div class="port-input"><label class="svelte-rfxrrf">Port</label> <input type="number" min="1" max="65535" class="svelte-rfxrrf"/></div> <div class="target-input"><label class="svelte-rfxrrf">Target (FQDN)</label> <input type="text" placeholder="server.example.com." class="svelte-rfxrrf"/></div></div></div> <button class="remove-btn svelte-rfxrrf"><!></button> <!></div>`);
var root_5 = $.from_html(`<button class="example-card svelte-rfxrrf"><h4 class="svelte-rfxrrf"> </h4> <p class="svelte-rfxrrf"> </p></button>`);
var root_6 = $.from_html(`<div><div class="service-name svelte-rfxrrf"> </div> <div class="ttl svelte-rfxrrf"> </div> <div class="type svelte-rfxrrf"><span class="record-type svelte-rfxrrf">SRV</span></div> <div class="priority svelte-rfxrrf"> </div> <div class="weight svelte-rfxrrf"> </div> <div class="port svelte-rfxrrf"> </div> <div class="target svelte-rfxrrf"> </div> <div class="status svelte-rfxrrf"><span><!> </span></div></div>`);
var root_7 = $.from_html(`<li class="svelte-rfxrrf"><strong> </strong> </li>`);
var root_8 = $.from_html(`<div class="validation-summary svelte-rfxrrf"><h3 class="svelte-rfxrrf"><!> Configuration Issues</h3> <ul class="svelte-rfxrrf"></ul></div>`);
var root_9 = $.from_html(`<div class="results-section svelte-rfxrrf"><div class="results-header svelte-rfxrrf"><h2 class="svelte-rfxrrf">Generated SRV Records</h2> <div class="export-buttons svelte-rfxrrf"><button class="svelte-rfxrrf"><!> Copy Records</button></div></div> <div class="records-table svelte-rfxrrf"><div class="table-header svelte-rfxrrf"><div class="svelte-rfxrrf">Service</div> <div class="svelte-rfxrrf">TTL</div> <div class="svelte-rfxrrf">Type</div> <div class="svelte-rfxrrf">Priority</div> <div class="svelte-rfxrrf">Weight</div> <div class="svelte-rfxrrf">Port</div> <div class="svelte-rfxrrf">Target</div> <div class="svelte-rfxrrf">Status</div></div> <!></div> <!></div>`);

var root_10 = $.from_html(`<div class="card"><div class="card-header svelte-rfxrrf"><h1>SRV Record Builder</h1> <p class="card-subtitle svelte-rfxrrf">Compose SRV records with service discovery, protocol specification, priority/weight balancing, and target
      validation.</p></div> <div class="grid-layout svelte-rfxrrf"><div class="input-section svelte-rfxrrf"><div class="controls-header svelte-rfxrrf"><div class="input-group"><label for="ttl"><!> Default TTL (seconds)</label> <input type="number" id="ttl" min="60" max="86400" class="svelte-rfxrrf"/></div> <button class="add-record-btn svelte-rfxrrf"><!> Add SRV Record</button></div> <div class="srv-records-section svelte-rfxrrf"><div class="section-header svelte-rfxrrf"><h3 class="svelte-rfxrrf">SRV Records</h3></div> <div class="records-list svelte-rfxrrf"></div></div></div> <div class="examples-section svelte-rfxrrf"><details class="examples-toggle svelte-rfxrrf"><summary class="svelte-rfxrrf"><!> Service Examples</summary> <div class="examples-grid svelte-rfxrrf"></div></details> <div class="info-panel svelte-rfxrrf"><h4 class="svelte-rfxrrf">SRV Record Structure</h4> <div class="srv-format svelte-rfxrrf"><code class="svelte-rfxrrf">_service._protocol.domain. TTL IN SRV priority weight port target.</code></div> <ul class="svelte-rfxrrf"><li class="svelte-rfxrrf"><strong class="svelte-rfxrrf">Service:</strong> Must start with underscore (e.g., _http, _sip)</li> <li class="svelte-rfxrrf"><strong class="svelte-rfxrrf">Protocol:</strong> Usually tcp, udp, tls, or sctp</li> <li class="svelte-rfxrrf"><strong class="svelte-rfxrrf">Priority:</strong> Lower values = higher priority (0-65535)</li> <li class="svelte-rfxrrf"><strong class="svelte-rfxrrf">Weight:</strong> Load balancing within same priority (0-65535)</li> <li class="svelte-rfxrrf"><strong class="svelte-rfxrrf">Port:</strong> Service port number (1-65535)</li> <li class="svelte-rfxrrf"><strong class="svelte-rfxrrf">Target:</strong> FQDN of the server (must end with dot)</li></ul></div></div></div> <!></div>`);

export default function DNSSRVBuilder($$anchor, $$props) {
	$.push($$props, true);

	let ttl = $.state(3600);

	let srvRecords = $.state($.proxy([
		{
			id: '1',
			service: '_http',
			protocol: 'tcp',
			name: 'example.com',
			priority: 10,
			weight: 5,
			port: 80,
			target: 'web1.example.com.',
			ttl: 3600
		}
	]));

	let showExamples = $.state(false);

	const examples = [
		{
			label: 'Web Services',
			records: [
				{
					service: '_http',
					protocol: 'tcp',
					priority: 10,
					weight: 5,
					port: 80,
					target: 'web1.example.com.'
				},

				{
					service: '_https',
					protocol: 'tcp',
					priority: 10,
					weight: 5,
					port: 443,
					target: 'web1.example.com.'
				},

				{
					service: '_http',
					protocol: 'tcp',
					priority: 20,
					weight: 5,
					port: 8080,
					target: 'web2.example.com.'
				}
			]
		},

		{
			label: 'Mail Services',
			records: [
				{
					service: '_smtp',
					protocol: 'tcp',
					priority: 10,
					weight: 5,
					port: 25,
					target: 'mail1.example.com.'
				},

				{
					service: '_submission',
					protocol: 'tcp',
					priority: 10,
					weight: 5,
					port: 587,
					target: 'mail1.example.com.'
				},

				{
					service: '_imaps',
					protocol: 'tcp',
					priority: 10,
					weight: 5,
					port: 993,
					target: 'mail1.example.com.'
				}
			]
		},

		{
			label: 'SIP Services',
			records: [
				{
					service: '_sip',
					protocol: 'tcp',
					priority: 10,
					weight: 5,
					port: 5060,
					target: 'sip1.example.com.'
				},

				{
					service: '_sip',
					protocol: 'udp',
					priority: 10,
					weight: 5,
					port: 5060,
					target: 'sip1.example.com.'
				},

				{
					service: '_sips',
					protocol: 'tcp',
					priority: 10,
					weight: 5,
					port: 5061,
					target: 'sip1.example.com.'
				}
			]
		},

		{
			label: 'XMPP Services',
			records: [
				{
					service: '_xmpp-server',
					protocol: 'tcp',
					priority: 10,
					weight: 5,
					port: 5269,
					target: 'xmpp.example.com.'
				},

				{
					service: '_xmpp-client',
					protocol: 'tcp',
					priority: 10,
					weight: 5,
					port: 5222,
					target: 'xmpp.example.com.'
				}
			]
		}
	];

	const commonServices = [
		{ service: '_http', port: 80, protocol: 'tcp' },
		{ service: '_https', port: 443, protocol: 'tcp' },
		{ service: '_ftp', port: 21, protocol: 'tcp' },
		{ service: '_smtp', port: 25, protocol: 'tcp' },
		{ service: '_submission', port: 587, protocol: 'tcp' },
		{ service: '_imap', port: 143, protocol: 'tcp' },
		{ service: '_imaps', port: 993, protocol: 'tcp' },
		{ service: '_pop3', port: 110, protocol: 'tcp' },
		{ service: '_pop3s', port: 995, protocol: 'tcp' },
		{ service: '_sip', port: 5060, protocol: 'tcp' },
		{ service: '_sips', port: 5061, protocol: 'tcp' },
		{ service: '_xmpp-server', port: 5269, protocol: 'tcp' },
		{ service: '_xmpp-client', port: 5222, protocol: 'tcp' },
		{ service: '_ldap', port: 389, protocol: 'tcp' },
		{ service: '_ldaps', port: 636, protocol: 'tcp' }
	];

	function addSRVRecord() {
		const newId = (Math.max(...$.get(srvRecords).map((r) => parseInt(r.id)), 0) + 1).toString();

		$.get(srvRecords).push({
			id: newId,
			service: '_http',
			protocol: 'tcp',
			name: 'example.com',
			priority: 10,
			weight: 5,
			port: 80,
			target: 'server.example.com.',
			ttl: $.get(ttl)
		});

		$.set(srvRecords, $.get(srvRecords), true);
	}

	function removeSRVRecord(id) {
		$.set(srvRecords, $.get(srvRecords).filter((r) => r.id !== id), true);
	}

	function updateRecord(id, field, value) {
		const record = $.get(srvRecords).find((r) => r.id === id);

		if (record) {
			record[field] = value;
			$.set(srvRecords, $.get(srvRecords), true);
		}
	}

	function loadExample(example) {
		$.set(
			srvRecords,
			example.records.map((record, index) => ({
				id: (index + 1).toString(),
				service: record.service,
				protocol: record.protocol,
				name: 'example.com',
				priority: record.priority,
				weight: record.weight,
				port: record.port,
				target: record.target,
				ttl: $.get(ttl)
			})),
			true
		);
	}

	function fillCommonService(recordId, serviceName) {
		const service = commonServices.find((s) => s.service === serviceName);

		if (service) {
			updateRecord(recordId, 'service', service.service);
			updateRecord(recordId, 'protocol', service.protocol);
			updateRecord(recordId, 'port', service.port);
		}
	}

	function validateSRVRecord(record) {
		const issues = [];

		if (!record.service.trim()) {
			issues.push('Service name cannot be empty');
		} else if (!record.service.startsWith('_')) {
			issues.push('Service name must start with underscore (_)');
		}

		if (!record.name.trim()) {
			issues.push('Domain name cannot be empty');
		}

		if (record.priority < 0 || record.priority > 65535) {
			issues.push('Priority must be between 0 and 65535');
		}

		if (record.weight < 0 || record.weight > 65535) {
			issues.push('Weight must be between 0 and 65535');
		}

		if (record.port < 1 || record.port > 65535) {
			issues.push('Port must be between 1 and 65535');
		}

		if (!record.target.trim()) {
			issues.push('Target cannot be empty');
		} else if (!record.target.endsWith('.')) {
			issues.push('Target should end with a dot (FQDN)');
		}

		return { valid: issues.length === 0, issues };
	}

	function copyToClipboard(text) {
		navigator.clipboard.writeText(text);
	}

	function generateSRVRecords() {
		return $.get(srvRecords).map((record) => {
			const srvName = `${record.service}.${record.protocol}.${record.name}`;

			return `${srvName} ${record.ttl} IN SRV ${record.priority} ${record.weight} ${record.port} ${record.target}`;
		}).join('\n');
	}

	// Update TTL for all records when global TTL changes
	$.user_effect(() => {
		$.get(srvRecords).forEach((record) => record.ttl = $.get(ttl));
		$.set(srvRecords, $.get(srvRecords), true);
	});

	var div = root_10();
	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var div_4 = $.child(div_3);
	var label = $.child(div_4);
	var node = $.child(label);

	Icon(node, { name: 'clock', size: 'sm' });
	$.next();
	$.reset(label);
	$.action(label, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Default Time To Live in seconds for all SRV records');

	var input = $.sibling(label, 2);

	$.remove_input_defaults(input);
	$.reset(div_4);

	var button = $.sibling(div_4, 2);
	var node_1 = $.child(button);

	Icon(node_1, { name: 'plus', size: 'sm' });
	$.next();
	$.reset(button);
	$.reset(div_3);

	var div_5 = $.sibling(div_3, 2);
	var div_6 = $.sibling($.child(div_5), 2);

	$.each(div_6, 21, () => $.get(srvRecords), (record) => record.id, ($$anchor, record) => {
		const validation = $.derived(() => validateSRVRecord($.get(record)));
		var div_7 = root_4();
		let classes;
		var div_8 = $.child(div_7);
		var div_9 = $.child(div_8);
		var div_10 = $.child(div_9);
		var label_1 = $.child(div_10);

		$.action(label_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'The service name, typically starting with underscore (e.g., _http, _smtp)');

		var div_11 = $.sibling(label_1, 2);
		var select = $.child(div_11);
		var node_2 = $.child(select);

		$.each(node_2, 17, () => commonServices, (service) => service.service, ($$anchor, service) => {
			var option = root();
			var text_1 = $.only_child(option, true);
			var option_value = {};

			$.template_effect(() => {
				$.set_text(text_1, $.get(service).service);

				if (option_value !== (option_value = $.get(service).service)) {
					option.value = (option.__value = option_value) ?? '';
				}
			});

			$.append($$anchor, option);
		});

		var option_1 = $.sibling(node_2);

		option_1.value = option_1.__value = 'custom';
		$.reset(select);

		var select_value;

		$.init_select(select);

		var node_3 = $.sibling(select, 2);

		{
			var consequent = ($$anchor) => {
				var input_1 = root_1();

				$.remove_input_defaults(input_1);
				$.template_effect(() => $.set_value(input_1, $.get(record).service));
				$.delegated('input', input_1, (e) => updateRecord($.get(record).id, 'service', e.target.value));
				$.append($$anchor, input_1);
			};

			$.if(node_3, ($$render) => {
				if ($.get(record).service === 'custom') $$render(consequent);
			});
		}

		$.reset(div_11);
		$.reset(div_10);

		var div_12 = $.sibling(div_10, 2);
		var label_2 = $.child(div_12);

		$.action(label_2, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Transport protocol used by the service (TCP/UDP/TLS/SCTP)');

		var select_1 = $.sibling(label_2, 2);
		var option_2 = $.child(select_1);

		option_2.value = option_2.__value = 'tcp';

		var option_3 = $.sibling(option_2);

		option_3.value = option_3.__value = 'udp';

		var option_4 = $.sibling(option_3);

		option_4.value = option_4.__value = 'tls';

		var option_5 = $.sibling(option_4);

		option_5.value = option_5.__value = 'sctp';
		$.reset(select_1);

		var select_1_value;

		$.init_select(select_1);
		$.reset(div_12);

		var div_13 = $.sibling(div_12, 2);
		var label_3 = $.child(div_13);

		$.action(label_3, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'The domain name where this service is located');

		var input_2 = $.sibling(label_3, 2);

		$.remove_input_defaults(input_2);
		$.reset(div_13);
		$.reset(div_9);

		var div_14 = $.sibling(div_9, 2);
		var div_15 = $.child(div_14);
		var label_4 = $.child(div_15);

		$.action(label_4, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Lower numbers = higher priority');

		var input_3 = $.sibling(label_4, 2);

		$.remove_input_defaults(input_3);
		$.reset(div_15);

		var div_16 = $.sibling(div_15, 2);
		var label_5 = $.child(div_16);

		$.action(label_5, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Load balancing weight for same priority');

		var input_4 = $.sibling(label_5, 2);

		$.remove_input_defaults(input_4);
		$.reset(div_16);

		var div_17 = $.sibling(div_16, 2);
		var label_6 = $.child(div_17);

		$.action(label_6, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Port number where the service is listening (1-65535)');

		var input_5 = $.sibling(label_6, 2);

		$.remove_input_defaults(input_5);
		$.reset(div_17);

		var div_18 = $.sibling(div_17, 2);
		var label_7 = $.child(div_18);

		$.action(label_7, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Fully Qualified Domain Name of the server hosting the service (must end with dot)');

		var input_6 = $.sibling(label_7, 2);

		$.remove_input_defaults(input_6);
		$.reset(div_18);
		$.reset(div_14);
		$.reset(div_8);

		var button_1 = $.sibling(div_8, 2);
		var node_4 = $.child(button_1);

		Icon(node_4, { name: 'trash', size: 'sm' });
		$.reset(button_1);

		var node_5 = $.sibling(button_1, 2);

		{
			var consequent_1 = ($$anchor) => {
				var div_19 = root_3();

				$.each(div_19, 21, () => $.get(validation).issues, $.index, ($$anchor, issue) => {
					var div_20 = root_2();
					var node_6 = $.child(div_20);

					Icon(node_6, { name: 'alert-circle', size: 'xs' });

					var text_2 = $.sibling(node_6);

					$.reset(div_20);
					$.template_effect(() => $.set_text(text_2, ` ${$.get(issue) ?? ''}`));
					$.append($$anchor, div_20);
				});

				$.reset(div_19);
				$.append($$anchor, div_19);
			};

			$.if(node_5, ($$render) => {
				if (!$.get(validation).valid) $$render(consequent_1);
			});
		}

		$.reset(div_7);

		$.template_effect(() => {
			classes = $.set_class(div_7, 1, 'record-row svelte-rfxrrf', null, classes, { error: !$.get(validation).valid });
			$.set_attribute(label_1, 'for', `service-${$.get(record).id ?? ''}`);
			$.set_attribute(select, 'id', `service-${$.get(record).id ?? ''}`);

			if (select_value !== (select_value = $.get(record).service)) {
				(
					select.value = (select.__value = select_value) ?? '',
					$.select_option(select, select_value)
				);
			}

			$.set_attribute(label_2, 'for', `protocol-${$.get(record).id ?? ''}`);
			$.set_attribute(select_1, 'id', `protocol-${$.get(record).id ?? ''}`);

			if (select_1_value !== (select_1_value = $.get(record).protocol)) {
				(
					select_1.value = (select_1.__value = select_1_value) ?? '',
					$.select_option(select_1, select_1_value)
				);
			}

			$.set_attribute(label_3, 'for', `domain-${$.get(record).id ?? ''}`);
			$.set_attribute(input_2, 'id', `domain-${$.get(record).id ?? ''}`);
			$.set_value(input_2, $.get(record).name);
			$.set_attribute(label_4, 'for', `priority-${$.get(record).id ?? ''}`);
			$.set_attribute(input_3, 'id', `priority-${$.get(record).id ?? ''}`);
			$.set_value(input_3, $.get(record).priority);
			$.set_attribute(label_5, 'for', `weight-${$.get(record).id ?? ''}`);
			$.set_attribute(input_4, 'id', `weight-${$.get(record).id ?? ''}`);
			$.set_value(input_4, $.get(record).weight);
			$.set_attribute(label_6, 'for', `port-${$.get(record).id ?? ''}`);
			$.set_attribute(input_5, 'id', `port-${$.get(record).id ?? ''}`);
			$.set_value(input_5, $.get(record).port);
			$.set_attribute(label_7, 'for', `target-${$.get(record).id ?? ''}`);
			$.set_attribute(input_6, 'id', `target-${$.get(record).id ?? ''}`);
			$.set_value(input_6, $.get(record).target);
		});

		$.delegated('change', select, (e) => {
			const serviceName = e.target.value;

			updateRecord($.get(record).id, 'service', serviceName);

			if (serviceName !== 'custom') {
				fillCommonService($.get(record).id, serviceName);
			}
		});

		$.delegated('change', select_1, (e) => updateRecord($.get(record).id, 'protocol', e.target.value));
		$.delegated('input', input_2, (e) => updateRecord($.get(record).id, 'name', e.target.value));
		$.delegated('input', input_3, (e) => updateRecord($.get(record).id, 'priority', parseInt(e.target.value)));
		$.delegated('input', input_4, (e) => updateRecord($.get(record).id, 'weight', parseInt(e.target.value)));
		$.delegated('input', input_5, (e) => updateRecord($.get(record).id, 'port', parseInt(e.target.value)));
		$.delegated('input', input_6, (e) => updateRecord($.get(record).id, 'target', e.target.value));
		$.delegated('click', button_1, () => removeSRVRecord($.get(record).id));
		$.append($$anchor, div_7);
	});

	$.reset(div_6);
	$.reset(div_5);
	$.reset(div_2);

	var div_21 = $.sibling(div_2, 2);
	var details = $.child(div_21);
	var summary = $.child(details);
	var node_7 = $.child(summary);

	Icon(node_7, { name: 'lightbulb', size: 'sm' });
	$.next();
	$.reset(summary);

	var div_22 = $.sibling(summary, 2);

	$.each(div_22, 21, () => examples, (example) => example.label, ($$anchor, example) => {
		var button_2 = root_5();
		var h4 = $.child(button_2);
		var text_3 = $.only_child(h4, true);
		var p = $.sibling(h4, 2);
		var text_4 = $.only_child(p);

		$.reset(button_2);

		$.template_effect(() => {
			$.set_text(text_3, $.get(example).label);
			$.set_text(text_4, `${$.get(example).records.length ?? ''} SRV records`);
		});

		$.delegated('click', button_2, () => loadExample($.get(example)));
		$.append($$anchor, button_2);
	});

	$.reset(div_22);
	$.reset(details);
	$.next(2);
	$.reset(div_21);
	$.reset(div_1);

	var node_8 = $.sibling(div_1, 2);

	{
		var consequent_3 = ($$anchor) => {
			var div_23 = root_9();
			var div_24 = $.child(div_23);
			var div_25 = $.sibling($.child(div_24), 2);
			var button_3 = $.child(div_25);
			var node_9 = $.child(button_3);

			Icon(node_9, { name: 'copy', size: 'sm' });
			$.next();
			$.reset(button_3);
			$.reset(div_25);
			$.reset(div_24);

			var div_26 = $.sibling(div_24, 2);
			var div_27 = $.child(div_26);
			var div_28 = $.child(div_27);

			$.action(div_28, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Service name and protocol');

			var div_29 = $.sibling(div_28, 2);

			$.action(div_29, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Time To Live - how long DNS resolvers should cache this record');

			var div_30 = $.sibling(div_29, 2);

			$.action(div_30, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'DNS record type (always SRV for service records)');

			var div_31 = $.sibling(div_30, 2);

			$.action(div_31, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Priority - lower values are preferred (0-65535)');

			var div_32 = $.sibling(div_31, 2);

			$.action(div_32, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Weight for load balancing among same priority records (0-65535)');

			var div_33 = $.sibling(div_32, 2);

			$.action(div_33, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Port number where the service is available');

			var div_34 = $.sibling(div_33, 2);

			$.action(div_34, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Target server hostname (FQDN)');

			var div_35 = $.sibling(div_34, 2);

			$.action(div_35, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Validation status of this SRV record');
			$.reset(div_27);

			var node_10 = $.sibling(div_27, 2);

			$.each(node_10, 17, () => $.get(srvRecords), (record) => record.id, ($$anchor, record) => {
				const validation = $.derived(() => validateSRVRecord($.get(record)));
				var div_36 = root_6();
				let classes_1;
				var div_37 = $.child(div_36);
				var text_5 = $.only_child(div_37);
				var div_38 = $.sibling(div_37, 2);
				var text_6 = $.only_child(div_38, true);
				var div_39 = $.sibling(div_38, 4);
				var text_7 = $.only_child(div_39, true);
				var div_40 = $.sibling(div_39, 2);
				var text_8 = $.only_child(div_40, true);
				var div_41 = $.sibling(div_40, 2);
				var text_9 = $.only_child(div_41, true);
				var div_42 = $.sibling(div_41, 2);
				var text_10 = $.only_child(div_42, true);
				var div_43 = $.sibling(div_42, 2);
				var span = $.child(div_43);
				var node_11 = $.child(span);

				{
					let $0 = $.derived(() => $.get(validation).valid ? 'check-circle' : 'x-circle');

					Icon(node_11, {
						get name() {
							return $.get($0);
						},
						size: 'xs'
					});
				}

				var text_11 = $.sibling(node_11);

				$.reset(span);
				$.reset(div_43);
				$.reset(div_36);

				$.template_effect(() => {
					classes_1 = $.set_class(div_36, 1, 'table-row svelte-rfxrrf', null, classes_1, { error: !$.get(validation).valid });
					$.set_text(text_5, `${$.get(record).service ?? ''}.${$.get(record).protocol ?? ''}.${$.get(record).name ?? ''}`);
					$.set_text(text_6, $.get(record).ttl);
					$.set_text(text_7, $.get(record).priority);
					$.set_text(text_8, $.get(record).weight);
					$.set_text(text_9, $.get(record).port);
					$.set_text(text_10, $.get(record).target);
					$.set_class(span, 1, `status-badge ${$.get(validation).valid ? 'success' : 'error'}`, 'svelte-rfxrrf');
					$.set_text(text_11, ` ${$.get(validation).valid ? 'Valid' : 'Issues'}`);
				});

				$.append($$anchor, div_36);
			});

			$.reset(div_26);

			var node_12 = $.sibling(div_26, 2);

			{
				var consequent_2 = ($$anchor) => {
					var div_44 = root_8();
					var h3 = $.child(div_44);
					var node_13 = $.child(h3);

					Icon(node_13, { name: 'alert-triangle', size: 'sm' });
					$.next();
					$.reset(h3);

					var ul = $.sibling(h3, 2);

					$.each(ul, 21, () => $.get(srvRecords).filter((r) => !validateSRVRecord(r).valid), (record) => record.id, ($$anchor, record) => {
						const validation = $.derived(() => validateSRVRecord($.get(record)));
						var li = root_7();
						var strong = $.child(li);
						var text_12 = $.only_child(strong);
						var text_13 = $.sibling(strong);

						$.reset(li);

						$.template_effect(
							($0) => {
								$.set_text(text_12, `${$.get(record).service ?? ''}.${$.get(record).protocol ?? ''}.${$.get(record).name ?? ''}`);
								$.set_text(text_13, `: ${$0 ?? ''}`);
							},
							[() => $.get(validation).issues.join(', ')]
						);

						$.append($$anchor, li);
					});

					$.reset(ul);
					$.reset(div_44);
					$.append($$anchor, div_44);
				};

				var d = $.derived(() => $.get(srvRecords).some((r) => !validateSRVRecord(r).valid));

				$.if(node_12, ($$render) => {
					if ($.get(d)) $$render(consequent_2);
				});
			}

			$.reset(div_23);
			$.delegated('click', button_3, () => copyToClipboard(generateSRVRecords()));
			$.append($$anchor, div_23);
		};

		$.if(node_8, ($$render) => {
			if ($.get(srvRecords).length > 0) $$render(consequent_3);
		});
	}

	$.reset(div);
	$.bind_value(input, () => $.get(ttl), ($$value) => $.set(ttl, $$value));
	$.delegated('click', button, addSRVRecord);
	$.bind_property('open', 'toggle', details, ($$value) => $.set(showExamples, $$value), () => $.get(showExamples));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'change', 'input']);