import * as $ from 'svelte/internal/server';
import Button from "../buttons/Button.svelte";
import Rating from "./Rating.svelte";

export default function RatingComment($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, evaluation, helpfullink, abuselink, comment } = $$props;

		$$renderer.push(`<article><div class="mb-4 flex items-center space-x-4 rtl:space-x-reverse"><img class="h-10 w-10 rounded-full"${$.attr('src', comment.user.img.src)}${$.attr('alt', comment.user.img.alt)}/> <div class="space-y-1 font-medium dark:text-white"><p>${$.escape(comment.user.name)} <time datetime="2014-08-16 19:00" class="block text-sm text-gray-500 dark:text-gray-400">${$.escape(comment.user.joined)}</time></p></div></div> <div class="mb-1 flex items-center">`);

		{
			function text($$renderer) {
				$$renderer.push(`<p class="ms-2 pt-1 text-sm font-medium text-gray-500 dark:text-gray-400">${$.escape(comment.rating)} out of ${$.escape(comment.total)}</p>`);
			}

			Rating($$renderer, {
				total: comment.total,
				rating: comment.rating,
				text,
				$$slots: { text: true }
			});
		}

		$$renderer.push(`<!----> `);

		if (comment.heading) {
			$$renderer.push(`<!--[0--><h3 class="ms-2 text-sm font-semibold text-gray-900 dark:text-white">${$.escape(comment.heading)}</h3>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> `);

		if (comment.address || comment.datetime) {
			$$renderer.push(`<!--[0--><footer class="mb-5 text-sm text-gray-500 dark:text-gray-400"><p>Reviewed in ${$.escape(comment.address)} on ${$.escape(comment.datetime)}</p></footer>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);
		children($$renderer);
		$$renderer.push(`<!----> <aside><p class="mt-1 text-xs text-gray-500 dark:text-gray-400">`);

		if (evaluation) {
			$$renderer.push('<!--[0-->');
			evaluation($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></p> `);

		if (helpfullink || abuselink) {
			$$renderer.push(`<!--[0--><div class="mt-3 flex items-center space-x-3 divide-x divide-gray-200 rtl:space-x-reverse rtl:divide-x-reverse dark:divide-gray-600">`);

			if (helpfullink) {
				$$renderer.push('<!--[0-->');

				Button($$renderer, {
					size: 'xs',
					href: '/',
					color: 'dark',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Helpful`);
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (abuselink) {
				$$renderer.push(`<!--[0--><a${$.attr('href', abuselink)} class="text-primary-600 dark:text-primary-500 ps-4 text-sm font-medium hover:underline">Report abuse</a>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></aside></article>`);
	});
}