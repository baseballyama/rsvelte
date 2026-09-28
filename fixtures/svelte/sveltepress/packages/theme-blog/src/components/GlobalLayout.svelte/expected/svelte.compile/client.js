import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onNavigate } from '$app/navigation';
import { base } from '$app/paths';
import { blogConfig } from 'virtual:sveltepress/blog-config';
import SearchModal from './SearchModal.svelte';
import Sidebar from './Sidebar.svelte';
import ThemeToggle from './ThemeToggle.svelte';
import '@fontsource-variable/fraunces';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

var root_1 = $.from_html(`<meta name="description"/> <meta property="og:description"/>`, 1);
var root_2 = $.from_html(`<meta name="twitter:creator"/>`);
var root_3 = $.from_html(`<meta property="og:site_name"/> <meta property="og:type" content="website"/> <meta property="og:title"/> <!> <meta property="og:image"/> <meta name="twitter:card" content="summary_large_image"/> <!>`, 1);
var root_4 = $.from_html(`<div class="sp-blog-root svelte-1mzwsy8"><!> <main class="sp-blog-main svelte-1mzwsy8"><!></main> <!></div>`);

export default function GlobalLayout($$anchor, $$props) {
	$.push($$props, true);

	// OG crawlers require absolute URLs; prefer the fully-qualified
	// `blogConfig.base` when set, else fall back to the subpath base.
	const ogOrigin = blogConfig.base?.replace(/\/$/, '') ?? base;

	const ogHome = `${ogOrigin}/og/__home.png`;

	// Cross-document view transitions. When the browser supports it and the
	// user hasn't opted out of motion, wrap each SvelteKit navigation in a
	// `document.startViewTransition` so elements sharing a `view-transition-name`
	// (card cover ↔ post hero, card title ↔ post title) morph between pages.
	//
	// We toggle `html.sp-vt-active` around the transition because the masonry
	// cards use `content-visibility: auto`. On back-nav the "new" snapshot is
	// captured before those off-viewport cards get promoted to rendered, so
	// their `view-transition-name` elements are absent from the capture and
	// the morph falls back to a root crossfade. The class lets a global CSS
	// rule force `content-visibility: visible` for the window of the VT.
	onNavigate((navigation) => {
		if (typeof document === 'undefined') return;

		const start = document.startViewTransition;

		if (!start) return;
		if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

		const root = document.documentElement;

		root.classList.add('sp-vt-active');

		const clear = () => root.classList.remove('sp-vt-active');

		return new Promise((resolve) => {
			const transition = start.call(document, async () => {
				resolve();
				await navigation.complete;
			});

			transition.finished.then(clear, clear);
		});
	});

	let searchOpen = $.state(false);

	$.user_effect(() => {
		const onOpen = () => {
			$.set(searchOpen, true);
		};

		const onKeydown = (e) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
				e.preventDefault();
				$.set(searchOpen, !$.get(searchOpen));
			}
		};

		window.addEventListener('sp-search-open', onOpen);
		window.addEventListener('keydown', onKeydown);

		return () => {
			window.removeEventListener('sp-search-open', onOpen);
			window.removeEventListener('keydown', onKeydown);
		};
	});

	// Inject user-customised CSS variable overrides at runtime.
	// We use a <style> element (not {@html} in <svelte:head>) to avoid
	// the svelte2tsx build failure that {@html `<style>...</style>`} triggers.
	$.user_effect(() => {
		const dark = blogConfig.themeColor;
		const light = blogConfig.themeColorLight;

		if (!dark && !light) return;

		const lines = [];

		if (dark) {
			const vars = Object.entries({
				'--sp-blog-primary': dark.primary,
				'--sp-blog-secondary': dark.secondary,
				'--sp-blog-bg': dark.bg,
				'--sp-blog-surface': dark.surface
			}).filter(([, v]) => v).map(([k, v]) => `${k}:${v}`).join(';');

			if (vars) lines.push(`[data-theme="dark"] .sp-blog-root{${vars}}`);
		}

		if (light) {
			const vars = Object.entries({
				'--sp-blog-primary': light.primary,
				'--sp-blog-secondary': light.secondary,
				'--sp-blog-bg': light.bg,
				'--sp-blog-surface': light.surface
			}).filter(([, v]) => v).map(([k, v]) => `${k}:${v}`).join(';');

			if (vars) lines.push(`[data-theme="light"] .sp-blog-root{${vars}}`);
		}

		if (!lines.length) return;

		const style = document.createElement('style');

		style.id = 'sp-blog-custom-theme';
		style.textContent = lines.join('\n');
		document.head.appendChild(style);

		return () => style.remove();
	});

	var div = root_4();

	$.head('1mzwsy8', ($$anchor) => {
		var fragment = root_3();
		var meta = $.first_child(fragment);
		var meta_1 = $.sibling(meta, 4);
		var node = $.sibling(meta_1, 2);

		{
			var consequent = ($$anchor) => {
				var fragment_1 = root_1();
				var meta_2 = $.first_child(fragment_1);
				var meta_3 = $.sibling(meta_2, 2);

				$.template_effect(() => {
					$.set_attribute(meta_2, 'content', blogConfig.description);
					$.set_attribute(meta_3, 'content', blogConfig.description);
				});

				$.append($$anchor, fragment_1);
			};

			$.if(node, ($$render) => {
				if (blogConfig.description) $$render(consequent);
			});
		}

		var meta_4 = $.sibling(node, 2);
		var node_1 = $.sibling(meta_4, 4);

		{
			var consequent_1 = ($$anchor) => {
				var meta_5 = root_2();

				$.template_effect(() => $.set_attribute(meta_5, 'content', `@${blogConfig.author.socials.twitter}`));
				$.append($$anchor, meta_5);
			};

			$.if(node_1, ($$render) => {
				if (blogConfig.author?.socials?.twitter) $$render(consequent_1);
			});
		}

		$.template_effect(() => {
			$.set_attribute(meta, 'content', blogConfig.title ?? 'Blog');
			$.set_attribute(meta_1, 'content', blogConfig.title ?? 'Blog');
			$.set_attribute(meta_4, 'content', ogHome);
		});

		$.deferred_template_effect(() => {
			$.document.title = blogConfig.title ?? 'Blog' ?? '';
		});

		$.append($$anchor, fragment);
	});

	var node_2 = $.child(div);

	{
		const toggle = ($$anchor) => {
			ThemeToggle($$anchor, {});
		};

		let $0 = $.derived(() => blogConfig.title ?? 'Blog');
		let $1 = $.derived(() => blogConfig.navbar ?? []);

		Sidebar(node_2, {
			get title() {
				return $.get($0);
			},

			get links() {
				return $.get($1);
			},

			get search() {
				return $$props.search;
			},
			toggle,
			$$slots: { toggle: true }
		});
	}

	var main = $.sibling(node_2, 2);
	var node_3 = $.child(main);

	$.snippet(node_3, () => $$props.children ?? $.noop);
	$.reset(main);

	var node_4 = $.sibling(main, 2);

	SearchModal(node_4, {
		get open() {
			return $.get(searchOpen);
		},
		onClose: () => $.set(searchOpen, false)
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}