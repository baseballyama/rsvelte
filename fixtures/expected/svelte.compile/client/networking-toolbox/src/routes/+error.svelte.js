import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { page } from '$app/stores';
import { goto } from '$app/navigation';
import { dev } from '$app/environment';
import { site } from '$lib/constants/site';
import Icon from '$lib/components/global/Icon.svelte';
import { errorManager } from '$lib/utils/error-manager';
import { ALL_PAGES } from '$lib/constants/nav';

var root = $.from_html(`<meta name="description"/> <meta name="robots" content="noindex"/>`, 1);
var root_1 = $.from_html(`<div class="svelte-1j96wlh"><strong>Message:</strong> </div>`);
var root_2 = $.from_html(`<div class="svelte-1j96wlh"><strong>Error ID:</strong> <code class="svelte-1j96wlh"> </code></div>`);
var root_3 = $.from_html(`<div class="dev-note svelte-1j96wlh">Development mode: Full error details are logged to console</div>`);
var root_4 = $.from_html(`<details class="error-technical svelte-1j96wlh"><summary class="svelte-1j96wlh">Technical Details</summary> <div class="error-message svelte-1j96wlh"><!> <!> <!></div></details>`);
var root_5 = $.from_html(`<p class="svelte-1j96wlh"> </p>`);
var root_6 = $.from_html(`<a class="tool-card svelte-1j96wlh"><!> <div class="tool-info svelte-1j96wlh"><h4 class="svelte-1j96wlh"> </h4> <!></div></a>`);
var root_7 = $.from_html(`<div class="suggested-tools svelte-1j96wlh"><h3 class="svelte-1j96wlh">Did you mean?</h3> <div class="tools-grid svelte-1j96wlh"></div></div>`);
var root_8 = $.from_html(`<li class="svelte-1j96wlh"> </li>`);
var root_9 = $.from_html(`<div class="error-suggestions svelte-1j96wlh"><h3 class="svelte-1j96wlh">What can you do?</h3> <ul class="svelte-1j96wlh"></ul></div>`);
var root_10 = $.from_html(`<div class="error-container svelte-1j96wlh"><div class="card error-content svelte-1j96wlh"><div class="error-details svelte-1j96wlh"><h1 class="error-status svelte-1j96wlh"> </h1> <h2 class="error-title svelte-1j96wlh"> </h2> <p class="error-description svelte-1j96wlh"> </p> <!></div> <!> <div class="error-actions svelte-1j96wlh"><button class="btn btn-primary svelte-1j96wlh"><!> Go Home</button> <button class="btn btn-secondary svelte-1j96wlh"><!> Refresh</button></div></div></div>`);

