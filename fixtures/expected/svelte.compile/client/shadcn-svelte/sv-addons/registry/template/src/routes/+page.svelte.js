import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import HelloWorld from "$lib/registry/blocks/hello-world/hello-world.svelte";
import ExampleForm from "$lib/registry/blocks/example-form/example-form.svelte";
import PokemonPage from "$lib/registry/blocks/complex-component/+page.svelte";
import ExampleCard from "$lib/registry/blocks/example-with-css/example-card.svelte";

var root = $.from_html(`<div class="mx-auto flex min-h-svh max-w-3xl flex-col gap-8 px-4 py-8"><header class="flex flex-col gap-1"><h1 class="text-3xl font-bold tracking-tight">Custom Registry</h1> <p class="text-muted-foreground">A custom registry for distributing code using shadcn-svelte.</p></header> <main class="flex flex-1 flex-col gap-8"><div class="relative flex min-h-[450px] flex-col gap-4 rounded-lg border p-4"><div class="flex items-center justify-between"><h2 class="text-muted-foreground text-sm sm:ps-3">A simple hello world component</h2></div> <div class="relative flex min-h-[400px] items-center justify-center"><!></div></div> <div class="relative flex min-h-[450px] flex-col gap-4 rounded-lg border p-4"><div class="flex items-center justify-between"><h2 class="text-muted-foreground text-sm sm:ps-3">A contact form with Zod validation.</h2></div> <div class="relative flex min-h-[500px] items-center justify-center"><!></div></div> <div class="relative flex min-h-[450px] flex-col gap-4 rounded-lg border p-4"><div class="flex items-center justify-between"><h2 class="text-muted-foreground text-sm sm:ps-3">A complex component showing hooks, libs and components.</h2></div> <div class="relative flex min-h-[400px] items-center justify-center"><!></div></div> <div class="relative flex min-h-[450px] flex-col gap-4 rounded-lg border p-4"><div class="flex items-center justify-between"><h2 class="text-muted-foreground text-sm sm:ps-3">A login form with a CSS file.</h2></div> <div class="relative flex min-h-[400px] items-center justify-center"><!></div></div></main></div>`);

export default function _page($$anchor) {
	var // This page displays items from the custom registry.
	// You are free to implement this with your design as needed.
	div = root();

	var main = $.sibling($.child(div), 2);
	var div_1 = $.child(main);
	var div_2 = $.sibling($.child(div_1), 2);
	var node = $.child(div_2);

	HelloWorld(node, {});
	$.reset(div_2);
	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);
	var div_4 = $.sibling($.child(div_3), 2);
	var node_1 = $.child(div_4);

	ExampleForm(node_1, {});
	$.reset(div_4);
	$.reset(div_3);

	var div_5 = $.sibling(div_3, 2);
	var div_6 = $.sibling($.child(div_5), 2);
	var node_2 = $.child(div_6);

	PokemonPage(node_2, {});
	$.reset(div_6);
	$.reset(div_5);

	var div_7 = $.sibling(div_5, 2);
	var div_8 = $.sibling($.child(div_7), 2);
	var node_3 = $.child(div_8);

	ExampleCard(node_3, {});
	$.reset(div_8);
	$.reset(div_7);
	$.reset(main);
	$.reset(div);
	$.append($$anchor, div);
}