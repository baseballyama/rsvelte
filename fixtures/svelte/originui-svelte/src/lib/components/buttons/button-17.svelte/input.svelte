<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
</script>

<Button class="rounded-full py-0 ps-0">
	<div class="me-0.5 flex aspect-square h-full p-1.5">
		<enhanced:img
			class="size-[24px] rounded-full"
			src="/static/avatar.jpg"
			alt="Profile image"
			aria-hidden="true"
			loading="lazy"
		/>
	</div>
	@max_gotts
</Button>
