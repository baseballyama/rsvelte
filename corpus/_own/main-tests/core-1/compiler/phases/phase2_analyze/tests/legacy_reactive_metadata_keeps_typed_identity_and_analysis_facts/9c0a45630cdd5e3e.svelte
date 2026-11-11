<script>
let a = 1;
let b = 0;
$: b = a + 1;
$: { b++; console.log(a); }
</script>