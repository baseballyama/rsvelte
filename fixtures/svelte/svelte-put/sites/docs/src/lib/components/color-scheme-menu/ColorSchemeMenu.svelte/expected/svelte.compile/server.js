import * as $ from 'svelte/internal/server';
import { clickoutside } from '@svelte-put/clickoutside';
import { COLOR_SCHEMES } from '$lib/constants';
import { SettingsContext } from '$lib/settings/context.svelte';

export default function ColorSchemeMenu($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: cls, $$slots, $$events, ...rest } = $$props;
		let open = false;
		let settings = SettingsContext.get();

		function toggle(force) {
			open = force ?? !open;
		}

		const LABELS = { light: 'Light', dark: 'Dark', system: 'System' };

		const iconClassMap = {
			light: 'i-[sun]',
			dark: 'i-[moon-stars]',
			system: 'i-[desktop]'
		};

		function icon($$renderer, scheme) {
			$$renderer.push(`<span${$.attr_class(`i ${$.stringify(iconClassMap[scheme])} h-6 w-6 shrink-0`, 'svelte-ewd8h4')}></span>`);
		}

		$$renderer.push(`<div${$.attributes(
			{
				class: `color-scheme-menu csm relative ${$.stringify(cls)}`,
				...rest
			},
			'svelte-ewd8h4'
		)}><label class="c-btn c-btn--icon grid grid-cols-[auto_auto] gap-2 svelte-ewd8h4" id="csm-toggler"><span class="sr-only">${$.escape(settings.colorScheme)}</span> `);

		icon($$renderer, settings.colorScheme);
		$$renderer.push(`<!----> <input type="checkbox"${$.attr('checked', open, true)} class="sr-only svelte-ewd8h4"/> <i${$.attr_class('i i-[caret-down] h-5 w-5 transition-transform', void 0, { 'rotate-180': open })}></i></label> <div class="csm-dropdown svelte-ewd8h4"${$.attr('inert', !open, true)}><div class="overflow-hidden"><ul class="bg-bg relative border"><!--[-->`);

		const each_array = $.ensure_array_like(COLOR_SCHEMES);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let scheme = each_array[$$index];

			$$renderer.push(`<li class="border-b last:border-b-0"><form method="GET"><label${$.attr_class('c-btn c-btn--outlined focus-within:bg-bg-200 justify-start gap-4 border-none px-4 py-2 focus-within:outline-none', void 0, { 'text-primary': scheme === settings.colorScheme })}><input type="submit"${$.attr('value', scheme)} name="color-scheme" class="sr-only"/> `);
			icon($$renderer, scheme);
			$$renderer.push(`<!----> <span class="text-sm">${$.escape(LABELS[scheme])}</span></label></form></li>`);
		}

		$$renderer.push(`<!--]--></ul></div></div></div>`);
	});
}