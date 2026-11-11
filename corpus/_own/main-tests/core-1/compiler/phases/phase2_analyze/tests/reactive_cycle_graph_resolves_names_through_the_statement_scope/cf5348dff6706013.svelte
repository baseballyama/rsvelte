<script>
let a = 0;
let b = 0;
$: a = (() => b)();
$: b = a + 1;
</script>
<b>{a}{b}</b>