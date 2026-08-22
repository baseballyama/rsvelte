<script>
  let cond = true;
</script>

<div style={cond ? 'background-repeat: no-repeat; background: red' : 'color: blue'}>
  whole-value ternary: same-set decls
</div>
<div style="{cond ? 'background-repeat: no-repeat; background: red' : ''} color: blue">
  quoted ternary interpolation: same-set decls
</div>
<div style:background-repeat="no-repeat" style="{cond ? 'background: red' : ''}">
  directive longhand then ternary shorthand, flag
</div>
