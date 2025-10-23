import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginCard() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

   async function onLogin(username, password) {
        try {
            setLoading(true); setError(""); setSuccess("");
            const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // important for cookie
            body: JSON.stringify({ username, password })
        });
        if (!res.ok) throw new Error('Login failed');
        const data = await res.json();
        localStorage.setItem('user', JSON.stringify(data.user));
        setSuccess(`Welcome ${data.user.username}. Redirecting...`);
        setTimeout(() => navigate('/'), 500);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className="card mx-auto mt-5" style={{ width: "100%", maxWidth: "520px", backgroundColor: "#222" }}>
            <div className="card-body" style={{ backgroundColor: "#222" }}>
                <form
                    onSubmit={e => {
                        e.preventDefault();
                        const username = e.target.username.value;
                        const password = e.target.password.value;
                        onLogin(username, password);
                    }}
                >
                    {error && <div className="alert alert-danger" role="alert">{error}</div>}
                    {success && <div className="alert alert-success" role="alert">{success}</div>}
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
                    <button disabled={loading} type="submit" className="btn btn-primary w-100 buttonFade" style={{ backgroundColor: "#007bff", border: "none" }}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>

                    <a href="/register" className="btn btn-link w-100 mt-2 linkFade">Register</a>

                </form>
            </div>
        </div>
    );
}

