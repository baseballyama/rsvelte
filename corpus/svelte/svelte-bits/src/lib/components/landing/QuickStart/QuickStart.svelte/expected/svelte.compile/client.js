import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<button type="button"> </button>`);
var root_1 = $.from_svg(`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`);
var root_2 = $.from_svg(`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`);
var root_3 = $.from_html(`<section class="ln-qs-section"><div class="ln-qs-inner"><div><h2 class="ln-qs-title">Get started in seconds</h2></div> <div><div class="ln-qs-glow"></div> <div class="ln-qs-terminal"><div class="ln-qs-tab-bar"><div class="ln-qs-tabs"><button type="button"><img class="ln-qs-tab-logo" src="/vendor/install-brands/jsrepo-favicon.ico" alt="" width="16" height="16" loading="lazy" decoding="async"/> <span>jsrepo</span></button> <button type="button"><img class="ln-qs-tab-logo" src="/vendor/install-brands/shadcn-favicon.ico" alt="" width="16" height="16" loading="lazy" decoding="async"/> <span>shadcn</span></button></div> <div class="ln-qs-tab-bar-right"><div class="ln-qs-runner-dropdown"><button type="button" class="ln-qs-runner-trigger"> <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg></button> <div></div></div></div></div> <div class="ln-qs-cmd-area"><div class="ln-qs-cmd-line"><span class="ln-qs-prompt">~</span> <code class="ln-qs-cmd-text"> </code></div> <button type="button" aria-label="Copy command"><!></button></div></div> <p class="ln-qs-hint">Use <strong class="ln-qs-hint-strong">jsrepo</strong> or <strong class="ln-qs-hint-strong">shadcn</strong> — components land in your codebase, ready to use, instantly.</p></div></div></section>`);

export default function QuickStart($$anchor, $$props) {
	$.push($$props, true);

	// We feature Aurora as the showcase install (matches react-bits' featured-install pattern).
	const FEATURED_SLUG = 'aurora';

	let installer = $.state('jsrepo');
	let pkg = $.state('npm');
	let dropOpen = $.state(false);
	let dropdownEl = $.state(null);
	let headerEl = $.state(null);
	let terminalEl = $.state(null);
	let headerVisible = $.state(false);
	let terminalVisible = $.state(false);
	const runner = $.derived(() => PKG_TO_RUNNER[$.get(pkg)]);

	const command = $.derived(() => $.get(installer) === 'jsrepo'
		? jsrepoAddSnippet(FEATURED_SLUG, $.get(pkg))
		: shadcnAddSnippet(FEATURED_SLUG, $.get(pkg)));

	const clipboard = new UseClipboard();

	function pickRunner(r) {
		$.set(pkg, RUNNER_TO_PKG[r], true);
		$.set(dropOpen, false);
	}

	function onDocClick(e) {
		if (!$.get(dropOpen)) return;
		if ($.get(dropdownEl) && !$.get(dropdownEl).contains(e.target)) $.set(dropOpen, false);
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
			observe($.get(headerEl), (v) => $.set(headerVisible, v, true)),
			observe($.get(terminalEl), (v) => $.set(terminalVisible, v, true))
		];

		document.addEventListener('click', onDocClick);

		return () => {
			obs.forEach((o) => o?.disconnect());
			document.removeEventListener('click', onDocClick);
		};
	});

	var section = root_3();
	var div = $.child(section);
	var div_1 = $.child(div);
	let classes;

	$.bind_this(div_1, ($$value) => $.set(headerEl, $$value), () => $.get(headerEl));

	var div_2 = $.sibling(div_1, 2);
	let classes_1;
	var div_3 = $.sibling($.child(div_2), 2);
	var div_4 = $.child(div_3);
	var div_5 = $.child(div_4);
	var button = $.child(div_5);
	let classes_2;
	var button_1 = $.sibling(button, 2);
	let classes_3;

	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var div_7 = $.child(div_6);
	var button_2 = $.child(div_7);
	var text = $.child(button_2);
	var svg = $.sibling(text);
	let classes_4;

	$.reset(button_2);

	var div_8 = $.sibling(button_2, 2);
	let classes_5;

	$.each(div_8, 20, () => RUNNERS, (r) => r, ($$anchor, r) => {
		var button_3 = root();
		let classes_6;
		var text_1 = $.only_child(button_3, true);

		$.template_effect(() => {
			classes_6 = $.set_class(button_3, 1, 'ln-qs-runner-item', null, classes_6, { active: $.get(runner) === r });
			$.set_text(text_1, r);
		});

		$.delegated('click', button_3, () => pickRunner(r));
		$.append($$anchor, button_3);
	});

	$.reset(div_8);
	$.reset(div_7);
	$.bind_this(div_7, ($$value) => $.set(dropdownEl, $$value), () => $.get(dropdownEl));
	$.reset(div_6);
	$.reset(div_4);

	var div_9 = $.sibling(div_4, 2);
	var div_10 = $.child(div_9);
	var code = $.sibling($.child(div_10), 2);
	var text_2 = $.only_child(code, true);

	$.reset(div_10);

	var button_4 = $.sibling(div_10, 2);
	let classes_7;
	var node = $.child(button_4);

	{
		var consequent = ($$anchor) => {
			var svg_1 = root_1();

			$.append($$anchor, svg_1);
		};

		var alternate = ($$anchor) => {
			var svg_2 = root_2();

			$.append($$anchor, svg_2);
		};

		$.if(node, ($$render) => {
			if (clipboard.copied) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(button_4);
	$.reset(div_9);
	$.reset(div_3);
	$.next(2);
	$.reset(div_2);
	$.bind_this(div_2, ($$value) => $.set(terminalEl, $$value), () => $.get(terminalEl));
	$.reset(div);
	$.reset(section);

	$.template_effect(() => {
		classes = $.set_class(div_1, 1, 'ln-qs-header', null, classes, { 'is-visible': $.get(headerVisible) });
		classes_1 = $.set_class(div_2, 1, 'ln-qs-terminal-wrap', null, classes_1, { 'is-visible': $.get(terminalVisible) });
		classes_2 = $.set_class(button, 1, 'ln-qs-tab', null, classes_2, { 'ln-qs-tab--active': $.get(installer) === 'jsrepo' });
		classes_3 = $.set_class(button_1, 1, 'ln-qs-tab', null, classes_3, { 'ln-qs-tab--active': $.get(installer) === 'shadcn' });
		$.set_text(text, `${$.get(runner) ?? ''} `);
		classes_4 = $.set_class(svg, 0, 'ln-qs-caret', null, classes_4, { open: $.get(dropOpen) });
		classes_5 = $.set_class(div_8, 1, 'ln-qs-runner-menu', null, classes_5, { open: $.get(dropOpen) });
		$.set_text(text_2, $.get(command));
		classes_7 = $.set_class(button_4, 1, 'ln-qs-copy', null, classes_7, { 'ln-qs-copy--done': clipboard.copied });
	});

	$.delegated('click', button, () => $.set(installer, 'jsrepo'));
	$.delegated('click', button_1, () => $.set(installer, 'shadcn'));

	$.delegated('click', button_2, (e) => {
		e.stopPropagation();
		$.set(dropOpen, !$.get(dropOpen));
	});

	$.delegated('click', button_4, () => clipboard.copy($.get(command)));
	$.append($$anchor, section);
	$.pop();
}

$.delegate(['click']);