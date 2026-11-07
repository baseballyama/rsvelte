import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '$lib/components/global/Icon.svelte';
import { useDiagnosticState, useClipboard, useExamples } from '$lib/composables';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import ErrorCard from '$lib/components/common/ErrorCard.svelte';
import '../../../../styles/diagnostics-pages.scss';

var root = $.from_html(`<span class="error-text svelte-uleveb">Invalid host:port format</span>`);
var root_1 = $.from_html(`<input type="text" placeholder="example.com"/>`);
var root_2 = $.from_html(`<!> Probing TLS Versions...`, 1);
var root_3 = $.from_html(`<!> Probe TLS Versions`, 1);
var root_4 = $.from_html(`<div class="version-error svelte-uleveb"><span class="error-detail svelte-uleveb"> </span></div>`);
var root_5 = $.from_html(`<div class="version-warning svelte-uleveb"><!> <span>This version is deprecated and should not be used</span></div>`);
var root_6 = $.from_html(`<div><div class="version-header svelte-uleveb"><div class="version-info svelte-uleveb"><!> <div class="svelte-uleveb"><span class="version-name svelte-uleveb"> </span> <span class="version-code mono svelte-uleveb"> </span></div></div> <span class="version-status svelte-uleveb"> </span></div> <!> <!></div>`);
var root_7 = $.from_html(`<div class="range-section svelte-uleveb"><h4 class="svelte-uleveb">Supported Version Range</h4> <div class="range-info svelte-uleveb"><div class="range-item svelte-uleveb"><span class="range-label svelte-uleveb">Minimum Version:</span> <span class="range-value mono svelte-uleveb"> </span></div> <div class="range-item svelte-uleveb"><span class="range-label svelte-uleveb">Maximum Version:</span> <span class="range-value mono svelte-uleveb"> </span></div></div></div>`);
var root_8 = $.from_html(`<div class="security-overview svelte-uleveb"><div class="status-overview"><div><!> <div class="svelte-uleveb"><span class="status-title svelte-uleveb"> </span> <p class="status-desc svelte-uleveb"> </p></div></div> <div class="status-item success"><!> <div><span class="status-title svelte-uleveb"> </span> <p class="status-desc svelte-uleveb"> </p></div></div></div></div> <div class="versions-section svelte-uleveb"><h4 class="svelte-uleveb">TLS Version Support</h4> <div class="versions-grid svelte-uleveb"></div></div> <!>`, 1);
var root_9 = $.from_html(`<div class="card results-card"><div class="card-header row"><h3>TLS Versions Probe Results</h3> <button class="copy-btn"><!> </button></div> <div class="card-content"><!></div></div>`);

