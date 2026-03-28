import "../styles/HomePage.css";

function HomePage() {
    return (
        <div className="home-page">
            <section className="home-hero">
                <img
                    src="/exchange.jpg"
                    alt=""
                    aria-hidden="true"
                    className="home-hero__bg"
                />
                <div className="home-hero__overlay" />

                <div className="home-hero__content">
                    <span className="home-hero__eyebrow">
                        INSA Lyon · Département TC
                    </span>
                    <h1 className="home-hero__title">
                        Explorez
                        <br />
                        <span>l'International.</span>
                    </h1>
                    <p className="home-hero__sub">
                        La plateforme de référence pour concevoir votre projet
                        d'échange en Télécommunications.
                    </p>

                    <div className="home-hero__actions">
                        <a href="/quiz" className="home-btn home-btn--primary">
                            Commencer le quiz <span>→</span>
                        </a>
                        <a
                            href="/catalog"
                            className="home-btn home-btn--secondary"
                        >
                            Explorer les destinations
                        </a>
                    </div>
                </div>

                <div className="home-hero__scroll-hint">
                    <span className="mouse">
                        <span className="wheel"></span>
                    </span>
                </div>
            </section>

            <section className="home-info-section">
                <div className="home-container">
                    <h2 className="section-title">Contacts utiles</h2>

                    <div className="home-info-grid">
                        <div className="info-card">
                            <div className="info-card__content">
                                <p className="contact-role">
                                    Coordinateur International TC
                                </p>
                                <h3 className="contact-name">Fabrice Valois</h3>
                                <p className="contact-email">
                                    fabrice.valois@insa-lyon.fr
                                </p>
                            </div>
                        </div>

                        <div className="info-card">
                            <div className="info-card__content">
                                <p className="contact-role">
                                    Responsable Stages TC
                                </p>
                                <h3 className="contact-name">Victor Rebecq</h3>
                                <p className="contact-email">
                                    victor.rebecq@insa-lyon.fr
                                </p>
                            </div>
                        </div>

                        <div className="info-card">
                            <div className="info-card__content">
                                <p className="contact-role">
                                    Stages / Mobilité Sortante RI
                                </p>
                                <h3 className="contact-name">
                                    Service RI INSA Lyon
                                </h3>
                                <p className="contact-email">
                                    mobilitesortante@insa-lyon.fr
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default HomePage;
