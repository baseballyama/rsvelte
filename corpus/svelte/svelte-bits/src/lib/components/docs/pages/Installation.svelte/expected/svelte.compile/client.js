import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import CodeBlock from '$lib/components/docs/preview/CodeBlock.svelte';

import {
	PKG_TO_RUNNER,
	RUNNER_TO_PKG,
	RUNNERS,
	jsrepoAddSnippet,
	REGISTRY_BASE,
	registryUrl,
	shadcnAddSnippet
} from '$lib/constants/cli';

var root = $.from_html(
	`<p class="docs-paragraph dim">Follow these steps to manually install components:</p> <h4 class="docs-category-subtitle">1. Pick a component</h4> <p class="docs-paragraph">Browse components from the sidebar and find one you like, then head to the <span class="docs-highlight">Code</span> tab.</p> <h4 class="docs-category-subtitle">2. Install dependencies</h4> <p class="docs-paragraph short svelte-2objix">Some components use external libraries (e.g. <code class="prop-code">gsap</code>, <code class="prop-code">ogl</code>, <code class="prop-code">motion</code>, <code class="prop-code">three</code>). Install whatever the component lists at the top of its
			Code tab.</p> <!> <h4 class="docs-category-subtitle">3. Copy the code</h4> <p class="docs-paragraph short svelte-2objix">The <span class="docs-highlight">Code</span> tab contains the full source for the component.
			Every Svelte Bits component is a single <code class="prop-code">.svelte</code> file — no
			sibling helpers, no shared utils. Paste it under <code class="prop-code">src/lib/components/</code> and you're done.</p> <h4 class="docs-category-subtitle">4. Use the component</h4> <p class="docs-paragraph short svelte-2objix">Each component page includes a usage snippet. For all available props, see the <span class="docs-highlight">Preview</span> tab — controls and the prop table mirror exactly
			what's available.</p> <!>`,
	1
);

var root_1 = $.from_html(`<button type="button"> </button>`);

var root_2 = $.from_html(
	`<h4 class="docs-category-subtitle">Installation</h4> <p class="docs-paragraph short svelte-2objix">Run the commands below — the example installs <a class="docs-link svelte-2objix" href="/backgrounds/aurora">Aurora</a>:</p> <!> <h4 class="docs-category-subtitle">Generic form</h4> <p class="docs-paragraph short svelte-2objix">Replace <code class="prop-code">&lt;component&gt;</code> with the component slug (e.g. <code class="prop-code">aurora</code>, <code class="prop-code">shiny-text</code>, <code class="prop-code">dock</code>). Slugs are listed on each component page.</p> <!> <h4 class="docs-category-subtitle">Where it lands</h4> <p class="docs-paragraph short svelte-2objix">By default the file is copied to <code class="prop-code">$lib/components/&lt;Component&gt;.svelte</code>. You can
				move it anywhere — it's just a Svelte file. Any required dependencies ( <code class="prop-code">gsap</code>, <code class="prop-code">ogl</code>, etc.) are detected
				and installed with your package manager by jsrepo.</p>`,
	1
);

var root_3 = $.from_html(
	`<p class="docs-paragraph">Requires a typical shadcn to be initialized with a <code class="prop-code">components.json</code>.</p> <h4 class="docs-category-subtitle">Installation</h4> <p class="docs-paragraph short svelte-2objix">Install <a class="docs-link svelte-2objix" href="/backgrounds/aurora">Aurora</a> with your runner selected above:</p> <!> <h4 class="docs-category-subtitle">Generic form</h4> <p class="docs-paragraph short svelte-2objix">Substitute your slug for <code class="prop-code">&lt;component&gt;</code> — same filename as each route in the docs
				(for example <code class="prop-code">aurora</code>, <code class="prop-code">shiny-text</code>, <code class="prop-code">dock</code>):</p> <!> <h4 class="docs-category-subtitle">Where it lands</h4> <p class="docs-paragraph short svelte-2objix">The CLI follows the registry file metadata, so destinations match jsrepo installs (typically under <code class="prop-code">$lib/components/svelte-bits/</code>). Relocate freely — it's ordinary Svelte
				source. Dependencies install as part of <code class="prop-code">add</code>.</p>`,
	1
);

