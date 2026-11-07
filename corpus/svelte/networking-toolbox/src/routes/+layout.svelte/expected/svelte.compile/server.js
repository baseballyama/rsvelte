import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { page } from '$app/stores';
import '../styles/base.scss';
import '../styles/variables.scss';
import '../styles/themes.scss';
import '../styles/components.scss';
import '../styles/ref-pages.scss';
import '../styles/diagnostics-pages.scss';
import '../styles/pages.scss';
import '../styles/a11y.scss';
import favicon from '$lib/assets/favicon.svg';
import { getPageDetails, getPageDetailsWithIcon } from '$lib/utils/nav-helpers';
import { generateFaviconDataUri } from '$lib/utils/favicon';
import { site, author } from '$lib/constants/site';
import { toolUsage } from '$lib/stores/toolUsage';
import { accessibility } from '$lib/stores/accessibility';
import { theme } from '$lib/stores/theme';
import { customCss } from '$lib/stores/customCss';
import { siteCustomization } from '$lib/stores/siteCustomization';
import { primaryColor } from '$lib/stores/primaryColor';
import { fontScale } from '$lib/stores/fontScale';
import { ALL_PAGES } from '$lib/constants/nav';
import { initializeOfflineSupport } from '$lib/stores/offline';
import { bookmarks } from '$lib/stores/bookmarks';
import { ANALYTICS_ENABLED, ANALYTICS_DOMAIN, ANALYTICS_DSN } from '$lib/config/customizable-settings';
import Header from '$lib/components/furniture/Header.svelte';
import SubHeader from '$lib/components/furniture/SubHeader.svelte';
import Footer from '$lib/components/furniture/Footer.svelte';
import OfflineIndicator from '$lib/components/common/OfflineIndicator.svelte';
import { schemaToJsonLd } from '$lib/seo/json-ld';

