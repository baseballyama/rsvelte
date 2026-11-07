import * as $ from 'svelte/internal/server';
import { variable_color_svg } from '$/lib/theme/variable_color_svg';
import { clickOutside } from '$actions/click_outside';
import { invalidate } from '$app/navigation';
import { theme_maker } from '$state/theme';
import Cookie from 'js-cookie';
import { fly } from 'svelte/transition';

export default function ThemeMaker($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		// when a new theme is selected, apply the class directly to the correct element,
		// and save the theme name to the user's db record
		const themes = import.meta.glob('$styles/themes/*.css', { eager: true });

		// TODO refactor to utility function
		function getThemeName(path) {
			let match_temp = path.split('/').pop()?.split('.')[0];

			return match_temp;
		}

		// Always use system and light which are just base styles
		const theme_names = ['system', 'light', ...Object.keys(themes).map(getThemeName)];

		function change_theme(e) {
			// Set cookie for server side theme change
			Cookie.set('theme', this.innerText, { expires: 999, sameSite: 'strict', secure: true, path: '/' });

			const theme_wrapper = document.querySelector('.theme-wrapper');

			// Update the dom manually
			if (theme_wrapper) theme_wrapper.className = 'theme-' + this.innerText + ' theme-wrapper';

			// Invalidate the route
			// Load new server data
			invalidate('/');

			variable_color_svg();
		}

		if ($.store_get($$store_subs ??= {}, '$theme_maker', theme_maker).status === 'OPEN') {
			$$renderer.push(`<!--[0--><section class="svelte-3ikiwf"><h4 class="svelte-3ikiwf">Theme Picker <button class="close svelte-3ikiwf">×</button></h4> <div class="theme-maker-buttons svelte-3ikiwf"><!--[-->`);

			const each_array = $.ensure_array_like(theme_names);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let theme_name = each_array[$$index];

				$$renderer.push(`<button${$.attr_class('theme-preview theme-' + theme_name, 'svelte-3ikiwf')}><div class="preview svelte-3ikiwf"><div class="circle color svelte-3ikiwf"></div> <div class="circle primary svelte-3ikiwf"></div> <div class="circle accent svelte-3ikiwf"></div> <div class="circle warning svelte-3ikiwf"></div></div> <p class="svelte-3ikiwf">${$.escape(theme_name)}</p></button>`);
			}

			$$renderer.push(`<!--]--></div></section>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}