import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CodeXml } from 'lucide-svelte';
import CodeExplorer from './CodeExplorer.svelte';
import { fade } from 'svelte/transition';
import { untrack } from 'svelte';
import { setCodeExampleContext } from './exampleContext.svelte';

var root = $.from_html(`<div class="absolute top-0 left-0 z-10 h-full w-full bg-linear-to-t from-blue-900 to-blue-900/50"></div>`);
var root_1 = $.from_html(`<div class="absolute top-0 left-0 flex h-full w-full flex-row items-center justify-center"><button class="border-orange/10 text-orange z-10 flex flex-row items-center justify-center gap-3 rounded-xs border bg-orange-800/50 px-2 py-1 text-sm backdrop-blur-md hover:bg-orange-800/70 hover:text-orange-400 focus:outline-hidden"><!> <span>Show Code</span></button></div>`);
var root_2 = $.from_html(`<div><!> <!> <!> <div class="flex-1 overflow-x-auto"><!></div></div>`);

export default function CodeWrapper($$anchor, $$props) {
	$.push($$props, true);

	let expanded = $.prop($$props, 'expanded', 15, false);
	let childrenElements = $.state($.proxy([]));

	const initialFilePath = untrack(() => $$props.showFile
		? $$props.filePaths.includes($$props.showFile) ? $$props.showFile : 'App.svelte'
		: 'App.svelte');

	const initialFileName = initialFilePath.split('/').pop() || 'App.svelte';
	let context = $.proxy({ currentFilePath: initialFileName });

	setCodeExampleContext(context);

	const setChildren = (node) => {
		// the first child in node.children is an astro slot, so we need the children of that
		const firstChild = node.children[0];

		if (firstChild) {
			$.set(
				childrenElements,
				Array.from(firstChild.children).filter((item) => {
					return item instanceof HTMLElement;
				}),
				true
			);
		}
	};

	$.user_effect(() => {
		const fullPath = `../../examples/${$$props.exampleBasePath}/${context.currentFilePath}`;

		// hide all children except the one that was selected
		$.get(childrenElements).forEach((child) => {
			const elPath = child.dataset.path;

			if (!elPath) return;

			// path is relative to the root of the example directory
			if (elPath === fullPath) {
				child.style.display = 'block';
			} else {
				child.style.display = 'none';
			}
		});
	});

	var div = root_2();
	var node_1 = $.child(div);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();

			$.transition(3, div_1, () => fade);
			$.append($$anchor, div_1);
		};

		$.if(node_1, ($$render) => {
			if (!expanded()) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_2 = root_1();
			var button = $.child(div_2);
			var node_3 = $.child(button);

			CodeXml(node_3, { class: 'h-5 w-5' });
			$.next(2);
			$.reset(button);
			$.reset(div_2);
			$.delegated('click', button, () => expanded(true));
			$.append($$anchor, div_2);
		};

		$.if(node_2, ($$render) => {
			if (!expanded()) $$render(consequent_1);
		});
	}

	var node_4 = $.sibling(node_2, 2);

	CodeExplorer(node_4, {
		get filePaths() {
			return $$props.filePaths;
		}
	});

	var div_3 = $.sibling(node_4, 2);
	var node_5 = $.child(div_3);

	$.snippet(node_5, () => $$props.children);
	$.reset(div_3);
	$.action(div_3, ($$node) => setChildren?.($$node));
	$.reset(div);

	$.template_effect(() => $.set_class(div, 1, $.clsx([
		'not-content relative flex w-full flex-col items-stretch overflow-hidden rounded-b-md! border-x border-b border-white/20 transition-all duration-700 ease-in-out will-change-[max-height] md:max-h-[80vh] md:flex-row',
		!expanded() && 'max-h-[100px]! overflow-hidden',
		$$props.hidePreview && 'rounded-md! border-t'
	])));

	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);