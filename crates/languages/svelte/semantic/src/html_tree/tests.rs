use super::{invalid_with_ancestor, invalid_with_parent};

// Expected values are upstream's `is_tag_valid_with_parent` and `is_tag_valid_with_ancestor`
// (svelte 5.57.3) on the same arguments.

#[test]
fn parent_messages_match_upstream() {
    let cases: [(&str, &str, Option<&str>); 15] = [
        (
            "li",
            "li",
            Some("`<li>` cannot be a direct child of `<li>`"),
        ),
        ("dd", "dt", Some("`<dd>` cannot be a child of `<dt>`")),
        ("div", "p", Some("`<div>` cannot be a child of `<p>`")),
        (
            "tr",
            "table",
            Some(
                "`<tr>` cannot be a child of `<table>`. `<table>` only allows these children: \
                 `<caption>`, `<colgroup>`, `<tbody>`, `<thead>`, `<tfoot>`, `<style>`, \
                 `<script>`, `<template>`",
            ),
        ),
        (
            "div",
            "tr",
            Some(
                "`<div>` cannot be a child of `<tr>`. `<tr>` only allows these children: \
                 `<th>`, `<td>`, `<style>`, `<script>`, `<template>`",
            ),
        ),
        (
            "td",
            "div",
            Some("`<td>` must be the child of a `<tr>`, not a `<div>`"),
        ),
        (
            "tr",
            "div",
            Some("`<tr>` must be the child of a `<thead>`, `<tbody>`, or `<tfoot>`, not a `<div>`"),
        ),
        (
            "tbody",
            "div",
            Some("`<tbody>` must be the child of a `<table>`, not a `<div>`"),
        ),
        ("html", "div", Some("`<html>` cannot be a child of `<div>`")),
        ("td", "tr", None),
        ("div", "template", None),
        ("x-a", "p", None),
        (
            "#text",
            "tr",
            Some(
                "`<#text>` cannot be a child of `<tr>`. `<tr>` only allows these children: \
                 `<th>`, `<td>`, `<style>`, `<script>`, `<template>`",
            ),
        ),
        ("li", "ul", None),
        ("span", "p", None),
    ];
    for (child, parent, expected) in cases {
        assert_eq!(
            invalid_with_parent(child, parent).as_deref(),
            expected,
            "<{child}> in <{parent}>"
        );
    }
}

#[test]
fn ancestor_messages_match_upstream() {
    let cases: [(&str, &[&str], Option<&str>); 9] = [
        (
            "div",
            &["span", "p"],
            Some("`<div>` cannot be a descendant of `<p>`"),
        ),
        (
            "dd",
            &["div", "dt"],
            Some("`<dd>` cannot be a descendant of `<dt>`"),
        ),
        ("dd", &["dl", "div", "dt"], None),
        ("dd", &["x-a", "dt"], None),
        (
            "div",
            &["x-a", "p"],
            Some("`<div>` cannot be a descendant of `<p>`"),
        ),
        (
            "p",
            &["dl", "p"],
            Some("`<p>` cannot be a descendant of `<p>`"),
        ),
        (
            "a",
            &["span", "a"],
            Some("`<a>` cannot be a descendant of `<a>`"),
        ),
        (
            "h2",
            &["div", "h1"],
            Some("`<h2>` cannot be a descendant of `<h1>`"),
        ),
        ("li", &["div", "li"], None),
    ];
    for (child, ancestors, expected) in cases {
        assert_eq!(
            invalid_with_ancestor(child, ancestors).as_deref(),
            expected,
            "<{child}> below {ancestors:?}"
        );
    }
}
