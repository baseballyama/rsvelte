<script lang="ts">
type T0 = { value: T1 };
type T1 = { value: T2 };
type T2 = { value: T3 };
type T3 = { value: T4 };
type T4 = { value: T5 };
type T5 = { value: T6 };
type T6 = { value: T7 };
type T7 = string;
let { value }: T0 = $props();
</script>
<p>{value}</p>