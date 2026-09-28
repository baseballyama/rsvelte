<script lang="ts">
	type Link = { links: { 'aria-label': string; href: string; label: string }[]; title: string };

	type Props = {
		footerLinks: Link[];
	};

	let { footerLinks }: Props = $props();
</script>

<footer
	class="before:bg-[linear-gradient(to_right,--theme(--color-svelte/.3),--theme(--color-border)_200px,--theme(--color-border)_calc(100%-200px),--theme(--color-svelte/.3))] relative before:absolute before:-inset-x-32 before:top-0 before:h-px"
>
	<div
		class="before:bg-svelte after:bg-svelte before:absolute before:-top-px before:-left-12 before:z-10 before:-ml-px before:size-[3px] after:absolute after:-top-px after:-right-12 after:z-10 after:-mr-px after:size-[3px]"
		aria-hidden="true"
	></div>

	<div class="grid w-full max-w-6xl items-start gap-24 py-6 md:grid-cols-2">
		{#each footerLinks as section (section.title)}
			<div class="flex flex-col items-center gap-3 text-center">
				<h3 class="text-md text-muted-foreground font-serif tracking-wider">
					{section.title}
				</h3>
				<ul class="flex flex-col items-center gap-3">
					{#each section.links as link (link.href)}
						<li class="text-muted-foreground relative w-fit">
							<a
								href={link.href}
								aria-label={link['aria-label']}
								class="text-muted-foreground hover:text-foreground relative z-20 text-sm transition-colors"
							>
								{link.label}
							</a>
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>

	<div
		class="before:bg-[linear-gradient(to_right,--theme(--color-svelte/.3),--theme(--color-border)_200px,--theme(--color-border)_calc(100%-200px),--theme(--color-svelte/.3))] relative flex items-center justify-center py-4 before:absolute before:-inset-x-32 before:top-0 before:h-px"
	>
		<div
			class="before:bg-svelte after:bg-svelte before:absolute before:-top-px before:-left-12 before:z-10 before:-ml-px before:size-[3px] after:absolute after:-top-px after:-right-12 after:z-10 after:-mr-px after:size-[3px]"
			aria-hidden="true"
		></div>
		<div class=" flex items-center justify-center gap-3 text-sm">
			<span class="text-muted-foreground">Created by</span>
			<a
				class="group ring-background relative size-8 overflow-hidden rounded-full ring-2 transition-all hover:ring-4"
				href="https://x.com/max_gotts"
				target="_blank"
				rel="noopener noreferrer"
				aria-label="Visit Max's profile"
			>
				<enhanced:img
					class="absolute inset-0 object-cover object-center transition-transform duration-300 group-hover:scale-110"
					src="/static/avatar.jpg"
					alt="Max's profile"
					width="32"
					height="32"
					loading="lazy"
				/>
			</a>
		</div>
	</div>
</footer>
