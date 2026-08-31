//! HTML tag and attribute data, generated — do not edit.
//!
//! Source: vscode-html-languageservice@5.4.0 (MIT), the build `package.json` `main`
//! resolves to, which is the one the official language server loads.
//!
//!   lib/umd/languageFacts/data/webCustomData.js
//!     sha256 34c1cf092562346e6a40a50567b6b22f0139981fe07f46d7f357820e4d2ecfd5
//!   lib/umd/languageFacts/dataProvider.js
//!     sha256 ae8c30b8cc165afd538198dac6b607f8a46b9d98624ee6811cc8ca86982be0d4
//!
//! Regenerate with `node scripts/dev/generate-html-data.mjs`.

/// A documentation link `generateDocumentation` renders after the prose.
pub struct Reference {
    pub name: &'static str,
    pub url: &'static str,
}

/// `status.baseline`, which is `false` rather than a string when a feature is
/// not baseline at all.
pub enum Baseline {
    Limited,
    Low,
    High,
}

pub struct Status {
    pub baseline: Baseline,
    pub low_date: Option<&'static str>,
    pub high_date: Option<&'static str>,
}

pub struct Value {
    pub name: &'static str,
    pub description: Option<&'static str>,
}

pub struct Attribute {
    pub name: &'static str,
    pub description: Option<&'static str>,
    pub value_set: Option<&'static str>,
    pub references: &'static [Reference],
    pub browsers: &'static [&'static str],
    pub status: Option<Status>,
}

pub struct Tag {
    pub name: &'static str,
    pub description: Option<&'static str>,
    pub void_element: bool,
    pub attributes: &'static [Attribute],
    pub references: &'static [Reference],
    pub browsers: &'static [&'static str],
    pub status: Option<Status>,
}

pub struct ValueSet {
    pub name: &'static str,
    pub values: &'static [Value],
}

pub const VERSION: &str = "1.1";

pub const BASELINE_LIMITED_IMAGE: &str = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTAiIHZpZXdCb3g9IjAgMCA1NDAgMzAwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxzdHlsZT4KICAgIC5ncmF5LXNoYXBlIHsKICAgICAgZmlsbDogI0M2QzZDNjsgLyogTGlnaHQgbW9kZSAqLwogICAgfQoKICAgIEBtZWRpYSAocHJlZmVycy1jb2xvci1zY2hlbWU6IGRhcmspIHsKICAgICAgLmdyYXktc2hhcGUgewogICAgICAgIGZpbGw6ICM1NjU2NTY7IC8qIERhcmsgbW9kZSAqLwogICAgICB9CiAgICB9CiAgPC9zdHlsZT4KICA8cGF0aCBkPSJNMTUwIDBMMjQwIDkwTDIxMCAxMjBMMTIwIDMwTDE1MCAwWiIgZmlsbD0iI0YwOTQwOSIvPgogIDxwYXRoIGQ9Ik00MjAgMzBMNTQwIDE1MEw0MjAgMjcwTDM5MCAyNDBMNDgwIDE1MEwzOTAgNjBMNDIwIDMwWiIgY2xhc3M9ImdyYXktc2hhcGUiLz4KICA8cGF0aCBkPSJNMzMwIDE4MEwzMDAgMjEwTDM5MCAzMDBMNDIwIDI3MEwzMzAgMTgwWiIgZmlsbD0iI0YwOTQwOSIvPgogIDxwYXRoIGQ9Ik0xMjAgMzBMMTUwIDYwTDYwIDE1MEwxNTAgMjQwTDEyMCAyNzBMMCAxNTBMMTIwIDMwWiIgY2xhc3M9ImdyYXktc2hhcGUiLz4KICA8cGF0aCBkPSJNMzkwIDBMNDIwIDMwTDE1MCAzMDBMMTIwIDI3MEwzOTAgMFoiIGZpbGw9IiNGMDk0MDkiLz4KPC9zdmc+";
pub const BASELINE_LOW_IMAGE: &str = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTAiIHZpZXdCb3g9IjAgMCA1NDAgMzAwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxzdHlsZT4KICAgIC5ibHVlLXNoYXBlIHsKICAgICAgZmlsbDogI0E4QzdGQTsgLyogTGlnaHQgbW9kZSAqLwogICAgfQoKICAgIEBtZWRpYSAocHJlZmVycy1jb2xvci1zY2hlbWU6IGRhcmspIHsKICAgICAgLmJsdWUtc2hhcGUgewogICAgICAgIGZpbGw6ICMyRDUwOUU7IC8qIERhcmsgbW9kZSAqLwogICAgICB9CiAgICB9CgogICAgLmRhcmtlci1ibHVlLXNoYXBlIHsKICAgICAgICBmaWxsOiAjMUI2RUYzOwogICAgfQoKICAgIEBtZWRpYSAocHJlZmVycy1jb2xvci1zY2hlbWU6IGRhcmspIHsKICAgICAgICAuZGFya2VyLWJsdWUtc2hhcGUgewogICAgICAgICAgICBmaWxsOiAjNDE4NUZGOwogICAgICAgIH0KICAgIH0KCiAgPC9zdHlsZT4KICA8cGF0aCBkPSJNMTUwIDBMMTgwIDMwTDE1MCA2MEwxMjAgMzBMMTUwIDBaIiBjbGFzcz0iYmx1ZS1zaGFwZSIvPgogIDxwYXRoIGQ9Ik0yMTAgNjBMMjQwIDkwTDIxMCAxMjBMMTgwIDkwTDIxMCA2MFoiIGNsYXNzPSJibHVlLXNoYXBlIi8+CiAgPHBhdGggZD0iTTQ1MCA2MEw0ODAgOTBMNDUwIDEyMEw0MjAgOTBMNDUwIDYwWiIgY2xhc3M9ImJsdWUtc2hhcGUiLz4KICA8cGF0aCBkPSJNNTEwIDEyMEw1NDAgMTUwTDUxMCAxODBMNDgwIDE1MEw1MTAgMTIwWiIgY2xhc3M9ImJsdWUtc2hhcGUiLz4KICA8cGF0aCBkPSJNNDUwIDE4MEw0ODAgMjEwTDQ1MCAyNDBMNDIwIDIxMEw0NTAgMTgwWiIgY2xhc3M9ImJsdWUtc2hhcGUiLz4KICA8cGF0aCBkPSJNMzkwIDI0MEw0MjAgMjcwTDM5MCAzMDBMMzYwIDI3MEwzOTAgMjQwWiIgY2xhc3M9ImJsdWUtc2hhcGUiLz4KICA8cGF0aCBkPSJNMzMwIDE4MEwzNjAgMjEwTDMzMCAyNDBMMzAwIDIxMEwzMzAgMTgwWiIgY2xhc3M9ImJsdWUtc2hhcGUiLz4KICA8cGF0aCBkPSJNOTAgNjBMMTIwIDkwTDkwIDEyMEw2MCA5MEw5MCA2MFoiIGNsYXNzPSJibHVlLXNoYXBlIi8+CiAgPHBhdGggZD0iTTM5MCAwTDQyMCAzMEwxNTAgMzAwTDAgMTUwTDMwIDEyMEwxNTAgMjQwTDM5MCAwWiIgY2xhc3M9ImRhcmtlci1ibHVlLXNoYXBlIi8+Cjwvc3ZnPg==";
pub const BASELINE_HIGH_IMAGE: &str = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTAiIHZpZXdCb3g9IjAgMCA1NDAgMzAwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxzdHlsZT4KICAgIC5ncmVlbi1zaGFwZSB7CiAgICAgIGZpbGw6ICNDNEVFRDA7IC8qIExpZ2h0IG1vZGUgKi8KICAgIH0KCiAgICBAbWVkaWEgKHByZWZlcnMtY29sb3Itc2NoZW1lOiBkYXJrKSB7CiAgICAgIC5ncmVlbi1zaGFwZSB7CiAgICAgICAgZmlsbDogIzEyNTIyNTsgLyogRGFyayBtb2RlICovCiAgICAgIH0KICAgIH0KICA8L3N0eWxlPgogIDxwYXRoIGQ9Ik00MjAgMzBMMzkwIDYwTDQ4MCAxNTBMMzkwIDI0MEwzMzAgMTgwTDMwMCAyMTBMMzkwIDMwMEw1NDAgMTUwTDQyMCAzMFoiIGNsYXNzPSJncmVlbi1zaGFwZSIvPgogIDxwYXRoIGQ9Ik0xNTAgMEwzMCAxMjBMNjAgMTUwTDE1MCA2MEwyMTAgMTIwTDI0MCA5MEwxNTAgMFoiIGNsYXNzPSJncmVlbi1zaGFwZSIvPgogIDxwYXRoIGQ9Ik0zOTAgMEw0MjAgMzBMMTUwIDMwMEwwIDE1MEwzMCAxMjBMMTUwIDI0MEwzOTAgMFoiIGZpbGw9IiMxRUE0NDYiLz4KPC9zdmc+";

