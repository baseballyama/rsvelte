import 'svelte/internal/disclose-version';
import { getContext, setContext, hasContext } from 'svelte';
import * as $ from 'svelte/internal/client';

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

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'cols',
	'name',
	'display',
	'title',
	'children',
	'class'
]);

var root = $.from_html(`<div><!> <input class="codeblock-group-fullscreen sr-only" type="checkbox"/> <div class="first-row-last-col-fill svelte-1kvaajo"></div></div>`);

export default function CodeBlockGroup($$anchor, $$props) {
	$.push($$props, true);

	let display = $.prop($$props, 'display', 3, 'files'),
		title = $.prop($$props, 'title', 15),
		rest = $.rest_props($$props, rest_excludes);

	let groupEl;

	// preserve reactivity of title inside GroupContext
	const initClosure = {
		id: Math.random().toString(36).slice(2).toString(),
		name: $$props.name,
		display: display(),
		get title() {
			return title();
		},

		set title(t) {
			title(t);
		}
	};

	const groupContext = CodeBlockGroupContext.set(initClosure);

	$.user_effect(() => {
		groupContext.node = groupEl;
	});

	let fullscreen = $.state(false);

	function onFullScreenChange() {
		$.set(fullscreen, !!document.fullscreenElement);
	}

	var div = root();

	$.attribute_effect(
		div,
		() => ({
			class: `codeblock-group codeblock-group--${display() ?? ''} ${$$props.class ?? ''}`,
			...rest,
			onfullscreenchange: onFullScreenChange,
			[$.STYLE]: { '--cols': $$props.cols }
		}),
		void 0,
		void 0,
		void 0,
		'svelte-1kvaajo'
	);

	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.snippet(node_1, () => $$props.children);
			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent);
		});
	}

	var input = $.sibling(node, 2);

	$.remove_input_defaults(input);
	$.next(2);
	$.reset(div);
	$.bind_this(div, ($$value) => groupEl = $$value, () => groupEl);
	$.template_effect(() => $.set_attribute(input, 'id', `codeblock-group-${groupContext.id ?? ''}-fullscreen`));
	$.bind_checked(input, () => $.get(fullscreen), ($$value) => $.set(fullscreen, $$value));
	$.append($$anchor, div);
	$.pop();
}