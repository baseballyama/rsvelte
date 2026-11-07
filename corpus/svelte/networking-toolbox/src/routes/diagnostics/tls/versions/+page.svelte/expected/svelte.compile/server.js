import * as $ from 'svelte/internal/server';
import Icon from '$lib/components/global/Icon.svelte';
import { useDiagnosticState, useClipboard, useExamples } from '$lib/composables';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import ErrorCard from '$lib/components/common/ErrorCard.svelte';
import '../../../../styles/diagnostics-pages.scss';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let host = 'google.com:443';
		let servername = '';
		let useCustomServername = false;
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
			const trimmedHost = host.trim();

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
						host: host.trim(),
						servername: useCustomServername && servername ? servername.trim() : undefined
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
			host = example.host;
			servername = '';
			useCustomServername = false;
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

			let text = `TLS Versions Analysis for ${host}\n`;

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

		$$renderer.push(`<div class="card"><header class="card-header"><h1>TLS Versions Probe</h1> <p>Test which TLS protocol versions a server supports by attempting connections with different TLS version
      constraints. Identify deprecated versions and assess overall TLS security posture.</p></header> `);

		ExamplesCard($$renderer, {
			examples: examplesList,
			selectedIndex: examples.selectedIndex,
			onSelect: loadExample,
			title: 'TLS Version Examples',
			getLabel: (ex) => ex.host,
			getDescription: (ex) => ex.description,
			getTooltip: (ex) => `Probe TLS versions for ${ex.host} (${ex.description})`
		});

		$$renderer.push(`<!----> <div class="card input-card"><div class="card-header"><h3>TLS Versions Probe Configuration</h3></div> <div class="card-content"><div class="form-row"><div class="form-group"><label for="host">Host:Port <input id="host" type="text"${$.attr('value', host)} placeholder="google.com:443"${$.attr_class('', void 0, { 'invalid': host && !isInputValid() })}/> `);

		if (host && !isInputValid()) {
			$$renderer.push(`<!--[0--><span class="error-text svelte-uleveb">Invalid host:port format</span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></label></div></div> <div class="form-row"><div class="form-group"><label class="checkbox-group"><input type="checkbox"${$.attr('checked', useCustomServername, true)}/> Use custom SNI servername</label> `);

		if (useCustomServername) {
			$$renderer.push(`<!--[0--><input type="text"${$.attr('value', servername)} placeholder="example.com"/>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div> <div class="action-section"><button class="lookup-btn"${$.attr('disabled', diagnosticState.loading || !isInputValid(), true)}>`);

		if (diagnosticState.loading) {
			$$renderer.push('<!--[0-->');
			Icon($$renderer, { name: 'loader', size: 'sm', animate: 'spin' });
			$$renderer.push(`<!----> Probing TLS Versions...`);
		} else {
			$$renderer.push('<!--[-1-->');
			Icon($$renderer, { name: 'search', size: 'sm' });
			$$renderer.push(`<!----> Probe TLS Versions`);
		}

		$$renderer.push(`<!--]--></button></div></div></div> `);

		if (diagnosticState.results) {
			$$renderer.push(`<!--[0--><div class="card results-card"><div class="card-header row"><h3>TLS Versions Probe Results</h3> <button class="copy-btn"${$.attr('disabled', clipboard.isCopied(), true)}>`);
			Icon($$renderer, { name: clipboard.isCopied() ? 'check' : 'copy', size: 'xs' });
			$$renderer.push(`<!----> ${$.escape(clipboard.isCopied() ? 'Copied!' : 'Copy Results')}</button></div> <div class="card-content">`);

			if (diagnosticState.results.supported) {
				$$renderer.push('<!--[0-->');

				const security = getOverallSecurity();

				$$renderer.push(`<div class="security-overview svelte-uleveb"><div class="status-overview"><div${$.attr_class(`status-item ${$.stringify(security.class)}`, 'svelte-uleveb')}>`);
				Icon($$renderer, { name: security.icon, size: 'sm' });
				$$renderer.push(`<!----> <div class="svelte-uleveb"><span class="status-title svelte-uleveb">Security Level: ${$.escape(security.level)}</span> <p class="status-desc svelte-uleveb">${$.escape(security.description)}</p></div></div> <div class="status-item success">`);
				Icon($$renderer, { name: 'check-square', size: 'sm' });
				$$renderer.push(`<!----> <div><span class="status-title svelte-uleveb">${$.escape(diagnosticState.results.totalSupported)} Versions Supported</span> <p class="status-desc svelte-uleveb">Out of ${$.escape(tlsVersions.length)} tested</p></div></div></div></div> <div class="versions-section svelte-uleveb"><h4 class="svelte-uleveb">TLS Version Support</h4> <div class="versions-grid svelte-uleveb"><!--[-->`);

				const each_array = $.ensure_array_like(tlsVersions);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let tlsVer = each_array[$$index];
					const supported = diagnosticState.results.supported[tlsVer.version];
					const status = getVersionStatus(tlsVer.version, supported, tlsVer.deprecated);

					$$renderer.push(`<div${$.attr_class(`version-item ${$.stringify(status.class)}`, 'svelte-uleveb')}><div class="version-header svelte-uleveb"><div class="version-info svelte-uleveb">`);
					Icon($$renderer, { name: status.icon, size: 'sm' });
					$$renderer.push(`<!----> <div class="svelte-uleveb"><span class="version-name svelte-uleveb">${$.escape(tlsVer.name)}</span> <span class="version-code mono svelte-uleveb">(${$.escape(tlsVer.version)})</span></div></div> <span class="version-status svelte-uleveb">${$.escape(status.status)}</span></div> `);

					if (!supported && diagnosticState.results.errors[tlsVer.version]) {
						$$renderer.push(`<!--[0--><div class="version-error svelte-uleveb"><span class="error-detail svelte-uleveb">${$.escape(diagnosticState.results.errors[tlsVer.version])}</span></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (tlsVer.deprecated) {
						$$renderer.push(`<!--[0--><div class="version-warning svelte-uleveb">`);
						Icon($$renderer, { name: 'alert-triangle', size: 'xs' });
						$$renderer.push(`<!----> <span>This version is deprecated and should not be used</span></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div>`);
				}

				$$renderer.push(`<!--]--></div></div> `);

				if (diagnosticState.results.minVersion || diagnosticState.results.maxVersion) {
					$$renderer.push(`<!--[0--><div class="range-section svelte-uleveb"><h4 class="svelte-uleveb">Supported Version Range</h4> <div class="range-info svelte-uleveb"><div class="range-item svelte-uleveb"><span class="range-label svelte-uleveb">Minimum Version:</span> <span class="range-value mono svelte-uleveb">${$.escape(diagnosticState.results.minVersion || 'Unknown')}</span></div> <div class="range-item svelte-uleveb"><span class="range-label svelte-uleveb">Maximum Version:</span> <span class="range-value mono svelte-uleveb">${$.escape(diagnosticState.results.maxVersion || 'Unknown')}</span></div></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		ErrorCard($$renderer, {
			title: 'TLS Versions Probe Failed',
			error: diagnosticState.error
		});

		$$renderer.push(`<!----> <div class="card info-card"><div class="card-header"><h3>Understanding TLS Versions</h3></div> <div class="card-content"><div class="info-grid"><div class="info-section"><h4>TLS Version Security</h4> <ul><li><strong>TLS 1.3:</strong> Latest version with improved security and performance</li> <li><strong>TLS 1.2:</strong> Widely supported, secure when properly configured</li> <li><strong>TLS 1.1:</strong> Deprecated, should not be used</li> <li><strong>TLS 1.0:</strong> Deprecated, contains security vulnerabilities</li></ul></div> <div class="info-section"><h4>Best Practices</h4> <ul><li>Enable TLS 1.2 and 1.3 only</li> <li>Disable deprecated versions (TLS 1.0, 1.1)</li> <li>Regularly update TLS implementations</li> <li>Use strong cipher suites</li></ul></div> <div class="info-section"><h4>Compliance Requirements</h4> <p>Many compliance standards (PCI DSS, HIPAA) require disabling deprecated TLS versions. Check your specific
            requirements.</p></div></div></div></div></div>`);
	});
}