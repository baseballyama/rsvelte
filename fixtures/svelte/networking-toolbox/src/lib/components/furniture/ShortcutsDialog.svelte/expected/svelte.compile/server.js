import * as $ from 'svelte/internal/server';
import { onMount, onDestroy } from 'svelte';
import { browser } from '$app/environment';
import Icon from '$lib/components/global/Icon.svelte';
import { bookmarks } from '$lib/stores/bookmarks';
import { formatShortcut } from '$lib/utils/keyboard';
import SegmentedControl from '$lib/components/global/SegmentedControl.svelte';

export default function ShortcutsDialog($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let isOpen = false;

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
			isOpen = true;

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

				if (isOpen) {
					close();
				} else {
					openDialog();
				}
			} else // Escape to close
			if (e.key === 'Escape' && isOpen) {
				e.preventDefault();
				close();
			}
		}

		function close() {
			isOpen = false;
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
					if (isOpen && window.innerWidth <= 768) {
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

		let activeView = 'keyboard-shortcuts';

		// Compute dialog title based on active view
		const dialogTitle = $.derived(() => activeView === 'keyboard-shortcuts' ? 'Command Palette' : 'Networking Toolbox');

		// Close dialog when clicking links in About tab
		function handleLinkClick() {
			if (activeView === 'about') {
				close();
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (isOpen) {
				$$renderer.push(`<!--[0--><div class="shortcuts-backdrop svelte-1me4x3i" role="presentation"><div class="shortcuts-dialog svelte-1me4x3i" role="dialog" aria-labelledby="shortcuts-title" aria-modal="true"><div class="dialog-header svelte-1me4x3i"><div class="dialog-header-main svelte-1me4x3i"><h2 id="shortcuts-title" class="svelte-1me4x3i">${$.escape(dialogTitle())}</h2> <div>`);

				SegmentedControl($$renderer, {
					hideLabel: true,
					options: viewOptions,
					onchange: (value) => activeView = value,
					get value() {
						return activeView;
					},

					set value($$value) {
						activeView = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----></div></div> <button class="close-btn svelte-1me4x3i" aria-label="Close shortcuts">`);
				Icon($$renderer, { name: 'x', size: 'sm' });
				$$renderer.push(`<!----></button></div> `);

				if (activeView === 'keyboard-shortcuts') {
					$$renderer.push(`<!--[0--><div class="shortcuts-content svelte-1me4x3i"><!--[-->`);

					const each_array = $.ensure_array_like(Object.entries(groupedShortcuts()()));

					for (let $$index_2 = 0, $$length = each_array.length; $$index_2 < $$length; $$index_2++) {
						let [category, items] = each_array[$$index_2];

						$$renderer.push(`<div class="shortcuts-category svelte-1me4x3i"><h3 class="svelte-1me4x3i">${$.escape(category)}</h3> <ul class="svelte-1me4x3i"><!--[-->`);

						const each_array_1 = $.ensure_array_like(items);

						for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
							let shortcut = each_array_1[$$index];

							$$renderer.push(`<li class="svelte-1me4x3i"><kbd class="svelte-1me4x3i">${$.escape(formatShortcut(shortcut.keys))}</kbd> <span class="svelte-1me4x3i">${$.escape(shortcut.description)}</span></li>`);
						}

						$$renderer.push(`<!--]--></ul> `);

						if (category === 'Bookmarks' && $.store_get($$store_subs ??= {}, '$bookmarks', bookmarks).length > 0) {
							$$renderer.push(`<!--[0--><details class="bookmarks-details svelte-1me4x3i"><summary class="svelte-1me4x3i">Your bookmarked tools (${$.escape(Math.min($.store_get($$store_subs ??= {}, '$bookmarks', bookmarks).length, 9))})</summary> <ul class="bookmarks-list svelte-1me4x3i"><!--[-->`);

							const each_array_2 = $.ensure_array_like($.store_get($$store_subs ??= {}, '$bookmarks', bookmarks).slice(0, 10));

							for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
								let bookmark = each_array_2[index];

								$$renderer.push(`<li class="svelte-1me4x3i"><kbd class="svelte-1me4x3i">${$.escape(formatShortcut(`^${index + 1 === 10 ? 0 : index + 1}`))}</kbd> <span class="svelte-1me4x3i">${$.escape(bookmark.label)}</span></li>`);
							}

							$$renderer.push(`<!--]--> `);

							if ($.store_get($$store_subs ??= {}, '$bookmarks', bookmarks).length <= 9) {
								$$renderer.push(`<!--[0--><li class="svelte-1me4x3i"><kbd class="svelte-1me4x3i">${$.escape(formatShortcut('^0'))}</kbd> <span class="svelte-1me4x3i">Homepage</span></li>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> <li class="svelte-1me4x3i"><kbd class="svelte-1me4x3i">${$.escape(formatShortcut('^B'))}</kbd> <span class="svelte-1me4x3i">View all Bookmarks</span></li></ul></details>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (category === 'Bookmarks' && $.store_get($$store_subs ??= {}, '$bookmarks', bookmarks).length === 0) {
							$$renderer.push(`<!--[0--><p class="no-bookmarks-tip svelte-1me4x3i"><i class="svelte-1me4x3i">You don't have any bookmarks yet.</i> <span>Right-click on a tool to bookmark it for quick access and offline use.</span></p>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div>`);
					}

					$$renderer.push(`<!--]--></div>`);
				} else if (activeView === 'about') {
					$$renderer.push(`<!--[1--><div class="about-content svelte-1me4x3i"><p class="svelte-1me4x3i">Networking Toolbox is an open-source collection of web-based networking tools designed to make
            network-related tasks quicker and easier.</p> <p class="svelte-1me4x3i">With 100+ tools, it's privacy-focused and self-hostable, fully customizable, and includes a free REST API
            for automation.</p> <ul class="svelte-1me4x3i"><li class="svelte-1me4x3i"><a href="https://github.com/lissy93/networking-toolbox" class="svelte-1me4x3i">GitHub</a></li> <li class="svelte-1me4x3i"><a href="/sitemap" class="svelte-1me4x3i">Page Listing</a></li> <li class="svelte-1me4x3i"><a href="/settings" class="svelte-1me4x3i">App Settings</a></li> <li class="svelte-1me4x3i"><a href="/about" class="svelte-1me4x3i">Documentation</a></li> <li class="svelte-1me4x3i"><a href="/about/support" class="svelte-1me4x3i">Support</a></li> <li class="svelte-1me4x3i"><a href="/about/legal" class="svelte-1me4x3i">Legal</a></li></ul> <p class="sponsor svelte-1me4x3i">`);

					Icon($$renderer, { name: 'heart', size: 'md' });
					$$renderer.push(`<!----> <span><b>Finding Networking Toolbox useful?</b> Consider <a href="https://github.com/sponsors/Lissy93" class="svelte-1me4x3i">sponsoring us on GitHub</a> to support ongoing development!</span></p> <div class="about-license-section svelte-1me4x3i"><a href="https://github.com/lissy93/networking-toolbox" target="_blank" rel="noopener" class="svelte-1me4x3i">Networking Toolbox</a> v${$.escape(import.meta.env.VITE_APP_VERSION)}, licensed under <a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener" class="svelte-1me4x3i">MIT</a> © ${$.escape(new Date().getFullYear())} Alicia Sykes</div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { showDialog });
	});
}