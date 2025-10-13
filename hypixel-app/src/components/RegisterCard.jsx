import React from "react";

export default function RegisterCard() {
    return (
        <div className="card mx-auto mt-5" style={{ maxWidth: "60%", minWidth: "40%" }}>
            <div className="card-body">
                <h3 className="card-title text-center mb-4">Register</h3>
                <form onSubmit={e => e.preventDefault()}>
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
                            I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer" className="linkFade">Terms of Service</a>
                        </label>
                    </div>
                    <button type="submit" className="btn btn-primary w-100 buttonFade">Register</button>
                    <a href="/login" className="btn btn-link w-100 mt-2 linkFade">Login</a>
                </form>
            </div>
        </div>
    );
}

