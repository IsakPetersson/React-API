import React from "react";

export default function LoginCard() {
    return (
        <div className="card mx-auto mt-5" style={{ maxWidth: "60%", minWidth: "40%", backgroundColor: "#222" }}>
            <div className="card-body" style={{ backgroundColor: "#222" }}>
                <h3 className="card-title text-center mb-4">Login</h3>
                <form
                    onSubmit={e => {
                        e.preventDefault();
                        const username = e.target.username.value;
                        const password = e.target.password.value;
                        onLogin(username, password);
                    }}
                >
                    <div className="mb-3">
                        <label htmlFor="username" className="form-label">
                            Username
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            id="username"
                            name="username"
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">
                            Password
                        </label>
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            name="password"
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100 buttonFade" style={{ backgroundColor: "#007bff", border: "none" }}>
                        Login
                    </button>

                    <a href="/register" className="btn btn-link w-100 mt-2 linkFade">Register</a>

                </form>
            </div>
        </div>
    );
}

