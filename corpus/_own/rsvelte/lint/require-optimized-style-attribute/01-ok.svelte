<script>
  let c = 'red';
  let x = 10;
</script>

<div style="color: red; margin: 0">static ok</div>
<div style="color: {c}">value interpolation ok</div>
<div style="width: calc(100% - {x}px)">interpolation inside calc ok</div>
<div style="color: {c}; background: {c}">two value interpolations ok</div>
<div style>boolean style, nothing to check</div>
<div style="">empty value, nothing to check</div>
