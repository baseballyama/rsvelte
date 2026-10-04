<svelte:options customElement="my-element"/>
<script>
let {value,...rest}=$props();
function change() { rest.other=1; rest.count++; let x; x=rest.other; return rest.other; }
</script>
<p>{rest.other} {rest.value} {rest['other']}</p>
