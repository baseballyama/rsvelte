<script lang="ts">
type T0 = { a: T1; b: T2; c: T3; d: T4; e: T5 };
type T1 = { b: T2; c: T3; d: T4; e: T5 };
type T2 = { c: T3; d: T4; e: T5 };
type T3 = { d: T4; e: T5 };
type T4 = { e: T5 };
type T5 = string;
let { a }: T0 = $props();
</script>
<p>{a}</p>