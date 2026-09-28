import * as $ from 'svelte/internal/server';
import { goto } from '$app/navigation';
import { onMount } from 'svelte';
import Hero from '../components/Hero.svelte';
import Features from '../components/Features.svelte';
import CommandPalette, { defineActions, createStoreMethods } from '$lib';
import themeStore from '../store/themeStore';
import switchTheme from '../utils/switchTheme';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let currentTheme = 'dark';
		const paletteMethods = createStoreMethods();

		onMount(() => {
			const savedTheme = localStorage.getItem('theme') || 'dark';

			themeStore.set(savedTheme);

			themeStore.subscribe((value) => {
				currentTheme = value;
			});
		});

		const actions = defineActions([
			{
				title: 'Go to documentation',
				subTitle: 'Learn how to use Svelte Command Palette',
				icon: '📚',
				group: 'Navigation',
				onRun: () => goto('/docs'),
				shortcut: 'G D'
			},

			{
				title: 'View on GitHub',
				subTitle: 'Star us on GitHub!',
				icon: '⭐',
				group: 'Navigation',
				onRun: () => window.open('https://github.com/rohitpotato/svelte-command-palette', '_blank'),
				shortcut: 'G H'
			},

			{
				title: 'Toggle theme',
				subTitle: 'Switch between light and dark mode',
				icon: '🎨',
				group: 'Preferences',
				onRun: switchTheme,
				shortcut: 'T T'
			},

			{
				title: 'Copy npm install command',
				subTitle: 'Copy installation command to clipboard',
				icon: '📋',
				group: 'Quick Actions',
				onRun: () => {
					navigator.clipboard.writeText('npm install svelte-command-palette');
					alert('Copied to clipboard!');
				},
				shortcut: 'C I'
			},

			{
				title: 'Report an issue',
				subTitle: 'Found a bug? Let us know!',
				icon: '🐛',
				group: 'Quick Actions',
				onRun: () => window.open('https://github.com/rohitpotato/svelte-command-palette/issues', '_blank')
			},

			{
				title: 'Follow on Twitter',
				subTitle: '@rohitpotato',
				icon: '🐦',
				group: 'Social',
				onRun: () => window.open('https://twitter.com/rohitpotato', '_blank')
			}
		]);

		const openCommandPalette = () => {
			paletteMethods.openPalette();
		};

		// Dynamic theme styles
		let paletteStyles = $.derived(() => currentTheme === 'light'
			? {
				inputStyle: { background: 'white', color: '#111827' },
				paletteWrapperInnerStyle: { background: 'white' },
				resultsContainerStyle: { background: 'white' }
			}
			: {
				inputStyle: { background: '#1f2937', color: '#f9fafb' },
				paletteWrapperInnerStyle: { background: '#1f2937' },
				resultsContainerStyle: { background: '#1f2937' }
			});

		CommandPalette($$renderer, {
			commands: actions,
			placeholder: 'Search actions...',
			shortcut: '$mod+k',
			onOpen: () => console.log('Palette opened'),
			onClose: () => console.log('Palette closed'),
			onActionSelect: (action) => console.log('Selected:', action.title),
			inputStyle: paletteStyles().inputStyle,
			paletteWrapperInnerStyle: paletteStyles().paletteWrapperInnerStyle,
			resultsContainerStyle: paletteStyles().resultsContainerStyle
		});

		$$renderer.push(`<!----> `);
		Hero($$renderer, { openCommandPalette });
		$$renderer.push(`<!----> `);
		Features($$renderer, {});
		$$renderer.push(`<!----> <section class="cta section svelte-1uha8ag"><div class="container"><div class="cta-card card card-highlight svelte-1uha8ag"><h2 class="svelte-1uha8ag">Ready to get started?</h2> <p class="svelte-1uha8ag">Install Svelte Command Palette and boost your app's productivity in minutes.</p> <div class="cta-install svelte-1uha8ag"><div class="code-block svelte-1uha8ag"><pre class="svelte-1uha8ag"><code>npm install svelte-command-palette</code></pre></div></div> <div class="cta-actions svelte-1uha8ag"><a href="/docs" class="btn btn-primary svelte-1uha8ag">Read the docs <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"></path></svg></a> <a href="https://github.com/rohitpotato/svelte-command-palette" target="_blank" rel="noopener" class="btn btn-secondary svelte-1uha8ag">View on GitHub</a></div></div></div></section> <footer class="footer svelte-1uha8ag"><div class="container"><p class="svelte-1uha8ag">Built with ❤️ by <a href="https://twitter.com/rohitpotato" target="_blank" rel="noopener">Rohit Kashyap</a></p> <p class="footer-links svelte-1uha8ag"><a href="https://github.com/rohitpotato/svelte-command-palette" target="_blank" rel="noopener">GitHub</a> <span class="svelte-1uha8ag">•</span> <a href="https://twitter.com/rohitpotato" target="_blank" rel="noopener">Twitter</a> <span class="svelte-1uha8ag">•</span> <a href="/docs">Documentation</a></p></div></footer>`);
	});
}