import {
	generateWebSiteSchema,
	generateHomepageSoftwareSchema,
	generateOrganizationSchema,
	generateToolPageSchemas
} from '$lib/seo/schema-generators';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		// SEO Schema imports
		let { data, children } = $$props; // Gets data from the server load function

		let faviconTrigger = 0; // Trigger to force favicon updates
		let accessibilitySettings = accessibility; // Accessibility settings store
		let currentTheme = theme; // Theme store
		let currentBookmarks = bookmarks; // Bookmarks store
		let currentCustomCss = customCss; // Custom CSS store

		// Get page-specific metadata or fallback to site defaults
		const seoData = $.derived(() => {
			const currentPath = $.store_get($$store_subs ??= {}, '$page', page).url?.pathname ?? '/';
			const pageDetails = getPageDetails(currentPath);

			return {
				title: pageDetails?.title ? `${pageDetails.title} | ${site.title}` : site.title,
				description: pageDetails?.description || site.description,
				keywords: pageDetails?.keywords?.length ? pageDetails.keywords.join(', ') : site.keywords,
				url: `${site.url}${currentPath}`,
				image: site.image
			};
		});

		// Calculate prev/next pages for sequential navigation
		const sequentialNav = $.derived(() => {
			const currentPath = $.store_get($$store_subs ??= {}, '$page', page).url?.pathname ?? '/';
			const currentIndex = ALL_PAGES.findIndex((page) => page.href === currentPath);

			// Not a tool page or not found in ALL_PAGES
			if (currentIndex === -1) {
				return { prev: null, next: null };
			}

			const prevPage = currentIndex > 0 ? ALL_PAGES[currentIndex - 1] : null;
			const nextPage = currentIndex < ALL_PAGES.length - 1 ? ALL_PAGES[currentIndex + 1] : null;

			return {
				prev: prevPage ? `${site.url}${prevPage.href}` : null,
				next: nextPage ? `${site.url}${nextPage.href}` : null
			};
		});

		// Dynamic favicon based on page icon
		const dynamicFavicon = $.derived(() => {
			void faviconTrigger; // Include in order to force updates when theme changes

			// Check if we're on an error page
			const isErrorPage = ($.store_get($$store_subs ??= {}, '$page', page).status ?? 200) >= 400;

			if (isErrorPage) {
				const errorFaviconDataUri = generateFaviconDataUri('lost');

				if (errorFaviconDataUri) {
					return errorFaviconDataUri;
				}
			}

			const currentPath = $.store_get($$store_subs ??= {}, '$page', page).url?.pathname ?? '/';
			const pageDetailsWithIcon = getPageDetailsWithIcon(currentPath);

			if (pageDetailsWithIcon?.icon) {
				const faviconDataUri = generateFaviconDataUri(pageDetailsWithIcon.icon);

				if (faviconDataUri) {
					return faviconDataUri;
				}
			}

			const coloredFaviconDataUri = generateFaviconDataUri('z-globe');

			if (coloredFaviconDataUri) {
				return coloredFaviconDataUri;
			}

			return favicon;
		});

		function handleGlobalKeydown(e) {
			// Ctrl + H to go to homepage
			if (e.ctrlKey && e.key === 'h') {
				e.preventDefault();
				window.location.href = '/';
			} else // Ctrl + B to go to bookmarks page
			if (e.ctrlKey && e.key === 'b') {
				e.preventDefault();
				window.location.href = '/bookmarks';
			} else // Ctrl + 0 - smart navigation (10th bookmark or homepage)
			if (e.ctrlKey && e.key === '0') {
				e.preventDefault();

				if ($.store_get($$store_subs ??= {}, '$currentBookmarks', currentBookmarks)[9]) {
					window.location.href = $.store_get($$store_subs ??= {}, '$currentBookmarks', currentBookmarks)[9].href;
				} else {
					window.location.href = '/';
				}
			} else // Ctrl + [1-9] to jump to bookmarked tool
			if (e.ctrlKey && e.key >= '1' && e.key <= '9') {
				e.preventDefault();

				const index = parseInt(e.key, 10) - 1;

				if ($.store_get($$store_subs ??= {}, '$currentBookmarks', currentBookmarks)[index]) {
					window.location.href = $.store_get($$store_subs ??= {}, '$currentBookmarks', currentBookmarks)[index].href;
				}
			}
		}

		onMount(() => {
			theme.init();
			toolUsage.init();
			accessibility.init();
			bookmarks.init();
			customCss.init();
			siteCustomization.init();
			primaryColor.init();
			fontScale.init();
			initializeOfflineSupport();

			// Add global keyboard shortcuts
			window.addEventListener('keydown', handleGlobalKeydown);

			// Console message
			console.log(`\n%c🧰 Networking Toolbox` + '%c\nLicensed under MIT, © Alicia Sykes 2026.\nhttps://github.com/lissy93/networking-toolbox\n', 'color:#e3ed70; background:#21262d; font-size:1.6rem; padding:0.15rem 0.25rem; ' + 'margin: 1rem auto 0.5rem auto; font-family: Helvetica; border: 2px solid #e3ed70; ' + 'border-radius: 4px;font-weight: bold; text-shadow: 1px 1px 4px #000;', 'color: #e3ed70; font-size:0.8rem; font-family: Helvetica; margin: 0;');

			return () => {
				window.removeEventListener('keydown', handleGlobalKeydown);
			};
		});

		// Track tool visits when page changes
		// Check if current path is a tool page
		// Apply accessibility settings to HTML element
		// Theme change effect - trigger favicon update when theme changes
		// Subscribe to theme changes
		// Trigger favicon update 50ms after theme change
		// Apply custom CSS to page
		// Apply custom primary color
		// Generate schema markup for tool pages
		const toolSchemas = $.derived(() => {
			const currentPath = $.store_get($$store_subs ??= {}, '$page', page).url?.pathname ?? '/';

			if (currentPath === '/') return [];

			const pageDetails = getPageDetails(currentPath);

			if (!pageDetails) return [];

			return generateToolPageSchemas(pageDetails, currentPath);
		});

		$.head('12qhfyh', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${$.escape(seoData().title)}</title>`);
			});

			$$renderer.push(`<link rel="icon" type="image/svg+xml"${$.attr('href', dynamicFavicon())}/> <link rel="shortcut icon" type="image/svg+xml"${$.attr('href', dynamicFavicon())}/>  <meta name="description"${$.attr('content', seoData().description)}/> <meta name="keywords"${$.attr('content', seoData().keywords)}/> <meta name="author"${$.attr('content', author.name)}/> <link rel="canonical"${$.attr('href', seoData().url)}/> `);

			if (sequentialNav().prev) {
				$$renderer.push(`<!--[0--><link rel="prev"${$.attr('href', sequentialNav().prev)}/>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (sequentialNav().next) {
				$$renderer.push(`<!--[0--><link rel="next"${$.attr('href', sequentialNav().next)}/>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <meta property="og:type" content="website"/> <meta property="og:title"${$.attr('content', seoData().title)}/> <meta property="og:description"${$.attr('content', seoData().description)}/> <meta property="og:url"${$.attr('content', seoData().url)}/> <meta property="og:image"${$.attr('content', seoData().image)}/> <meta property="og:image:width" content="1200"/> <meta property="og:image:height" content="675"/> <meta property="og:image:type" content="image/png"/> <meta property="og:image:alt" content="Networking Toolbox - Comprehensive IP and network tools"/> <meta property="og:site_name"${$.attr('content', site.name)}/> <meta property="og:locale" content="en_US"/> <meta name="twitter:card" content="summary_large_image"/> <meta name="twitter:site" content="@lissy_sykes"/> <meta name="twitter:creator" content="@lissy_sykes"/> <meta name="twitter:title"${$.attr('content', seoData().title)}/> <meta name="twitter:description"${$.attr('content', seoData().description)}/> <meta name="twitter:image"${$.attr('content', seoData().image)}/> <meta name="twitter:image:alt" content="Networking Toolbox - Comprehensive IP and network tools"/> <meta name="robots" content="index, follow"/> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <meta name="referrer" content="strict-origin-when-cross-origin"/> <meta name="generator" content="SvelteKit"/> <link rel="manifest" href="/manifest.json"/> <meta name="mobile-web-app-capable" content="yes"/> <meta name="apple-mobile-web-app-capable" content="yes"/> <meta name="apple-mobile-web-app-status-bar-style" content="default"/> <meta name="apple-mobile-web-app-title"${$.attr('content', site.name)}/> <meta name="application-name"${$.attr('content', site.name)}/> <meta name="msapplication-TileColor" content="#2563eb"/> <meta name="theme-color" content="#2563eb"/>  ${$.html(schemaToJsonLd(data.breadcrumbJsonLd))} `);

			if ($.store_get($$store_subs ??= {}, '$page', page).url.pathname === '/') {
				$$renderer.push(`<!--[0-->${$.html(schemaToJsonLd(generateWebSiteSchema()))}  ${$.html(schemaToJsonLd(generateHomepageSoftwareSchema()))}  ${$.html(schemaToJsonLd(generateOrganizationSchema()))}`);
			} else {
				$$renderer.push(`<!--[-1--><!--[-->`);

				const each_array = $.ensure_array_like(toolSchemas());

				for (let i = 0, $$length = each_array.length; i < $$length; i++) {
					let schema = each_array[i];

					$$renderer.push(`${$.html(schemaToJsonLd(schema))}`);
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]--> `);

			if (ANALYTICS_ENABLED) {
				$$renderer.push(`<!--[0--><script defer=""${$.attr('data-domain', ANALYTICS_DOMAIN)}${$.attr('src', ANALYTICS_DSN)}></script>`);
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->  <link rel="stylesheet" href="/custom-styles.css"/>`);
		});

		$$renderer.push(`<a href="#main-content" class="skip-link">Skip to main content</a> <a href="#navigation" class="skip-link">Skip to navigation</a> `);
		Header($$renderer, {});
		$$renderer.push(`<!----> `);
		SubHeader($$renderer, {});
		$$renderer.push(`<!----> `);
		OfflineIndicator($$renderer, {});
		$$renderer.push(`<!----> <main id="main-content" class="main-content svelte-12qhfyh">`);
		children?.($$renderer);
		$$renderer.push(`<!----></main> `);
		Footer($$renderer, {});
		$$renderer.push(`<!---->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}