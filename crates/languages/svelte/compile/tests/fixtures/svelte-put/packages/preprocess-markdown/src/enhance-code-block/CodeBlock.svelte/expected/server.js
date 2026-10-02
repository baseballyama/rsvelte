import * as $ from 'svelte/internal/server';
import { copy } from '@svelte-put/copy';
import ButtonCollapse from './ButtonCollapse.svelte';
import ButtonCopy, { copyCode } from './ButtonCopy.svelte';
import ButtonFullScreen from './ButtonFullScreen.svelte';
import { CodeBlockGroupContext } from './CodeBlockGroup.svelte';
import FileIcon from './FileIcon.svelte';

export default function CodeBlock($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const {
			lang = '',
			title = '',
			hideLineNumber = 'false',
			numLines = undefined,
			collapsed = 'false',
			children,
			class: cls,
			$$slots,
			$$events,
			...rest
		} = $$props;

		// init context & id
		const groupContext = CodeBlockGroupContext.get();

		const id = Math.random().toString(36).slice(2);

		const fullScreenCheckBoxId = groupContext
			? `codeblock-group-${groupContext.id}-fullscreen`
			: `codeblock-${id}-fullscreen`;

		const collapsedCheckboxId = `codeblock-${id}-collapsed`;

		// resolve the collapsed prop
		let collapsible = $.derived(() => groupContext ? false : collapsed !== 'disabled');

		let collapsedInputChecked = collapsed === 'true';
		let copyBtnEl = undefined;
		let codeBlockEl = undefined;

		function titleAndFileIcon($$renderer) {
			$$renderer.push(`<span class="codeblock-title svelte-152p7v7">`);
			FileIcon($$renderer, { lang });
			$$renderer.push(`<!----> <span class="svelte-152p7v7">${$.escape(title)}</span></span>`);
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<section${$.attributes(
				{
					class: `codeblock ${$.stringify(cls)}`,
					...groupContext && { 'data-group-display': groupContext.display },
					...rest
				},
				'svelte-152p7v7',
				{
					collapsible: groupContext ? false : collapsible(),
					titled: !!title,
					grouped: !!groupContext,
					'hide-line-number': hideLineNumber !== 'false'
				},
				{
					'--num-line-width': `${$.stringify(numLines ? numLines.length + 2 : 4)}ch`
				}
			)}>`);

			if (groupContext) {
				$$renderer.push(`<!--[0--><label class="codeblock-group-label svelte-152p7v7">`);

				if (groupContext.display === 'files') {
					$$renderer.push('<!--[0-->');
					titleAndFileIcon($$renderer);
				} else {
					$$renderer.push(`<!--[-1--><span class="svelte-152p7v7">${$.escape(title)}</span>`);
				}

				$$renderer.push(`<!--]--> <input type="radio" class="codeblock-group-selected sr-only svelte-152p7v7"${$.attr('value', title)}${$.attr('name', groupContext.name)}${$.attr('checked', title === groupContext.title, true)}${$.attr('checked', groupContext.title === title, true)}/></label>`);
			} else {
				$$renderer.push(`<!--[-1--><label class="codeblock-header svelte-152p7v7"${$.attr('for', collapsedCheckboxId)}>`);
				titleAndFileIcon($$renderer);
				$$renderer.push(`<!----></label>`);
			}

			$$renderer.push(`<!--]--> <div class="codeblock-content svelte-152p7v7"><div class="codeblock-content-accordion svelte-152p7v7"><div class="codeblock-btns svelte-152p7v7">`);

			ButtonCopy($$renderer, {
				class: 'codeblock-btn',
				get trigger() {
					return copyBtnEl;
				},

				set trigger($$value) {
					copyBtnEl = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			ButtonFullScreen($$renderer, {
				class: 'codeblock-btn codeblock--btn--collapse',
				codeblock: codeBlockEl,
				id: fullScreenCheckBoxId
			});

			$$renderer.push(`<!----> `);

			if (collapsible()) {
				$$renderer.push('<!--[0-->');

				ButtonCollapse($$renderer, {
					class: 'codeblock-btn codeblock-btn--collapse',
					id: collapsedCheckboxId,
					collapsed: collapsedInputChecked
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> <div class="codeblock-pre-container svelte-152p7v7">`);

			if (children) {
				$$renderer.push('<!--[0-->');
				children($$renderer);
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div></div></section>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}