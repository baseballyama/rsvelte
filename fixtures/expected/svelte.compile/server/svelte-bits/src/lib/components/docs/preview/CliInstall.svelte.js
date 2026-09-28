import * as $ from 'svelte/internal/server';

import {
	PKG_MANAGERS,
	isInRegistry,
	registryUrl,
	shadcnAddSnippet,
	jsrepoAddSnippet
} from '$lib/constants/cli';

import { dependenciesForSlug } from '$lib/constants/componentDependencies';
import { UseClipboard } from '$lib/hooks/use-clipboard.svelte';

export default function CliInstall($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { slug } = $$props;
		let pkg = 'npm';
		let tab = 'shadcn';
		const inRegistry = $.derived(() => isInRegistry(slug));
		const dependencies = $.derived(() => dependenciesForSlug(slug));
		const hasManual = $.derived(() => dependencies().length > 0);
		const dependencyCommand = $.derived(() => dependencies().length > 0 ? `${pkg} install ${dependencies().join(' ')}` : '');

		const command = $.derived(() => tab === 'manual'
			? dependencyCommand()
			: tab === 'jsrepo'
				? jsrepoAddSnippet(slug, pkg)
				: shadcnAddSnippet(slug, pkg));

		const clipboard = new UseClipboard();

		$$renderer.push(`<div class="cli-install svelte-12cskd0"><h3 class="cli-install-title svelte-12cskd0">Install</h3> `);

		if (!inRegistry()) {
			$$renderer.push(`<!--[0--><p class="cli-install-empty svelte-12cskd0">This component isn't in the registry yet. Copy the source from the section below.</p>`);
		} else {
			$$renderer.push(`<!--[-1--><div class="cli-install-section svelte-12cskd0"><div class="mode-switch svelte-12cskd0"><button type="button" class="cli-toggle-button svelte-12cskd0"${$.attr('data-active', tab === 'shadcn')}>shadcn</button> <button type="button" class="cli-toggle-button svelte-12cskd0"${$.attr('data-active', tab === 'jsrepo')}>jsrepo</button> <button type="button"${$.attr_class('cli-toggle-button svelte-12cskd0', void 0, { 'disabled': !hasManual() })}${$.attr('data-active', tab === 'manual')}${$.attr('disabled', !hasManual(), true)}${$.attr('aria-disabled', !hasManual())}${$.attr('title', hasManual()
				? 'Install dependencies manually'
				: 'No external dependencies')}>Manual</button></div> <div class="cli-row svelte-12cskd0"><div class="pkg-buttons svelte-12cskd0"><!--[-->`);

			const each_array = $.ensure_array_like(PKG_MANAGERS);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let m = each_array[$$index];

				$$renderer.push(`<button type="button" class="cli-tool-tab svelte-12cskd0"${$.attr('data-active', pkg === m)}>${$.escape(m)}</button>`);
			}

			$$renderer.push(`<!--]--></div></div> <div class="code-wrapper svelte-12cskd0"><code class="cli-code svelte-12cskd0">${$.escape(command())}</code> <button type="button"${$.attr_class('cli-copy svelte-12cskd0', void 0, { 'done': clipboard.copied })} aria-label="Copy installation command">`);

			if (clipboard.copied) {
				$$renderer.push(`<!--[0--><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`);
			} else {
				$$renderer.push(`<!--[-1--><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`);
			}

			$$renderer.push(`<!--]--></button></div> <p class="cli-hint svelte-12cskd0">`);

			if (tab === 'manual') {
				$$renderer.push(`<!--[0-->Install dependencies manually, then copy the usage and component source below.`);
			} else {
				$$renderer.push(`<!--[-1-->Pulls the component from <a${$.attr('href', registryUrl(slug))} target="_blank" rel="noreferrer" class="svelte-12cskd0">${$.escape(registryUrl(slug))}</a> and copies it into your project.`);
			}

			$$renderer.push(`<!--]--></p></div>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}