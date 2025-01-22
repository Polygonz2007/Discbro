
// This module is responsible for formatting messages sent by users, for exaple turning image links into images, removing unwanted HTML elements, bold, italics, underline, etc.

// Prevent HTML from being rendered instead of text
function escapeHTML(str) {
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

module.exports = {
    escapeHTML
}