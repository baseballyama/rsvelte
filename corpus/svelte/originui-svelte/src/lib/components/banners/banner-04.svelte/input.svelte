<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Eclipse from '@lucide/svelte/icons/eclipse';
</script>

<div class="dark bg-muted text-foreground px-4 py-3">
	<div class="flex flex-col justify-between gap-2 md:flex-row">
		<div class="flex grow gap-3">
			<Eclipse class="mt-0.5 shrink-0 opacity-60" size={16} aria-hidden="true" />
			<div class="flex grow flex-col justify-between gap-2 md:flex-row md:items-center">
				<p class="text-sm">We just added something awesome to make your experience even better.</p>
				<a href="#title" class="group text-sm font-medium whitespace-nowrap">
					Learn more<ArrowRight
						class="ms-1 -mt-0.5 inline-flex opacity-60 transition-transform group-hover:translate-x-0.5"
						size={16}
						aria-hidden="true"
					/>
				</a>
			</div>
		</div>
	</div>
</div>
