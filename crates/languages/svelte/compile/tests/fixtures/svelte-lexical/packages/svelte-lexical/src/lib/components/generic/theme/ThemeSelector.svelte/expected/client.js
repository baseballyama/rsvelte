import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CAN_USE_DOM } from '@lexical/utils';
import { onMount, onDestroy } from 'svelte';
import { themeTracker } from './themeTracker.svelte.js';

const systemIcon = ($$anchor) => {
	var svg = root_1();

	$.append($$anchor, svg);
};

const lightIcon = ($$anchor) => {
	var svg_1 = root_2();

	$.append($$anchor, svg_1);
};

const darkIcon = ($$anchor) => {
	var svg_2 = root_3();

	$.append($$anchor, svg_2);
};

var root = $.with_script($.from_html(
	`<script>
    const themeMode = localStorage.getItem('app-theme');
    let themeColor;
    if (!themeMode || themeMode === 'system') {
      themeColor = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    } else {
      themeColor = themeMode;
    }

    document.querySelector('html')?.setAttribute('data-theme', themeColor);
  </script><!>`,
	1
));

var root_1 = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-monitor-icon lucide-monitor svelte-1ie1u2t"><rect width="20" height="14" x="2" y="3" rx="2"></rect><line x1="8" x2="16" y1="21" y2="21"></line><line x1="12" x2="12" y1="17" y2="21"></line></svg>`);
var root_2 = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svelte-1ie1u2t"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`);
var root_3 = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svelte-1ie1u2t"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`);
var root_4 = $.from_html(`<div class="theme-dropdown svelte-1ie1u2t"><button><!> <span>System</span></button> <button><!> <span>Light</span></button> <button><!> <span>Dark</span></button></div>`);
var root_5 = $.from_html(`<div class="theme-selector svelte-1ie1u2t"><button type="button" aria-label="Toggle theme menu" title="Change theme" class="theme-button svelte-1ie1u2t"><!></button> <!></div>`);

export default function ThemeSelector($$anchor, $$props) {
	$.push($$props, true);

	let showDropdown = $.state(false);

	function toggleDropdown() {
		$.set(showDropdown, !$.get(showDropdown));
	}

	// Close dropdown when clicking outside
	function handleClickOutside(event) {
		const selector = document.querySelector('.theme-selector');

		if ($.get(showDropdown) && selector && !event.composedPath().includes(selector)) {
			$.set(showDropdown, false);
		}
	}

	// Add and remove event listener
	onMount(() => {
		if (CAN_USE_DOM === false) return;

		document.addEventListener('click', handleClickOutside);
	});

	onDestroy(() => {
		if (CAN_USE_DOM === false) return;

		document.removeEventListener('click', handleClickOutside);
	});

	function changeMode(mode) {
		themeTracker.mode = mode;
		$.set(showDropdown, false);
	}

	var div = root_5();

	$.head('1ie1u2t', ($$anchor) => {
		var fragment = root();
		var node = $.sibling($.first_child(fragment));

		$.append($$anchor, fragment);
	});

	var button = $.child(div);
	var node_1 = $.child(button);

	{
		var consequent = ($$anchor) => {
			systemIcon($$anchor);
		};

		var consequent_1 = ($$anchor) => {
			lightIcon($$anchor);
		};

		var alternate = ($$anchor) => {
			darkIcon($$anchor);
		};

		$.if(node_1, ($$render) => {
			if (themeTracker.mode === 'system') $$render(consequent); else if (themeTracker.mode === 'light') $$render(consequent_1, 1); else $$render(alternate, -1);
		});
	}

	$.reset(button);

	var node_2 = $.sibling(button, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_1 = root_4();
			var button_1 = $.child(div_1);
			var node_3 = $.child(button_1);

			systemIcon(node_3);
			$.next(2);
			$.reset(button_1);

			var button_2 = $.sibling(button_1, 2);
			var node_4 = $.child(button_2);

			lightIcon(node_4);
			$.next(2);
			$.reset(button_2);

			var button_3 = $.sibling(button_2, 2);
			var node_5 = $.child(button_3);

			darkIcon(node_5);
			$.next(2);
			$.reset(button_3);
			$.reset(div_1);

			$.template_effect(() => {
				$.set_class(button_1, 1, `theme-option ${themeTracker.mode === 'system' ? 'active' : ''}`, 'svelte-1ie1u2t');
				$.set_class(button_2, 1, `theme-option ${themeTracker.mode === 'light' ? 'active' : ''}`, 'svelte-1ie1u2t');
				$.set_class(button_3, 1, `theme-option ${themeTracker.mode === 'dark' ? 'active' : ''}`, 'svelte-1ie1u2t');
			});

			$.delegated('click', button_1, () => changeMode('system'));
			$.delegated('click', button_2, () => changeMode('light'));
			$.delegated('click', button_3, () => changeMode('dark'));
			$.append($$anchor, div_1);
		};

		$.if(node_2, ($$render) => {
			if ($.get(showDropdown)) $$render(consequent_2);
		});
	}

	$.reset(div);
	$.delegated('click', button, toggleDropdown);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);