<script>
  let type = 'button';
  let rest = {};
  let kind = 'submit';
</script>

<button type={kind}>dynamic ok</button>
<button type={'submit'}>mustache literal ok</button>
<button type="a{kind}">mixed ok</button>
<button {type}>shorthand ok</button>
<button {...rest}>spread ok</button>
<button {...rest} type="foo">spread plus invalid static</button>
