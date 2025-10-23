import React, { useState } from "react";

export default function RegisterCard() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function onRegister(email, username, password) {
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, username, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || 'Register failed');
            setSuccess('Account created. You can login now.');
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className="card mx-auto mt-5" style={{ maxWidth: "60%", minWidth: "40%", backgroundColor: "#222" }}>
            <div className="card-body" style={{ backgroundColor: "#222" }}>
                <form onSubmit={e => {
                    e.preventDefault();
                    const email = e.target.email.value;
                    const username = e.target.username.value;
                    const password = e.target.password.value;
                    const tos = e.target.tos.checked;
                    if (!tos) return;
                    onRegister(email, username, password);
                }}>
                    {error && <div className="alert alert-danger" role="alert">{error}</div>}
                    {success && <div className="alert alert-success" role="alert">{success}</div>}
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input type="email" className="form-control" id="email" name="email" required />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="username" className="form-label">Username</label>
                        <input type="text" className="form-control" id="username" name="username" required />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input type="password" className="form-control" id="password" name="password" required />
                    </div>
                    {/* Terms of Service checkbox */}
                    <div className="form-check mb-3">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="tos"
                            name="tos"
                            required
                        />
                        <label className="form-check-label" htmlFor="tos">
                            I agree to the <a href="/tos" className="linkFade">Terms of Service</a>
                        </label>
                    </div>
                    <button disabled={loading} type="submit" className="btn btn-primary w-100 buttonFade">{loading ? 'Registering...' : 'Register'}</button>
                    <a href="/login" className="btn btn-link w-100 mt-2 linkFade">Login</a>
                </form>
            </div>
        </div>
    );
}

