import * as $ from 'svelte/internal/server';
import slide from './actions/slide';
import ArrowDown from './icons/ArrowDown.svelte';
import Markdown from './icons/Markdown.svelte';
import Svelte from './icons/Svelte.svelte';
import SvelteWithColor from './icons/SvelteWithColor.svelte';

function arrow($$renderer) {
	ArrowDown($$renderer, {});
}

export default function Expansion($$renderer, $$props) {
	/**
	 * @typedef {object} Props
	 * @property {string} title The title of the expansion
	 * @property {boolean} expanded Determine whether the expansion is expanded or not. It is recomended to use `bind:expanded`
	 * @property {boolean} reverse Determine the expand direction, `false` means down, `true` means up
	 * @property {string} headerStyle Custom header style
	 * @property {import('svelte').Snippet} iconFold custom fold icon
	 * @property {import('svelte').Snippet} iconExpanded custom expand icon
	 * @property {import('svelte').Snippet} customTitle custom title content
	 * @property {'svelte' | 'md'} codeType The code type of the icon, `svelte` or `md`
	 */
	/** @type {Props} */
	let {
		title,
		expanded = false,
		reverse = false,
		headerStyle = '',
		codeType = 'svelte',
		showIcon = true,
		bodyDom,
		children,
		iconFold,
		iconExpanded,
		customTitle
	} = $$props;

	/**
	 *
	 * @type {string}
	 */
	/**
	 * The panel body dom
	 * @type {HTMLDivElement}
	 */
	function onHeaderClick(e) {
		e.stopPropagation();
		expanded = !expanded;
	}

	function body($$renderer) {
		$$renderer.push(`<div class="c-expansion--body">`);
		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
	}

	function defaultIconExpanded($$renderer) {
		if (codeType === 'svelte') {
			$$renderer.push('<!--[0-->');
			SvelteWithColor($$renderer, {});
		} else if (codeType === 'md') {
			$$renderer.push(`<!--[1--><div class="flex items-center text-6 text-svp-primary">`);
			Markdown($$renderer, {});
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	}

	function defaultIconFold($$renderer) {
		if (codeType === 'svelte') {
			$$renderer.push('<!--[0-->');
			Svelte($$renderer, {});
		} else if (codeType === 'md') {
			$$renderer.push(`<!--[1--><div class="flex items-center text-6">`);
			Markdown($$renderer, {});
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	}

	function defaultCustomTitle($$renderer) {
		$$renderer.push(`<!---->${$.escape(title)}`);
	}

	$$renderer.push(`<div${$.attr_class(`c-expansion ${expanded ? 'c-expansion--expanded' : ''}`, 'svelte-1q97gs7')}>`);

	if (reverse) {
		$$renderer.push('<!--[0-->');
		body($$renderer);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> <div class="c-expansion--header svelte-1q97gs7"${$.attr_style(headerStyle)} role="button" tabindex="0"><div class="c-expansion--header-left svelte-1q97gs7">`);

	if (showIcon) {
		$$renderer.push(`<!--[0--><div class="c-expansion--icon svelte-1q97gs7">`);

		if (expanded) {
			$$renderer.push('<!--[0-->');

			if (iconExpanded) {
				$$renderer.push('<!--[0-->');
				iconExpanded($$renderer);
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');
				defaultIconExpanded($$renderer);
			}

			$$renderer.push(`<!--]-->`);
		} else if (iconFold) {
			$$renderer.push('<!--[1-->');
			iconFold($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
			defaultIconFold($$renderer);
		}

		$$renderer.push(`<!--]--></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> <div class="c-expansion--title svelte-1q97gs7">`);

	if (customTitle) {
		$$renderer.push('<!--[0-->');
		customTitle($$renderer);
		$$renderer.push(`<!---->`);
	} else {
		$$renderer.push('<!--[-1-->');
		defaultCustomTitle($$renderer);
	}

	$$renderer.push(`<!--]--></div></div> <div${$.attr_class(`c-expansion--arrow ${expanded ? 'c-expansion--arrow-expanded' : ''}`, 'svelte-1q97gs7')}>`);
	arrow($$renderer);
	$$renderer.push(`<!----></div></div> `);

	if (!reverse) {
		$$renderer.push('<!--[0-->');
		body($$renderer);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></div>`);
}