<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import FilesIcon from '@lucide/svelte/icons/files';
	import FilmIcon from '@lucide/svelte/icons/film';
</script>

<div class="inline-flex -space-x-px rounded-md shadow-2xs rtl:space-x-reverse">
	<Button
		class="rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10"
		variant="outline"
	>
		<FilesIcon class="-ms-1 opacity-60" size={16} aria-hidden="true" />
		Files
	</Button>
	<Button
		class="rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10"
		variant="outline"
	>
		<FilmIcon class="-ms-1 opacity-60" size={16} aria-hidden="true" />
		Media
	</Button>
	<Button
		class="rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10"
		variant="outline"
		size="icon"
		aria-label="Menu"
	>
		<EllipsisIcon size={16} aria-hidden="true" />
	</Button>
</div>
