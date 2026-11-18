<script>
  let cond = true;
  let c = 'red';
</script>

<div style={cond ? 'color: red' : 'color: blue'}>same-set branches, no dupe</div>
<div style:color={c} style="{cond ? 'color: red' : 'margin: 0'} background: x">
  directive dupes ternary branch
</div>
<div style="{cond ? 'color: red' : ''} color: blue">inline set then static dupe</div>
