<!-- Shadowing where the outer binding is `$state`, which the server does not inline:
     separates "a shadow exists" from "the outer value reaches a template string". -->
<script>
	let s = $state(1);
	let n = $state(0);
</script>
<button onclick={() => { var s = 0; n = (typeof s).length; }}></button>
{s}{n}
