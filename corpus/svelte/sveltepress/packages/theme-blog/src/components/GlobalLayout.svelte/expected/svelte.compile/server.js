import * as $ from 'svelte/internal/server';
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

export default function GlobalLayout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { children, search } = $$props;

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

		let searchOpen = false;

		$.head('1mzwsy8', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${$.escape(blogConfig.title ?? 'Blog')}</title>`);
			});

			$$renderer.push(`<meta property="og:site_name"${$.attr('content', blogConfig.title ?? 'Blog')}/> <meta property="og:type" content="website"/> <meta property="og:title"${$.attr('content', blogConfig.title ?? 'Blog')}/> `);

			if (blogConfig.description) {
				$$renderer.push(`<!--[0--><meta name="description"${$.attr('content', blogConfig.description)}/> <meta property="og:description"${$.attr('content', blogConfig.description)}/>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <meta property="og:image"${$.attr('content', ogHome)}/> <meta name="twitter:card" content="summary_large_image"/> `);

			if (blogConfig.author?.socials?.twitter) {
				$$renderer.push(`<!--[0--><meta name="twitter:creator"${$.attr('content', `@${blogConfig.author.socials.twitter}`)}/>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		});

		$$renderer.push(`<div class="sp-blog-root svelte-1mzwsy8">`);

		{
			function toggle($$renderer) {
				ThemeToggle($$renderer, {});
			}

			Sidebar($$renderer, {
				title: blogConfig.title ?? 'Blog',
				links: blogConfig.navbar ?? [],
				search,
				toggle,
				$$slots: { toggle: true }
			});
		}

		$$renderer.push(`<!----> <main class="sp-blog-main svelte-1mzwsy8">`);
		children?.($$renderer);
		$$renderer.push(`<!----></main> `);
		SearchModal($$renderer, { open: searchOpen, onClose: () => searchOpen = false });
		$$renderer.push(`<!----></div>`);
	});
}