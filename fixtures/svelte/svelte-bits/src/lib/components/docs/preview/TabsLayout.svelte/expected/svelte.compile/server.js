import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import Dependencies from './Dependencies.svelte';
import { dependenciesForSlug } from '$lib/constants/componentDependencies';
import { stripSvelteBitsHeader } from '$lib/utils/svelte-bits-source-header';
import { UseClipboard } from '$lib/hooks/use-clipboard.svelte';

export default function TabsLayout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			preview,
			code,
			customize,
			propTable,
			onreset,
			hasChanges = false,
			componentName,
			usage = '',
			source = '',
			props = []
		} = $$props;

		let active = 'preview';
		const previewTabId = $.derived(() => `${page.params.subcategory ?? 'component'}-preview-tab`);
		const codeTabId = $.derived(() => `${page.params.subcategory ?? 'component'}-code-tab`);
		const previewPanelId = $.derived(() => `${page.params.subcategory ?? 'component'}-preview-panel`);
		const codePanelId = $.derived(() => `${page.params.subcategory ?? 'component'}-code-panel`);
		const dependencyList = $.derived(() => dependenciesForSlug(page.params.subcategory));
		const promptComponentName = $.derived(() => componentName ?? page.params.subcategory?.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(''));
		const hasPrompt = $.derived(() => Boolean(promptComponentName() && source));
		const clipboard = new UseClipboard();

		function buildPrompt() {
			const sourceShown = stripSvelteBitsHeader(source);
			const deps = dependencyList().join(', ');

			let prompt = `## Integrate the <${promptComponentName()} /> component from Svelte Bits

You are helping integrate an open-source Svelte component into an existing application.

### Component: ${promptComponentName()}
### Variant: TypeScript + Tailwind
${deps ? `### Dependencies: ${deps}` : ''}

---

### Usage Example
\`\`\`svelte
${usage}
\`\`\`
`;

			if (props.length > 0) {
				prompt += `
### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
${props.map((p) => `| ${p.name} | ${p.type} | ${p.default || '—'} | ${p.description} |`).join('\n')}
`;
			}

			prompt += `
### Full Component Source
\`\`\`svelte
${sourceShown}
\`\`\`

### Integration Instructions
1. Install any listed dependencies.
2. Copy the component source into the appropriate directory in the project.
3. Import and render the component using the usage example above as a starting point.
4. Adjust props as needed for the specific use case — refer to the props table for all available options.
`;

			return prompt;
		}

		async function copyPrompt() {
			if (!hasPrompt()) return;

			await clipboard.copy(buildPrompt());
		}

		function selectTab(tab) {
			active = tab;

			requestAnimationFrame(() => {
				document.getElementById(tab === 'preview' ? previewTabId() : codeTabId())?.focus();
			});
		}

		function handleTabKey(event) {
			if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
				event.preventDefault();
				selectTab(active === 'preview' ? 'code' : 'preview');
			} else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
				event.preventDefault();
				selectTab(active === 'preview' ? 'code' : 'preview');
			} else if (event.key === 'Home') {
				event.preventDefault();
				selectTab('preview');
			} else if (event.key === 'End') {
				event.preventDefault();
				selectTab('code');
			}
		}

		$$renderer.push(`<div class="tabs-root"><div class="tabs-list" role="tablist" aria-label="Component example sections" tabindex="-1"><button${$.attr('id', previewTabId())} type="button" role="tab"${$.attr('aria-selected', active === 'preview')}${$.attr('aria-controls', previewPanelId())}${$.attr('tabindex', active === 'preview' ? 0 : -1)} class="tab-trigger"${$.attr('data-active', active === 'preview')}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> Preview</button> <button${$.attr('id', codeTabId())} type="button" role="tab"${$.attr('aria-selected', active === 'code')}${$.attr('aria-controls', codePanelId())}${$.attr('tabindex', active === 'code' ? 0 : -1)} class="tab-trigger"${$.attr('data-active', active === 'code')}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg> Code</button> <div class="tab-actions">`);

		if (hasPrompt()) {
			$$renderer.push(`<!--[0--><button type="button" class="tab-action" aria-label="Copy AI prompt" title="Copy AI prompt">`);

			if (clipboard.copied) {
				$$renderer.push(`<!--[0--><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!`);
			} else {
				$$renderer.push(`<!--[-1--><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy Prompt`);
			}

			$$renderer.push(`<!--]--></button>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (onreset && active === 'preview' && hasChanges) {
			$$renderer.push(`<!--[0--><button type="button" class="tab-action" aria-label="Reset props" title="Reset props">Reset</button>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div> `);

		if (active === 'preview') {
			$$renderer.push(`<!--[0--><div${$.attr('id', previewPanelId())} class="tab-panel" data-active="true" role="tabpanel"${$.attr('aria-labelledby', previewTabId())}><div class="demo-container">`);
			preview($$renderer);
			$$renderer.push(`<!----></div> `);

			if (customize) {
				$$renderer.push('<!--[0-->');
				customize($$renderer);
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (propTable) {
				$$renderer.push('<!--[0-->');
				propTable($$renderer);
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);
			Dependencies($$renderer, { dependencyList: dependencyList() });
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push(`<!--[-1--><div${$.attr('id', codePanelId())} class="tab-panel" data-active="true" role="tabpanel"${$.attr('aria-labelledby', codeTabId())}>`);
			code($$renderer);
			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}