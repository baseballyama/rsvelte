import * as $ from 'svelte/internal/server';
import SubsetHTML from '$lib/SubsetHTML.svelte';
import CommentElement from './Comment.svelte';
import { resolve } from '$app/paths';
import { timeAgo } from '$lib/utils';

export default function Comment($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { comment, now } = $$props;

		if (typeof comment !== null) {
			$$renderer.push(`<!--[0--><article${$.attr('id', `${comment.id}`)} class="comment svelte-bp2yyv"><details open="" class="svelte-bp2yyv"><summary class="svelte-bp2yyv"><div class="meta-bar svelte-bp2yyv" role="button" tabindex="0"><span class="meta svelte-bp2yyv"><a${$.attr('href', resolve('/user/[name]', { name: comment.author }))} class="svelte-bp2yyv">${$.escape(comment.author)}</a> ${$.escape(timeAgo(now - comment.created_at_i))}</span></div></summary> <div class="body svelte-bp2yyv">`);
			SubsetHTML($$renderer, { content: comment.text });
			$$renderer.push(`<!----></div> `);

			if (comment.children && comment.children.length > 0) {
				$$renderer.push(`<!--[0--><ul class="children svelte-bp2yyv"><!--[-->`);

				const each_array = $.ensure_array_like(comment.children);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let child = each_array[$$index];

					$$renderer.push(`<li class="svelte-bp2yyv">`);
					CommentElement($$renderer, { comment: child, now });
					$$renderer.push(`<!----></li>`);
				}

				$$renderer.push(`<!--]--></ul>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></details></article>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}