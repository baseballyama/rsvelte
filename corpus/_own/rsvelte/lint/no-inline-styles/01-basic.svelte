<script>
  let c = 'red';
</script>

<div style="color: red">attr flag</div>
<div style:color="red">directive flag</div>
<div style:color={c}>directive expr flag</div>
<div class="ok">no style ok</div>
<div style="color: {c}">attr with mustache flag</div>
