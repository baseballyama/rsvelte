<script context="module" lang="ts">
	import { writable } from 'svelte/store'; // writable: <T>(value?: T | undefined, start?: StartStopNotifier<T> | undefined) => Writable<T>, writable: <T>(value?: T | undefined, start?: StartStopNotifier<T> | undefined) => Writable<T>
	const a = writable(0) // a: Writable<number>, writable(0): Writable<number>
	declare const $a: string // $a: string
</script>
<script lang="ts">
	const b = writable(0) // b: Writable<number>, writable(0): Writable<number>
	declare const $b: string // $b: string
</script>
{$a} <!-- $a: string -->
{$b} <!-- $b: string -->
