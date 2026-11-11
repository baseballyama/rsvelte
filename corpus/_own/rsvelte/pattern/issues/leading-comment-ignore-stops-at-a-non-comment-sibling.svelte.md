# `leading-comment-ignore-stops-at-a-non-comment-sibling.svelte`

**Issue:** warning probe

The negative control for the row above, and it needs its own component because the backward scan is per-tag: a `<div>` between the `svelte-ignore` comment and the `<script>` ends the run of candidates (`1-parse/state/element.js:334-339` skips whitespace-only `Text` and stops at anything else), so official still reports `non_reactive_update` here. A fix that pushes the ignore stack without that boundary — or one that scans the whole preceding fragment for a comment — silences this file and is indistinguishable from the correct one on the sibling.
