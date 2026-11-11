<script module>
let count = 0;
</script>
<script>
// svelte-ignore reactive_declaration_module_script_dependency
$: doubled = count * 2;
count = count + 1;
</script>
{doubled}