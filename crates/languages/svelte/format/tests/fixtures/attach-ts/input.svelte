<script lang="ts">
	import type { Attachment } from 'svelte/attachments';

	let size = $state(12);

	const grow: Attachment<HTMLElement> = (node) => {
		node.style.fontSize = `${size}px`;
	};

	function label(text: string): Attachment<HTMLButtonElement> {
		return (node) => {
			node.ariaLabel = text;
		};
	}
</script>

<p {@attach grow}>sized</p>
<button {@attach label('grow')} onclick={() => (size += 1)}>+</button>
<div {@attach (node: HTMLDivElement) => node.scrollTo(0, size)}></div>
<span {@attach label(size)}></span>
