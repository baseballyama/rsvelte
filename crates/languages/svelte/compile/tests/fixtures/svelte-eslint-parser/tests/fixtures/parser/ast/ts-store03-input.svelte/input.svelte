<script lang="ts">
	import { Writable, Readable } from 'svelte/store';
	let maybeUndef: Writable<number> | undefined
	let maybeNull: Readable<string> | null
	let maybeNullAndStr: Readable<boolean> | null | string

	export function fn() {
		$maybeUndef;
		$maybeNull;
		$maybeNullAndStr;
	}
</script>
{$maybeUndef}
{$maybeNull}
{$maybeNullAndStr}
