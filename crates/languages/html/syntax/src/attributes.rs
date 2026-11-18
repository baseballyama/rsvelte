//! Attribute facts the DOM fixes.

/// The DOM property a lowercased attribute name sets, where the property is camel-cased; Svelte's
/// `normalize_attribute` lists these.
#[must_use]
pub fn property_name(lowercase: &str) -> Option<&'static str> {
    Some(match lowercase {
        "formnovalidate" => "formNoValidate",
        "ismap" => "isMap",
        "nomodule" => "noModule",
        "playsinline" => "playsInline",
        "readonly" => "readOnly",
        "defaultvalue" => "defaultValue",
        "defaultchecked" => "defaultChecked",
        "srcobject" => "srcObject",
        "novalidate" => "noValidate",
        "allowfullscreen" => "allowFullscreen",
        "disablepictureinpicture" => "disablePictureInPicture",
        "disableremoteplayback" => "disableRemotePlayback",
        _ => return None,
    })
}

#[cfg(test)]
mod tests;
