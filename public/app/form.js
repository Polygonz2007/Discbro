//
//  form.js
//
//  Used to create user input forms that do stuff when finished.
//

export class Form {
    constructor(name, submit_text) {
        this.name = name;
        this.css_name = name.toLowerCase().replace(" ", "-") + "-form";
        this.submit_text = submit_text;

        this.fields = [];
        this.form_element
        this.html;

        this.promise;
    }

    add_input(type, name, logical_name, placeholder_text) {
        // Name is displayed, logical_name is sent to server
        this.fields.push({
            type: type,
            name: name,
            logical_name: logical_name,
            placeholder_text: placeholder_text
        });
    }

    generate_html() {
        this.html = doc.createElement("form");
        this.html.setAttribute("id", `${this.css_name}`);

        const title = doc.createElement("h2");
        title.innerHTML = this.name;
        this.html.appendChild(title);

        for (let i = 0; i < this.fields.length; i++) {
            const field = this.fields[i];

            switch (field.type) {
                case "text":
                    const label = doc.createElement("label");
                    label.innerHTML = field.name;
                    label.setAttribute("for", field.logical_name);

                    const input = doc.createElement("input");
                    input.setAttribute("type", "text");
                    input.setAttribute("id", field.logical_name);
                    input.setAttribute("name", field.logical_name);
                    input.setAttribute("placeholder", field.placeholder_text || field.name);

                    this.html.appendChild(label);
                    this.html.appendChild(input);

                    break;
            }
        }

        // Then add submit button
        this.submit_btn = doc.createElement("input");
        this.submit_btn.setAttribute("type", "submit");
        this.submit_btn.setAttribute("value", this.submit_text);

        this.html.appendChild(this.submit_btn);

        return true;
    }
    
    async query() {
        // Generate HTML
        this.generate_html();

        // Display to user
        body.appendChild(this.html);

        // Wait for submit
        this.submit_btn.addEventListener("click", (event) => {
            console.log("u lcicked")
            event.preventDefault();

            // Get result
            let result = {};
            for (let i = 0; i < this.fields.length; i++) {
                const field = this.fields[i];
                const input = doc.querySelector(`#${this.css_name} > #${field.logical_name}`);
                if (!input)
                    return false;

                // Check if it meets requirements, tell user to try again if not

                // Add it to results
                result[field.logical_name] = input.value;
            }

            // Remove HTML and unbind event
            this.html.remove();

            // Return
            this.resolve(result);
        });

        // Return promise that can be resolved by click function
        return new Promise((resolve, reject) => {
            this.resolve = resolve;
        })
    }
}

