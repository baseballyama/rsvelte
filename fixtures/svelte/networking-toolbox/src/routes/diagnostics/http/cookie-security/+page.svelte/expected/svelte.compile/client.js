import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '$lib/components/global/Icon.svelte';
import { useDiagnosticState, useExamples } from '$lib/composables';
import ExamplesCard from '$lib/components/common/ExamplesCard.svelte';
import ErrorCard from '$lib/components/common/ErrorCard.svelte';
import '../../../../styles/diagnostics-pages.scss';

var root = $.from_html(`<!> Analyzing...`, 1);
var root_1 = $.from_html(`<!> Inspect Cookies`, 1);
var root_2 = $.from_html(`<div class="card"><div class="card-content"><div class="loading-state"><!> <div class="loading-text"><h3>Analyzing Cookies</h3> <p>Inspecting Set-Cookie headers for security attributes...</p></div></div></div></div>`);
var root_3 = $.from_html(`<div class="metadata-item svelte-qvv1ha"><span class="metadata-label svelte-qvv1ha">Domain:</span> <span class="metadata-value svelte-qvv1ha"> </span></div>`);
var root_4 = $.from_html(`<div class="metadata-item svelte-qvv1ha"><span class="metadata-label svelte-qvv1ha">Path:</span> <span class="metadata-value svelte-qvv1ha"> </span></div>`);
var root_5 = $.from_html(`<div class="metadata-item svelte-qvv1ha"><span class="metadata-label svelte-qvv1ha">Expires:</span> <span class="metadata-value svelte-qvv1ha"> </span></div>`);
var root_6 = $.from_html(`<div class="metadata-item svelte-qvv1ha"><span class="metadata-label svelte-qvv1ha">Max-Age:</span> <span class="metadata-value svelte-qvv1ha"> </span></div>`);
var root_7 = $.from_html(`<div class="cookie-metadata svelte-qvv1ha"><!> <!> <!> <!></div>`);
var root_8 = $.from_html(`<li class="issue svelte-qvv1ha"><!> </li>`);
var root_9 = $.from_html(`<div class="cookie-issues svelte-qvv1ha"><h5 class="svelte-qvv1ha">Security Issues:</h5> <ul class="svelte-qvv1ha"></ul></div>`);
var root_10 = $.from_html(`<div><div class="cookie-header svelte-qvv1ha"><div class="cookie-name svelte-qvv1ha"><!> <span class="name svelte-qvv1ha"> </span></div> <div><!> <span class="level"> </span></div></div> <div class="cookie-details svelte-qvv1ha"><div class="cookie-value svelte-qvv1ha"><span class="detail-label svelte-qvv1ha">Value:</span> <span class="detail-value truncated svelte-qvv1ha"> </span></div> <div class="security-attributes svelte-qvv1ha"><div><!> <span>Secure</span></div> <div><!> <span>HttpOnly</span></div> <div class="attribute samesite svelte-qvv1ha"><!> <span> </span></div></div> <!> <!></div></div>`);
var root_11 = $.from_html(`<div class="card cookies-section svelte-qvv1ha"><div class="card-header"><h3>Cookie Details</h3></div> <div class="card-content"><div class="cookies-grid svelte-qvv1ha"></div></div></div>`);
var root_12 = $.from_html(`<div class="card no-cookies-section svelte-qvv1ha"><div class="card-content"><div class="no-cookies-message svelte-qvv1ha"><!> <h3 class="svelte-qvv1ha">No Cookies Found</h3> <p>The server did not send any Set-Cookie headers in the response.</p></div></div></div>`);
var root_13 = $.from_html(`<code class="recommendation-example svelte-qvv1ha"> </code>`);
var root_14 = $.from_html(`<div class="recommendation-item svelte-qvv1ha"><!> <div class="recommendation-content svelte-qvv1ha"><h4 class="svelte-qvv1ha"> </h4> <p class="svelte-qvv1ha"> </p> <!></div></div>`);
var root_15 = $.from_html(`<div class="card recommendations-section svelte-qvv1ha"><div class="card-header"><h3>Security Recommendations</h3></div> <div class="card-content"><div class="recommendations-list svelte-qvv1ha"></div></div></div>`);
var root_16 = $.from_html(`<div class="card results-card"><div class="card-header"><h3>Cookie Security Analysis</h3></div> <div class="card-content"><div class="card score-section svelte-qvv1ha"><div class="card-header"><h3>Security Score</h3></div> <div class="card-content"><div class="score-container svelte-qvv1ha"><div class="score-circle svelte-qvv1ha"><div class="score-value svelte-qvv1ha"> </div> <div class="score-label svelte-qvv1ha"> </div></div> <div class="score-summary svelte-qvv1ha"><h4 class="svelte-qvv1ha">Overall Assessment</h4> <p class="svelte-qvv1ha"> </p> <div class="score-stats svelte-qvv1ha"><div class="stat svelte-qvv1ha"><span class="stat-label svelte-qvv1ha">Total Cookies:</span> <span class="stat-value svelte-qvv1ha"> </span></div> <div class="stat svelte-qvv1ha"><span class="stat-label svelte-qvv1ha">Secure Cookies:</span> <span class="stat-value svelte-qvv1ha"> </span></div> <div class="stat svelte-qvv1ha"><span class="stat-label svelte-qvv1ha">HttpOnly Cookies:</span> <span class="stat-value svelte-qvv1ha"> </span></div></div></div></div></div></div> <!> <!></div></div>`);
var root_17 = $.from_html(`<div class="card"><header class="card-header"><h1>HTTP Cookie Security Inspector</h1> <p>Analyze Set-Cookie headers for Secure, HttpOnly, SameSite, and other security attributes</p></header> <!> <div class="card input-card"><div class="card-header"><h3>URL to Inspect</h3></div> <div class="card-content"><div class="form-group"><label for="url">URL</label> <div class="input-flex-container"><input id="url" type="url" placeholder="https://example.com"/> <button class="primary"><!></button></div></div></div></div> <!> <!> <!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let url = $.state('https://example.com');
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
		const trimmedUrl = $.get(url).trim();

		if (!trimmedUrl) return false;

		try {
			const parsed = new URL(trimmedUrl);

			return ['http:', 'https:'].includes(parsed.protocol);
		} catch {
			return false;
		}
	});

	async function checkCookieSecurity() {
		if (!$.get(isInputValid)) {
			diagnosticState.setError('Please enter a valid HTTP/HTTPS URL');

			return;
		}

		diagnosticState.startOperation();

		try {
			const response = await fetch('/api/internal/diagnostics/http', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: 'cookie-security', url: $.get(url).trim() })
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
		$.set(url, example.url, true);
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

	var div = root_17();
	var node = $.sibling($.child(div), 2);

	ExamplesCard(node, {
		get examples() {
			return examplesList;
		},

		get selectedIndex() {
			return examples.selectedIndex;
		},
		onSelect: loadExample,
		title: 'Cookie Security Examples',
		getLabel: (ex) => ex.url,
		getDescription: (ex) => ex.description,
		getTooltip: (ex) => `Inspect cookies for ${ex.url}`
	});

	var div_1 = $.sibling(node, 2);
	var div_2 = $.sibling($.child(div_1), 2);
	var div_3 = $.child(div_2);
	var div_4 = $.sibling($.child(div_3), 2);
	var input = $.child(div_4);

	$.remove_input_defaults(input);

	var button = $.sibling(input, 2);
	var node_1 = $.child(button);

	{
		var consequent = ($$anchor) => {
			var fragment = root();
			var node_2 = $.first_child(fragment);

			Icon(node_2, { name: 'loader', size: 'sm', animate: 'spin' });
			$.next();
			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = root_1();
			var node_3 = $.first_child(fragment_1);

			Icon(node_3, { name: 'search', size: 'sm' });
			$.next();
			$.append($$anchor, fragment_1);
		};

		$.if(node_1, ($$render) => {
			if (diagnosticState.loading) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(button);
	$.reset(div_4);
	$.reset(div_3);
	$.reset(div_2);
	$.reset(div_1);

	var node_4 = $.sibling(div_1, 2);

	ErrorCard(node_4, {
		title: 'Cookie Inspection Failed',
		get error() {
			return diagnosticState.error;
		}
	});

	var node_5 = $.sibling(node_4, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_5 = root_2();
			var div_6 = $.child(div_5);
			var div_7 = $.child(div_6);
			var node_6 = $.child(div_7);

			Icon(node_6, { name: 'loader', size: 'lg', animate: 'spin' });
			$.next(2);
			$.reset(div_7);
			$.reset(div_6);
			$.reset(div_5);
			$.append($$anchor, div_5);
		};

		$.if(node_5, ($$render) => {
			if (diagnosticState.loading) $$render(consequent_1);
		});
	}

	var node_7 = $.sibling(node_5, 2);

	{
		var consequent_11 = ($$anchor) => {
			var div_8 = root_16();
			var div_9 = $.sibling($.child(div_8), 2);
			var div_10 = $.child(div_9);
			var div_11 = $.sibling($.child(div_10), 2);
			var div_12 = $.child(div_11);
			var div_13 = $.child(div_12);
			var div_14 = $.child(div_13);
			var text = $.only_child(div_14, true);
			var div_15 = $.sibling(div_14, 2);
			var text_1 = $.only_child(div_15, true);

			$.reset(div_13);

			var div_16 = $.sibling(div_13, 2);
			var p = $.sibling($.child(div_16), 2);
			var text_2 = $.only_child(p, true);
			var div_17 = $.sibling(p, 2);
			var div_18 = $.child(div_17);
			var span = $.sibling($.child(div_18), 2);
			var text_3 = $.only_child(span, true);

			$.reset(div_18);

			var div_19 = $.sibling(div_18, 2);
			var span_1 = $.sibling($.child(div_19), 2);
			var text_4 = $.only_child(span_1, true);

			$.reset(div_19);

			var div_20 = $.sibling(div_19, 2);
			var span_2 = $.sibling($.child(div_20), 2);
			var text_5 = $.only_child(span_2, true);

			$.reset(div_20);
			$.reset(div_17);
			$.reset(div_16);
			$.reset(div_12);
			$.reset(div_11);
			$.reset(div_10);

			var node_8 = $.sibling(div_10, 2);

			{
				var consequent_8 = ($$anchor) => {
					var div_21 = root_11();
					var div_22 = $.sibling($.child(div_21), 2);
					var div_23 = $.child(div_22);

					$.each(div_23, 21, () => diagnosticState.results.cookies, (cookie) => cookie.id || cookie.name, ($$anchor, cookie) => {
						var div_24 = root_10();
						let classes;
						var div_25 = $.child(div_24);
						var div_26 = $.child(div_25);
						var node_9 = $.child(div_26);

						Icon(node_9, { name: 'cookie', size: 'sm' });

						var span_3 = $.sibling(node_9, 2);
						var text_6 = $.only_child(span_3, true);

						$.reset(div_26);

						var div_27 = $.sibling(div_26, 2);
						let classes_1;
						var node_10 = $.child(div_27);

						{
							let $0 = $.derived(() => getSecurityIcon($.get(cookie).securityLevel));

							Icon(node_10, {
								get name() {
									return $.get($0);
								},
								size: 'xs'
							});
						}

						var span_4 = $.sibling(node_10, 2);
						var text_7 = $.only_child(span_4, true);

						$.reset(div_27);
						$.reset(div_25);

						var div_28 = $.sibling(div_25, 2);
						var div_29 = $.child(div_28);
						var span_5 = $.sibling($.child(div_29), 2);
						var text_8 = $.only_child(span_5, true);

						$.reset(div_29);

						var div_30 = $.sibling(div_29, 2);
						var div_31 = $.child(div_30);
						let classes_2;
						var node_11 = $.child(div_31);

						{
							let $0 = $.derived(() => $.get(cookie).secure ? 'check' : 'x');

							Icon(node_11, {
								get name() {
									return $.get($0);
								},
								size: 'xs'
							});
						}

						$.next(2);
						$.reset(div_31);

						var div_32 = $.sibling(div_31, 2);
						let classes_3;
						var node_12 = $.child(div_32);

						{
							let $0 = $.derived(() => $.get(cookie).httpOnly ? 'check' : 'x');

							Icon(node_12, {
								get name() {
									return $.get($0);
								},
								size: 'xs'
							});
						}

						$.next(2);
						$.reset(div_32);

						var div_33 = $.sibling(div_32, 2);
						var node_13 = $.child(div_33);

						Icon(node_13, { name: 'shield', size: 'xs' });

						var span_6 = $.sibling(node_13, 2);
						var text_9 = $.only_child(span_6);

						$.reset(div_33);
						$.reset(div_30);

						var node_14 = $.sibling(div_30, 2);

						{
							var consequent_6 = ($$anchor) => {
								var div_34 = root_7();
								var node_15 = $.child(div_34);

								{
									var consequent_2 = ($$anchor) => {
										var div_35 = root_3();
										var span_7 = $.sibling($.child(div_35), 2);
										var text_10 = $.only_child(span_7, true);

										$.reset(div_35);
										$.template_effect(() => $.set_text(text_10, $.get(cookie).domain));
										$.append($$anchor, div_35);
									};

									$.if(node_15, ($$render) => {
										if ($.get(cookie).domain) $$render(consequent_2);
									});
								}

								var node_16 = $.sibling(node_15, 2);

								{
									var consequent_3 = ($$anchor) => {
										var div_36 = root_4();
										var span_8 = $.sibling($.child(div_36), 2);
										var text_11 = $.only_child(span_8, true);

										$.reset(div_36);
										$.template_effect(() => $.set_text(text_11, $.get(cookie).path));
										$.append($$anchor, div_36);
									};

									$.if(node_16, ($$render) => {
										if ($.get(cookie).path) $$render(consequent_3);
									});
								}

								var node_17 = $.sibling(node_16, 2);

								{
									var consequent_4 = ($$anchor) => {
										var div_37 = root_5();
										var span_9 = $.sibling($.child(div_37), 2);
										var text_12 = $.only_child(span_9, true);

										$.reset(div_37);
										$.template_effect(() => $.set_text(text_12, $.get(cookie).expires));
										$.append($$anchor, div_37);
									};

									$.if(node_17, ($$render) => {
										if ($.get(cookie).expires) $$render(consequent_4);
									});
								}

								var node_18 = $.sibling(node_17, 2);

								{
									var consequent_5 = ($$anchor) => {
										var div_38 = root_6();
										var span_10 = $.sibling($.child(div_38), 2);
										var text_13 = $.only_child(span_10);

										$.reset(div_38);
										$.template_effect(() => $.set_text(text_13, `${$.get(cookie).maxAge ?? ''}s`));
										$.append($$anchor, div_38);
									};

									$.if(node_18, ($$render) => {
										if ($.get(cookie).maxAge) $$render(consequent_5);
									});
								}

								$.reset(div_34);
								$.append($$anchor, div_34);
							};

							$.if(node_14, ($$render) => {
								if ($.get(cookie).domain || $.get(cookie).path || $.get(cookie).expires || $.get(cookie).maxAge) $$render(consequent_6);
							});
						}

						var node_19 = $.sibling(node_14, 2);

						{
							var consequent_7 = ($$anchor) => {
								var div_39 = root_9();
								var ul = $.sibling($.child(div_39), 2);

								$.each(ul, 21, () => $.get(cookie).issues, $.index, ($$anchor, issue) => {
									var li = root_8();
									var node_20 = $.child(li);

									Icon(node_20, { name: 'alert-circle', size: 'xs' });

									var text_14 = $.sibling(node_20);

									$.reset(li);
									$.template_effect(() => $.set_text(text_14, ` ${$.get(issue) ?? ''}`));
									$.append($$anchor, li);
								});

								$.reset(ul);
								$.reset(div_39);
								$.append($$anchor, div_39);
							};

							$.if(node_19, ($$render) => {
								if ($.get(cookie).issues && $.get(cookie).issues.length > 0) $$render(consequent_7);
							});
						}

						$.reset(div_28);
						$.reset(div_24);

						$.template_effect(
							($0) => {
								classes = $.set_class(div_24, 1, 'cookie-card svelte-qvv1ha', null, classes, {
									secure: $.get(cookie).securityLevel === 'secure',
									warning: $.get(cookie).securityLevel === 'warning',
									error: $.get(cookie).securityLevel === 'error'
								});

								$.set_text(text_6, $.get(cookie).name);

								classes_1 = $.set_class(div_27, 1, 'cookie-security svelte-qvv1ha', null, classes_1, {
									secure: $.get(cookie).securityLevel === 'secure',
									warning: $.get(cookie).securityLevel === 'warning',
									error: $.get(cookie).securityLevel === 'error'
								});

								$.set_text(text_7, $.get(cookie).securityLevel);
								$.set_text(text_8, $.get(cookie).value);
								classes_2 = $.set_class(div_31, 1, 'attribute svelte-qvv1ha', null, classes_2, { present: $.get(cookie).secure });
								classes_3 = $.set_class(div_32, 1, 'attribute svelte-qvv1ha', null, classes_3, { present: $.get(cookie).httpOnly });
								$.set_style(div_33, `--samesite-color: ${$0 ?? ''}`);
								$.set_text(text_9, `SameSite: ${($.get(cookie).sameSite || 'None') ?? ''}`);
							},
							[() => getSameSiteColor($.get(cookie).sameSite || 'none')]
						);

						$.append($$anchor, div_24);
					});

					$.reset(div_23);
					$.reset(div_22);
					$.reset(div_21);
					$.append($$anchor, div_21);
				};

				var alternate_1 = ($$anchor) => {
					var div_40 = root_12();
					var div_41 = $.child(div_40);
					var div_42 = $.child(div_41);
					var node_21 = $.child(div_42);

					Icon(node_21, { name: 'cookie', size: 'lg' });
					$.next(4);
					$.reset(div_42);
					$.reset(div_41);
					$.reset(div_40);
					$.append($$anchor, div_40);
				};

				$.if(node_8, ($$render) => {
					if (diagnosticState.results.cookies && diagnosticState.results.cookies.length > 0) $$render(consequent_8); else $$render(alternate_1, -1);
				});
			}

			var node_22 = $.sibling(node_8, 2);

			{
				var consequent_10 = ($$anchor) => {
					var div_43 = root_15();
					var div_44 = $.sibling($.child(div_43), 2);
					var div_45 = $.child(div_44);

					$.each(div_45, 21, () => diagnosticState.results.recommendations, $.index, ($$anchor, recommendation) => {
						var div_46 = root_14();
						var node_23 = $.child(div_46);

						Icon(node_23, { name: 'lightbulb', size: 'sm' });

						var div_47 = $.sibling(node_23, 2);
						var h4 = $.child(div_47);
						var text_15 = $.only_child(h4, true);
						var p_1 = $.sibling(h4, 2);
						var text_16 = $.only_child(p_1, true);
						var node_24 = $.sibling(p_1, 2);

						{
							var consequent_9 = ($$anchor) => {
								var code = root_13();
								var text_17 = $.only_child(code, true);

								$.template_effect(() => $.set_text(text_17, $.get(recommendation).example));
								$.append($$anchor, code);
							};

							$.if(node_24, ($$render) => {
								if ($.get(recommendation).example) $$render(consequent_9);
							});
						}

						$.reset(div_47);
						$.reset(div_46);

						$.template_effect(() => {
							$.set_text(text_15, $.get(recommendation).title);
							$.set_text(text_16, $.get(recommendation).description);
						});

						$.append($$anchor, div_46);
					});

					$.reset(div_45);
					$.reset(div_44);
					$.reset(div_43);
					$.append($$anchor, div_43);
				};

				$.if(node_22, ($$render) => {
					if (diagnosticState.results.recommendations && diagnosticState.results.recommendations.length > 0) $$render(consequent_10);
				});
			}

			$.reset(div_9);
			$.reset(div_8);

			$.template_effect(
				($0, $1) => {
					$.set_style(div_13, `--score-color: ${$0 ?? ''}`);
					$.set_text(text, $1);

					$.set_text(text_1, diagnosticState.results.securityScore !== null
						? `${diagnosticState.results.securityScore}/100`
						: 'No cookies');

					$.set_text(text_2, diagnosticState.results.summary);
					$.set_text(text_3, diagnosticState.results.totalCookies);
					$.set_text(text_4, diagnosticState.results.secureCookies);
					$.set_text(text_5, diagnosticState.results.httpOnlyCookies);
				},
				[
					() => getSecurityGrade(diagnosticState.results.securityScore).color,
					() => getSecurityGrade(diagnosticState.results.securityScore).grade
				]
			);

			$.append($$anchor, div_8);
		};

		$.if(node_7, ($$render) => {
			if (diagnosticState.results) $$render(consequent_11);
		});
	}

	$.reset(div);

	$.template_effect(() => {
		input.disabled = diagnosticState.loading;
		button.disabled = diagnosticState.loading || !$.get(isInputValid);
	});

	$.delegated('change', input, () => examples.clear());
	$.delegated('keydown', input, (e) => e.key === 'Enter' && checkCookieSecurity());
	$.bind_value(input, () => $.get(url), ($$value) => $.set(url, $$value));
	$.delegated('click', button, checkCookieSecurity);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['change', 'keydown', 'click']);