var root_10 = $.from_html(`<div class="card"><header class="card-header"><h1>TLS Versions Probe</h1> <p>Test which TLS protocol versions a server supports by attempting connections with different TLS version
      constraints. Identify deprecated versions and assess overall TLS security posture.</p></header> <!> <div class="card input-card"><div class="card-header"><h3>TLS Versions Probe Configuration</h3></div> <div class="card-content"><div class="form-row"><div class="form-group"><label for="host">Host:Port <input id="host" type="text" placeholder="google.com:443"/> <!></label></div></div> <div class="form-row"><div class="form-group"><label class="checkbox-group"><input type="checkbox"/> Use custom SNI servername</label> <!></div></div> <div class="action-section"><button class="lookup-btn"><!></button></div></div></div> <!> <!> <div class="card info-card"><div class="card-header"><h3>Understanding TLS Versions</h3></div> <div class="card-content"><div class="info-grid"><div class="info-section"><h4>TLS Version Security</h4> <ul><li><strong>TLS 1.3:</strong> Latest version with improved security and performance</li> <li><strong>TLS 1.2:</strong> Widely supported, secure when properly configured</li> <li><strong>TLS 1.1:</strong> Deprecated, should not be used</li> <li><strong>TLS 1.0:</strong> Deprecated, contains security vulnerabilities</li></ul></div> <div class="info-section"><h4>Best Practices</h4> <ul><li>Enable TLS 1.2 and 1.3 only</li> <li>Disable deprecated versions (TLS 1.0, 1.1)</li> <li>Regularly update TLS implementations</li> <li>Use strong cipher suites</li></ul></div> <div class="info-section"><h4>Compliance Requirements</h4> <p>Many compliance standards (PCI DSS, HIPAA) require disabling deprecated TLS versions. Check your specific
            requirements.</p></div></div></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let host = $.state('google.com:443');
	let servername = $.state('');
	let useCustomServername = $.state(false);
	const diagnosticState = useDiagnosticState();
	const clipboard = useClipboard();

	const examplesList = [
		{
			host: 'google.com:443',
			description: 'Google TLS version support'
		},
		{ host: 'github.com:443', description: 'GitHub TLS versions' },
		{
			host: 'cloudflare.com:443',
			description: 'Cloudflare TLS support'
		},

		{
			host: 'microsoft.com:443',
			description: 'Microsoft TLS versions'
		},

		{
			host: 'amazon.com:443',
			description: 'Amazon TLS configuration'
		},

		{
			host: 'facebook.com:443',
			description: 'Facebook TLS versions'
		}
	];

	const examples = useExamples(examplesList);

	const tlsVersions = [
		{ version: 'TLSv1', name: 'TLS 1.0', deprecated: true },
		{ version: 'TLSv1.1', name: 'TLS 1.1', deprecated: true },
		{ version: 'TLSv1.2', name: 'TLS 1.2', deprecated: false },
		{ version: 'TLSv1.3', name: 'TLS 1.3', deprecated: false }
	];

	// Reactive validation
	const isInputValid = $.derived(() => () => {
		const trimmedHost = $.get(host).trim();

		if (!trimmedHost) return false;

		return (/^[a-zA-Z0-9.-]+(?::\d+)?$/).test(trimmedHost);
	});

	async function probeTLSVersions() {
		diagnosticState.startOperation();

		try {
			const response = await fetch('/api/internal/diagnostics/tls', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					action: 'versions',
					host: $.get(host).trim(),
					servername: $.get(useCustomServername) && $.get(servername) ? $.get(servername).trim() : undefined
				})
			});

			if (!response.ok) {
				const errorText = await response.text();

				try {
					const errorData = JSON.parse(errorText);

					throw new Error(errorData.message || `TLS versions probe failed (${response.status})`);
				} catch {
					throw new Error(`TLS versions probe failed (${response.status})`);
				}
			}

			diagnosticState.setResults(await response.json());
		} catch(err) {
			diagnosticState.setError(err instanceof Error ? err.message : 'Unknown error occurred');
		}
	}

	function loadExample(example, index) {
		$.set(host, example.host, true);
		$.set(servername, '');
		$.set(useCustomServername, false);
		examples.select(index);
		probeTLSVersions();
	}

	function getVersionStatus(version, supported, deprecated) {
		if (!supported) {
			return { status: 'Not Supported', icon: 'x-circle', class: 'error' };
		}

		if (deprecated) {
			return {
				status: 'Supported (Deprecated)',
				icon: 'alert-triangle',
				class: 'warning'
			};
		}

		return { status: 'Supported', icon: 'check-circle', class: 'success' };
	}

	function getOverallSecurity() {
		if (!diagnosticState.results) return {
			level: 'Unknown',
			class: 'secondary',
			icon: 'help-circle',
			description: 'No results available'
		};

		const supportedVersions = diagnosticState.results.supportedVersions || [];
		const hasDeprecated = supportedVersions.some((v) => v === 'TLSv1' || v === 'TLSv1.1');
		const hasModern = supportedVersions.includes('TLSv1.3');
		const hasSecure = supportedVersions.includes('TLSv1.2');

		if (hasModern && hasSecure && !hasDeprecated) {
			return {
				level: 'Excellent',
				class: 'success',
				icon: 'shield-check',
				description: 'Only modern TLS versions supported'
			};
		}

		if (hasSecure && !hasDeprecated) {
			return {
				level: 'Good',
				class: 'success',
				icon: 'shield',
				description: 'Secure TLS versions only'
			};
		}

		if (hasDeprecated && hasSecure) {
			return {
				level: 'Warning',
				class: 'warning',
				icon: 'shield-alert',
				description: 'Deprecated versions still supported'
			};
		}

		if (supportedVersions.length === 0) {
			return {
				level: 'Critical',
				class: 'error',
				icon: 'shield-off',
				description: 'No TLS versions detected'
			};
		}

		return {
			level: 'Poor',
			class: 'error',
			icon: 'shield-x',
			description: 'Only deprecated versions supported'
		};
	}

	async function copyVersionsInfo() {
		if (!diagnosticState.results) return;

		let text = `TLS Versions Analysis for ${$.get(host)}\n`;

		text += `Generated at: ${new Date().toISOString()}\n\n`;
		text += `Supported Versions (${diagnosticState.results.totalSupported}):\n`;

		tlsVersions.forEach((tlsVer) => {
			const supported = diagnosticState.results.supported[tlsVer.version];

			text += `  ${tlsVer.name} (${tlsVer.version}): ${supported ? 'Supported' : 'Not Supported'}`;

			if (supported && tlsVer.deprecated) {
				text += ' (DEPRECATED)';
			}

			text += '\n';
		});

		const security = getOverallSecurity();

		text += `\nSecurity Level: ${security.level}\n`;
		text += `Description: ${security.description}\n`;

		if (diagnosticState.results.minVersion || diagnosticState.results.maxVersion) {
			text += `\nVersion Range:\n`;
			text += `  Minimum: ${diagnosticState.results.minVersion || 'Unknown'}\n`;
			text += `  Maximum: ${diagnosticState.results.maxVersion || 'Unknown'}\n`;
		}

		clipboard.copy(text);
	}

	var div = root_10();
	var node = $.sibling($.child(div), 2);

	ExamplesCard(node, {
		get examples() {
			return examplesList;
		},

		get selectedIndex() {
			return examples.selectedIndex;
		},
		onSelect: loadExample,
		title: 'TLS Version Examples',
		getLabel: (ex) => ex.host,
		getDescription: (ex) => ex.description,
		getTooltip: (ex) => `Probe TLS versions for ${ex.host} (${ex.description})`
	});

	var div_1 = $.sibling(node, 2);
	var div_2 = $.sibling($.child(div_1), 2);
	var div_3 = $.child(div_2);
	var div_4 = $.child(div_3);
	var label = $.child(div_4);
	var input = $.sibling($.child(label));

	$.remove_input_defaults(input);

	let classes;
	var node_1 = $.sibling(input, 2);

	{
		var consequent = ($$anchor) => {
			var span = root();

			$.append($$anchor, span);
		};

		$.if(node_1, ($$render) => {
			if ($.get(host) && !$.get(isInputValid)) $$render(consequent);
		});
	}

	$.reset(label);
	$.reset(div_4);
	$.reset(div_3);

	var div_5 = $.sibling(div_3, 2);
	var div_6 = $.child(div_5);
	var label_1 = $.child(div_6);
	var input_1 = $.child(label_1);

	$.remove_input_defaults(input_1);
	$.next();
	$.reset(label_1);

	var node_2 = $.sibling(label_1, 2);

	{
		var consequent_1 = ($$anchor) => {
			var input_2 = root_1();

			$.remove_input_defaults(input_2);

			$.delegated('change', input_2, () => {
				examples.clear();

				if ($.get(isInputValid)()) probeTLSVersions();
			});

			$.bind_value(input_2, () => $.get(servername), ($$value) => $.set(servername, $$value));
			$.append($$anchor, input_2);
		};

		$.if(node_2, ($$render) => {
			if ($.get(useCustomServername)) $$render(consequent_1);
		});
	}

	$.reset(div_6);
	$.reset(div_5);

	var div_7 = $.sibling(div_5, 2);
	var button = $.child(div_7);
	var node_3 = $.child(button);

	{
		var consequent_2 = ($$anchor) => {
			var fragment = root_2();
			var node_4 = $.first_child(fragment);

			Icon(node_4, { name: 'loader', size: 'sm', animate: 'spin' });
			$.next();
			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = root_3();
			var node_5 = $.first_child(fragment_1);

			Icon(node_5, { name: 'search', size: 'sm' });
			$.next();
			$.append($$anchor, fragment_1);
		};

		$.if(node_3, ($$render) => {
			if (diagnosticState.loading) $$render(consequent_2); else $$render(alternate, -1);
		});
	}

	$.reset(button);
	$.reset(div_7);
	$.reset(div_2);
	$.reset(div_1);

	var node_6 = $.sibling(div_1, 2);

	{
		var consequent_7 = ($$anchor) => {
			var div_8 = root_9();
			var div_9 = $.child(div_8);
			var button_1 = $.sibling($.child(div_9), 2);
			var node_7 = $.child(button_1);

			{
				let $0 = $.derived(() => clipboard.isCopied() ? 'check' : 'copy');

				Icon(node_7, {
					get name() {
						return $.get($0);
					},
					size: 'xs'
				});
			}

			var text_1 = $.sibling(node_7);

			$.reset(button_1);
			$.reset(div_9);

			var div_10 = $.sibling(div_9, 2);
			var node_8 = $.child(div_10);

			{
				var consequent_6 = ($$anchor) => {
					const security = $.derived(getOverallSecurity);
					var fragment_2 = root_8();
					var div_11 = $.first_child(fragment_2);
					var div_12 = $.child(div_11);
					var div_13 = $.child(div_12);
					var node_9 = $.child(div_13);

					Icon(node_9, {
						get name() {
							return $.get(security).icon;
						},
						size: 'sm'
					});

					var div_14 = $.sibling(node_9, 2);
					var span_1 = $.child(div_14);
					var text_2 = $.only_child(span_1);
					var p = $.sibling(span_1, 2);
					var text_3 = $.only_child(p, true);

					$.reset(div_14);
					$.reset(div_13);

					var div_15 = $.sibling(div_13, 2);
					var node_10 = $.child(div_15);

					Icon(node_10, { name: 'check-square', size: 'sm' });

					var div_16 = $.sibling(node_10, 2);
					var span_2 = $.child(div_16);
					var text_4 = $.only_child(span_2);
					var p_1 = $.sibling(span_2, 2);
					var text_5 = $.only_child(p_1);

					$.reset(div_16);
					$.reset(div_15);
					$.reset(div_12);
					$.reset(div_11);

					var div_17 = $.sibling(div_11, 2);
					var div_18 = $.sibling($.child(div_17), 2);

					$.each(div_18, 21, () => tlsVersions, (tlsVer) => tlsVer.version, ($$anchor, tlsVer) => {
						const supported = $.derived(() => diagnosticState.results.supported[$.get(tlsVer).version]);
						const status = $.derived(() => getVersionStatus($.get(tlsVer).version, $.get(supported), $.get(tlsVer).deprecated));
						var div_19 = root_6();
						var div_20 = $.child(div_19);
						var div_21 = $.child(div_20);
						var node_11 = $.child(div_21);

						Icon(node_11, {
							get name() {
								return $.get(status).icon;
							},
							size: 'sm'
						});

						var div_22 = $.sibling(node_11, 2);
						var span_3 = $.child(div_22);
						var text_6 = $.only_child(span_3, true);
						var span_4 = $.sibling(span_3, 2);
						var text_7 = $.only_child(span_4);

						$.reset(div_22);
						$.reset(div_21);

						var span_5 = $.sibling(div_21, 2);
						var text_8 = $.only_child(span_5, true);

						$.reset(div_20);

						var node_12 = $.sibling(div_20, 2);

						{
							var consequent_3 = ($$anchor) => {
								var div_23 = root_4();
								var span_6 = $.child(div_23);
								var text_9 = $.only_child(span_6, true);

								$.reset(div_23);
								$.template_effect(() => $.set_text(text_9, diagnosticState.results.errors[$.get(tlsVer).version]));
								$.append($$anchor, div_23);
							};

							$.if(node_12, ($$render) => {
								if (!$.get(supported) && diagnosticState.results.errors[$.get(tlsVer).version]) $$render(consequent_3);
							});
						}

						var node_13 = $.sibling(node_12, 2);

						{
							var consequent_4 = ($$anchor) => {
								var div_24 = root_5();
								var node_14 = $.child(div_24);

								Icon(node_14, { name: 'alert-triangle', size: 'xs' });
								$.next(2);
								$.reset(div_24);
								$.append($$anchor, div_24);
							};

							$.if(node_13, ($$render) => {
								if ($.get(tlsVer).deprecated) $$render(consequent_4);
							});
						}

						$.reset(div_19);

						$.template_effect(() => {
							$.set_class(div_19, 1, `version-item ${$.get(status).class ?? ''}`, 'svelte-uleveb');
							$.set_text(text_6, $.get(tlsVer).name);
							$.set_text(text_7, `(${$.get(tlsVer).version ?? ''})`);
							$.set_text(text_8, $.get(status).status);
						});

						$.append($$anchor, div_19);
					});

					$.reset(div_18);
					$.reset(div_17);

					var node_15 = $.sibling(div_17, 2);

					{
						var consequent_5 = ($$anchor) => {
							var div_25 = root_7();
							var div_26 = $.sibling($.child(div_25), 2);
							var div_27 = $.child(div_26);
							var span_7 = $.sibling($.child(div_27), 2);
							var text_10 = $.only_child(span_7, true);

							$.reset(div_27);

							var div_28 = $.sibling(div_27, 2);
							var span_8 = $.sibling($.child(div_28), 2);
							var text_11 = $.only_child(span_8, true);

							$.reset(div_28);
							$.reset(div_26);
							$.reset(div_25);

							$.template_effect(() => {
								$.set_text(text_10, diagnosticState.results.minVersion || 'Unknown');
								$.set_text(text_11, diagnosticState.results.maxVersion || 'Unknown');
							});

							$.append($$anchor, div_25);
						};

						$.if(node_15, ($$render) => {
							if (diagnosticState.results.minVersion || diagnosticState.results.maxVersion) $$render(consequent_5);
						});
					}

					$.template_effect(() => {
						$.set_class(div_13, 1, `status-item ${$.get(security).class ?? ''}`, 'svelte-uleveb');
						$.set_text(text_2, `Security Level: ${$.get(security).level ?? ''}`);
						$.set_text(text_3, $.get(security).description);
						$.set_text(text_4, `${diagnosticState.results.totalSupported ?? ''} Versions Supported`);
						$.set_text(text_5, `Out of ${tlsVersions.length ?? ''} tested`);
					});

					$.append($$anchor, fragment_2);
				};

				$.if(node_8, ($$render) => {
					if (diagnosticState.results.supported) $$render(consequent_6);
				});
			}

			$.reset(div_10);
			$.reset(div_8);

			$.template_effect(
				($0, $1) => {
					button_1.disabled = $0;
					$.set_text(text_1, ` ${$1 ?? ''}`);
				},
				[
					() => clipboard.isCopied(),
					() => clipboard.isCopied() ? 'Copied!' : 'Copy Results'
				]
			);

			$.delegated('click', button_1, copyVersionsInfo);
			$.append($$anchor, div_8);
		};

		$.if(node_6, ($$render) => {
			if (diagnosticState.results) $$render(consequent_7);
		});
	}

	var node_16 = $.sibling(node_6, 2);

	ErrorCard(node_16, {
		title: 'TLS Versions Probe Failed',
		get error() {
			return diagnosticState.error;
		}
	});

	$.next(2);
	$.reset(div);

	$.template_effect(() => {
		classes = $.set_class(input, 1, '', null, classes, { invalid: $.get(host) && !$.get(isInputValid) });
		button.disabled = diagnosticState.loading || !$.get(isInputValid);
	});

	$.delegated('change', input, () => {
		examples.clear();

		if ($.get(isInputValid)()) probeTLSVersions();
	});

	$.bind_value(input, () => $.get(host), ($$value) => $.set(host, $$value));

	$.delegated('change', input_1, () => {
		examples.clear();

		if ($.get(isInputValid)()) probeTLSVersions();
	});

	$.bind_checked(input_1, () => $.get(useCustomServername), ($$value) => $.set(useCustomServername, $$value));
	$.delegated('click', button, probeTLSVersions);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['change', 'click']);