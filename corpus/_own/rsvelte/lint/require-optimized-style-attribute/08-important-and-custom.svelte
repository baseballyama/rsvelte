<script>
  let v = '1px';
</script>

<div style="color: red !important">important ok</div>
<div style="--x: {v}; color: var(--x)">custom property with interpolation value</div>
<div style="--x: 4px">static custom property ok</div>
