<script lang="ts">
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
</script>

<div class="border-border rounded-lg border px-4 py-3">
	<p class="text-sm">
		<TriangleAlert
			class="me-3 -mt-0.5 inline-flex text-amber-500"
			size={16}
			aria-hidden="true"
		/>Some information is missing!
	</p>
</div>
