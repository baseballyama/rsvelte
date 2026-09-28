import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tooltip } from '$lib/actions/tooltip.js';
import Icon from '$lib/components/global/Icon.svelte';
import { useDiagnosticState, useClipboard, useExamples } from '$lib/composables';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import ErrorCard from '$lib/components/common/ErrorCard.svelte';
import '../../../../styles/diagnostics-pages.scss';

var root = $.from_html(`<span class="error-text">Use format: hostname:port (one per line)</span>`);
var root_1 = $.from_html(`<button type="button" class="port-btn svelte-s5gnjv"> </button>`);
var root_2 = $.from_html(`<!> Checking Ports...`, 1);
var root_3 = $.from_html(`<!> Check Ports`, 1);
var root_4 = $.from_html(`<div class="status-item"><!> <div><span class="status-title svelte-s5gnjv"> </span> <p class="status-desc svelte-s5gnjv">Average latency</p></div></div>`);
var root_5 = $.from_html(`<div class="port-error svelte-s5gnjv"><span class="error-detail svelte-s5gnjv"> </span></div>`);
var root_6 = $.from_html(`<div><div class="port-header svelte-s5gnjv"><div class="port-target svelte-s5gnjv"><!> <span class="host-port mono svelte-s5gnjv"> </span></div> <span class="port-status svelte-s5gnjv"> </span></div> <!></div>`);
var root_7 = $.from_html(`<div class="card results-card"><div class="card-header row"><h3>Port Check Results</h3> <button class="copy-btn"><!> </button></div> <div class="card-content"><div class="status-overview"><div class="status-item success"><!> <div><span class="status-title svelte-s5gnjv"> </span> <p class="status-desc svelte-s5gnjv">Ports accepting connections</p></div></div> <div class="status-item error"><!> <div><span class="status-title svelte-s5gnjv"> </span> <p class="status-desc svelte-s5gnjv">Ports not responding</p></div></div> <!></div> <div class="ports-section svelte-s5gnjv"><h4 class="svelte-s5gnjv"> </h4> <div class="ports-list svelte-s5gnjv"></div></div></div></div>`);

