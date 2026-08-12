# oxc_formatter_css canonicalizes a commented gradient list where Prettier preserves indentation

`oxc_formatter_css` formats the following valid CSS differently from Prettier's
CSS printer. The second `linear-gradient` intentionally has over-indented
arguments.

```css
a {
  background-image:
    /* one */
    linear-gradient(
      to right,
      rgba(0, 0, 0, 0.5) 0,
      rgba(255, 255, 255, 0.5) 100%
    ),
    /* two */
    linear-gradient(
        to left,
        rgba(0, 0, 0, 0.5) 0,
        rgba(255, 255, 255, 0.5) 100%
      );
}
```

Prettier preserves the relative indentation of the second function's arguments
(8 spaces, with its close at 6), whereas `oxc_formatter_css` canonicalizes them
to 6 and 4 spaces. Both tools are stable on their respective outputs.

The difference requires all of: a comma-separated declaration value, a comment
before the list item, and a multiline function whose arguments are
over-indented. Single-value and uncommented variants agree.

The Svelte formatter oracle reaches Prettier's CSS printer through
`prettier-plugin-svelte`; rsvelte formats embedded CSS with
`oxc_formatter_css`. Consequently a dedent/reindent wrapper cannot achieve
byte parity without reproducing Prettier-specific layout choices.

Desired upstream behavior: decide whether preserving the source-relative
indentation in this list-item case is intended, and if so provide matching
`oxc_formatter_css` output. The standalone CSS repro above does not depend on
Svelte.

Tracked in rsvelte issue #1681.
