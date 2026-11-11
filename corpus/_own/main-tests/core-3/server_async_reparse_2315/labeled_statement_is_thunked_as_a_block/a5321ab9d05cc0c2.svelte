<script>
let a = await fetch('x');
let n = 0;
outer: for (const q of [1]) { n += q; }
</script>
{a}{n}