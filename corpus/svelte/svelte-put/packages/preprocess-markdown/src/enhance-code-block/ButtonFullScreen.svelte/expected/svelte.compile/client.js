import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { CodeBlockGroupContext } from './CodeBlockGroup.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'id', 'codeblock']);
var root = $.from_html(`<input class="codeblock-fullscreen sr-only svelte-qk5f0o" type="checkbox"/>`);
var root_1 = $.from_html(`<label><span class="sr-only svelte-qk5f0o">Toggle full screen</span> <!> <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentcolor" viewBox="0 0 256 256" class="svelte-qk5f0o"><path class="maximize svelte-qk5f0o" d="M216,48V88a8,8,0,0,1-16,0V56H168a8,8,0,0,1,0-16h40A8,8,0,0,1,216,48ZM88,200H56V168a8,8,0,0,0-16,0v40a8,8,0,0,0,8,8H88a8,8,0,0,0,0-16Zm120-40a8,8,0,0,0-8,8v32H168a8,8,0,0,0,0,16h40a8,8,0,0,0,8-8V168A8,8,0,0,0,208,160ZM88,40H48a8,8,0,0,0-8,8V88a8,8,0,0,0,16,0V56H88a8,8,0,0,0,0-16Z"></path><path class="minimize svelte-qk5f0o" d="M152,96V48a8,8,0,0,1,16,0V88h40a8,8,0,0,1,0,16H160A8,8,0,0,1,152,96ZM96,152H48a8,8,0,0,0,0,16H88v40a8,8,0,0,0,16,0V160A8,8,0,0,0,96,152Zm112,0H160a8,8,0,0,0-8,8v48a8,8,0,0,0,16,0V168h40a8,8,0,0,0,0-16ZM96,40a8,8,0,0,0-8,8V88H48a8,8,0,0,0,0,16H96a8,8,0,0,0,8-8V48A8,8,0,0,0,96,40Z"></path></svg></label>`);

export default function ButtonFullScreen($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	let fullscreen = $.state(false);
	const groupContext = CodeBlockGroupContext.get();

	function onFullScreenChange() {
		$.set(fullscreen, !!document.fullscreenElement);
	}

	function goFullscreen() {
		if (!document.fullscreenElement) {
			if (groupContext?.node) {
				groupContext.node.requestFullscreen();
			} else {
				$$props.codeblock?.requestFullscreen();
			}
		} else if (document.exitFullscreen) {
			document.exitFullscreen();
		}
	}

	function onKeyDown(e) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			goFullscreen();
		}
	}

	function onClick(e) {
		e.preventDefault();
		goFullscreen();
	}

	onMount(() => {
		document.addEventListener('fullscreenchange', onFullScreenChange);

		return () => {
			document.removeEventListener('fullscreenchange', onFullScreenChange);
		};
	});

	var label = root_1();

	$.attribute_effect(
		label,
		() => ({
			for: $$props.id,
			...rest,
			onclick: onClick,
			onkeydown: onKeyDown
		}),
		void 0,
		void 0,
		void 0,
		'svelte-qk5f0o'
	);

	var node = $.sibling($.child(label), 2);

	{
		var consequent = ($$anchor) => {
			var input = root();

			$.remove_input_defaults(input);
			$.template_effect(() => $.set_attribute(input, 'id', $$props.id));
			$.bind_checked(input, () => $.get(fullscreen), ($$value) => $.set(fullscreen, $$value));
			$.append($$anchor, input);
		};

		$.if(node, ($$render) => {
			if (!groupContext) $$render(consequent);
		});
	}

	$.next(2);
	$.reset(label);
	$.append($$anchor, label);
	$.pop();
}