<script lang="ts">
	import { Writable, Readable } from 'svelte/store'; // Writable: any, Writable: any, Readable: any, Readable: any
	let maybeUndef: Writable<number> | undefined // maybeUndef: Writable<number> | undefined
	let maybeNull: Readable<string> | null // maybeNull: Readable<string> | null
	let maybeNullAndStr: Readable<boolean> | null | string // maybeNullAndStr: string | Readable<boolean> | null

	export function fn() { // fn: () => void
		$maybeUndef; // $maybeUndef: number | undefined
		$maybeNull; // $maybeNull: string | null
		$maybeNullAndStr; // $maybeNullAndStr: string | boolean | null
	}
</script>
{$maybeUndef} <!-- $maybeUndef: number | undefined -->
{$maybeNull} <!-- $maybeNull: string | null -->
{$maybeNullAndStr} <!-- $maybeNullAndStr: string | boolean | null -->
