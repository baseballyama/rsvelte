<!-- a `/*` that opens inside a quoted string, and a quote that opens inside a comment -->
<div style="content: '/* not a comment'; color: red">a</div>
<div style="color: /* it's a comment */ red; margin: 0">b</div>
<div style="content: &quot;/*&quot;; padding: 0">c</div>
<div style="color: red /* unterminated">d</div>
<div style="content: 'unterminated; color: blue">e</div>
<div style="/* leading */ color: red">f</div>
