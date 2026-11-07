import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import Dependencies from './Dependencies.svelte';
import { dependenciesForSlug } from '$lib/constants/componentDependencies';
import { stripSvelteBitsHeader } from '$lib/utils/svelte-bits-source-header';
import { UseClipboard } from '$lib/hooks/use-clipboard.svelte';

var root = $.from_svg(`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!`, 1);
var root_1 = $.from_svg(`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy Prompt`, 1);
var root_2 = $.from_html(`<button type="button" class="tab-action" aria-label="Copy AI prompt" title="Copy AI prompt"><!></button>`);
var root_3 = $.from_html(`<button type="button" class="tab-action" aria-label="Reset props" title="Reset props">Reset</button>`);
var root_4 = $.from_html(`<div class="tab-panel" data-active="true" role="tabpanel"><div class="demo-container"><!></div> <!> <!> <!></div>`);
var root_5 = $.from_html(`<div class="tab-panel" data-active="true" role="tabpanel"><!></div>`);
var root_6 = $.from_html(`<div class="tabs-root"><div class="tabs-list" role="tablist" aria-label="Component example sections" tabindex="-1"><button type="button" role="tab" class="tab-trigger"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> Preview</button> <button type="button" role="tab" class="tab-trigger"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg> Code</button> <div class="tab-actions"><!> <!></div></div> <!></div>`);

