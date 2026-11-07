import * as $ from 'svelte/internal/server';
import { getContext, setContext, hasContext } from 'svelte';

export class CodeBlockGroupContext {
	static KEY = 'enhanced:codeblock:group';
	node;
	#init;

	/**
	 * Caution: expect init.title to be in a "writable closure"
	 */
	constructor(init) {
		this.#init = init;
	}

	get id() {
		return this.#init.id;
	}

	get name() {
		return this.#init.name;
	}

	get display() {
		return this.#init.display;
	}

	get title() {
		return this.#init.title;
	}

	set title(title) {
		this.#init.title = title;
	}

	static set(init) {
		return setContext(CodeBlockGroupContext.KEY, new CodeBlockGroupContext(init));
	}

	static get() {
		if (!hasContext(CodeBlockGroupContext.KEY)) return null;

		return getContext(CodeBlockGroupContext.KEY);
	}
}

export default function CodeBlockGroup($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			cols,
			name,
			display = 'files',
			title = void 0,
			children,
			class: cls,
			$$slots,
			$$events,
			...rest
		} = $$props;

		let groupEl;

		// preserve reactivity of title inside GroupContext
		const initClosure = {
			id: Math.random().toString(36).slice(2).toString(),
			name,
			display,
			get title() {
				return title;
			},

			set title(t) {
				title = t;
			}
		};

		const groupContext = CodeBlockGroupContext.set(initClosure);
		let fullscreen = false;

		function onFullScreenChange() {
			fullscreen = !!document.fullscreenElement;
		}

		$$renderer.push(`<div${$.attributes(
			{
				class: `codeblock-group codeblock-group--${$.stringify(display)} ${$.stringify(cls)}`,
				...rest
			},
			'svelte-1kvaajo',
			void 0,
			{ '--cols': cols }
		)}>`);

		if (children) {
			$$renderer.push('<!--[0-->');
			children($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <input${$.attr('id', `codeblock-group-${$.stringify(groupContext.id)}-fullscreen`)} class="codeblock-group-fullscreen sr-only" type="checkbox"${$.attr('checked', fullscreen, true)}/> <div class="first-row-last-col-fill svelte-1kvaajo"></div></div>`);
		$.bind_props($$props, { title });
	});
}