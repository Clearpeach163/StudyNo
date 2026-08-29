const API_URL =
    "https://script.google.com/macros/s/AKfycbxk__CWehe1Try9sKmbf8Yr6C4K0AY0NapEBaQSA-bVgnEiAiVPeliaHTZcfpZLA4V1RA/exec ";


// =================================
// REQUEST
// =================================

async function request(action, data = {}) {

    const response = await fetch(API_URL, {

        method: "POST",

        body: JSON.stringify({
            action,
            ...data
        })

    });

    return await response.json();
}


// =================================
// AUTH
// =================================

const DB = {

    async register(username, password) {

        const result = await request(
            "register",
            {
                username,
                password
            }
        );

        return result;
    },


    async login(username, password) {

        const result = await request(
            "login",
            {
                username,
                password
            }
        );

        if (result.success) {

            localStorage.setItem(
                "user_id",
                result.id
            );

            localStorage.setItem(
                "username",
                result.username
            );
        }

        return result;
    },


    logout() {

        localStorage.removeItem("user_id");
        localStorage.removeItem("username");

    },


    isLoggedIn() {

        return !!localStorage.getItem(
            "user_id"
        );

    },


    getUser() {

        return {
            id: localStorage.getItem("user_id"),
            username: localStorage.getItem("username")
        };

    },


    // =================================
    // DATABASE
    // =================================

    async add(data, column) {

        const id =
            localStorage.getItem("user_id");

        if (!id) {
            throw new Error("Not logged in.");
        }

        return await request(
            "add",
            {
                id,
                data,
                column
            }
        );
    },


    async get(column) {

        const id =
            localStorage.getItem("user_id");

        if (!id) {
            throw new Error("Not logged in.");
        }

        return await request(
            "get",
            {
                id,
                column
            }
        );
    },


    async remove(column) {

        const id =
            localStorage.getItem("user_id");

        if (!id) {
            throw new Error("Not logged in.");
        }

        return await request(
            "remove",
            {
                id,
                column
            }
        );
    }

};