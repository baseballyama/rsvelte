<svelte:options preserveWhitespace />

<script>
  let n = $state(1);
</script>

<div>three spaces</div>
<div>newline and tab</div>
<span>a</span> <span>b</span>
<span>c</span>
<span>d</span>
<pre>  pre content  </pre>
<b> {n} </b>
