//
//  cookies.js
//
//  Stores and gets cookies the user has set. Disables / enables other scripts based off these settings.
//

const cookies = {
    "necessary": ["comms.js"],
    "marketing": ["ad_watcher.js"]
}

// Settings
const settings = {
    cookie_name: "cookie-consent",
    cookie_expire_duration: 90 // days
}


// Elements
const popup = doc.querySelector("#cookies");
const checkboxes = {
    "necessary": doc.querySelector("#check-necessary"),
    "analytics": doc.querySelector("#check-analytics"),
    "marketing": doc.querySelector("#check-marketing")
}


// Close menu if cookies exist
if (get_consent())
    close_popup();


// Events
doc.querySelector("#cookies-decline-all").addEventListener("click", () => {
    set_consent({
        "necessary": true,
        "analytics": false,
        "marketing": false
    })

    // Close menu!
    close_popup();
});

doc.querySelector("#cookies-save").addEventListener("click", () => {
    // Set em
    set_consent({
        "necessary": true,
        "analytics": checkboxes.analytics.checked,
        "marketing": checkboxes.marketing.checked
    })

    // Do something with this insight
    if (checkboxes.marketing.checked)
        consume_user_information();

    // Close menu!
    close_popup();
});

doc.querySelector("#cookies-accept-all").addEventListener("click", () => {
    set_consent({
        "necessary": true,
        "analytics": true,
        "marketing": true
    })

    // Do sometjing with this insight
    consume_user_information();

    // Close menu!
    close_popup();
});


// Open / close popup
function open_popup() {
    // Open
    popup.style.visibility = "visible";

    // Set checked ones (if there are any)
    const choices = get_consent();
    if (!choices)
        return; // nothing to do

    const cookies = Object.keys(choices);

    // Set them
    for (let i = 0; i < cookies.length; i++) {
        doc.querySelector(`#check-${cookies[i]}`).checked = choices[cookies[i]];
    }
}
function close_popup() { popup.style.visibility = "hidden"; }


// Set / get cookies
function get_consent() {
    const consent_cookie = document.cookie.split('; ').find(row => row.startsWith(settings.cookie_name))?.split('=')[1]; // :)
    if (!consent_cookie)
        return false;

    return JSON.parse(decodeURIComponent(consent_cookie));
}

function set_consent(data) {
    const expires = new Date(Date.now() + settings.cookie_expire_duration * 864e5).toUTCString();
    data = JSON.stringify(data);
    document.cookie = `${settings.cookie_name}=${encodeURIComponent(data)}; expires=${expires}; path=/`; // :) :) :)
}

function print_consent() {
    console.log(JSON.parse(decodeURIComponent(get_consent())));
}









// Fun fun FUN!!!
function consume_user_information() {
    console.log("You moved your mouse 0.1px and therefore you want to purchase this incredible oven! Click here!");
}