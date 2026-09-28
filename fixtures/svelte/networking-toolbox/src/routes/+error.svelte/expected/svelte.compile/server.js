import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { page } from '$app/stores';
import { goto } from '$app/navigation';
import { dev } from '$app/environment';
import { site } from '$lib/constants/site';
import Icon from '$lib/components/global/Icon.svelte';
import { errorManager } from '$lib/utils/error-manager';
import { ALL_PAGES } from '$lib/constants/nav';

export default function _error($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		// Defensive helper to safely read values
		const safely = (fn, fallback) => {
			try {
				return fn();
			} catch(err) {
				console.error('Error page read failed:', err);

				return fallback;
			}
		};

		let status = $.derived(() => safely(() => $.store_get($$store_subs ??= {}, '$page', page).status ?? 500, 500));
		let message = $.derived(() => safely(() => $.store_get($$store_subs ??= {}, '$page', page).error?.message ?? 'An unexpected error occurred', 'An unexpected error occurred'));
		let errorId = $.derived(() => safely(() => $.store_get($$store_subs ??= {}, '$page', page).error?.errorId, undefined));
		let suggestions = [];

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

		let errorInfo = $.derived(() => errorTypes[status()] || errorTypes.default);

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
				if ($.store_get($$store_subs ??= {}, '$page', page).error && status() >= 500) {
					errorManager.captureException($.store_get($$store_subs ??= {}, '$page', page).error, 'error', {
						url: $.store_get($$store_subs ??= {}, '$page', page).url?.pathname,
						status: status(),
						component: 'ErrorPage'
					});
				}
			} catch(err) {
				// Never let error reporting crash the error page
				console.error('Failed to report error:', err);
			}
		});

		$.head('1j96wlh', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${$.escape(status())} - ${$.escape(errorInfo().title)} | ${$.escape(site.title)}</title>`);
			});

			$$renderer.push(`<meta name="description"${$.attr('content', errorInfo().description)}/> <meta name="robots" content="noindex"/>`);
		});

		$$renderer.push(`<div class="error-container svelte-1j96wlh"><div class="card error-content svelte-1j96wlh"><div class="error-details svelte-1j96wlh"><h1 class="error-status svelte-1j96wlh">${$.escape(status())}</h1> <h2 class="error-title svelte-1j96wlh">${$.escape(errorInfo().title)}</h2> <p class="error-description svelte-1j96wlh">${$.escape(errorInfo().description)}</p> `);

		if (message() && !errorInfo().title.includes(message()) || errorId() || dev) {
			$$renderer.push(`<!--[0--><details class="error-technical svelte-1j96wlh"><summary class="svelte-1j96wlh">Technical Details</summary> <div class="error-message svelte-1j96wlh">`);

			if (message() && !errorInfo().title.includes(message())) {
				$$renderer.push(`<!--[0--><div class="svelte-1j96wlh"><strong>Message:</strong> ${$.escape(message())}</div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (errorId()) {
				$$renderer.push(`<!--[0--><div class="svelte-1j96wlh"><strong>Error ID:</strong> <code class="svelte-1j96wlh">${$.escape(errorId())}</code></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (dev) {
				$$renderer.push(`<!--[0--><div class="dev-note svelte-1j96wlh">Development mode: Full error details are logged to console</div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></details>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> `);

		if (suggestions.length > 0 && status() === 404) {
			$$renderer.push(`<!--[0--><div class="suggested-tools svelte-1j96wlh"><h3 class="svelte-1j96wlh">Did you mean?</h3> <div class="tools-grid svelte-1j96wlh"><!--[-->`);

			const each_array = $.ensure_array_like(suggestions);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let tool = each_array[$$index];

				$$renderer.push(`<a${$.attr('href', tool.href)} class="tool-card svelte-1j96wlh">`);

				if (tool.icon) {
					$$renderer.push('<!--[0-->');
					Icon($$renderer, { name: tool.icon, size: 'md' });
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <div class="tool-info svelte-1j96wlh"><h4 class="svelte-1j96wlh">${$.escape(tool.label)}</h4> `);

				if (tool.description) {
					$$renderer.push(`<!--[0--><p class="svelte-1j96wlh">${$.escape(tool.description)}</p>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div></a>`);
			}

			$$renderer.push(`<!--]--></div></div>`);
		} else {
			$$renderer.push(`<!--[-1--><div class="error-suggestions svelte-1j96wlh"><h3 class="svelte-1j96wlh">What can you do?</h3> <ul class="svelte-1j96wlh"><!--[-->`);

			const each_array_1 = $.ensure_array_like(errorInfo().suggestions);

			for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
				let suggestion = each_array_1[index];

				$$renderer.push(`<li class="svelte-1j96wlh">${$.escape(suggestion)}</li>`);
			}

			$$renderer.push(`<!--]--></ul></div>`);
		}

		$$renderer.push(`<!--]--> <div class="error-actions svelte-1j96wlh"><button class="btn btn-primary svelte-1j96wlh">`);
		Icon($$renderer, { name: 'arrow-left', size: 'sm' });
		$$renderer.push(`<!----> Go Home</button> <button class="btn btn-secondary svelte-1j96wlh">`);
		Icon($$renderer, { name: 'rotate', size: 'sm' });
		$$renderer.push(`<!----> Refresh</button></div></div></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}