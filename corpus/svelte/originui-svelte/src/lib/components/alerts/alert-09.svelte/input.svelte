<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
</script>

<div class="border-border rounded-lg border px-4 py-3">
	<div class="flex gap-3">
		<TriangleAlert class="hrink-0 mt-0.5 text-amber-500" size={16} aria-hidden="true" />
		<div class="flex grow justify-between gap-3">
			<p class="text-sm">Some information is missing!</p>
			<a href="#title" class="group text-sm font-medium whitespace-nowrap">
				Link<ArrowRight
					class="ms-1 -mt-0.5 inline-flex opacity-60 transition-transform group-hover:translate-x-0.5"
					size={16}
					aria-hidden="true"
				/>
			</a>
		</div>
	</div>
</div>
