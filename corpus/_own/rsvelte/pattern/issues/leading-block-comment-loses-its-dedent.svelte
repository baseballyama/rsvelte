<script>
  /**
   * A block comment on the script's FIRST line. Upstream dedents a multi-line
   * block comment by its opener line's indentation (`onComment` in
   * 1-parse/acorn.js), but the script slice reaches the client formatter with
   * that first line's indentation already trimmed, so the dedent measured
   * nothing and these continuation lines kept the source indent on top of the
   * emitted one.
   * @type {number}
   */
  export let first = 1;

  /**
   * The control: an identical comment that is NOT on the first line. Its opener
   * line kept its indentation, so the dedent already worked here — a fix that
   * dedents unconditionally would break this one.
   * @type {number}
   */
  export let middle = 2;
</script>

<p>{first}{middle}</p>
