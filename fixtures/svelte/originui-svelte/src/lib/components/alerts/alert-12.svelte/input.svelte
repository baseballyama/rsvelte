<script lang="ts">
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
</script>

<div class="rounded-lg border border-red-500/50 px-4 py-3 text-red-600">
	<div class="flex gap-3">
		<CircleAlert class="mt-0.5 shrink-0 opacity-60" size={16} aria-hidden="true" />
		<div class="grow space-y-1">
			<p class="text-sm font-medium">Password does not meet requirements:</p>
			<ul class="list-inside list-disc text-sm opacity-80">
				<li>Minimum 8 characters</li>
				<li>Inlcude a special character</li>
			</ul>
		</div>
	</div>
</div>
