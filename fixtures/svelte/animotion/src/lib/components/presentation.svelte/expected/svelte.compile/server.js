import * as $ from 'svelte/internal/server';
import { tick } from 'svelte';
import { setPresentation } from './store.svelte.js';
import 'reveal.js/reveal.css';

export default function Presentation($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, options, plugins, $$slots, $$events, ...props } = $$props;
		let deck;

		async function init() {
			const Reveal = (await import('reveal.js')).default;
			const pluginDefaults = { markdown: false, highlight: false, math: false, notes: false };
			const enabled = { ...pluginDefaults, ...plugins };
			const activePlugins = [];

			if (enabled.markdown) {
				const Markdown = (await import('reveal.js/plugin/markdown')).default;

				activePlugins.push(Markdown);
			}

			if (enabled.highlight) {
				const Highlight = (await import('reveal.js/plugin/highlight')).default;

				activePlugins.push(Highlight);
			}

			if (enabled.math) {
				const Math = (await import('reveal.js/plugin/math')).default;

				activePlugins.push(Math.KaTeX);
			}

			if (enabled.notes) {
				const Notes = (await import('reveal.js/plugin/notes')).default;

				activePlugins.push(Notes);
			}

			const defaults = {
				// presentation size respecting aspect ratio
				width: 960,
				height: 700,
				// content padding
				margin: 0.04,

				// smallest and largest possible scale
				minScale: 0.2,
				maxScale: 2.0,
				// plugins
				plugins: activePlugins,

				// slide controls
				controls: true,

				// slide progress bar
				progress: true,

				// slide transition
				transition: 'slide',

				// bring your own layout
				disableLayout: false,

				// display mode used to show slides
				display: 'grid',

				// center slides on the screen
				center: true,

				// auto-animate duration
				autoAnimateDuration: 1,

				// auto-animate easing
				autoAnimateEasing: 'ease',

				// animate unmatched elements
				autoAnimateUnmatched: true,

				// hide cursor
				hideInactiveCursor: true,

				// time before cursor is hidden (ms)
				hideCursorTime: 5000,

				// show current slide
				hash: false
			};

			// create deck instance
			deck = new Reveal({ ...defaults, ...options });

			// expose reveal instance
			setPresentation(deck);

			// custom event listeners
			const inEvent = new CustomEvent('in');

			const outEvent = new CustomEvent('out');
			const currentEvent = new CustomEvent('current');

			// dispatch event for current active fragment
			// so `do` works in both directions
			async function dispatchFocused() {
				await tick();

				let currentFragmentEl = document.querySelector('.current-fragment');

				if (currentFragmentEl) {
					currentFragmentEl.dispatchEvent(currentEvent);
				}
			}

			// keep track of current slide
			deck.on('slidechanged', (event) => {
				if ('currentSlide' in event) {
					const currentSlideEl = event.currentSlide;

					currentSlideEl?.dispatchEvent(inEvent);
				}

				if ('previousSlide' in event) {
					const currentPreviousEl = event.previousSlide;

					currentPreviousEl?.dispatchEvent(outEvent);
				}

				dispatchFocused();
			});

			deck.on('slidetransitionend', (event) => {
				dispatchFocused();
			});

			deck.on('fragmentshown', (event) => {
				if ('fragment' in event) {
					const el = event.fragment;
					let eventType;

					if (el.tagName === 'CODE') {
						const codeEvent = new CustomEvent('change', { bubbles: true, detail: { step: el.dataset.lineNumbers } });

						eventType = codeEvent;
					} else {
						eventType = inEvent;
					}

					el?.dispatchEvent(eventType);
					dispatchFocused();
				}
			});

			deck.on('fragmenthidden', (event) => {
				if ('fragment' in event) {
					const fragmentEl = event.fragment;

					fragmentEl?.dispatchEvent(outEvent);
					dispatchFocused();
				}
			});

			deck.initialize();

			if (options?.reload) {
				// reload page after update to avoid HMR issues
				reloadPageAfterUpdate();
			}
		}

		function reloadPageAfterUpdate() {
			if (import.meta.hot) {
				import.meta.hot.on('vite:afterUpdate', () => {
					location.reload();
				});
			}
		}

		$$renderer.push(`<div class="reveal"><div${$.attr_class(`slides ${$.stringify(props.class)}`)}>`);

		if (children) {
			$$renderer.push('<!--[0-->');
			children($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}