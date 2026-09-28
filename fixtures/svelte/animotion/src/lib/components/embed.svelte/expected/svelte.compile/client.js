import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tick } from 'svelte';
import { setPresentation } from './store.svelte.js';
import 'reveal.js/reveal.css';
import '../styles/theme.css';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'options',
	'plugins'
]);

var root = $.from_html(`<div class="reveal svelte-2a7m49"><div><!></div></div>`);

export default function Embed($$anchor, $$props) {
	$.push($$props, true);

	let props = $.rest_props($$props, rest_excludes);
	let deck;

	async function init() {
		const Reveal = (await import('reveal.js')).default;
		const pluginDefaults = { markdown: false, highlight: false, math: false, notes: false };
		const enabled = { ...pluginDefaults, ...$$props.plugins };
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

		/*
			to have multiple slides we pass the new reference
			to animotion and have to set `embedded: true`
		*/
		deck = new Reveal(animotion, {
			display: 'grid',
			disableLayout: false,
			plugins: activePlugins,
			keyboardCondition: 'focused',
			embedded: true,
			...$$props.options
		});

		setPresentation(deck);

		// custom event listeners
		const inEvent = new CustomEvent('in');

		const outEvent = new CustomEvent('out');
		const currentEvent = new CustomEvent('current');

		// dispatch event for current active fragment
		// so `do` works in both directions
		async function dispatchFocused(event) {
			await tick();

			const currentEmbedEl = event.target;
			const currentFragmentEl = currentEmbedEl.querySelector('.current-fragment');

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

			dispatchFocused(event);
		});

		deck.on('slidetransitionend', (event) => {
			dispatchFocused(event);
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
				dispatchFocused(event);
			}
		});

		deck.on('fragmenthidden', (event) => {
			if ('fragment' in event) {
				const fragmentEl = event.fragment;

				fragmentEl?.dispatchEvent(outEvent);
				dispatchFocused(event);
			}
		});

		deck.initialize();
	}

	$.user_effect(() => {
		init();

		return () => {
			deck?.destroy();
		};
	});

	let animotion;
	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	$.snippet(node, () => $$props.children);
	$.reset(div_1);
	$.reset(div);
	$.bind_this(div, ($$value) => animotion = $$value, () => animotion);
	$.template_effect(() => $.set_class(div_1, 1, `slides ${$$props.class ?? ''}`, 'svelte-2a7m49'));
	$.append($$anchor, div);
	$.pop();
}