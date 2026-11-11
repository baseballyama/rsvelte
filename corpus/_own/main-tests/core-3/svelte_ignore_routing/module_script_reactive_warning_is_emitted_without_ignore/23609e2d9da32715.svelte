<script module>
let count = 0;
</script>
<script>
$: doubled = count * 2;
count = count + 1;
</script>
{doubled}