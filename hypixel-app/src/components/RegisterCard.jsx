import React from "react";

export default function RegisterCard() {
    return (
        <div className="card mx-auto mt-5" style={{ maxWidth: "400px" }}>
            <div className="card-body">
                <h3 className="card-title text-center mb-4">Register</h3>
                <form onSubmit={e => e.preventDefault()}>
                    <div className="mb-3">
                        <label htmlFor="username" className="form-label">Username</label>
                        <input type="text" className="form-control" id="username" name="username" required />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input type="password" className="form-control" id="password" name="password" required />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">Register</button>
                    <a href="/login" className="btn btn-link w-100 mt-2">Login</a>
                </form>
            </div>
        </div>
    );
}

