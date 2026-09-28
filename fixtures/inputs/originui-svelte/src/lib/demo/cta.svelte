<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
</script>

<section class="border-border relative isolate overflow-hidden border-t">
	<div class="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
		<div class="relative">
			<div class="bg-svelte/15 absolute top-0 left-32 size-28 rounded-full blur-2xl"></div>
			<div class="bg-svelte/15 absolute right-32 bottom-0 size-44 rounded-full blur-2xl"></div>

			<div class="relative z-10 text-center">
				<h2
					class="font-heading text-foreground mb-4 font-serif text-3xl/[1.1] tracking-tight text-balance md:text-4xl/[1.1]"
				>
					<span class="block">Discover/Contribute</span>
				</h2>

				<p class="text-muted-foreground mx-auto max-w-xl text-base text-balance">
					Explore the original Origin UI or contribute by suggesting new components and
					improvements.
				</p>

				<div class="mt-8 flex flex-wrap items-center justify-center gap-4">
					<Button
						variant="secondary"
						href="https://originui.com/"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="Send a suggestion to the Origin UI - Svelte repository"
					>
						Visit Original
					</Button>
					<Button
						href="https://github.com/max-got/originui-svelte/discussions"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="Visit the original Origin UI website"
					>
						Send Suggestion
					</Button>
				</div>
			</div>
		</div>
	</div>
</section>
