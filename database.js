const API_URL =
    "https://script.google.com/macros/s/AKfycbyf2LxZ1N2UZC6uTqZLYaabsCX2e5R7X3lO5fWe8zBS-g1n-D-K5cOWRIvFy8crjsJoqg/exec";



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

        DB.logout();

        const result = await request("login", {
            username,
            password
        });

        if (result.success) {

            localStorage.setItem("user_id", result.id);
            localStorage.setItem("username", result.username);

            whosthere();

            // Login counter
            await DB.updateLoginCounter().catch(error => {
                console.error("Login counter error:", error);
            });
        }

        return result;
    },


    logout() {

        localStorage.removeItem("user_id");
        localStorage.removeItem("username");
        localStorage.removeItem("name_database");
        location.href = "logged out.html";
    },


    isLoggedIn() {

        return !!localStorage.getItem("user_id");

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


    async set(data, column) {

        const id =
            localStorage.getItem("user_id");

        if (!id) {
            return {
                success: false,
                error: "Not logged in."
            };
        }

        return await request(
            "set",
            {
                id,
                data,
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
    },


    // =================================
    // LOGIN COUNTER
    // =================================

    async updateLoginCounter() {

        try {

            const loginsResult =
                await DB.get("E");

            const logins =
                Number(loginsResult.data) || 0;

            const newLogins =
                await DB.set(
                    logins + 1,
                    "E"
                );

            console.log(
                "Login counter:",
                newLogins
            );

        } catch (error) {

            console.error(
                "Login counter error:",
                error
            );

        }
    }

};