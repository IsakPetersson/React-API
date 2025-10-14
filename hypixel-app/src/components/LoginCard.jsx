import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginCard() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    async function onLogin(username, password) {
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || 'Login failed');
            // Persist user to localStorage so Items page can load their favorites
            if (data?.user) {
                try { localStorage.setItem('user', JSON.stringify(data.user)); } catch {}
            }
            setSuccess(`Welcome, ${data?.user?.username || username}! Redirecting...`);
            // Short delay for UX, then navigate to home
            setTimeout(() => navigate('/'), 300);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className="card mx-auto mt-5" style={{ maxWidth: "60%", minWidth: "40%", backgroundColor: "#222" }}>
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

