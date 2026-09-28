import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, onDestroy } from 'svelte';
import { browser } from '$app/environment';
import Icon from '$lib/components/global/Icon.svelte';
import { bookmarks } from '$lib/stores/bookmarks';
import { formatShortcut } from '$lib/utils/keyboard';
import SegmentedControl from '$lib/components/global/SegmentedControl.svelte';

var root = $.from_html(`<li class="svelte-1me4x3i"><kbd class="svelte-1me4x3i"> </kbd> <span class="svelte-1me4x3i"> </span></li>`);
var root_1 = $.from_html(`<li class="svelte-1me4x3i"><kbd class="svelte-1me4x3i"> </kbd> <span class="svelte-1me4x3i">Homepage</span></li>`);
var root_2 = $.from_html(`<details class="bookmarks-details svelte-1me4x3i"><summary class="svelte-1me4x3i"> </summary> <ul class="bookmarks-list svelte-1me4x3i"><!> <!> <li class="svelte-1me4x3i"><kbd class="svelte-1me4x3i"> </kbd> <span class="svelte-1me4x3i">View all Bookmarks</span></li></ul></details>`);
var root_3 = $.from_html(`<p class="no-bookmarks-tip svelte-1me4x3i"><i class="svelte-1me4x3i">You don't have any bookmarks yet.</i> <span>Right-click on a tool to bookmark it for quick access and offline use.</span></p>`);
var root_4 = $.from_html(`<div class="shortcuts-category svelte-1me4x3i"><h3 class="svelte-1me4x3i"> </h3> <ul class="svelte-1me4x3i"></ul> <!> <!></div>`);
var root_5 = $.from_html(`<div class="shortcuts-content svelte-1me4x3i"></div>`);

var root_6 = $.from_html(`<div class="about-content svelte-1me4x3i"><p class="svelte-1me4x3i">Networking Toolbox is an open-source collection of web-based networking tools designed to make
            network-related tasks quicker and easier.</p> <p class="svelte-1me4x3i">With 100+ tools, it's privacy-focused and self-hostable, fully customizable, and includes a free REST API
            for automation.</p> <ul class="svelte-1me4x3i"><li class="svelte-1me4x3i"><a href="https://github.com/lissy93/networking-toolbox" class="svelte-1me4x3i">GitHub</a></li> <li class="svelte-1me4x3i"><a href="/sitemap" class="svelte-1me4x3i">Page Listing</a></li> <li class="svelte-1me4x3i"><a href="/settings" class="svelte-1me4x3i">App Settings</a></li> <li class="svelte-1me4x3i"><a href="/about" class="svelte-1me4x3i">Documentation</a></li> <li class="svelte-1me4x3i"><a href="/about/support" class="svelte-1me4x3i">Support</a></li> <li class="svelte-1me4x3i"><a href="/about/legal" class="svelte-1me4x3i">Legal</a></li></ul> <p class="sponsor svelte-1me4x3i"><!> <span><b>Finding Networking Toolbox useful?</b> Consider <a href="https://github.com/sponsors/Lissy93" class="svelte-1me4x3i">sponsoring us on GitHub</a> to support ongoing development!</span></p> <div class="about-license-section svelte-1me4x3i"><a href="https://github.com/lissy93/networking-toolbox" target="_blank" rel="noopener" class="svelte-1me4x3i">Networking Toolbox</a> <a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener" class="svelte-1me4x3i">MIT</a> </div></div>`);

var root_7 = $.from_html(`<div class="shortcuts-backdrop svelte-1me4x3i" role="presentation"><div class="shortcuts-dialog svelte-1me4x3i" role="dialog" aria-labelledby="shortcuts-title" aria-modal="true"><div class="dialog-header svelte-1me4x3i"><div class="dialog-header-main svelte-1me4x3i"><h2 id="shortcuts-title" class="svelte-1me4x3i"> </h2> <div><!></div></div> <button class="close-btn svelte-1me4x3i" aria-label="Close shortcuts"><!></button></div> <!></div></div>`);

