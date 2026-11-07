import * as $ from 'svelte/internal/server';
import Copy from './Copy.svelte';
import examples from './examples';

export default function Examples($$renderer) {
	let selected = 'Success';

	$$renderer.push(`<div class="grid grid-cols-2 md:grid-cols-3 gap-4 rounded-xl mb-5"><!--[-->`);

	const each_array = $.ensure_array_like(examples);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let example = each_array[$$index];

		$$renderer.push(`<label${$.attr('for', example.title)}${$.attr_class('cursor-pointer p-2 bg-gray-100 hover:border-blue-500 rounded-xl transition-colors border-2 border-transparent svelte-5alodk', void 0, { '_sft-checked': example.title === selected })}><input type="radio"${$.attr('id', example.title)} name="examples"${$.attr('value', example.title)}${$.attr('checked', selected === example.title, true)} class="svelte-5alodk"/> <span class="mr-1">${$.escape(example.emoji)}</span> <span class="font-medium">${$.escape(example.title)}</span></label>`);
	}

	$$renderer.push(`<!--]--></div> <!--[-->`);

	const each_array_1 = $.ensure_array_like(examples);

	for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
		let example = each_array_1[$$index_1];

		$$renderer.push(`<div${$.attr_class('', void 0, { 'hidden': example.title !== selected })}><div class="overflow-auto"><pre${$.attr_class(`language-${example.html ? 'svelte' : 'javascript'} h-80 table w-full`)}><code class="table-cell align-middle">${$.escape(example.snippet)}</code></pre></div> `);
		Copy($$renderer, { text: example.snippet });
		$$renderer.push(`<!----></div>`);
	}

	$$renderer.push(`<!--]-->`);
}