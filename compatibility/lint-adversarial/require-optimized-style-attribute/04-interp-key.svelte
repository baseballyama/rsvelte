<script>
  let prop = 'color';
  let n = 'moz';
</script>

<div style="{prop}: red">key interpolation</div>
<div style="{prop}: red; margin: 0">key then static</div>
<div style="-{n}-appearance: none">interp inside prop name</div>
<div style="margin: 0; {prop}: red">static then key interpolation</div>