export default function _error($$anchor, $$props) {
	$.push($$props, true);

	const $page = () => $.store_get(page, '$page', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	// Defensive helper to safely read values
	const safely = (fn, fallback) => {
		try {
			return fn();
		} catch(err) {
			console.error('Error page read failed:', err);

			return fallback;
		}
	};

	let status = $.derived(() => safely(() => $page().status ?? 500, 500));
	let message = $.derived(() => safely(() => $page().error?.message ?? 'An unexpected error occurred', 'An unexpected error occurred'));
	let errorId = $.derived(() => safely(() => $page().error?.errorId, undefined));
	let suggestions = $.state($.proxy([]));

	// Find smart suggestions based on the 404 URL (defensive - never crash)
	function findSuggestions(path) {
		try {
			if (!path || path === '/') return [];

			const query = path.toLowerCase().replace(/^\/|\/$/g, '').replace(/[_-]/g, ' ');
			const tokens = query.split(/[/\s]+/).filter((t) => t.length > 1);

			if (tokens.length === 0) return [];

			return ALL_PAGES.map((p) => {
				let score = 0;
				const label = p.label.toLowerCase();
				const hrefLower = p.href.toLowerCase();
				const searchText = `${label} ${p.description || ''} ${p.keywords?.join(' ') || ''} ${p.href}`.toLowerCase();

				// Direct path match
				if (hrefLower === path.toLowerCase()) score += 1000; else if (hrefLower.includes(query.replace(/\s/g, '-'))) score += 500;

				// Token matching
				tokens.forEach((token) => {
					if (label.includes(token)) score += 100;
					if (searchText.includes(token)) score += 50;
					if (p.keywords?.some((k) => k.toLowerCase().includes(token))) score += 75;
				});

				// Acronym match
				if (tokens.length === 1) {
					const acronym = label.split(/\s+/).map((w) => w[0]).join('');

					if (acronym === tokens[0]) score += 200;
				}

				return { ...p, score };
			}).filter((p) => p.score > 40).sort((a, b) => b.score - a.score).slice(0, 6);
		} catch(err) {
			console.error('Failed to generate suggestions:', err);

			return [];
		}
	}

	$.user_effect(() => {
		try {
			if ($.get(status) === 404) {
				$.set(suggestions, findSuggestions($page().url?.pathname ?? ''), true);
			}
		} catch {
			$.set(suggestions, [], true);
		}
	});

	const errorTypes = {
		404: {
			title: 'Page Not Found',
			description: "The page you're looking for doesn't exist or has been moved.",
			icon: 'alert-circle',
			suggestions: [
				'Check the URL for typos',
				'Use the navigation menu to find what you need',
				'Return to the homepage and browse from there'
			]
		},
		500: {
			title: 'Server Error',
			description: 'Something went wrong on our end. Please try again later.',
			icon: 'alert-triangle',
			suggestions: [
				'Refresh the page to try again',
				'Check your internet connection',
				'Try again in a few minutes'
			]
		},
		default: {
			title: 'Something Went Wrong',
			description: 'We encountered an unexpected error.',
			icon: 'alert-triangle',
			suggestions: [
				'Refresh the page to try again',
				'Go back to the previous page',
				'Return to the homepage'
			]
		}
	};

	let errorInfo = $.derived(() => errorTypes[$.get(status)] || errorTypes.default);

	const goHome = () => {
		try {
			goto('/');
		} catch {
			window.location.href = '/';
		}
	};

	const refresh = () => {
		try {
			location.reload();
		} catch {
			/* Silently fail */
		}
	};

	// Report error to error manager on mount (client-side only)
	onMount(() => {
		try {
			if ($page().error && $.get(status) >= 500) {
				errorManager.captureException($page().error, 'error', {
					url: $page().url?.pathname,
					status: $.get(status),
					component: 'ErrorPage'
				});
			}
		} catch(err) {
			// Never let error reporting crash the error page
			console.error('Failed to report error:', err);
		}
	});

	var div = root_10();

	$.head('1j96wlh', ($$anchor) => {
		var fragment = root();
		var meta = $.first_child(fragment);

		$.next(2);
		$.template_effect(() => $.set_attribute(meta, 'content', $.get(errorInfo).description));

		$.deferred_template_effect(() => {
			$.document.title = `${$.get(status) ?? ''} - ${$.get(errorInfo).title ?? ''} | ${site.title ?? ''}`;
		});

		$.append($$anchor, fragment);
	});

	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var h1 = $.child(div_2);
	var text = $.only_child(h1, true);
	var h2 = $.sibling(h1, 2);
	var text_1 = $.only_child(h2, true);
	var p_1 = $.sibling(h2, 2);
	var text_2 = $.only_child(p_1, true);
	var node = $.sibling(p_1, 2);

	{
		var consequent_3 = ($$anchor) => {
			var details = root_4();
			var div_3 = $.sibling($.child(details), 2);
			var node_1 = $.child(div_3);

			{
				var consequent = ($$anchor) => {
					var div_4 = root_1();
					var text_3 = $.sibling($.child(div_4));

					$.reset(div_4);
					$.template_effect(() => $.set_text(text_3, ` ${$.get(message) ?? ''}`));
					$.append($$anchor, div_4);
				};

				var d = $.derived(() => $.get(message) && !$.get(errorInfo).title.includes($.get(message)));

				$.if(node_1, ($$render) => {
					if ($.get(d)) $$render(consequent);
				});
			}

			var node_2 = $.sibling(node_1, 2);

			{
				var consequent_1 = ($$anchor) => {
					var div_5 = root_2();
					var code = $.sibling($.child(div_5), 2);
					var text_4 = $.only_child(code, true);

					$.reset(div_5);
					$.template_effect(() => $.set_text(text_4, $.get(errorId)));
					$.append($$anchor, div_5);
				};

				$.if(node_2, ($$render) => {
					if ($.get(errorId)) $$render(consequent_1);
				});
			}

			var node_3 = $.sibling(node_2, 2);

			{
				var consequent_2 = ($$anchor) => {
					var div_6 = root_3();

					$.append($$anchor, div_6);
				};

				$.if(node_3, ($$render) => {
					if (dev) $$render(consequent_2);
				});
			}

			$.reset(div_3);
			$.reset(details);
			$.append($$anchor, details);
		};

		var d_1 = $.derived(() => $.get(message) && !$.get(errorInfo).title.includes($.get(message)) || $.get(errorId) || dev);

		$.if(node, ($$render) => {
			if ($.get(d_1)) $$render(consequent_3);
		});
	}

	$.reset(div_2);

	var node_4 = $.sibling(div_2, 2);

	{
		var consequent_6 = ($$anchor) => {
			var div_7 = root_7();
			var div_8 = $.sibling($.child(div_7), 2);

			$.each(div_8, 21, () => $.get(suggestions), (tool) => tool.href, ($$anchor, tool) => {
				var a_1 = root_6();
				var node_5 = $.child(a_1);

				{
					var consequent_4 = ($$anchor) => {
						Icon($$anchor, {
							get name() {
								return $.get(tool).icon;
							},
							size: 'md'
						});
					};

					$.if(node_5, ($$render) => {
						if ($.get(tool).icon) $$render(consequent_4);
					});
				}

				var div_9 = $.sibling(node_5, 2);
				var h4 = $.child(div_9);
				var text_5 = $.only_child(h4, true);
				var node_6 = $.sibling(h4, 2);

				{
					var consequent_5 = ($$anchor) => {
						var p_2 = root_5();
						var text_6 = $.only_child(p_2, true);

						$.template_effect(() => $.set_text(text_6, $.get(tool).description));
						$.append($$anchor, p_2);
					};

					$.if(node_6, ($$render) => {
						if ($.get(tool).description) $$render(consequent_5);
					});
				}

				$.reset(div_9);
				$.reset(a_1);

				$.template_effect(() => {
					$.set_attribute(a_1, 'href', $.get(tool).href);
					$.set_text(text_5, $.get(tool).label);
				});

				$.append($$anchor, a_1);
			});

			$.reset(div_8);
			$.reset(div_7);
			$.append($$anchor, div_7);
		};

		var alternate = ($$anchor) => {
			var div_10 = root_9();
			var ul = $.sibling($.child(div_10), 2);

			$.each(ul, 21, () => $.get(errorInfo).suggestions, $.index, ($$anchor, suggestion) => {
				var li = root_8();
				var text_7 = $.only_child(li, true);

				$.template_effect(() => $.set_text(text_7, $.get(suggestion)));
				$.append($$anchor, li);
			});

			$.reset(ul);
			$.reset(div_10);
			$.append($$anchor, div_10);
		};

		$.if(node_4, ($$render) => {
			if ($.get(suggestions).length > 0 && $.get(status) === 404) $$render(consequent_6); else $$render(alternate, -1);
		});
	}

	var div_11 = $.sibling(node_4, 2);
	var button = $.child(div_11);
	var node_7 = $.child(button);

	Icon(node_7, { name: 'arrow-left', size: 'sm' });
	$.next();
	$.reset(button);

	var button_1 = $.sibling(button, 2);
	var node_8 = $.child(button_1);

	Icon(node_8, { name: 'rotate', size: 'sm' });
	$.next();
	$.reset(button_1);
	$.reset(div_11);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, $.get(status));
		$.set_text(text_1, $.get(errorInfo).title);
		$.set_text(text_2, $.get(errorInfo).description);
	});

	$.delegated('click', button, goHome);
	$.delegated('click', button_1, refresh);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);