export default function TabsLayout($$anchor, $$props) {
	$.push($$props, true);

	let hasChanges = $.prop($$props, 'hasChanges', 3, false),
		usage = $.prop($$props, 'usage', 3, ''),
		source = $.prop($$props, 'source', 3, ''),
		props = $.prop($$props, 'props', 19, () => []);

	let active = $.state('preview');
	const previewTabId = $.derived(() => `${page.params.subcategory ?? 'component'}-preview-tab`);
	const codeTabId = $.derived(() => `${page.params.subcategory ?? 'component'}-code-tab`);
	const previewPanelId = $.derived(() => `${page.params.subcategory ?? 'component'}-preview-panel`);
	const codePanelId = $.derived(() => `${page.params.subcategory ?? 'component'}-code-panel`);
	const dependencyList = $.derived(() => dependenciesForSlug(page.params.subcategory));
	const promptComponentName = $.derived(() => $$props.componentName ?? page.params.subcategory?.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(''));
	const hasPrompt = $.derived(() => Boolean($.get(promptComponentName) && source()));
	const clipboard = new UseClipboard();

	function buildPrompt() {
		const sourceShown = stripSvelteBitsHeader(source());
		const deps = $.get(dependencyList).join(', ');

		let prompt = `## Integrate the <${$.get(promptComponentName)} /> component from Svelte Bits

You are helping integrate an open-source Svelte component into an existing application.

### Component: ${$.get(promptComponentName)}
### Variant: TypeScript + Tailwind
${deps ? `### Dependencies: ${deps}` : ''}

---

### Usage Example
\`\`\`svelte
${usage()}
\`\`\`
`;

		if (props().length > 0) {
			prompt += `
### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
${props().map((p) => `| ${p.name} | ${p.type} | ${p.default || '—'} | ${p.description} |`).join('\n')}
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
		if (!$.get(hasPrompt)) return;

		await clipboard.copy(buildPrompt());
	}

	function selectTab(tab) {
		$.set(active, tab, true);

		requestAnimationFrame(() => {
			document.getElementById(tab === 'preview' ? $.get(previewTabId) : $.get(codeTabId))?.focus();
		});
	}

	function handleTabKey(event) {
		if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
			event.preventDefault();
			selectTab($.get(active) === 'preview' ? 'code' : 'preview');
		} else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
			event.preventDefault();
			selectTab($.get(active) === 'preview' ? 'code' : 'preview');
		} else if (event.key === 'Home') {
			event.preventDefault();
			selectTab('preview');
		} else if (event.key === 'End') {
			event.preventDefault();
			selectTab('code');
		}
	}

	var div = root_6();
	var div_1 = $.child(div);
	var button = $.child(div_1);
	var button_1 = $.sibling(button, 2);
	var div_2 = $.sibling(button_1, 2);
	var node = $.child(div_2);

	{
		var consequent_1 = ($$anchor) => {
			var button_2 = root_2();
			var node_1 = $.child(button_2);

			{
				var consequent = ($$anchor) => {
					var fragment = root();

					$.next();
					$.append($$anchor, fragment);
				};

				var alternate = ($$anchor) => {
					var fragment_1 = root_1();

					$.next();
					$.append($$anchor, fragment_1);
				};

				$.if(node_1, ($$render) => {
					if (clipboard.copied) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.reset(button_2);
			$.delegated('click', button_2, copyPrompt);
			$.append($$anchor, button_2);
		};

		$.if(node, ($$render) => {
			if ($.get(hasPrompt)) $$render(consequent_1);
		});
	}

	var node_2 = $.sibling(node, 2);

	{
		var consequent_2 = ($$anchor) => {
			var button_3 = root_3();

			$.delegated('click', button_3, function (...$$args) {
				$$props.onreset?.apply(this, $$args);
			});

			$.append($$anchor, button_3);
		};

		$.if(node_2, ($$render) => {
			if ($$props.onreset && $.get(active) === 'preview' && hasChanges()) $$render(consequent_2);
		});
	}

	$.reset(div_2);
	$.reset(div_1);

	var node_3 = $.sibling(div_1, 2);

	{
		var consequent_5 = ($$anchor) => {
			var div_3 = root_4();
			var div_4 = $.child(div_3);
			var node_4 = $.child(div_4);

			$.snippet(node_4, () => $$props.preview);
			$.reset(div_4);

			var node_5 = $.sibling(div_4, 2);

			{
				var consequent_3 = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_6 = $.first_child(fragment_2);

					$.snippet(node_6, () => $$props.customize);
					$.append($$anchor, fragment_2);
				};

				$.if(node_5, ($$render) => {
					if ($$props.customize) $$render(consequent_3);
				});
			}

			var node_7 = $.sibling(node_5, 2);

			{
				var consequent_4 = ($$anchor) => {
					var fragment_3 = $.comment();
					var node_8 = $.first_child(fragment_3);

					$.snippet(node_8, () => $$props.propTable);
					$.append($$anchor, fragment_3);
				};

				$.if(node_7, ($$render) => {
					if ($$props.propTable) $$render(consequent_4);
				});
			}

			var node_9 = $.sibling(node_7, 2);

			Dependencies(node_9, {
				get dependencyList() {
					return $.get(dependencyList);
				}
			});

			$.reset(div_3);

			$.template_effect(() => {
				$.set_attribute(div_3, 'id', $.get(previewPanelId));
				$.set_attribute(div_3, 'aria-labelledby', $.get(previewTabId));
			});

			$.append($$anchor, div_3);
		};

		var alternate_1 = ($$anchor) => {
			var div_5 = root_5();
			var node_10 = $.child(div_5);

			$.snippet(node_10, () => $$props.code);
			$.reset(div_5);

			$.template_effect(() => {
				$.set_attribute(div_5, 'id', $.get(codePanelId));
				$.set_attribute(div_5, 'aria-labelledby', $.get(codeTabId));
			});

			$.append($$anchor, div_5);
		};

		$.if(node_3, ($$render) => {
			if ($.get(active) === 'preview') $$render(consequent_5); else $$render(alternate_1, -1);
		});
	}

	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(button, 'id', $.get(previewTabId));
		$.set_attribute(button, 'aria-selected', $.get(active) === 'preview');
		$.set_attribute(button, 'aria-controls', $.get(previewPanelId));
		$.set_attribute(button, 'tabindex', $.get(active) === 'preview' ? 0 : -1);
		$.set_attribute(button, 'data-active', $.get(active) === 'preview');
		$.set_attribute(button_1, 'id', $.get(codeTabId));
		$.set_attribute(button_1, 'aria-selected', $.get(active) === 'code');
		$.set_attribute(button_1, 'aria-controls', $.get(codePanelId));
		$.set_attribute(button_1, 'tabindex', $.get(active) === 'code' ? 0 : -1);
		$.set_attribute(button_1, 'data-active', $.get(active) === 'code');
	});

	$.delegated('keydown', div_1, handleTabKey);
	$.delegated('click', button, () => selectTab('preview'));
	$.delegated('click', button_1, () => selectTab('code'));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['keydown', 'click']);