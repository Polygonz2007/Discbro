
// This module is responsible for formatting messages sent by users, for exaple turning image links into images, removing unwanted HTML elements, bold, italics, underline, etc.

// Prevent HTML from being rendered instead of text
function escape_html(str) {
    return str.replace(/[&<>"'\/]/g, (char) => {
        switch (char) {
        case '&':
            return '&amp;';
        case '<':
            return '&lt;';
        case '>':
            return '&gt;';
        case '"':
            return '&quot;';
        case '\\':
            return '&#39;';
        case '/':
            return '&#x2F;';
        default:
            return char;
        }
    });
}

function links(str) {
    // Images
    const img_reg = /(https:\/\/([^\s]+))/g;
    str = str.replace(img_reg, `<img src="$1"/><br>`);

    return str;
}

function log(source, text) {
    const date = new Date();
    process.stdout.write("[" + date.toLocaleTimeString() + "] \u001B[35m[" + source.toUpperCase() + "]\u001B[0m ");
    console.log(text);
    return;
}

module.exports = {
    escape_html,
    links,
    log
}