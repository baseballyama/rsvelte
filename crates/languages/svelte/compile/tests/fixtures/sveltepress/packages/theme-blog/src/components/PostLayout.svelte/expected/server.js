import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';
import { onMount } from 'svelte';
import { blogConfig } from 'virtual:sveltepress/blog-config';
import GiscusComments from './GiscusComments.svelte';
import PostHero from './PostHero.svelte';
import PostMeta from './PostMeta.svelte';
import PostNav from './PostNav.svelte';
import ReadingProgress from './ReadingProgress.svelte';
import RelatedPosts from './RelatedPosts.svelte';
import TableOfContents from './TableOfContents.svelte';

export default function PostLayout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { post, prev, next } = $$props;
		const siteTitle = blogConfig.title ?? 'Blog';
		const ogOrigin = blogConfig.base?.replace(/\/$/, '') ?? base;
		const ogImage = $.derived(() => `${ogOrigin}/og/${post.slug}.png`);

		const jsonLd = $.derived(() => {
			const authorName = post.author ?? blogConfig.author?.name;
			const data = {};

			data['@context'] = 'https://schema.org';
			data['@type'] = 'BlogPosting';
			data.headline = post.title;
			data.datePublished = post.date;
			data.image = ogImage();
			data.description = post.excerpt;
			data.keywords = post.tags.join(', ');

			if (authorName) {
				const a = {};

				a['@type'] = 'Person';
				a.name = authorName;
				data.author = a;
			}

			return JSON.stringify(data);
		});

		onMount(() => {
			const container = document.querySelector('.sp-post-content');

			if (!container) return;

			const handler = (e) => {
				const btn = e.target.closest('.svp-code-block--copy-btn');

				if (!btn) return;

				const code = btn.closest('.svp-code-block')?.querySelector('.shiki')?.textContent || '';

				navigator.clipboard.writeText(code);
				btn.classList.add('copied');
				setTimeout(() => btn.classList.remove('copied'), 2000);
			};

			container.addEventListener('click', handler);

			return () => container.removeEventListener('click', handler);
		});

		$.head('1str98b', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${$.escape(post.title)} | ${$.escape(siteTitle)}</title>`);
			});

			$$renderer.push(`<meta property="og:type" content="article"/> <meta property="og:title"${$.attr('content', post.title)}/> <meta name="description"${$.attr('content', post.excerpt)}/> <meta property="og:description"${$.attr('content', post.excerpt)}/> <meta property="og:image"${$.attr('content', ogImage())}/> <meta property="article:published_time"${$.attr('content', post.date)}/> `);

			if (post.author) {
				$$renderer.push(`<!--[0--><meta property="article:author"${$.attr('content', post.author)}/>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <!--[-->`);

			const each_array = $.ensure_array_like(post.tags);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let t = each_array[$$index];

				$$renderer.push(`<meta property="article:tag"${$.attr('content', t)}/>`);
			}

			$$renderer.push(`<!--]--> ${$.html(`<${'script'} type="application/ld+json">${jsonLd()}</${'script'}>`)}`);
		});

		ReadingProgress($$renderer, { target: '.sp-post' });
		$$renderer.push(`<!----> <article class="sp-post">`);
		PostHero($$renderer, { post });
		$$renderer.push(`<!----> <div class="sp-post__body svelte-1str98b"><div class="sp-post__content-wrap svelte-1str98b">`);
		PostMeta($$renderer, { post });
		$$renderer.push(`<!----> <div class="sp-post-content svelte-1str98b">${$.html(post.contentHtml)}</div> `);
		PostNav($$renderer, { prev, next });
		$$renderer.push(`<!----> `);

		if (post.related?.length) {
			$$renderer.push('<!--[0-->');
			RelatedPosts($$renderer, { posts: post.related });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);
		GiscusComments($$renderer, {});
		$$renderer.push(`<!----></div> <aside class="sp-post__toc svelte-1str98b">`);
		TableOfContents($$renderer, { category: post.category });
		$$renderer.push(`<!----></aside></div></article>`);
	});
}