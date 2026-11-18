<script>
  function fn(s) {
    return s;
  }
</script>

<div style="{fn('color: red')}; color: blue">call arg is opaque upstream</div>
<div style="{fn('color: red')}; margin: 0">call arg no dupe either way</div>
