<script>
  let text = $state("");
  let focused = $state(false);

  function autofocus(node) {
    node.focus();
  }
</script>

<label>
  Name
  <input bind:value={text} {@attach autofocus} />
</label>
<p
  {@attach () => {
    focused = text.length > 0;
  }}
>
  {focused ? "typing" : "idle"}
</p>