var root_4 = $.from_html(
	`<div class="install-runner-row svelte-2objix"><span class="install-runner-label svelte-2objix">Runner</span> <div class="install-runner-dropdown svelte-2objix"><button type="button" class="install-runner-trigger svelte-2objix"> <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg></button> <div></div></div></div> <!> <p class="docs-paragraph dim install-tip svelte-2objix">Tip: every component page includes an install block under its <span class="docs-highlight">Code</span> tab —
			copy commands for jsrepo or shadcn with the slug already filled in.</p>`,
	1
);

var root_5 = $.from_html(`<section class="docs-section"><h3 class="docs-category-title">Installation</h3> <p class="docs-paragraph dim">Using components is very straightforward, anyone can do it.</p> <hr class="docs-separator"/> <h3 class="docs-category-title">Pick The Method</h3> <p class="docs-paragraph">You can paste source from each component page, or pull them
		in with <a class="docs-link svelte-2objix" href="https://www.jsrepo.dev/" target="_blank" rel="noreferrer">jsrepo</a>, or the <a class="docs-link svelte-2objix" href="https://ui.shadcn.com/docs/registry" target="_blank" rel="noreferrer">shadcn CLI</a>.</p> <p class="docs-paragraph dim">Click the cards below to change your preferred method.</p> <div class="installation-methods svelte-2objix"><button type="button"><svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> <span class="installation-method-label svelte-2objix">Manual</span></button> <button type="button"><img class="installation-method-logo svelte-2objix" src="/vendor/install-brands/jsrepo-favicon.ico" alt="" width="44" height="44" loading="lazy" decoding="async"/> <span class="installation-method-label svelte-2objix">jsrepo</span></button> <button type="button" aria-label="shadcn CLI"><img class="installation-method-logo svelte-2objix" src="/vendor/install-brands/shadcn-favicon.ico" alt="" width="44" height="44" loading="lazy" decoding="async"/> <span class="installation-method-label svelte-2objix">shadcn</span></button></div> <h3 class="docs-category-title">Steps</h3> <!> <hr class="docs-separator"/> <h4 class="docs-category-subtitle">That's all!</h4> <p class="docs-paragraph">From here on, it's all about how you integrate the component into your project. The code is
		yours to play around with — modify styling, behavior, props, anything goes.</p> <div class="docs-button-bar"><a class="docs-button" href="/get-started/introduction"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg> Introduction</a> <a class="docs-button" href="/get-started/mcp-server">MCP Server <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></a></div></section>`);

