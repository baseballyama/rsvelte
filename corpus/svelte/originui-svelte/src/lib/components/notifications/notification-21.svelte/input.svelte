<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import { toast } from 'svelte-sonner';
</script>

<Button
	variant="outline"
	onclick={() => {
		toast('Your request was completed!', {
			action: {
				label: 'Undo',
				onClick: () => console.info('Undo')
			},
			description: 'It was a long journey, but we made it!'
		});
	}}
>
	Show sonner
</Button>
