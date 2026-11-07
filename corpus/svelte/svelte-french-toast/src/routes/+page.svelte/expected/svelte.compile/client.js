import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import toast, { Toaster } from '../lib';
import 'prismjs';
import 'prism-svelte';
import demoCode from '../www/demo-code';
import Copy from '../www/Copy.svelte';
import Examples from '../www/Examples.svelte';
import pkg from '../../package.json';

var root = $.from_html(`<div class="flex space-x-2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#55aa88" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> <p> </p></div>`);
var root_1 = $.from_html(`<label><input type="radio" name="installers" class="svelte-1uha8ag"/> </label>`);
var root_2 = $.from_html(`<div><code class="language-shell svelte-1uha8ag"> </code> <!></div>`);
var root_3 = $.from_html(`<!> <div class="py-24 bg-[#faf6f4] border-b-4"><div class="container max-w-xl flex flex-col items-center mx-auto text-center"><img class="h-16 mb-10" src="favicon.png" alt=""/> <div class="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-3 mb-10 text-white"><div class="p-4 text-xl md:text-2xl font-extrabold bg-[#322f35] uppercase tracking-widest rounded-xl -rotate-2 shadow-lg">Svelte</div> <div class="p-4 text-xl md:text-2xl font-extrabold bg-[#fd6819] uppercase tracking-widest rounded-xl rotate-3 shadow-lg">French</div> <div class="p-4 text-xl md:text-2xl font-extrabold bg-[#322f35] uppercase tracking-widest rounded-xl -rotate-2 shadow-lg">Toast</div></div> <h1 class="font-bold text-3xl md:text-5xl">Buttery smooth toast notifications.</h1> <p class="mt-10 text-lg md:text-xl max-w-prose">Lightweight, customizable, and beautiful by default.<br/>Inspired by <a href="https://react-hot-toast.com" class="font-medium underline decoration-dotted underline-offset-4">React&nbsp;Hot&nbsp;Toast</a>.</p> <div class="flex items-center mt-10 space-x-4"><button class="flex items-center space-x-2 text-lg py-2 font-bold px-5 rounded-xl bg-amber-300 border-2 border-amber-400 shadow"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clip-rule="evenodd"></path></svg> <span>Launch toast</span></button> <a href="https://github.com/kbrgl/svelte-french-toast" class="flex items-center space-x-2 text-gray-500"><svg class="h-5 w-5" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>GitHub</title><path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path></svg> <span>Source</span></a></div> <p class="mt-5 text-sm border rounded-full px-2 py-1 text-gray-500"><a href="https://npmjs.com/package/svelte-french-toast"> </a></p> <div class="grid grid-cols-2 md:grid-cols-3 gap-4 self-stretch mt-10 font-medium"></div></div></div> <div class="container mx-auto max-w-2xl py-10"><section><div class="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4"><p class="text-xl font-bold">1. Install</p> <div class="space-x-1"></div></div> <!></section> <section class="mt-10"><p class="text-xl font-bold mb-4">2. Mount and use</p> <pre class="language-html svelte-1uha8ag"><code class="svelte-1uha8ag"> </code></pre> <!></section> <hr class="my-10"/> <h1 class="text-4xl font-bold mb-5">Examples</h1> <!> <p class="mt-24 mb-2 text-center"><a href="https://github.com/kbrgl/svelte-french-toast" class="underline">GitHub</a></p> <p class="text-center text-gray-500">© 2022 svelte-french-toast · Built by <a class="text-gray-800" href="https://kabirgoel.com">Kabir Goel</a></p></div>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];

	function launchToast() {
		toast.promise(
			new Promise((resolve, reject) => {
				setTimeout(Math.random() < 0.8 ? resolve : reject, 1000);
			}),
			{
				loading: 'Toasting bread...',
				success: 'Here’s your toast!',
				error: 'Your toast burned :('
			}
		);
	}

	const installers = [
		{ name: 'NPM', cmd: 'npm install svelte-french-toast' },
		{ name: 'PNPM', cmd: 'pnpm install svelte-french-toast' },
		{ name: 'Yarn', cmd: 'yarn add svelte-french-toast' },
		{ name: 'Bun', cmd: 'bun add svelte-french-toast' }
	];

	let installer = $.state($.proxy(installers[0].name));
	var fragment = root_3();
	var node = $.first_child(fragment);

	Toaster(node, {});

	var div = $.sibling(node, 2);
	var div_1 = $.child(div);
	var div_2 = $.sibling($.child(div_1), 8);
	var button = $.child(div_2);

	$.next(2);
	$.reset(div_2);

	var p = $.sibling(div_2, 2);
	var a = $.child(p);
	var text = $.only_child(a);

	$.reset(p);

	var div_3 = $.sibling(p, 2);

	$.each(
		div_3,
		20,
		() => [
			'Emoji Support',
			'Customizable',
			'Promise API',
			'Pause on hover',
			'Accessible',
			'Headless use'
		],
		$.index,
		($$anchor, feature) => {
			var div_4 = root();
			var p_1 = $.sibling($.child(div_4), 2);
			var text_1 = $.only_child(p_1, true);

			$.reset(div_4);
			$.template_effect(() => $.set_text(text_1, feature));
			$.append($$anchor, div_4);
		}
	);

	$.reset(div_3);
	$.reset(div_1);
	$.reset(div);

	var div_5 = $.sibling(div, 2);
	var section = $.child(div_5);
	var div_6 = $.child(section);
	var div_7 = $.sibling($.child(div_6), 2);

	$.each(div_7, 21, () => installers, $.index, ($$anchor, i) => {
		var label = root_1();
		let classes;
		var input = $.child(label);

		$.remove_input_defaults(input);

		var input_value;
		var text_2 = $.sibling(input);

		$.reset(label);

		$.template_effect(() => {
			$.set_attribute(label, 'for', $.get(i).name);
			classes = $.set_class(label, 1, 'svelte-1uha8ag', null, classes, { checked: $.get(i).name === $.get(installer) });
			$.set_attribute(input, 'id', $.get(i).name);

			if (input_value !== (input_value = $.get(i).name)) {
				input.value = (input.__value = input_value) ?? '';
			}

			$.set_text(text_2, ` ${$.get(i).name ?? ''}`);
		});

		$.bind_group(
			binding_group,
			[],
			input,
			() => {
				$.get(i).name;

				return $.get(installer);
			},
			($$value) => $.set(installer, $$value)
		);

		$.append($$anchor, label);
	});

	$.reset(div_7);
	$.reset(div_6);

	var node_1 = $.sibling(div_6, 2);

	$.each(node_1, 17, () => installers, $.index, ($$anchor, i) => {
		var div_8 = root_2();
		let classes_1;
		var code = $.child(div_8);
		var text_3 = $.only_child(code, true);
		var node_2 = $.sibling(code, 2);

		Copy(node_2, {
			get text() {
				return $.get(i).cmd;
			}
		});

		$.reset(div_8);

		$.template_effect(() => {
			classes_1 = $.set_class(div_8, 1, 'svelte-1uha8ag', null, classes_1, { hidden: $.get(installer) !== $.get(i).name });
			$.set_text(text_3, $.get(i).cmd);
		});

		$.append($$anchor, div_8);
	});

	$.reset(section);

	var section_1 = $.sibling(section, 2);
	var pre = $.sibling($.child(section_1), 2);
	var code_1 = $.child(pre);
	var text_4 = $.only_child(code_1, true);

	$.reset(pre);

	var node_3 = $.sibling(pre, 2);

	Copy(node_3, {
		get text() {
			return demoCode;
		}
	});

	$.reset(section_1);

	var node_4 = $.sibling(section_1, 6);

	Examples(node_4, {});
	$.next(4);
	$.reset(div_5);

	$.template_effect(() => {
		$.set_text(text, `Version ${pkg.version ?? ''}`);
		$.set_text(text_4, demoCode);
	});

	$.delegated('click', button, launchToast);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);