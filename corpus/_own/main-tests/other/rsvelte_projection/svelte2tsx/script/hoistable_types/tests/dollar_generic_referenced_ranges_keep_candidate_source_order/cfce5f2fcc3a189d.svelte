<script lang="ts">
interface First { first: true }
interface Second { second: true }
type A = $$Generic<Second>;
type B = $$Generic<First>;
export let value: A;
</script>
<p>{value}</p>