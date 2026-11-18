<script>
export let seed = 1;
let mid = 0;
let out = 0;
$: out = mid + 1;
$: { mid = seed * 2 }
</script>

<p>{out}</p>
