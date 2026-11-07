import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { variable_color_svg } from '$/lib/theme/variable_color_svg';
import { clickOutside } from '$actions/click_outside';
import { invalidate } from '$app/navigation';
import { theme_maker } from '$state/theme';
import Cookie from 'js-cookie';
import { fly } from 'svelte/transition';

var root = $.from_html(`<button><div class="preview svelte-3ikiwf"><div class="circle color svelte-3ikiwf"></div> <div class="circle primary svelte-3ikiwf"></div> <div class="circle accent svelte-3ikiwf"></div> <div class="circle warning svelte-3ikiwf"></div></div> <p class="svelte-3ikiwf"> </p></button>`);
var root_1 = $.from_html(`<section class="svelte-3ikiwf"><h4 class="svelte-3ikiwf">Theme Picker <button class="close svelte-3ikiwf">×</button></h4> <div class="theme-maker-buttons svelte-3ikiwf"></div></section>`);

export default function ThemeMaker($$anchor, $$props) {
	$.push($$props, true);

	const $theme_maker = () => $.store_get(theme_maker, '$theme_maker', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

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

	var fragment = $.comment();

	$.event('keydown', $.window, (e) => {
		if (e.key === 'e' && (navigator.platform === 'MacIntel' ? e.metaKey : e.ctrlKey)) {
			e.preventDefault();
			theme_maker.open();
		}
	});

	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var section = root_1();
			var h4 = $.child(section);
			var button = $.sibling($.child(h4));

			$.reset(h4);

			var div = $.sibling(h4, 2);

			$.each(div, 21, () => theme_names, $.index, ($$anchor, theme_name) => {
				var button_1 = root();
				var p = $.sibling($.child(button_1), 2);
				var text = $.only_child(p, true);

				$.reset(button_1);

				$.template_effect(() => {
					$.set_class(button_1, 1, 'theme-preview theme-' + $.get(theme_name), 'svelte-3ikiwf');
					$.set_text(text, $.get(theme_name));
				});

				$.delegated('click', button_1, change_theme);
				$.append($$anchor, button_1);
			});

			$.reset(div);
			$.reset(section);
			$.action(section, ($$node) => clickOutside?.($$node));

			$.event('click-outside', section, function (...$$args) {
				theme_maker.close?.apply(this, $$args);
			});

			$.delegated('click', button, function (...$$args) {
				theme_maker.close?.apply(this, $$args);
			});

			$.transition(3, section, () => fly, () => ({ x: '100%', opacity: 0 }));
			$.append($$anchor, section);
		};

		$.if(node, ($$render) => {
			if ($theme_maker().status === 'OPEN') $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);