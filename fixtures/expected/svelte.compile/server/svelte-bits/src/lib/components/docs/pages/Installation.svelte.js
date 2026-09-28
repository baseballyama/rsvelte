import * as $ from 'svelte/internal/server';
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

export default function Installation($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let method = 'manual';
		let pkg = 'npm';
		let dropOpen = false;
		let dropdownEl = null;
		const runner = $.derived(() => PKG_TO_RUNNER[pkg]);
		const featuredJsrepoCommand = $.derived(() => jsrepoAddSnippet('aurora', pkg));
		const genericJsrepoCommand = $.derived(() => jsrepoAddSnippet('<component>', pkg));
		const featuredShadcnCommand = $.derived(() => shadcnAddSnippet('aurora', pkg));
		const genericShadcnCommand = $.derived(() => shadcnAddSnippet('<component>', pkg));

		const usageSnippet = `<` + `script lang="ts">
  import ShinyText from '$lib/components/svelte-bits/ShinyText.svelte';
<` + `/script>

<ShinyText text="Hello, you!" speed={3} />`;

		function pickRunner(r) {
			pkg = RUNNER_TO_PKG[r];
			dropOpen = false;
		}

		function onDocClick(e) {
			if (!dropOpen) return;
			if (dropdownEl && !dropdownEl.contains(e.target)) dropOpen = false;
		}

		onMount(() => {
			window.scrollTo(0, 0);
			document.addEventListener('click', onDocClick);

			return () => document.removeEventListener('click', onDocClick);
		});

		$.head('2objix', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Installation - svelte-bits</title>`);
			});
		});

		$$renderer.push(`<section class="docs-section"><h3 class="docs-category-title">Installation</h3> <p class="docs-paragraph dim">Using components is very straightforward, anyone can do it.</p> <hr class="docs-separator"/> <h3 class="docs-category-title">Pick The Method</h3> <p class="docs-paragraph">You can paste source from each component page, or pull them
		in with <a class="docs-link svelte-2objix" href="https://www.jsrepo.dev/" target="_blank" rel="noreferrer">jsrepo</a>, or the <a class="docs-link svelte-2objix" href="https://ui.shadcn.com/docs/registry" target="_blank" rel="noreferrer">shadcn CLI</a>.</p> <p class="docs-paragraph dim">Click the cards below to change your preferred method.</p> <div class="installation-methods svelte-2objix"><button type="button"${$.attr_class('installation-method svelte-2objix', void 0, { 'method-active': method === 'manual' })}><svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> <span class="installation-method-label svelte-2objix">Manual</span></button> <button type="button"${$.attr_class('installation-method svelte-2objix', void 0, { 'method-active': method === 'jsrepo' })}><img class="installation-method-logo svelte-2objix" src="/vendor/install-brands/jsrepo-favicon.ico" alt="" width="44" height="44" loading="lazy" decoding="async"/> <span class="installation-method-label svelte-2objix">jsrepo</span></button> <button type="button"${$.attr_class('installation-method svelte-2objix', void 0, { 'method-active': method === 'shadcn' })} aria-label="shadcn CLI"><img class="installation-method-logo svelte-2objix" src="/vendor/install-brands/shadcn-favicon.ico" alt="" width="44" height="44" loading="lazy" decoding="async"/> <span class="installation-method-label svelte-2objix">shadcn</span></button></div> <h3 class="docs-category-title">Steps</h3> `);

		if (method === 'manual') {
			$$renderer.push(`<!--[0--><p class="docs-paragraph dim">Follow these steps to manually install components:</p> <h4 class="docs-category-subtitle">1. Pick a component</h4> <p class="docs-paragraph">Browse components from the sidebar and find one you like, then head to the <span class="docs-highlight">Code</span> tab.</p> <h4 class="docs-category-subtitle">2. Install dependencies</h4> <p class="docs-paragraph short svelte-2objix">Some components use external libraries (e.g. <code class="prop-code">gsap</code>, <code class="prop-code">ogl</code>, <code class="prop-code">motion</code>, <code class="prop-code">three</code>). Install whatever the component lists at the top of its
			Code tab.</p> `);

			CodeBlock($$renderer, { language: 'bash', code: 'npm install gsap' });

			$$renderer.push(`<!----> <h4 class="docs-category-subtitle">3. Copy the code</h4> <p class="docs-paragraph short svelte-2objix">The <span class="docs-highlight">Code</span> tab contains the full source for the component.
			Every Svelte Bits component is a single <code class="prop-code">.svelte</code> file — no
			sibling helpers, no shared utils. Paste it under <code class="prop-code">src/lib/components/</code> and you're done.</p> <h4 class="docs-category-subtitle">4. Use the component</h4> <p class="docs-paragraph short svelte-2objix">Each component page includes a usage snippet. For all available props, see the <span class="docs-highlight">Preview</span> tab — controls and the prop table mirror exactly
			what's available.</p> `);

			CodeBlock($$renderer, { language: 'svelte', code: usageSnippet });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><div class="install-runner-row svelte-2objix"><span class="install-runner-label svelte-2objix">Runner</span> <div class="install-runner-dropdown svelte-2objix"><button type="button" class="install-runner-trigger svelte-2objix">${$.escape(runner())} <svg${$.attr_class('install-runner-caret svelte-2objix', void 0, { 'open': dropOpen })} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg></button> <div${$.attr_class('install-runner-menu svelte-2objix', void 0, { 'open': dropOpen })}><!--[-->`);

			const each_array = $.ensure_array_like(RUNNERS);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let r = each_array[$$index];

				$$renderer.push(`<button type="button"${$.attr_class('install-runner-item svelte-2objix', void 0, { 'active': runner() === r })}>${$.escape(r)}</button>`);
			}

			$$renderer.push(`<!--]--></div></div></div> `);

			if (method === 'jsrepo') {
				$$renderer.push(`<!--[0--><h4 class="docs-category-subtitle">Installation</h4> <p class="docs-paragraph short svelte-2objix">Run the commands below — the example installs <a class="docs-link svelte-2objix" href="/backgrounds/aurora">Aurora</a>:</p> `);
				CodeBlock($$renderer, { language: 'bash', code: featuredJsrepoCommand() });
				$$renderer.push(`<!----> <h4 class="docs-category-subtitle">Generic form</h4> <p class="docs-paragraph short svelte-2objix">Replace <code class="prop-code">&lt;component></code> with the component slug (e.g. <code class="prop-code">aurora</code>, <code class="prop-code">shiny-text</code>, <code class="prop-code">dock</code>). Slugs are listed on each component page.</p> `);
				CodeBlock($$renderer, { language: 'bash', code: genericJsrepoCommand() });

				$$renderer.push(`<!----> <h4 class="docs-category-subtitle">Where it lands</h4> <p class="docs-paragraph short svelte-2objix">By default the file is copied to <code class="prop-code">$lib/components/&lt;Component>.svelte</code>. You can
				move it anywhere — it's just a Svelte file. Any required dependencies ( <code class="prop-code">gsap</code>, <code class="prop-code">ogl</code>, etc.) are detected
				and installed with your package manager by jsrepo.</p>`);
			} else {
				$$renderer.push(`<!--[-1--><p class="docs-paragraph">Requires a typical shadcn to be initialized with a <code class="prop-code">components.json</code>.</p> <h4 class="docs-category-subtitle">Installation</h4> <p class="docs-paragraph short svelte-2objix">Install <a class="docs-link svelte-2objix" href="/backgrounds/aurora">Aurora</a> with your runner selected above:</p> `);
				CodeBlock($$renderer, { language: 'bash', code: featuredShadcnCommand() });

				$$renderer.push(`<!----> <h4 class="docs-category-subtitle">Generic form</h4> <p class="docs-paragraph short svelte-2objix">Substitute your slug for <code class="prop-code">&lt;component></code> — same filename as each route in the docs
				(for example <code class="prop-code">aurora</code>, <code class="prop-code">shiny-text</code>, <code class="prop-code">dock</code>):</p> `);

				CodeBlock($$renderer, { language: 'bash', code: genericShadcnCommand() });

				$$renderer.push(`<!----> <h4 class="docs-category-subtitle">Where it lands</h4> <p class="docs-paragraph short svelte-2objix">The CLI follows the registry file metadata, so destinations match jsrepo installs (typically under <code class="prop-code">$lib/components/svelte-bits/</code>). Relocate freely — it's ordinary Svelte
				source. Dependencies install as part of <code class="prop-code">add</code>.</p>`);
			}

			$$renderer.push(`<!--]--> <p class="docs-paragraph dim install-tip svelte-2objix">Tip: every component page includes an install block under its <span class="docs-highlight">Code</span> tab —
			copy commands for jsrepo or shadcn with the slug already filled in.</p>`);
		}

		$$renderer.push(`<!--]--> <hr class="docs-separator"/> <h4 class="docs-category-subtitle">That's all!</h4> <p class="docs-paragraph">From here on, it's all about how you integrate the component into your project. The code is
		yours to play around with — modify styling, behavior, props, anything goes.</p> <div class="docs-button-bar"><a class="docs-button" href="/get-started/introduction"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg> Introduction</a> <a class="docs-button" href="/get-started/mcp-server">MCP Server <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></a></div></section>`);
	});
}