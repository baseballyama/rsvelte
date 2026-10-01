<script>
  let names = $state(["Ada", "Grace", "Barbara"]);
</script>

<ul>
  {#each names as name}
    <li>{name}</li>
  {/each}
</ul>
