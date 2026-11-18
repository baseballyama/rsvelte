<script lang="ts">
	interface Props {
		onChange?: (value: string) => void;
	}

	let { onChange }: Props = $props();
</script>

<input oninput={(e) => onChange?.((e.target as HTMLInputElement).value)} />