export default function ShortcutsDialog($$anchor, $$props) {
	$.push($$props, true);

	const $bookmarks = () => $.store_get(bookmarks, '$bookmarks', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let isOpen = $.state(false);

	const shortcuts = [
		{
			keys: '^K',
			description: 'Open search',
			category: 'Navigation'
		},

		{
			keys: '^,',
			description: 'Open settings',
			category: 'Navigation'
		},

		{
			keys: '^M',
			description: 'Toggle menu',
			category: 'Navigation'
		},

		{
			keys: '^H',
			description: 'Go to homepage',
			category: 'Navigation'
		},

		// { keys: '^B', description: 'Open bookmarks', category: 'Navigation' },
		{
			keys: '^/',
			description: 'Show shortcuts',
			category: 'Navigation'
		},

		{
			keys: '^1-9',
			description: 'Jump to bookmarked tool',
			category: 'Bookmarks'
		},

		{
			keys: 'Esc',
			description: 'Close dialogs/clear',
			category: 'General'
		}
	];

	function openDialog() {
		$.set(isOpen, true);

		// Push a new history state when opening dialog on mobile
		if (browser && window.innerWidth <= 768) {
			window.history.pushState({ shortcutsOpen: true }, '', window.location.href);
		}
	}

	function showDialog() {
		openDialog();
	}

	function handleKeydown(e) {
		// Ctrl + / to toggle
		if (e.ctrlKey && e.key === '/') {
			e.preventDefault();

			if ($.get(isOpen)) {
				close();
			} else {
				openDialog();
			}
		} else // Escape to close
		if (e.key === 'Escape' && $.get(isOpen)) {
			e.preventDefault();
			close();
		}
	}

	function close() {
		$.set(isOpen, false);
	}

	function handleBackdropClick(e) {
		if (e.target === e.currentTarget) {
			close();
		}
	}

	onMount(() => {
		if (browser) {
			window.addEventListener('keydown', handleKeydown);

			// Handle browser back button on mobile
			const handlePopState = (e) => {
				if ($.get(isOpen) && window.innerWidth <= 768) {
					e.preventDefault();
					close();
				}
			};

			window.addEventListener('popstate', handlePopState);

			return () => {
				window.removeEventListener('keydown', handleKeydown);
				window.removeEventListener('popstate', handlePopState);
			};
		}
	});

	onDestroy(() => {
		if (browser) {
			window.removeEventListener('keydown', handleKeydown);
		}
	});

	// Group shortcuts by category
	const groupedShortcuts = $.derived(() => () => {
		const groups = {};

		shortcuts.forEach((shortcut) => {
			const category = shortcut.category || 'General';

			if (!groups[category]) {
				groups[category] = [];
			}

			groups[category].push(shortcut);
		});

		return groups;
	});

	const viewOptions = [
		{
			label: 'Keyboard Shortcuts',
			value: 'keyboard-shortcuts',
			icon: 'keyboard'
		},
		{ label: 'About', value: 'about', icon: 'info' }
	];

	let activeView = $.state('keyboard-shortcuts');

	// Compute dialog title based on active view
	const dialogTitle = $.derived(() => $.get(activeView) === 'keyboard-shortcuts' ? 'Command Palette' : 'Networking Toolbox');

	// Close dialog when clicking links in About tab
	function handleLinkClick() {
		if ($.get(activeView) === 'about') {
			close();
		}
	}

	var $$exports = { showDialog };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_5 = ($$anchor) => {
			var div = root_7();
			var div_1 = $.child(div);
			var div_2 = $.child(div_1);
			var div_3 = $.child(div_2);
			var h2 = $.child(div_3);
			var text = $.only_child(h2, true);
			var div_4 = $.sibling(h2, 2);
			var node_1 = $.child(div_4);

			SegmentedControl(node_1, {
				hideLabel: true,
				get options() {
					return viewOptions;
				},
				onchange: (value) => $.set(activeView, value, true),
				get value() {
					return $.get(activeView);
				},

				set value($$value) {
					$.set(activeView, $$value, true);
				}
			});

			$.reset(div_4);
			$.reset(div_3);

			var button = $.sibling(div_3, 2);
			var node_2 = $.child(button);

			Icon(node_2, { name: 'x', size: 'sm' });
			$.reset(button);
			$.reset(div_2);

			var node_3 = $.sibling(div_2, 2);

			{
				var consequent_3 = ($$anchor) => {
					var div_5 = root_5();

					$.each(div_5, 21, () => Object.entries($.get(groupedShortcuts)()), ([category, items]) => category, ($$anchor, $$item) => {
						var $$array = $.derived(() => $.to_array($.get($$item), 2));
						let category = () => $.get($$array)[0];
						let items = () => $.get($$array)[1];
						var div_6 = root_4();
						var h3 = $.child(div_6);
						var text_1 = $.only_child(h3, true);
						var ul = $.sibling(h3, 2);

						$.each(ul, 21, items, (shortcut) => shortcut.keys, ($$anchor, shortcut) => {
							var li = root();
							var kbd = $.child(li);
							var text_2 = $.only_child(kbd, true);
							var span = $.sibling(kbd, 2);
							var text_3 = $.only_child(span, true);

							$.reset(li);

							$.template_effect(
								($0) => {
									$.set_text(text_2, $0);
									$.set_text(text_3, $.get(shortcut).description);
								},
								[() => formatShortcut($.get(shortcut).keys)]
							);

							$.append($$anchor, li);
						});

						$.reset(ul);

						var node_4 = $.sibling(ul, 2);

						{
							var consequent_1 = ($$anchor) => {
								var details = root_2();
								var summary = $.child(details);
								var text_4 = $.only_child(summary);
								var ul_1 = $.sibling(summary, 2);
								var node_5 = $.child(ul_1);

								$.each(node_5, 3, () => $bookmarks().slice(0, 10), (bookmark) => bookmark.href, ($$anchor, bookmark, index) => {
									var li_1 = root();
									var kbd_1 = $.child(li_1);
									var text_5 = $.only_child(kbd_1, true);
									var span_1 = $.sibling(kbd_1, 2);
									var text_6 = $.only_child(span_1, true);

									$.reset(li_1);

									$.template_effect(
										($0) => {
											$.set_text(text_5, $0);
											$.set_text(text_6, $.get(bookmark).label);
										},
										[
											() => formatShortcut(`^${$.get(index) + 1 === 10 ? 0 : $.get(index) + 1}`)
										]
									);

									$.append($$anchor, li_1);
								});

								var node_6 = $.sibling(node_5, 2);

								{
									var consequent = ($$anchor) => {
										var li_2 = root_1();
										var kbd_2 = $.child(li_2);
										var text_7 = $.only_child(kbd_2, true);

										$.next(2);
										$.reset(li_2);
										$.template_effect(($0) => $.set_text(text_7, $0), [() => formatShortcut('^0')]);
										$.append($$anchor, li_2);
									};

									$.if(node_6, ($$render) => {
										if ($bookmarks().length <= 9) $$render(consequent);
									});
								}

								var li_3 = $.sibling(node_6, 2);
								var kbd_3 = $.child(li_3);
								var text_8 = $.only_child(kbd_3, true);

								$.next(2);
								$.reset(li_3);
								$.reset(ul_1);
								$.reset(details);

								$.template_effect(
									($0, $1) => {
										$.set_text(text_4, `Your bookmarked tools (${$0 ?? ''})`);
										$.set_text(text_8, $1);
									},
									[
										() => Math.min($bookmarks().length, 9),
										() => formatShortcut('^B')
									]
								);

								$.append($$anchor, details);
							};

							$.if(node_4, ($$render) => {
								if (category() === 'Bookmarks' && $bookmarks().length > 0) $$render(consequent_1);
							});
						}

						var node_7 = $.sibling(node_4, 2);

						{
							var consequent_2 = ($$anchor) => {
								var p = root_3();

								$.append($$anchor, p);
							};

							$.if(node_7, ($$render) => {
								if (category() === 'Bookmarks' && $bookmarks().length === 0) $$render(consequent_2);
							});
						}

						$.reset(div_6);
						$.template_effect(() => $.set_text(text_1, category()));
						$.append($$anchor, div_6);
					});

					$.reset(div_5);
					$.append($$anchor, div_5);
				};

				var consequent_4 = ($$anchor) => {
					var div_7 = root_6();
					var ul_2 = $.sibling($.child(div_7), 4);
					var li_4 = $.child(ul_2);
					var a = $.only_child(li_4);
					var li_5 = $.sibling(li_4, 2);
					var a_1 = $.only_child(li_5);
					var li_6 = $.sibling(li_5, 2);
					var a_2 = $.only_child(li_6);
					var li_7 = $.sibling(li_6, 2);
					var a_3 = $.only_child(li_7);
					var li_8 = $.sibling(li_7, 2);
					var a_4 = $.only_child(li_8);
					var li_9 = $.sibling(li_8, 2);
					var a_5 = $.only_child(li_9);

					$.reset(ul_2);

					var p_1 = $.sibling(ul_2, 2);
					var node_8 = $.child(p_1);

					Icon(node_8, { name: 'heart', size: 'md' });
					$.next(2);
					$.reset(p_1);

					var div_8 = $.sibling(p_1, 2);
					var a_6 = $.child(div_8);
					var text_9 = $.sibling(a_6);
					var a_7 = $.sibling(text_9);
					var text_10 = $.sibling(a_7);

					$.reset(div_8);
					$.reset(div_7);

					$.template_effect(
						($0) => {
							$.set_text(text_9, ` v${import.meta.env.VITE_APP_VERSION ?? ''}, licensed under `);
							$.set_text(text_10, ` © ${$0 ?? ''} Alicia Sykes`);
						},
						[() => new Date().getFullYear()]
					);

					$.delegated('click', a, handleLinkClick);
					$.delegated('click', a_1, handleLinkClick);
					$.delegated('click', a_2, handleLinkClick);
					$.delegated('click', a_3, handleLinkClick);
					$.delegated('click', a_4, handleLinkClick);
					$.delegated('click', a_5, handleLinkClick);
					$.delegated('click', a_6, handleLinkClick);
					$.delegated('click', a_7, handleLinkClick);
					$.append($$anchor, div_7);
				};

				$.if(node_3, ($$render) => {
					if ($.get(activeView) === 'keyboard-shortcuts') $$render(consequent_3); else if ($.get(activeView) === 'about') $$render(consequent_4, 1);
				});
			}

			$.reset(div_1);
			$.reset(div);
			$.template_effect(() => $.set_text(text, $.get(dialogTitle)));
			$.delegated('click', div, handleBackdropClick);
			$.delegated('click', button, close);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(isOpen)) $$render(consequent_5);
		});
	}

	$.append($$anchor, fragment);

	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
}

$.delegate(['click']);