<script lang="ts">
	import tippy from 'tippy.js';
	import Button from './Button.svelte';
	import type { Attachment } from 'svelte/attachments';

	let content = $state('Hello!');

	function tooltip(content: string): Attachment {
		return (element) => {
			const tooltip = tippy(element, { content });
			return tooltip.destroy;
		};
	}
</script>

<input bind:value={content} />

<Button {@attach tooltip(content)}>
	Hover me
</Button>