var root_8 = $.from_html(`<div class="card"><header class="card-header"><h1>TCP Port Checker</h1> <p>Test TCP connectivity to one or more host:port combinations. Attempts direct TCP connections to check if ports are
      open and measures connection latency.</p></header> <!> <div class="card input-card"><div class="card-header"><h3>Port Check Configuration</h3></div> <div class="card-content"><div class="form-row"><div class="form-group"><label for="targets">Target Hosts & Ports <textarea id="targets" placeholder="google.com:443
github.com:22
example.com:80" rows="6"></textarea> <div class="input-help svelte-s5gnjv"><span class="target-count svelte-s5gnjv"> </span> <!></div></label></div></div> <div class="form-row"><div class="form-group"><h3>Common Ports</h3> <div class="port-shortcuts svelte-s5gnjv"></div></div></div> <div class="form-row"><div class="form-group"><label for="timeout">Timeout (ms) <input id="timeout" type="number" min="1000" max="30000" step="1000"/></label></div></div> <div class="action-section"><button class="lookup-btn"><!></button></div></div></div> <!> <!> <div class="card info-card"><div class="card-header"><h3>Understanding TCP Port Connectivity</h3></div> <div class="card-content"><div class="info-grid"><div class="info-section"><h4>Port States</h4> <ul><li><strong>Open:</strong> Port accepts connections and responds</li> <li><strong>Closed:</strong> Port actively refuses connections</li> <li><strong>Filtered:</strong> Port blocked by firewall (appears as timeout)</li> <li><strong>Timeout:</strong> No response within timeout period</li></ul></div> <div class="info-section"><h4>Common Ports</h4> <ul><li><strong>SSH (22):</strong> Secure remote access</li> <li><strong>HTTP (80):</strong> Web traffic</li> <li><strong>HTTPS (443):</strong> Secure web traffic</li> <li><strong>SMTP (25/587):</strong> Email sending</li></ul></div> <div class="info-section"><h4>Troubleshooting Tips</h4> <ul><li>Timeouts often indicate firewall blocking</li> <li>Connection refused means service is not running</li> <li>Check both client and server firewalls</li> <li>Verify service is listening on expected port</li></ul></div></div></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let targets = $.state('google.com:443\ngithub.com:443\nstackoverflow.com:443');
	let timeout = $.state(5000);
	const diagnosticState = useDiagnosticState();
	const clipboard = useClipboard();

	const examplesList = [
		{
			targets: 'google.com:443\ngithub.com:443\nstackoverflow.com:443',
			description: 'Common HTTPS ports'
		},

		{
			targets: 'smtp.gmail.com:587\nsmtp.gmail.com:465\nsmtp.gmail.com:25',
			description: 'Gmail SMTP ports'
		},

		{
			targets: 'dns.google:53\n1.1.1.1:53\n8.8.8.8:53',
			description: 'DNS server ports'
		},

		{
			targets: 'reddit.com:80\nreddit.com:443\napi.reddit.com:443',
			description: 'HTTP vs HTTPS ports'
		},

		{
			targets: 'localhost:22\nlocalhost:80\nlocalhost:443\nlocalhost:3306\nlocalhost:5432',
			description: 'Local development ports'
		},

		{
			targets: 'microsoft.com:443\noffice.com:443\noutlook.com:443',
			description: 'Microsoft services'
		}
	];

	const examples = useExamples(examplesList);

	const commonPorts = [
		{ port: '22', service: 'SSH', description: 'Secure Shell' },
		{ port: '80', service: 'HTTP', description: 'Web traffic' },
		{
			port: '443',
			service: 'HTTPS',
			description: 'Secure web traffic'
		},
		{ port: '25', service: 'SMTP', description: 'Email sending' },
		{
			port: '587',
			service: 'SMTP',
			description: 'Email submission'
		},
		{ port: '993', service: 'IMAPS', description: 'Secure IMAP' },
		{ port: '995', service: 'POP3S', description: 'Secure POP3' },
		{ port: '53', service: 'DNS', description: 'Domain resolution' }
	];

	// Reactive validation
	const targetsList = $.derived(() => () => {
		return $.get(targets).split('\n').map((t) => t.trim()).filter((t) => t).slice(0, 50); // Limit to 50 targets
	});

	const isInputValid = $.derived(() => () => {
		return $.get(targetsList)().length > 0 && $.get(targetsList)().every((target) => (/^[a-zA-Z0-9.-]+:\d+$/).test(target));
	});

	async function checkPorts() {
		diagnosticState.startOperation();

		// Calculate targets list at function call time
		const currentTargets = $.get(targets).split('\n').map((t) => t.trim()).filter((t) => t).slice(0, 50);

		try {
			const response = await fetch('/api/internal/diagnostics/network', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					action: 'tcp-port-check',
					targets: currentTargets,
					timeout: $.get(timeout)
				})
			});

			if (!response.ok) {
				const errorText = await response.text();

				try {
					const errorData = JSON.parse(errorText);

					throw new Error(errorData.message || `Port check failed (${response.status})`);
				} catch {
					// If JSON parsing fails, use the raw error text or status
					throw new Error(errorText || `Port check failed (${response.status})`);
				}
			}

			const data = await response.json();

			diagnosticState.setResults(data);
		} catch(err) {
			diagnosticState.setError(err.message);
		}
	}

	function loadExample(example, index) {
		$.set(targets, example.targets, true);
		$.set(timeout, 5000);
		examples.select(index);
		checkPorts();
	}

	function addCommonPort(port) {
		const currentTargets = $.get(targets).trim();
		const newTarget = `example.com:${port}`;

		$.set(targets, currentTargets ? `${currentTargets}\n${newTarget}` : newTarget, true);
		examples.clear();
	}

	function getPortStatus(result) {
		if (result.open) {
			return {
				icon: 'check-circle',
				class: 'success',
				text: `Open (${result.latency}ms)`
			};
		} else {
			return {
				icon: 'x-circle',
				class: 'error',
				text: result.error || 'Closed'
			};
		}
	}

	async function copyResults() {
		if (!diagnosticState.results) return;

		let text = `TCP Port Check Results\n`;

		text += `Generated at: ${new Date().toISOString()}\n\n`;
		text += `Summary:\n`;
		text += `  Total ports: ${diagnosticState.results.summary.total}\n`;
		text += `  Open: ${diagnosticState.results.summary.open}\n`;
		text += `  Closed: ${diagnosticState.results.summary.closed}\n`;

		if (diagnosticState.results.summary.avgLatency) {
			text += `  Average latency: ${diagnosticState.results.summary.avgLatency}ms\n`;
		}

		text += `\nResults:\n`;

		diagnosticState.results.results.forEach((result) => {
			const status = result.open
				? `OPEN (${result.latency}ms)`
				: `CLOSED${result.error ? ` - ${result.error}` : ''}`;

			text += `  ${result.host}:${result.port} - ${status}\n`;
		});

		await clipboard.copy(text);
	}

	var div = root_8();
	var node = $.sibling($.child(div), 2);

	ExamplesCard(node, {
		get examples() {
			return examplesList;
		},

		get selectedIndex() {
			return examples.selectedIndex;
		},
		onSelect: loadExample,
		title: 'Port Check Examples',
		getLabel: (ex) => ex.description,
		getDescription: (ex) => {
			const targets = ex.targets.split('\n');
			const preview = targets.slice(0, 3).join(', ');

			return targets.length > 3 ? `${preview} (+${targets.length - 3} more)` : preview;
		},
		getTooltip: (ex) => `Test ports: ${ex.targets.split('\n').join(', ')}`
	});

	var div_1 = $.sibling(node, 2);
	var div_2 = $.sibling($.child(div_1), 2);
	var div_3 = $.child(div_2);
	var div_4 = $.child(div_3);
	var label = $.child(div_4);
	var textarea = $.sibling($.child(label));

	$.remove_textarea_child(textarea);

	let classes;
	var div_5 = $.sibling(textarea, 2);
	var span = $.child(div_5);
	var text_1 = $.only_child(span);
	var node_1 = $.sibling(span, 2);

	{
		var consequent = ($$anchor) => {
			var span_1 = root();

			$.append($$anchor, span_1);
		};

		$.if(node_1, ($$render) => {
			if ($.get(targets) && !$.get(isInputValid)) $$render(consequent);
		});
	}

	$.reset(div_5);
	$.reset(label);
	$.action(label, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Enter host:port combinations, one per line (max 50)');
	$.reset(div_4);
	$.reset(div_3);

	var div_6 = $.sibling(div_3, 2);
	var div_7 = $.child(div_6);
	var div_8 = $.sibling($.child(div_7), 2);

	$.each(div_8, 21, () => commonPorts, $.index, ($$anchor, port) => {
		var button = root_1();
		var text_2 = $.only_child(button);

		$.action(button, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => `${$.get(port).service}: ${$.get(port).description}`);
		$.template_effect(() => $.set_text(text_2, `${$.get(port).port ?? ''} (${$.get(port).service ?? ''})`));
		$.delegated('click', button, () => addCommonPort($.get(port).port));
		$.append($$anchor, button);
	});

	$.reset(div_8);
	$.reset(div_7);
	$.reset(div_6);

	var div_9 = $.sibling(div_6, 2);
	var div_10 = $.child(div_9);
	var label_1 = $.child(div_10);
	var input = $.sibling($.child(label_1));

	$.remove_input_defaults(input);
	$.reset(label_1);
	$.action(label_1, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => 'Connection timeout in milliseconds');
	$.reset(div_10);
	$.reset(div_9);

	var div_11 = $.sibling(div_9, 2);
	var button_1 = $.child(div_11);
	var node_2 = $.child(button_1);

	{
		var consequent_1 = ($$anchor) => {
			var fragment = root_2();
			var node_3 = $.first_child(fragment);

			Icon(node_3, { name: 'loader-2', size: 'sm', animate: 'spin' });
			$.next();
			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = root_3();
			var node_4 = $.first_child(fragment_1);

			Icon(node_4, { name: 'activity', size: 'sm' });
			$.next();
			$.append($$anchor, fragment_1);
		};

		$.if(node_2, ($$render) => {
			if (diagnosticState.loading) $$render(consequent_1); else $$render(alternate, -1);
		});
	}

	$.reset(button_1);
	$.reset(div_11);
	$.reset(div_2);
	$.reset(div_1);

	var node_5 = $.sibling(div_1, 2);

	{
		var consequent_4 = ($$anchor) => {
			var div_12 = root_7();
			var div_13 = $.child(div_12);
			var button_2 = $.sibling($.child(div_13), 2);
			var node_6 = $.child(button_2);

			{
				let $0 = $.derived(() => clipboard.isCopied() ? 'check' : 'copy');

				Icon(node_6, {
					get name() {
						return $.get($0);
					},
					size: 'xs'
				});
			}

			var text_3 = $.sibling(node_6);

			$.reset(button_2);
			$.reset(div_13);

			var div_14 = $.sibling(div_13, 2);
			var div_15 = $.child(div_14);
			var div_16 = $.child(div_15);
			var node_7 = $.child(div_16);

			Icon(node_7, { name: 'check-circle', size: 'sm' });

			var div_17 = $.sibling(node_7, 2);
			var span_2 = $.child(div_17);
			var text_4 = $.only_child(span_2);

			$.next(2);
			$.reset(div_17);
			$.reset(div_16);

			var div_18 = $.sibling(div_16, 2);
			var node_8 = $.child(div_18);

			Icon(node_8, { name: 'x-circle', size: 'sm' });

			var div_19 = $.sibling(node_8, 2);
			var span_3 = $.child(div_19);
			var text_5 = $.only_child(span_3);

			$.next(2);
			$.reset(div_19);
			$.reset(div_18);

			var node_9 = $.sibling(div_18, 2);

			{
				var consequent_2 = ($$anchor) => {
					var div_20 = root_4();
					var node_10 = $.child(div_20);

					Icon(node_10, { name: 'zap', size: 'sm' });

					var div_21 = $.sibling(node_10, 2);
					var span_4 = $.child(div_21);
					var text_6 = $.only_child(span_4);

					$.next(2);
					$.reset(div_21);
					$.reset(div_20);
					$.template_effect(() => $.set_text(text_6, `${diagnosticState.results.summary.avgLatency ?? ''}ms`));
					$.append($$anchor, div_20);
				};

				$.if(node_9, ($$render) => {
					if (diagnosticState.results.summary.avgLatency) $$render(consequent_2);
				});
			}

			$.reset(div_15);

			var div_22 = $.sibling(div_15, 2);
			var h4 = $.child(div_22);
			var text_7 = $.only_child(h4);
			var div_23 = $.sibling(h4, 2);

			$.each(div_23, 21, () => diagnosticState.results.results, $.index, ($$anchor, result) => {
				const status = $.derived(() => getPortStatus($.get(result)));
				var div_24 = root_6();
				var div_25 = $.child(div_24);
				var div_26 = $.child(div_25);
				var node_11 = $.child(div_26);

				Icon(node_11, {
					get name() {
						return $.get(status).icon;
					},
					size: 'sm'
				});

				var span_5 = $.sibling(node_11, 2);
				var text_8 = $.only_child(span_5);

				$.reset(div_26);

				var span_6 = $.sibling(div_26, 2);
				var text_9 = $.only_child(span_6, true);

				$.reset(div_25);

				var node_12 = $.sibling(div_25, 2);

				{
					var consequent_3 = ($$anchor) => {
						var div_27 = root_5();
						var span_7 = $.child(div_27);
						var text_10 = $.only_child(span_7, true);

						$.reset(div_27);
						$.template_effect(() => $.set_text(text_10, $.get(result).error));
						$.append($$anchor, div_27);
					};

					$.if(node_12, ($$render) => {
						if ($.get(result).error && !$.get(result).open) $$render(consequent_3);
					});
				}

				$.reset(div_24);

				$.template_effect(() => {
					$.set_class(div_24, 1, `port-result ${$.get(status).class ?? ''}`, 'svelte-s5gnjv');
					$.set_text(text_8, `${$.get(result).host ?? ''}:${$.get(result).port ?? ''}`);
					$.set_text(text_9, $.get(status).text);
				});

				$.append($$anchor, div_24);
			});

			$.reset(div_23);
			$.reset(div_22);
			$.reset(div_14);
			$.reset(div_12);

			$.template_effect(
				($0, $1) => {
					button_2.disabled = $0;
					$.set_text(text_3, ` ${$1 ?? ''}`);
					$.set_text(text_4, `${diagnosticState.results.summary.open ?? ''} Open`);
					$.set_text(text_5, `${diagnosticState.results.summary.closed ?? ''} Closed`);
					$.set_text(text_7, `Port Status (${diagnosticState.results.results.length ?? ''} targets)`);
				},
				[
					() => clipboard.isCopied(),
					() => clipboard.isCopied() ? 'Copied!' : 'Copy Results'
				]
			);

			$.delegated('click', button_2, copyResults);
			$.append($$anchor, div_12);
		};

		$.if(node_5, ($$render) => {
			if (diagnosticState.results) $$render(consequent_4);
		});
	}

	var node_13 = $.sibling(node_5, 2);

	ErrorCard(node_13, {
		title: 'Port Check Failed',
		get error() {
			return diagnosticState.error;
		}
	});

	$.next(2);
	$.reset(div);

	$.template_effect(
		($0, $1) => {
			classes = $.set_class(textarea, 1, 'svelte-s5gnjv', null, classes, { invalid: $0 });
			$.set_text(text_1, `${$.get(targetsList).length ?? ''}/50 targets`);
			button_1.disabled = $1;
		},
		[
			() => $.get(targets) && !$.get(isInputValid)(),
			() => diagnosticState.loading || !$.get(isInputValid)()
		]
	);

	$.delegated('change', textarea, () => {
		examples.clear();

		if ($.get(isInputValid)()) checkPorts();
	});

	$.bind_value(textarea, () => $.get(targets), ($$value) => $.set(targets, $$value));

	$.delegated('change', input, () => {
		examples.clear();

		if ($.get(isInputValid)()) checkPorts();
	});

	$.bind_value(input, () => $.get(timeout), ($$value) => $.set(timeout, $$value));
	$.delegated('click', button_1, checkPorts);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['change', 'click']);