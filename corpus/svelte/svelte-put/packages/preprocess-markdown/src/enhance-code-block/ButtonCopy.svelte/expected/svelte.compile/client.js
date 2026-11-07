import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { fade } from 'svelte/transition';

export function copyCode(input) {
	const codeNode = input.node.getElementsByTagName('code')[0];

	if (!codeNode) return '';

	let text = '';

	for (const lineNode of codeNode.children) {
		// assuming shiki build output and transformers set up at mdsvex.config.js
		if (lineNode.dataset.lineDiff === '-') continue;

		text += (lineNode.textContent || '') + '\n';
	}

	return text;
}

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'trigger']);
var root = $.from_svg(`<path d="M168,152a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,152Zm-8-40H96a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16Zm56-64V216a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V48A16,16,0,0,1,56,32H92.26a47.92,47.92,0,0,1,71.48,0H200A16,16,0,0,1,216,48ZM96,64h64a32,32,0,0,0-64,0ZM200,48H173.25A47.93,47.93,0,0,1,176,64v8a8,8,0,0,1-8,8H88a8,8,0,0,1-8-8V64a47.93,47.93,0,0,1,2.75-16H56V216H200Z"></path>`);
var root_1 = $.from_svg(`<path d="M200,32H163.74a47.92,47.92,0,0,0-71.48,0H56A16,16,0,0,0,40,48V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V48A16,16,0,0,0,200,32Zm-72,0a32,32,0,0,1,32,32H96A32,32,0,0,1,128,32Zm72,184H56V48H82.75A47.93,47.93,0,0,0,80,64v8a8,8,0,0,0,8,8h80a8,8,0,0,0,8-8V64a47.93,47.93,0,0,0-2.75-16H200Z"></path>`);
var root_2 = $.from_html(`<button><span class="sr-only">Copy</span> <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentcolor" viewBox="0 0 256 256"><!></svg></button>`);

export default function ButtonCopy($$anchor, $$props) {
	$.push($$props, true);

	let trigger = $.prop($$props, 'trigger', 15),
		rest = $.rest_props($$props, rest_excludes);

	let timeoutId = undefined;
	let optimistic = $.state(false);

	function onClick() {
		$.set(optimistic, true);
	}

	function onMouseEnter() {
		clearTimeout(timeoutId);
	}

	function onMouseLeave() {
		timeoutId = setTimeout(
			() => {
				$.set(optimistic, false);
			},
			1800
		);
	}

	let hydrated = $.state(false);

	onMount(() => {
		$.set(hydrated, true);
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var button = root_2();

			$.attribute_effect(
				button,
				() => ({
					type: 'button',
					disabled: $.get(optimistic),
					onmouseleave: onMouseLeave,
					onmouseenter: onMouseEnter,
					onclick: onClick,
					...rest
				}),
				void 0,
				void 0,
				void 0,
				'svelte-qkn3x4'
			);

			var svg = $.sibling($.child(button), 2);
			var node_1 = $.child(svg);

			{
				var consequent = ($$anchor) => {
					var path = root();

					$.transition(1, path, () => fade, () => ({ duration: 150 }));
					$.append($$anchor, path);
				};

				var alternate = ($$anchor) => {
					var path_1 = root_1();

					$.transition(1, path_1, () => fade, () => ({ duration: 150 }));
					$.append($$anchor, path_1);
				};

				$.if(node_1, ($$render) => {
					if ($.get(optimistic)) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.reset(svg);
			$.reset(button);
			$.bind_this(button, ($$value) => trigger($$value), () => trigger());
			$.append($$anchor, button);
		};

		$.if(node, ($$render) => {
			if ($.get(hydrated)) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}