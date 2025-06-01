//
//  form.js
//
//  Used to create user input forms that do stuff when finished.
//

class Form {
    constructor(name, type) {
        this.name = name;
        this.type = type;
        this.fields = {};

        this.div = 
    }

    add_input(type, name, logical_name) {
        // Name is displayed, logical_name is sent to server
        
    }
    
    submit() {
        const result = window.comms.ws_req(this.type, this.fields);
        if (!result.error)
            return true;

        // Something went bad
        // Show the error to user and do not close the form
    }
}