import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';

import {
	PKG_TO_RUNNER,
	RUNNER_TO_PKG,
	RUNNERS,
	jsrepoAddSnippet,
	shadcnAddSnippet
} from '$lib/constants/cli';

import './QuickStart.css';
import { UseClipboard } from '$lib/hooks/use-clipboard.svelte';

export default function QuickStart($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// We feature Aurora as the showcase install (matches react-bits' featured-install pattern).
		const FEATURED_SLUG = 'aurora';

		let installer = 'jsrepo';
		let pkg = 'npm';
		let dropOpen = false;
		let dropdownEl = null;
		let headerEl = null;
		let terminalEl = null;
		let headerVisible = false;
		let terminalVisible = false;
		const runner = $.derived(() => PKG_TO_RUNNER[pkg]);

		const command = $.derived(() => installer === 'jsrepo'
			? jsrepoAddSnippet(FEATURED_SLUG, pkg)
			: shadcnAddSnippet(FEATURED_SLUG, pkg));

		const clipboard = new UseClipboard();

		function pickRunner(r) {
			pkg = RUNNER_TO_PKG[r];
			dropOpen = false;
		}

		function onDocClick(e) {
			if (!dropOpen) return;
			if (dropdownEl && !dropdownEl.contains(e.target)) dropOpen = false;
		}

		onMount(() => {
			const observe = (el, set) => {
				if (!el) return null;

				const io = new IntersectionObserver(
					(entries) => {
						for (const entry of entries) {
							if (entry.isIntersecting) {
								set(true);
								io.disconnect();
							}
						}
					},
					{ threshold: 0.1, rootMargin: '-60px' }
				);

				io.observe(el);

				return io;
			};

			const obs = [
				observe(headerEl, (v) => headerVisible = v),
				observe(terminalEl, (v) => terminalVisible = v)
			];

			document.addEventListener('click', onDocClick);

			return () => {
				obs.forEach((o) => o?.disconnect());
				document.removeEventListener('click', onDocClick);
			};
		});

		$$renderer.push(`<section class="ln-qs-section"><div class="ln-qs-inner"><div${$.attr_class('ln-qs-header', void 0, { 'is-visible': headerVisible })}><h2 class="ln-qs-title">Get started in seconds</h2></div> <div${$.attr_class('ln-qs-terminal-wrap', void 0, { 'is-visible': terminalVisible })}><div class="ln-qs-glow"></div> <div class="ln-qs-terminal"><div class="ln-qs-tab-bar"><div class="ln-qs-tabs"><button type="button"${$.attr_class('ln-qs-tab', void 0, { 'ln-qs-tab--active': installer === 'jsrepo' })}><img class="ln-qs-tab-logo" src="/vendor/install-brands/jsrepo-favicon.ico" alt="" width="16" height="16" loading="lazy" decoding="async"/> <span>jsrepo</span></button> <button type="button"${$.attr_class('ln-qs-tab', void 0, { 'ln-qs-tab--active': installer === 'shadcn' })}><img class="ln-qs-tab-logo" src="/vendor/install-brands/shadcn-favicon.ico" alt="" width="16" height="16" loading="lazy" decoding="async"/> <span>shadcn</span></button></div> <div class="ln-qs-tab-bar-right"><div class="ln-qs-runner-dropdown"><button type="button" class="ln-qs-runner-trigger">${$.escape(runner())} <svg${$.attr_class('ln-qs-caret', void 0, { 'open': dropOpen })} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg></button> <div${$.attr_class('ln-qs-runner-menu', void 0, { 'open': dropOpen })}><!--[-->`);

		const each_array = $.ensure_array_like(RUNNERS);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let r = each_array[$$index];

			$$renderer.push(`<button type="button"${$.attr_class('ln-qs-runner-item', void 0, { 'active': runner() === r })}>${$.escape(r)}</button>`);
		}

		$$renderer.push(`<!--]--></div></div></div></div> <div class="ln-qs-cmd-area"><div class="ln-qs-cmd-line"><span class="ln-qs-prompt">~</span> <code class="ln-qs-cmd-text">${$.escape(command())}</code></div> <button type="button"${$.attr_class('ln-qs-copy', void 0, { 'ln-qs-copy--done': clipboard.copied })} aria-label="Copy command">`);

		if (clipboard.copied) {
			$$renderer.push(`<!--[0--><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`);
		} else {
			$$renderer.push(`<!--[-1--><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`);
		}

		$$renderer.push(`<!--]--></button></div></div> <p class="ln-qs-hint">Use <strong class="ln-qs-hint-strong">jsrepo</strong> or <strong class="ln-qs-hint-strong">shadcn</strong> — components land in your codebase, ready to use, instantly.</p></div></div></section>`);
	});
}