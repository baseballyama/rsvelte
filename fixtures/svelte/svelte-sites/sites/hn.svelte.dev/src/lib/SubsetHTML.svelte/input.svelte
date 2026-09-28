<script lang="ts">
	import { parse, type Inline } from './htmlSubsetParse';
	import { resolve } from '$app/paths';
	const { content }: { content: string } = $props();

	const parsedContent = $derived(parse(content));

	type PossiblyRewrittenUrl = {
		rel: 'external' | undefined;
		href: string;
	};
	const HN_HOSTNAME = 'news.ycombinator.com' as const;
	function tryRewriteLink(originalUrl: URL): PossiblyRewrittenUrl {
		const { hostname, pathname, searchParams, hash, href } = originalUrl;
		if (hostname === HN_HOSTNAME && pathname === '/item') {
			// for the purposes of typescript control flow,
			// .has() does not impact .get()
			const itemId = searchParams.get('id');
			if (itemId) {
				// only support rewriting /item?id= links
				// which actually covers most legitimate uses
				return {
					href: `${resolve('/item/[id=numeric]', {
						id: itemId as `${number}`
					})}${hash}`,
					rel: undefined
				};
			}
		}
		// otherwise spit back original
		return { href, rel: 'external' };
	}
</script>

{#snippet inline(child: Inline)}
	{#if child.type === 'text'}
		{child.text}
	{:else if child.type === 'link'}
		{@const originalUrl = new URL(child.href)}
		{#if ['http:', 'https:'].includes(originalUrl.protocol)}
			{@const { href, rel } = tryRewriteLink(originalUrl)}
			<a {href} {rel}>{child.text}</a>
		{:else}
			<!-- link might be other protocol like `javascript:` so bail out and do best effort render -->
			<del>{child.text}</del>
		{/if}
	{:else if child.type === 'italic'}
		{#each child.children as subchild}
			{@render inline(subchild)}
		{/each}
	{/if}
{/snippet}

{#each parsedContent as block}
	{#if block.type === 'paragraph'}
		<p>
			{#each block.children as child}
				{@render inline(child)}
			{/each}
		</p>
	{:else}
		<pre><code>{block.text}</code></pre>
	{/if}
{/each}
