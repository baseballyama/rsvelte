import * as $ from 'svelte/internal/server';
import { paletteStore } from '../store/PaletteStore';
import { onMount, getContext } from 'svelte';
import { runAction } from '../utils';
import KeyboardButton from './KeyboardButton.svelte';
import { THEME_CONTEXT } from '../constants';

export default function Result($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { action: actionProp } = $$props;
		let elRef = void 0;
		let isActive = false;
		let formattedShortcut = [];
		const themeCtx = getContext(THEME_CONTEXT);

		const {
			resultContainerClass,
			unstyled,
			optionSelectedClass,
			titleClass,
			subtitleClass,
			descriptionClass,
			resultContainerStyle,
			titleStyle,
			subtitleStyle,
			descriptionStyle,
			optionSelectedStyle
		} = $.store_get($$store_subs ??= {}, '$themeCtx', themeCtx);

		// Replace afterUpdate with $effect
		const handleRunAction = () => {
			runAction({ action: actionProp });
		};

		onMount(async () => {
			const tinyKeys = await import('tinykeys');
			const { parseKeybinding } = tinyKeys;

			if (actionProp.shortcut) {
				const parsedShortcut = parseKeybinding(actionProp.shortcut);

				formattedShortcut = parsedShortcut.flat().filter((s) => s.length > 0);
			}
		});

		const onMouseEnter = () => {
			isActive = true;

			paletteStore.update((value) => {
				return {
					...value,
					activeCommandId: actionProp.actionId || '',
					selectedCommandId: actionProp.actionId || ''
				};
			});
		};

		const onMouseLeave = () => {
			isActive = false;
		};

		$$renderer.push(`<div${$.attr_class(`${resultContainerClass || ''} ${isActive ? !unstyled ? '' : optionSelectedClass || '' : ''}`, 'svelte-16jqtxf', {
			'cp-result': !unstyled,
			'cp-result-active': !unstyled && isActive
		})}${$.attr_style(`${resultContainerStyle || ''} ${isActive ? optionSelectedStyle || '' : ''}`)}${$.attr('aria-selected', isActive)} role="option"${$.attr('id', `palette-${actionProp.actionId}`)}${$.attr('tabindex', -1)}>`);

		if (actionProp.icon) {
			$$renderer.push(`<!--[0--><div class="cp-result-icon svelte-16jqtxf">`);

			if (typeof actionProp.icon === 'function') {
				$$renderer.push('<!--[0-->');
				actionProp.icon($$renderer);
				$$renderer.push(`<!---->`);
			} else if (typeof actionProp.icon === 'string') {
				$$renderer.push('<!--[1-->');

				if (actionProp.icon.startsWith('http') || actionProp.icon.startsWith('/')) {
					$$renderer.push(`<!--[0--><img${$.attr('src', actionProp.icon)} alt="" width="20" height="20" class="svelte-16jqtxf"/>`);
				} else {
					$$renderer.push(`<!--[-1--><span class="cp-result-emoji svelte-16jqtxf">${$.escape(actionProp.icon)}</span>`);
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="cp-result-content svelte-16jqtxf"><div${$.attr_class(`cp-result-title ${titleClass || ''}`, 'svelte-16jqtxf', { 'title': !unstyled })}${$.attr_style(titleStyle || '')}><span>${$.escape(actionProp.title)}</span></div> `);

		if (actionProp.subTitle) {
			$$renderer.push(`<!--[0--><div${$.attr_class(`cp-result-subtitle ${subtitleClass || ''}`, 'svelte-16jqtxf')}${$.attr_style(subtitleStyle || '')}>${$.escape(actionProp.subTitle)}</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (actionProp.description) {
			$$renderer.push(`<!--[0--><div${$.attr_class(`cp-result-description ${descriptionClass || ''}`, 'svelte-16jqtxf')}${$.attr_style(descriptionStyle || '')}>${$.escape(actionProp.description)}</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> `);

		if (formattedShortcut.length > 0) {
			$$renderer.push(`<!--[0--><div class="cp-result-shortcuts svelte-16jqtxf"><!--[-->`);

			const each_array = $.ensure_array_like(formattedShortcut);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let shortcut = each_array[$$index];

				{
					function children($$renderer) {
						$$renderer.push(`<span>${$.escape(shortcut)}</span>`);
					}

					KeyboardButton($$renderer, { children, $$slots: { default: true } });
				}
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}