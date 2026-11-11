<script>
let foo;
function bar() { return 1; }
async function x() { return 2; }
</script>
{@render foo(await x(), bar())}