export default function Installation($$anchor, $$props) {
	$.push($$props, true);

	let method = $.state('manual');
	let pkg = $.state('npm');
	let dropOpen = $.state(false);
	let dropdownEl = $.state(null);
	const runner = $.derived(() => PKG_TO_RUNNER[$.get(pkg)]);
	const featuredJsrepoCommand = $.derived(() => jsrepoAddSnippet('aurora', $.get(pkg)));
	const genericJsrepoCommand = $.derived(() => jsrepoAddSnippet('<component>', $.get(pkg)));
	const featuredShadcnCommand = $.derived(() => shadcnAddSnippet('aurora', $.get(pkg)));
	const genericShadcnCommand = $.derived(() => shadcnAddSnippet('<component>', $.get(pkg)));

	const usageSnippet = `<` + `script lang="ts">
  import ShinyText from '$lib/components/svelte-bits/ShinyText.svelte';
<` + `/script>

<ShinyText text="Hello, you!" speed={3} />`;

	function pickRunner(r) {
		$.set(pkg, RUNNER_TO_PKG[r], true);
		$.set(dropOpen, false);
	}

	function onDocClick(e) {
		if (!$.get(dropOpen)) return;
		if ($.get(dropdownEl) && !$.get(dropdownEl).contains(e.target)) $.set(dropOpen, false);
	}

	onMount(() => {
		window.scrollTo(0, 0);
		document.addEventListener('click', onDocClick);

		return () => document.removeEventListener('click', onDocClick);
	});

	var section = root_5();

	$.head('2objix', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Installation - svelte-bits';
		});
	});

	var div = $.sibling($.child(section), 12);
	var button = $.child(div);
	let classes;
	var button_1 = $.sibling(button, 2);
	let classes_1;
	var button_2 = $.sibling(button_1, 2);
	let classes_2;

	$.reset(div);

	var node = $.sibling(div, 4);

	{
		var consequent = ($$anchor) => {
			var fragment = root();
			var node_1 = $.sibling($.first_child(fragment), 10);

			CodeBlock(node_1, { language: 'bash', code: 'npm install gsap' });

			var node_2 = $.sibling(node_1, 10);

			CodeBlock(node_2, { language: 'svelte', code: usageSnippet });
			$.append($$anchor, fragment);
		};

		var alternate_1 = ($$anchor) => {
			var fragment_1 = root_4();
			var div_1 = $.first_child(fragment_1);
			var div_2 = $.sibling($.child(div_1), 2);
			var button_3 = $.child(div_2);
			var text = $.child(button_3);
			var svg = $.sibling(text);
			let classes_3;

			$.reset(button_3);

			var div_3 = $.sibling(button_3, 2);
			let classes_4;

			$.each(div_3, 20, () => RUNNERS, (r) => r, ($$anchor, r) => {
				var button_4 = root_1();
				let classes_5;
				var text_1 = $.only_child(button_4, true);

				$.template_effect(() => {
					classes_5 = $.set_class(button_4, 1, 'install-runner-item svelte-2objix', null, classes_5, { active: $.get(runner) === r });
					$.set_text(text_1, r);
				});

				$.delegated('click', button_4, () => pickRunner(r));
				$.append($$anchor, button_4);
			});

			$.reset(div_3);
			$.reset(div_2);
			$.bind_this(div_2, ($$value) => $.set(dropdownEl, $$value), () => $.get(dropdownEl));
			$.reset(div_1);

			var node_3 = $.sibling(div_1, 2);

			{
				var consequent_1 = ($$anchor) => {
					var fragment_2 = root_2();
					var node_4 = $.sibling($.first_child(fragment_2), 4);

					CodeBlock(node_4, {
						language: 'bash',
						get code() {
							return $.get(featuredJsrepoCommand);
						}
					});

					var node_5 = $.sibling(node_4, 6);

					CodeBlock(node_5, {
						language: 'bash',
						get code() {
							return $.get(genericJsrepoCommand);
						}
					});

					$.next(4);
					$.append($$anchor, fragment_2);
				};

				var alternate = ($$anchor) => {
					var fragment_3 = root_3();
					var node_6 = $.sibling($.first_child(fragment_3), 6);

					CodeBlock(node_6, {
						language: 'bash',
						get code() {
							return $.get(featuredShadcnCommand);
						}
					});

					var node_7 = $.sibling(node_6, 6);

					CodeBlock(node_7, {
						language: 'bash',
						get code() {
							return $.get(genericShadcnCommand);
						}
					});

					$.next(4);
					$.append($$anchor, fragment_3);
				};

				$.if(node_3, ($$render) => {
					if ($.get(method) === 'jsrepo') $$render(consequent_1); else $$render(alternate, -1);
				});
			}

			$.next(2);

			$.template_effect(() => {
				$.set_text(text, `${$.get(runner) ?? ''} `);
				classes_3 = $.set_class(svg, 0, 'install-runner-caret svelte-2objix', null, classes_3, { open: $.get(dropOpen) });
				classes_4 = $.set_class(div_3, 1, 'install-runner-menu svelte-2objix', null, classes_4, { open: $.get(dropOpen) });
			});

			$.delegated('click', button_3, (e) => {
				e.stopPropagation();
				$.set(dropOpen, !$.get(dropOpen));
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(method) === 'manual') $$render(consequent); else $$render(alternate_1, -1);
		});
	}

	$.next(8);
	$.reset(section);

	$.template_effect(() => {
		classes = $.set_class(button, 1, 'installation-method svelte-2objix', null, classes, { 'method-active': $.get(method) === 'manual' });
		classes_1 = $.set_class(button_1, 1, 'installation-method svelte-2objix', null, classes_1, { 'method-active': $.get(method) === 'jsrepo' });
		classes_2 = $.set_class(button_2, 1, 'installation-method svelte-2objix', null, classes_2, { 'method-active': $.get(method) === 'shadcn' });
	});

	$.delegated('click', button, () => $.set(method, 'manual'));
	$.delegated('click', button_1, () => $.set(method, 'jsrepo'));
	$.delegated('click', button_2, () => $.set(method, 'shadcn'));
	$.append($$anchor, section);
	$.pop();
}

$.delegate(['click']);