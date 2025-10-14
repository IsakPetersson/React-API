import React, { useState } from "react";

const segments = [
    { key: "introduction", label: "Introduction", text: "Welcome to Hypixel Tracker. These Terms of Service govern your access to and use of our website, products, and services. By accessing or using our Service, you agree to be bound by these Terms. If you do not agree, you may not use the Service." },
    { key: "definitions", label: "Definitions", text: "“Service” means our website, app, and related products; “User” or “you” refers to anyone accessing the Service; “Content” includes all text, images, software, and materials available through the Service." },
    { key: "user_requirements", label: "User Requirements", text: "You must use the Service in compliance with applicable laws, provide accurate account information, and are responsible for all activity under your account." },
    { key: "user_conduct", label: "User Conduct", text: "You agree not to use the Service unlawfully, upload harmful or infringing content, attempt unauthorized access, or use automated tools without permission; we may suspend or terminate accounts for violations." },
    { key: "intellectual_property", label: "Intellectual Property", text: "All materials, trademarks, and content belong to Hypixel or licensors; we use a content only for creative and educational purposes." },
    { key: "termination", label: "Termination", text: "You may stop using the Service anytime; we may suspend or terminate access if you violate these Terms; intellectual property and liability clauses remain effective after termination." },
    { key: "changes_to_terms", label: "Changes to the Terms", text: "We may update these Terms and revise the “Last Updated” date; continued use after changes means you accept the new Terms." },
    { key: "", label: "Governing Law", text: " These Terms are governed by the laws of Sweden; disputes will be resolved in the courts of Helsingborg, unless otherwise required by law." },
];

export default function TosCard() {
    const [active, setActive] = useState(segments[0].key);

    const current = segments.find(seg => seg.key === active);

    return (
        <div className="card mx-auto mt-5" style={{ width: "80%", backgroundColor: "#222" }}>
            <div className="card-body" style={{ backgroundColor: "#222" }}>
                <h3 className="card-title text-center mb-4">Terms of Service</h3>
                <div className="row">
                    {/* Navigation column */}
                    <div className="col-4">
                        <ul className="nav flex-column">
                            {segments.map(seg => (
                                <li className="nav-item" key={seg.key}>
                                    <button
                                        className={`nav-link ${active === seg.key ? "active" : ""}`}
                                        style={{
                                            background: "none",
                                            color: active === seg.key ? "#E732AA" : "#fff",
                                            border: "none",
                                            textAlign: "left",
                                            padding: "8px 0",
                                            cursor: "pointer",
                                        }}
                                        onClick={() => setActive(seg.key)}
                                    >
                                        {seg.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    {/* Text column */}
                    <div className="col-8">
                        <p className="card-text">{current.text}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