pub const TAGS: &[Tag] = &[
    Tag {
        name: "html",
        description: Some("The html element represents the root of an HTML document."),
        void_element: false,
        attributes: &[
            Attribute {
                name: "manifest",
                description: Some(
                    "Specifies the URI of a resource manifest indicating resources that should be cached locally. See [Using the application cache](https://developer.mozilla.org/en-US/docs/Web/HTML/Using_the_application_cache) for details.",
                ),
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "version",
                description: Some(
                    "Specifies the version of the HTML [Document Type Definition](https://developer.mozilla.org/en-US/docs/Glossary/DTD \"Document Type Definition: In HTML, the doctype is the required \"<!DOCTYPE html>\" preamble found at the top of all documents. Its sole purpose is to prevent a browser from switching into so-called “quirks mode” when rendering a document; that is, the \"<!DOCTYPE html>\" doctype ensures that the browser makes a best-effort attempt at following the relevant specifications, rather than using a different rendering mode that is incompatible with some specifications.\") that governs the current document. This attribute is not needed, because it is redundant with the version information in the document type declaration.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
            Attribute {
                name: "xmlns",
                description: Some(
                    "Specifies the XML Namespace of the document. Default value is `\"http://www.w3.org/1999/xhtml\"`. This is required in documents parsed with XML parsers, and optional in text/html documents.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
        ],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/html",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "head",
        description: Some("The head element represents a collection of metadata for the Document."),
        void_element: false,
        attributes: &[Attribute {
            name: "profile",
            description: Some(
                "The URIs of one or more metadata profiles, separated by white space.",
            ),
            value_set: None,
            references: &[],
            browsers: &[],
            status: None,
        }],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/head",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "title",
        description: Some(
            "The title element represents the document's title or name. Authors should use titles that identify their documents even when they are used out of context, for example in a user's history or bookmarks, or in search results. The document's title is often different from its first heading, since the first heading does not have to stand alone when taken out of context.",
        ),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/title",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "base",
        description: Some(
            "The base element allows authors to specify the document base URL for the purposes of resolving relative URLs, and the name of the default browsing context for the purposes of following hyperlinks. The element does not represent any content beyond this information.",
        ),
        void_element: true,
        attributes: &[
            Attribute {
                name: "href",
                description: Some(
                    "The base URL to be used throughout the document for relative URL addresses. If this attribute is specified, this element must come before any other elements with attributes whose values are URLs. Absolute and relative URLs are allowed.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S3", "SM2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "target",
                description: Some(
                    "A name or keyword indicating the default location to display the result when hyperlinks or forms cause navigation, for elements that do not have an explicit target reference. It is a name of, or keyword for, a _browsing context_ (for example: tab, window, or inline frame). The following keywords have special meanings:\n\n*   `_self`: Load the result into the same browsing context as the current one. This value is the default if the attribute is not specified.\n*   `_blank`: Load the result into a new unnamed browsing context.\n*   `_parent`: Load the result into the parent browsing context of the current one. If there is no parent, this option behaves the same way as `_self`.\n*   `_top`: Load the result into the top-level browsing context (that is, the browsing context that is an ancestor of the current one, and has no parent). If there is no parent, this option behaves the same way as `_self`.\n\nIf this attribute is specified, this element must come before any other elements with attributes whose values are URLs.",
                ),
                value_set: Some("target"),
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S3", "SM2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
        ],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/base",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S3", "SM2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "link",
        description: Some(
            "The link element allows authors to link their document to other resources.",
        ),
        void_element: true,
        attributes: &[
            Attribute {
                name: "href",
                description: Some(
                    "This attribute specifies the [URL](https://developer.mozilla.org/en-US/docs/Glossary/URL \"URL: Uniform Resource Locator (URL) is a text string specifying where a resource can be found on the Internet.\") of the linked resource. A URL can be absolute or relative.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "crossorigin",
                description: Some(
                    "This enumerated attribute indicates whether [CORS](https://developer.mozilla.org/en-US/docs/Glossary/CORS \"CORS: CORS (Cross-Origin Resource Sharing) is a system, consisting of transmitting HTTP headers, that determines whether browsers block frontend JavaScript code from accessing responses for cross-origin requests.\") must be used when fetching the resource. [CORS-enabled images](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_Enabled_Image) can be reused in the [`<canvas>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas \"Use the HTML <canvas> element with either the canvas scripting API or the WebGL API to draw graphics and animations.\") element without being _tainted_. The allowed values are:\n\n`anonymous`\n\nA cross-origin request (i.e. with an [`Origin`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Origin \"The Origin request header indicates where a fetch originates from. It doesn't include any path information, but only the server name. It is sent with CORS requests, as well as with POST requests. It is similar to the Referer header, but, unlike this header, it doesn't disclose the whole path.\") HTTP header) is performed, but no credential is sent (i.e. no cookie, X.509 certificate, or HTTP Basic authentication). If the server does not give credentials to the origin site (by not setting the [`Access-Control-Allow-Origin`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin \"The Access-Control-Allow-Origin response header indicates whether the response can be shared with requesting code from the given origin.\") HTTP header) the image will be tainted and its usage restricted.\n\n`use-credentials`\n\nA cross-origin request (i.e. with an `Origin` HTTP header) is performed along with a credential sent (i.e. a cookie, certificate, and/or HTTP Basic authentication is performed). If the server does not give credentials to the origin site (through [`Access-Control-Allow-Credentials`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Credentials \"The Access-Control-Allow-Credentials response header tells browsers whether to expose the response to frontend JavaScript code when the request's credentials mode (Request.credentials) is \"include\".\") HTTP header), the resource will be _tainted_ and its usage restricted.\n\nIf the attribute is not present, the resource is fetched without a [CORS](https://developer.mozilla.org/en-US/docs/Glossary/CORS \"CORS: CORS (Cross-Origin Resource Sharing) is a system, consisting of transmitting HTTP headers, that determines whether browsers block frontend JavaScript code from accessing responses for cross-origin requests.\") request (i.e. without sending the `Origin` HTTP header), preventing its non-tainted usage. If invalid, it is handled as if the enumerated keyword **anonymous** was used. See [CORS settings attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes) for additional information.",
                ),
                value_set: Some("xo"),
                references: &[],
                browsers: &["C34", "CA34", "E17", "FF18", "FFA18", "S10", "SM10"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2018-04-30"),
                    high_date: Some("2020-10-30"),
                }),
            },
            Attribute {
                name: "rel",
                description: Some(
                    "This attribute names a relationship of the linked document to the current document. The attribute must be a space-separated list of the [link types values](https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types).",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "media",
                description: Some(
                    "This attribute specifies the media that the linked resource applies to. Its value must be a media type / [media query](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_queries). This attribute is mainly useful when linking to external stylesheets — it allows the user agent to pick the best adapted one for the device it runs on.\n\n**Notes:**\n\n*   In HTML 4, this can only be a simple white-space-separated list of media description literals, i.e., [media types and groups](https://developer.mozilla.org/en-US/docs/Web/CSS/@media), where defined and allowed as values for this attribute, such as `print`, `screen`, `aural`, `braille`. HTML5 extended this to any kind of [media queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_queries), which are a superset of the allowed values of HTML 4.\n*   Browsers not supporting [CSS3 Media Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_queries) won't necessarily recognize the adequate link; do not forget to set fallback links, the restricted set of media queries defined in HTML 4.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "hreflang",
                description: Some(
                    "This attribute indicates the language of the linked resource. It is purely advisory. Allowed values are determined by [BCP47](https://www.ietf.org/rfc/bcp/bcp47.txt). Use this attribute only if the [`href`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attr-href) attribute is present.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "type",
                description: Some(
                    "This attribute is used to define the type of the content linked to. The value of the attribute should be a MIME type such as **text/html**, **text/css**, and so on. The common use of this attribute is to define the type of stylesheet being referenced (such as **text/css**), but given that CSS is the only stylesheet language used on the web, not only is it possible to omit the `type` attribute, but is actually now recommended practice. It is also used on `rel=\"preload\"` link types, to make sure the browser only downloads file types that it supports.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "sizes",
                description: Some(
                    "This attribute defines the sizes of the icons for visual media contained in the resource. It must be present only if the [`rel`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-rel) contains a value of `icon` or a non-standard type such as Apple's `apple-touch-icon`. It may have the following values:\n\n*   `any`, meaning that the icon can be scaled to any size as it is in a vector format, like `image/svg+xml`.\n*   a white-space separated list of sizes, each in the format `_<width in pixels>_x_<height in pixels>_` or `_<width in pixels>_X_<height in pixels>_`. Each of these sizes must be contained in the resource.\n\n**Note:** Most icon formats are only able to store one single icon; therefore most of the time the [`sizes`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-sizes) contains only one entry. MS's ICO format does, as well as Apple's ICNS. ICO is more ubiquitous; you should definitely use it.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C80", "CA80", "E80", "FF72", "FFA79", "S6", "SM6"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("≤2020-07-28"),
                    high_date: Some("≤2023-01-28"),
                }),
            },
            Attribute {
                name: "as",
                description: Some(
                    "This attribute is only used when `rel=\"preload\"` or `rel=\"prefetch\"` has been set on the `<link>` element. It specifies the type of content being loaded by the `<link>`, which is necessary for content prioritization, request matching, application of correct [content security policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP), and setting of correct [`Accept`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept \"The Accept request HTTP header advertises which content types, expressed as MIME types, the client is able to understand. Using content negotiation, the server then selects one of the proposals, uses it and informs the client of its choice with the Content-Type response header. Browsers set adequate values for this header depending on the context where the request is done: when fetching a CSS stylesheet a different value is set for the request than when fetching an image, video or a script.\") request header.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C50", "CA50", "E17", "FF56", "FFA56", "S10", "SM10"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2018-04-30"),
                    high_date: Some("2020-10-30"),
                }),
            },
            Attribute {
                name: "importance",
                description: Some(
                    "Indicates the relative importance of the resource. Priority hints are delegated using the values:",
                ),
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "importance",
                description: Some(
                    "**`auto`**: Indicates **no preference**. The browser may use its own heuristics to decide the priority of the resource.\n\n**`high`**: Indicates to the browser that the resource is of **high** priority.\n\n**`low`**: Indicates to the browser that the resource is of **low** priority.\n\n**Note:** The `importance` attribute may only be used for the `<link>` element if `rel=\"preload\"` or `rel=\"prefetch\"` is present.",
                ),
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "integrity",
                description: Some(
                    "Contains inline metadata — a base64-encoded cryptographic hash of the resource (file) you’re telling the browser to fetch. The browser can use this to verify that the fetched resource has been delivered free of unexpected manipulation. See [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity).",
                ),
                value_set: None,
                references: &[],
                browsers: &["C45", "CA45", "E17", "FF43", "FFA43", "S11.1", "SM11.3"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2018-04-30"),
                    high_date: Some("2020-10-30"),
                }),
            },
            Attribute {
                name: "referrerpolicy",
                description: Some(
                    "A string indicating which referrer to use when fetching the resource:\n\n*   `no-referrer` means that the [`Referer`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referer \"The Referer request header contains the address of the previous web page from which a link to the currently requested page was followed. The Referer header allows servers to identify where people are visiting them from and may use that data for analytics, logging, or optimized caching, for example.\") header will not be sent.\n*   `no-referrer-when-downgrade` means that no [`Referer`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referer \"The Referer request header contains the address of the previous web page from which a link to the currently requested page was followed. The Referer header allows servers to identify where people are visiting them from and may use that data for analytics, logging, or optimized caching, for example.\") header will be sent when navigating to an origin without TLS (HTTPS). This is a user agent’s default behavior, if no policy is otherwise specified.\n*   `origin` means that the referrer will be the origin of the page, which is roughly the scheme, the host, and the port.\n*   `origin-when-cross-origin` means that navigating to other origins will be limited to the scheme, the host, and the port, while navigating on the same origin will include the referrer's path.\n*   `unsafe-url` means that the referrer will include the origin and the path (but not the fragment, password, or username). This case is unsafe because it can leak origins and paths from TLS-protected resources to insecure origins.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C51", "CA51", "E79", "FF50", "FFA50", "S14", "SM14"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2020-09-16"),
                    high_date: Some("2023-03-16"),
                }),
            },
            Attribute {
                name: "title",
                description: Some(
                    "The `title` attribute has special semantics on the `<link>` element. When used on a `<link rel=\"stylesheet\">` it defines a [preferred or an alternate stylesheet](https://developer.mozilla.org/en-US/docs/Web/CSS/Alternative_style_sheets). Incorrectly using it may [cause the stylesheet to be ignored](https://developer.mozilla.org/en-US/docs/Correctly_Using_Titles_With_External_Stylesheets).",
                ),
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
        ],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/link",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "meta",
        description: Some(
            "The meta element represents various kinds of metadata that cannot be expressed using the title, base, link, style, and script elements.",
        ),
        void_element: true,
        attributes: &[
            Attribute {
                name: "name",
                description: Some(
                    "This attribute defines the name of a piece of document-level metadata. It should not be set if one of the attributes [`itemprop`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-itemprop), [`http-equiv`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta#attr-http-equiv) or [`charset`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta#attr-charset) is also set.\n\nThis metadata name is associated with the value contained by the [`content`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta#attr-content) attribute. The possible values for the name attribute are:\n\n*   `application-name` which defines the name of the application running in the web page.\n    \n    **Note:**\n    \n    *   Browsers may use this to identify the application. It is different from the [`<title>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/title \"The HTML Title element (<title>) defines the document's title that is shown in a browser's title bar or a page's tab.\") element, which usually contain the application name, but may also contain information like the document name or a status.\n    *   Simple web pages shouldn't define an application-name.\n    \n*   `author` which defines the name of the document's author.\n*   `description` which contains a short and accurate summary of the content of the page. Several browsers, like Firefox and Opera, use this as the default description of bookmarked pages.\n*   `generator` which contains the identifier of the software that generated the page.\n*   `keywords` which contains words relevant to the page's content separated by commas.\n*   `referrer` which controls the [`Referer` HTTP header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referer) attached to requests sent from the document:\n    \n    Values for the `content` attribute of `<meta name=\"referrer\">`\n    \n    `no-referrer`\n    \n    Do not send a HTTP `Referrer` header.\n    \n    `origin`\n    \n    Send the [origin](https://developer.mozilla.org/en-US/docs/Glossary/Origin) of the document.\n    \n    `no-referrer-when-downgrade`\n    \n    Send the [origin](https://developer.mozilla.org/en-US/docs/Glossary/Origin) as a referrer to URLs as secure as the current page, (https→https), but does not send a referrer to less secure URLs (https→http). This is the default behaviour.\n    \n    `origin-when-cross-origin`\n    \n    Send the full URL (stripped of parameters) for same-origin requests, but only send the [origin](https://developer.mozilla.org/en-US/docs/Glossary/Origin) for other cases.\n    \n    `same-origin`\n    \n    A referrer will be sent for [same-site origins](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy), but cross-origin requests will contain no referrer information.\n    \n    `strict-origin`\n    \n    Only send the origin of the document as the referrer to a-priori as-much-secure destination (HTTPS->HTTPS), but don't send it to a less secure destination (HTTPS->HTTP).\n    \n    `strict-origin-when-cross-origin`\n    \n    Send a full URL when performing a same-origin request, only send the origin of the document to a-priori as-much-secure destination (HTTPS->HTTPS), and send no header to a less secure destination (HTTPS->HTTP).\n    \n    `unsafe-URL`\n    \n    Send the full URL (stripped of parameters) for same-origin or cross-origin requests.\n    \n    **Notes:**\n    \n    *   Some browsers support the deprecated values of `always`, `default`, and `never` for referrer.\n    *   Dynamically inserting `<meta name=\"referrer\">` (with [`document.write`](https://developer.mozilla.org/en-US/docs/Web/API/Document/write) or [`appendChild`](https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild)) makes the referrer behaviour unpredictable.\n    *   When several conflicting policies are defined, the no-referrer policy is applied.\n    \n\nThis attribute may also have a value taken from the extended list defined on [WHATWG Wiki MetaExtensions page](https://wiki.whatwg.org/wiki/MetaExtensions). Although none have been formally accepted yet, a few commonly used names are:\n\n*   `creator` which defines the name of the creator of the document, such as an organization or institution. If there are more than one, several [`<meta>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta \"The HTML <meta> element represents metadata that cannot be represented by other HTML meta-related elements, like <base>, <link>, <script>, <style> or <title>.\") elements should be used.\n*   `googlebot`, a synonym of `robots`, is only followed by Googlebot (the indexing crawler for Google).\n*   `publisher` which defines the name of the document's publisher.\n*   `robots` which defines the behaviour that cooperative crawlers, or \"robots\", should use with the page. It is a comma-separated list of the values below:\n    \n    Values for the content of `<meta name=\"robots\">`\n    \n    Value\n    \n    Description\n    \n    Used by\n    \n    `index`\n    \n    Allows the robot to index the page (default).\n    \n    All\n    \n    `noindex`\n    \n    Requests the robot to not index the page.\n    \n    All\n    \n    `follow`\n    \n    Allows the robot to follow the links on the page (default).\n    \n    All\n    \n    `nofollow`\n    \n    Requests the robot to not follow the links on the page.\n    \n    All\n    \n    `none`\n    \n    Equivalent to `noindex, nofollow`\n    \n    [Google](https://support.google.com/webmasters/answer/79812)\n    \n    `noodp`\n    \n    Prevents using the [Open Directory Project](https://www.dmoz.org/) description, if any, as the page description in search engine results.\n    \n    [Google](https://support.google.com/webmasters/answer/35624#nodmoz), [Yahoo](https://help.yahoo.com/kb/search-for-desktop/meta-tags-robotstxt-yahoo-search-sln2213.html#cont5), [Bing](https://www.bing.com/webmaster/help/which-robots-metatags-does-bing-support-5198d240)\n    \n    `noarchive`\n    \n    Requests the search engine not to cache the page content.\n    \n    [Google](https://developers.google.com/webmasters/control-crawl-index/docs/robots_meta_tag#valid-indexing--serving-directives), [Yahoo](https://help.yahoo.com/kb/search-for-desktop/SLN2213.html), [Bing](https://www.bing.com/webmaster/help/which-robots-metatags-does-bing-support-5198d240)\n    \n    `nosnippet`\n    \n    Prevents displaying any description of the page in search engine results.\n    \n    [Google](https://developers.google.com/webmasters/control-crawl-index/docs/robots_meta_tag#valid-indexing--serving-directives), [Bing](https://www.bing.com/webmaster/help/which-robots-metatags-does-bing-support-5198d240)\n    \n    `noimageindex`\n    \n    Requests this page not to appear as the referring page of an indexed image.\n    \n    [Google](https://developers.google.com/webmasters/control-crawl-index/docs/robots_meta_tag#valid-indexing--serving-directives)\n    \n    `nocache`\n    \n    Synonym of `noarchive`.\n    \n    [Bing](https://www.bing.com/webmaster/help/which-robots-metatags-does-bing-support-5198d240)\n    \n    **Notes:**\n    \n    *   Only cooperative robots follow these rules. Do not expect to prevent e-mail harvesters with them.\n    *   The robot still needs to access the page in order to read these rules. To prevent bandwidth consumption, use a _[robots.txt](https://developer.mozilla.org/en-US/docs/Glossary/robots.txt \"robots.txt: Robots.txt is a file which is usually placed in the root of any website. It decides whether crawlers are permitted or forbidden access to the web site.\")_ file.\n    *   If you want to remove a page, `noindex` will work, but only after the robot visits the page again. Ensure that the `robots.txt` file is not preventing revisits.\n    *   Some values are mutually exclusive, like `index` and `noindex`, or `follow` and `nofollow`. In these cases the robot's behaviour is undefined and may vary between them.\n    *   Some crawler robots, like Google, Yahoo and Bing, support the same values for the HTTP header `X-Robots-Tag`; this allows non-HTML documents like images to use these rules.\n    \n*   `slurp`, is a synonym of `robots`, but only for Slurp - the crawler for Yahoo Search.\n*   `viewport`, which gives hints about the size of the initial size of the [viewport](https://developer.mozilla.org/en-US/docs/Glossary/viewport \"viewport: A viewport represents a polygonal (normally rectangular) area in computer graphics that is currently being viewed. In web browser terms, it refers to the part of the document you're viewing which is currently visible in its window (or the screen, if the document is being viewed in full screen mode). Content outside the viewport is not visible onscreen until scrolled into view.\"). Used by mobile devices only.\n    \n    Values for the content of `<meta name=\"viewport\">`\n    \n    Value\n    \n    Possible subvalues\n    \n    Description\n    \n    `width`\n    \n    A positive integer number, or the text `device-width`\n    \n    Defines the pixel width of the viewport that you want the web site to be rendered at.\n    \n    `height`\n    \n    A positive integer, or the text `device-height`\n    \n    Defines the height of the viewport. Not used by any browser.\n    \n    `initial-scale`\n    \n    A positive number between `0.0` and `10.0`\n    \n    Defines the ratio between the device width (`device-width` in portrait mode or `device-height` in landscape mode) and the viewport size.\n    \n    `maximum-scale`\n    \n    A positive number between `0.0` and `10.0`\n    \n    Defines the maximum amount to zoom in. It must be greater or equal to the `minimum-scale` or the behaviour is undefined. Browser settings can ignore this rule and iOS10+ ignores it by default.\n    \n    `minimum-scale`\n    \n    A positive number between `0.0` and `10.0`\n    \n    Defines the minimum zoom level. It must be smaller or equal to the `maximum-scale` or the behaviour is undefined. Browser settings can ignore this rule and iOS10+ ignores it by default.\n    \n    `user-scalable`\n    \n    `yes` or `no`\n    \n    If set to `no`, the user is not able to zoom in the webpage. The default is `yes`. Browser settings can ignore this rule, and iOS10+ ignores it by default.\n    \n    Specification\n    \n    Status\n    \n    Comment\n    \n    [CSS Device Adaptation  \n    The definition of '<meta name=\"viewport\">' in that specification.](https://drafts.csswg.org/css-device-adapt/#viewport-meta)\n    \n    Working Draft\n    \n    Non-normatively describes the Viewport META element\n    \n    See also: [`@viewport`](https://developer.mozilla.org/en-US/docs/Web/CSS/@viewport \"The @viewport CSS at-rule lets you configure the viewport through which the document is viewed. It's primarily used for mobile devices, but is also used by desktop browsers that support features like \"snap to edge\" (such as Microsoft Edge).\")\n    \n    **Notes:**\n    \n    *   Though unstandardized, this declaration is respected by most mobile browsers due to de-facto dominance.\n    *   The default values may vary between devices and browsers.\n    *   To learn about this declaration in Firefox for Mobile, see [this article](https://developer.mozilla.org/en-US/docs/Mobile/Viewport_meta_tag \"Mobile/Viewport meta tag\").",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "http-equiv",
                description: Some(
                    "Defines a pragma directive. The attribute is named `**http-equiv**(alent)` because all the allowed values are names of particular HTTP headers:\n\n*   `\"content-language\"`  \n    Defines the default language of the page. It can be overridden by the [lang](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/lang) attribute on any element.\n    \n    **Warning:** Do not use this value, as it is obsolete. Prefer the `lang` attribute on the [`<html>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/html \"The HTML <html> element represents the root (top-level element) of an HTML document, so it is also referred to as the root element. All other elements must be descendants of this element.\") element.\n    \n*   `\"content-security-policy\"`  \n    Allows page authors to define a [content policy](https://developer.mozilla.org/en-US/docs/Web/Security/CSP/CSP_policy_directives) for the current page. Content policies mostly specify allowed server origins and script endpoints which help guard against cross-site scripting attacks.\n*   `\"content-type\"`  \n    Defines the [MIME type](https://developer.mozilla.org/en-US/docs/Glossary/MIME_type) of the document, followed by its character encoding. It follows the same syntax as the HTTP `content-type` entity-header field, but as it is inside a HTML page, most values other than `text/html` are impossible. Therefore the valid syntax for its `content` is the string '`text/html`' followed by a character set with the following syntax: '`; charset=_IANAcharset_`', where `IANAcharset` is the _preferred MIME name_ for a character set as [defined by the IANA.](https://www.iana.org/assignments/character-sets)\n    \n    **Warning:** Do not use this value, as it is obsolete. Use the [`charset`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta#attr-charset) attribute on the [`<meta>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta \"The HTML <meta> element represents metadata that cannot be represented by other HTML meta-related elements, like <base>, <link>, <script>, <style> or <title>.\") element.\n    \n    **Note:** As [`<meta>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta \"The HTML <meta> element represents metadata that cannot be represented by other HTML meta-related elements, like <base>, <link>, <script>, <style> or <title>.\") can't change documents' types in XHTML or HTML5's XHTML serialization, never set the MIME type to an XHTML MIME type with `<meta>`.\n    \n*   `\"refresh\"`  \n    This instruction specifies:\n    *   The number of seconds until the page should be reloaded - only if the [`content`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta#attr-content) attribute contains a positive integer.\n    *   The number of seconds until the page should redirect to another - only if the [`content`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta#attr-content) attribute contains a positive integer followed by the string '`;url=`', and a valid URL.\n*   `\"set-cookie\"`  \n    Defines a [cookie](https://developer.mozilla.org/en-US/docs/cookie) for the page. Its content must follow the syntax defined in the [IETF HTTP Cookie Specification](https://tools.ietf.org/html/draft-ietf-httpstate-cookie-14).\n    \n    **Warning:** Do not use this instruction, as it is obsolete. Use the HTTP header [`Set-Cookie`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie) instead.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "content",
                description: Some(
                    "This attribute contains the value for the [`http-equiv`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta#attr-http-equiv) or [`name`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta#attr-name) attribute, depending on which is used.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "charset",
                description: Some(
                    "This attribute declares the page's character encoding. It must contain a [standard IANA MIME name for character encodings](https://www.iana.org/assignments/character-sets). Although the standard doesn't request a specific encoding, it suggests:\n\n*   Authors are encouraged to use [`UTF-8`](https://developer.mozilla.org/en-US/docs/Glossary/UTF-8).\n*   Authors should not use ASCII-incompatible encodings to avoid security risk: browsers not supporting them may interpret harmful content as HTML. This happens with the `JIS_C6226-1983`, `JIS_X0212-1990`, `HZ-GB-2312`, `JOHAB`, the ISO-2022 family and the EBCDIC family.\n\n**Note:** ASCII-incompatible encodings are those that don't map the 8-bit code points `0x20` to `0x7E` to the `0x0020` to `0x007E` Unicode code points)\n\n*   Authors **must not** use `CESU-8`, `UTF-7`, `BOCU-1` and/or `SCSU` as [cross-site scripting](https://developer.mozilla.org/en-US/docs/Glossary/Cross-site_scripting) attacks with these encodings have been demonstrated.\n*   Authors should not use `UTF-32` because not all HTML5 encoding algorithms can distinguish it from `UTF-16`.\n\n**Notes:**\n\n*   The declared character encoding must match the one the page was saved with to avoid garbled characters and security holes.\n*   The [`<meta>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta \"The HTML <meta> element represents metadata that cannot be represented by other HTML meta-related elements, like <base>, <link>, <script>, <style> or <title>.\") element declaring the encoding must be inside the [`<head>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/head \"The HTML <head> element provides general information (metadata) about the document, including its title and links to its scripts and style sheets.\") element and **within the first 1024 bytes** of the HTML as some browsers only look at those bytes before choosing an encoding.\n*   This [`<meta>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta \"The HTML <meta> element represents metadata that cannot be represented by other HTML meta-related elements, like <base>, <link>, <script>, <style> or <title>.\") element is only one part of the [algorithm to determine a page's character set](https://www.whatwg.org/specs/web-apps/current-work/multipage/parsing.html#encoding-sniffing-algorithm \"Algorithm charset page\"). The [`Content-Type` header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) and any [Byte-Order Marks](https://developer.mozilla.org/en-US/docs/Glossary/Byte-Order_Mark \"The definition of that term (Byte-Order Marks) has not been written yet; please consider contributing it!\") override this element.\n*   It is strongly recommended to define the character encoding. If a page's encoding is undefined, cross-scripting techniques are possible, such as the [`UTF-7` fallback cross-scripting technique](https://code.google.com/p/doctype-mirror/wiki/ArticleUtf7).\n*   The [`<meta>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta \"The HTML <meta> element represents metadata that cannot be represented by other HTML meta-related elements, like <base>, <link>, <script>, <style> or <title>.\") element with a `charset` attribute is a synonym for the pre-HTML5 `<meta http-equiv=\"Content-Type\" content=\"text/html; charset=_IANAcharset_\">`, where _`IANAcharset`_ contains the value of the equivalent [`charset`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta#attr-charset) attribute. This syntax is still allowed, although no longer recommended.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S3", "SM2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "scheme",
                description: Some(
                    "This attribute defines the scheme in which metadata is described. A scheme is a context leading to the correct interpretations of the [`content`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta#attr-content) value, like a format.\n\n**Warning:** Do not use this value, as it is obsolete. There is no replacement as there was no real usage for it.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
        ],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/meta",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "style",
        description: Some(
            "The style element allows authors to embed style information in their documents. The style element is one of several inputs to the styling processing model. The element does not represent content for the user.",
        ),
        void_element: false,
        attributes: &[
            Attribute {
                name: "media",
                description: Some(
                    "This attribute defines which media the style should be applied to. Its value is a [media query](https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Media_queries), which defaults to `all` if the attribute is missing.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "nonce",
                description: Some(
                    "A cryptographic nonce (number used once) used to allow inline styles in a [style-src Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/style-src). The server must generate a unique nonce value each time it transmits a policy. It is critical to provide a nonce that cannot be guessed as bypassing a resource’s policy is otherwise trivial.",
                ),
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "type",
                description: Some(
                    "This attribute defines the styling language as a MIME type (charset should not be specified). This attribute is optional and defaults to `text/css` if it is not specified — there is very little reason to include this in modern web documents.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
            Attribute {
                name: "scoped",
                description: None,
                value_set: Some("v"),
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "title",
                description: Some(
                    "This attribute specifies [alternative style sheet](https://developer.mozilla.org/en-US/docs/Web/CSS/Alternative_style_sheets) sets.",
                ),
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
        ],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/style",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "body",
        description: Some("The body element represents the content of the document."),
        void_element: false,
        attributes: &[
            Attribute {
                name: "onafterprint",
                description: Some("Function to call after the user has printed the document."),
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "onbeforeprint",
                description: Some(
                    "Function to call when the user requests printing of the document.",
                ),
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "onbeforeunload",
                description: Some("Function to call when the document is about to be unloaded."),
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "onhashchange",
                description: Some(
                    "Function to call when the fragment identifier part (starting with the hash (`'#'`) character) of the document's current address has changed.",
                ),
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "onlanguagechange",
                description: Some("Function to call when the preferred languages changed."),
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "onmessage",
                description: Some("Function to call when the document has received a message."),
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "onoffline",
                description: Some("Function to call when network communication has failed."),
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "ononline",
                description: Some("Function to call when network communication has been restored."),
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "onpagehide",
                description: None,
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "onpageshow",
                description: None,
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "onpopstate",
                description: Some("Function to call when the user has navigated session history."),
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "onstorage",
                description: Some("Function to call when the storage area has changed."),
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "onunload",
                description: Some("Function to call when the document is going away."),
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "alink",
                description: Some(
                    "Color of text for hyperlinks when selected. _This method is non-conforming, use CSS [`color`](https://developer.mozilla.org/en-US/docs/Web/CSS/color \"The color CSS property sets the foreground color value of an element's text and text decorations, and sets the currentcolor value.\") property in conjunction with the [`:active`](https://developer.mozilla.org/en-US/docs/Web/CSS/:active \"The :active CSS pseudo-class represents an element (such as a button) that is being activated by the user.\") pseudo-class instead._",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
            Attribute {
                name: "background",
                description: Some(
                    "URI of a image to use as a background. _This method is non-conforming, use CSS [`background`](https://developer.mozilla.org/en-US/docs/Web/CSS/background \"The background shorthand CSS property sets all background style properties at once, such as color, image, origin and size, or repeat method.\") property on the element instead._",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
            Attribute {
                name: "bgcolor",
                description: Some(
                    "Background color for the document. _This method is non-conforming, use CSS [`background-color`](https://developer.mozilla.org/en-US/docs/Web/CSS/background-color \"The background-color CSS property sets the background color of an element.\") property on the element instead._",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
            Attribute {
                name: "bottommargin",
                description: Some(
                    "The margin of the bottom of the body. _This method is non-conforming, use CSS [`margin-bottom`](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-bottom \"The margin-bottom CSS property sets the margin area on the bottom of an element. A positive value places it farther from its neighbors, while a negative value places it closer.\") property on the element instead._",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E79", "FF35", "FFA35", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
            Attribute {
                name: "leftmargin",
                description: Some(
                    "The margin of the left of the body. _This method is non-conforming, use CSS [`margin-left`](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-left \"The margin-left CSS property sets the margin area on the left side of an element. A positive value places it farther from its neighbors, while a negative value places it closer.\") property on the element instead._",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E79", "FF35", "FFA35", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
            Attribute {
                name: "link",
                description: Some(
                    "Color of text for unvisited hypertext links. _This method is non-conforming, use CSS [`color`](https://developer.mozilla.org/en-US/docs/Web/CSS/color \"The color CSS property sets the foreground color value of an element's text and text decorations, and sets the currentcolor value.\") property in conjunction with the [`:link`](https://developer.mozilla.org/en-US/docs/Web/CSS/:link \"The :link CSS pseudo-class represents an element that has not yet been visited. It matches every unvisited <a>, <area>, or <link> element that has an href attribute.\") pseudo-class instead._",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
            Attribute {
                name: "onblur",
                description: Some("Function to call when the document loses focus."),
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "onerror",
                description: Some("Function to call when the document fails to load properly."),
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "onfocus",
                description: Some("Function to call when the document receives focus."),
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "onload",
                description: Some("Function to call when the document has finished loading."),
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "onredo",
                description: Some(
                    "Function to call when the user has moved forward in undo transaction history.",
                ),
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "onresize",
                description: Some("Function to call when the document has been resized."),
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "onundo",
                description: Some(
                    "Function to call when the user has moved backward in undo transaction history.",
                ),
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "rightmargin",
                description: Some(
                    "The margin of the right of the body. _This method is non-conforming, use CSS [`margin-right`](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-right \"The margin-right CSS property sets the margin area on the right side of an element. A positive value places it farther from its neighbors, while a negative value places it closer.\") property on the element instead._",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E79", "FF35", "FFA35", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
            Attribute {
                name: "text",
                description: Some(
                    "Foreground color of text. _This method is non-conforming, use CSS [`color`](https://developer.mozilla.org/en-US/docs/Web/CSS/color \"The color CSS property sets the foreground color value of an element's text and text decorations, and sets the currentcolor value.\") property on the element instead._",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
            Attribute {
                name: "topmargin",
                description: Some(
                    "The margin of the top of the body. _This method is non-conforming, use CSS [`margin-top`](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-top \"The margin-top CSS property sets the margin area on the top of an element. A positive value places it farther from its neighbors, while a negative value places it closer.\") property on the element instead._",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E79", "FF35", "FFA35", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
            Attribute {
                name: "vlink",
                description: Some(
                    "Color of text for visited hypertext links. _This method is non-conforming, use CSS [`color`](https://developer.mozilla.org/en-US/docs/Web/CSS/color \"The color CSS property sets the foreground color value of an element's text and text decorations, and sets the currentcolor value.\") property in conjunction with the [`:visited`](https://developer.mozilla.org/en-US/docs/Web/CSS/:visited \"The :visited CSS pseudo-class represents links that the user has already visited. For privacy reasons, the styles that can be modified using this selector are very limited.\") pseudo-class instead._",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
        ],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/body",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "article",
        description: Some(
            "The article element represents a complete, or self-contained, composition in a document, page, application, or site and that is, in principle, independently distributable or reusable, e.g. in syndication. This could be a forum post, a magazine or newspaper article, a blog entry, a user-submitted comment, an interactive widget or gadget, or any other independent item of content. Each article should be identified, typically by including a heading (h1–h6 element) as a child of the article element.",
        ),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/article",
        }],
        browsers: &["C5", "CA18", "E12", "FF4", "FFA4", "S5", "SM4.2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "section",
        description: Some(
            "The section element represents a generic section of a document or application. A section, in this context, is a thematic grouping of content. Each section should be identified, typically by including a heading ( h1- h6 element) as a child of the section element.",
        ),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/section",
        }],
        browsers: &["C5", "CA18", "E12", "FF4", "FFA4", "S5", "SM4.2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "nav",
        description: Some(
            "The nav element represents a section of a page that links to other pages or to parts within the page: a section with navigation links.",
        ),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/nav",
        }],
        browsers: &["C5", "CA18", "E12", "FF4", "FFA4", "S5", "SM4.2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "aside",
        description: Some(
            "The aside element represents a section of a page that consists of content that is tangentially related to the content around the aside element, and which could be considered separate from that content. Such sections are often represented as sidebars in printed typography.",
        ),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/aside",
        }],
        browsers: &["C5", "CA18", "E12", "FF4", "FFA4", "S5", "SM4.2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "h1",
        description: Some("The h1 element represents a section heading."),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/Heading_Elements",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "h2",
        description: Some("The h2 element represents a section heading."),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/Heading_Elements",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "h3",
        description: Some("The h3 element represents a section heading."),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/Heading_Elements",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "h4",
        description: Some("The h4 element represents a section heading."),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/Heading_Elements",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "h5",
        description: Some("The h5 element represents a section heading."),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/Heading_Elements",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "h6",
        description: Some("The h6 element represents a section heading."),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/Heading_Elements",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "header",
        description: Some(
            "The header element represents introductory content for its nearest ancestor sectioning content or sectioning root element. A header typically contains a group of introductory or navigational aids. When the nearest ancestor sectioning content or sectioning root element is the body element, then it applies to the whole page.",
        ),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/header",
        }],
        browsers: &["C5", "CA18", "E12", "FF4", "FFA4", "S5", "SM4.2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "footer",
        description: Some(
            "The footer element represents a footer for its nearest ancestor sectioning content or sectioning root element. A footer typically contains information about its section such as who wrote it, links to related documents, copyright data, and the like.",
        ),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/footer",
        }],
        browsers: &["C5", "CA18", "E12", "FF4", "FFA4", "S5", "SM4.2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "address",
        description: Some(
            "The address element represents the contact information for its nearest article or body element ancestor. If that is the body element, then the contact information applies to the document as a whole.",
        ),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/address",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "p",
        description: Some("The p element represents a paragraph."),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/p",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "hr",
        description: Some(
            "The hr element represents a paragraph-level thematic break, e.g. a scene change in a story, or a transition to another topic within a section of a reference book.",
        ),
        void_element: true,
        attributes: &[
            Attribute {
                name: "align",
                description: Some(
                    "Sets the alignment of the rule on the page. If no value is specified, the default value is `left`.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
            Attribute {
                name: "color",
                description: Some(
                    "Sets the color of the rule through color name or hexadecimal value.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C33", "CA33", "E12", "FF1", "FFA4", "S10.1", "SM10.3"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
            Attribute {
                name: "noshade",
                description: Some("Sets the rule to have no shading."),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
            Attribute {
                name: "size",
                description: Some("Sets the height, in pixels, of the rule."),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
            Attribute {
                name: "width",
                description: Some(
                    "Sets the length of the rule on the page through a pixel or percentage value.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
        ],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/hr",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S3", "SM1"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "pre",
        description: Some(
            "The pre element represents a block of preformatted text, in which structure is represented by typographic conventions rather than by elements.",
        ),
        void_element: false,
        attributes: &[
            Attribute {
                name: "cols",
                description: Some(
                    "Contains the _preferred_ count of characters that a line should have. It was a non-standard synonym of [`width`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/pre#attr-width). To achieve such an effect, use CSS [`width`](https://developer.mozilla.org/en-US/docs/Web/CSS/width \"The width CSS property sets an element's width. By default it sets the width of the content area, but if box-sizing is set to border-box, it sets the width of the border area.\") instead.",
                ),
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "width",
                description: Some(
                    "Contains the _preferred_ count of characters that a line should have. Though technically still implemented, this attribute has no visual effect; to achieve such an effect, use CSS [`width`](https://developer.mozilla.org/en-US/docs/Web/CSS/width \"The width CSS property sets an element's width. By default it sets the width of the content area, but if box-sizing is set to border-box, it sets the width of the border area.\") instead.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
            Attribute {
                name: "wrap",
                description: Some(
                    "Is a _hint_ indicating how the overflow must happen. In modern browser this hint is ignored and no visual effect results in its present; to achieve such an effect, use CSS [`white-space`](https://developer.mozilla.org/en-US/docs/Web/CSS/white-space \"The white-space CSS property sets how white space inside an element is handled.\") instead.",
                ),
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
        ],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/pre",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "blockquote",
        description: Some(
            "The blockquote element represents content that is quoted from another source, optionally with a citation which must be within a footer or cite element, and optionally with in-line changes such as annotations and abbreviations.",
        ),
        void_element: false,
        attributes: &[Attribute {
            name: "cite",
            description: Some(
                "A URL that designates a source document or message for the information quoted. This attribute is intended to point to information explaining the context or the reference for the quote.",
            ),
            value_set: None,
            references: &[],
            browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
            status: Some(Status {
                baseline: Baseline::High,
                low_date: Some("2015-07-29"),
                high_date: Some("2018-01-29"),
            }),
        }],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/blockquote",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "ol",
        description: Some(
            "The ol element represents a list of items, where the items have been intentionally ordered, such that changing the order would change the meaning of the document.",
        ),
        void_element: false,
        attributes: &[
            Attribute {
                name: "reversed",
                description: Some(
                    "This Boolean attribute specifies that the items of the list are specified in reversed order.",
                ),
                value_set: Some("v"),
                references: &[],
                browsers: &["C18", "CA18", "E79", "FF18", "FFA18", "S6", "SM6"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("≤2020-01-15"),
                    high_date: Some("≤2022-07-15"),
                }),
            },
            Attribute {
                name: "start",
                description: Some(
                    "This integer attribute specifies the start value for numbering the individual list items. Although the ordering type of list elements might be Roman numerals, such as XXXI, or letters, the value of start is always represented as a number. To start numbering elements from the letter \"C\", use `<ol start=\"3\">`.\n\n**Note**: This attribute was deprecated in HTML4, but reintroduced in HTML5.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "type",
                description: Some(
                    "Indicates the numbering type:\n\n*   `'a'` indicates lowercase letters,\n*   `'A'` indicates uppercase letters,\n*   `'i'` indicates lowercase Roman numerals,\n*   `'I'` indicates uppercase Roman numerals,\n*   and `'1'` indicates numbers (default).\n\nThe type set is used for the entire list unless a different [`type`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/li#attr-type) attribute is used within an enclosed [`<li>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/li \"The HTML <li> element is used to represent an item in a list. It must be contained in a parent element: an ordered list (<ol>), an unordered list (<ul>), or a menu (<menu>). In menus and unordered lists, list items are usually displayed using bullet points. In ordered lists, they are usually displayed with an ascending counter on the left, such as a number or letter.\") element.\n\n**Note:** This attribute was deprecated in HTML4, but reintroduced in HTML5.\n\nUnless the value of the list number matters (e.g. in legal or technical documents where items are to be referenced by their number/letter), the CSS [`list-style-type`](https://developer.mozilla.org/en-US/docs/Web/CSS/list-style-type \"The list-style-type CSS property sets the marker (such as a disc, character, or custom counter style) of a list item element.\") property should be used instead.",
                ),
                value_set: Some("lt"),
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "compact",
                description: Some(
                    "This Boolean attribute hints that the list should be rendered in a compact style. The interpretation of this attribute depends on the user agent and it doesn't work in all browsers.\n\n**Warning:** Do not use this attribute, as it has been deprecated: the [`<ol>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ol \"The HTML <ol> element represents an ordered list of items, typically rendered as a numbered list.\") element should be styled using [CSS](https://developer.mozilla.org/en-US/docs/CSS). To give an effect similar to the `compact` attribute, the [CSS](https://developer.mozilla.org/en-US/docs/CSS) property [`line-height`](https://developer.mozilla.org/en-US/docs/Web/CSS/line-height \"The line-height CSS property sets the amount of space used for lines, such as in text. On block-level elements, it specifies the minimum height of line boxes within the element. On non-replaced inline elements, it specifies the height that is used to calculate line box height.\") can be used with a value of `80%`.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
        ],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/ol",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "ul",
        description: Some(
            "The ul element represents a list of items, where the order of the items is not important — that is, where changing the order would not materially change the meaning of the document.",
        ),
        void_element: false,
        attributes: &[Attribute {
            name: "compact",
            description: Some(
                "This Boolean attribute hints that the list should be rendered in a compact style. The interpretation of this attribute depends on the user agent and it doesn't work in all browsers.\n\n**Usage note: **Do not use this attribute, as it has been deprecated: the [`<ul>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ul \"The HTML <ul> element represents an unordered list of items, typically rendered as a bulleted list.\") element should be styled using [CSS](https://developer.mozilla.org/en-US/docs/CSS). To give a similar effect as the `compact` attribute, the [CSS](https://developer.mozilla.org/en-US/docs/CSS) property [line-height](https://developer.mozilla.org/en-US/docs/CSS/line-height) can be used with a value of `80%`.",
            ),
            value_set: None,
            references: &[],
            browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
            status: Some(Status {
                baseline: Baseline::Limited,
                low_date: None,
                high_date: None,
            }),
        }],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/ul",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "li",
        description: Some(
            "The li element represents a list item. If its parent element is an ol, ul, or menu element, then the element is an item of the parent element's list, as defined for those elements. Otherwise, the list item has no defined list-related relationship to any other li element.",
        ),
        void_element: false,
        attributes: &[
            Attribute {
                name: "value",
                description: Some(
                    "This integer attribute indicates the current ordinal value of the list item as defined by the [`<ol>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ol \"The HTML <ol> element represents an ordered list of items, typically rendered as a numbered list.\") element. The only allowed value for this attribute is a number, even if the list is displayed with Roman numerals or letters. List items that follow this one continue numbering from the value set. The **value** attribute has no meaning for unordered lists ([`<ul>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ul \"The HTML <ul> element represents an unordered list of items, typically rendered as a bulleted list.\")) or for menus ([`<menu>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/menu \"The HTML <menu> element represents a group of commands that a user can perform or activate. This includes both list menus, which might appear across the top of a screen, as well as context menus, such as those that might appear underneath a button after it has been clicked.\")).\n\n**Note**: This attribute was deprecated in HTML4, but reintroduced in HTML5.\n\n**Note:** Prior to Gecko 9.0, negative values were incorrectly converted to 0. Starting in Gecko 9.0 all integer values are correctly parsed.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "type",
                description: Some(
                    "This character attribute indicates the numbering type:\n\n*   `a`: lowercase letters\n*   `A`: uppercase letters\n*   `i`: lowercase Roman numerals\n*   `I`: uppercase Roman numerals\n*   `1`: numbers\n\nThis type overrides the one used by its parent [`<ol>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ol \"The HTML <ol> element represents an ordered list of items, typically rendered as a numbered list.\") element, if any.\n\n**Usage note:** This attribute has been deprecated: use the CSS [`list-style-type`](https://developer.mozilla.org/en-US/docs/Web/CSS/list-style-type \"The list-style-type CSS property sets the marker (such as a disc, character, or custom counter style) of a list item element.\") property instead.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
        ],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/li",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S3", "SM1"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "dl",
        description: Some(
            "The dl element represents an association list consisting of zero or more name-value groups (a description list). A name-value group consists of one or more names (dt elements) followed by one or more values (dd elements), ignoring any nodes other than dt and dd elements. Within a single dl element, there should not be more than one dt element for each name.",
        ),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/dl",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "dt",
        description: Some(
            "The dt element represents the term, or name, part of a term-description group in a description list (dl element).",
        ),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/dt",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "dd",
        description: Some(
            "The dd element represents the description, definition, or value, part of a term-description group in a description list (dl element).",
        ),
        void_element: false,
        attributes: &[Attribute {
            name: "nowrap",
            description: Some(
                "If the value of this attribute is set to `yes`, the definition text will not wrap. The default value is `no`.",
            ),
            value_set: None,
            references: &[],
            browsers: &[],
            status: None,
        }],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/dd",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "figure",
        description: Some(
            "The figure element represents some flow content, optionally with a caption, that is self-contained (like a complete sentence) and is typically referenced as a single unit from the main flow of the document.",
        ),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/figure",
        }],
        browsers: &["C8", "CA18", "E12", "FF4", "FFA4", "S5.1", "SM5"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "figcaption",
        description: Some(
            "The figcaption element represents a caption or legend for the rest of the contents of the figcaption element's parent figure element, if any.",
        ),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/figcaption",
        }],
        browsers: &["C8", "CA18", "E12", "FF4", "FFA4", "S5.1", "SM5"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "main",
        description: Some(
            "The main element represents the main content of the body of a document or application. The main content area consists of content that is directly related to or expands upon the central topic of a document or central functionality of an application.",
        ),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/main",
        }],
        browsers: &["C26", "CA26", "E12", "FF21", "FFA21", "S7", "SM7"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "div",
        description: Some(
            "The div element has no special meaning at all. It represents its children. It can be used with the class, lang, and title attributes to mark up semantics common to a group of consecutive elements.",
        ),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/div",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "a",
        description: Some(
            "If the a element has an href attribute, then it represents a hyperlink (a hypertext anchor) labeled by its contents.",
        ),
        void_element: false,
        attributes: &[
            Attribute {
                name: "href",
                description: Some(
                    "Contains a URL or a URL fragment that the hyperlink points to.\nA URL fragment is a name preceded by a hash mark (`#`), which specifies an internal target location (an [`id`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-id) of an HTML element) within the current document. URLs are not restricted to Web (HTTP)-based documents, but can use any protocol supported by the browser. For example, [`file:`](https://en.wikipedia.org/wiki/File_URI_scheme), `ftp:`, and `mailto:` work in most browsers.\n\n**Note:** You can use `href=\"#top\"` or the empty fragment `href=\"#\"` to link to the top of the current page. [This behavior is specified by HTML5](https://www.w3.org/TR/html5/single-page.html#scroll-to-fragid).",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "target",
                description: Some(
                    "Specifies where to display the linked URL. It is a name of, or keyword for, a _browsing context_: a tab, window, or `<iframe>`. The following keywords have special meanings:\n\n*   `_self`: Load the URL into the same browsing context as the current one. This is the default behavior.\n*   `_blank`: Load the URL into a new browsing context. This is usually a tab, but users can configure browsers to use new windows instead.\n*   `_parent`: Load the URL into the parent browsing context of the current one. If there is no parent, this behaves the same way as `_self`.\n*   `_top`: Load the URL into the top-level browsing context (that is, the \"highest\" browsing context that is an ancestor of the current one, and has no parent). If there is no parent, this behaves the same way as `_self`.\n\n**Note:** When using `target`, consider adding `rel=\"noreferrer\"` to avoid exploitation of the `window.opener` API.\n\n**Note:** Linking to another page using `target=\"_blank\"` will run the new page on the same process as your page. If the new page is executing expensive JS, your page's performance may suffer. To avoid this use `rel=\"noopener\"`.",
                ),
                value_set: Some("target"),
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "download",
                description: Some(
                    "This attribute instructs browsers to download a URL instead of navigating to it, so the user will be prompted to save it as a local file. If the attribute has a value, it is used as the pre-filled file name in the Save prompt (the user can still change the file name if they want). There are no restrictions on allowed values, though `/` and `\\` are converted to underscores. Most file systems limit some punctuation in file names, and browsers will adjust the suggested name accordingly.\n\n**Notes:**\n\n*   This attribute only works for [same-origin URLs](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy).\n*   Although HTTP(s) URLs need to be in the same-origin, [`blob:` URLs](https://developer.mozilla.org/en-US/docs/Web/API/URL.createObjectURL) and [`data:` URLs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs) are allowed so that content generated by JavaScript, such as pictures created in an image-editor Web app, can be downloaded.\n*   If the HTTP header [`Content-Disposition:`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Disposition) gives a different filename than this attribute, the HTTP header takes priority over this attribute.\n*   If `Content-Disposition:` is set to `inline`, Firefox prioritizes `Content-Disposition`, like the filename case, while Chrome prioritizes the `download` attribute.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C14", "CA18", "E18", "FF20", "FFA20", "S10.1", "SM13"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2019-09-19"),
                    high_date: Some("2022-03-19"),
                }),
            },
            Attribute {
                name: "ping",
                description: Some(
                    "Contains a space-separated list of URLs to which, when the hyperlink is followed, [`POST`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/POST \"The HTTP POST method sends data to the server. The type of the body of the request is indicated by the Content-Type header.\") requests with the body `PING` will be sent by the browser (in the background). Typically used for tracking.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C12", "CA18", "E17", "S6", "SM6"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
            Attribute {
                name: "rel",
                description: Some(
                    "Specifies the relationship of the target object to the link object. The value is a space-separated list of [link types](https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types).",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "hreflang",
                description: Some(
                    "This attribute indicates the human language of the linked resource. It is purely advisory, with no built-in functionality. Allowed values are determined by [BCP47](https://www.ietf.org/rfc/bcp/bcp47.txt \"Tags for Identifying Languages\").",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "type",
                description: Some(
                    "Specifies the media type in the form of a [MIME type](https://developer.mozilla.org/en-US/docs/Glossary/MIME_type \"MIME type: A MIME type (now properly called \"media type\", but also sometimes \"content type\") is a string sent along with a file indicating the type of the file (describing the content format, for example, a sound file might be labeled audio/ogg, or an image file image/png).\") for the linked URL. It is purely advisory, with no built-in functionality.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "referrerpolicy",
                description: Some(
                    "Indicates which [referrer](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referer) to send when fetching the URL:\n\n*   `'no-referrer'` means the `Referer:` header will not be sent.\n*   `'no-referrer-when-downgrade'` means no `Referer:` header will be sent when navigating to an origin without HTTPS. This is the default behavior.\n*   `'origin'` means the referrer will be the [origin](https://developer.mozilla.org/en-US/docs/Glossary/Origin) of the page, not including information after the domain.\n*   `'origin-when-cross-origin'` meaning that navigations to other origins will be limited to the scheme, the host and the port, while navigations on the same origin will include the referrer's path.\n*   `'strict-origin-when-cross-origin'`\n*   `'unsafe-url'` means the referrer will include the origin and path, but not the fragment, password, or username. This is unsafe because it can leak data from secure URLs to insecure ones.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C51", "CA51", "E79", "FF50", "FFA50", "S14", "SM14"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2020-09-16"),
                    high_date: Some("2023-03-16"),
                }),
            },
        ],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/a",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "em",
        description: Some("The em element represents stress emphasis of its contents."),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/em",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "strong",
        description: Some(
            "The strong element represents strong importance, seriousness, or urgency for its contents.",
        ),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/strong",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "small",
        description: Some("The small element represents side comments such as small print."),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/small",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "s",
        description: Some(
            "The s element represents contents that are no longer accurate or no longer relevant.",
        ),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/s",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "cite",
        description: Some(
            "The cite element represents a reference to a creative work. It must include the title of the work or the name of the author(person, people or organization) or an URL reference, or a reference in abbreviated form as per the conventions used for the addition of citation metadata.",
        ),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/cite",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "q",
        description: Some(
            "The q element represents some phrasing content quoted from another source.",
        ),
        void_element: false,
        attributes: &[Attribute {
            name: "cite",
            description: Some(
                "The value of this attribute is a URL that designates a source document or message for the information quoted. This attribute is intended to point to information explaining the context or the reference for the quote.",
            ),
            value_set: None,
            references: &[],
            browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S3", "SM2"],
            status: Some(Status {
                baseline: Baseline::High,
                low_date: Some("2015-07-29"),
                high_date: Some("2018-01-29"),
            }),
        }],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/q",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S3", "SM2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "dfn",
        description: Some(
            "The dfn element represents the defining instance of a term. The paragraph, description list group, or section that is the nearest ancestor of the dfn element must also contain the definition(s) for the term given by the dfn element.",
        ),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/dfn",
        }],
        browsers: &["C15", "CA18", "E12", "FF1", "FFA4", "S6", "SM6"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "abbr",
        description: Some(
            "The abbr element represents an abbreviation or acronym, optionally with its expansion. The title attribute may be used to provide an expansion of the abbreviation. The attribute, if specified, must contain an expansion of the abbreviation, and nothing else.",
        ),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/abbr",
        }],
        browsers: &["C2", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "ruby",
        description: Some(
            "The ruby element allows one or more spans of phrasing content to be marked with ruby annotations. Ruby annotations are short runs of text presented alongside base text, primarily used in East Asian typography as a guide for pronunciation or to include other annotations. In Japanese, this form of typography is also known as furigana. Ruby text can appear on either side, and sometimes both sides, of the base text, and it is possible to control its position using CSS. A more complete introduction to ruby can be found in the Use Cases & Exploratory Approaches for Ruby Markup document as well as in CSS Ruby Module Level 1. [RUBY-UC] [CSSRUBY]",
        ),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/ruby",
        }],
        browsers: &["C5", "CA18", "E12", "FF38", "FFA38", "S5", "SM4.2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "rb",
        description: Some(
            "The rb element marks the base text component of a ruby annotation. When it is the child of a ruby element, it doesn't represent anything itself, but its parent ruby element uses it as part of determining what it represents.",
        ),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/rb",
        }],
        browsers: &[],
        status: None,
    },
    Tag {
        name: "rt",
        description: Some(
            "The rt element marks the ruby text component of a ruby annotation. When it is the child of a ruby element or of an rtc element that is itself the child of a ruby element, it doesn't represent anything itself, but its ancestor ruby element uses it as part of determining what it represents.",
        ),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/rt",
        }],
        browsers: &["C5", "CA18", "E12", "FF38", "FFA38", "S5", "SM4.2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "rp",
        description: Some(
            "The rp element is used to provide fallback text to be shown by user agents that don't support ruby annotations. One widespread convention is to provide parentheses around the ruby text component of a ruby annotation.",
        ),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/rp",
        }],
        browsers: &["C5", "CA18", "E12", "FF38", "FFA38", "S5", "SM4.2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "time",
        description: Some(
            "The time element represents its contents, along with a machine-readable form of those contents in the datetime attribute. The kind of content is limited to various kinds of dates, times, time-zone offsets, and durations, as described below.",
        ),
        void_element: false,
        attributes: &[Attribute {
            name: "datetime",
            description: Some(
                "This attribute indicates the time and/or date of the element and must be in one of the formats described below.",
            ),
            value_set: None,
            references: &[],
            browsers: &["C62", "CA62", "E14", "FF22", "FFA22", "S7", "SM4"],
            status: Some(Status {
                baseline: Baseline::High,
                low_date: Some("2017-10-24"),
                high_date: Some("2020-04-24"),
            }),
        }],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/time",
        }],
        browsers: &["C62", "CA62", "E14", "FF22", "FFA22", "S7", "SM4"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2017-10-24"),
            high_date: Some("2020-04-24"),
        }),
    },
    Tag {
        name: "code",
        description: Some(
            "The code element represents a fragment of computer code. This could be an XML element name, a file name, a computer program, or any other string that a computer would recognize.",
        ),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/code",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "var",
        description: Some(
            "The var element represents a variable. This could be an actual variable in a mathematical expression or programming context, an identifier representing a constant, a symbol identifying a physical quantity, a function parameter, or just be a term used as a placeholder in prose.",
        ),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/var",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "samp",
        description: Some(
            "The samp element represents sample or quoted output from another program or computing system.",
        ),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/samp",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "kbd",
        description: Some(
            "The kbd element represents user input (typically keyboard input, although it may also be used to represent other input, such as voice commands).",
        ),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/kbd",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "sub",
        description: Some("The sub element represents a subscript."),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/sub",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "sup",
        description: Some("The sup element represents a superscript."),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/sup",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "i",
        description: Some(
            "The i element represents a span of text in an alternate voice or mood, or otherwise offset from the normal prose in a manner indicating a different quality of text, such as a taxonomic designation, a technical term, an idiomatic phrase from another language, transliteration, a thought, or a ship name in Western texts.",
        ),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/i",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "b",
        description: Some(
            "The b element represents a span of text to which attention is being drawn for utilitarian purposes without conveying any extra importance and with no implication of an alternate voice or mood, such as key words in a document abstract, product names in a review, actionable words in interactive text-driven software, or an article lede.",
        ),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/b",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "u",
        description: Some(
            "The u element represents a span of text with an unarticulated, though explicitly rendered, non-textual annotation, such as labeling the text as being a proper name in Chinese text (a Chinese proper name mark), or labeling the text as being misspelt.",
        ),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/u",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "mark",
        description: Some(
            "The mark element represents a run of text in one document marked or highlighted for reference purposes, due to its relevance in another context. When used in a quotation or other block of text referred to from the prose, it indicates a highlight that was not originally present but which has been added to bring the reader's attention to a part of the text that might not have been considered important by the original author when the block was originally written, but which is now under previously unexpected scrutiny. When used in the main prose of a document, it indicates a part of the document that has been highlighted due to its likely relevance to the user's current activity.",
        ),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/mark",
        }],
        browsers: &["C7", "CA18", "E12", "FF4", "FFA4", "S5.1", "SM5"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "bdi",
        description: Some(
            "The bdi element represents a span of text that is to be isolated from its surroundings for the purposes of bidirectional text formatting. [BIDI]",
        ),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/bdi",
        }],
        browsers: &["C16", "CA18", "E79", "FF10", "FFA10", "S6", "SM6"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2020-01-15"),
            high_date: Some("2022-07-15"),
        }),
    },
    Tag {
        name: "bdo",
        description: Some(
            "The bdo element represents explicit text directionality formatting control for its children. It allows authors to override the Unicode bidirectional algorithm by explicitly specifying a direction override. [BIDI]",
        ),
        void_element: false,
        attributes: &[Attribute {
            name: "dir",
            description: Some(
                "The direction in which text should be rendered in this element's contents. Possible values are:\n\n*   `ltr`: Indicates that the text should go in a left-to-right direction.\n*   `rtl`: Indicates that the text should go in a right-to-left direction.",
            ),
            value_set: None,
            references: &[],
            browsers: &[],
            status: None,
        }],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/bdo",
        }],
        browsers: &["C15", "CA18", "E12", "FF10", "FFA10", "S4", "SM3.2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "span",
        description: Some(
            "The span element doesn't mean anything on its own, but can be useful when used together with the global attributes, e.g. class, lang, or dir. It represents its children.",
        ),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/span",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "br",
        description: Some("The br element represents a line break."),
        void_element: true,
        attributes: &[Attribute {
            name: "clear",
            description: Some("Indicates where to begin the next line after the break."),
            value_set: None,
            references: &[],
            browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
            status: Some(Status {
                baseline: Baseline::Limited,
                low_date: None,
                high_date: None,
            }),
        }],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/br",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "wbr",
        description: Some("The wbr element represents a line break opportunity."),
        void_element: true,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/wbr",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "ins",
        description: Some("The ins element represents an addition to the document."),
        void_element: false,
        attributes: &[
            Attribute {
                name: "cite",
                description: Some(
                    "This attribute defines the URI of a resource that explains the change, such as a link to meeting minutes or a ticket in a troubleshooting system.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "datetime",
                description: Some(
                    "This attribute indicates the time and date of the change and must be a valid date with an optional time string. If the value cannot be parsed as a date with an optional time string, the element does not have an associated time stamp. For the format of the string without a time, see [Format of a valid date string](https://developer.mozilla.org/en-US/docs/Web/HTML/Date_and_time_formats#Format_of_a_valid_date_string \"Certain HTML elements use date and/or time values. The formats of the strings that specify these are described in this article.\") in [Date and time formats used in HTML](https://developer.mozilla.org/en-US/docs/Web/HTML/Date_and_time_formats \"Certain HTML elements use date and/or time values. The formats of the strings that specify these are described in this article.\"). The format of the string if it includes both date and time is covered in [Format of a valid local date and time string](https://developer.mozilla.org/en-US/docs/Web/HTML/Date_and_time_formats#Format_of_a_valid_local_date_and_time_string \"Certain HTML elements use date and/or time values. The formats of the strings that specify these are described in this article.\") in [Date and time formats used in HTML](https://developer.mozilla.org/en-US/docs/Web/HTML/Date_and_time_formats \"Certain HTML elements use date and/or time values. The formats of the strings that specify these are described in this article.\").",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
        ],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/ins",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "del",
        description: Some("The del element represents a removal from the document."),
        void_element: false,
        attributes: &[
            Attribute {
                name: "cite",
                description: Some(
                    "A URI for a resource that explains the change (for example, meeting minutes).",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "datetime",
                description: Some(
                    "This attribute indicates the time and date of the change and must be a valid date string with an optional time. If the value cannot be parsed as a date with an optional time string, the element does not have an associated time stamp. For the format of the string without a time, see [Format of a valid date string](https://developer.mozilla.org/en-US/docs/Web/HTML/Date_and_time_formats#Format_of_a_valid_date_string \"Certain HTML elements use date and/or time values. The formats of the strings that specify these are described in this article.\") in [Date and time formats used in HTML](https://developer.mozilla.org/en-US/docs/Web/HTML/Date_and_time_formats \"Certain HTML elements use date and/or time values. The formats of the strings that specify these are described in this article.\"). The format of the string if it includes both date and time is covered in [Format of a valid local date and time string](https://developer.mozilla.org/en-US/docs/Web/HTML/Date_and_time_formats#Format_of_a_valid_local_date_and_time_string \"Certain HTML elements use date and/or time values. The formats of the strings that specify these are described in this article.\") in [Date and time formats used in HTML](https://developer.mozilla.org/en-US/docs/Web/HTML/Date_and_time_formats \"Certain HTML elements use date and/or time values. The formats of the strings that specify these are described in this article.\").",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
        ],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/del",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "picture",
        description: Some(
            "The picture element is a container which provides multiple sources to its contained img element to allow authors to declaratively control or give hints to the user agent about which image resource to use, based on the screen pixel density, viewport size, image format, and other factors. It represents its children.",
        ),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/picture",
        }],
        browsers: &["C38", "CA38", "E13", "FF38", "FFA38", "S9.1", "SM9.3"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2016-03-21"),
            high_date: Some("2018-09-21"),
        }),
    },
    Tag {
        name: "img",
        description: Some("An img element represents an image."),
        void_element: true,
        attributes: &[
            Attribute {
                name: "alt",
                description: Some(
                    "This attribute defines an alternative text description of the image.\n\n**Note:** Browsers do not always display the image referenced by the element. This is the case for non-graphical browsers (including those used by people with visual impairments), if the user chooses not to display images, or if the browser cannot display the image because it is invalid or an [unsupported type](#Supported_image_formats). In these cases, the browser may replace the image with the text defined in this element's `alt` attribute. You should, for these reasons and others, provide a useful value for `alt` whenever possible.\n\n**Note:** Omitting this attribute altogether indicates that the image is a key part of the content, and no textual equivalent is available. Setting this attribute to an empty string (`alt=\"\"`) indicates that this image is _not_ a key part of the content (decorative), and that non-visual browsers may omit it from rendering.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S3", "SM2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "src",
                description: Some(
                    "The image URL. This attribute is mandatory for the `<img>` element. On browsers supporting `srcset`, `src` is treated like a candidate image with a pixel density descriptor `1x` unless an image with this pixel density descriptor is already defined in `srcset,` or unless `srcset` contains '`w`' descriptors.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "srcset",
                description: Some(
                    "A list of one or more strings separated by commas indicating a set of possible image sources for the user agent to use. Each string is composed of:\n\n1.  a URL to an image,\n2.  optionally, whitespace followed by one of:\n    *   A width descriptor, or a positive integer directly followed by '`w`'. The width descriptor is divided by the source size given in the `sizes` attribute to calculate the effective pixel density.\n    *   A pixel density descriptor, which is a positive floating point number directly followed by '`x`'.\n\nIf no descriptor is specified, the source is assigned the default descriptor: `1x`.\n\nIt is incorrect to mix width descriptors and pixel density descriptors in the same `srcset` attribute. Duplicate descriptors (for instance, two sources in the same `srcset` which are both described with '`2x`') are also invalid.\n\nThe user agent selects any one of the available sources at its discretion. This provides them with significant leeway to tailor their selection based on things like user preferences or bandwidth conditions. See our [Responsive images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images) tutorial for an example.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C34", "CA34", "E12", "FF38", "FFA38", "S8", "SM8"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "crossorigin",
                description: Some(
                    "This enumerated attribute indicates if the fetching of the related image must be done using CORS or not. [CORS-enabled images](https://developer.mozilla.org/en-US/docs/CORS_Enabled_Image) can be reused in the [`<canvas>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas \"Use the HTML <canvas> element with either the canvas scripting API or the WebGL API to draw graphics and animations.\") element without being \"[tainted](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image#What_is_a_tainted_canvas).\" The allowed values are:\n`anonymous`\n\nA cross-origin request (i.e., with `Origin:` HTTP header) is performed, but no credential is sent (i.e., no cookie, X.509 certificate, or HTTP Basic authentication). If the server does not give credentials to the origin site (by not setting the [`Access-Control-Allow-Origin`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin \"The Access-Control-Allow-Origin response header indicates whether the response can be shared with requesting code from the given origin.\") HTTP header), the image will be tainted and its usage restricted.\n\n`use-credentials`\n\nA cross-origin request (i.e., with the [`Origin`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Origin \"The Origin request header indicates where a fetch originates from. It doesn't include any path information, but only the server name. It is sent with CORS requests, as well as with POST requests. It is similar to the Referer header, but, unlike this header, it doesn't disclose the whole path.\") HTTP header) performed along with credentials sent (i.e., a cookie, certificate, or HTTP Basic authentication). If the server does not give credentials to the origin site (through the `Access-Control-Allow-Credentials` HTTP header), the image will be tainted and its usage restricted.\n\nIf the attribute is not present, the resource is fetched without a CORS request (i.e., without sending the `Origin` HTTP header), preventing its non-tainted usage in [`<canvas>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas \"Use the HTML <canvas> element with either the canvas scripting API or the WebGL API to draw graphics and animations.\") elements. If invalid, it is handled as if the `anonymous` value was used. See [CORS settings attributes](https://developer.mozilla.org/en-US/docs/HTML/CORS_settings_attributes) for additional information.",
                ),
                value_set: Some("xo"),
                references: &[],
                browsers: &["C13", "CA18", "E12", "FF8", "FFA8", "S6", "SM6"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "usemap",
                description: Some(
                    "The partial URL (starting with '#') of an [image map](https://developer.mozilla.org/en-US/docs/HTML/Element/map) associated with the element.\n\n**Note:** You cannot use this attribute if the `<img>` element is a descendant of an [`<a>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a \"The HTML <a> element (or anchor element) creates a hyperlink to other web pages, files, locations within the same page, email addresses, or any other URL.\") or [`<button>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button \"The HTML <button> element represents a clickable button, which can be used in forms or anywhere in a document that needs simple, standard button functionality.\") element.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S3", "SM2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "ismap",
                description: Some(
                    "This Boolean attribute indicates that the image is part of a server-side map. If so, the precise coordinates of a click are sent to the server.\n\n**Note:** This attribute is allowed only if the `<img>` element is a descendant of an [`<a>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a \"The HTML <a> element (or anchor element) creates a hyperlink to other web pages, files, locations within the same page, email addresses, or any other URL.\") element with a valid [`href`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attr-href) attribute.",
                ),
                value_set: Some("v"),
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S3", "SM2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "width",
                description: Some("The intrinsic width of the image in pixels."),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S3", "SM2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "height",
                description: Some("The intrinsic height of the image in pixels."),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S3", "SM2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "decoding",
                description: Some(
                    "Provides an image decoding hint to the browser. The allowed values are:\n`sync`\n\nDecode the image synchronously for atomic presentation with other content.\n\n`async`\n\nDecode the image asynchronously to reduce delay in presenting other content.\n\n`auto`\n\nDefault mode, which indicates no preference for the decoding mode. The browser decides what is best for the user.",
                ),
                value_set: Some("decoding"),
                references: &[],
                browsers: &["C65", "CA65", "E79", "FF63", "FFA63", "S11.1", "SM11.3"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("≤2020-01-15"),
                    high_date: Some("≤2022-07-15"),
                }),
            },
            Attribute {
                name: "loading",
                description: Some("Indicates how the browser should load the image."),
                value_set: Some("loading"),
                references: &[],
                browsers: &["C77", "CA77", "E79", "FF75", "FFA79", "S15.4", "SM15.4"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2022-03-14"),
                    high_date: Some("2024-09-14"),
                }),
            },
            Attribute {
                name: "fetchpriority",
                description: Some(
                    "Provides a hint of the relative priority to use when fetching the image.",
                ),
                value_set: Some("fetchpriority"),
                references: &[],
                browsers: &[
                    "C101", "CA101", "E101", "FF132", "FFA132", "S17.2", "SM17.2",
                ],
                status: Some(Status {
                    baseline: Baseline::Low,
                    low_date: Some("2024-10-29"),
                    high_date: None,
                }),
            },
            Attribute {
                name: "referrerpolicy",
                description: Some(
                    "A string indicating which referrer to use when fetching the resource:\n\n*   `no-referrer:` The [`Referer`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referer \"The Referer request header contains the address of the previous web page from which a link to the currently requested page was followed. The Referer header allows servers to identify where people are visiting them from and may use that data for analytics, logging, or optimized caching, for example.\") header will not be sent.\n*   `no-referrer-when-downgrade:` No `Referer` header will be sent when navigating to an origin without TLS (HTTPS). This is a user agent’s default behavior if no policy is otherwise specified.\n*   `origin:` The `Referer` header will include the page of origin's scheme, the host, and the port.\n*   `origin-when-cross-origin:` Navigating to other origins will limit the included referral data to the scheme, the host and the port, while navigating from the same origin will include the referrer's full path.\n*   `unsafe-url:` The `Referer` header will include the origin and the path, but not the fragment, password, or username. This case is unsafe because it can leak origins and paths from TLS-protected resources to insecure origins.",
                ),
                value_set: Some("referrerpolicy"),
                references: &[],
                browsers: &["C51", "CA51", "E79", "FF50", "FFA50", "S14", "SM14"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2020-09-16"),
                    high_date: Some("2023-03-16"),
                }),
            },
            Attribute {
                name: "sizes",
                description: Some(
                    "A list of one or more strings separated by commas indicating a set of source sizes. Each source size consists of:\n\n1.  a media condition. This must be omitted for the last item.\n2.  a source size value.\n\nSource size values specify the intended display size of the image. User agents use the current source size to select one of the sources supplied by the `srcset` attribute, when those sources are described using width ('`w`') descriptors. The selected source size affects the intrinsic size of the image (the image’s display size if no CSS styling is applied). If the `srcset` attribute is absent, or contains no values with a width (`w`) descriptor, then the `sizes` attribute has no effect.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C38", "CA38", "E12", "FF38", "FFA38", "S9.1", "SM9.3"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2016-03-21"),
                    high_date: Some("2018-09-21"),
                }),
            },
            Attribute {
                name: "importance",
                description: Some(
                    "Indicates the relative importance of the resource. Priority hints are delegated using the values:",
                ),
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "importance",
                description: Some(
                    "`auto`: Indicates **no preference**. The browser may use its own heuristics to decide the priority of the image.\n\n`high`: Indicates to the browser that the image is of **high** priority.\n\n`low`: Indicates to the browser that the image is of **low** priority.",
                ),
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "intrinsicsize",
                description: Some(
                    "This attribute tells the browser to ignore the actual intrinsic size of the image and pretend it’s the size specified in the attribute. Specifically, the image would raster at these dimensions and `naturalWidth`/`naturalHeight` on images would return the values specified in this attribute. [Explainer](https://github.com/ojanvafai/intrinsicsize-attribute), [examples](https://googlechrome.github.io/samples/intrinsic-size/index.html)",
                ),
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
        ],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/img",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "iframe",
        description: Some("The iframe element represents a nested browsing context."),
        void_element: false,
        attributes: &[
            Attribute {
                name: "src",
                description: Some(
                    "The URL of the page to embed. Use a value of `about:blank` to embed an empty page that conforms to the [same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy#Inherited_origins). Also note that programatically removing an `<iframe>`'s src attribute (e.g. via [`Element.removeAttribute()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/removeAttribute \"The Element method removeAttribute() removes the attribute with the specified name from the element.\")) causes `about:blank` to be loaded in the frame in Firefox (from version 65), Chromium-based browsers, and Safari/iOS.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "srcdoc",
                description: Some(
                    "Inline HTML to embed, overriding the `src` attribute. If a browser does not support the `srcdoc` attribute, it will fall back to the URL in the `src` attribute.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C20", "CA25", "E79", "FF25", "FFA25", "S6", "SM6"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2020-01-15"),
                    high_date: Some("2022-07-15"),
                }),
            },
            Attribute {
                name: "name",
                description: Some(
                    "A targetable name for the embedded browsing context. This can be used in the `target` attribute of the [`<a>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a \"The HTML <a> element (or anchor element) creates a hyperlink to other web pages, files, locations within the same page, email addresses, or any other URL.\"), [`<form>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form \"The HTML <form> element represents a document section that contains interactive controls for submitting information to a web server.\"), or [`<base>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base \"The HTML <base> element specifies the base URL to use for all relative URLs contained within a document. There can be only one <base> element in a document.\") elements; the `formtarget` attribute of the [`<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input \"The HTML <input> element is used to create interactive controls for web-based forms in order to accept data from the user; a wide variety of types of input data and control widgets are available, depending on the device and user agent.\") or [`<button>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button \"The HTML <button> element represents a clickable button, which can be used in forms or anywhere in a document that needs simple, standard button functionality.\") elements; or the `windowName` parameter in the [`window.open()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/open \"The Window interface's open() method loads the specified resource into the browsing context (window, <iframe> or tab) with the specified name. If the name doesn't exist, then a new window is opened and the specified resource is loaded into its browsing context.\") method.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "sandbox",
                description: Some(
                    "Applies extra restrictions to the content in the frame. The value of the attribute can either be empty to apply all restrictions, or space-separated tokens to lift particular restrictions:\n\n*   `allow-forms`: Allows the resource to submit forms. If this keyword is not used, form submission is blocked.\n*   `allow-modals`: Lets the resource [open modal windows](https://html.spec.whatwg.org/multipage/origin.html#sandboxed-modals-flag).\n*   `allow-orientation-lock`: Lets the resource [lock the screen orientation](https://developer.mozilla.org/en-US/docs/Web/API/Screen/lockOrientation).\n*   `allow-pointer-lock`: Lets the resource use the [Pointer Lock API](https://developer.mozilla.org/en-US/docs/WebAPI/Pointer_Lock).\n*   `allow-popups`: Allows popups (such as `window.open()`, `target=\"_blank\"`, or `showModalDialog()`). If this keyword is not used, the popup will silently fail to open.\n*   `allow-popups-to-escape-sandbox`: Lets the sandboxed document open new windows without those windows inheriting the sandboxing. For example, this can safely sandbox an advertisement without forcing the same restrictions upon the page the ad links to.\n*   `allow-presentation`: Lets the resource start a [presentation session](https://developer.mozilla.org/en-US/docs/Web/API/PresentationRequest).\n*   `allow-same-origin`: If this token is not used, the resource is treated as being from a special origin that always fails the [same-origin policy](https://developer.mozilla.org/en-US/docs/Glossary/same-origin_policy \"same-origin policy: The same-origin policy is a critical security mechanism that restricts how a document or script loaded from one origin can interact with a resource from another origin.\").\n*   `allow-scripts`: Lets the resource run scripts (but not create popup windows).\n*   `allow-storage-access-by-user-activation` : Lets the resource request access to the parent's storage capabilities with the [Storage Access API](https://developer.mozilla.org/en-US/docs/Web/API/Storage_Access_API).\n*   `allow-top-navigation`: Lets the resource navigate the top-level browsing context (the one named `_top`).\n*   `allow-top-navigation-by-user-activation`: Lets the resource navigate the top-level browsing context, but only if initiated by a user gesture.\n\n**Notes about sandboxing:**\n\n*   When the embedded document has the same origin as the embedding page, it is **strongly discouraged** to use both `allow-scripts` and `allow-same-origin`, as that lets the embedded document remove the `sandbox` attribute — making it no more secure than not using the `sandbox` attribute at all.\n*   Sandboxing is useless if the attacker can display content outside a sandboxed `iframe` — such as if the viewer opens the frame in a new tab. Such content should be also served from a _separate origin_ to limit potential damage.\n*   The `sandbox` attribute is unsupported in Internet Explorer 9 and earlier.",
                ),
                value_set: Some("sb"),
                references: &[],
                browsers: &["C5", "CA18", "E12", "FF17", "FFA17", "S5", "SM4"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "seamless",
                description: None,
                value_set: Some("v"),
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "allowfullscreen",
                description: Some(
                    "Set to `true` if the `<iframe>` can activate fullscreen mode by calling the [`requestFullscreen()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen \"The Element.requestFullscreen() method issues an asynchronous request to make the element be displayed in full-screen mode.\") method.\nThis attribute is considered a legacy attribute and redefined as `allow=\"fullscreen\"`.",
                ),
                value_set: Some("v"),
                references: &[],
                browsers: &["C38", "CA38", "E12", "FF18", "FFA18", "S10.1"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
            Attribute {
                name: "width",
                description: Some("The width of the frame in CSS pixels. Default is `300`."),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "height",
                description: Some("The height of the frame in CSS pixels. Default is `150`."),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "allow",
                description: Some(
                    "Specifies a [feature policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Feature_Policy) for the `<iframe>`.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C60", "CA60", "E79", "FF74", "FFA79", "S11.1", "SM11.3"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2020-07-28"),
                    high_date: Some("2023-01-28"),
                }),
            },
            Attribute {
                name: "allowpaymentrequest",
                description: Some(
                    "Set to `true` if a cross-origin `<iframe>` should be allowed to invoke the [Payment Request API](https://developer.mozilla.org/en-US/docs/Web/API/Payment_Request_API).",
                ),
                value_set: None,
                references: &[],
                browsers: &["C60", "CA60", "E79"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
            Attribute {
                name: "allowpaymentrequest",
                description: Some(
                    "This attribute is considered a legacy attribute and redefined as `allow=\"payment\"`.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C60", "CA60", "E79"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
            Attribute {
                name: "csp",
                description: Some(
                    "A [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) enforced for the embedded resource. See [`HTMLIFrameElement.csp`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLIFrameElement/csp \"The csp property of the HTMLIFrameElement interface specifies the Content Security Policy that an embedded document must agree to enforce upon itself.\") for details.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C61", "CA61", "E79"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
            Attribute {
                name: "importance",
                description: Some(
                    "The download priority of the resource in the `<iframe>`'s `src` attribute. Allowed values:\n\n`auto` (default)\n\nNo preference. The browser uses its own heuristics to decide the priority of the resource.\n\n`high`\n\nThe resource should be downloaded before other lower-priority page resources.\n\n`low`\n\nThe resource should be downloaded after other higher-priority page resources.",
                ),
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "referrerpolicy",
                description: Some(
                    "Indicates which [referrer](https://developer.mozilla.org/en-US/docs/Web/API/Document/referrer) to send when fetching the frame's resource:\n\n*   `no-referrer`: The [`Referer`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referer \"The Referer request header contains the address of the previous web page from which a link to the currently requested page was followed. The Referer header allows servers to identify where people are visiting them from and may use that data for analytics, logging, or optimized caching, for example.\") header will not be sent.\n*   `no-referrer-when-downgrade` (default): The [`Referer`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referer \"The Referer request header contains the address of the previous web page from which a link to the currently requested page was followed. The Referer header allows servers to identify where people are visiting them from and may use that data for analytics, logging, or optimized caching, for example.\") header will not be sent to [origin](https://developer.mozilla.org/en-US/docs/Glossary/origin \"origin: Web content's origin is defined by the scheme (protocol), host (domain), and port of the URL used to access it. Two objects have the same origin only when the scheme, host, and port all match.\")s without [TLS](https://developer.mozilla.org/en-US/docs/Glossary/TLS \"TLS: Transport Layer Security (TLS), previously known as Secure Sockets Layer (SSL), is a protocol used by applications to communicate securely across a network, preventing tampering with and eavesdropping on email, web browsing, messaging, and other protocols.\") ([HTTPS](https://developer.mozilla.org/en-US/docs/Glossary/HTTPS \"HTTPS: HTTPS (HTTP Secure) is an encrypted version of the HTTP protocol. It usually uses SSL or TLS to encrypt all communication between a client and a server. This secure connection allows clients to safely exchange sensitive data with a server, for example for banking activities or online shopping.\")).\n*   `origin`: The sent referrer will be limited to the origin of the referring page: its [scheme](https://developer.mozilla.org/en-US/docs/Archive/Mozilla/URIScheme), [host](https://developer.mozilla.org/en-US/docs/Glossary/host \"host: A host is a device connected to the Internet (or a local network). Some hosts called servers offer additional services like serving webpages or storing files and emails.\"), and [port](https://developer.mozilla.org/en-US/docs/Glossary/port \"port: For a computer connected to a network with an IP address, a port is a communication endpoint. Ports are designated by numbers, and below 1024 each port is associated by default with a specific protocol.\").\n*   `origin-when-cross-origin`: The referrer sent to other origins will be limited to the scheme, the host, and the port. Navigations on the same origin will still include the path.\n*   `same-origin`: A referrer will be sent for [same origin](https://developer.mozilla.org/en-US/docs/Glossary/Same-origin_policy \"same origin: The same-origin policy is a critical security mechanism that restricts how a document or script loaded from one origin can interact with a resource from another origin.\"), but cross-origin requests will contain no referrer information.\n*   `strict-origin`: Only send the origin of the document as the referrer when the protocol security level stays the same (HTTPS→HTTPS), but don't send it to a less secure destination (HTTPS→HTTP).\n*   `strict-origin-when-cross-origin`: Send a full URL when performing a same-origin request, only send the origin when the protocol security level stays the same (HTTPS→HTTPS), and send no header to a less secure destination (HTTPS→HTTP).\n*   `unsafe-url`: The referrer will include the origin _and_ the path (but not the [fragment](https://developer.mozilla.org/en-US/docs/Web/API/HTMLHyperlinkElementUtils/hash), [password](https://developer.mozilla.org/en-US/docs/Web/API/HTMLHyperlinkElementUtils/password), or [username](https://developer.mozilla.org/en-US/docs/Web/API/HTMLHyperlinkElementUtils/username)). **This value is unsafe**, because it leaks origins and paths from TLS-protected resources to insecure origins.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C51", "CA51", "E79", "FF50", "FFA50", "S14", "SM14"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2020-09-16"),
                    high_date: Some("2023-03-16"),
                }),
            },
        ],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/iframe",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "embed",
        description: Some(
            "The embed element provides an integration point for an external (typically non-HTML) application or interactive content.",
        ),
        void_element: true,
        attributes: &[
            Attribute {
                name: "src",
                description: Some("The URL of the resource being embedded."),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "type",
                description: Some("The MIME type to use to select the plug-in to instantiate."),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E79", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2020-01-15"),
                    high_date: Some("2022-07-15"),
                }),
            },
            Attribute {
                name: "width",
                description: Some(
                    "The displayed width of the resource, in [CSS pixels](https://drafts.csswg.org/css-values/#px). This must be an absolute value; percentages are _not_ allowed.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "height",
                description: Some(
                    "The displayed height of the resource, in [CSS pixels](https://drafts.csswg.org/css-values/#px). This must be an absolute value; percentages are _not_ allowed.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
        ],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/embed",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "object",
        description: Some(
            "The object element can represent an external resource, which, depending on the type of the resource, will either be treated as an image, as a nested browsing context, or as an external resource to be processed by a plugin.",
        ),
        void_element: false,
        attributes: &[
            Attribute {
                name: "data",
                description: Some(
                    "The address of the resource as a valid URL. At least one of **data** and **type** must be defined.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S3", "SM2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "type",
                description: Some(
                    "The [content type](https://developer.mozilla.org/en-US/docs/Glossary/Content_type) of the resource specified by **data**. At least one of **data** and **type** must be defined.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S3", "SM2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "typemustmatch",
                description: Some(
                    "This Boolean attribute indicates if the **type** attribute and the actual [content type](https://developer.mozilla.org/en-US/docs/Glossary/Content_type) of the resource must match to be used.",
                ),
                value_set: Some("v"),
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "name",
                description: Some(
                    "The name of valid browsing context (HTML5), or the name of the control (HTML 4).",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S3", "SM2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "usemap",
                description: Some(
                    "A hash-name reference to a [`<map>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/map \"The HTML <map> element is used with <area> elements to define an image map (a clickable link area).\") element; that is a '#' followed by the value of a [`name`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/map#attr-name) of a map element.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S3", "SM2"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
            Attribute {
                name: "form",
                description: Some(
                    "The form element, if any, that the object element is associated with (its _form owner_). The value of the attribute must be an ID of a [`<form>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form \"The HTML <form> element represents a document section that contains interactive controls for submitting information to a web server.\") element in the same document.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S3", "SM2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "width",
                description: Some(
                    "The width of the display resource, in [CSS pixels](https://drafts.csswg.org/css-values/#px). -- (Absolute values only. [NO percentages](https://html.spec.whatwg.org/multipage/embedded-content.html#dimension-attributes))",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S3", "SM2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "height",
                description: Some(
                    "The height of the displayed resource, in [CSS pixels](https://drafts.csswg.org/css-values/#px). -- (Absolute values only. [NO percentages](https://html.spec.whatwg.org/multipage/embedded-content.html#dimension-attributes))",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S3", "SM2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "archive",
                description: Some(
                    "A space-separated list of URIs for archives of resources for the object.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S3", "SM2"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
            Attribute {
                name: "border",
                description: Some("The width of a border around the control, in pixels."),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S3", "SM2"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
            Attribute {
                name: "classid",
                description: Some(
                    "The URI of the object's implementation. It can be used together with, or in place of, the **data** attribute.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S3", "SM2"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
            Attribute {
                name: "codebase",
                description: Some(
                    "The base path used to resolve relative URIs specified by **classid**, **data**, or **archive**. If not specified, the default is the base URI of the current document.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S3", "SM2"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
            Attribute {
                name: "codetype",
                description: Some("The content type of the data specified by **classid**."),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S3", "SM2"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
            Attribute {
                name: "declare",
                description: Some(
                    "The presence of this Boolean attribute makes this element a declaration only. The object must be instantiated by a subsequent `<object>` element. In HTML5, repeat the <object> element completely each that that the resource is reused.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S3", "SM2"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
            Attribute {
                name: "standby",
                description: Some(
                    "A message that the browser can show while loading the object's implementation and data.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S3", "SM2"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
            Attribute {
                name: "tabindex",
                description: Some(
                    "The position of the element in the tabbing navigation order for the current document.",
                ),
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
        ],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/object",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S3", "SM2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "param",
        description: Some(
            "The param element defines parameters for plugins invoked by object elements. It does not represent anything on its own.",
        ),
        void_element: true,
        attributes: &[
            Attribute {
                name: "name",
                description: Some("Name of the parameter."),
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "value",
                description: Some("Specifies the value of the parameter."),
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "type",
                description: Some(
                    "Only used if the `valuetype` is set to \"ref\". Specifies the MIME type of values found at the URI specified by value.",
                ),
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "valuetype",
                description: Some(
                    "Specifies the type of the `value` attribute. Possible values are:\n\n*   data: Default value. The value is passed to the object's implementation as a string.\n*   ref: The value is a URI to a resource where run-time values are stored.\n*   object: An ID of another [`<object>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/object \"The HTML <object> element represents an external resource, which can be treated as an image, a nested browsing context, or a resource to be handled by a plugin.\") in the same document.",
                ),
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
        ],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/param",
        }],
        browsers: &[],
        status: None,
    },
    Tag {
        name: "video",
        description: Some(
            "A video element is used for playing videos or movies, and audio files with captions.",
        ),
        void_element: false,
        attributes: &[
            Attribute {
                name: "src",
                description: None,
                value_set: None,
                references: &[],
                browsers: &["C3", "CA18", "E12", "FF3.5", "FFA4", "S3.1", "SM3"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "crossorigin",
                description: None,
                value_set: Some("xo"),
                references: &[],
                browsers: &["C33", "CA33", "E18", "FF74", "FFA79", "S10", "SM10"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2020-07-28"),
                    high_date: Some("2023-01-28"),
                }),
            },
            Attribute {
                name: "poster",
                description: None,
                value_set: None,
                references: &[],
                browsers: &["C3", "CA18", "E12", "FF3.6", "FFA4", "S3.1", "SM3"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "preload",
                description: None,
                value_set: Some("pl"),
                references: &[],
                browsers: &["C3", "CA18", "E12", "FF4", "FFA4", "S3.1", "SM3"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "autoplay",
                description: Some(
                    "A Boolean attribute; if specified, the video automatically begins to play back as soon as it can do so without stopping to finish loading the data.\n**Note**: Sites that automatically play audio (or video with an audio track) can be an unpleasant experience for users, so it should be avoided when possible. If you must offer autoplay functionality, you should make it opt-in (requiring a user to specifically enable it). However, this can be useful when creating media elements whose source will be set at a later time, under user control.\n\nTo disable video autoplay, `autoplay=\"false\"` will not work; the video will autoplay if the attribute is there in the `<video>` tag at all. To remove autoplay the attribute needs to be removed altogether.\n\nIn some browsers (e.g. Chrome 70.0) autoplay is not working if no `muted` attribute is present.",
                ),
                value_set: Some("v"),
                references: &[],
                browsers: &["C3", "CA18", "E12", "FF3.5", "FFA4", "S3.1", "SM10"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2016-09-13"),
                    high_date: Some("2019-03-13"),
                }),
            },
            Attribute {
                name: "mediagroup",
                description: None,
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "loop",
                description: None,
                value_set: Some("v"),
                references: &[],
                browsers: &["C3", "CA18", "E12", "FF11", "FFA14", "S3.1", "SM6"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "muted",
                description: None,
                value_set: Some("v"),
                references: &[],
                browsers: &["C30", "CA30", "E12", "FF11", "FFA14", "S5", "SM4.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "controls",
                description: None,
                value_set: Some("v"),
                references: &[],
                browsers: &["C3", "CA18", "E12", "FF3.5", "FFA4", "S3.1", "SM3"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "width",
                description: None,
                value_set: None,
                references: &[],
                browsers: &["C3", "CA18", "E12", "FF3.5", "FFA4", "S3.1", "SM3"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "height",
                description: None,
                value_set: None,
                references: &[],
                browsers: &["C3", "CA18", "E12", "FF3.5", "FFA4", "S3.1", "SM3"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
        ],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/video",
        }],
        browsers: &["C3", "CA18", "E12", "FF3.5", "FFA4", "S3.1", "SM3"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "audio",
        description: Some("An audio element represents a sound or audio stream."),
        void_element: false,
        attributes: &[
            Attribute {
                name: "src",
                description: Some(
                    "The URL of the audio to embed. This is subject to [HTTP access controls](https://developer.mozilla.org/en-US/docs/HTTP_access_control). This is optional; you may instead use the [`<source>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/source \"The HTML <source> element specifies multiple media resources for the <picture>, the <audio> element, or the <video> element.\") element within the audio block to specify the audio to embed.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C3", "CA18", "E12", "FF3.5", "FFA4", "S3.1", "SM3"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "crossorigin",
                description: Some(
                    "This enumerated attribute indicates whether to use CORS to fetch the related image. [CORS-enabled resources](https://developer.mozilla.org/en-US/docs/CORS_Enabled_Image) can be reused in the [`<canvas>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas \"Use the HTML <canvas> element with either the canvas scripting API or the WebGL API to draw graphics and animations.\") element without being _tainted_. The allowed values are:\n\nanonymous\n\nSends a cross-origin request without a credential. In other words, it sends the `Origin:` HTTP header without a cookie, X.509 certificate, or performing HTTP Basic authentication. If the server does not give credentials to the origin site (by not setting the `Access-Control-Allow-Origin:` HTTP header), the image will be _tainted_, and its usage restricted.\n\nuse-credentials\n\nSends a cross-origin request with a credential. In other words, it sends the `Origin:` HTTP header with a cookie, a certificate, or performing HTTP Basic authentication. If the server does not give credentials to the origin site (through `Access-Control-Allow-Credentials:` HTTP header), the image will be _tainted_ and its usage restricted.\n\nWhen not present, the resource is fetched without a CORS request (i.e. without sending the `Origin:` HTTP header), preventing its non-tainted used in [`<canvas>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas \"Use the HTML <canvas> element with either the canvas scripting API or the WebGL API to draw graphics and animations.\") elements. If invalid, it is handled as if the enumerated keyword **anonymous** was used. See [CORS settings attributes](https://developer.mozilla.org/en-US/docs/HTML/CORS_settings_attributes) for additional information.",
                ),
                value_set: Some("xo"),
                references: &[],
                browsers: &["C33", "CA33", "E18", "FF74", "FFA79", "S10", "SM10"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2020-07-28"),
                    high_date: Some("2023-01-28"),
                }),
            },
            Attribute {
                name: "preload",
                description: Some(
                    "This enumerated attribute is intended to provide a hint to the browser about what the author thinks will lead to the best user experience. It may have one of the following values:\n\n*   `none`: Indicates that the audio should not be preloaded.\n*   `metadata`: Indicates that only audio metadata (e.g. length) is fetched.\n*   `auto`: Indicates that the whole audio file can be downloaded, even if the user is not expected to use it.\n*   _empty string_: A synonym of the `auto` value.\n\nIf not set, `preload`'s default value is browser-defined (i.e. each browser may have its own default value). The spec advises it to be set to `metadata`.\n\n**Usage notes:**\n\n*   The `autoplay` attribute has precedence over `preload`. If `autoplay` is specified, the browser would obviously need to start downloading the audio for playback.\n*   The browser is not forced by the specification to follow the value of this attribute; it is a mere hint.",
                ),
                value_set: Some("pl"),
                references: &[],
                browsers: &["C3", "CA18", "E12", "FF4", "FFA4", "S3.1", "SM3"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "autoplay",
                description: Some(
                    "A Boolean attribute: if specified, the audio will automatically begin playback as soon as it can do so, without waiting for the entire audio file to finish downloading.\n\n**Note**: Sites that automatically play audio (or videos with an audio track) can be an unpleasant experience for users, so should be avoided when possible. If you must offer autoplay functionality, you should make it opt-in (requiring a user to specifically enable it). However, this can be useful when creating media elements whose source will be set at a later time, under user control.",
                ),
                value_set: Some("v"),
                references: &[],
                browsers: &[],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
            Attribute {
                name: "mediagroup",
                description: None,
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "loop",
                description: Some(
                    "A Boolean attribute: if specified, the audio player will automatically seek back to the start upon reaching the end of the audio.",
                ),
                value_set: Some("v"),
                references: &[],
                browsers: &["C3", "CA18", "E12", "FF11", "FFA14", "S3.1", "SM3"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "muted",
                description: Some(
                    "A Boolean attribute that indicates whether the audio will be initially silenced. Its default value is `false`.",
                ),
                value_set: Some("v"),
                references: &[],
                browsers: &["C15", "CA18", "E18", "FF11", "FFA14", "S6", "SM6"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("≤2018-10-02"),
                    high_date: Some("≤2021-04-02"),
                }),
            },
            Attribute {
                name: "controls",
                description: Some(
                    "If this attribute is present, the browser will offer controls to allow the user to control audio playback, including volume, seeking, and pause/resume playback.",
                ),
                value_set: Some("v"),
                references: &[],
                browsers: &["C3", "CA18", "E12", "FF3.5", "FFA4", "S3.1", "SM3"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
        ],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/audio",
        }],
        browsers: &["C3", "CA18", "E12", "FF3.5", "FFA4", "S3.1", "SM3"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "source",
        description: Some(
            "The source element allows authors to specify multiple alternative media resources for media elements. It does not represent anything on its own.",
        ),
        void_element: true,
        attributes: &[
            Attribute {
                name: "src",
                description: Some(
                    "Required for [`<audio>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio \"The HTML <audio> element is used to embed sound content in documents. It may contain one or more audio sources, represented using the src attribute or the <source> element: the browser will choose the most suitable one. It can also be the destination for streamed media, using a MediaStream.\") and [`<video>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video \"The HTML Video element (<video>) embeds a media player which supports video playback into the document.\"), address of the media resource. The value of this attribute is ignored when the `<source>` element is placed inside a [`<picture>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/picture \"The HTML <picture> element contains zero or more <source> elements and one <img> element to provide versions of an image for different display/device scenarios.\") element.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C3", "CA18", "E12", "FF3.5", "FFA4", "S3.1", "SM2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "type",
                description: Some(
                    "The MIME-type of the resource, optionally with a `codecs` parameter. See [RFC 4281](https://tools.ietf.org/html/rfc4281) for information about how to specify codecs.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C3", "CA18", "E12", "FF3.5", "FFA4", "S3.1", "SM2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "sizes",
                description: Some(
                    "Is a list of source sizes that describes the final rendered width of the image represented by the source. Each source size consists of a comma-separated list of media condition-length pairs. This information is used by the browser to determine, before laying the page out, which image defined in [`srcset`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/source#attr-srcset) to use.  \nThe `sizes` attribute has an effect only when the [`<source>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/source \"The HTML <source> element specifies multiple media resources for the <picture>, the <audio> element, or the <video> element.\") element is the direct child of a [`<picture>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/picture \"The HTML <picture> element contains zero or more <source> elements and one <img> element to provide versions of an image for different display/device scenarios.\") element.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C34", "CA34", "E13", "FF38", "FFA38", "S9.1", "SM9.3"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2016-03-21"),
                    high_date: Some("2018-09-21"),
                }),
            },
            Attribute {
                name: "srcset",
                description: Some(
                    "A list of one or more strings separated by commas indicating a set of possible images represented by the source for the browser to use. Each string is composed of:\n\n1.  one URL to an image,\n2.  a width descriptor, that is a positive integer directly followed by `'w'`. The default value, if missing, is the infinity.\n3.  a pixel density descriptor, that is a positive floating number directly followed by `'x'`. The default value, if missing, is `1x`.\n\nEach string in the list must have at least a width descriptor or a pixel density descriptor to be valid. Among the list, there must be only one string containing the same tuple of width descriptor and pixel density descriptor.  \nThe browser chooses the most adequate image to display at a given point of time.  \nThe `srcset` attribute has an effect only when the [`<source>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/source \"The HTML <source> element specifies multiple media resources for the <picture>, the <audio> element, or the <video> element.\") element is the direct child of a [`<picture>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/picture \"The HTML <picture> element contains zero or more <source> elements and one <img> element to provide versions of an image for different display/device scenarios.\") element.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C34", "CA34", "E13", "FF38", "FFA38", "S9.1", "SM9.3"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2016-03-21"),
                    high_date: Some("2018-09-21"),
                }),
            },
            Attribute {
                name: "media",
                description: Some(
                    "[Media query](https://developer.mozilla.org/en-US/docs/CSS/Media_queries) of the resource's intended media; this should be used only in a [`<picture>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/picture \"The HTML <picture> element contains zero or more <source> elements and one <img> element to provide versions of an image for different display/device scenarios.\") element.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C3", "CA18", "E12", "FF15", "FFA15", "S3.1", "SM2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
        ],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/source",
        }],
        browsers: &["C3", "CA18", "E12", "FF3.5", "FFA4", "S3.1", "SM2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "track",
        description: Some(
            "The track element allows authors to specify explicit external timed text tracks for media elements. It does not represent anything on its own.",
        ),
        void_element: true,
        attributes: &[
            Attribute {
                name: "default",
                description: Some(
                    "This attribute indicates that the track should be enabled unless the user's preferences indicate that another track is more appropriate. This may only be used on one `track` element per media element.",
                ),
                value_set: Some("v"),
                references: &[],
                browsers: &["C23", "CA25", "E12", "FF31", "FFA31", "S6", "SM6"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "kind",
                description: Some(
                    "How the text track is meant to be used. If omitted the default kind is `subtitles`. If the attribute is not present, it will use the `subtitles`. If the attribute contains an invalid value, it will use `metadata`. (Versions of Chrome earlier than 52 treated an invalid value as `subtitles`.) The following keywords are allowed:\n\n*   `subtitles`\n    *   Subtitles provide translation of content that cannot be understood by the viewer. For example dialogue or text that is not English in an English language film.\n    *   Subtitles may contain additional content, usually extra background information. For example the text at the beginning of the Star Wars films, or the date, time, and location of a scene.\n*   `captions`\n    *   Closed captions provide a transcription and possibly a translation of audio.\n    *   It may include important non-verbal information such as music cues or sound effects. It may indicate the cue's source (e.g. music, text, character).\n    *   Suitable for users who are deaf or when the sound is muted.\n*   `descriptions`\n    *   Textual description of the video content.\n    *   Suitable for users who are blind or where the video cannot be seen.\n*   `chapters`\n    *   Chapter titles are intended to be used when the user is navigating the media resource.\n*   `metadata`\n    *   Tracks used by scripts. Not visible to the user.",
                ),
                value_set: Some("tk"),
                references: &[],
                browsers: &["C23", "CA25", "E12", "FF31", "FFA31", "S6", "SM6"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "label",
                description: Some(
                    "A user-readable title of the text track which is used by the browser when listing available text tracks.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C23", "CA25", "E12", "FF31", "FFA31", "S6", "SM6"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "src",
                description: Some(
                    "Address of the track (`.vtt` file). Must be a valid URL. This attribute must be specified and its URL value must have the same origin as the document — unless the [`<audio>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio \"The HTML <audio> element is used to embed sound content in documents. It may contain one or more audio sources, represented using the src attribute or the <source> element: the browser will choose the most suitable one. It can also be the destination for streamed media, using a MediaStream.\") or [`<video>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video \"The HTML Video element (<video>) embeds a media player which supports video playback into the document.\") parent element of the `track` element has a [`crossorigin`](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes) attribute.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C23", "CA25", "E12", "FF50", "FFA50", "S6", "SM6"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2016-11-15"),
                    high_date: Some("2019-05-15"),
                }),
            },
            Attribute {
                name: "srclang",
                description: Some(
                    "Language of the track text data. It must be a valid [BCP 47](https://r12a.github.io/app-subtags/) language tag. If the `kind` attribute is set to `subtitles,` then `srclang` must be defined.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C23", "CA25", "E12", "FF31", "FFA31", "S6", "SM6"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
        ],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/track",
        }],
        browsers: &["C23", "CA25", "E12", "FF31", "FFA31", "S6", "SM6"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "map",
        description: Some(
            "The map element, in conjunction with an img element and any area element descendants, defines an image map. The element represents its children.",
        ),
        void_element: false,
        attributes: &[Attribute {
            name: "name",
            description: Some(
                "The name attribute gives the map a name so that it can be referenced. The attribute must be present and must have a non-empty value with no space characters. The value of the name attribute must not be a compatibility-caseless match for the value of the name attribute of another map element in the same document. If the id attribute is also specified, both attributes must have the same value.",
            ),
            value_set: None,
            references: &[],
            browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
            status: Some(Status {
                baseline: Baseline::High,
                low_date: Some("2015-07-29"),
                high_date: Some("2018-01-29"),
            }),
        }],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/map",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "area",
        description: Some(
            "The area element represents either a hyperlink with some text and a corresponding area on an image map, or a dead area on an image map.",
        ),
        void_element: true,
        attributes: &[
            Attribute {
                name: "alt",
                description: None,
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "coords",
                description: None,
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "shape",
                description: None,
                value_set: Some("sh"),
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "href",
                description: None,
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "target",
                description: None,
                value_set: Some("target"),
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "download",
                description: None,
                value_set: None,
                references: &[],
                browsers: &["C54", "CA54", "E12", "FF20", "FFA20", "S10.1", "SM10.3"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2017-03-27"),
                    high_date: Some("2019-09-27"),
                }),
            },
            Attribute {
                name: "ping",
                description: None,
                value_set: None,
                references: &[],
                browsers: &["C12", "CA18", "E17", "S6", "SM6"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
            Attribute {
                name: "rel",
                description: None,
                value_set: None,
                references: &[],
                browsers: &["C16", "CA18", "E12", "FF30", "FFA30", "S5", "SM4.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "hreflang",
                description: None,
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "type",
                description: None,
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "accesskey",
                description: Some(
                    "Specifies a keyboard navigation accelerator for the element. Pressing ALT or a similar key in association with the specified character selects the form control correlated with that key sequence. Page designers are forewarned to avoid key sequences already bound to browsers. This attribute is global since HTML5.",
                ),
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
        ],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/area",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "table",
        description: Some(
            "The table element represents data with more than one dimension, in the form of a table.",
        ),
        void_element: false,
        attributes: &[
            Attribute {
                name: "border",
                description: None,
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
            Attribute {
                name: "align",
                description: Some(
                    "This enumerated attribute indicates how the table must be aligned inside the containing document. It may have the following values:\n\n*   left: the table is displayed on the left side of the document;\n*   center: the table is displayed in the center of the document;\n*   right: the table is displayed on the right side of the document.\n\n**Usage Note**\n\n*   **Do not use this attribute**, as it has been deprecated. The [`<table>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/table \"The HTML <table> element represents tabular data — that is, information presented in a two-dimensional table comprised of rows and columns of cells containing data.\") element should be styled using [CSS](https://developer.mozilla.org/en-US/docs/CSS). Set [`margin-left`](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-left \"The margin-left CSS property sets the margin area on the left side of an element. A positive value places it farther from its neighbors, while a negative value places it closer.\") and [`margin-right`](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-right \"The margin-right CSS property sets the margin area on the right side of an element. A positive value places it farther from its neighbors, while a negative value places it closer.\") to `auto` or [`margin`](https://developer.mozilla.org/en-US/docs/Web/CSS/margin \"The margin CSS property sets the margin area on all four sides of an element. It is a shorthand for margin-top, margin-right, margin-bottom, and margin-left.\") to `0 auto` to achieve an effect that is similar to the align attribute.\n*   Prior to Firefox 4, Firefox also supported the `middle`, `absmiddle`, and `abscenter` values as synonyms of `center`, in quirks mode only.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
        ],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/table",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "caption",
        description: Some(
            "The caption element represents the title of the table that is its parent, if it has a parent and that is a table element.",
        ),
        void_element: false,
        attributes: &[Attribute {
            name: "align",
            description: Some(
                "This enumerated attribute indicates how the caption must be aligned with respect to the table. It may have one of the following values:\n\n`left`\n\nThe caption is displayed to the left of the table.\n\n`top`\n\nThe caption is displayed above the table.\n\n`right`\n\nThe caption is displayed to the right of the table.\n\n`bottom`\n\nThe caption is displayed below the table.\n\n**Usage note:** Do not use this attribute, as it has been deprecated. The [`<caption>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/caption \"The HTML Table Caption element (<caption>) specifies the caption (or title) of a table, and if used is always the first child of a <table>.\") element should be styled using the [CSS](https://developer.mozilla.org/en-US/docs/CSS) properties [`caption-side`](https://developer.mozilla.org/en-US/docs/Web/CSS/caption-side \"The caption-side CSS property puts the content of a table's <caption> on the specified side. The values are relative to the writing-mode of the table.\") and [`text-align`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align \"The text-align CSS property sets the horizontal alignment of an inline or table-cell box. This means it works like vertical-align but in the horizontal direction.\").",
            ),
            value_set: None,
            references: &[],
            browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
            status: Some(Status {
                baseline: Baseline::Limited,
                low_date: None,
                high_date: None,
            }),
        }],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/caption",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "colgroup",
        description: Some(
            "The colgroup element represents a group of one or more columns in the table that is its parent, if it has a parent and that is a table element.",
        ),
        void_element: false,
        attributes: &[
            Attribute {
                name: "span",
                description: None,
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "align",
                description: Some(
                    "This enumerated attribute specifies how horizontal alignment of each column cell content will be handled. Possible values are:\n\n*   `left`, aligning the content to the left of the cell\n*   `center`, centering the content in the cell\n*   `right`, aligning the content to the right of the cell\n*   `justify`, inserting spaces into the textual content so that the content is justified in the cell\n*   `char`, aligning the textual content on a special character with a minimal offset, defined by the [`char`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/col#attr-char) and [`charoff`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/col#attr-charoff) attributes Unimplemented (see [bug 2212](https://bugzilla.mozilla.org/show_bug.cgi?id=2212 \"character alignment not implemented (align=char, charoff=, text-align:<string>)\")).\n\nIf this attribute is not set, the `left` value is assumed. The descendant [`<col>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/col \"The HTML <col> element defines a column within a table and is used for defining common semantics on all common cells. It is generally found within a <colgroup> element.\") elements may override this value using their own [`align`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/col#attr-align) attribute.\n\n**Note:** Do not use this attribute as it is obsolete (not supported) in the latest standard.\n\n*   To achieve the same effect as the `left`, `center`, `right` or `justify` values:\n    *   Do not try to set the [`text-align`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align \"The text-align CSS property sets the horizontal alignment of an inline or table-cell box. This means it works like vertical-align but in the horizontal direction.\") property on a selector giving a [`<colgroup>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/colgroup \"The HTML <colgroup> element defines a group of columns within a table.\") element. Because [`<td>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/td \"The HTML <td> element defines a cell of a table that contains data. It participates in the table model.\") elements are not descendant of the [`<colgroup>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/colgroup \"The HTML <colgroup> element defines a group of columns within a table.\") element, they won't inherit it.\n    *   If the table doesn't use a [`colspan`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/td#attr-colspan) attribute, use one `td:nth-child(an+b)` CSS selector per column, where a is the total number of the columns in the table and b is the ordinal position of this column in the table. Only after this selector the [`text-align`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align \"The text-align CSS property sets the horizontal alignment of an inline or table-cell box. This means it works like vertical-align but in the horizontal direction.\") property can be used.\n    *   If the table does use a [`colspan`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/td#attr-colspan) attribute, the effect can be achieved by combining adequate CSS attribute selectors like `[colspan=n]`, though this is not trivial.\n*   To achieve the same effect as the `char` value, in CSS3, you can use the value of the [`char`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/colgroup#attr-char) as the value of the [`text-align`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align \"The text-align CSS property sets the horizontal alignment of an inline or table-cell box. This means it works like vertical-align but in the horizontal direction.\") property Unimplemented.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
        ],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/colgroup",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "col",
        description: Some(
            "If a col element has a parent and that is a colgroup element that itself has a parent that is a table element, then the col element represents one or more columns in the column group represented by that colgroup.",
        ),
        void_element: true,
        attributes: &[
            Attribute {
                name: "span",
                description: None,
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "align",
                description: Some(
                    "This enumerated attribute specifies how horizontal alignment of each column cell content will be handled. Possible values are:\n\n*   `left`, aligning the content to the left of the cell\n*   `center`, centering the content in the cell\n*   `right`, aligning the content to the right of the cell\n*   `justify`, inserting spaces into the textual content so that the content is justified in the cell\n*   `char`, aligning the textual content on a special character with a minimal offset, defined by the [`char`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/col#attr-char) and [`charoff`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/col#attr-charoff) attributes Unimplemented (see [bug 2212](https://bugzilla.mozilla.org/show_bug.cgi?id=2212 \"character alignment not implemented (align=char, charoff=, text-align:<string>)\")).\n\nIf this attribute is not set, its value is inherited from the [`align`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/colgroup#attr-align) of the [`<colgroup>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/colgroup \"The HTML <colgroup> element defines a group of columns within a table.\") element this `<col>` element belongs too. If there are none, the `left` value is assumed.\n\n**Note:** Do not use this attribute as it is obsolete (not supported) in the latest standard.\n\n*   To achieve the same effect as the `left`, `center`, `right` or `justify` values:\n    *   Do not try to set the [`text-align`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align \"The text-align CSS property sets the horizontal alignment of an inline or table-cell box. This means it works like vertical-align but in the horizontal direction.\") property on a selector giving a [`<col>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/col \"The HTML <col> element defines a column within a table and is used for defining common semantics on all common cells. It is generally found within a <colgroup> element.\") element. Because [`<td>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/td \"The HTML <td> element defines a cell of a table that contains data. It participates in the table model.\") elements are not descendant of the [`<col>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/col \"The HTML <col> element defines a column within a table and is used for defining common semantics on all common cells. It is generally found within a <colgroup> element.\") element, they won't inherit it.\n    *   If the table doesn't use a [`colspan`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/td#attr-colspan) attribute, use the `td:nth-child(an+b)` CSS selector. Set `a` to zero and `b` to the position of the column in the table, e.g. `td:nth-child(2) { text-align: right; }` to right-align the second column.\n    *   If the table does use a [`colspan`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/td#attr-colspan) attribute, the effect can be achieved by combining adequate CSS attribute selectors like `[colspan=n]`, though this is not trivial.\n*   To achieve the same effect as the `char` value, in CSS3, you can use the value of the [`char`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/col#attr-char) as the value of the [`text-align`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align \"The text-align CSS property sets the horizontal alignment of an inline or table-cell box. This means it works like vertical-align but in the horizontal direction.\") property Unimplemented.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
        ],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/col",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "tbody",
        description: Some(
            "The tbody element represents a block of rows that consist of a body of data for the parent table element, if the tbody element has a parent and it is a table.",
        ),
        void_element: false,
        attributes: &[Attribute {
            name: "align",
            description: Some(
                "This enumerated attribute specifies how horizontal alignment of each cell content will be handled. Possible values are:\n\n*   `left`, aligning the content to the left of the cell\n*   `center`, centering the content in the cell\n*   `right`, aligning the content to the right of the cell\n*   `justify`, inserting spaces into the textual content so that the content is justified in the cell\n*   `char`, aligning the textual content on a special character with a minimal offset, defined by the [`char`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/tbody#attr-char) and [`charoff`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/tbody#attr-charoff) attributes.\n\nIf this attribute is not set, the `left` value is assumed.\n\n**Note:** Do not use this attribute as it is obsolete (not supported) in the latest standard.\n\n*   To achieve the same effect as the `left`, `center`, `right` or `justify` values, use the CSS [`text-align`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align \"The text-align CSS property sets the horizontal alignment of an inline or table-cell box. This means it works like vertical-align but in the horizontal direction.\") property on it.\n*   To achieve the same effect as the `char` value, in CSS3, you can use the value of the [`char`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/tbody#attr-char) as the value of the [`text-align`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align \"The text-align CSS property sets the horizontal alignment of an inline or table-cell box. This means it works like vertical-align but in the horizontal direction.\") property Unimplemented.",
            ),
            value_set: None,
            references: &[],
            browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S3", "SM2"],
            status: Some(Status {
                baseline: Baseline::Limited,
                low_date: None,
                high_date: None,
            }),
        }],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/tbody",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "thead",
        description: Some(
            "The thead element represents the block of rows that consist of the column labels (headers) for the parent table element, if the thead element has a parent and it is a table.",
        ),
        void_element: false,
        attributes: &[Attribute {
            name: "align",
            description: Some(
                "This enumerated attribute specifies how horizontal alignment of each cell content will be handled. Possible values are:\n\n*   `left`, aligning the content to the left of the cell\n*   `center`, centering the content in the cell\n*   `right`, aligning the content to the right of the cell\n*   `justify`, inserting spaces into the textual content so that the content is justified in the cell\n*   `char`, aligning the textual content on a special character with a minimal offset, defined by the [`char`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/thead#attr-char) and [`charoff`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/thead#attr-charoff) attributes Unimplemented (see [bug 2212](https://bugzilla.mozilla.org/show_bug.cgi?id=2212 \"character alignment not implemented (align=char, charoff=, text-align:<string>)\")).\n\nIf this attribute is not set, the `left` value is assumed.\n\n**Note:** Do not use this attribute as it is obsolete (not supported) in the latest standard.\n\n*   To achieve the same effect as the `left`, `center`, `right` or `justify` values, use the CSS [`text-align`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align \"The text-align CSS property sets the horizontal alignment of an inline or table-cell box. This means it works like vertical-align but in the horizontal direction.\") property on it.\n*   To achieve the same effect as the `char` value, in CSS3, you can use the value of the [`char`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/thead#attr-char) as the value of the [`text-align`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align \"The text-align CSS property sets the horizontal alignment of an inline or table-cell box. This means it works like vertical-align but in the horizontal direction.\") property Unimplemented.",
            ),
            value_set: None,
            references: &[],
            browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S3", "SM2"],
            status: Some(Status {
                baseline: Baseline::Limited,
                low_date: None,
                high_date: None,
            }),
        }],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/thead",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "tfoot",
        description: Some(
            "The tfoot element represents the block of rows that consist of the column summaries (footers) for the parent table element, if the tfoot element has a parent and it is a table.",
        ),
        void_element: false,
        attributes: &[Attribute {
            name: "align",
            description: Some(
                "This enumerated attribute specifies how horizontal alignment of each cell content will be handled. Possible values are:\n\n*   `left`, aligning the content to the left of the cell\n*   `center`, centering the content in the cell\n*   `right`, aligning the content to the right of the cell\n*   `justify`, inserting spaces into the textual content so that the content is justified in the cell\n*   `char`, aligning the textual content on a special character with a minimal offset, defined by the [`char`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/tbody#attr-char) and [`charoff`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/tbody#attr-charoff) attributes Unimplemented (see [bug 2212](https://bugzilla.mozilla.org/show_bug.cgi?id=2212 \"character alignment not implemented (align=char, charoff=, text-align:<string>)\")).\n\nIf this attribute is not set, the `left` value is assumed.\n\n**Note:** Do not use this attribute as it is obsolete (not supported) in the latest standard.\n\n*   To achieve the same effect as the `left`, `center`, `right` or `justify` values, use the CSS [`text-align`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align \"The text-align CSS property sets the horizontal alignment of an inline or table-cell box. This means it works like vertical-align but in the horizontal direction.\") property on it.\n*   To achieve the same effect as the `char` value, in CSS3, you can use the value of the [`char`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/tfoot#attr-char) as the value of the [`text-align`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align \"The text-align CSS property sets the horizontal alignment of an inline or table-cell box. This means it works like vertical-align but in the horizontal direction.\") property Unimplemented.",
            ),
            value_set: None,
            references: &[],
            browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S3", "SM2"],
            status: Some(Status {
                baseline: Baseline::Limited,
                low_date: None,
                high_date: None,
            }),
        }],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/tfoot",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "tr",
        description: Some("The tr element represents a row of cells in a table."),
        void_element: false,
        attributes: &[Attribute {
            name: "align",
            description: Some(
                "A [`DOMString`](https://developer.mozilla.org/en-US/docs/Web/API/DOMString \"DOMString is a UTF-16 String. As JavaScript already uses such strings, DOMString is mapped directly to a String.\") which specifies how the cell's context should be aligned horizontally within the cells in the row; this is shorthand for using `align` on every cell in the row individually. Possible values are:\n\n`left`\n\nAlign the content of each cell at its left edge.\n\n`center`\n\nCenter the contents of each cell between their left and right edges.\n\n`right`\n\nAlign the content of each cell at its right edge.\n\n`justify`\n\nWiden whitespaces within the text of each cell so that the text fills the full width of each cell (full justification).\n\n`char`\n\nAlign each cell in the row on a specific character (such that each row in the column that is configured this way will horizontally align its cells on that character). This uses the [`char`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/tr#attr-char) and [`charoff`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/tr#attr-charoff) to establish the alignment character (typically \".\" or \",\" when aligning numerical data) and the number of characters that should follow the alignment character. This alignment type was never widely supported.\n\nIf no value is expressly set for `align`, the parent node's value is inherited.\n\nInstead of using the obsolete `align` attribute, you should instead use the CSS [`text-align`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align \"The text-align CSS property sets the horizontal alignment of an inline or table-cell box. This means it works like vertical-align but in the horizontal direction.\") property to establish `left`, `center`, `right`, or `justify` alignment for the row's cells. To apply character-based alignment, set the CSS [`text-align`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align \"The text-align CSS property sets the horizontal alignment of an inline or table-cell box. This means it works like vertical-align but in the horizontal direction.\") property to the alignment character (such as `\".\"` or `\",\"`).",
            ),
            value_set: None,
            references: &[],
            browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S3", "SM2"],
            status: Some(Status {
                baseline: Baseline::Limited,
                low_date: None,
                high_date: None,
            }),
        }],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/tr",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "td",
        description: Some("The td element represents a data cell in a table."),
        void_element: false,
        attributes: &[
            Attribute {
                name: "colspan",
                description: None,
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "rowspan",
                description: None,
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "headers",
                description: None,
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "abbr",
                description: Some(
                    "This attribute contains a short abbreviated description of the cell's content. Some user-agents, such as speech readers, may present this description before the content itself.\n\n**Note:** Do not use this attribute as it is obsolete in the latest standard. Alternatively, you can put the abbreviated description inside the cell and place the long content in the **title** attribute.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
            Attribute {
                name: "align",
                description: Some(
                    "This enumerated attribute specifies how the cell content's horizontal alignment will be handled. Possible values are:\n\n*   `left`: The content is aligned to the left of the cell.\n*   `center`: The content is centered in the cell.\n*   `right`: The content is aligned to the right of the cell.\n*   `justify` (with text only): The content is stretched out inside the cell so that it covers its entire width.\n*   `char` (with text only): The content is aligned to a character inside the `<th>` element with minimal offset. This character is defined by the [`char`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/td#attr-char) and [`charoff`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/td#attr-charoff) attributes Unimplemented (see [bug 2212](https://bugzilla.mozilla.org/show_bug.cgi?id=2212 \"character alignment not implemented (align=char, charoff=, text-align:<string>)\")).\n\nThe default value when this attribute is not specified is `left`.\n\n**Note:** Do not use this attribute as it is obsolete in the latest standard.\n\n*   To achieve the same effect as the `left`, `center`, `right` or `justify` values, apply the CSS [`text-align`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align \"The text-align CSS property sets the horizontal alignment of an inline or table-cell box. This means it works like vertical-align but in the horizontal direction.\") property to the element.\n*   To achieve the same effect as the `char` value, give the [`text-align`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align \"The text-align CSS property sets the horizontal alignment of an inline or table-cell box. This means it works like vertical-align but in the horizontal direction.\") property the same value you would use for the [`char`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/td#attr-char). Unimplemented in CSS3.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S3", "SM2"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
            Attribute {
                name: "axis",
                description: Some(
                    "This attribute contains a list of space-separated strings. Each string is the `id` of a group of cells that this header applies to.\n\n**Note:** Do not use this attribute as it is obsolete in the latest standard.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
            Attribute {
                name: "bgcolor",
                description: Some(
                    "This attribute defines the background color of each cell in a column. It consists of a 6-digit hexadecimal code as defined in [sRGB](https://www.w3.org/Graphics/Color/sRGB) and is prefixed by '#'. This attribute may be used with one of sixteen predefined color strings:\n\n \n\n`black` = \"#000000\"\n\n \n\n`green` = \"#008000\"\n\n \n\n`silver` = \"#C0C0C0\"\n\n \n\n`lime` = \"#00FF00\"\n\n \n\n`gray` = \"#808080\"\n\n \n\n`olive` = \"#808000\"\n\n \n\n`white` = \"#FFFFFF\"\n\n \n\n`yellow` = \"#FFFF00\"\n\n \n\n`maroon` = \"#800000\"\n\n \n\n`navy` = \"#000080\"\n\n \n\n`red` = \"#FF0000\"\n\n \n\n`blue` = \"#0000FF\"\n\n \n\n`purple` = \"#800080\"\n\n \n\n`teal` = \"#008080\"\n\n \n\n`fuchsia` = \"#FF00FF\"\n\n \n\n`aqua` = \"#00FFFF\"\n\n**Note:** Do not use this attribute, as it is non-standard and only implemented in some versions of Microsoft Internet Explorer: The [`<td>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/td \"The HTML <td> element defines a cell of a table that contains data. It participates in the table model.\") element should be styled using [CSS](https://developer.mozilla.org/en-US/docs/CSS). To create a similar effect use the [`background-color`](https://developer.mozilla.org/en-US/docs/Web/CSS/background-color \"The background-color CSS property sets the background color of an element.\") property in [CSS](https://developer.mozilla.org/en-US/docs/CSS) instead.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
        ],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/td",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "th",
        description: Some("The th element represents a header cell in a table."),
        void_element: false,
        attributes: &[
            Attribute {
                name: "colspan",
                description: None,
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "rowspan",
                description: None,
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "headers",
                description: None,
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "scope",
                description: None,
                value_set: Some("s"),
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "sorted",
                description: None,
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "abbr",
                description: Some(
                    "This attribute contains a short abbreviated description of the cell's content. Some user-agents, such as speech readers, may present this description before the content itself.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "align",
                description: Some(
                    "This enumerated attribute specifies how the cell content's horizontal alignment will be handled. Possible values are:\n\n*   `left`: The content is aligned to the left of the cell.\n*   `center`: The content is centered in the cell.\n*   `right`: The content is aligned to the right of the cell.\n*   `justify` (with text only): The content is stretched out inside the cell so that it covers its entire width.\n*   `char` (with text only): The content is aligned to a character inside the `<th>` element with minimal offset. This character is defined by the [`char`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/th#attr-char) and [`charoff`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/th#attr-charoff) attributes.\n\nThe default value when this attribute is not specified is `left`.\n\n**Note:** Do not use this attribute as it is obsolete in the latest standard.\n\n*   To achieve the same effect as the `left`, `center`, `right` or `justify` values, apply the CSS [`text-align`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align \"The text-align CSS property sets the horizontal alignment of an inline or table-cell box. This means it works like vertical-align but in the horizontal direction.\") property to the element.\n*   To achieve the same effect as the `char` value, give the [`text-align`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align \"The text-align CSS property sets the horizontal alignment of an inline or table-cell box. This means it works like vertical-align but in the horizontal direction.\") property the same value you would use for the [`char`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/th#attr-char). Unimplemented in CSS3.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S3", "SM2"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
            Attribute {
                name: "axis",
                description: Some(
                    "This attribute contains a list of space-separated strings. Each string is the `id` of a group of cells that this header applies to.\n\n**Note:** Do not use this attribute as it is obsolete in the latest standard: use the [`scope`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/th#attr-scope) attribute instead.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
            Attribute {
                name: "bgcolor",
                description: Some(
                    "This attribute defines the background color of each cell in a column. It consists of a 6-digit hexadecimal code as defined in [sRGB](https://www.w3.org/Graphics/Color/sRGB) and is prefixed by '#'. This attribute may be used with one of sixteen predefined color strings:\n\n \n\n`black` = \"#000000\"\n\n \n\n`green` = \"#008000\"\n\n \n\n`silver` = \"#C0C0C0\"\n\n \n\n`lime` = \"#00FF00\"\n\n \n\n`gray` = \"#808080\"\n\n \n\n`olive` = \"#808000\"\n\n \n\n`white` = \"#FFFFFF\"\n\n \n\n`yellow` = \"#FFFF00\"\n\n \n\n`maroon` = \"#800000\"\n\n \n\n`navy` = \"#000080\"\n\n \n\n`red` = \"#FF0000\"\n\n \n\n`blue` = \"#0000FF\"\n\n \n\n`purple` = \"#800080\"\n\n \n\n`teal` = \"#008080\"\n\n \n\n`fuchsia` = \"#FF00FF\"\n\n \n\n`aqua` = \"#00FFFF\"\n\n**Note:** Do not use this attribute, as it is non-standard and only implemented in some versions of Microsoft Internet Explorer: The [`<th>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/th \"The HTML <th> element defines a cell as header of a group of table cells. The exact nature of this group is defined by the scope and headers attributes.\") element should be styled using [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS). To create a similar effect use the [`background-color`](https://developer.mozilla.org/en-US/docs/Web/CSS/background-color \"The background-color CSS property sets the background color of an element.\") property in [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) instead.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
        ],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/th",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "form",
        description: Some(
            "The form element represents a collection of form-associated elements, some of which can represent editable values that can be submitted to a server for processing.",
        ),
        void_element: false,
        attributes: &[
            Attribute {
                name: "accept-charset",
                description: Some(
                    "A space- or comma-delimited list of character encodings that the server accepts. The browser uses them in the order in which they are listed. The default value, the reserved string `\"UNKNOWN\"`, indicates the same encoding as that of the document containing the form element.  \nIn previous versions of HTML, the different character encodings could be delimited by spaces or commas. In HTML5, only spaces are allowed as delimiters.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S3", "SM2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "action",
                description: Some(
                    "The URI of a program that processes the form information. This value can be overridden by a [`formaction`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-formaction) attribute on a [`<button>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button \"The HTML <button> element represents a clickable button, which can be used in forms or anywhere in a document that needs simple, standard button functionality.\") or [`<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input \"The HTML <input> element is used to create interactive controls for web-based forms in order to accept data from the user; a wide variety of types of input data and control widgets are available, depending on the device and user agent.\") element.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S3", "SM2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "autocomplete",
                description: Some(
                    "Indicates whether input elements can by default have their values automatically completed by the browser. This setting can be overridden by an `autocomplete` attribute on an element belonging to the form. Possible values are:\n\n*   `off`: The user must explicitly enter a value into each field for every use, or the document provides its own auto-completion method; the browser does not automatically complete entries.\n*   `on`: The browser can automatically complete values based on values that the user has previously entered in the form.\n\nFor most modern browsers (including Firefox 38+, Google Chrome 34+, IE 11+) setting the autocomplete attribute will not prevent a browser's password manager from asking the user if they want to store login fields (username and password), if the user permits the storage the browser will autofill the login the next time the user visits the page. See [The autocomplete attribute and login fields](https://developer.mozilla.org/en-US/docs/Web/Security/Securing_your_site/Turning_off_form_autocompletion#The_autocomplete_attribute_and_login_fields).\n**Note:** If you set `autocomplete` to `off` in a form because the document provides its own auto-completion, then you should also set `autocomplete` to `off` for each of the form's `input` elements that the document can auto-complete. For details, see the note regarding Google Chrome in the [Browser Compatibility chart](#compatChart).",
                ),
                value_set: Some("o"),
                references: &[],
                browsers: &["C14", "CA18", "E12", "FF4", "FFA4", "S6", "SM6"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "enctype",
                description: Some(
                    "When the value of the `method` attribute is `post`, enctype is the [MIME type](https://en.wikipedia.org/wiki/Mime_type) of content that is used to submit the form to the server. Possible values are:\n\n*   `application/x-www-form-urlencoded`: The default value if the attribute is not specified.\n*   `multipart/form-data`: The value used for an [`<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input \"The HTML <input> element is used to create interactive controls for web-based forms in order to accept data from the user; a wide variety of types of input data and control widgets are available, depending on the device and user agent.\") element with the `type` attribute set to \"file\".\n*   `text/plain`: (HTML5)\n\nThis value can be overridden by a [`formenctype`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-formenctype) attribute on a [`<button>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button \"The HTML <button> element represents a clickable button, which can be used in forms or anywhere in a document that needs simple, standard button functionality.\") or [`<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input \"The HTML <input> element is used to create interactive controls for web-based forms in order to accept data from the user; a wide variety of types of input data and control widgets are available, depending on the device and user agent.\") element.",
                ),
                value_set: Some("et"),
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S3", "SM2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "method",
                description: Some(
                    "The [HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP) method that the browser uses to submit the form. Possible values are:\n\n*   `post`: Corresponds to the HTTP [POST method](https://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9.5) ; form data are included in the body of the form and sent to the server.\n*   `get`: Corresponds to the HTTP [GET method](https://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9.3); form data are appended to the `action` attribute URI with a '?' as separator, and the resulting URI is sent to the server. Use this method when the form has no side-effects and contains only ASCII characters.\n*   `dialog`: Use when the form is inside a [`<dialog>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog \"The HTML <dialog> element represents a dialog box or other interactive component, such as an inspector or window.\") element to close the dialog when submitted.\n\nThis value can be overridden by a [`formmethod`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-formmethod) attribute on a [`<button>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button \"The HTML <button> element represents a clickable button, which can be used in forms or anywhere in a document that needs simple, standard button functionality.\") or [`<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input \"The HTML <input> element is used to create interactive controls for web-based forms in order to accept data from the user; a wide variety of types of input data and control widgets are available, depending on the device and user agent.\") element.",
                ),
                value_set: Some("m"),
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S3", "SM2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "name",
                description: Some(
                    "The name of the form. In HTML 4, its use is deprecated (`id` should be used instead). It must be unique among the forms in a document and not just an empty string in HTML 5.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S3", "SM2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "novalidate",
                description: Some(
                    "This Boolean attribute indicates that the form is not to be validated when submitted. If this attribute is not specified (and therefore the form is validated), this default setting can be overridden by a [`formnovalidate`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-formnovalidate) attribute on a [`<button>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button \"The HTML <button> element represents a clickable button, which can be used in forms or anywhere in a document that needs simple, standard button functionality.\") or [`<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input \"The HTML <input> element is used to create interactive controls for web-based forms in order to accept data from the user; a wide variety of types of input data and control widgets are available, depending on the device and user agent.\") element belonging to the form.",
                ),
                value_set: Some("v"),
                references: &[],
                browsers: &["C10", "CA18", "E12", "FF4", "FFA4", "S10.1", "SM10.3"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2017-03-27"),
                    high_date: Some("2019-09-27"),
                }),
            },
            Attribute {
                name: "target",
                description: Some(
                    "A name or keyword indicating where to display the response that is received after submitting the form. In HTML 4, this is the name/keyword for a frame. In HTML5, it is a name/keyword for a _browsing context_ (for example, tab, window, or inline frame). The following keywords have special meanings:\n\n*   `_self`: Load the response into the same HTML 4 frame (or HTML5 browsing context) as the current one. This value is the default if the attribute is not specified.\n*   `_blank`: Load the response into a new unnamed HTML 4 window or HTML5 browsing context.\n*   `_parent`: Load the response into the HTML 4 frameset parent of the current frame, or HTML5 parent browsing context of the current one. If there is no parent, this option behaves the same way as `_self`.\n*   `_top`: HTML 4: Load the response into the full original window, and cancel all other frames. HTML5: Load the response into the top-level browsing context (i.e., the browsing context that is an ancestor of the current one, and has no parent). If there is no parent, this option behaves the same way as `_self`.\n*   _iframename_: The response is displayed in a named [`<iframe>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe \"The HTML Inline Frame element (<iframe>) represents a nested browsing context, embedding another HTML page into the current one.\").\n\nHTML5: This value can be overridden by a [`formtarget`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-formtarget) attribute on a [`<button>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button \"The HTML <button> element represents a clickable button, which can be used in forms or anywhere in a document that needs simple, standard button functionality.\") or [`<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input \"The HTML <input> element is used to create interactive controls for web-based forms in order to accept data from the user; a wide variety of types of input data and control widgets are available, depending on the device and user agent.\") element.",
                ),
                value_set: Some("target"),
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S3", "SM2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "accept",
                description: Some(
                    "A comma-separated list of content types that the server accepts.\n\n**Usage note:** This attribute has been removed in HTML5 and should no longer be used. Instead, use the [`accept`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-accept) attribute of the specific [`<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input \"The HTML <input> element is used to create interactive controls for web-based forms in order to accept data from the user; a wide variety of types of input data and control widgets are available, depending on the device and user agent.\") element.",
                ),
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "autocapitalize",
                description: Some(
                    "This is a nonstandard attribute used by iOS Safari Mobile which controls whether and how the text value for textual form control descendants should be automatically capitalized as it is entered/edited by the user. If the `autocapitalize` attribute is specified on an individual form control descendant, it trumps the form-wide `autocapitalize` setting. The non-deprecated values are available in iOS 5 and later. The default value is `sentences`. Possible values are:\n\n*   `none`: Completely disables automatic capitalization\n*   `sentences`: Automatically capitalize the first letter of sentences.\n*   `words`: Automatically capitalize the first letter of words.\n*   `characters`: Automatically capitalize all characters.\n*   `on`: Deprecated since iOS 5.\n*   `off`: Deprecated since iOS 5.",
                ),
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
        ],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/form",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S3", "SM2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "label",
        description: Some(
            "The label element represents a caption in a user interface. The caption can be associated with a specific form control, known as the label element's labeled control, either using the for attribute, or by putting the form control inside the label element itself.",
        ),
        void_element: false,
        attributes: &[
            Attribute {
                name: "form",
                description: Some(
                    "The [`<form>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form \"The HTML <form> element represents a document section that contains interactive controls for submitting information to a web server.\") element with which the label is associated (its _form owner_). If specified, the value of the attribute is the `id` of a [`<form>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form \"The HTML <form> element represents a document section that contains interactive controls for submitting information to a web server.\") element in the same document. This lets you place label elements anywhere within a document, not just as descendants of their form elements.",
                ),
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "for",
                description: Some(
                    "The [`id`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-id) of a [labelable](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Content_categories#Form_labelable) form-related element in the same document as the `<label>` element. The first element in the document with an `id` matching the value of the `for` attribute is the _labeled control_ for this label element, if it is a labelable element. If it is not labelable then the `for` attribute has no effect. If there are other elements which also match the `id` value, later in the document, they are not considered.\n\n**Note**: A `<label>` element can have both a `for` attribute and a contained control element, as long as the `for` attribute points to the contained control element.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
        ],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/label",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "input",
        description: Some(
            "The input element represents a typed data field, usually with a form control to allow the user to edit the data.",
        ),
        void_element: true,
        attributes: &[
            Attribute {
                name: "accept",
                description: None,
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "alt",
                description: None,
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "autocomplete",
                description: None,
                value_set: Some("inputautocomplete"),
                references: &[],
                browsers: &["C14", "CA18", "E12", "FF4", "FFA4", "S6", "SM6"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "autofocus",
                description: None,
                value_set: Some("v"),
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "checked",
                description: None,
                value_set: Some("v"),
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "dirname",
                description: None,
                value_set: None,
                references: &[],
                browsers: &["C17", "CA18", "E79", "FF116", "FFA116", "S6", "SM6"],
                status: Some(Status {
                    baseline: Baseline::Low,
                    low_date: Some("2023-08-01"),
                    high_date: None,
                }),
            },
            Attribute {
                name: "disabled",
                description: None,
                value_set: Some("v"),
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "form",
                description: None,
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "formaction",
                description: None,
                value_set: None,
                references: &[],
                browsers: &["C9", "CA18", "E12", "FF4", "FFA4", "S5", "SM4.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "formenctype",
                description: None,
                value_set: Some("et"),
                references: &[],
                browsers: &["C9", "CA18", "E12", "FF4", "FFA4", "S5", "SM4.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "formmethod",
                description: None,
                value_set: Some("fm"),
                references: &[],
                browsers: &["C9", "CA18", "E12", "FF4", "FFA4", "S5", "SM4.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "formnovalidate",
                description: None,
                value_set: Some("v"),
                references: &[],
                browsers: &["C4", "CA18", "E12", "FF4", "FFA4", "S5", "SM4"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "formtarget",
                description: None,
                value_set: None,
                references: &[],
                browsers: &["C9", "CA18", "E12", "FF4", "FFA4", "S5", "SM4.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "height",
                description: None,
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "inputmode",
                description: None,
                value_set: Some("im"),
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "list",
                description: None,
                value_set: None,
                references: &[],
                browsers: &["C20", "CA25", "E12", "FF4", "FFA4", "S12.1", "SM12.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2019-03-25"),
                    high_date: Some("2021-09-25"),
                }),
            },
            Attribute {
                name: "max",
                description: None,
                value_set: None,
                references: &[],
                browsers: &["C4", "CA18", "E12", "FF16", "FFA16", "S5", "SM4"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "maxlength",
                description: None,
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "min",
                description: None,
                value_set: None,
                references: &[],
                browsers: &["C4", "CA18", "E12", "FF16", "FFA16", "S5", "SM4"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "minlength",
                description: None,
                value_set: None,
                references: &[],
                browsers: &["C40", "CA40", "E17", "FF51", "FFA51", "S10.1", "SM10.3"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2018-04-30"),
                    high_date: Some("2020-10-30"),
                }),
            },
            Attribute {
                name: "multiple",
                description: None,
                value_set: Some("v"),
                references: &[],
                browsers: &["C2", "CA18", "E12", "FF3.6", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "name",
                description: None,
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "pattern",
                description: None,
                value_set: None,
                references: &[],
                browsers: &["C4", "CA18", "E12", "FF4", "FFA4", "S5", "SM4"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "placeholder",
                description: None,
                value_set: None,
                references: &[],
                browsers: &["C3", "CA18", "E12", "FF4", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "popovertarget",
                description: None,
                value_set: None,
                references: &[],
                browsers: &["C114", "CA114", "E114", "FF125", "FFA125", "S17", "SM17"],
                status: Some(Status {
                    baseline: Baseline::Low,
                    low_date: Some("2024-04-16"),
                    high_date: None,
                }),
            },
            Attribute {
                name: "popovertargetaction",
                description: None,
                value_set: None,
                references: &[],
                browsers: &["C114", "CA114", "E114", "FF125", "FFA125", "S17", "SM17"],
                status: Some(Status {
                    baseline: Baseline::Low,
                    low_date: Some("2024-04-16"),
                    high_date: None,
                }),
            },
            Attribute {
                name: "readonly",
                description: None,
                value_set: Some("v"),
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "required",
                description: None,
                value_set: Some("v"),
                references: &[],
                browsers: &["C4", "CA18", "E12", "FF4", "FFA4", "S5", "SM4"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "size",
                description: None,
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "src",
                description: None,
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "step",
                description: None,
                value_set: None,
                references: &[],
                browsers: &["C5", "CA18", "E12", "FF16", "FFA16", "S5", "SM4"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "type",
                description: None,
                value_set: Some("t"),
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "value",
                description: None,
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "width",
                description: None,
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
        ],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/input",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "button",
        description: Some("The button element represents a button labeled by its contents."),
        void_element: false,
        attributes: &[
            Attribute {
                name: "autofocus",
                description: Some(
                    "This Boolean attribute lets you specify that the button should have input focus when the page loads, unless the user overrides it, for example by typing in a different control. Only one form-associated element in a document can have this attribute specified.",
                ),
                value_set: Some("v"),
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "disabled",
                description: Some(
                    "This Boolean attribute indicates that the user cannot interact with the button. If this attribute is not specified, the button inherits its setting from the containing element, for example [`<fieldset>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/fieldset \"The HTML <fieldset> element is used to group several controls as well as labels (<label>) within a web form.\"); if there is no containing element with the **disabled** attribute set, then the button is enabled.\n\nFirefox will, unlike other browsers, by default, [persist the dynamic disabled state](https://stackoverflow.com/questions/5985839/bug-with-firefox-disabled-attribute-of-input-not-resetting-when-refreshing) of a [`<button>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button \"The HTML <button> element represents a clickable button, which can be used in forms or anywhere in a document that needs simple, standard button functionality.\") across page loads. Use the [`autocomplete`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-autocomplete) attribute to control this feature.",
                ),
                value_set: Some("v"),
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "form",
                description: Some(
                    "The form element that the button is associated with (its _form owner_). The value of the attribute must be the **id** attribute of a [`<form>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form \"The HTML <form> element represents a document section that contains interactive controls for submitting information to a web server.\") element in the same document. If this attribute is not specified, the `<button>` element will be associated to an ancestor [`<form>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form \"The HTML <form> element represents a document section that contains interactive controls for submitting information to a web server.\") element, if one exists. This attribute enables you to associate `<button>` elements to [`<form>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form \"The HTML <form> element represents a document section that contains interactive controls for submitting information to a web server.\") elements anywhere within a document, not just as descendants of [`<form>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form \"The HTML <form> element represents a document section that contains interactive controls for submitting information to a web server.\") elements.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C9", "CA18", "E16", "FF4", "FFA4", "S5.1", "SM5"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2017-10-17"),
                    high_date: Some("2020-04-17"),
                }),
            },
            Attribute {
                name: "formaction",
                description: Some(
                    "The URI of a program that processes the information submitted by the button. If specified, it overrides the [`action`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#attr-action) attribute of the button's form owner.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C9", "CA18", "E12", "FF4", "FFA4", "S5.1", "SM5"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "formenctype",
                description: Some(
                    "If the button is a submit button, this attribute specifies the type of content that is used to submit the form to the server. Possible values are:\n\n*   `application/x-www-form-urlencoded`: The default value if the attribute is not specified.\n*   `multipart/form-data`: Use this value if you are using an [`<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input \"The HTML <input> element is used to create interactive controls for web-based forms in order to accept data from the user; a wide variety of types of input data and control widgets are available, depending on the device and user agent.\") element with the [`type`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-type) attribute set to `file`.\n*   `text/plain`\n\nIf this attribute is specified, it overrides the [`enctype`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#attr-enctype) attribute of the button's form owner.",
                ),
                value_set: Some("et"),
                references: &[],
                browsers: &["C9", "CA18", "E12", "FF4", "FFA4", "S5.1", "SM5"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "formmethod",
                description: Some(
                    "If the button is a submit button, this attribute specifies the HTTP method that the browser uses to submit the form. Possible values are:\n\n*   `post`: The data from the form are included in the body of the form and sent to the server.\n*   `get`: The data from the form are appended to the **form** attribute URI, with a '?' as a separator, and the resulting URI is sent to the server. Use this method when the form has no side-effects and contains only ASCII characters.\n\nIf specified, this attribute overrides the [`method`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#attr-method) attribute of the button's form owner.",
                ),
                value_set: Some("fm"),
                references: &[],
                browsers: &["C9", "CA18", "E12", "FF4", "FFA4", "S5.1", "SM5"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "formnovalidate",
                description: Some(
                    "If the button is a submit button, this Boolean attribute specifies that the form is not to be validated when it is submitted. If this attribute is specified, it overrides the [`novalidate`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#attr-novalidate) attribute of the button's form owner.",
                ),
                value_set: Some("v"),
                references: &[],
                browsers: &["C9", "CA18", "E12", "FF4", "FFA4", "S5.1", "SM5"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "formtarget",
                description: Some(
                    "If the button is a submit button, this attribute is a name or keyword indicating where to display the response that is received after submitting the form. This is a name of, or keyword for, a _browsing context_ (for example, tab, window, or inline frame). If this attribute is specified, it overrides the [`target`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#attr-target) attribute of the button's form owner. The following keywords have special meanings:\n\n*   `_self`: Load the response into the same browsing context as the current one. This value is the default if the attribute is not specified.\n*   `_blank`: Load the response into a new unnamed browsing context.\n*   `_parent`: Load the response into the parent browsing context of the current one. If there is no parent, this option behaves the same way as `_self`.\n*   `_top`: Load the response into the top-level browsing context (that is, the browsing context that is an ancestor of the current one, and has no parent). If there is no parent, this option behaves the same way as `_self`.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C9", "CA18", "E12", "FF4", "FFA4", "S5.1", "SM5"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "name",
                description: Some("The name of the button, which is submitted with the form data."),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "popovertarget",
                description: Some(
                    "Turns the button into a popover control button; takes the ID of the popover element to control as its value.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C114", "CA114", "E114", "FF125", "FFA125", "S17", "SM17"],
                status: Some(Status {
                    baseline: Baseline::Low,
                    low_date: Some("2024-04-16"),
                    high_date: None,
                }),
            },
            Attribute {
                name: "popovertargetaction",
                description: Some(
                    "Specifies the action to be performed on a popover element being controlled by the button.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C114", "CA114", "E114", "FF125", "FFA125", "S17", "SM17"],
                status: Some(Status {
                    baseline: Baseline::Low,
                    low_date: Some("2024-04-16"),
                    high_date: None,
                }),
            },
            Attribute {
                name: "type",
                description: Some(
                    "The type of the button. Possible values are:\n\n*   `submit`: The button submits the form data to the server. This is the default if the attribute is not specified, or if the attribute is dynamically changed to an empty or invalid value.\n*   `reset`: The button resets all the controls to their initial values.\n*   `button`: The button has no default behavior. It can have client-side scripts associated with the element's events, which are triggered when the events occur.",
                ),
                value_set: Some("bt"),
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "value",
                description: Some(
                    "The initial value of the button. It defines the value associated with the button which is submitted with the form data. This value is passed to the server in params when the form is submitted.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "autocomplete",
                description: Some(
                    "The use of this attribute on a [`<button>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button \"The HTML <button> element represents a clickable button, which can be used in forms or anywhere in a document that needs simple, standard button functionality.\") is nonstandard and Firefox-specific. By default, unlike other browsers, [Firefox persists the dynamic disabled state](https://stackoverflow.com/questions/5985839/bug-with-firefox-disabled-attribute-of-input-not-resetting-when-refreshing) of a [`<button>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button \"The HTML <button> element represents a clickable button, which can be used in forms or anywhere in a document that needs simple, standard button functionality.\") across page loads. Setting the value of this attribute to `off` (i.e. `autocomplete=\"off\"`) disables this feature. See [bug 654072](https://bugzilla.mozilla.org/show_bug.cgi?id=654072 \"if disabled state is changed with javascript, the normal state doesn't return after refreshing the page\").",
                ),
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
        ],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/button",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "select",
        description: Some(
            "The select element represents a control for selecting amongst a set of options.",
        ),
        void_element: false,
        attributes: &[
            Attribute {
                name: "autocomplete",
                description: Some(
                    "A [`DOMString`](https://developer.mozilla.org/en-US/docs/Web/API/DOMString \"DOMString is a UTF-16 String. As JavaScript already uses such strings, DOMString is mapped directly to a String.\") providing a hint for a [user agent's](https://developer.mozilla.org/en-US/docs/Glossary/user_agent \"user agent's: A user agent is a computer program representing a person, for example, a browser in a Web context.\") autocomplete feature. See [The HTML autocomplete attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete) for a complete list of values and details on how to use autocomplete.",
                ),
                value_set: Some("inputautocomplete"),
                references: &[],
                browsers: &["C66", "CA66", "E79", "FF59", "FFA59", "S9.1", "SM9.3"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2020-01-15"),
                    high_date: Some("2022-07-15"),
                }),
            },
            Attribute {
                name: "autofocus",
                description: Some(
                    "This Boolean attribute lets you specify that a form control should have input focus when the page loads. Only one form element in a document can have the `autofocus` attribute.",
                ),
                value_set: Some("v"),
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "disabled",
                description: Some(
                    "This Boolean attribute indicates that the user cannot interact with the control. If this attribute is not specified, the control inherits its setting from the containing element, for example `fieldset`; if there is no containing element with the `disabled` attribute set, then the control is enabled.",
                ),
                value_set: Some("v"),
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S3", "SM2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "form",
                description: Some(
                    "This attribute lets you specify the form element to which the select element is associated (that is, its \"form owner\"). If this attribute is specified, its value must be the same as the `id` of a form element in the same document. This enables you to place select elements anywhere within a document, not just as descendants of their form elements.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S3", "SM2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "multiple",
                description: Some(
                    "This Boolean attribute indicates that multiple options can be selected in the list. If it is not specified, then only one option can be selected at a time. When `multiple` is specified, most browsers will show a scrolling list box instead of a single line dropdown.",
                ),
                value_set: Some("v"),
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S3", "SM2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "name",
                description: Some("This attribute is used to specify the name of the control."),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S3", "SM2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "required",
                description: Some(
                    "A Boolean attribute indicating that an option with a non-empty string value must be selected.",
                ),
                value_set: Some("v"),
                references: &[],
                browsers: &["C10", "CA18", "E12", "FF4", "FFA4", "S5.1", "SM5"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "size",
                description: Some(
                    "If the control is presented as a scrolling list box (e.g. when `multiple` is specified), this attribute represents the number of rows in the list that should be visible at one time. Browsers are not required to present a select element as a scrolled list box. The default value is 0.\n\n**Note:** According to the HTML5 specification, the default value for size should be 1; however, in practice, this has been found to break some web sites, and no other browser currently does that, so Mozilla has opted to continue to return 0 for the time being with Firefox.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "E12", "FF1", "FFA4", "S3"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
        ],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/select",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "datalist",
        description: Some(
            "The datalist element represents a set of option elements that represent predefined options for other controls. In the rendering, the datalist element represents nothing and it, along with its children, should be hidden.",
        ),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/datalist",
        }],
        browsers: &["C20", "CA33", "E12", "S12.1", "SM12.2"],
        status: Some(Status {
            baseline: Baseline::Limited,
            low_date: None,
            high_date: None,
        }),
    },
    Tag {
        name: "optgroup",
        description: Some(
            "The optgroup element represents a group of option elements with a common label.",
        ),
        void_element: false,
        attributes: &[
            Attribute {
                name: "disabled",
                description: Some(
                    "If this Boolean attribute is set, none of the items in this option group is selectable. Often browsers grey out such control and it won't receive any browsing events, like mouse clicks or focus-related ones.",
                ),
                value_set: Some("v"),
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "label",
                description: Some(
                    "The name of the group of options, which the browser can use when labeling the options in the user interface. This attribute is mandatory if this element is used.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
        ],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/optgroup",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "option",
        description: Some(
            "The option element represents an option in a select element or as part of a list of suggestions in a datalist element.",
        ),
        void_element: false,
        attributes: &[
            Attribute {
                name: "disabled",
                description: Some(
                    "If this Boolean attribute is set, this option is not checkable. Often browsers grey out such control and it won't receive any browsing event, like mouse clicks or focus-related ones. If this attribute is not set, the element can still be disabled if one of its ancestors is a disabled [`<optgroup>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/optgroup \"The HTML <optgroup> element creates a grouping of options within a <select> element.\") element.",
                ),
                value_set: Some("v"),
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "label",
                description: Some(
                    "This attribute is text for the label indicating the meaning of the option. If the `label` attribute isn't defined, its value is that of the element text content.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "selected",
                description: Some(
                    "If present, this Boolean attribute indicates that the option is initially selected. If the `<option>` element is the descendant of a [`<select>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select \"The HTML <select> element represents a control that provides a menu of options\") element whose [`multiple`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select#attr-multiple) attribute is not set, only one single `<option>` of this [`<select>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select \"The HTML <select> element represents a control that provides a menu of options\") element may have the `selected` attribute.",
                ),
                value_set: Some("v"),
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "value",
                description: Some(
                    "The content of this attribute represents the value to be submitted with the form, should this option be selected. If this attribute is omitted, the value is taken from the text content of the option element.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
        ],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/option",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "textarea",
        description: Some(
            "The textarea element represents a multiline plain text edit control for the element's raw value. The contents of the control represent the control's default value.",
        ),
        void_element: false,
        attributes: &[
            Attribute {
                name: "autocomplete",
                description: Some(
                    "This attribute indicates whether the value of the control can be automatically completed by the browser. Possible values are:\n\n*   `off`: The user must explicitly enter a value into this field for every use, or the document provides its own auto-completion method; the browser does not automatically complete the entry.\n*   `on`: The browser can automatically complete the value based on values that the user has entered during previous uses.\n\nIf the `autocomplete` attribute is not specified on a `<textarea>` element, then the browser uses the `autocomplete` attribute value of the `<textarea>` element's form owner. The form owner is either the [`<form>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form \"The HTML <form> element represents a document section that contains interactive controls for submitting information to a web server.\") element that this `<textarea>` element is a descendant of or the form element whose `id` is specified by the `form` attribute of the input element. For more information, see the [`autocomplete`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#attr-autocomplete) attribute in [`<form>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form \"The HTML <form> element represents a document section that contains interactive controls for submitting information to a web server.\").",
                ),
                value_set: Some("inputautocomplete"),
                references: &[],
                browsers: &["C66", "CA66", "E79", "FF59", "FFA59", "S9.1", "SM9.3"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2020-01-15"),
                    high_date: Some("2022-07-15"),
                }),
            },
            Attribute {
                name: "autofocus",
                description: Some(
                    "This Boolean attribute lets you specify that a form control should have input focus when the page loads. Only one form-associated element in a document can have this attribute specified.",
                ),
                value_set: Some("v"),
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "cols",
                description: Some(
                    "The visible width of the text control, in average character widths. If it is specified, it must be a positive integer. If it is not specified, the default value is `20`.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "dirname",
                description: None,
                value_set: None,
                references: &[],
                browsers: &["C17", "CA18", "E79", "FF116", "FFA116", "S6", "SM6"],
                status: Some(Status {
                    baseline: Baseline::Low,
                    low_date: Some("2023-08-01"),
                    high_date: None,
                }),
            },
            Attribute {
                name: "disabled",
                description: Some(
                    "This Boolean attribute indicates that the user cannot interact with the control. If this attribute is not specified, the control inherits its setting from the containing element, for example [`<fieldset>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/fieldset \"The HTML <fieldset> element is used to group several controls as well as labels (<label>) within a web form.\"); if there is no containing element when the `disabled` attribute is set, the control is enabled.",
                ),
                value_set: Some("v"),
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "form",
                description: Some(
                    "The form element that the `<textarea>` element is associated with (its \"form owner\"). The value of the attribute must be the `id` of a form element in the same document. If this attribute is not specified, the `<textarea>` element must be a descendant of a form element. This attribute enables you to place `<textarea>` elements anywhere within a document, not just as descendants of form elements.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "inputmode",
                description: None,
                value_set: Some("im"),
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "maxlength",
                description: Some(
                    "The maximum number of characters (unicode code points) that the user can enter. If this value isn't specified, the user can enter an unlimited number of characters.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C4", "CA18", "E12", "FF4", "FFA4", "S5", "SM4.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "minlength",
                description: Some(
                    "The minimum number of characters (unicode code points) required that the user should enter.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C40", "CA40", "E17", "FF51", "FFA51", "S10.1", "SM10.3"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2018-04-30"),
                    high_date: Some("2020-10-30"),
                }),
            },
            Attribute {
                name: "name",
                description: Some("The name of the control."),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "placeholder",
                description: Some(
                    "A hint to the user of what can be entered in the control. Carriage returns or line-feeds within the placeholder text must be treated as line breaks when rendering the hint.\n\n**Note:** Placeholders should only be used to show an example of the type of data that should be entered into a form; they are _not_ a substitute for a proper [`<label>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label \"The HTML <label> element represents a caption for an item in a user interface.\") element tied to the input. See [Labels and placeholders](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Labels_and_placeholders \"The HTML <input> element is used to create interactive controls for web-based forms in order to accept data from the user; a wide variety of types of input data and control widgets are available, depending on the device and user agent.\") in [<input>: The Input (Form Input) element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input \"The HTML <input> element is used to create interactive controls for web-based forms in order to accept data from the user; a wide variety of types of input data and control widgets are available, depending on the device and user agent.\") for a full explanation.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C4", "CA18", "E12", "FF4", "FFA4", "S5", "SM5"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "readonly",
                description: Some(
                    "This Boolean attribute indicates that the user cannot modify the value of the control. Unlike the `disabled` attribute, the `readonly` attribute does not prevent the user from clicking or selecting in the control. The value of a read-only control is still submitted with the form.",
                ),
                value_set: Some("v"),
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "required",
                description: Some(
                    "This attribute specifies that the user must fill in a value before submitting a form.",
                ),
                value_set: Some("v"),
                references: &[],
                browsers: &["C4", "CA18", "E12", "FF4", "FFA4", "S5", "SM5"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "rows",
                description: Some("The number of visible text lines for the control."),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "wrap",
                description: Some(
                    "Indicates how the control wraps text. Possible values are:\n\n*   `hard`: The browser automatically inserts line breaks (CR+LF) so that each line has no more than the width of the control; the `cols` attribute must also be specified for this to take effect.\n*   `soft`: The browser ensures that all line breaks in the value consist of a CR+LF pair, but does not insert any additional line breaks.\n*   `off` : Like `soft` but changes appearance to `white-space: pre` so line segments exceeding `cols` are not wrapped and the `<textarea>` becomes horizontally scrollable.\n\nIf this attribute is not specified, `soft` is its default value.",
                ),
                value_set: Some("w"),
                references: &[],
                browsers: &["C16", "CA18", "E12", "FF4", "FFA4", "S6", "SM6"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "autocapitalize",
                description: Some(
                    "This is a non-standard attribute supported by WebKit on iOS (therefore nearly all browsers running on iOS, including Safari, Firefox, and Chrome), which controls whether and how the text value should be automatically capitalized as it is entered/edited by the user. The non-deprecated values are available in iOS 5 and later. Possible values are:\n\n*   `none`: Completely disables automatic capitalization.\n*   `sentences`: Automatically capitalize the first letter of sentences.\n*   `words`: Automatically capitalize the first letter of words.\n*   `characters`: Automatically capitalize all characters.\n*   `on`: Deprecated since iOS 5.\n*   `off`: Deprecated since iOS 5.",
                ),
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "spellcheck",
                description: Some(
                    "Specifies whether the `<textarea>` is subject to spell checking by the underlying browser/OS. the value can be:\n\n*   `true`: Indicates that the element needs to have its spelling and grammar checked.\n*   `default` : Indicates that the element is to act according to a default behavior, possibly based on the parent element's own `spellcheck` value.\n*   `false` : Indicates that the element should not be spell checked.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C9", "CA18", "E12", "FF2", "FFA4", "S5.1", "SM5"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
        ],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/textarea",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "output",
        description: Some(
            "The output element represents the result of a calculation performed by the application, or the result of a user action.",
        ),
        void_element: false,
        attributes: &[
            Attribute {
                name: "for",
                description: Some(
                    "A space-separated list of other elements’ [`id`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id)s, indicating that those elements contributed input values to (or otherwise affected) the calculation.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C10", "CA18", "E18", "FF4", "FFA4", "S7", "SM7"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("≤2018-10-02"),
                    high_date: Some("≤2021-04-02"),
                }),
            },
            Attribute {
                name: "form",
                description: Some(
                    "The [form element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form) that this element is associated with (its \"form owner\"). The value of the attribute must be an `id` of a form element in the same document. If this attribute is not specified, the output element must be a descendant of a form element. This attribute enables you to place output elements anywhere within a document, not just as descendants of their form elements.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C10", "CA18", "E18", "FF4", "FFA4", "S7", "SM7"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("≤2018-10-02"),
                    high_date: Some("≤2021-04-02"),
                }),
            },
            Attribute {
                name: "name",
                description: Some(
                    "The name of the element, exposed in the [`HTMLFormElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement \"The HTMLFormElement interface represents a <form> element in the DOM; it allows access to and in some cases modification of aspects of the form, as well as access to its component elements.\") API.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C10", "CA18", "E18", "FF4", "FFA4", "S7", "SM7"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("≤2018-10-02"),
                    high_date: Some("≤2021-04-02"),
                }),
            },
        ],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/output",
        }],
        browsers: &["C10", "CA18", "E18", "FF4", "FFA4", "S7", "SM7"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("≤2018-10-02"),
            high_date: Some("≤2021-04-02"),
        }),
    },
    Tag {
        name: "progress",
        description: Some(
            "The progress element represents the completion progress of a task. The progress is either indeterminate, indicating that progress is being made but that it is not clear how much more work remains to be done before the task is complete (e.g. because the task is waiting for a remote host to respond), or the progress is a number in the range zero to a maximum, giving the fraction of work that has so far been completed.",
        ),
        void_element: false,
        attributes: &[
            Attribute {
                name: "value",
                description: Some(
                    "This attribute specifies how much of the task that has been completed. It must be a valid floating point number between 0 and `max`, or between 0 and 1 if `max` is omitted. If there is no `value` attribute, the progress bar is indeterminate; this indicates that an activity is ongoing with no indication of how long it is expected to take.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C6", "CA18", "E12", "FF6", "FFA6", "S6", "SM7"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "max",
                description: Some(
                    "This attribute describes how much work the task indicated by the `progress` element requires. The `max` attribute, if present, must have a value greater than zero and be a valid floating point number. The default value is 1.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C6", "CA18", "E12", "FF6", "FFA6", "S6", "SM7"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
        ],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/progress",
        }],
        browsers: &["C6", "CA18", "E12", "FF6", "FFA6", "S6", "SM7"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "meter",
        description: Some(
            "The meter element represents a scalar measurement within a known range, or a fractional value; for example disk usage, the relevance of a query result, or the fraction of a voting population to have selected a particular candidate.",
        ),
        void_element: false,
        attributes: &[
            Attribute {
                name: "value",
                description: Some(
                    "The current numeric value. This must be between the minimum and maximum values (`min` attribute and `max` attribute) if they are specified. If unspecified or malformed, the value is 0. If specified, but not within the range given by the `min` attribute and `max` attribute, the value is equal to the nearest end of the range.\n\n**Usage note:** Unless the `value` attribute is between `0` and `1` (inclusive), the `min` and `max` attributes should define the range so that the `value` attribute's value is within it.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C6", "CA18", "E13", "FF16", "FFA16", "S6", "SM10.3"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2017-03-27"),
                    high_date: Some("2019-09-27"),
                }),
            },
            Attribute {
                name: "min",
                description: Some(
                    "The lower numeric bound of the measured range. This must be less than the maximum value (`max` attribute), if specified. If unspecified, the minimum value is 0.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C6", "CA18", "E13", "FF16", "FFA16", "S6", "SM10.3"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2017-03-27"),
                    high_date: Some("2019-09-27"),
                }),
            },
            Attribute {
                name: "max",
                description: Some(
                    "The upper numeric bound of the measured range. This must be greater than the minimum value (`min` attribute), if specified. If unspecified, the maximum value is 1.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C6", "CA18", "E13", "FF16", "FFA16", "S6", "SM10.3"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2017-03-27"),
                    high_date: Some("2019-09-27"),
                }),
            },
            Attribute {
                name: "low",
                description: Some(
                    "The upper numeric bound of the low end of the measured range. This must be greater than the minimum value (`min` attribute), and it also must be less than the high value and maximum value (`high` attribute and `max` attribute, respectively), if any are specified. If unspecified, or if less than the minimum value, the `low` value is equal to the minimum value.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C6", "CA18", "E13", "FF16", "FFA16", "S6", "SM10.3"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2017-03-27"),
                    high_date: Some("2019-09-27"),
                }),
            },
            Attribute {
                name: "high",
                description: Some(
                    "The lower numeric bound of the high end of the measured range. This must be less than the maximum value (`max` attribute), and it also must be greater than the low value and minimum value (`low` attribute and **min** attribute, respectively), if any are specified. If unspecified, or if greater than the maximum value, the `high` value is equal to the maximum value.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C6", "CA18", "E13", "FF16", "FFA16", "S6", "SM10.3"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2017-03-27"),
                    high_date: Some("2019-09-27"),
                }),
            },
            Attribute {
                name: "optimum",
                description: Some(
                    "This attribute indicates the optimal numeric value. It must be within the range (as defined by the `min` attribute and `max` attribute). When used with the `low` attribute and `high` attribute, it gives an indication where along the range is considered preferable. For example, if it is between the `min` attribute and the `low` attribute, then the lower range is considered preferred.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C6", "CA18", "E13", "FF16", "FFA16", "S6", "SM10.3"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2017-03-27"),
                    high_date: Some("2019-09-27"),
                }),
            },
            Attribute {
                name: "form",
                description: Some(
                    "This attribute associates the element with a `form` element that has ownership of the `meter` element. For example, a `meter` might be displaying a range corresponding to an `input` element of `type` _number_. This attribute is only used if the `meter` element is being used as a form-associated element; even then, it may be omitted if the element appears as a descendant of a `form` element.",
                ),
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
        ],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/meter",
        }],
        browsers: &["C6", "CA18", "E13", "FF16", "FFA16", "S6", "SM10.3"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2017-03-27"),
            high_date: Some("2019-09-27"),
        }),
    },
    Tag {
        name: "fieldset",
        description: Some(
            "The fieldset element represents a set of form controls optionally grouped under a common name.",
        ),
        void_element: false,
        attributes: &[
            Attribute {
                name: "disabled",
                description: Some(
                    "If this Boolean attribute is set, all form controls that are descendants of the `<fieldset>`, are disabled, meaning they are not editable and won't be submitted along with the `<form>`. They won't receive any browsing events, like mouse clicks or focus-related events. By default browsers display such controls grayed out. Note that form elements inside the [`<legend>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/legend \"The HTML <legend> element represents a caption for the content of its parent <fieldset>.\") element won't be disabled.",
                ),
                value_set: Some("v"),
                references: &[],
                browsers: &["C20", "CA25", "E79", "FF4", "FFA4", "S6", "SM6"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2020-01-15"),
                    high_date: Some("2022-07-15"),
                }),
            },
            Attribute {
                name: "form",
                description: Some(
                    "This attribute takes the value of the `id` attribute of a [`<form>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form \"The HTML <form> element represents a document section that contains interactive controls for submitting information to a web server.\") element you want the `<fieldset>` to be part of, even if it is not inside the form.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "name",
                description: Some(
                    "The name associated with the group.\n\n**Note**: The caption for the fieldset is given by the first [`<legend>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/legend \"The HTML <legend> element represents a caption for the content of its parent <fieldset>.\") element nested inside it.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C19", "CA25", "E12", "FF4", "FFA4", "S6", "SM6"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
        ],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/fieldset",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "legend",
        description: Some(
            "The legend element represents a caption for the rest of the contents of the legend element's parent fieldset element, if any.",
        ),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/legend",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S3", "SM1"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "details",
        description: Some(
            "The details element represents a disclosure widget from which the user can obtain additional information or controls.",
        ),
        void_element: false,
        attributes: &[Attribute {
            name: "open",
            description: Some(
                "This Boolean attribute indicates whether or not the details — that is, the contents of the `<details>` element — are currently visible. The default, `false`, means the details are not visible.",
            ),
            value_set: Some("v"),
            references: &[],
            browsers: &["C12", "CA18", "E79", "FF49", "FFA49", "S6", "SM6"],
            status: Some(Status {
                baseline: Baseline::High,
                low_date: Some("2020-01-15"),
                high_date: Some("2022-07-15"),
            }),
        }],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/details",
        }],
        browsers: &["C12", "CA18", "E79", "FF49", "FFA49", "S6", "SM6"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2020-01-15"),
            high_date: Some("2022-07-15"),
        }),
    },
    Tag {
        name: "summary",
        description: Some(
            "The summary element represents a summary, caption, or legend for the rest of the contents of the summary element's parent details element, if any.",
        ),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/summary",
        }],
        browsers: &["C12", "CA18", "E79", "FF49", "FFA49", "S6", "SM6"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2020-01-15"),
            high_date: Some("2022-07-15"),
        }),
    },
    Tag {
        name: "dialog",
        description: Some(
            "The dialog element represents a part of an application that a user interacts with to perform a task, for example a dialog box, inspector, or window.",
        ),
        void_element: false,
        attributes: &[Attribute {
            name: "open",
            description: Some(
                "Indicates that the dialog is active and available for interaction. When the `open` attribute is not set, the dialog shouldn't be shown to the user.",
            ),
            value_set: None,
            references: &[],
            browsers: &["C37", "CA37", "E79", "FF98", "FFA98", "S15.4", "SM15.4"],
            status: Some(Status {
                baseline: Baseline::High,
                low_date: Some("2022-03-14"),
                high_date: Some("2024-09-14"),
            }),
        }],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/dialog",
        }],
        browsers: &["C37", "CA37", "E79", "FF98", "FFA98", "S15.4", "SM15.4"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2022-03-14"),
            high_date: Some("2024-09-14"),
        }),
    },
    Tag {
        name: "script",
        description: Some(
            "The script element allows authors to include dynamic script and data blocks in their documents. The element does not represent content for the user.",
        ),
        void_element: false,
        attributes: &[
            Attribute {
                name: "src",
                description: Some(
                    "This attribute specifies the URI of an external script; this can be used as an alternative to embedding a script directly within a document.\n\nIf a `script` element has a `src` attribute specified, it should not have a script embedded inside its tags.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "type",
                description: Some(
                    "This attribute indicates the type of script represented. The value of this attribute will be in one of the following categories:\n\n*   **Omitted or a JavaScript MIME type:** For HTML5-compliant browsers this indicates the script is JavaScript. HTML5 specification urges authors to omit the attribute rather than provide a redundant MIME type. In earlier browsers, this identified the scripting language of the embedded or imported (via the `src` attribute) code. JavaScript MIME types are [listed in the specification](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types#JavaScript_types).\n*   **`module`:** For HTML5-compliant browsers the code is treated as a JavaScript module. The processing of the script contents is not affected by the `charset` and `defer` attributes. For information on using `module`, see [ES6 in Depth: Modules](https://hacks.mozilla.org/2015/08/es6-in-depth-modules/). Code may behave differently when the `module` keyword is used.\n*   **Any other value:** The embedded content is treated as a data block which won't be processed by the browser. Developers must use a valid MIME type that is not a JavaScript MIME type to denote data blocks. The `src` attribute will be ignored.\n\n**Note:** in Firefox you could specify the version of JavaScript contained in a `<script>` element by including a non-standard `version` parameter inside the `type` attribute — for example `type=\"text/javascript;version=1.8\"`. This has been removed in Firefox 59 (see [bug 1428745](https://bugzilla.mozilla.org/show_bug.cgi?id=1428745 \"FIXED: Remove support for version parameter from script loader\")).",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "charset",
                description: None,
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "async",
                description: Some(
                    "This is a Boolean attribute indicating that the browser should, if possible, load the script asynchronously.\n\nThis attribute must not be used if the `src` attribute is absent (i.e. for inline scripts). If it is included in this case it will have no effect.\n\nBrowsers usually assume the worst case scenario and load scripts synchronously, (i.e. `async=\"false\"`) during HTML parsing.\n\nDynamically inserted scripts (using [`document.createElement()`](https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement \"In an HTML document, the document.createElement() method creates the HTML element specified by tagName, or an HTMLUnknownElement if tagName isn't recognized.\")) load asynchronously by default, so to turn on synchronous loading (i.e. scripts load in the order they were inserted) set `async=\"false\"`.\n\nSee [Browser compatibility](#Browser_compatibility) for notes on browser support. See also [Async scripts for asm.js](https://developer.mozilla.org/en-US/docs/Games/Techniques/Async_scripts).",
                ),
                value_set: Some("v"),
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF3.6", "FFA4", "S4", "SM3.2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "defer",
                description: Some(
                    "This Boolean attribute is set to indicate to a browser that the script is meant to be executed after the document has been parsed, but before firing [`DOMContentLoaded`](https://developer.mozilla.org/en-US/docs/Web/Events/DOMContentLoaded \"/en-US/docs/Web/Events/DOMContentLoaded\").\n\nScripts with the `defer` attribute will prevent the `DOMContentLoaded` event from firing until the script has loaded and finished evaluating.\n\nThis attribute must not be used if the `src` attribute is absent (i.e. for inline scripts), in this case it would have no effect.\n\nTo achieve a similar effect for dynamically inserted scripts use `async=\"false\"` instead. Scripts with the `defer` attribute will execute in the order in which they appear in the document.",
                ),
                value_set: Some("v"),
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF3.5", "FFA4", "S3", "SM2"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "crossorigin",
                description: Some(
                    "Normal `script` elements pass minimal information to the [`window.onerror`](https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onerror \"The onerror property of the GlobalEventHandlers mixin is an EventHandler that processes error events.\") for scripts which do not pass the standard [CORS](https://developer.mozilla.org/en-US/docs/Glossary/CORS \"CORS: CORS (Cross-Origin Resource Sharing) is a system, consisting of transmitting HTTP headers, that determines whether browsers block frontend JavaScript code from accessing responses for cross-origin requests.\") checks. To allow error logging for sites which use a separate domain for static media, use this attribute. See [CORS settings attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes) for a more descriptive explanation of its valid arguments.",
                ),
                value_set: Some("xo"),
                references: &[],
                browsers: &["C19", "CA25", "E14", "FF14", "FFA14", "S6", "SM6"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2016-08-02"),
                    high_date: Some("2019-02-02"),
                }),
            },
            Attribute {
                name: "nonce",
                description: Some(
                    "A cryptographic nonce (number used once) to list the allowed inline scripts in a [script-src Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src). The server must generate a unique nonce value each time it transmits a policy. It is critical to provide a nonce that cannot be guessed as bypassing a resource's policy is otherwise trivial.",
                ),
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
            Attribute {
                name: "integrity",
                description: Some(
                    "This attribute contains inline metadata that a user agent can use to verify that a fetched resource has been delivered free of unexpected manipulation. See [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity).",
                ),
                value_set: None,
                references: &[],
                browsers: &["C45", "CA45", "E17", "FF43", "FFA43", "S11.1", "SM11.3"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2018-04-30"),
                    high_date: Some("2020-10-30"),
                }),
            },
            Attribute {
                name: "nomodule",
                description: Some(
                    "This Boolean attribute is set to indicate that the script should not be executed in browsers that support [ES2015 modules](https://hacks.mozilla.org/2015/08/es6-in-depth-modules/) — in effect, this can be used to serve fallback scripts to older browsers that do not support modular JavaScript code.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C61", "CA61", "E16", "FF60", "FFA60", "S11", "SM11"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2018-05-09"),
                    high_date: Some("2020-11-09"),
                }),
            },
            Attribute {
                name: "referrerpolicy",
                description: Some(
                    "Indicates which [referrer](https://developer.mozilla.org/en-US/docs/Web/API/Document/referrer) to send when fetching the script, or resources fetched by the script:\n\n*   `no-referrer`: The [`Referer`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referer \"The Referer request header contains the address of the previous web page from which a link to the currently requested page was followed. The Referer header allows servers to identify where people are visiting them from and may use that data for analytics, logging, or optimized caching, for example.\") header will not be sent.\n*   `no-referrer-when-downgrade` (default): The [`Referer`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referer \"The Referer request header contains the address of the previous web page from which a link to the currently requested page was followed. The Referer header allows servers to identify where people are visiting them from and may use that data for analytics, logging, or optimized caching, for example.\") header will not be sent to [origin](https://developer.mozilla.org/en-US/docs/Glossary/origin \"origin: Web content's origin is defined by the scheme (protocol), host (domain), and port of the URL used to access it. Two objects have the same origin only when the scheme, host, and port all match.\")s without [TLS](https://developer.mozilla.org/en-US/docs/Glossary/TLS \"TLS: Transport Layer Security (TLS), previously known as Secure Sockets Layer (SSL), is a protocol used by applications to communicate securely across a network, preventing tampering with and eavesdropping on email, web browsing, messaging, and other protocols.\") ([HTTPS](https://developer.mozilla.org/en-US/docs/Glossary/HTTPS \"HTTPS: HTTPS (HTTP Secure) is an encrypted version of the HTTP protocol. It usually uses SSL or TLS to encrypt all communication between a client and a server. This secure connection allows clients to safely exchange sensitive data with a server, for example for banking activities or online shopping.\")).\n*   `origin`: The sent referrer will be limited to the origin of the referring page: its [scheme](https://developer.mozilla.org/en-US/docs/Archive/Mozilla/URIScheme), [host](https://developer.mozilla.org/en-US/docs/Glossary/host \"host: A host is a device connected to the Internet (or a local network). Some hosts called servers offer additional services like serving webpages or storing files and emails.\"), and [port](https://developer.mozilla.org/en-US/docs/Glossary/port \"port: For a computer connected to a network with an IP address, a port is a communication endpoint. Ports are designated by numbers, and below 1024 each port is associated by default with a specific protocol.\").\n*   `origin-when-cross-origin`: The referrer sent to other origins will be limited to the scheme, the host, and the port. Navigations on the same origin will still include the path.\n*   `same-origin`: A referrer will be sent for [same origin](https://developer.mozilla.org/en-US/docs/Glossary/Same-origin_policy \"same origin: The same-origin policy is a critical security mechanism that restricts how a document or script loaded from one origin can interact with a resource from another origin.\"), but cross-origin requests will contain no referrer information.\n*   `strict-origin`: Only send the origin of the document as the referrer when the protocol security level stays the same (e.g. HTTPS→HTTPS), but don't send it to a less secure destination (e.g. HTTPS→HTTP).\n*   `strict-origin-when-cross-origin`: Send a full URL when performing a same-origin request, but only send the origin when the protocol security level stays the same (e.g.HTTPS→HTTPS), and send no header to a less secure destination (e.g. HTTPS→HTTP).\n*   `unsafe-url`: The referrer will include the origin _and_ the path (but not the [fragment](https://developer.mozilla.org/en-US/docs/Web/API/HTMLHyperlinkElementUtils/hash), [password](https://developer.mozilla.org/en-US/docs/Web/API/HTMLHyperlinkElementUtils/password), or [username](https://developer.mozilla.org/en-US/docs/Web/API/HTMLHyperlinkElementUtils/username)). **This value is unsafe**, because it leaks origins and paths from TLS-protected resources to insecure origins.\n\n**Note**: An empty string value (`\"\"`) is both the default value, and a fallback value if `referrerpolicy` is not supported. If `referrerpolicy` is not explicitly specified on the `<script>` element, it will adopt a higher-level referrer policy, i.e. one set on the whole document or domain. If a higher-level policy is not available, the empty string is treated as being equivalent to `no-referrer-when-downgrade`.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C70", "CA70", "E79", "FF65", "FFA65", "S14", "SM14"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2020-09-16"),
                    high_date: Some("2023-03-16"),
                }),
            },
            Attribute {
                name: "text",
                description: Some(
                    "Like the `textContent` attribute, this attribute sets the text content of the element. Unlike the `textContent` attribute, however, this attribute is evaluated as executable code after the node is inserted into the DOM.",
                ),
                value_set: None,
                references: &[],
                browsers: &[],
                status: None,
            },
        ],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/script",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S3", "SM2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "noscript",
        description: Some(
            "The noscript element represents nothing if scripting is enabled, and represents its children if scripting is disabled. It is used to present different markup to user agents that support scripting and those that don't support scripting, by affecting how the document is parsed.",
        ),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/noscript",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S3", "SM2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "template",
        description: Some(
            "The template element is used to declare fragments of HTML that can be cloned and inserted in the document by script.",
        ),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/template",
        }],
        browsers: &["C26", "CA26", "E13", "FF22", "FFA22", "S8", "SM8"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-11-12"),
            high_date: Some("2018-05-12"),
        }),
    },
    Tag {
        name: "canvas",
        description: Some(
            "The canvas element provides scripts with a resolution-dependent bitmap canvas, which can be used for rendering graphs, game graphics, art, or other visual images on the fly.",
        ),
        void_element: false,
        attributes: &[
            Attribute {
                name: "width",
                description: Some(
                    "The width of the coordinate space in CSS pixels. Defaults to 300.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1.5", "FFA4", "S2", "SM1"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "height",
                description: Some(
                    "The height of the coordinate space in CSS pixels. Defaults to 150.",
                ),
                value_set: None,
                references: &[],
                browsers: &["C1", "CA18", "E12", "FF1.5", "FFA4", "S2", "SM1"],
                status: Some(Status {
                    baseline: Baseline::High,
                    low_date: Some("2015-07-29"),
                    high_date: Some("2018-01-29"),
                }),
            },
            Attribute {
                name: "moz-opaque",
                description: Some(
                    "Lets the canvas know whether or not translucency will be a factor. If the canvas knows there's no translucency, painting performance can be optimized. This is only supported by Mozilla-based browsers; use the standardized [`canvas.getContext('2d', { alpha: false })`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext \"The HTMLCanvasElement.getContext() method returns a drawing context on the canvas, or null if the context identifier is not supported.\") instead.",
                ),
                value_set: None,
                references: &[],
                browsers: &["FF3.5", "FFA4"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
        ],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/canvas",
        }],
        browsers: &["C1", "CA18", "E12", "FF1.5", "FFA4", "S2", "SM1"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "slot",
        description: Some(
            "The slot element is a placeholder inside a web component that you can fill with your own markup, which lets you create separate DOM trees and present them together.",
        ),
        void_element: false,
        attributes: &[Attribute {
            name: "name",
            description: Some(
                "The slot's name.\nA **named slot** is a `<slot>` element with a `name` attribute.",
            ),
            value_set: None,
            references: &[],
            browsers: &["C53", "CA53", "E79", "FF63", "FFA63", "S10", "SM10"],
            status: Some(Status {
                baseline: Baseline::High,
                low_date: Some("2020-01-15"),
                high_date: Some("2022-07-15"),
            }),
        }],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/slot",
        }],
        browsers: &["C53", "CA53", "E79", "FF63", "FFA63", "S10", "SM10"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2020-01-15"),
            high_date: Some("2022-07-15"),
        }),
    },
    Tag {
        name: "data",
        description: Some(
            "The data element links a given piece of content with a machine-readable translation.",
        ),
        void_element: false,
        attributes: &[Attribute {
            name: "value",
            description: Some(
                "This attribute specifies the machine-readable translation of the content of the element.",
            ),
            value_set: None,
            references: &[],
            browsers: &["C62", "CA62", "E14", "FF22", "FFA22", "S10", "SM10"],
            status: Some(Status {
                baseline: Baseline::High,
                low_date: Some("2017-10-24"),
                high_date: Some("2020-04-24"),
            }),
        }],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/data",
        }],
        browsers: &["C62", "CA62", "E14", "FF22", "FFA22", "S10", "SM10"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2017-10-24"),
            high_date: Some("2020-04-24"),
        }),
    },
    Tag {
        name: "hgroup",
        description: Some(
            "The hgroup element represents a heading and related content. It groups a single h1–h6 element with one or more p.",
        ),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/hgroup",
        }],
        browsers: &["C5", "CA18", "E12", "FF4", "FFA4", "S5", "SM4.2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "menu",
        description: Some("The menu element represents an unordered list of interactive items."),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/menu",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S3", "SM1"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Tag {
        name: "search",
        description: Some(
            "The search element represents the parts of the document or application with form controls or other content related to performing a search or filtering operation.",
        ),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/search",
        }],
        browsers: &["C118", "CA118", "E118", "FF118", "FFA118", "S17", "SM17"],
        status: Some(Status {
            baseline: Baseline::Low,
            low_date: Some("2023-10-13"),
            high_date: None,
        }),
    },
    Tag {
        name: "fencedframe",
        description: Some(
            "The fencedframe element represents a nested browsing context, embedding another HTML page into the current one.",
        ),
        void_element: false,
        attributes: &[
            Attribute {
                name: "allow",
                description: None,
                value_set: None,
                references: &[],
                browsers: &["C115", "CA115", "E115"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
            Attribute {
                name: "height",
                description: None,
                value_set: None,
                references: &[],
                browsers: &["C115", "CA115", "E115"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
            Attribute {
                name: "width",
                description: None,
                value_set: None,
                references: &[],
                browsers: &["C115", "CA115", "E115"],
                status: Some(Status {
                    baseline: Baseline::Limited,
                    low_date: None,
                    high_date: None,
                }),
            },
        ],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/fencedframe",
        }],
        browsers: &["C115", "CA115", "E115"],
        status: Some(Status {
            baseline: Baseline::Limited,
            low_date: None,
            high_date: None,
        }),
    },
    Tag {
        name: "selectedcontent",
        description: Some(
            "The selectedcontent element can be used to display the content of the currently selected option element inside of a closed select element.",
        ),
        void_element: false,
        attributes: &[],
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/selectedcontent",
        }],
        browsers: &["C134", "CA134", "E134"],
        status: Some(Status {
            baseline: Baseline::Limited,
            low_date: None,
            high_date: None,
        }),
    },
];

pub const GLOBAL_ATTRIBUTES: &[Attribute] = &[
    Attribute {
        name: "accesskey",
        description: Some(
            "Provides a hint for generating a keyboard shortcut for the current element. This attribute consists of a space-separated list of characters. The browser should use the first one that exists on the computer keyboard layout.",
        ),
        value_set: None,
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Global_attributes/accesskey",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Attribute {
        name: "autocapitalize",
        description: Some(
            "Controls whether and how text input is automatically capitalized as it is entered/edited by the user. It can have the following values:\n\n*   `off` or `none`, no autocapitalization is applied (all letters default to lowercase)\n*   `on` or `sentences`, the first letter of each sentence defaults to a capital letter; all other letters default to lowercase\n*   `words`, the first letter of each word defaults to a capital letter; all other letters default to lowercase\n*   `characters`, all letters should default to uppercase",
        ),
        value_set: None,
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Global_attributes/autocapitalize",
        }],
        browsers: &["C43", "CA43", "E79", "FF111", "FFA111", "SM5"],
        status: Some(Status {
            baseline: Baseline::Limited,
            low_date: None,
            high_date: None,
        }),
    },
    Attribute {
        name: "autocorrect",
        description: Some(
            "Controls whether autocorrection of editable text is enabled for spelling and/or punctuation errors.",
        ),
        value_set: Some("o"),
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Global_attributes/autocorrect",
        }],
        browsers: &["FF136", "FFA136"],
        status: Some(Status {
            baseline: Baseline::Limited,
            low_date: None,
            high_date: None,
        }),
    },
    Attribute {
        name: "autofocus",
        description: Some(
            "Indicates that an element should be focused on page load, or when the [`<dialog>`](https://developer.mozilla.org/docs/Web/HTML/Element/dialog) that it is part of is displayed.",
        ),
        value_set: None,
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Global_attributes/autofocus",
        }],
        browsers: &["C79", "CA79", "E79", "FF110", "FFA110", "S15.4", "SM16.4"],
        status: Some(Status {
            baseline: Baseline::Low,
            low_date: Some("2023-03-27"),
            high_date: None,
        }),
    },
    Attribute {
        name: "class",
        description: Some(
            "A space-separated list of the classes of the element. Classes allows CSS and JavaScript to select and access specific elements via the [class selectors](https://developer.mozilla.org/docs/Web/CSS/Class_selectors) or functions like the method [`Document.getElementsByClassName()`](https://developer.mozilla.org/docs/Web/API/Document/getElementsByClassName \"returns an array-like object of all child elements which have all of the given class names.\").",
        ),
        value_set: None,
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Global_attributes/class",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "contenteditable",
        description: Some(
            "An enumerated attribute indicating if the element should be editable by the user. If so, the browser modifies its widget to allow editing. The attribute must take one of the following values:\n\n*   `true` or the _empty string_, which indicates that the element must be editable;\n*   `false`, which indicates that the element must not be editable.",
        ),
        value_set: None,
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Global_attributes/contenteditable",
        }],
        browsers: &["C1", "CA18", "E12", "FF3", "FFA4", "S4", "SM3.2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Attribute {
        name: "contextmenu",
        description: Some(
            "The `[**id**](#attr-id)` of a [`<menu>`](https://developer.mozilla.org/docs/Web/HTML/Element/menu \"The HTML <menu> element represents a group of commands that a user can perform or activate. This includes both list menus, which might appear across the top of a screen, as well as context menus, such as those that might appear underneath a button after it has been clicked.\") to use as the contextual menu for this element.",
        ),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "dir",
        description: Some(
            "An enumerated attribute indicating the directionality of the element's text. It can have the following values:\n\n*   `ltr`, which means _left to right_ and is to be used for languages that are written from the left to the right (like English);\n*   `rtl`, which means _right to left_ and is to be used for languages that are written from the right to the left (like Arabic);\n*   `auto`, which lets the user agent decide. It uses a basic algorithm as it parses the characters inside the element until it finds a character with a strong directionality, then it applies that directionality to the whole element.",
        ),
        value_set: Some("d"),
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Global_attributes/dir",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "draggable",
        description: Some(
            "An enumerated attribute indicating whether the element can be dragged, using the [Drag and Drop API](https://developer.mozilla.org/docs/DragDrop/Drag_and_Drop). It can have the following values:\n\n*   `true`, which indicates that the element may be dragged\n*   `false`, which indicates that the element may not be dragged.",
        ),
        value_set: Some("b"),
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Global_attributes/draggable",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "dropzone",
        description: Some(
            "An enumerated attribute indicating what types of content can be dropped on an element, using the [Drag and Drop API](https://developer.mozilla.org/docs/DragDrop/Drag_and_Drop). It can have the following values:\n\n*   `copy`, which indicates that dropping will create a copy of the element that was dragged\n*   `move`, which indicates that the element that was dragged will be moved to this new location.\n*   `link`, will create a link to the dragged data.",
        ),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "enterkeyhint",
        description: Some(
            "An enumerated attribute defining what action label (or icon) to present for the enter key on virtual keyboards.",
        ),
        value_set: Some("enterkeyhint"),
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Global_attributes/enterkeyhint",
        }],
        browsers: &["C77", "CA77", "E79", "FF94", "FFA94", "S13.1", "SM13.4"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2021-11-02"),
            high_date: Some("2024-05-02"),
        }),
    },
    Attribute {
        name: "exportparts",
        description: Some(
            "Used to transitively export shadow parts from a nested shadow tree into a containing light tree.",
        ),
        value_set: None,
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Global_attributes/exportparts",
        }],
        browsers: &["C73", "CA73", "E79", "FF72", "FFA79", "S13.1", "SM13.4"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2020-07-28"),
            high_date: Some("2023-01-28"),
        }),
    },
    Attribute {
        name: "hidden",
        description: Some(
            "A Boolean attribute indicates that the element is not yet, or is no longer, _relevant_. For example, it can be used to hide elements of the page that can't be used until the login process has been completed. The browser won't render such elements. This attribute must not be used to hide content that could legitimately be shown.",
        ),
        value_set: Some("v"),
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Global_attributes/hidden",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "id",
        description: Some(
            "Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).",
        ),
        value_set: None,
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Global_attributes/id",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "inert",
        description: Some(
            "Indicates that the element and all of its flat tree descendants become _inert_. Modal `<dialog>`s generated with [`showModal()`](https://developer.mozilla.org/docs/Web/API/HTMLDialogElement/showModal) escape inertness, meaning that they don't inherit inertness from their ancestors, but can only be made inert by having the `inert` attribute explicitly set on themselves.",
        ),
        value_set: None,
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Global_attributes/inert",
        }],
        browsers: &[
            "C102", "CA102", "E102", "FF112", "FFA112", "S15.5", "SM15.5",
        ],
        status: Some(Status {
            baseline: Baseline::Low,
            low_date: Some("2023-04-11"),
            high_date: None,
        }),
    },
    Attribute {
        name: "inputmode",
        description: Some(
            "Provides a hint to browsers as to the type of virtual keyboard configuration to use when editing this element or its contents. Used primarily on [`<input>`](https://developer.mozilla.org/docs/Web/HTML/Element/input \"The HTML <input> element is used to create interactive controls for web-based forms in order to accept data from the user; a wide variety of types of input data and control widgets are available, depending on the device and user agent.\") elements, but is usable on any element while in `[contenteditable](https://developer.mozilla.org/docs/Web/HTML/Global_attributes#attr-contenteditable)` mode.",
        ),
        value_set: None,
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Global_attributes/inputmode",
        }],
        browsers: &["C66", "CA66", "E79", "FF95", "FFA79", "S12.1", "SM12.2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2021-12-07"),
            high_date: Some("2024-06-07"),
        }),
    },
    Attribute {
        name: "is",
        description: Some(
            "Allows you to specify that a standard HTML element should behave like a registered custom built-in element (see [Using custom elements](https://developer.mozilla.org/docs/Web/Web_Components/Using_custom_elements) for more details).",
        ),
        value_set: None,
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Global_attributes/is",
        }],
        browsers: &["C67", "CA67", "E79", "FF63", "FFA63"],
        status: Some(Status {
            baseline: Baseline::Limited,
            low_date: None,
            high_date: None,
        }),
    },
    Attribute {
        name: "itemid",
        description: Some("The unique, global identifier of an item."),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "itemprop",
        description: Some(
            "Used to add properties to an item. Every HTML element may have an `itemprop` attribute specified, where an `itemprop` consists of a name and value pair.",
        ),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "itemref",
        description: Some(
            "Properties that are not descendants of an element with the `itemscope` attribute can be associated with the item using an `itemref`. It provides a list of element ids (not `itemid`s) with additional properties elsewhere in the document.",
        ),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "itemscope",
        description: Some(
            "`itemscope` (usually) works along with `[itemtype](https://developer.mozilla.org/docs/Web/HTML/Global_attributes#attr-itemtype)` to specify that the HTML contained in a block is about a particular item. `itemscope` creates the Item and defines the scope of the `itemtype` associated with it. `itemtype` is a valid URL of a vocabulary (such as [schema.org](https://schema.org/)) that describes the item and its properties context.",
        ),
        value_set: Some("v"),
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "itemtype",
        description: Some(
            "Specifies the URL of the vocabulary that will be used to define `itemprop`s (item properties) in the data structure. `[itemscope](https://developer.mozilla.org/docs/Web/HTML/Global_attributes#attr-itemscope)` is used to set the scope of where in the data structure the vocabulary set by `itemtype` will be active.",
        ),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "lang",
        description: Some(
            "Helps define the language of an element: the language that non-editable elements are in, or the language that editable elements should be written in by the user. The attribute contains one “language tag” (made of hyphen-separated “language subtags”) in the format defined in [_Tags for Identifying Languages (BCP47)_](https://www.ietf.org/rfc/bcp/bcp47.txt). [**xml:lang**](#attr-xml:lang) has priority over it.",
        ),
        value_set: None,
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Global_attributes/lang",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Attribute {
        name: "nonce",
        description: Some(
            "Defines a cryptographic nonce (\"number used once\") which can be used by [Content Security Policy](https://developer.mozilla.org/docs/Web/HTTP/Guides/CSP) to determine whether or not a given fetch will be allowed to proceed for a given element.",
        ),
        value_set: None,
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Global_attributes/nonce",
        }],
        browsers: &["C61", "CA61", "E79", "FF31", "FFA31", "S15.4", "SM15.4"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2022-03-14"),
            high_date: Some("2024-09-14"),
        }),
    },
    Attribute {
        name: "part",
        description: Some(
            "A space-separated list of the part names of the element. Part names allows CSS to select and style specific elements in a shadow tree via the [`::part`](https://developer.mozilla.org/docs/Web/CSS/::part \"The ::part CSS pseudo-element represents any element within a shadow tree that has a matching part attribute.\") pseudo-element.",
        ),
        value_set: None,
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Global_attributes/part",
        }],
        browsers: &["C73", "CA73", "E79", "FF72", "FFA79", "S13.1", "SM13.4"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2020-07-28"),
            high_date: Some("2023-01-28"),
        }),
    },
    Attribute {
        name: "popover",
        description: Some("Designates an element as a popover element."),
        value_set: Some("popover"),
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Global_attributes/popover",
        }],
        browsers: &["C114", "CA114", "E114", "FF125", "FFA125", "S17", "SM17"],
        status: Some(Status {
            baseline: Baseline::Low,
            low_date: Some("2024-04-16"),
            high_date: None,
        }),
    },
    Attribute {
        name: "role",
        description: None,
        value_set: Some("roles"),
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "slot",
        description: Some(
            "Assigns a slot in a [shadow DOM](https://developer.mozilla.org/docs/Web/Web_Components/Shadow_DOM) shadow tree to an element: An element with a `slot` attribute is assigned to the slot created by the [`<slot>`](https://developer.mozilla.org/docs/Web/HTML/Element/slot \"The HTML <slot> element—part of the Web Components technology suite—is a placeholder inside a web component that you can fill with your own markup, which lets you create separate DOM trees and present them together.\") element whose `[name](https://developer.mozilla.org/docs/Web/HTML/Element/slot#attr-name)` attribute's value matches that `slot` attribute's value.",
        ),
        value_set: None,
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Global_attributes/slot",
        }],
        browsers: &["C53", "CA53", "E79", "FF63", "FFA63", "S10", "SM10"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("≤2020-01-15"),
            high_date: Some("≤2022-07-15"),
        }),
    },
    Attribute {
        name: "spellcheck",
        description: Some(
            "An enumerated attribute defines whether the element may be checked for spelling errors. It may have the following values:\n\n*   `true`, which indicates that the element should be, if possible, checked for spelling errors;\n*   `false`, which indicates that the element should not be checked for spelling errors.",
        ),
        value_set: Some("b"),
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Global_attributes/spellcheck",
        }],
        browsers: &["C9", "CA47", "E12", "FF2", "FFA57", "S5.1", "SM9.3"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2017-11-28"),
            high_date: Some("2020-05-28"),
        }),
    },
    Attribute {
        name: "style",
        description: Some(
            "Contains [CSS](https://developer.mozilla.org/docs/Web/CSS) styling declarations to be applied to the element. Note that it is recommended for styles to be defined in a separate file or files. This attribute and the [`<style>`](https://developer.mozilla.org/docs/Web/HTML/Element/style \"The HTML <style> element contains style information for a document, or part of a document.\") element have mainly the purpose of allowing for quick styling, for example for testing purposes.",
        ),
        value_set: None,
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Global_attributes/style",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S1", "SM1"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Attribute {
        name: "tabindex",
        description: Some(
            "An integer attribute indicating if the element can take input focus (is _focusable_), if it should participate to sequential keyboard navigation, and if so, at what position. It can take several values:\n\n*   a _negative value_ means that the element should be focusable, but should not be reachable via sequential keyboard navigation;\n*   `0` means that the element should be focusable and reachable via sequential keyboard navigation, but its relative order is defined by the platform convention;\n*   a _positive value_ means that the element should be focusable and reachable via sequential keyboard navigation; the order in which the elements are focused is the increasing value of the [**tabindex**](#attr-tabindex). If several elements share the same tabindex, their relative order follows their relative positions in the document.",
        ),
        value_set: None,
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Global_attributes/tabindex",
        }],
        browsers: &["C1", "CA18", "E12", "FF1.5", "FFA4", "S3.1", "SM2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Attribute {
        name: "title",
        description: Some(
            "Contains a text representing advisory information related to the element it belongs to. Such information can typically, but not necessarily, be presented to the user as a tooltip.",
        ),
        value_set: None,
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Global_attributes/title",
        }],
        browsers: &["C1", "CA18", "E12", "FF1", "FFA4", "S4", "SM3.2"],
        status: Some(Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }),
    },
    Attribute {
        name: "translate",
        description: Some(
            "An enumerated attribute that is used to specify whether an element's attribute values and the values of its [`Text`](https://developer.mozilla.org/docs/Web/API/Text \"The Text interface represents the textual content of Element or Attr. If an element has no markup within its content, it has a single child implementing Text that contains the element's text. However, if the element contains markup, it is parsed into information items and Text nodes that form its children.\") node children are to be translated when the page is localized, or whether to leave them unchanged. It can have the following values:\n\n*   empty string and `yes`, which indicates that the element will be translated.\n*   `no`, which indicates that the element will not be translated.",
        ),
        value_set: Some("y"),
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Global_attributes/translate",
        }],
        browsers: &["C19", "CA25", "E79", "FF111", "FFA111", "S6", "SM6"],
        status: Some(Status {
            baseline: Baseline::Low,
            low_date: Some("2023-03-14"),
            high_date: None,
        }),
    },
    Attribute {
        name: "virtualkeyboardpolicy",
        description: Some(
            "When specified on an element that the element's content is editable (for example, it is an `<input>` or `<textarea>` element, or an element with the `contenteditable` attribute set), it controls the on-screen virtual keyboard behavior on devices such as tablets, mobile phones, or other devices where a hardware keyboard may not be available.",
        ),
        value_set: Some("b"),
        references: &[Reference {
            name: "MDN Reference",
            url: "https://developer.mozilla.org/docs/Web/HTML/Reference/Global_attributes/virtualkeyboardpolicy",
        }],
        browsers: &["C94", "CA94", "E94"],
        status: Some(Status {
            baseline: Baseline::Limited,
            low_date: None,
            high_date: None,
        }),
    },
    Attribute {
        name: "onabort",
        description: Some("The loading of a resource has been aborted."),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onblur",
        description: Some("An element has lost focus (does not bubble)."),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "oncanplay",
        description: Some(
            "The user agent can play the media, but estimates that not enough data has been loaded to play the media up to its end without having to stop for further buffering of content.",
        ),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "oncanplaythrough",
        description: Some(
            "The user agent can play the media up to its end without having to stop for further buffering of content.",
        ),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onchange",
        description: Some(
            "The change event is fired for <input>, <select>, and <textarea> elements when a change to the element's value is committed by the user.",
        ),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onclick",
        description: Some("A pointing device button has been pressed and released on an element."),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "oncontextmenu",
        description: Some(
            "The right button of the mouse is clicked (before the context menu is displayed).",
        ),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "ondblclick",
        description: Some("A pointing device button is clicked twice on an element."),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "ondrag",
        description: Some("An element or text selection is being dragged (every 350ms)."),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "ondragend",
        description: Some(
            "A drag operation is being ended (by releasing a mouse button or hitting the escape key).",
        ),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "ondragenter",
        description: Some("A dragged element or text selection enters a valid drop target."),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "ondragleave",
        description: Some("A dragged element or text selection leaves a valid drop target."),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "ondragover",
        description: Some(
            "An element or text selection is being dragged over a valid drop target (every 350ms).",
        ),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "ondragstart",
        description: Some("The user starts dragging an element or text selection."),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "ondrop",
        description: Some("An element is dropped on a valid drop target."),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "ondurationchange",
        description: Some("The duration attribute has been updated."),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onemptied",
        description: Some(
            "The media has become empty; for example, this event is sent if the media has already been loaded (or partially loaded), and the load() method is called to reload it.",
        ),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onended",
        description: Some("Playback has stopped because the end of the media was reached."),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onerror",
        description: Some("A resource failed to load."),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onfocus",
        description: Some("An element has received focus (does not bubble)."),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onformchange",
        description: None,
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onforminput",
        description: None,
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "oninput",
        description: Some(
            "The value of an element changes or the content of an element with the attribute contenteditable is modified.",
        ),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "oninvalid",
        description: Some(
            "A submittable element has been checked and doesn't satisfy its constraints.",
        ),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onkeydown",
        description: Some("A key is pressed down."),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onkeypress",
        description: Some(
            "A key is pressed down and that key normally produces a character value (use input instead).",
        ),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onkeyup",
        description: Some("A key is released."),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onload",
        description: Some("A resource and its dependent resources have finished loading."),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onloadeddata",
        description: Some("The first frame of the media has finished loading."),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onloadedmetadata",
        description: Some("The metadata has been loaded."),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onloadstart",
        description: Some("Progress has begun."),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onmousedown",
        description: Some("A pointing device button (usually a mouse) is pressed on an element."),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onmousemove",
        description: Some("A pointing device is moved over an element."),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onmouseout",
        description: Some(
            "A pointing device is moved off the element that has the listener attached or off one of its children.",
        ),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onmouseover",
        description: Some(
            "A pointing device is moved onto the element that has the listener attached or onto one of its children.",
        ),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onmouseup",
        description: Some("A pointing device button is released over an element."),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onmousewheel",
        description: None,
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onmouseenter",
        description: Some(
            "A pointing device is moved onto the element that has the listener attached.",
        ),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onmouseleave",
        description: Some(
            "A pointing device is moved off the element that has the listener attached.",
        ),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onpause",
        description: Some("Playback has been paused."),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onplay",
        description: Some("Playback has begun."),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onplaying",
        description: Some(
            "Playback is ready to start after having been paused or delayed due to lack of data.",
        ),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onprogress",
        description: Some("In progress."),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onratechange",
        description: Some("The playback rate has changed."),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onreset",
        description: Some("A form is reset."),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onresize",
        description: Some("The document view has been resized."),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onreadystatechange",
        description: Some("The readyState attribute of a document has changed."),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onscroll",
        description: Some("The document view or an element has been scrolled."),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onseeked",
        description: Some("A seek operation completed."),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onseeking",
        description: Some("A seek operation began."),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onselect",
        description: Some("Some text is being selected."),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onshow",
        description: Some(
            "A contextmenu event was fired on/bubbled to an element that has a contextmenu attribute",
        ),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onstalled",
        description: Some(
            "The user agent is trying to fetch media data, but data is unexpectedly not forthcoming.",
        ),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onsubmit",
        description: Some("A form is submitted."),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onsuspend",
        description: Some("Media data loading has been suspended."),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "ontimeupdate",
        description: Some("The time indicated by the currentTime attribute has been updated."),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onvolumechange",
        description: Some("The volume has changed."),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onwaiting",
        description: Some("Playback has stopped because of a temporary lack of data."),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onpointercancel",
        description: Some("The pointer is unlikely to produce any more events."),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onpointerdown",
        description: Some("The pointer enters the active buttons state."),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onpointerenter",
        description: Some("Pointing device is moved inside the hit-testing boundary."),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onpointerleave",
        description: Some("Pointing device is moved out of the hit-testing boundary."),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onpointerlockchange",
        description: Some("The pointer was locked or released."),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onpointerlockerror",
        description: Some(
            "It was impossible to lock the pointer for technical reasons or because the permission was denied.",
        ),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onpointermove",
        description: Some("The pointer changed coordinates."),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onpointerout",
        description: Some(
            "The pointing device moved out of hit-testing boundary or leaves detectable hover range.",
        ),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onpointerover",
        description: Some("The pointing device is moved into the hit-testing boundary."),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "onpointerup",
        description: Some("The pointer leaves the active buttons state."),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "aria-activedescendant",
        description: Some(
            "Identifies the currently active element when DOM focus is on a [`composite`](https://www.w3.org/TR/wai-aria-1.1/#composite) widget, [`textbox`](https://www.w3.org/TR/wai-aria-1.1/#textbox), [`group`](https://www.w3.org/TR/wai-aria-1.1/#group), or [`application`](https://www.w3.org/TR/wai-aria-1.1/#application).",
        ),
        value_set: None,
        references: &[Reference {
            name: "WAI-ARIA Reference",
            url: "https://www.w3.org/TR/wai-aria-1.1/#aria-activedescendant",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "aria-atomic",
        description: Some(
            "Indicates whether [assistive technologies](https://www.w3.org/TR/wai-aria-1.1/#dfn-assistive-technology) will present all, or only parts of, the changed region based on the change notifications defined by the [`aria-relevant`](https://www.w3.org/TR/wai-aria-1.1/#aria-relevant) attribute.",
        ),
        value_set: Some("b"),
        references: &[Reference {
            name: "WAI-ARIA Reference",
            url: "https://www.w3.org/TR/wai-aria-1.1/#aria-atomic",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "aria-autocomplete",
        description: Some(
            "Indicates whether inputting text could trigger display of one or more predictions of the user's intended value for an input and specifies how predictions would be presented if they are made.",
        ),
        value_set: Some("autocomplete"),
        references: &[Reference {
            name: "WAI-ARIA Reference",
            url: "https://www.w3.org/TR/wai-aria-1.1/#aria-autocomplete",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "aria-busy",
        description: Some(
            "Indicates an element is being modified and that assistive technologies _MAY_ want to wait until the modifications are complete before exposing them to the user.",
        ),
        value_set: Some("b"),
        references: &[Reference {
            name: "WAI-ARIA Reference",
            url: "https://www.w3.org/TR/wai-aria-1.1/#aria-busy",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "aria-checked",
        description: Some(
            "Indicates the current \"checked\" [state](https://www.w3.org/TR/wai-aria-1.1/#dfn-state) of checkboxes, radio buttons, and other [widgets](https://www.w3.org/TR/wai-aria-1.1/#dfn-widget). See related [`aria-pressed`](https://www.w3.org/TR/wai-aria-1.1/#aria-pressed) and [`aria-selected`](https://www.w3.org/TR/wai-aria-1.1/#aria-selected).",
        ),
        value_set: Some("tristate"),
        references: &[Reference {
            name: "WAI-ARIA Reference",
            url: "https://www.w3.org/TR/wai-aria-1.1/#aria-checked",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "aria-colcount",
        description: Some(
            "Defines the total number of columns in a [`table`](https://www.w3.org/TR/wai-aria-1.1/#table), [`grid`](https://www.w3.org/TR/wai-aria-1.1/#grid), or [`treegrid`](https://www.w3.org/TR/wai-aria-1.1/#treegrid). See related [`aria-colindex`](https://www.w3.org/TR/wai-aria-1.1/#aria-colindex).",
        ),
        value_set: None,
        references: &[Reference {
            name: "WAI-ARIA Reference",
            url: "https://www.w3.org/TR/wai-aria-1.1/#aria-colcount",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "aria-colindex",
        description: Some(
            "Defines an [element's](https://www.w3.org/TR/wai-aria-1.1/#dfn-element) column index or position with respect to the total number of columns within a [`table`](https://www.w3.org/TR/wai-aria-1.1/#table), [`grid`](https://www.w3.org/TR/wai-aria-1.1/#grid), or [`treegrid`](https://www.w3.org/TR/wai-aria-1.1/#treegrid). See related [`aria-colcount`](https://www.w3.org/TR/wai-aria-1.1/#aria-colcount) and [`aria-colspan`](https://www.w3.org/TR/wai-aria-1.1/#aria-colspan).",
        ),
        value_set: None,
        references: &[Reference {
            name: "WAI-ARIA Reference",
            url: "https://www.w3.org/TR/wai-aria-1.1/#aria-colindex",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "aria-colspan",
        description: Some(
            "Defines the number of columns spanned by a cell or gridcell within a [`table`](https://www.w3.org/TR/wai-aria-1.1/#table), [`grid`](https://www.w3.org/TR/wai-aria-1.1/#grid), or [`treegrid`](https://www.w3.org/TR/wai-aria-1.1/#treegrid). See related [`aria-colindex`](https://www.w3.org/TR/wai-aria-1.1/#aria-colindex) and [`aria-rowspan`](https://www.w3.org/TR/wai-aria-1.1/#aria-rowspan).",
        ),
        value_set: None,
        references: &[Reference {
            name: "WAI-ARIA Reference",
            url: "https://www.w3.org/TR/wai-aria-1.1/#aria-colspan",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "aria-controls",
        description: Some(
            "Identifies the [element](https://www.w3.org/TR/wai-aria-1.1/#dfn-element) (or elements) whose contents or presence are controlled by the current element. See related [`aria-owns`](https://www.w3.org/TR/wai-aria-1.1/#aria-owns).",
        ),
        value_set: None,
        references: &[Reference {
            name: "WAI-ARIA Reference",
            url: "https://www.w3.org/TR/wai-aria-1.1/#aria-controls",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "aria-current",
        description: Some(
            "Indicates the [element](https://www.w3.org/TR/wai-aria-1.1/#dfn-element) that represents the current item within a container or set of related elements.",
        ),
        value_set: Some("current"),
        references: &[Reference {
            name: "WAI-ARIA Reference",
            url: "https://www.w3.org/TR/wai-aria-1.1/#aria-current",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "aria-describedby",
        description: Some(
            "Identifies the [element](https://www.w3.org/TR/wai-aria-1.1/#dfn-element) (or elements) that describes the [object](https://www.w3.org/TR/wai-aria-1.1/#dfn-object). See related [`aria-labelledby`](https://www.w3.org/TR/wai-aria-1.1/#aria-labelledby).",
        ),
        value_set: None,
        references: &[Reference {
            name: "WAI-ARIA Reference",
            url: "https://www.w3.org/TR/wai-aria-1.1/#aria-describedby",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "aria-disabled",
        description: Some(
            "Indicates that the [element](https://www.w3.org/TR/wai-aria-1.1/#dfn-element) is [perceivable](https://www.w3.org/TR/wai-aria-1.1/#dfn-perceivable) but disabled, so it is not editable or otherwise [operable](https://www.w3.org/TR/wai-aria-1.1/#dfn-operable). See related [`aria-hidden`](https://www.w3.org/TR/wai-aria-1.1/#aria-hidden) and [`aria-readonly`](https://www.w3.org/TR/wai-aria-1.1/#aria-readonly).",
        ),
        value_set: Some("b"),
        references: &[Reference {
            name: "WAI-ARIA Reference",
            url: "https://www.w3.org/TR/wai-aria-1.1/#aria-disabled",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "aria-dropeffect",
        description: Some(
            "\\[Deprecated in ARIA 1.1\\] Indicates what functions can be performed when a dragged object is released on the drop target.",
        ),
        value_set: Some("dropeffect"),
        references: &[Reference {
            name: "WAI-ARIA Reference",
            url: "https://www.w3.org/TR/wai-aria-1.1/#aria-dropeffect",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "aria-errormessage",
        description: Some(
            "Identifies the [element](https://www.w3.org/TR/wai-aria-1.1/#dfn-element) that provides an error message for the [object](https://www.w3.org/TR/wai-aria-1.1/#dfn-object). See related [`aria-invalid`](https://www.w3.org/TR/wai-aria-1.1/#aria-invalid) and [`aria-describedby`](https://www.w3.org/TR/wai-aria-1.1/#aria-describedby).",
        ),
        value_set: None,
        references: &[Reference {
            name: "WAI-ARIA Reference",
            url: "https://www.w3.org/TR/wai-aria-1.1/#aria-errormessage",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "aria-expanded",
        description: Some(
            "Indicates whether the element, or another grouping element it controls, is currently expanded or collapsed.",
        ),
        value_set: Some("u"),
        references: &[Reference {
            name: "WAI-ARIA Reference",
            url: "https://www.w3.org/TR/wai-aria-1.1/#aria-expanded",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "aria-flowto",
        description: Some(
            "Identifies the next [element](https://www.w3.org/TR/wai-aria-1.1/#dfn-element) (or elements) in an alternate reading order of content which, at the user's discretion, allows assistive technology to override the general default of reading in document source order.",
        ),
        value_set: None,
        references: &[Reference {
            name: "WAI-ARIA Reference",
            url: "https://www.w3.org/TR/wai-aria-1.1/#aria-flowto",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "aria-grabbed",
        description: Some(
            "\\[Deprecated in ARIA 1.1\\] Indicates an element's \"grabbed\" [state](https://www.w3.org/TR/wai-aria-1.1/#dfn-state) in a drag-and-drop operation.",
        ),
        value_set: Some("u"),
        references: &[Reference {
            name: "WAI-ARIA Reference",
            url: "https://www.w3.org/TR/wai-aria-1.1/#aria-grabbed",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "aria-haspopup",
        description: Some(
            "Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an [element](https://www.w3.org/TR/wai-aria-1.1/#dfn-element).",
        ),
        value_set: Some("haspopup"),
        references: &[Reference {
            name: "WAI-ARIA Reference",
            url: "https://www.w3.org/TR/wai-aria-1.1/#aria-haspopup",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "aria-hidden",
        description: Some(
            "Indicates whether the [element](https://www.w3.org/TR/wai-aria-1.1/#dfn-element) is exposed to an accessibility API. See related [`aria-disabled`](https://www.w3.org/TR/wai-aria-1.1/#aria-disabled).",
        ),
        value_set: Some("b"),
        references: &[Reference {
            name: "WAI-ARIA Reference",
            url: "https://www.w3.org/TR/wai-aria-1.1/#aria-hidden",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "aria-invalid",
        description: Some(
            "Indicates the entered value does not conform to the format expected by the application. See related [`aria-errormessage`](https://www.w3.org/TR/wai-aria-1.1/#aria-errormessage).",
        ),
        value_set: Some("invalid"),
        references: &[Reference {
            name: "WAI-ARIA Reference",
            url: "https://www.w3.org/TR/wai-aria-1.1/#aria-invalid",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "aria-label",
        description: Some(
            "Defines a string value that labels the current element. See related [`aria-labelledby`](https://www.w3.org/TR/wai-aria-1.1/#aria-labelledby).",
        ),
        value_set: None,
        references: &[Reference {
            name: "WAI-ARIA Reference",
            url: "https://www.w3.org/TR/wai-aria-1.1/#aria-label",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "aria-labelledby",
        description: Some(
            "Identifies the [element](https://www.w3.org/TR/wai-aria-1.1/#dfn-element) (or elements) that labels the current element. See related [`aria-describedby`](https://www.w3.org/TR/wai-aria-1.1/#aria-describedby).",
        ),
        value_set: None,
        references: &[Reference {
            name: "WAI-ARIA Reference",
            url: "https://www.w3.org/TR/wai-aria-1.1/#aria-labelledby",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "aria-level",
        description: Some(
            "Defines the hierarchical level of an [element](https://www.w3.org/TR/wai-aria-1.1/#dfn-element) within a structure.",
        ),
        value_set: None,
        references: &[Reference {
            name: "WAI-ARIA Reference",
            url: "https://www.w3.org/TR/wai-aria-1.1/#aria-level",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "aria-live",
        description: Some(
            "Indicates that an [element](https://www.w3.org/TR/wai-aria-1.1/#dfn-element) will be updated, and describes the types of updates the [user agents](https://www.w3.org/TR/wai-aria-1.1/#dfn-user-agent), [assistive technologies](https://www.w3.org/TR/wai-aria-1.1/#dfn-assistive-technology), and user can expect from the [live region](https://www.w3.org/TR/wai-aria-1.1/#dfn-live-region).",
        ),
        value_set: Some("live"),
        references: &[Reference {
            name: "WAI-ARIA Reference",
            url: "https://www.w3.org/TR/wai-aria-1.1/#aria-live",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "aria-modal",
        description: Some(
            "Indicates whether an [element](https://www.w3.org/TR/wai-aria-1.1/#dfn-element) is modal when displayed.",
        ),
        value_set: Some("b"),
        references: &[Reference {
            name: "WAI-ARIA Reference",
            url: "https://www.w3.org/TR/wai-aria-1.1/#aria-modal",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "aria-multiline",
        description: Some(
            "Indicates whether a text box accepts multiple lines of input or only a single line.",
        ),
        value_set: Some("b"),
        references: &[Reference {
            name: "WAI-ARIA Reference",
            url: "https://www.w3.org/TR/wai-aria-1.1/#aria-multiline",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "aria-multiselectable",
        description: Some(
            "Indicates that the user may select more than one item from the current selectable descendants.",
        ),
        value_set: Some("b"),
        references: &[Reference {
            name: "WAI-ARIA Reference",
            url: "https://www.w3.org/TR/wai-aria-1.1/#aria-multiselectable",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "aria-orientation",
        description: Some(
            "Indicates whether the element's orientation is horizontal, vertical, or unknown/ambiguous.",
        ),
        value_set: Some("orientation"),
        references: &[Reference {
            name: "WAI-ARIA Reference",
            url: "https://www.w3.org/TR/wai-aria-1.1/#aria-orientation",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "aria-owns",
        description: Some(
            "Identifies an [element](https://www.w3.org/TR/wai-aria-1.1/#dfn-element) (or elements) in order to define a visual, functional, or contextual parent/child [relationship](https://www.w3.org/TR/wai-aria-1.1/#dfn-relationship) between DOM elements where the DOM hierarchy cannot be used to represent the relationship. See related [`aria-controls`](https://www.w3.org/TR/wai-aria-1.1/#aria-controls).",
        ),
        value_set: None,
        references: &[Reference {
            name: "WAI-ARIA Reference",
            url: "https://www.w3.org/TR/wai-aria-1.1/#aria-owns",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "aria-placeholder",
        description: Some(
            "Defines a short hint (a word or short phrase) intended to aid the user with data entry when the control has no value. A hint could be a sample value or a brief description of the expected format.",
        ),
        value_set: None,
        references: &[Reference {
            name: "WAI-ARIA Reference",
            url: "https://www.w3.org/TR/wai-aria-1.1/#aria-placeholder",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "aria-posinset",
        description: Some(
            "Defines an [element](https://www.w3.org/TR/wai-aria-1.1/#dfn-element)'s number or position in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM. See related [`aria-setsize`](https://www.w3.org/TR/wai-aria-1.1/#aria-setsize).",
        ),
        value_set: None,
        references: &[Reference {
            name: "WAI-ARIA Reference",
            url: "https://www.w3.org/TR/wai-aria-1.1/#aria-posinset",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "aria-pressed",
        description: Some(
            "Indicates the current \"pressed\" [state](https://www.w3.org/TR/wai-aria-1.1/#dfn-state) of toggle buttons. See related [`aria-checked`](https://www.w3.org/TR/wai-aria-1.1/#aria-checked) and [`aria-selected`](https://www.w3.org/TR/wai-aria-1.1/#aria-selected).",
        ),
        value_set: Some("tristate"),
        references: &[Reference {
            name: "WAI-ARIA Reference",
            url: "https://www.w3.org/TR/wai-aria-1.1/#aria-pressed",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "aria-readonly",
        description: Some(
            "Indicates that the [element](https://www.w3.org/TR/wai-aria-1.1/#dfn-element) is not editable, but is otherwise [operable](https://www.w3.org/TR/wai-aria-1.1/#dfn-operable). See related [`aria-disabled`](https://www.w3.org/TR/wai-aria-1.1/#aria-disabled).",
        ),
        value_set: Some("b"),
        references: &[Reference {
            name: "WAI-ARIA Reference",
            url: "https://www.w3.org/TR/wai-aria-1.1/#aria-readonly",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "aria-relevant",
        description: Some(
            "Indicates what notifications the user agent will trigger when the accessibility tree within a live region is modified. See related [`aria-atomic`](https://www.w3.org/TR/wai-aria-1.1/#aria-atomic).",
        ),
        value_set: Some("relevant"),
        references: &[Reference {
            name: "WAI-ARIA Reference",
            url: "https://www.w3.org/TR/wai-aria-1.1/#aria-relevant",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "aria-required",
        description: Some(
            "Indicates that user input is required on the [element](https://www.w3.org/TR/wai-aria-1.1/#dfn-element) before a form may be submitted.",
        ),
        value_set: Some("b"),
        references: &[Reference {
            name: "WAI-ARIA Reference",
            url: "https://www.w3.org/TR/wai-aria-1.1/#aria-required",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "aria-roledescription",
        description: Some(
            "Defines a human-readable, author-localized description for the [role](https://www.w3.org/TR/wai-aria-1.1/#dfn-role) of an [element](https://www.w3.org/TR/wai-aria-1.1/#dfn-element).",
        ),
        value_set: None,
        references: &[Reference {
            name: "WAI-ARIA Reference",
            url: "https://www.w3.org/TR/wai-aria-1.1/#aria-roledescription",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "aria-rowcount",
        description: Some(
            "Defines the total number of rows in a [`table`](https://www.w3.org/TR/wai-aria-1.1/#table), [`grid`](https://www.w3.org/TR/wai-aria-1.1/#grid), or [`treegrid`](https://www.w3.org/TR/wai-aria-1.1/#treegrid). See related [`aria-rowindex`](https://www.w3.org/TR/wai-aria-1.1/#aria-rowindex).",
        ),
        value_set: None,
        references: &[Reference {
            name: "WAI-ARIA Reference",
            url: "https://www.w3.org/TR/wai-aria-1.1/#aria-rowcount",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "aria-rowindex",
        description: Some(
            "Defines an [element's](https://www.w3.org/TR/wai-aria-1.1/#dfn-element) row index or position with respect to the total number of rows within a [`table`](https://www.w3.org/TR/wai-aria-1.1/#table), [`grid`](https://www.w3.org/TR/wai-aria-1.1/#grid), or [`treegrid`](https://www.w3.org/TR/wai-aria-1.1/#treegrid). See related [`aria-rowcount`](https://www.w3.org/TR/wai-aria-1.1/#aria-rowcount) and [`aria-rowspan`](https://www.w3.org/TR/wai-aria-1.1/#aria-rowspan).",
        ),
        value_set: None,
        references: &[Reference {
            name: "WAI-ARIA Reference",
            url: "https://www.w3.org/TR/wai-aria-1.1/#aria-rowindex",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "aria-rowspan",
        description: Some(
            "Defines the number of rows spanned by a cell or gridcell within a [`table`](https://www.w3.org/TR/wai-aria-1.1/#table), [`grid`](https://www.w3.org/TR/wai-aria-1.1/#grid), or [`treegrid`](https://www.w3.org/TR/wai-aria-1.1/#treegrid). See related [`aria-rowindex`](https://www.w3.org/TR/wai-aria-1.1/#aria-rowindex) and [`aria-colspan`](https://www.w3.org/TR/wai-aria-1.1/#aria-colspan).",
        ),
        value_set: None,
        references: &[Reference {
            name: "WAI-ARIA Reference",
            url: "https://www.w3.org/TR/wai-aria-1.1/#aria-rowspan",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "aria-selected",
        description: Some(
            "Indicates the current \"selected\" [state](https://www.w3.org/TR/wai-aria-1.1/#dfn-state) of various [widgets](https://www.w3.org/TR/wai-aria-1.1/#dfn-widget). See related [`aria-checked`](https://www.w3.org/TR/wai-aria-1.1/#aria-checked) and [`aria-pressed`](https://www.w3.org/TR/wai-aria-1.1/#aria-pressed).",
        ),
        value_set: Some("u"),
        references: &[Reference {
            name: "WAI-ARIA Reference",
            url: "https://www.w3.org/TR/wai-aria-1.1/#aria-selected",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "aria-setsize",
        description: Some(
            "Defines the number of items in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM. See related [`aria-posinset`](https://www.w3.org/TR/wai-aria-1.1/#aria-posinset).",
        ),
        value_set: None,
        references: &[Reference {
            name: "WAI-ARIA Reference",
            url: "https://www.w3.org/TR/wai-aria-1.1/#aria-setsize",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "aria-sort",
        description: Some(
            "Indicates if items in a table or grid are sorted in ascending or descending order.",
        ),
        value_set: Some("sort"),
        references: &[Reference {
            name: "WAI-ARIA Reference",
            url: "https://www.w3.org/TR/wai-aria-1.1/#aria-sort",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "aria-valuemax",
        description: Some(
            "Defines the maximum allowed value for a range [widget](https://www.w3.org/TR/wai-aria-1.1/#dfn-widget).",
        ),
        value_set: None,
        references: &[Reference {
            name: "WAI-ARIA Reference",
            url: "https://www.w3.org/TR/wai-aria-1.1/#aria-valuemax",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "aria-valuemin",
        description: Some(
            "Defines the minimum allowed value for a range [widget](https://www.w3.org/TR/wai-aria-1.1/#dfn-widget).",
        ),
        value_set: None,
        references: &[Reference {
            name: "WAI-ARIA Reference",
            url: "https://www.w3.org/TR/wai-aria-1.1/#aria-valuemin",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "aria-valuenow",
        description: Some(
            "Defines the current value for a range [widget](https://www.w3.org/TR/wai-aria-1.1/#dfn-widget). See related [`aria-valuetext`](https://www.w3.org/TR/wai-aria-1.1/#aria-valuetext).",
        ),
        value_set: None,
        references: &[Reference {
            name: "WAI-ARIA Reference",
            url: "https://www.w3.org/TR/wai-aria-1.1/#aria-valuenow",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "aria-valuetext",
        description: Some(
            "Defines the human readable text alternative of [`aria-valuenow`](https://www.w3.org/TR/wai-aria-1.1/#aria-valuenow) for a range [widget](https://www.w3.org/TR/wai-aria-1.1/#dfn-widget).",
        ),
        value_set: None,
        references: &[Reference {
            name: "WAI-ARIA Reference",
            url: "https://www.w3.org/TR/wai-aria-1.1/#aria-valuetext",
        }],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "aria-details",
        description: Some(
            "Identifies the [element](https://www.w3.org/TR/wai-aria-1.1/#dfn-element) that provides a detailed, extended description for the [object](https://www.w3.org/TR/wai-aria-1.1/#dfn-object). See related [`aria-describedby`](https://www.w3.org/TR/wai-aria-1.1/#aria-describedby).",
        ),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
    Attribute {
        name: "aria-keyshortcuts",
        description: Some(
            "Indicates keyboard shortcuts that an author has implemented to activate or give focus to an element.",
        ),
        value_set: None,
        references: &[],
        browsers: &[],
        status: None,
    },
];

pub const VALUE_SETS: &[ValueSet] = &[
    ValueSet {
        name: "b",
        values: &[
            Value {
                name: "true",
                description: None,
            },
            Value {
                name: "false",
                description: None,
            },
        ],
    },
    ValueSet {
        name: "u",
        values: &[
            Value {
                name: "true",
                description: None,
            },
            Value {
                name: "false",
                description: None,
            },
            Value {
                name: "undefined",
                description: None,
            },
        ],
    },
    ValueSet {
        name: "o",
        values: &[
            Value {
                name: "on",
                description: None,
            },
            Value {
                name: "off",
                description: None,
            },
        ],
    },
    ValueSet {
        name: "y",
        values: &[
            Value {
                name: "yes",
                description: None,
            },
            Value {
                name: "no",
                description: None,
            },
        ],
    },
    ValueSet {
        name: "w",
        values: &[
            Value {
                name: "soft",
                description: None,
            },
            Value {
                name: "hard",
                description: None,
            },
        ],
    },
    ValueSet {
        name: "d",
        values: &[
            Value {
                name: "ltr",
                description: None,
            },
            Value {
                name: "rtl",
                description: None,
            },
            Value {
                name: "auto",
                description: None,
            },
        ],
    },
    ValueSet {
        name: "m",
        values: &[
            Value {
                name: "get",
                description: Some(
                    "Corresponds to the HTTP [GET method](https://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9.3); form data are appended to the `action` attribute URI with a '?' as separator, and the resulting URI is sent to the server. Use this method when the form has no side-effects and contains only ASCII characters.",
                ),
            },
            Value {
                name: "post",
                description: Some(
                    "Corresponds to the HTTP [POST method](https://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9.5); form data are included in the body of the form and sent to the server.",
                ),
            },
            Value {
                name: "dialog",
                description: Some(
                    "Use when the form is inside a [`<dialog>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog) element to close the dialog when submitted.",
                ),
            },
        ],
    },
    ValueSet {
        name: "fm",
        values: &[
            Value {
                name: "get",
                description: None,
            },
            Value {
                name: "post",
                description: None,
            },
        ],
    },
    ValueSet {
        name: "s",
        values: &[
            Value {
                name: "row",
                description: None,
            },
            Value {
                name: "col",
                description: None,
            },
            Value {
                name: "rowgroup",
                description: None,
            },
            Value {
                name: "colgroup",
                description: None,
            },
        ],
    },
    ValueSet {
        name: "t",
        values: &[
            Value {
                name: "hidden",
                description: None,
            },
            Value {
                name: "text",
                description: None,
            },
            Value {
                name: "search",
                description: None,
            },
            Value {
                name: "tel",
                description: None,
            },
            Value {
                name: "url",
                description: None,
            },
            Value {
                name: "email",
                description: None,
            },
            Value {
                name: "password",
                description: None,
            },
            Value {
                name: "datetime",
                description: None,
            },
            Value {
                name: "date",
                description: None,
            },
            Value {
                name: "month",
                description: None,
            },
            Value {
                name: "week",
                description: None,
            },
            Value {
                name: "time",
                description: None,
            },
            Value {
                name: "datetime-local",
                description: None,
            },
            Value {
                name: "number",
                description: None,
            },
            Value {
                name: "range",
                description: None,
            },
            Value {
                name: "color",
                description: None,
            },
            Value {
                name: "checkbox",
                description: None,
            },
            Value {
                name: "radio",
                description: None,
            },
            Value {
                name: "file",
                description: None,
            },
            Value {
                name: "submit",
                description: None,
            },
            Value {
                name: "image",
                description: None,
            },
            Value {
                name: "reset",
                description: None,
            },
            Value {
                name: "button",
                description: None,
            },
        ],
    },
    ValueSet {
        name: "im",
        values: &[
            Value {
                name: "verbatim",
                description: None,
            },
            Value {
                name: "latin",
                description: None,
            },
            Value {
                name: "latin-name",
                description: None,
            },
            Value {
                name: "latin-prose",
                description: None,
            },
            Value {
                name: "full-width-latin",
                description: None,
            },
            Value {
                name: "kana",
                description: None,
            },
            Value {
                name: "kana-name",
                description: None,
            },
            Value {
                name: "katakana",
                description: None,
            },
            Value {
                name: "numeric",
                description: None,
            },
            Value {
                name: "tel",
                description: None,
            },
            Value {
                name: "email",
                description: None,
            },
            Value {
                name: "url",
                description: None,
            },
        ],
    },
    ValueSet {
        name: "bt",
        values: &[
            Value {
                name: "button",
                description: None,
            },
            Value {
                name: "submit",
                description: None,
            },
            Value {
                name: "reset",
                description: None,
            },
            Value {
                name: "menu",
                description: None,
            },
        ],
    },
    ValueSet {
        name: "lt",
        values: &[
            Value {
                name: "1",
                description: None,
            },
            Value {
                name: "a",
                description: None,
            },
            Value {
                name: "A",
                description: None,
            },
            Value {
                name: "i",
                description: None,
            },
            Value {
                name: "I",
                description: None,
            },
        ],
    },
    ValueSet {
        name: "mt",
        values: &[
            Value {
                name: "context",
                description: None,
            },
            Value {
                name: "toolbar",
                description: None,
            },
        ],
    },
    ValueSet {
        name: "mit",
        values: &[
            Value {
                name: "command",
                description: None,
            },
            Value {
                name: "checkbox",
                description: None,
            },
            Value {
                name: "radio",
                description: None,
            },
        ],
    },
    ValueSet {
        name: "et",
        values: &[
            Value {
                name: "application/x-www-form-urlencoded",
                description: None,
            },
            Value {
                name: "multipart/form-data",
                description: None,
            },
            Value {
                name: "text/plain",
                description: None,
            },
        ],
    },
    ValueSet {
        name: "tk",
        values: &[
            Value {
                name: "subtitles",
                description: None,
            },
            Value {
                name: "captions",
                description: None,
            },
            Value {
                name: "descriptions",
                description: None,
            },
            Value {
                name: "chapters",
                description: None,
            },
            Value {
                name: "metadata",
                description: None,
            },
        ],
    },
    ValueSet {
        name: "pl",
        values: &[
            Value {
                name: "none",
                description: None,
            },
            Value {
                name: "metadata",
                description: None,
            },
            Value {
                name: "auto",
                description: None,
            },
        ],
    },
    ValueSet {
        name: "sh",
        values: &[
            Value {
                name: "circle",
                description: None,
            },
            Value {
                name: "default",
                description: None,
            },
            Value {
                name: "poly",
                description: None,
            },
            Value {
                name: "rect",
                description: None,
            },
        ],
    },
    ValueSet {
        name: "xo",
        values: &[
            Value {
                name: "anonymous",
                description: None,
            },
            Value {
                name: "use-credentials",
                description: None,
            },
        ],
    },
    ValueSet {
        name: "target",
        values: &[
            Value {
                name: "_self",
                description: None,
            },
            Value {
                name: "_blank",
                description: None,
            },
            Value {
                name: "_parent",
                description: None,
            },
            Value {
                name: "_top",
                description: None,
            },
        ],
    },
    ValueSet {
        name: "sb",
        values: &[
            Value {
                name: "allow-forms",
                description: None,
            },
            Value {
                name: "allow-modals",
                description: None,
            },
            Value {
                name: "allow-pointer-lock",
                description: None,
            },
            Value {
                name: "allow-popups",
                description: None,
            },
            Value {
                name: "allow-popups-to-escape-sandbox",
                description: None,
            },
            Value {
                name: "allow-same-origin",
                description: None,
            },
            Value {
                name: "allow-scripts",
                description: None,
            },
            Value {
                name: "allow-top-navigation",
                description: None,
            },
        ],
    },
    ValueSet {
        name: "tristate",
        values: &[
            Value {
                name: "true",
                description: None,
            },
            Value {
                name: "false",
                description: None,
            },
            Value {
                name: "mixed",
                description: None,
            },
            Value {
                name: "undefined",
                description: None,
            },
        ],
    },
    ValueSet {
        name: "inputautocomplete",
        values: &[
            Value {
                name: "additional-name",
                description: None,
            },
            Value {
                name: "address-level1",
                description: None,
            },
            Value {
                name: "address-level2",
                description: None,
            },
            Value {
                name: "address-level3",
                description: None,
            },
            Value {
                name: "address-level4",
                description: None,
            },
            Value {
                name: "address-line1",
                description: None,
            },
            Value {
                name: "address-line2",
                description: None,
            },
            Value {
                name: "address-line3",
                description: None,
            },
            Value {
                name: "bday",
                description: None,
            },
            Value {
                name: "bday-year",
                description: None,
            },
            Value {
                name: "bday-day",
                description: None,
            },
            Value {
                name: "bday-month",
                description: None,
            },
            Value {
                name: "billing",
                description: None,
            },
            Value {
                name: "cc-additional-name",
                description: None,
            },
            Value {
                name: "cc-csc",
                description: None,
            },
            Value {
                name: "cc-exp",
                description: None,
            },
            Value {
                name: "cc-exp-month",
                description: None,
            },
            Value {
                name: "cc-exp-year",
                description: None,
            },
            Value {
                name: "cc-family-name",
                description: None,
            },
            Value {
                name: "cc-given-name",
                description: None,
            },
            Value {
                name: "cc-name",
                description: None,
            },
            Value {
                name: "cc-number",
                description: None,
            },
            Value {
                name: "cc-type",
                description: None,
            },
            Value {
                name: "country",
                description: None,
            },
            Value {
                name: "country-name",
                description: None,
            },
            Value {
                name: "current-password",
                description: None,
            },
            Value {
                name: "email",
                description: None,
            },
            Value {
                name: "family-name",
                description: None,
            },
            Value {
                name: "fax",
                description: None,
            },
            Value {
                name: "given-name",
                description: None,
            },
            Value {
                name: "home",
                description: None,
            },
            Value {
                name: "honorific-prefix",
                description: None,
            },
            Value {
                name: "honorific-suffix",
                description: None,
            },
            Value {
                name: "impp",
                description: None,
            },
            Value {
                name: "language",
                description: None,
            },
            Value {
                name: "mobile",
                description: None,
            },
            Value {
                name: "name",
                description: None,
            },
            Value {
                name: "new-password",
                description: None,
            },
            Value {
                name: "nickname",
                description: None,
            },
            Value {
                name: "off",
                description: None,
            },
            Value {
                name: "on",
                description: None,
            },
            Value {
                name: "organization",
                description: None,
            },
            Value {
                name: "organization-title",
                description: None,
            },
            Value {
                name: "pager",
                description: None,
            },
            Value {
                name: "photo",
                description: None,
            },
            Value {
                name: "postal-code",
                description: None,
            },
            Value {
                name: "sex",
                description: None,
            },
            Value {
                name: "shipping",
                description: None,
            },
            Value {
                name: "street-address",
                description: None,
            },
            Value {
                name: "tel-area-code",
                description: None,
            },
            Value {
                name: "tel",
                description: None,
            },
            Value {
                name: "tel-country-code",
                description: None,
            },
            Value {
                name: "tel-extension",
                description: None,
            },
            Value {
                name: "tel-local",
                description: None,
            },
            Value {
                name: "tel-local-prefix",
                description: None,
            },
            Value {
                name: "tel-local-suffix",
                description: None,
            },
            Value {
                name: "tel-national",
                description: None,
            },
            Value {
                name: "transaction-amount",
                description: None,
            },
            Value {
                name: "transaction-currency",
                description: None,
            },
            Value {
                name: "url",
                description: None,
            },
            Value {
                name: "username",
                description: None,
            },
            Value {
                name: "work",
                description: None,
            },
        ],
    },
    ValueSet {
        name: "autocomplete",
        values: &[
            Value {
                name: "inline",
                description: None,
            },
            Value {
                name: "list",
                description: None,
            },
            Value {
                name: "both",
                description: None,
            },
            Value {
                name: "none",
                description: None,
            },
        ],
    },
    ValueSet {
        name: "current",
        values: &[
            Value {
                name: "page",
                description: None,
            },
            Value {
                name: "step",
                description: None,
            },
            Value {
                name: "location",
                description: None,
            },
            Value {
                name: "date",
                description: None,
            },
            Value {
                name: "time",
                description: None,
            },
            Value {
                name: "true",
                description: None,
            },
            Value {
                name: "false",
                description: None,
            },
        ],
    },
    ValueSet {
        name: "dropeffect",
        values: &[
            Value {
                name: "copy",
                description: None,
            },
            Value {
                name: "move",
                description: None,
            },
            Value {
                name: "link",
                description: None,
            },
            Value {
                name: "execute",
                description: None,
            },
            Value {
                name: "popup",
                description: None,
            },
            Value {
                name: "none",
                description: None,
            },
        ],
    },
    ValueSet {
        name: "invalid",
        values: &[
            Value {
                name: "grammar",
                description: None,
            },
            Value {
                name: "false",
                description: None,
            },
            Value {
                name: "spelling",
                description: None,
            },
            Value {
                name: "true",
                description: None,
            },
        ],
    },
    ValueSet {
        name: "live",
        values: &[
            Value {
                name: "off",
                description: None,
            },
            Value {
                name: "polite",
                description: None,
            },
            Value {
                name: "assertive",
                description: None,
            },
        ],
    },
    ValueSet {
        name: "orientation",
        values: &[
            Value {
                name: "vertical",
                description: None,
            },
            Value {
                name: "horizontal",
                description: None,
            },
            Value {
                name: "undefined",
                description: None,
            },
        ],
    },
    ValueSet {
        name: "relevant",
        values: &[
            Value {
                name: "additions",
                description: None,
            },
            Value {
                name: "removals",
                description: None,
            },
            Value {
                name: "text",
                description: None,
            },
            Value {
                name: "all",
                description: None,
            },
            Value {
                name: "additions text",
                description: None,
            },
        ],
    },
    ValueSet {
        name: "sort",
        values: &[
            Value {
                name: "ascending",
                description: None,
            },
            Value {
                name: "descending",
                description: None,
            },
            Value {
                name: "none",
                description: None,
            },
            Value {
                name: "other",
                description: None,
            },
        ],
    },
    ValueSet {
        name: "roles",
        values: &[
            Value {
                name: "alert",
                description: None,
            },
            Value {
                name: "alertdialog",
                description: None,
            },
            Value {
                name: "button",
                description: None,
            },
            Value {
                name: "checkbox",
                description: None,
            },
            Value {
                name: "dialog",
                description: None,
            },
            Value {
                name: "gridcell",
                description: None,
            },
            Value {
                name: "link",
                description: None,
            },
            Value {
                name: "log",
                description: None,
            },
            Value {
                name: "marquee",
                description: None,
            },
            Value {
                name: "menuitem",
                description: None,
            },
            Value {
                name: "menuitemcheckbox",
                description: None,
            },
            Value {
                name: "menuitemradio",
                description: None,
            },
            Value {
                name: "option",
                description: None,
            },
            Value {
                name: "progressbar",
                description: None,
            },
            Value {
                name: "radio",
                description: None,
            },
            Value {
                name: "scrollbar",
                description: None,
            },
            Value {
                name: "searchbox",
                description: None,
            },
            Value {
                name: "slider",
                description: None,
            },
            Value {
                name: "spinbutton",
                description: None,
            },
            Value {
                name: "status",
                description: None,
            },
            Value {
                name: "switch",
                description: None,
            },
            Value {
                name: "tab",
                description: None,
            },
            Value {
                name: "tabpanel",
                description: None,
            },
            Value {
                name: "textbox",
                description: None,
            },
            Value {
                name: "timer",
                description: None,
            },
            Value {
                name: "tooltip",
                description: None,
            },
            Value {
                name: "treeitem",
                description: None,
            },
            Value {
                name: "combobox",
                description: None,
            },
            Value {
                name: "grid",
                description: None,
            },
            Value {
                name: "listbox",
                description: None,
            },
            Value {
                name: "menu",
                description: None,
            },
            Value {
                name: "menubar",
                description: None,
            },
            Value {
                name: "radiogroup",
                description: None,
            },
            Value {
                name: "tablist",
                description: None,
            },
            Value {
                name: "tree",
                description: None,
            },
            Value {
                name: "treegrid",
                description: None,
            },
            Value {
                name: "application",
                description: None,
            },
            Value {
                name: "article",
                description: None,
            },
            Value {
                name: "cell",
                description: None,
            },
            Value {
                name: "columnheader",
                description: None,
            },
            Value {
                name: "definition",
                description: None,
            },
            Value {
                name: "directory",
                description: None,
            },
            Value {
                name: "document",
                description: None,
            },
            Value {
                name: "feed",
                description: None,
            },
            Value {
                name: "figure",
                description: None,
            },
            Value {
                name: "group",
                description: None,
            },
            Value {
                name: "heading",
                description: None,
            },
            Value {
                name: "img",
                description: None,
            },
            Value {
                name: "list",
                description: None,
            },
            Value {
                name: "listitem",
                description: None,
            },
            Value {
                name: "math",
                description: None,
            },
            Value {
                name: "none",
                description: None,
            },
            Value {
                name: "note",
                description: None,
            },
            Value {
                name: "presentation",
                description: None,
            },
            Value {
                name: "region",
                description: None,
            },
            Value {
                name: "row",
                description: None,
            },
            Value {
                name: "rowgroup",
                description: None,
            },
            Value {
                name: "rowheader",
                description: None,
            },
            Value {
                name: "separator",
                description: None,
            },
            Value {
                name: "table",
                description: None,
            },
            Value {
                name: "term",
                description: None,
            },
            Value {
                name: "text",
                description: None,
            },
            Value {
                name: "toolbar",
                description: None,
            },
            Value {
                name: "banner",
                description: None,
            },
            Value {
                name: "complementary",
                description: None,
            },
            Value {
                name: "contentinfo",
                description: None,
            },
            Value {
                name: "form",
                description: None,
            },
            Value {
                name: "main",
                description: None,
            },
            Value {
                name: "navigation",
                description: None,
            },
            Value {
                name: "region",
                description: None,
            },
            Value {
                name: "search",
                description: None,
            },
            Value {
                name: "doc-abstract",
                description: None,
            },
            Value {
                name: "doc-acknowledgments",
                description: None,
            },
            Value {
                name: "doc-afterword",
                description: None,
            },
            Value {
                name: "doc-appendix",
                description: None,
            },
            Value {
                name: "doc-backlink",
                description: None,
            },
            Value {
                name: "doc-biblioentry",
                description: None,
            },
            Value {
                name: "doc-bibliography",
                description: None,
            },
            Value {
                name: "doc-biblioref",
                description: None,
            },
            Value {
                name: "doc-chapter",
                description: None,
            },
            Value {
                name: "doc-colophon",
                description: None,
            },
            Value {
                name: "doc-conclusion",
                description: None,
            },
            Value {
                name: "doc-cover",
                description: None,
            },
            Value {
                name: "doc-credit",
                description: None,
            },
            Value {
                name: "doc-credits",
                description: None,
            },
            Value {
                name: "doc-dedication",
                description: None,
            },
            Value {
                name: "doc-endnote",
                description: None,
            },
            Value {
                name: "doc-endnotes",
                description: None,
            },
            Value {
                name: "doc-epigraph",
                description: None,
            },
            Value {
                name: "doc-epilogue",
                description: None,
            },
            Value {
                name: "doc-errata",
                description: None,
            },
            Value {
                name: "doc-example",
                description: None,
            },
            Value {
                name: "doc-footnote",
                description: None,
            },
            Value {
                name: "doc-foreword",
                description: None,
            },
            Value {
                name: "doc-glossary",
                description: None,
            },
            Value {
                name: "doc-glossref",
                description: None,
            },
            Value {
                name: "doc-index",
                description: None,
            },
            Value {
                name: "doc-introduction",
                description: None,
            },
            Value {
                name: "doc-noteref",
                description: None,
            },
            Value {
                name: "doc-notice",
                description: None,
            },
            Value {
                name: "doc-pagebreak",
                description: None,
            },
            Value {
                name: "doc-pagelist",
                description: None,
            },
            Value {
                name: "doc-part",
                description: None,
            },
            Value {
                name: "doc-preface",
                description: None,
            },
            Value {
                name: "doc-prologue",
                description: None,
            },
            Value {
                name: "doc-pullquote",
                description: None,
            },
            Value {
                name: "doc-qna",
                description: None,
            },
            Value {
                name: "doc-subtitle",
                description: None,
            },
            Value {
                name: "doc-tip",
                description: None,
            },
            Value {
                name: "doc-toc",
                description: None,
            },
        ],
    },
    ValueSet {
        name: "metanames",
        values: &[
            Value {
                name: "application-name",
                description: None,
            },
            Value {
                name: "author",
                description: None,
            },
            Value {
                name: "description",
                description: None,
            },
            Value {
                name: "format-detection",
                description: None,
            },
            Value {
                name: "generator",
                description: None,
            },
            Value {
                name: "keywords",
                description: None,
            },
            Value {
                name: "publisher",
                description: None,
            },
            Value {
                name: "referrer",
                description: None,
            },
            Value {
                name: "robots",
                description: None,
            },
            Value {
                name: "theme-color",
                description: None,
            },
            Value {
                name: "viewport",
                description: None,
            },
        ],
    },
    ValueSet {
        name: "haspopup",
        values: &[
            Value {
                name: "false",
                description: Some("(default) Indicates the element does not have a popup."),
            },
            Value {
                name: "true",
                description: Some("Indicates the popup is a menu."),
            },
            Value {
                name: "menu",
                description: Some("Indicates the popup is a menu."),
            },
            Value {
                name: "listbox",
                description: Some("Indicates the popup is a listbox."),
            },
            Value {
                name: "tree",
                description: Some("Indicates the popup is a tree."),
            },
            Value {
                name: "grid",
                description: Some("Indicates the popup is a grid."),
            },
            Value {
                name: "dialog",
                description: Some("Indicates the popup is a dialog."),
            },
        ],
    },
    ValueSet {
        name: "decoding",
        values: &[
            Value {
                name: "sync",
                description: None,
            },
            Value {
                name: "async",
                description: None,
            },
            Value {
                name: "auto",
                description: None,
            },
        ],
    },
    ValueSet {
        name: "loading",
        values: &[
            Value {
                name: "eager",
                description: Some(
                    "Loads the image immediately, regardless of whether or not the image is currently within the visible viewport (this is the default value).",
                ),
            },
            Value {
                name: "lazy",
                description: Some(
                    "Defers loading the image until it reaches a calculated distance from the viewport, as defined by the browser. The intent is to avoid the network and storage bandwidth needed to handle the image until it's reasonably certain that it will be needed. This generally improves the performance of the content in most typical use cases.",
                ),
            },
        ],
    },
    ValueSet {
        name: "referrerpolicy",
        values: &[
            Value {
                name: "no-referrer",
                description: None,
            },
            Value {
                name: "no-referrer-when-downgrade",
                description: None,
            },
            Value {
                name: "origin",
                description: None,
            },
            Value {
                name: "origin-when-cross-origin",
                description: None,
            },
            Value {
                name: "same-origin",
                description: None,
            },
            Value {
                name: "strict-origin",
                description: None,
            },
            Value {
                name: "strict-origin-when-cross-origin",
                description: None,
            },
            Value {
                name: "unsafe-url",
                description: None,
            },
        ],
    },
    ValueSet {
        name: "enterkeyhint",
        values: &[
            Value {
                name: "enter",
                description: None,
            },
            Value {
                name: "done",
                description: None,
            },
            Value {
                name: "go",
                description: None,
            },
            Value {
                name: "next",
                description: None,
            },
            Value {
                name: "previous",
                description: None,
            },
            Value {
                name: "search",
                description: None,
            },
            Value {
                name: "send",
                description: None,
            },
        ],
    },
    ValueSet {
        name: "popover",
        values: &[
            Value {
                name: "auto",
                description: None,
            },
            Value {
                name: "hint",
                description: None,
            },
            Value {
                name: "manual",
                description: None,
            },
        ],
    },
    ValueSet {
        name: "fetchpriority",
        values: &[
            Value {
                name: "high",
                description: None,
            },
            Value {
                name: "low",
                description: None,
            },
            Value {
                name: "auto",
                description: None,
            },
        ],
    },
];
