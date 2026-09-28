<script lang="ts">
	import { page } from '$app/state';
	import { appendix, chapters } from '$lib/site';

	let { active }: { active: string | null } = $props();

	const path = $derived(page.url.pathname.replace(/\/$/, '') || '/');
</script>

<nav aria-label="Learn の章" class="text-[14px] leading-[1.5]">
	<ol class="space-y-0.5">
		{#each chapters as c (c.slug)}
			{@const here = path === c.href}
			<li>
				<a
					href={c.href}
					class={['flex gap-3 py-1', here ? 'text-accent' : 'text-fg-2 hover:text-fg']}
					aria-current={here ? 'page' : undefined}
				>
					<span class="w-5 shrink-0 font-mono text-[12px] leading-[1.75] tracking-normal text-muted">{c.number}</span>
					<span>{c.title}</span>
				</a>
				{#if here && c.sections.length > 0}
					<ol class="mt-1 mb-2 ml-8 space-y-0.5 border-l border-line">
						{#each c.sections as s (s.id)}
							<li>
								<a
									href="#{s.id}"
									class={[
										'-ml-px block border-l py-0.5 pl-3 text-[13px]',
										active === s.id ? 'border-fg text-fg' : 'border-transparent text-muted hover:text-fg-2'
									]}>{s.title}</a
								>
							</li>
						{/each}
					</ol>
				{/if}
			</li>
		{/each}
	</ol>
	<p class="mt-6 mb-1 font-mono text-[12px] tracking-normal text-muted">付録</p>
	<ul class="space-y-0.5">
		{#each appendix as a (a.href)}
			<li>
				<a
					href={a.href}
					class={['block py-1 pl-8', path === a.href ? 'text-accent' : 'text-fg-2 hover:text-fg']}
					aria-current={path === a.href ? 'page' : undefined}>{a.title}</a
				>
			</li>
		{/each}
	</ul>
</nav>
