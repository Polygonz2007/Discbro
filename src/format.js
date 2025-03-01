
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
    const reg = new RegExp("https:\/\/([^\s]+)");
    console.log(str);

    //while (str.match(reg)) {
    if (str.match(reg)) {
        let link = str.match(reg);
        const formatted = "<a>" + link[0] + "</a>";
    }

    return str;
}

function log(source, text) {
    process.stdout.write("\u001B[35m[" + source.toUpperCase() + "]\u001B[0m ");
    console.log(text);
    return;
}

module.exports = {
    escape_html,
    links,
    log
}