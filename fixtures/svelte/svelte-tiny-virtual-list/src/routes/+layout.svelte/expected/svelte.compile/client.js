import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { asset, resolve } from '$app/paths';
import { page } from '$app/state';
import { browser } from '$app/environment';

var root = $.from_html(`<nav class="left drawer l"><header class="fixed"><nav><i aria-hidden="true"><img alt="Logo"/></i> <h6>svelte-tiny-virtual-list</h6></nav></header> <a><i aria-hidden="true">description</i> <div>README</div></a> <a href="https://github.com/jonasgeiler/svelte-tiny-virtual-list" target="_blank"><i aria-hidden="true"><svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path></svg></i> <div>GitHub <i aria-hidden="true" class="tiny">launch</i></div></a> <a href="https://npmjs.com/package/svelte-tiny-virtual-list" target="_blank"><i aria-hidden="true"><svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.04 19.17H5.113z"></path></svg></i> <div>npm <i aria-hidden="true" class="tiny">launch</i></div></a> <div class="small-divider"></div> <label for="">Examples</label> <a><i aria-hidden="true">view_headline</i> <div>Elements of equal height</div></a> <a><i aria-hidden="true">view_day</i> <div>Variable heights</div></a> <a><i aria-hidden="true">view_week</i> <div>Horizontal list</div></a> <a><i aria-hidden="true">pin</i> <div>Scroll to index</div></a> <a><i aria-hidden="true">unfold_more</i> <div>Controlled scroll offset</div></a> <div class="small-divider"></div> <label for="">Demos</label> <a><i aria-hidden="true">newspaper</i> <div>Hacker News</div></a> <div class="max"></div> <button class="circle border"><i aria-hidden="true"> </i></button></nav> <nav class="top s m left-align"><button class="circle transparent"><i aria-hidden="true">menu</i></button> <i aria-hidden="true"><img alt="Logo"/></i> <h6 class="m">svelte-tiny-virtual-list</h6> <div class="max"></div> <button class="circle border"><i aria-hidden="true"> </i></button></nav> <dialog><header class="fixed"><nav><i aria-hidden="true"><img alt="Logo"/></i> <h6 class="m">svelte-tiny-virtual-list</h6> <div class="max"></div> <button class="transparent circle"><i aria-hidden="true">close</i></button></nav></header> <nav class="drawer no-padding no-margin"><a><i aria-hidden="true">description</i> <div>README</div></a> <a href="https://github.com/jonasgeiler/svelte-tiny-virtual-list" target="_blank"><i aria-hidden="true"><svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path></svg></i> <div>GitHub <i aria-hidden="true" class="tiny">launch</i></div></a> <a href="https://npmjs.com/package/svelte-tiny-virtual-list" target="_blank"><i aria-hidden="true"><svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.04 19.17H5.113z"></path></svg></i> <div>npm <i aria-hidden="true" class="tiny">launch</i></div></a> <div class="small-divider"></div> <label for="">Examples</label> <a><i aria-hidden="true">view_headline</i> <div>Elements of equal height</div></a> <a><i aria-hidden="true">view_day</i> <div>Variable heights</div></a> <a><i aria-hidden="true">view_week</i> <div>Horizontal list</div></a> <a><i aria-hidden="true">pin</i> <div>Scroll to index</div></a> <a><i aria-hidden="true">unfold_more</i> <div>Controlled scroll offset</div></a> <div class="small-divider"></div> <label for="">Demos</label> <a><i aria-hidden="true">newspaper</i> <div>Hacker News</div></a></nav></dialog> <main id="content" class="responsive flex flex-column"><!></main>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	if (browser) import('beercss');

	let darkMode = $.state(true);
	let mobileMenuOpen = $.state(false);

	function handleSwitchDarkMode() {
		$.set(darkMode, !$.get(darkMode));
		localStorage.setItem('theme', $.get(darkMode) ? 'dark' : 'light');

		$.get(darkMode)
			? document.body.classList.add('dark')
			: document.body.classList.remove('dark');
	}

	if (browser) {
		if (localStorage.theme === 'dark' || !('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches) {
			document.body.classList.add('dark');
			$.set(darkMode, true);
		} else {
			document.body.classList.remove('dark');
			$.set(darkMode, false);
		}
	}

	var fragment = root();
	var nav = $.first_child(fragment);
	var header = $.child(nav);
	var nav_1 = $.child(header);
	var i = $.child(nav_1);
	var img = $.only_child(i);

	$.next(2);
	$.reset(nav_1);
	$.reset(header);

	var a = $.sibling(header, 2);
	let classes;
	var a_1 = $.sibling(a, 10);
	let classes_1;
	var a_2 = $.sibling(a_1, 2);
	let classes_2;
	var a_3 = $.sibling(a_2, 2);
	let classes_3;
	var a_4 = $.sibling(a_3, 2);
	let classes_4;
	var a_5 = $.sibling(a_4, 2);
	let classes_5;
	var a_6 = $.sibling(a_5, 6);
	let classes_6;
	var button = $.sibling(a_6, 4);
	var i_1 = $.child(button);
	var text = $.only_child(i_1, true);

	$.reset(button);
	$.reset(nav);

	var nav_2 = $.sibling(nav, 2);
	var button_1 = $.child(nav_2);
	var i_2 = $.sibling(button_1, 2);
	var img_1 = $.only_child(i_2);
	var button_2 = $.sibling(i_2, 6);
	var i_3 = $.child(button_2);
	var text_1 = $.only_child(i_3, true);

	$.reset(button_2);
	$.reset(nav_2);

	var dialog = $.sibling(nav_2, 2);
	let classes_7;
	var header_1 = $.child(dialog);
	var nav_3 = $.child(header_1);
	var i_4 = $.child(nav_3);
	var img_2 = $.only_child(i_4);
	var button_3 = $.sibling(i_4, 6);

	$.reset(nav_3);
	$.reset(header_1);

	var nav_4 = $.sibling(header_1, 2);
	var a_7 = $.child(nav_4);
	let classes_8;
	var a_8 = $.sibling(a_7, 10);
	let classes_9;
	var a_9 = $.sibling(a_8, 2);
	let classes_10;
	var a_10 = $.sibling(a_9, 2);
	let classes_11;
	var a_11 = $.sibling(a_10, 2);
	let classes_12;
	var a_12 = $.sibling(a_11, 2);
	let classes_13;
	var a_13 = $.sibling(a_12, 6);
	let classes_14;

	$.reset(nav_4);
	$.reset(dialog);

	var main = $.sibling(dialog, 2);
	var node = $.child(main);

	$.snippet(node, () => $$props.children);
	$.reset(main);

	$.template_effect(
		(
			$0,
			$1,
			$2,
			$3,
			$4,
			$5,
			$6,
			$7,
			$8,
			$9,
			$10,
			$11,
			$12,
			$13,
			$14,
			$15,
			$16,
			$17,
			$18,
			$19
		) => {
			$.set_attribute(img, 'src', $0);
			$.set_attribute(img, 'srcset', `${$1 ?? ''} 2x`);
			$.set_attribute(a, 'href', $2);
			classes = $.set_class(a, 1, '', null, classes, { active: page.route.id === '/' });
			$.set_attribute(a_1, 'href', $3);

			classes_1 = $.set_class(a_1, 1, '', null, classes_1, {
				active: page.route.id === '/examples/elements-of-equal-height'
			});

			$.set_attribute(a_2, 'href', $4);
			classes_2 = $.set_class(a_2, 1, '', null, classes_2, { active: page.route.id === '/examples/variable-heights' });
			$.set_attribute(a_3, 'href', $5);
			classes_3 = $.set_class(a_3, 1, '', null, classes_3, { active: page.route.id === '/examples/horizontal-list' });
			$.set_attribute(a_4, 'href', $6);
			classes_4 = $.set_class(a_4, 1, '', null, classes_4, { active: page.route.id === '/examples/scroll-to-index' });
			$.set_attribute(a_5, 'href', $7);

			classes_5 = $.set_class(a_5, 1, '', null, classes_5, {
				active: page.route.id === '/examples/controlled-scroll-offset'
			});

			$.set_attribute(a_6, 'href', $8);
			classes_6 = $.set_class(a_6, 1, '', null, classes_6, { active: page.route.id === '/demos/hacker-news' });
			$.set_text(text, $.get(darkMode) ? 'light_mode' : 'dark_mode');
			$.set_attribute(img_1, 'src', $9);
			$.set_attribute(img_1, 'srcset', `${$10 ?? ''} 2x`);
			$.set_text(text_1, $.get(darkMode) ? 'light_mode' : 'dark_mode');
			classes_7 = $.set_class(dialog, 1, 'left s m', null, classes_7, { active: $.get(mobileMenuOpen) });
			$.set_attribute(img_2, 'src', $11);
			$.set_attribute(img_2, 'srcset', `${$12 ?? ''} 2x`);
			$.set_attribute(a_7, 'href', $13);
			classes_8 = $.set_class(a_7, 1, '', null, classes_8, { active: page.route.id === '/' });
			$.set_attribute(a_8, 'href', $14);

			classes_9 = $.set_class(a_8, 1, '', null, classes_9, {
				active: page.route.id === '/examples/elements-of-equal-height'
			});

			$.set_attribute(a_9, 'href', $15);
			classes_10 = $.set_class(a_9, 1, '', null, classes_10, { active: page.route.id === '/examples/variable-heights' });
			$.set_attribute(a_10, 'href', $16);
			classes_11 = $.set_class(a_10, 1, '', null, classes_11, { active: page.route.id === '/examples/horizontal-list' });
			$.set_attribute(a_11, 'href', $17);
			classes_12 = $.set_class(a_11, 1, '', null, classes_12, { active: page.route.id === '/examples/scroll-to-index' });
			$.set_attribute(a_12, 'href', $18);

			classes_13 = $.set_class(a_12, 1, '', null, classes_13, {
				active: page.route.id === '/examples/controlled-scroll-offset'
			});

			$.set_attribute(a_13, 'href', $19);
			classes_14 = $.set_class(a_13, 1, '', null, classes_14, { active: page.route.id === '/demos/hacker-news' });
		},
		[
			() => asset('/logo.svg'),
			() => asset('/logo.svg'),
			() => resolve('/'),
			() => resolve('/examples/elements-of-equal-height'),
			() => resolve('/examples/variable-heights'),
			() => resolve('/examples/horizontal-list'),
			() => resolve('/examples/scroll-to-index'),
			() => resolve('/examples/controlled-scroll-offset'),
			() => resolve('/demos/hacker-news'),
			() => asset('/logo.svg'),
			() => asset('/logo.svg'),
			() => asset('/logo.svg'),
			() => asset('/logo.svg'),
			() => resolve('/'),
			() => resolve('/examples/elements-of-equal-height'),
			() => resolve('/examples/variable-heights'),
			() => resolve('/examples/horizontal-list'),
			() => resolve('/examples/scroll-to-index'),
			() => resolve('/examples/controlled-scroll-offset'),
			() => resolve('/demos/hacker-news')
		]
	);

	$.delegated('click', button, handleSwitchDarkMode);
	$.delegated('click', button_1, () => $.set(mobileMenuOpen, true));
	$.delegated('click', button_2, handleSwitchDarkMode);
	$.delegated('click', button_3, () => $.set(mobileMenuOpen, false));
	$.delegated('click', a_7, () => $.set(mobileMenuOpen, false));
	$.delegated('click', a_8, () => $.set(mobileMenuOpen, false));
	$.delegated('click', a_9, () => $.set(mobileMenuOpen, false));
	$.delegated('click', a_10, () => $.set(mobileMenuOpen, false));
	$.delegated('click', a_11, () => $.set(mobileMenuOpen, false));
	$.delegated('click', a_12, () => $.set(mobileMenuOpen, false));
	$.delegated('click', a_13, () => $.set(mobileMenuOpen, false));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);