<script>
  let on = true;
</script>

<div style="{on && 'color: red'} color: blue">logical branch dupes static</div>
<div style="{on || 'padding: 0'} padding: 1px">logical rhs dupes static</div>
