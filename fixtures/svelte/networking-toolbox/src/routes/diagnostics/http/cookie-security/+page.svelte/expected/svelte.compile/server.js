import * as $ from 'svelte/internal/server';
import Icon from '$lib/components/global/Icon.svelte';
import { useDiagnosticState, useExamples } from '$lib/composables';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import ErrorCard from '$lib/components/common/ErrorCard.svelte';
import '../../../../styles/diagnostics-pages.scss';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let url = 'https://example.com';
		const diagnosticState = useDiagnosticState();

		const examplesList = [
			{
				url: 'https://github.com',
				description: 'Excellent security (Score: 91)'
			},

			{
				url: 'https://www.cloudflare.com',
				description: 'Strong security (Score: 90)'
			},

			{
				url: 'https://www.paypal.com',
				description: 'Good security (Score: 80)'
			},

			{
				url: 'https://www.ebay.com',
				description: 'Many cookies (7 cookies, Score: 67)'
			},

			{
				url: 'https://www.nytimes.com',
				description: 'No HttpOnly flags (Score: 59)'
			},

			{
				url: 'https://www.apple.com',
				description: 'Poor security (1 cookie, Score: 37)'
			},

			{
				url: 'https://www.linkedin.com',
				description: 'Large set (7 cookies, Score: 69)'
			},

			{
				url: 'https://domain-locker.com',
				description: 'No cookies found'
			}
		];

		const examples = useExamples(examplesList);

		const isInputValid = $.derived(() => () => {
			const trimmedUrl = url.trim();

			if (!trimmedUrl) return false;

			try {
				const parsed = new URL(trimmedUrl);

				return ['http:', 'https:'].includes(parsed.protocol);
			} catch {
				return false;
			}
		});

		async function checkCookieSecurity() {
			if (!isInputValid()) {
				diagnosticState.setError('Please enter a valid HTTP/HTTPS URL');

				return;
			}

			diagnosticState.startOperation();

			try {
				const response = await fetch('/api/internal/diagnostics/http', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ action: 'cookie-security', url: url.trim() })
				});

				const data = await response.json();

				if (!response.ok) {
					const errorMessage = data.message || 'Failed to check cookie security';

					if (errorMessage.includes('Host not found') || errorMessage.includes('ENOTFOUND')) {
						throw new Error('Domain not found. Please check the URL and try again.');
					} else if (errorMessage.includes('Connection refused') || errorMessage.includes('ECONNREFUSED')) {
						throw new Error('Connection refused. The server may be down or unreachable.');
					} else if (errorMessage.includes('timeout') || errorMessage.includes('AbortError')) {
						throw new Error('Request timed out. The server may be slow to respond.');
					}

					throw new Error(errorMessage);
				}

				diagnosticState.setResults(data);
			} catch(err) {
				if (err instanceof Error) {
					diagnosticState.setError(err.message);
				} else {
					diagnosticState.setError('An unexpected error occurred. Please try again.');
				}
			}
		}

		function loadExample(example, index) {
			url = example.url;
			examples.select(index);
			checkCookieSecurity();
		}

		function getSecurityIcon(level) {
			switch (level) {
				case 'secure':
					return 'shield-check';

				case 'warning':
					return 'alert-triangle';

				case 'error':
					return 'shield-x';

				default:
					return 'help-circle';
			}
		}

		function getSecurityGrade(score) {
			if (score === null) return { grade: 'N/A', color: 'var(--text-secondary)' };
			if (score >= 90) return { grade: 'A+', color: 'var(--color-success)' };
			if (score >= 80) return { grade: 'A', color: 'var(--color-success)' };

			if (score >= 70) return {
				grade: 'B',
				color: 'color-mix(in srgb, var(--color-success), var(--color-warning) 30%)'
			};

			if (score >= 60) return { grade: 'C', color: 'var(--color-warning)' };

			if (score >= 50) return {
				grade: 'D',
				color: 'color-mix(in srgb, var(--color-warning), var(--color-error) 30%)'
			};

			return { grade: 'F', color: 'var(--color-error)' };
		}

		function getSameSiteColor(value) {
			switch (value.toLowerCase()) {
				case 'strict':
					return 'var(--color-success)';

				case 'lax':
					return 'var(--color-warning)';

				case 'none':
					return 'var(--color-error)';

				default:
					return 'var(--color-error)';
			}
		}

		$$renderer.push(`<div class="card"><header class="card-header"><h1>HTTP Cookie Security Inspector</h1> <p>Analyze Set-Cookie headers for Secure, HttpOnly, SameSite, and other security attributes</p></header> `);

		ExamplesCard($$renderer, {
			examples: examplesList,
			selectedIndex: examples.selectedIndex,
			onSelect: loadExample,
			title: 'Cookie Security Examples',
			getLabel: (ex) => ex.url,
			getDescription: (ex) => ex.description,
			getTooltip: (ex) => `Inspect cookies for ${ex.url}`
		});

		$$renderer.push(`<!----> <div class="card input-card"><div class="card-header"><h3>URL to Inspect</h3></div> <div class="card-content"><div class="form-group"><label for="url">URL</label> <div class="input-flex-container"><input id="url" type="url"${$.attr('value', url)} placeholder="https://example.com"${$.attr('disabled', diagnosticState.loading, true)}/> <button${$.attr('disabled', diagnosticState.loading || !isInputValid(), true)} class="primary">`);

		if (diagnosticState.loading) {
			$$renderer.push('<!--[0-->');
			Icon($$renderer, { name: 'loader', size: 'sm', animate: 'spin' });
			$$renderer.push(`<!----> Analyzing...`);
		} else {
			$$renderer.push('<!--[-1-->');
			Icon($$renderer, { name: 'search', size: 'sm' });
			$$renderer.push(`<!----> Inspect Cookies`);
		}

		$$renderer.push(`<!--]--></button></div></div></div></div> `);

		ErrorCard($$renderer, {
			title: 'Cookie Inspection Failed',
			error: diagnosticState.error
		});

		$$renderer.push(`<!----> `);

		if (diagnosticState.loading) {
			$$renderer.push(`<!--[0--><div class="card"><div class="card-content"><div class="loading-state">`);
			Icon($$renderer, { name: 'loader', size: 'lg', animate: 'spin' });
			$$renderer.push(`<!----> <div class="loading-text"><h3>Analyzing Cookies</h3> <p>Inspecting Set-Cookie headers for security attributes...</p></div></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (diagnosticState.results) {
			$$renderer.push(`<!--[0--><div class="card results-card"><div class="card-header"><h3>Cookie Security Analysis</h3></div> <div class="card-content"><div class="card score-section svelte-qvv1ha"><div class="card-header"><h3>Security Score</h3></div> <div class="card-content"><div class="score-container svelte-qvv1ha"><div class="score-circle svelte-qvv1ha"${$.attr_style(`--score-color: ${$.stringify(getSecurityGrade(diagnosticState.results.securityScore).color)}`)}><div class="score-value svelte-qvv1ha">${$.escape(getSecurityGrade(diagnosticState.results.securityScore).grade)}</div> <div class="score-label svelte-qvv1ha">${$.escape(diagnosticState.results.securityScore !== null
				? `${diagnosticState.results.securityScore}/100`
				: 'No cookies')}</div></div> <div class="score-summary svelte-qvv1ha"><h4 class="svelte-qvv1ha">Overall Assessment</h4> <p class="svelte-qvv1ha">${$.escape(diagnosticState.results.summary)}</p> <div class="score-stats svelte-qvv1ha"><div class="stat svelte-qvv1ha"><span class="stat-label svelte-qvv1ha">Total Cookies:</span> <span class="stat-value svelte-qvv1ha">${$.escape(diagnosticState.results.totalCookies)}</span></div> <div class="stat svelte-qvv1ha"><span class="stat-label svelte-qvv1ha">Secure Cookies:</span> <span class="stat-value svelte-qvv1ha">${$.escape(diagnosticState.results.secureCookies)}</span></div> <div class="stat svelte-qvv1ha"><span class="stat-label svelte-qvv1ha">HttpOnly Cookies:</span> <span class="stat-value svelte-qvv1ha">${$.escape(diagnosticState.results.httpOnlyCookies)}</span></div></div></div></div></div></div> `);

			if (diagnosticState.results.cookies && diagnosticState.results.cookies.length > 0) {
				$$renderer.push(`<!--[0--><div class="card cookies-section svelte-qvv1ha"><div class="card-header"><h3>Cookie Details</h3></div> <div class="card-content"><div class="cookies-grid svelte-qvv1ha"><!--[-->`);

				const each_array = $.ensure_array_like(diagnosticState.results.cookies);

				for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
					let cookie = each_array[$$index_1];

					$$renderer.push(`<div${$.attr_class('cookie-card svelte-qvv1ha', void 0, {
						'secure': cookie.securityLevel === 'secure',
						'warning': cookie.securityLevel === 'warning',
						'error': cookie.securityLevel === 'error'
					})}><div class="cookie-header svelte-qvv1ha"><div class="cookie-name svelte-qvv1ha">`);

					Icon($$renderer, { name: 'cookie', size: 'sm' });

					$$renderer.push(`<!----> <span class="name svelte-qvv1ha">${$.escape(cookie.name)}</span></div> <div${$.attr_class('cookie-security svelte-qvv1ha', void 0, {
						'secure': cookie.securityLevel === 'secure',
						'warning': cookie.securityLevel === 'warning',
						'error': cookie.securityLevel === 'error'
					})}>`);

					Icon($$renderer, { name: getSecurityIcon(cookie.securityLevel), size: 'xs' });
					$$renderer.push(`<!----> <span class="level">${$.escape(cookie.securityLevel)}</span></div></div> <div class="cookie-details svelte-qvv1ha"><div class="cookie-value svelte-qvv1ha"><span class="detail-label svelte-qvv1ha">Value:</span> <span class="detail-value truncated svelte-qvv1ha">${$.escape(cookie.value)}</span></div> <div class="security-attributes svelte-qvv1ha"><div${$.attr_class('attribute svelte-qvv1ha', void 0, { 'present': cookie.secure })}>`);
					Icon($$renderer, { name: cookie.secure ? 'check' : 'x', size: 'xs' });
					$$renderer.push(`<!----> <span>Secure</span></div> <div${$.attr_class('attribute svelte-qvv1ha', void 0, { 'present': cookie.httpOnly })}>`);
					Icon($$renderer, { name: cookie.httpOnly ? 'check' : 'x', size: 'xs' });
					$$renderer.push(`<!----> <span>HttpOnly</span></div> <div class="attribute samesite svelte-qvv1ha"${$.attr_style(`--samesite-color: ${$.stringify(getSameSiteColor(cookie.sameSite || 'none'))}`)}>`);
					Icon($$renderer, { name: 'shield', size: 'xs' });
					$$renderer.push(`<!----> <span>SameSite: ${$.escape(cookie.sameSite || 'None')}</span></div></div> `);

					if (cookie.domain || cookie.path || cookie.expires || cookie.maxAge) {
						$$renderer.push(`<!--[0--><div class="cookie-metadata svelte-qvv1ha">`);

						if (cookie.domain) {
							$$renderer.push(`<!--[0--><div class="metadata-item svelte-qvv1ha"><span class="metadata-label svelte-qvv1ha">Domain:</span> <span class="metadata-value svelte-qvv1ha">${$.escape(cookie.domain)}</span></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (cookie.path) {
							$$renderer.push(`<!--[0--><div class="metadata-item svelte-qvv1ha"><span class="metadata-label svelte-qvv1ha">Path:</span> <span class="metadata-value svelte-qvv1ha">${$.escape(cookie.path)}</span></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (cookie.expires) {
							$$renderer.push(`<!--[0--><div class="metadata-item svelte-qvv1ha"><span class="metadata-label svelte-qvv1ha">Expires:</span> <span class="metadata-value svelte-qvv1ha">${$.escape(cookie.expires)}</span></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (cookie.maxAge) {
							$$renderer.push(`<!--[0--><div class="metadata-item svelte-qvv1ha"><span class="metadata-label svelte-qvv1ha">Max-Age:</span> <span class="metadata-value svelte-qvv1ha">${$.escape(cookie.maxAge)}s</span></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (cookie.issues && cookie.issues.length > 0) {
						$$renderer.push(`<!--[0--><div class="cookie-issues svelte-qvv1ha"><h5 class="svelte-qvv1ha">Security Issues:</h5> <ul class="svelte-qvv1ha"><!--[-->`);

						const each_array_1 = $.ensure_array_like(cookie.issues);

						for (let issueIndex = 0, $$length = each_array_1.length; issueIndex < $$length; issueIndex++) {
							let issue = each_array_1[issueIndex];

							$$renderer.push(`<li class="issue svelte-qvv1ha">`);
							Icon($$renderer, { name: 'alert-circle', size: 'xs' });
							$$renderer.push(`<!----> ${$.escape(issue)}</li>`);
						}

						$$renderer.push(`<!--]--></ul></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div></div>`);
				}

				$$renderer.push(`<!--]--></div></div></div>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="card no-cookies-section svelte-qvv1ha"><div class="card-content"><div class="no-cookies-message svelte-qvv1ha">`);
				Icon($$renderer, { name: 'cookie', size: 'lg' });
				$$renderer.push(`<!----> <h3 class="svelte-qvv1ha">No Cookies Found</h3> <p>The server did not send any Set-Cookie headers in the response.</p></div></div></div>`);
			}

			$$renderer.push(`<!--]--> `);

			if (diagnosticState.results.recommendations && diagnosticState.results.recommendations.length > 0) {
				$$renderer.push(`<!--[0--><div class="card recommendations-section svelte-qvv1ha"><div class="card-header"><h3>Security Recommendations</h3></div> <div class="card-content"><div class="recommendations-list svelte-qvv1ha"><!--[-->`);

				const each_array_2 = $.ensure_array_like(diagnosticState.results.recommendations);

				for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
					let recommendation = each_array_2[index];

					$$renderer.push(`<div class="recommendation-item svelte-qvv1ha">`);
					Icon($$renderer, { name: 'lightbulb', size: 'sm' });
					$$renderer.push(`<!----> <div class="recommendation-content svelte-qvv1ha"><h4 class="svelte-qvv1ha">${$.escape(recommendation.title)}</h4> <p class="svelte-qvv1ha">${$.escape(recommendation.description)}</p> `);

					if (recommendation.example) {
						$$renderer.push(`<!--[0--><code class="recommendation-example svelte-qvv1ha">${$.escape(recommendation.example)}</code>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div></div>`);
				}

				$$renderer.push(`<!--]--></div></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}