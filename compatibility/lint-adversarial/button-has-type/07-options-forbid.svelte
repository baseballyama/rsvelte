<script>
  /* eslint svelte/button-has-type: ["warn", { "submit": false, "reset": false }] */
</script>

<button type="submit">forbidden submit</button>
<button type="reset">forbidden reset</button>
<button type="button">still ok</button>
<button type="menu">invalid not forbidden</button>
