<script>
  const spread = {
    "on:click": 1,
    "bind:value": 2,
    "use:action": 3,
    "class:active": 4,
    "style:color": 5,
    "transition:fade": 6,
  };

  const text = "{#if x}{/each}{@html y}{@render z()}";
</script>

<div {...spread} data-directive="on:click" title="bind:value">{text}</div>
<b>{Object.keys(spread).length}</b>
