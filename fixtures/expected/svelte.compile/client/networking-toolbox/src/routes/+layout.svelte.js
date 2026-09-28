import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<link rel="prev"/>`);
var root_1 = $.from_html(`<link rel="next"/>`);
var root_2 = $.from_html(`<!>  <!>  <!>`, 1);
var root_3 = $.with_script($.from_html(`<script defer=""></script><!>`, 1));
var root_4 = $.from_html(`<link rel="icon" type="image/svg+xml"/> <link rel="shortcut icon" type="image/svg+xml"/>  <meta name="description"/> <meta name="keywords"/> <meta name="author"/> <link rel="canonical"/> <!> <!> <meta property="og:type" content="website"/> <meta property="og:title"/> <meta property="og:description"/> <meta property="og:url"/> <meta property="og:image"/> <meta property="og:image:width" content="1200"/> <meta property="og:image:height" content="675"/> <meta property="og:image:type" content="image/png"/> <meta property="og:image:alt" content="Networking Toolbox - Comprehensive IP and network tools"/> <meta property="og:site_name"/> <meta property="og:locale" content="en_US"/> <meta name="twitter:card" content="summary_large_image"/> <meta name="twitter:site" content="@lissy_sykes"/> <meta name="twitter:creator" content="@lissy_sykes"/> <meta name="twitter:title"/> <meta name="twitter:description"/> <meta name="twitter:image"/> <meta name="twitter:image:alt" content="Networking Toolbox - Comprehensive IP and network tools"/> <meta name="robots" content="index, follow"/> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <meta name="referrer" content="strict-origin-when-cross-origin"/> <meta name="generator" content="SvelteKit"/> <link rel="manifest" href="/manifest.json"/> <meta name="mobile-web-app-capable" content="yes"/> <meta name="apple-mobile-web-app-capable" content="yes"/> <meta name="apple-mobile-web-app-status-bar-style" content="default"/> <meta name="apple-mobile-web-app-title"/> <meta name="application-name"/> <meta name="msapplication-TileColor" content="#2563eb"/> <meta name="theme-color" content="#2563eb"/>  <!> <!> <!>  <link rel="stylesheet" href="/custom-styles.css"/>`, 1);
var root_5 = $.from_html(`<a href="#main-content" class="skip-link">Skip to main content</a> <a href="#navigation" class="skip-link">Skip to navigation</a> <!> <!> <!> <main id="main-content" class="main-content svelte-12qhfyh"><!></main> <!>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	const $page = () => $.store_get(page, '$page', $$stores);
	const $currentBookmarks = () => $.store_get(currentBookmarks, '$currentBookmarks', $$stores);
	const $accessibilitySettings = () => $.store_get(accessibilitySettings, '$accessibilitySettings', $$stores);
	const $currentTheme = () => $.store_get(currentTheme, '$currentTheme', $$stores);
	const $currentCustomCss = () => $.store_get(currentCustomCss, '$currentCustomCss', $$stores);
	const $primaryColor = () => $.store_get(primaryColor, '$primaryColor', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	// SEO Schema imports
	// Gets data from the server load function
	let faviconTrigger = $.state(0 // Trigger to force favicon updates
	);

	let accessibilitySettings = $.proxy(accessibility // Accessibility settings store
	);
	let currentTheme = $.proxy(theme // Theme store
	);
	let currentBookmarks = $.proxy(bookmarks // Bookmarks store
	);
	let currentCustomCss = $.proxy(customCss // Custom CSS store
	);

	// Get page-specific metadata or fallback to site defaults
	const seoData = $.derived(() => {
		const currentPath = $page().url?.pathname ?? '/';
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
		const currentPath = $page().url?.pathname ?? '/';
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
		void $.get(faviconTrigger // Include in order to force updates when theme changes
		);

		// Check if we're on an error page
		const isErrorPage = ($page().status ?? 200) >= 400;

		if (isErrorPage) {
			const errorFaviconDataUri = generateFaviconDataUri('lost');

			if (errorFaviconDataUri) {
				return errorFaviconDataUri;
			}
		}

		const currentPath = $page().url?.pathname ?? '/';
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

			if ($currentBookmarks()[9]) {
				window.location.href = $currentBookmarks()[9].href;
			} else {
				window.location.href = '/';
			}
		} else // Ctrl + [1-9] to jump to bookmarked tool
		if (e.ctrlKey && e.key >= '1' && e.key <= '9') {
			e.preventDefault();

			const index = parseInt(e.key, 10) - 1;

			if ($currentBookmarks()[index]) {
				window.location.href = $currentBookmarks()[index].href;
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
	$.user_effect(() => {
		const currentPath = $page().url?.pathname ?? '/';

		// Check if current path is a tool page
		const toolPage = ALL_PAGES.find((tool) => tool.href === currentPath);

		if (toolPage) {
			toolUsage.trackVisit(toolPage.href, toolPage.label, toolPage.icon, toolPage.description);
		}
	});

	// Apply accessibility settings to HTML element
	$.user_effect(() => {
		if (typeof document === 'undefined') return;

		const cssClasses = accessibility.getCSSClasses($accessibilitySettings());

		if (cssClasses.trim()) {
			document.documentElement.setAttribute('data-a11y', cssClasses);
		} else {
			document.documentElement.removeAttribute('data-a11y');
		}
	});

	// Theme change effect - trigger favicon update when theme changes
	$.user_effect(() => {
		// Subscribe to theme changes
		void $currentTheme();

		// Trigger favicon update 50ms after theme change
		setTimeout(
			() => {
				$.update(faviconTrigger);
			},
			50
		);
	});

	// Apply custom CSS to page
	$.user_effect(() => {
		if (typeof document === 'undefined') return;

		const customCssValue = $currentCustomCss();
		let styleEl = document.getElementById('user-custom-css');

		if (customCssValue && customCssValue.trim()) {
			if (!styleEl) {
				styleEl = document.createElement('style');
				styleEl.id = 'user-custom-css';
				document.head.appendChild(styleEl);
			}

			styleEl.textContent = customCssValue;
		} else {
			if (styleEl) {
				styleEl.remove();
			}
		}
	});

	// Apply custom primary color
	$.user_effect(() => {
		if (typeof document === 'undefined') return;

		const color = $primaryColor();

		if (color && color.trim()) {
			document.documentElement.style.setProperty('--color-primary', color);
		} else {
			document.documentElement.style.removeProperty('--color-primary');
		}
	});

	// Generate schema markup for tool pages
	const toolSchemas = $.derived(() => {
		const currentPath = $page().url?.pathname ?? '/';

		if (currentPath === '/') return [];

		const pageDetails = getPageDetails(currentPath);

		if (!pageDetails) return [];

		return generateToolPageSchemas(pageDetails, currentPath);
	});

	var fragment_5 = root_5();

	$.head('12qhfyh', ($$anchor) => {
		var fragment = root_4();
		var link = $.first_child(fragment);
		var link_1 = $.sibling(link, 2);
		var meta = $.sibling(link_1, 2);
		var meta_1 = $.sibling(meta, 2);
		var meta_2 = $.sibling(meta_1, 2);
		var link_2 = $.sibling(meta_2, 2);
		var node = $.sibling(link_2, 2);

		{
			var consequent = ($$anchor) => {
				var link_3 = root();

				$.template_effect(() => $.set_attribute(link_3, 'href', $.get(sequentialNav).prev));
				$.append($$anchor, link_3);
			};

			$.if(node, ($$render) => {
				if ($.get(sequentialNav).prev) $$render(consequent);
			});
		}

		var node_1 = $.sibling(node, 2);

		{
			var consequent_1 = ($$anchor) => {
				var link_4 = root_1();

				$.template_effect(() => $.set_attribute(link_4, 'href', $.get(sequentialNav).next));
				$.append($$anchor, link_4);
			};

			$.if(node_1, ($$render) => {
				if ($.get(sequentialNav).next) $$render(consequent_1);
			});
		}

		var meta_3 = $.sibling(node_1, 4);
		var meta_4 = $.sibling(meta_3, 2);
		var meta_5 = $.sibling(meta_4, 2);
		var meta_6 = $.sibling(meta_5, 2);
		var meta_7 = $.sibling(meta_6, 10);
		var meta_8 = $.sibling(meta_7, 10);
		var meta_9 = $.sibling(meta_8, 2);
		var meta_10 = $.sibling(meta_9, 2);
		var meta_11 = $.sibling(meta_10, 20);
		var meta_12 = $.sibling(meta_11, 2);
		var node_2 = $.sibling(meta_12, 6);

		$.html(node_2, () => schemaToJsonLd($$props.data.breadcrumbJsonLd));

		var node_3 = $.sibling(node_2, 2);

		{
			var consequent_2 = ($$anchor) => {
				var fragment_1 = root_2();
				var node_4 = $.first_child(fragment_1);

				$.html(node_4, () => schemaToJsonLd(generateWebSiteSchema()));

				var node_5 = $.sibling(node_4, 2);

				$.html(node_5, () => schemaToJsonLd(generateHomepageSoftwareSchema()));

				var node_6 = $.sibling(node_5, 2);

				$.html(node_6, () => schemaToJsonLd(generateOrganizationSchema()));
				$.append($$anchor, fragment_1);
			};

			var alternate = ($$anchor) => {
				var fragment_2 = $.comment();
				var node_7 = $.first_child(fragment_2);

				$.each(node_7, 17, () => $.get(toolSchemas), $.index, ($$anchor, schema) => {
					var fragment_3 = $.comment();
					var node_8 = $.first_child(fragment_3);

					$.html(node_8, () => schemaToJsonLd($.get(schema)));
					$.append($$anchor, fragment_3);
				});

				$.append($$anchor, fragment_2);
			};

			$.if(node_3, ($$render) => {
				if ($page().url.pathname === '/') $$render(consequent_2); else $$render(alternate, -1);
			});
		}

		var node_9 = $.sibling(node_3, 2);

		{
			var consequent_3 = ($$anchor) => {
				var fragment_4 = root_3();
				var script = $.first_child(fragment_4);
				var node_10 = $.sibling(script);

				$.template_effect(() => {
					$.set_attribute(script, 'data-domain', ANALYTICS_DOMAIN);
					$.set_attribute(script, 'src', ANALYTICS_DSN);
				});

				$.append($$anchor, fragment_4);
			};

			$.if(node_9, ($$render) => {
				if (ANALYTICS_ENABLED) $$render(consequent_3);
			});
		}

		$.next(2);

		$.template_effect(() => {
			$.set_attribute(link, 'href', $.get(dynamicFavicon));
			$.set_attribute(link_1, 'href', $.get(dynamicFavicon));
			$.set_attribute(meta, 'content', $.get(seoData).description);
			$.set_attribute(meta_1, 'content', $.get(seoData).keywords);
			$.set_attribute(meta_2, 'content', author.name);
			$.set_attribute(link_2, 'href', $.get(seoData).url);
			$.set_attribute(meta_3, 'content', $.get(seoData).title);
			$.set_attribute(meta_4, 'content', $.get(seoData).description);
			$.set_attribute(meta_5, 'content', $.get(seoData).url);
			$.set_attribute(meta_6, 'content', $.get(seoData).image);
			$.set_attribute(meta_7, 'content', site.name);
			$.set_attribute(meta_8, 'content', $.get(seoData).title);
			$.set_attribute(meta_9, 'content', $.get(seoData).description);
			$.set_attribute(meta_10, 'content', $.get(seoData).image);
			$.set_attribute(meta_11, 'content', site.name);
			$.set_attribute(meta_12, 'content', site.name);
		});

		$.deferred_template_effect(() => {
			$.document.title = $.get(seoData).title ?? '';
		});

		$.append($$anchor, fragment);
	});

	var node_11 = $.sibling($.first_child(fragment_5), 4);

	Header(node_11, {});

	var node_12 = $.sibling(node_11, 2);

	SubHeader(node_12, {});

	var node_13 = $.sibling(node_12, 2);

	OfflineIndicator(node_13, {});

	var main = $.sibling(node_13, 2);
	var node_14 = $.child(main);

	$.snippet(node_14, () => $$props.children ?? $.noop);
	$.reset(main);

	var node_15 = $.sibling(main, 2);

	Footer(node_15, {});
	$.append($$anchor, fragment_5);
	$.pop();
	$$cleanup();
}