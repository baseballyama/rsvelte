import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Code from "docs/Code.svelte";
import { darkMode } from "dark";

var root = $.from_html(
	`<h4 class="pb-8">Dark mode</h4> <p>Smelte uses css pseudo-class variant <a class="a" href="https://tailwindcss.com/docs/configuring-variants/">feature</a> of Tailwind to enable dark mode. Basic dark mode switch looks like this:</p> <!> <p>This will append <span class="code-inline">mode-dark</span> class to the document body which will enable all generated classes preceded by
  pseudo-class "dark:". By default smelte generates following variants:</p> <!> <p>Now you can use dark theme classes like <span class="code-inline">dark:bg-white</span> (try using the theme toggle on the top right).</p> <div class="duration-200 ease-in p-10 my-10 bg-black dark:bg-white text-white
  dark:text-black"> </div> <!> <p>If you don't need dark mode at all, you can pass <span class="code-inline">darkMode: false</span> to the smelte-rollup-plugin and it will generate no extra CSS.</p>`,
	1
);

export default function Dark_mode($$anchor) {
	const $darkMode = () => $.store_get(darkMode, '$darkMode', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 4);

	Code(node, {
		code: `<button bind:value={$darkMode}>Toggle dark mode</button>`
	});

	var node_1 = $.sibling(node, 4);

	Code(node_1, {
		code: `
backgroundColor: ["dark", "dark-hover", "hover"],
borderColor: ["dark", "dark-focus"],
textColor: ["dark", "dark-hover", "dark-active"]
`
	});

	var div = $.sibling(node_1, 4);
	var text = $.only_child(div);
	var node_2 = $.sibling(div, 2);

	Code(node_2, {
		code: `
<div class="duration-200 ease-in p-10 my-10 bg-black dark:bg-white text-white dark:text-black">
  I am a {$darkMode ? "dark" : "light"} div.
</div>
`
	});

	$.next(2);
	$.template_effect(() => $.set_text(text, `I am a ${$darkMode() ? 'dark' : 'light'} div.`));
	$.append($$anchor, fragment);
	$$cleanup();
}