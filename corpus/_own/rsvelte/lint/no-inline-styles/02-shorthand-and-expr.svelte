<script>
  let style = 'color: red';
</script>

<div {style}>shorthand, ok (not a SvelteAttribute)</div>
<div style={style}>expression attr, flag</div>
<div style>boolean style attr, flag</div>
<div style="">empty style attr, flag</div>
